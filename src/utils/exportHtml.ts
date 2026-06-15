const inlineProperties = [
  'background',
  'background-color',
  'background-image',
  'border',
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
  'object-fit',
  'object-position',
  'overflow',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'position',
  'text-align',
  'text-shadow',
  'width',
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

export const getInlineArticleHtml = (node: HTMLElement) => cloneWithInlineStyles(node).outerHTML

export const copyArticleHtml = async (node: HTMLElement) => {
  const html = getInlineArticleHtml(node)
  await navigator.clipboard.writeText(html)
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
