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
  element.style.padding = '0 0 34px'
  element.style.margin = '0'
}

const removeImagesForRichText = (clone: HTMLElement) => {
  clone.querySelectorAll('figure.article-image, img, .image-placeholder').forEach((node) => node.remove())

  const natureHero = clone.querySelector<HTMLElement>('.nature-hero')
  const natureTitle = clone.querySelector<HTMLElement>('.nature-title')
  if (natureHero && natureTitle) {
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
          marginLeft: depth === 1 ? '24px' : '0',
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
        margin: '34px 0',
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
    padding: '0',
    overflow: 'visible',
    background: 'transparent',
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    borderRadius: '0',
    border: '0',
    boxShadow: 'none',
  })
  clone.style.removeProperty('--article-image-gap')
  clone.style.removeProperty('--article-body-block')

  clone.querySelectorAll<HTMLElement>('.article-body, .narrow, .poetic-inner').forEach((element) => {
    setStyles(element, {
      margin: '0',
      padding: '0',
      background: 'transparent',
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      border: '0',
      borderRadius: '0',
      boxShadow: 'none',
      overflow: 'visible',
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
      margin: '0 0 8px',
      color: 'rgba(84, 80, 72, 0.5)',
      fontSize: '12px',
      lineHeight: '1.6',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-h1').forEach((element) => {
    setStyles(element, {
      margin: '42px 0 24px',
      color: 'rgb(63, 61, 56)',
      fontSize: '24px',
      lineHeight: '1.45',
      fontWeight: '400',
    })
  })
  clone.querySelector<HTMLElement>('.article-h1')?.style.setProperty('margin-top', '0')

  clone.querySelectorAll<HTMLElement>('.article-h2').forEach((element) => {
    setStyles(element, {
      margin: '48px 0 20px',
      color: 'rgb(63, 61, 56)',
      fontSize: '19px',
      lineHeight: '1.55',
      textAlign: 'left',
      fontWeight: '400',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-h3').forEach((element) => {
    setStyles(element, {
      margin: '30px 0 14px',
      padding: '0 0 0 12px',
      border: '0',
      borderLeft: '2px solid rgba(80, 76, 68, 0.22)',
      color: 'rgb(80, 76, 68)',
      fontSize: '16px',
      lineHeight: '1.65',
      fontWeight: '500',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-p').forEach((element) => {
    setStyles(element, {
      margin: '0 0 16px',
      color: 'rgb(90, 87, 80)',
      fontSize: bodyFontSize,
      lineHeight: '1.9',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-quote').forEach((element) => {
    setStyles(element, {
      margin: '28px 0',
      padding: '16px 0 16px 14px',
      border: '0',
      borderLeft: '2px solid rgba(80, 76, 68, 0.18)',
      color: 'rgb(104, 99, 90)',
      background: 'transparent',
      textAlign: 'left',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-list').forEach((element) => {
    setStyles(element, {
      margin: '22px 0 10px',
      padding: '0 0 0 20px',
      display: 'block',
      listStyle: element.tagName.toLowerCase() === 'ol' ? 'decimal' : 'disc',
      color: 'rgb(90, 87, 80)',
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
      margin: '32px 0 0',
      padding: '26px 0 0',
      border: '0',
      borderTop: '1px solid rgba(80, 76, 68, 0.14)',
      borderRadius: '0',
      boxShadow: 'none',
      background: 'transparent',
      backgroundColor: 'transparent',
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
      margin: '24px 0 28px',
      padding: '0',
      width: '100%',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-table').forEach((element) => {
    setStyles(element, {
      width: '100%',
      minWidth: '0',
      tableLayout: 'fixed',
      borderCollapse: 'collapse',
      fontSize: '13px',
      lineHeight: '1.65',
      color: 'rgb(70, 66, 58)',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-table th, .article-table td').forEach((element) => {
    setStyles(element, {
      padding: '9px 7px',
      border: '0',
      borderBottom: '1px solid rgba(80, 76, 68, 0.14)',
      wordBreak: 'break-word',
      verticalAlign: 'top',
    })
  })

  clone.querySelectorAll<HTMLElement>('.article-divider').forEach((element) => {
    setStyles(element, {
      margin: '30px 0',
      display: 'block',
      textAlign: 'center',
    })
  })

  ;[clone, ...Array.from(clone.querySelectorAll<HTMLElement>('[style]'))].forEach((element) => {
    element.style.removeProperty('position')
    element.style.removeProperty('left')
    element.style.removeProperty('right')
    element.style.removeProperty('top')
    element.style.removeProperty('bottom')
    element.style.removeProperty('min-height')
    element.style.removeProperty('height')
    element.style.removeProperty('box-shadow')
    if (element !== clone && !element.matches('table, thead, tbody, tr, th, td')) {
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

const getRichTextArticleClone = (node: HTMLElement) => {
  const clone = cloneWithInlineStyles(node)
  removeImagesForRichText(clone)
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
  const clone = getRichTextArticleClone(node)
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
