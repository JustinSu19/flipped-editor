import type { ContentBlock, ImageVariant } from '../types/content'
import type { UploadedImage } from '../types/image'

export const imageFilter = (image: UploadedImage, strength: number) => {
  const sat = 1 - (1 - image.filter.saturation) * strength
  const contrast = 1 - (1 - image.filter.contrast) * strength
  const brightness = 1 + (image.filter.brightness - 1) * strength
  return `saturate(${sat.toFixed(2)}) contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`
}

export const getImageByBlock = (block: ContentBlock, images: UploadedImage[]) => {
  if (block.type !== 'image') return undefined
  return images.find((image) => image.id === block.id)
}

export const normalizeImageIds = (images: UploadedImage[]) =>
  images.map((image, index) => ({
    ...image,
    id: index === 0 ? 'hero' : `image${index}`,
  }))

const getImageLuminance = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  const size = 24
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return undefined
  context.drawImage(img, 0, 0, size, size)
  const { data } = context.getImageData(0, 0, size, size)
  let total = 0
  for (let index = 0; index < data.length; index += 4) {
    total += (0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2]) / 255
  }
  return total / (data.length / 4)
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })

export const recommendedAspect = (variant: ImageVariant) => {
  if (variant === 'hero') return '4 / 5'
  if (variant === 'wide') return '16 / 9'
  if (variant === 'square' || variant === 'split') return '1 / 1'
  if (variant === 'small') return '4 / 3'
  return '5 / 4'
}

export const createUploadedImages = async (files: File[]): Promise<UploadedImage[]> =>
  Promise.all(
    files.map(
      (file, index) =>
        new Promise<UploadedImage>((resolve) => {
          const img = new Image()
          img.onload = () => {
            resolve({
              id: index === 0 ? 'hero' : `image${index}`,
              file,
              url: img.src,
              name: file.name,
              aspectRatio: img.naturalWidth / img.naturalHeight,
              luminance: getImageLuminance(img),
              fit: 'cover',
              focalPoint: { x: 50, y: 50 },
              filter: {
                saturation: 0.86,
                brightness: 1.04,
                contrast: 0.94,
                warmth: 0,
              },
            })
          }
          img.onerror = () =>
            resolve({
              id: index === 0 ? 'hero' : `image${index}`,
              file,
              url: img.src,
              name: file.name,
              fit: 'cover',
              focalPoint: { x: 50, y: 50 },
              filter: {
                saturation: 0.86,
                brightness: 1.04,
                contrast: 0.94,
                warmth: 0,
              },
            })
          void readFileAsDataUrl(file)
            .then((url) => {
              img.src = url
            })
            .catch(() => {
              img.src = URL.createObjectURL(file)
            })
        }),
    ),
  )
