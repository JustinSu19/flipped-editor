export type UploadedImage = {
  id: string
  file: File
  url: string
  name: string
  aspectRatio?: number
  luminance?: number
  fit: 'cover' | 'contain'
  focalPoint?: {
    x: number
    y: number
  }
  filter: {
    saturation: number
    brightness: number
    contrast: number
    warmth: number
  }
}
