import { forwardRef } from 'react'
import type { RefObject } from 'react'
import type { ContentBlock } from '../types/content'
import type { UploadedImage } from '../types/image'
import type { StyleConfig } from '../types/style'
import type { TemplateId } from '../types/template'
import { templateRegistry } from '../templates/templateRegistry'
import { EmptyState } from './EmptyState'

type Props = {
  blocks: ContentBlock[]
  images: UploadedImage[]
  selectedTemplate: TemplateId
  styleConfig: StyleConfig
  onImageChange: (image: UploadedImage) => void
  scrollRef?: RefObject<HTMLDivElement | null>
  onScroll?: (element: HTMLDivElement) => void
}

export const PreviewPanel = forwardRef<HTMLDivElement, Props>(function PreviewPanel(
  { blocks, images, selectedTemplate, styleConfig, onImageChange, scrollRef, onScroll },
  ref,
) {
  const template = templateRegistry.find((item) => item.id === selectedTemplate) ?? templateRegistry[0]
  const Template = template.Component

  return (
    <section className="preview-panel">
      <div ref={scrollRef} className="preview-stage" onScroll={(event) => onScroll?.(event.currentTarget)}>
        {blocks.length ? (
          <div ref={ref} className="export-target">
            <Template blocks={blocks} images={images} styleConfig={styleConfig} onImageChange={onImageChange} />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  )
})
