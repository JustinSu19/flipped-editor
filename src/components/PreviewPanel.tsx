import { forwardRef } from 'react'
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
  scrollRef?: RefObject<HTMLDivElement | null>
  onScroll?: (element: HTMLDivElement) => void
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
    scrollRef,
    onScroll,
  },
  ref,
) {
  const template = templateRegistry.find((item) => item.id === selectedTemplate) ?? templateRegistry[0]
  const Template = template.Component
  const effectiveStyleConfig = previewMode === 'wechat' ? { ...styleConfig, pageMargin: 22 } : styleConfig

  return (
    <section className={`preview-panel ${previewMode === 'wechat' ? 'wechat-mode' : 'magazine-mode'}`}>
      <div className="preview-mode-switch" aria-label="预览视角">
        <button
          type="button"
          className={previewMode === 'wechat' ? 'active' : ''}
          onClick={() => onPreviewModeChange('wechat')}
        >
          公众号
        </button>
        <button
          type="button"
          className={previewMode === 'magazine' ? 'active' : ''}
          onClick={() => onPreviewModeChange('magazine')}
        >
          杂志
        </button>
      </div>
      <div ref={scrollRef} className="preview-stage" onScroll={(event) => onScroll?.(event.currentTarget)}>
        {blocks.length ? (
          <div ref={ref} className="export-target">
            <Template
              blocks={blocks}
              images={images}
              styleConfig={effectiveStyleConfig}
              onImageChange={onImageChange}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  )
})
