const inlineProperties = [
  'background',
  'background-color',
  'background-image',
  'border',
  'border-bottom',
  'border-bottom-color',
  'border-collapse',
  'border-radius',
  'box-shadow',
  'color',
  'display',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'height',
  'aspect-ratio',
  'letter-spacing',
  'line-height',
  'margin',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'max-width',
  'min-height',
  'min-width',
  'object-fit',
  'object-position',
  'overflow',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'position',
  'table-layout',
  'text-align',
  'text-shadow',
  'vertical-align',
  'white-space',
  'width',
  'word-break',
]

const COPY_SIDE_INSET = 22
const copySideInset = `${COPY_SIDE_INSET}px`

const cloneWithInlineStyles = (node: HTMLElement) => {
  const clone = node.cloneNode(true) as HTMLElement
  const sourceElements = [node, ...Array.from(node.querySelectorAll<HTMLElement>('*'))]
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))]

  sourceElements.forEach((source, index) => {
    const target = cloneElements[index]
    const computed = window.getComputedStyle(source)
    inlineProperties.forEach((property) => {
      target.style.setProperty(property, computed.getPropertyValue(property))
    })
  })

  return clone
}

const resetFlowTitle = (element: HTMLElement) => {
  element.style.position = 'static'
  element.style.left = 'auto'
  element.style.right = 'auto'
  element.style.bottom = 'auto'
  element.style.textShadow = 'none'
  element.style.padding = '0 22px 34px'
  element.style.paddingLeft = '22px'
  element.style.paddingRight = '22px'
  element.style.margin = '0'
  element.style.boxSizing = 'border-box'
}

const waitForImage = async (image: HTMLImageElement) => {
  if (image.complete && image.naturalWidth > 0) return
  await image.decode().catch(
    () =>
      new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      }),
  )
}

const parsePositionValue = (value: string, size: number) => {
  if (value.endsWith('%')) return (Number.parseFloat(value) / 100) * size
  if (value === 'left' || value === 'top') return 0
  if (value === 'right' || value === 'bottom') return size
  if (value === 'center') return size / 2
  if (value.endsWith('px')) return Number.parseFloat(value)
  return size / 2
}

const getObjectPosition = (value: string, width: number, height: number) => {
  const [rawX = '50%', rawY = '50%'] = value.trim().split(/\s+/)
  return {
    x: parsePositionValue(rawX, width),
    y: parsePositionValue(rawY, height),
  }
}

const renderCroppedImage = async (sourceFigure: HTMLElement, sourceImage: HTMLImageElement) => {
  await waitForImage(sourceImage)
  if (!sourceImage.naturalWidth || !sourceImage.naturalHeight) return sourceImage.src

  const figureRect = sourceFigure.getBoundingClientRect()
  const width = Math.max(Math.round(figureRect.width), 1)
  const height = Math.max(Math.round(figureRect.height), 1)
  const maxWidth = 900
  const scale = Math.min(maxWidth / width, 1)
  const outputWidth = Math.max(Math.round(width * scale), 1)
  const outputHeight = Math.max(Math.round(height * scale), 1)
  const imageStyle = window.getComputedStyle(sourceImage)
  const fit = imageStyle.objectFit || 'cover'
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const context = canvas.getContext('2d')
  if (!context) return sourceImage.src

  const imageRatio = sourceImage.naturalWidth / sourceImage.naturalHeight
  const boxRatio = width / height
  let drawWidth: number
  let drawHeight: number
  if (fit === 'contain') {
    if (imageRatio > boxRatio) {
      drawWidth = width
      drawHeight = width / imageRatio
    } else {
      drawHeight = height
      drawWidth = height * imageRatio
    }
  } else if (fit === 'fill') {
    drawWidth = width
    drawHeight = height
  } else {
    if (imageRatio > boxRatio) {
      drawHeight = height
      drawWidth = height * imageRatio
    } else {
      drawWidth = width
      drawHeight = width / imageRatio
    }
  }

  const position = getObjectPosition(imageStyle.objectPosition || '50% 50%', width - drawWidth, height - drawHeight)
  const drawX = Number.isFinite(position.x) ? position.x : (width - drawWidth) / 2
  const drawY = Number.isFinite(position.y) ? position.y : (height - drawHeight) / 2
  context.drawImage(sourceImage, drawX * scale, drawY * scale, drawWidth * scale, drawHeight * scale)
  return canvas.toDataURL('image/png')
}

