import type { ContentBlock } from './content'
import type { UploadedImage } from './image'
import type { StyleConfig } from './style'
import type { ReactElement } from 'react'

export type TemplateId =
  | 'nature-magazine'
  | 'image-essay'
  | 'poetic-minimal'
  | 'chapter-cards'

export type TemplateProps = {
  blocks: ContentBlock[]
  images: UploadedImage[]
  styleConfig: StyleConfig
  onImageChange?: (image: UploadedImage) => void
  onImageUpload?: (id: string, file: File) => void
  onImageDelete?: (id: string) => void
}

export type TemplateDefinition = {
  id: TemplateId
  name: string
  description: string
  Component: (props: TemplateProps) => ReactElement
}
