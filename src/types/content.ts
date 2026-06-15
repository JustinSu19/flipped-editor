export type ImageVariant = 'default' | 'hero' | 'wide' | 'square' | 'small' | 'split'
export type TableAlign = 'left' | 'center' | 'right'

export type ContentBlock =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][]; align: TableAlign[] }
  | { type: 'divider' }
  | { type: 'image'; id: string; variant: ImageVariant }