const prepareImagesForRichText = async (source: HTMLElement, clone: HTMLElement) => {
  clone.querySelectorAll('.image-inline-actions, .image-block-input, .image-upload-cta').forEach((node) => node.remove())
  const sourceFigures = Array.from(source.querySelectorAll<HTMLElement>('figure.article-image'))
  const cloneFigures = Array.from(clone.querySelectorAll<HTMLElement>('figure.article-image'))
  await Promise.all(
    cloneFigures.map(async (figure, index) => {
      const sourceFigure = sourceFigures[index]
      const sourceImage = sourceFigure?.querySelector('img')
      const image = figure.querySelector('img')
      if (!image) {
        figure.remove()
        return
      }

      if (sourceFigure && sourceImage) {
        image.src = await renderCroppedImage(sourceFigure, sourceImage)
      }

      const isHeroImage = Boolean(figure.closest('.nature-hero, .hero-opening'))
      const sourceParent = sourceFigure?.parentElement
      const sourceRect = sourceFigure?.getBoundingClientRect()
      const parentRect = sourceParent?.getBoundingClientRect()
      const widthPercent =
        sourceRect && parentRect && parentRect.width > 0 ? Math.min(100, Math.max(1, (sourceRect.width / parentRect.width) * 100)) : 100

      figure.style.setProperty('display', 'block')
      figure.style.setProperty('margin', isHeroImage ? '0' : widthPercent < 92 ? '28px auto' : `28px ${copySideInset}`)
      figure.style.setProperty('padding', '0')
      figure.style.setProperty('width', isHeroImage ? '100%' : widthPercent < 92 ? `${widthPercent.toFixed(2)}%` : 'auto')
      figure.style.setProperty('max-width', isHeroImage ? '100%' : `calc(100% - ${COPY_SIDE_INSET * 2}px)`)
      figure.style.setProperty('height', 'auto')
      figure.style.setProperty('line-height', '0')
      figure.style.setProperty('overflow', 'hidden')
      figure.style.setProperty('background', 'transparent')
      figure.style.setProperty('box-sizing', 'border-box')

      image.style.setProperty('display', 'block')
      image.style.setProperty('width', '100%')
      image.style.setProperty('max-width', '100%')
      image.style.setProperty('height', 'auto')
      image.style.setProperty('border', '0')
      image.style.removeProperty('object-fit')
      image.style.removeProperty('object-position')
    }),
  )

  const natureHero = clone.querySelector<HTMLElement>('.nature-hero')
  const natureTitle = clone.querySelector<HTMLElement>('.nature-title')
  if (natureHero && natureTitle && !natureHero.querySelector('img')) {
    resetFlowTitle(natureTitle)
    natureHero.replaceWith(natureTitle)
  }
}

const createCopyParagraph = (html: string, style: Partial<CSSStyleDeclaration>) => {
  const paragraph = document.createElement('p')
  paragraph.innerHTML = html
  setStyles(paragraph, style)
  return paragraph
}

