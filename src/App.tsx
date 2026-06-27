import { useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from './components/AppShell'
import { DecorTextPanel } from './components/DecorTextPanel'
import { ExportPanel } from './components/ExportPanel'
import { MarkdownEditor } from './components/MarkdownEditor'
import { PreviewPanel, type PreviewMode } from './components/PreviewPanel'
import { StylePanel } from './components/StylePanel'
import { TemplateSelector } from './components/TemplateSelector'
import { sampleMarkdown } from './data/sampleMarkdown'
import type { UploadedImage } from './types/image'
import { defaultStyleConfig, type StyleConfig } from './types/style'
import type { TemplateId } from './types/template'
import { trackEvent } from './utils/analytics'
import { copyArticleRichText } from './utils/exportHtml'
import { downloadArticlePng } from './utils/exportImage'
import { createUploadedImage } from './utils/imageUtils'
import { parseMarkdown } from './utils/parseMarkdown'
import { loadState, saveState } from './utils/storage'

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
  const [previewMode, setPreviewMode] = useState<PreviewMode>('wechat')
  const [exportingPng, setExportingPng] = useState(false)
  const [pngError, setPngError] = useState('')
  const articleRef = useRef<HTMLDivElement>(null)
  const editorScrollRef = useRef<HTMLTextAreaElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const scrollOwnerRef = useRef<'editor' | 'preview' | null>(null)
  const releaseScrollLockRef = useRef<number | null>(null)
  const editorStartedRef = useRef(false)

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

  const updateMarkdown = (nextMarkdown: string) => {
    if (!editorStartedRef.current && nextMarkdown !== markdown) {
      editorStartedRef.current = true
      trackEvent('editor_start')
    }
    setMarkdown(nextMarkdown)
  }

  const switchTemplate = (templateId: TemplateId) => {
    if (templateId !== selectedTemplate) {
      trackEvent('template_switch', { template: templateId })
    }
    setSelectedTemplate(templateId)
  }

  const upsertImage = (nextImage: UploadedImage) => {
    setImages((currentImages) => {
      const exists = currentImages.some((image) => image.id === nextImage.id)
      if (exists) return currentImages.map((image) => (image.id === nextImage.id ? nextImage : image))
      return [...currentImages, nextImage]
    })
  }

  const uploadImageForId = async (id: string, file: File) => {
    const nextImage = await createUploadedImage(file, id)
    upsertImage(nextImage)
    trackEvent('image_upload')
    return nextImage
  }

  const uploadInlineImage = async (variant: string, file: File) => {
    const id = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    const image = await uploadImageForId(id, file)
    const safeName = image.name.replace(/[|\]\n\r]/g, ' ').trim() || 'local-image'
    return `[image: ${variant} | path: ${safeName} | id: ${id}]`
  }

  const copyRichText = async () => {
    const node = articleNode()
    if (!node) return
    trackEvent('copy_to_wechat')
    await copyArticleRichText(node)
    setRichCopied(true)
    window.setTimeout(() => setRichCopied(false), 1400)
  }

  const exportPng = async () => {
    const node = articleNode()
    if (!node || exportingPng) return
    trackEvent('export_long_image')
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
          onChange={updateMarkdown}
          onInsertImageUpload={uploadInlineImage}
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
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          onScroll={(element) => syncScroll(element, editorScrollRef.current, 'preview')}
          onImageChange={(nextImage) => upsertImage(nextImage)}
          onImageUpload={(id, file) => void uploadImageForId(id, file)}
          onImageDelete={(id) => setImages((currentImages) => currentImages.filter((image) => image.id !== id))}
        />
      }
      inspector={
        <>
          <TemplateSelector selected={selectedTemplate} onChange={switchTemplate} />
          <DecorTextPanel
            value={styleConfig.decorText}
            onChange={(decorText) => setStyleConfig((current) => ({ ...current, decorText }))}
          />
          <StylePanel
            value={styleConfig}
            previewMode={previewMode}
            onChange={setStyleConfig}
            onReset={() => setStyleConfig(defaultStyleConfig)}
          />
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
