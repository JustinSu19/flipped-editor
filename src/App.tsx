import { useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from './components/AppShell'
import { DecorTextPanel } from './components/DecorTextPanel'
import { ExportPanel } from './components/ExportPanel'
import { ImageUploader } from './components/ImageUploader'
import { MarkdownEditor } from './components/MarkdownEditor'
import { PreviewPanel } from './components/PreviewPanel'
import { StylePanel } from './components/StylePanel'
import { TemplateSelector } from './components/TemplateSelector'
import type { UploadedImage } from './types/image'
import { defaultStyleConfig, type StyleConfig } from './types/style'
import type { TemplateId } from './types/template'
import { copyArticleRichText } from './utils/exportHtml'
import { downloadArticlePng } from './utils/exportImage'
import { parseMarkdown } from './utils/parseMarkdown'
import { loadState, saveState } from './utils/storage'

const sampleMarkdown = `# 生命的浓度

[image: hero]

## 年轮的轨迹

在岁月的画卷上，每一棵树都默默记录着自己的故事。
它们并不急着解释什么，只是让风穿过，让雨停留，让时间在枝叶之间慢慢沉积。

{{image}}

## 风的轻吻

大树在风的轻吻中舒展着枝叶，仿佛每一片叶子都在回应这温柔的触碰。

[image: square]

> 一棵树，也是一段时间。
> 它站在那里，把沉默变成了年轮。

---

### 城市慢行

- 雨后的人行道有浅浅的光
- 树影落在玻璃窗上
- 黄昏让建筑变得柔和

我在街角停了一会儿，忽然觉得生活并不总是需要抵达。
有时，只要认真经过，就已经足够。`

const validTemplateIds: TemplateId[] = ['nature-magazine', 'image-essay', 'poetic-minimal', 'chapter-cards']

const normalizeTemplateId = (templateId: unknown): TemplateId =>
  validTemplateIds.includes(templateId as TemplateId) ? (templateId as TemplateId) : 'nature-magazine'

function App() {
  const persisted = loadState()
  const [markdown, setMarkdown] = useState(persisted.markdown ?? sampleMarkdown)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(normalizeTemplateId(persisted.selectedTemplate))
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    ...defaultStyleConfig,
    ...persisted.styleConfig,
  })
  const [images, setImages] = useState<UploadedImage[]>([])
  const [richCopied, setRichCopied] = useState(false)
  const [exportingPng, setExportingPng] = useState(false)
  const [pngError, setPngError] = useState('')
  const articleRef = useRef<HTMLDivElement>(null)
  const editorScrollRef = useRef<HTMLTextAreaElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const scrollOwnerRef = useRef<'editor' | 'preview' | null>(null)
  const releaseScrollLockRef = useRef<number | null>(null)

  const blocks = useMemo(() => parseMarkdown(markdown), [markdown])

  useEffect(() => {
    saveState({ markdown, selectedTemplate, styleConfig })
  }, [markdown, selectedTemplate, styleConfig])

  const syncScroll = (source: HTMLElement, target: HTMLElement | null, owner: 'editor' | 'preview') => {
    if (!target) return
    if (scrollOwnerRef.current && scrollOwnerRef.current !== owner) return

    const sourceRange = source.scrollHeight - source.clientHeight
    const targetRange = target.scrollHeight - target.clientHeight
    if (sourceRange <= 0 || targetRange <= 0) return

    scrollOwnerRef.current = owner
    const ratio = source.scrollTop / sourceRange
    target.scrollTop = ratio * targetRange

    if (releaseScrollLockRef.current) window.clearTimeout(releaseScrollLockRef.current)
    releaseScrollLockRef.current = window.setTimeout(() => {
      scrollOwnerRef.current = null
      releaseScrollLockRef.current = null
    }, 90)
  }

  const articleNode = () => articleRef.current?.querySelector('article') as HTMLElement | null

  const copyRichText = async () => {
    const node = articleNode()
    if (!node) return
    await copyArticleRichText(node)
    setRichCopied(true)
    window.setTimeout(() => setRichCopied(false), 1400)
  }

  const exportPng = async () => {
    const node = articleNode()
    if (!node || exportingPng) return
    setExportingPng(true)
    setPngError('')
    try {
      await downloadArticlePng(node)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PNG export failed'
      setPngError(message)
      console.error(message)
      window.setTimeout(() => window.alert(message), 0)
    } finally {
      setExportingPng(false)
    }
  }

  const fullscreenPreview = async () => {
    const node = articleRef.current
    if (!node) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await node.requestFullscreen()
  }

  return (
    <AppShell
      editor={
        <MarkdownEditor
          ref={editorScrollRef}
          value={markdown}
          onChange={setMarkdown}
        />
      }
      preview={
        <PreviewPanel
          ref={articleRef}
          scrollRef={previewScrollRef}
          blocks={blocks}
          images={images}
          selectedTemplate={selectedTemplate}
          styleConfig={styleConfig}
          onScroll={(element) => syncScroll(element, editorScrollRef.current, 'preview')}
          onImageChange={(nextImage) =>
            setImages((currentImages) =>
              currentImages.map((image) => (image.url === nextImage.url ? nextImage : image)),
            )
          }
        />
      }
      inspector={
        <>
          <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />
          <DecorTextPanel
            value={styleConfig.decorText}
            onChange={(decorText) => setStyleConfig((current) => ({ ...current, decorText }))}
          />
          <ImageUploader images={images} onChange={setImages} />
          <StylePanel value={styleConfig} onChange={setStyleConfig} onReset={() => setStyleConfig(defaultStyleConfig)} />
        </>
      }
      toolbarActions={
        <ExportPanel
          richCopied={richCopied}
          exportingPng={exportingPng}
          pngError={pngError}
          onCopyRichText={() => void copyRichText()}
          onDownloadPng={() => void exportPng()}
        />
      }
      onFullscreen={() => void fullscreenPreview()}
    />
  )
}

export default App