const normalizeCopyStructure = (clone: HTMLElement) => {
  const bodyFontSize = clone.style.fontSize || '15px'
  clone.querySelectorAll<HTMLElement>('.article-list').forEach((list) => {
    const fragment = document.createDocumentFragment()
    const ordered = list.tagName.toLowerCase() === 'ol' || list.classList.contains('article-list-ordered')
    const depth = list.classList.contains('article-list-depth-1') ? 1 : 0
    const start = ordered ? Number(list.getAttribute('start') ?? '1') || 1 : 1
    const previous = list.previousElementSibling as HTMLElement | null
    const followsOrdered = !ordered && previous?.classList.contains('article-list-ordered')
    const followsUnordered = ordered && previous?.classList.contains('article-list-unordered')
    const firstMargin = depth === 1 ? '-2px 0 5px' : followsOrdered ? '6px 0 8px' : followsUnordered ? '24px 0 8px' : '18px 0 8px'
    Array.from(list.querySelectorAll<HTMLElement>('li')).forEach((item, index) => {
      const marker = ordered ? `${start + index}.&nbsp;` : depth === 1 ? '◦&nbsp;&nbsp;' : '•&nbsp;&nbsp;'
      const indentSize = ordered ? '22px' : depth === 1 ? '14px' : '18px'
      fragment.appendChild(
        createCopyParagraph(`${marker}${item.innerHTML}`, {
          margin: index === 0 ? firstMargin : '0 0 8px',
          marginLeft: depth === 1 ? `${COPY_SIDE_INSET + 24}px` : copySideInset,
          marginRight: copySideInset,
          padding: `0 0 0 ${indentSize}`,
          textIndent: `-${indentSize}`,
          color: depth === 1 ? 'rgb(112, 107, 98)' : 'rgb(90, 87, 80)',
          fontSize: bodyFontSize,
          lineHeight: depth === 1 ? '1.72' : '1.85',
          textAlign: 'left',
          wordBreak: 'normal',
        }),
      )
    })
    list.replaceWith(fragment)
  })

  clone.querySelectorAll<HTMLElement>('.article-divider').forEach((divider) => {
    divider.replaceWith(
      createCopyParagraph('———', {
        margin: `34px ${copySideInset}`,
        padding: '0',
        color: 'rgba(80, 76, 68, 0.28)',
        fontSize: '13px',
        lineHeight: '1',
        letterSpacing: '0.16em',
        textAlign: 'center',
      }),
    )
  })
}

