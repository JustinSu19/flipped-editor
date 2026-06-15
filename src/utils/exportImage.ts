import { toPng } from 'html-to-image'

const EXPORT_TIMEOUT_MS = 12000
const MAX_CANVAS_AREA = 64_000_000

const waitForArticleImages = async (node: HTMLElement) => {
  const images = Array.from(node.querySelectorAll('img'))
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return
      await image.decode().catch(
        () =>
          new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          }),
      )
    }),
  )
}

const withTimeout = async <T,>(work: Promise<T>, timeoutMs: number) =>
  Promise.race([
    work,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('PNG 导出超时，请稍后再试或减少图片数量后重试。')), timeoutMs)
    }),
  ])

const getSafePixelRatio = (node: HTMLElement) => {
  const rect = node.getBoundingClientRect()
  const width = Math.max(rect.width, node.scrollWidth)
  const height = Math.max(rect.height, node.scrollHeight)
  const areaAt2x = width * height * 4
  if (areaAt2x <= MAX_CANVAS_AREA) return 2
  return Math.max(1, Math.sqrt(MAX_CANVAS_AREA / Math.max(width * height, 1)))
}

export const downloadArticlePng = async (node: HTMLElement) => {
  await document.fonts?.ready
  await waitForArticleImages(node)

  const dataUrl = await withTimeout(
    toPng(node, {
      cacheBust: true,
      pixelRatio: getSafePixelRatio(node),
      backgroundColor: window.getComputedStyle(node).backgroundColor,
      skipAutoScale: false,
    }),
    EXPORT_TIMEOUT_MS,
  )

  const link = document.createElement('a')
  link.download = `flipped-editor-long-image-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  window.setTimeout(() => link.remove(), 1000)
}
