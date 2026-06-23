/* eslint-disable react-refresh/only-export-components */
import type { ContentBlock, ImageVariant } from '../types/content'
import type { UploadedImage } from '../types/image'
import type { StyleConfig } from '../types/style'
import { getImageByBlock, imageFilter, recommendedAspect } from '../utils/imageUtils'

type ArticleCssVars = React.CSSProperties & {
  '--article-image-gap': string
  '--article-body-block': string
  '--article-page-margin': string
  '--article-muted-color': string
  '--article-soft-color': string
  '--article-strong-color': string
  '--article-line-color': string
}

export const fontFamilyMap: Record<StyleConfig['fontFamily'], string> = {
  songti: '"Songti SC", "SimSun", "Noto Serif SC", serif',
  fangsong: '"FangSong", "STFangsong", "Noto Serif SC", serif',
  serif: 'Georgia, "Times New Roman", "Noto Serif SC", serif',
  yahei: '"Microsoft YaHei", "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif',
}

const whitespaceScale: Record<StyleConfig['whitespaceLevel'], number> = {
  compact: 0.78,
  balanced: 1,
  airy: 1.24,
}

export const spacing = (styleConfig: StyleConfig, value: number) =>
  Math.round(value * whitespaceScale[styleConfig.whitespaceLevel])

function colorMix(color: string, alpha: number) {
  const normalized = color.replace('#', '')
  if (normalized.length !== 6) return color
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export const articleStyle = (styleConfig: StyleConfig): ArticleCssVars => ({
  width: styleConfig.articleWidth,
  maxWidth: '100%',
  background: styleConfig.paperColor,
  color: styleConfig.textColor,
  fontFamily: fontFamilyMap[styleConfig.fontFamily],
  fontSize: styleConfig.fontSize,
  lineHeight: styleConfig.lineHeight,
  letterSpacing: '0.02em',
  '--article-image-gap': `${spacing(styleConfig, 48)}px`,
  '--article-body-block': `${spacing(styleConfig, 42)}px`,
  '--article-page-margin': `${styleConfig.pageMargin}px`,
  '--article-muted-color': styleConfig.textColor,
  '--article-soft-color': colorMix(styleConfig.textColor, 0.72),
  '--article-strong-color': colorMix(styleConfig.titleColor, 0.94),
  '--article-line-color': colorMix(styleConfig.textColor, 0.18),
})

export const overlayTextColor = (image: UploadedImage | undefined, fallback: string) =>
  image && typeof image.luminance === 'number' ? (image.luminance < 0.52 ? '#f8f5ed' : '#37342e') : fallback

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

export const Decor = ({ children }: { children: string }) =>
  children.trim() ? <div className="article-decor">{children}</div> : null

export const ImageBlock = ({
  block,
  images,
  styleConfig,
  className = '',
  variant,
  onImageChange,
}: {
  block: ContentBlock
  images: UploadedImage[]
  styleConfig: StyleConfig
  className?: string
  variant?: ImageVariant
  onImageChange?: (image: UploadedImage) => void
}) => {
  const image = getImageByBlock(block, images)
  const currentVariant = block.type === 'image' ? block.variant : variant ?? 'default'
  const radius = currentVariant === 'wide' ? Math.max(styleConfig.imageRadius - 8, 8) : styleConfig.imageRadius
  const focalPoint = image?.focalPoint ?? { x: 50, y: 50 }

  const startImageDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!image || !onImageChange || image.fit !== 'cover') return
    event.preventDefault()
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    target.classList.add('is-panning')
    const startX = event.clientX
    const startY = event.clientY
    const startFocal = image.focalPoint ?? { x: 50, y: 50 }

    const onPointerMove = (moveEvent: PointerEvent) => {
      const rect = target.getBoundingClientRect()
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100
      onImageChange({
        ...image,
        focalPoint: {
          x: clamp(startFocal.x - deltaX),
          y: clamp(startFocal.y - deltaY),
        },
      })
    }

    const stop = () => {
      target.classList.remove('is-panning')
      target.releasePointerCapture(event.pointerId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', stop)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stop, { once: true })
  }

  return (
    <figure
      className={`article-image ${image ? 'adjustable-image' : ''} ${className}`}
      onPointerDown={startImageDrag}
      style={{
        aspectRatio: recommendedAspect(currentVariant),
        borderRadius: radius,
      }}
    >
      {image ? (
        <img
          src={image.url}
          alt={image.name}
          style={{
            objectFit: image.fit,
            objectPosition: `${focalPoint.x}% ${focalPoint.y}%`,
            filter: imageFilter(image, styleConfig.imageFilterStrength),
          }}
        />
      ) : (
        <div className="image-placeholder">
          <span>{currentVariant}</span>
        </div>
      )}
    </figure>
  )
}

export const renderTextBlock = (block: ContentBlock, styleConfig: StyleConfig, index: number) => {
  if (block.type === 'h1') {
    return (
      <h1
        key={index}
        className="article-h1"
        style={{ color: styleConfig.titleColor }}
        dangerouslySetInnerHTML={{ __html: block.text }}
      />
    )
  }
  if (block.type === 'h2') {
    return (
      <h2
        key={index}
        className="article-h2"
        style={{
          color: styleConfig.titleColor,
          marginTop: spacing(styleConfig, styleConfig.sectionSpacing),
          marginBottom: Math.round(spacing(styleConfig, styleConfig.sectionSpacing) * 0.44),
        }}
        dangerouslySetInnerHTML={{ __html: block.text }}
      />
    )
  }
  if (block.type === 'h3') {
    return <h3 key={index} className="article-h3" dangerouslySetInnerHTML={{ __html: block.text }} />
  }
  if (block.type === 'paragraph') {
    return (
      <p
        key={index}
        className="article-p"
        style={{ marginBottom: spacing(styleConfig, styleConfig.paragraphSpacing) }}
        dangerouslySetInnerHTML={{ __html: block.text }}
      />
    )
  }
  if (block.type === 'quote') {
    return (
      <blockquote key={index} className="article-quote">
        <p dangerouslySetInnerHTML={{ __html: block.text }} />
      </blockquote>
    )
  }
  if (block.type === 'list') {
    if (block.ordered) {
      return (
        <ol key={index} className="article-list article-list-ordered" start={block.start}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>
      )
    }
    return (
      <ul key={index} className={`article-list article-list-unordered article-list-depth-${block.depth ?? 0}`}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
    )
  }
  if (block.type === 'table') {
    return (
      <div key={index} className="article-table-wrap">
        <table className="article-table">
          <thead>
            <tr>
              {block.headers.map((header, cellIndex) => (
                <th
                  key={cellIndex}
                  style={{ textAlign: block.align[cellIndex] ?? 'left' }}
                  dangerouslySetInnerHTML={{ __html: header }}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {block.headers.map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{ textAlign: block.align[cellIndex] ?? 'left' }}
                    dangerouslySetInnerHTML={{ __html: row[cellIndex] ?? '' }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  if (block.type === 'divider') {
    return (
      <div key={index} className="article-divider">
        <span />
      </div>
    )
  }
  return null
}