const setStyles = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
  Object.entries(styles).forEach(([property, value]) => {
    if (typeof value === 'string') element.style.setProperty(property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`), value)
  })
}

const normalizeRichTextStyles = (clone: HTMLElement) => {
  const bodyFontSize = clone.style.fontSize || '15px'
  setStyles(clone, {
    width: '100%',
    maxWidth: '100%',
    minHeight: 'auto',
    margin: '0',
    padding: clone.style.padding || '0',
    overflow: 'visible',
    background: clone.style.background || clone.style.backgroundColor || 'transparent',
    backgroundColor: clone.style.backgroundColor || 'transparent',
    borderRadius: clone.style.borderRadius || '0',
    border: '0',
    boxShadow: 'none',
  })
  clone.style.removeProperty('--article-image-gap')
  clone.style.removeProperty('--article-body-block')

  clone.querySelectorAll<HTMLElement>('.article-body, .narrow, .poetic-inner').forEach((element) => {
    const currentPadding = element.style.padding
    const safePadding = currentPadding && !/^0px(?:\s+0px){0,3}$/.test(currentPadding) ? currentPadding : '42px 22px 68px'
    setStyles(element, {
      margin: '0',
      padding: safePadding,
      border: '0',
      borderRadius: element.style.borderRadius || '0',
      boxShadow: 'none',
      overflow: 'visible',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.nature-title, .hero-opening-title').forEach((element) => {
    resetFlowTitle(element)
    setStyles(element, {
      color: 'rgb(63, 61, 56)',
      background: 'transparent',
      textShadow: 'none',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-decor').forEach((element) => {
    setStyles(element, {
      margin: `0 ${copySideInset} 8px`,
      padding: '0',
      paddingLeft: '0',
      paddingRight: '0',
      color: 'rgba(84, 80, 72, 0.5)',
      fontSize: '12px',
      lineHeight: '1.6',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.nature-title h1, .hero-opening-title h1').forEach((element) => {
    setStyles(element, {
      margin: '0 0 24px',
      padding: '0 22px',
      paddingLeft: '22px',
      paddingRight: '22px',
      color: 'rgb(63, 61, 56)',
      fontSize: '24px',
      lineHeight: '1.45',
      fontWeight: '400',
      textShadow: 'none',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-h1').forEach((element) => {
    setStyles(element, {
      margin: '42px 0 24px',
      padding: '0 22px',
      paddingLeft: '22px',
      paddingRight: '22px',
      color: 'rgb(63, 61, 56)',
      fontSize: '24px',
      lineHeight: '1.45',
      fontWeight: '400',
      boxSizing: 'border-box',
    })
  })
  clone.querySelector<HTMLElement>('.article-h1')?.style.setProperty('margin-top', '0')

  clone.querySelectorAll<HTMLElement>('.article-h2').forEach((element) => {
    setStyles(element, {
      margin: '48px 0 20px',
      padding: '0 22px',
      paddingLeft: '22px',
      paddingRight: '22px',
      color: 'rgb(63, 61, 56)',
      fontSize: '19px',
      lineHeight: '1.55',
      textAlign: 'left',
      fontWeight: '400',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-h3').forEach((element) => {
    setStyles(element, {
      margin: '30px 22px 14px',
      padding: '0 0 0 12px',
      border: '0',
      borderLeft: '2px solid rgba(80, 76, 68, 0.22)',
      color: 'rgb(80, 76, 68)',
      fontSize: '16px',
      lineHeight: '1.65',
      fontWeight: '500',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-p').forEach((element) => {
    setStyles(element, {
      margin: '0 0 16px',
      padding: '0 22px',
      paddingLeft: '22px',
      paddingRight: '22px',
      color: 'rgb(90, 87, 80)',
      fontSize: bodyFontSize,
      lineHeight: '1.9',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-p-indent').forEach((element) => {
    setStyles(element, {
      marginLeft: '26px',
      color: 'rgb(112, 107, 98)',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-quote').forEach((element) => {
    setStyles(element, {
      margin: '28px 22px',
      padding: '16px 0 16px 14px',
      border: '0',
      borderLeft: '2px solid rgba(80, 76, 68, 0.18)',
      color: 'rgb(104, 99, 90)',
      background: 'transparent',
      textAlign: 'left',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-quote p').forEach((element) => {
    setStyles(element, {
      margin: '0',
      padding: '0 10px 0 0',
      paddingRight: '10px',
      color: 'rgb(104, 99, 90)',
      fontSize: bodyFontSize,
      lineHeight: '1.9',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-callout').forEach((element) => {
    setStyles(element, {
      margin: `28px ${copySideInset} 30px`,
      padding: '15px 16px 15px 18px',
      border: '1px solid rgba(80, 76, 68, 0.14)',
      borderRadius: '12px',
      color: 'rgb(94, 89, 80)',
      background: 'rgba(250, 247, 240, 0.56)',
      textAlign: 'left',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-callout p').forEach((element) => {
    setStyles(element, {
      margin: '0',
      color: 'rgb(94, 89, 80)',
      fontSize: bodyFontSize,
      lineHeight: '1.9',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-list').forEach((element) => {
    setStyles(element, {
      margin: `22px ${copySideInset} 10px`,
      padding: '0 0 0 20px',
      display: 'block',
      listStyle: element.tagName.toLowerCase() === 'ol' ? 'decimal' : 'disc',
      color: 'rgb(90, 87, 80)',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-h2 + .article-list, .article-h3 + .article-list, .article-quote + .article-list, .article-divider + .article-list').forEach((element) => {
    element.style.setProperty('margin-top', '2px')
  })

  clone.querySelectorAll<HTMLElement>('.article-list li').forEach((element) => {
    setStyles(element, {
      margin: '0 0 8px',
      padding: '0',
      color: 'rgb(90, 87, 80)',
      lineHeight: '1.85',
    })
  })

  clone.querySelectorAll<HTMLElement>('.chapter-card').forEach((element) => {
    setStyles(element, {
      margin: '32px 22px 0',
      padding: element.style.padding || '26px 22px',
      border: element.style.border || '1px solid rgba(80, 76, 68, 0.06)',
      borderRadius: element.style.borderRadius || '18px',
      boxShadow: 'none',
      background: element.style.background || '#ffffff',
      backgroundColor: element.style.backgroundColor || '#ffffff',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.chapter-number').forEach((element) => {
    setStyles(element, {
      margin: '0 0 14px',
      color: 'rgba(80, 76, 68, 0.45)',
      fontSize: '12px',
      lineHeight: '1.4',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-table-wrap').forEach((element) => {
    setStyles(element, {
      overflow: 'visible',
      margin: `24px ${copySideInset} 28px`,
      padding: '0',
      width: 'auto',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-table').forEach((element) => {
    setStyles(element, {
      width: `calc(100% - ${COPY_SIDE_INSET * 2}px)`,
      minWidth: '0',
      maxWidth: `calc(100% - ${COPY_SIDE_INSET * 2}px)`,
      margin: `0 ${copySideInset}`,
      marginLeft: copySideInset,
      marginRight: copySideInset,
      tableLayout: 'fixed',
      borderCollapse: 'collapse',
      fontSize: '13px',
      lineHeight: '1.65',
      color: 'rgb(70, 66, 58)',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-table th, .article-table td').forEach((element) => {
    setStyles(element, {
      padding: '9px 7px',
      border: '0',
      borderBottom: '1px solid rgba(80, 76, 68, 0.14)',
      wordBreak: 'break-word',
      verticalAlign: 'top',
      boxSizing: 'border-box',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-divider').forEach((element) => {
    setStyles(element, {
      margin: `30px ${copySideInset}`,
      display: 'block',
      textAlign: 'center',
      boxSizing: 'border-box',
    })
  })

  ;[clone, ...Array.from(clone.querySelectorAll<HTMLElement>('[style]'))].forEach((element) => {
    element.style.removeProperty('position')
    element.style.removeProperty('left')
    element.style.removeProperty('right')
    element.style.removeProperty('top')
    element.style.removeProperty('bottom')
    element.style.removeProperty('min-height')
    if (!element.matches('figure.article-image, figure.article-image *, img')) {
      element.style.removeProperty('height')
    }
    element.style.removeProperty('box-shadow')
    element.style.removeProperty('object-fit')
    element.style.removeProperty('object-position')
    if (element !== clone && !element.matches('table, thead, tbody, tr, th, td, figure.article-image, figure.article-image *, img')) {
      element.style.removeProperty('width')
      element.style.removeProperty('max-width')
      element.style.removeProperty('min-width')
    }
  })

  clone.style.setProperty('width', '100%')
  clone.style.setProperty('max-width', '100%')
  clone.querySelectorAll<HTMLElement>('[class]').forEach((element) => element.removeAttribute('class'))
  clone.removeAttribute('class')
}

const getRichTextArticleClone = async (node: HTMLElement) => {
  const clone = cloneWithInlineStyles(node)
  await prepareImagesForRichText(node, clone)
  normalizeCopyStructure(clone)
  normalizeRichTextStyles(clone)
  return clone
}

const writeRichClipboard = async (html: string, text: string) => {
  if ('ClipboardItem' in window && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ])
    return
  }

  const holder = document.createElement('div')
  holder.contentEditable = 'true'
  holder.style.position = 'fixed'
  holder.style.left = '-9999px'
  holder.style.top = '0'
  holder.innerHTML = html
  document.body.appendChild(holder)

  const range = document.createRange()
  range.selectNodeContents(holder)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  document.execCommand('copy')
  selection?.removeAllRanges()
  holder.remove()
}

export const getInlineArticleHtml = (node: HTMLElement) => cloneWithInlineStyles(node).outerHTML

export const copyArticleHtml = async (node: HTMLElement) => {
  const html = getInlineArticleHtml(node)
  await navigator.clipboard.writeText(html)
}

export const copyArticleRichText = async (node: HTMLElement) => {
  const clone = await getRichTextArticleClone(node)
  const html = clone.outerHTML
  const text = clone.innerText
  await writeRichClipboard(html, text)
}

export const downloadHtmlFile = (node: HTMLElement) => {
  const articleHtml = getInlineArticleHtml(node)
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Flipped Editor Export</title>
</head>
<body style="margin:0;background:#f5f5f2;">
${articleHtml}
</body>
</html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'flipped-editor-article.html'
  link.click()
  URL.revokeObjectURL(url)
}
