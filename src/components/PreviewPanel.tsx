import { forwardRef, useEffect, useState } from 'react'
import type { RefObject } from 'react'
import type { ContentBlock } from '../types/content'
import type { UploadedImage } from '../types/image'
import type { StyleConfig } from '../types/style'
import type { TemplateId } from '../types/template'
import { templateRegistry } from '../templates/templateRegistry'
import { EmptyState } from './EmptyState'

export type PreviewMode = 'wechat' | 'magazine'

type Props = {
  blocks: ContentBlock[]
  images: UploadedImage[]
  selectedTemplate: TemplateId
  styleConfig: StyleConfig
  previewMode: PreviewMode
  onPreviewModeChange: (mode: PreviewMode) => void
  onImageChange: (image: UploadedImage) => void
  onImageUpload: (id: string, file: File) => void
  onImageDelete: (id: string) => void
  scrollRef?: RefObject<HTMLDivElement | null>
  onScroll?: (element: HTMLDivElement) => void
  articleRef: RefObject<HTMLDivElement | null>
}

export const PreviewPanel = forwardRef<HTMLDivElement, Props>(function PreviewPanel(
  {
    blocks,
    images,
    selectedTemplate,
    styleConfig,
    previewMode,
    onPreviewModeChange,
    onImageChange,
    onImageUpload,
    onImageDelete,
    scrollRef,
    onScroll,
    articleRef,
  },
  ref,
) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [devicePreview, setDevicePreview] = useState(false)
  const template = templateRegistry.find((item) => item.id === selectedTemplate) ?? templateRegistry[0]
  const Template = template.Component
  const effectiveStyleConfig =
    previewMode === 'wechat' || isFullscreen
      ? { ...styleConfig, pageMargin: Math.max(22, styleConfig.wechatPageMargin) }
      : styleConfig
  const activeViewIndex = isFullscreen ? (devicePreview ? 1 : 0) : previewMode === 'magazine' ? 1 : 0

  useEffect(() => {
    const updateFullscreenState = () => {
      const active = document.fullscreenElement === (ref && 'current' in ref ? ref.current : null)
      setIsFullscreen(active)
      if (active) onPreviewModeChange('wechat')
      if (!active) setDevicePreview(false)
    }
    document.addEventListener('fullscreenchange', updateFullscreenState)
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState)
  }, [onPreviewModeChange, ref])

  return (
    <section
      ref={ref}
      className={`preview-panel ${previewMode === 'wechat' ? 'wechat-mode' : 'magazine-mode'} ${devicePreview ? 'device-preview-mode' : ''}`}
    >
      <div className="preview-mode-switch" aria-label="预览视角">
        <span
          key={`${isFullscreen ? 'fullscreen' : 'preview'}-${activeViewIndex}`}
          className={`preview-mode-indicator ${activeViewIndex === 1 ? 'is-second' : ''}`}
          aria-hidden="true"
        />
        {isFullscreen ? (
          <>
            <button type="button" className={!devicePreview ? 'active' : ''} onClick={() => setDevicePreview(false)}>
              长页
            </button>
            <button type="button" className={devicePreview ? 'active' : ''} onClick={() => setDevicePreview(true)}>
              手机仿真
            </button>
          </>
        ) : (
          <>
            <button type="button" className={previewMode === 'wechat' ? 'active' : ''} onClick={() => onPreviewModeChange('wechat')}>
              公众号
            </button>
            <button type="button" className={previewMode === 'magazine' ? 'active' : ''} onClick={() => onPreviewModeChange('magazine')}>
              杂志
            </button>
          </>
        )}
      </div>
      <div ref={scrollRef} className="preview-stage" onScroll={(event) => onScroll?.(event.currentTarget)}>
        {blocks.length ? (
          <div className="preview-device-frame">
            <div ref={articleRef} className="export-target">
              <Template
                blocks={blocks}
                images={images}
                styleConfig={effectiveStyleConfig}
                onImageChange={isFullscreen ? undefined : onImageChange}
                onImageUpload={isFullscreen ? undefined : onImageUpload}
                onImageDelete={isFullscreen ? undefined : onImageDelete}
              />
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  )
})
