import { marked } from 'marked'
import type { ContentBlock, ImageVariant, TableAlign } from '../types/content'

const imageVariantIds: Record<string, ImageVariant> = {
  hero: 'hero',
  wide: 'wide',
  square: 'square',
  portrait: 'portrait',
  '4-3': '4-3',
  '4x3': '4-3',
  landscape43: '4-3',
  '3-4': '3-4',
  '3x4': '3-4',
  portrait34: '3-4',
  '9-16': '9-16',
  '9x16': '9-16',
  vertical916: '9-16',
  small: 'small',
  split: 'split',
}

const allowedInlineTags = new Set(['STRONG', 'EM', 'CODE', 'BR'])

const fallbackSanitizeInlineHtml = (html: string) =>
  html.replace(/<(?!\/?(strong|em|code|br)\b)[^>]*>/gi, '').replace(/\s(?:on\w+|style|href|src)=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')

const sanitizeInlineHtml = (html: string) => {
  if (typeof document === 'undefined') return fallbackSanitizeInlineHtml(html)

  const template = document.createElement('template')
  template.innerHTML = html

  const cleanNode = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return
      const element = child as HTMLElement
      if (!allowedInlineTags.has(element.tagName)) {
        element.replaceWith(document.createTextNode(element.textContent ?? ''))
        return
      }
      Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name))
      cleanNode(element)
    })
  }

  cleanNode(template.content)
  return template.innerHTML
}

const inlineText = (value: string) =>
  sanitizeInlineHtml(
    marked
      .parseInline(value.trim(), { async: false })
      .toString()
      .replace(/\n/g, ''),
  )

const placeholderToImage = (line: string, autoIndex: number): { block: ContentBlock; nextIndex: number } | null => {
  const curly = line.match(/^\{\{(image[\w-]*)\}\}$/i)
  if (curly) {
    return { block: { type: 'image', id: `image${autoIndex}`, variant: 'default' }, nextIndex: autoIndex + 1 }
  }

  const bracket = line.match(/^\[image:\s*([\w-]+)(?:\s*\|\s*path:\s*([^|\]]+))?(?:\s*\|\s*id:\s*([\w-]+))?\]$/i)
  if (bracket) {
    const token = bracket[1].toLowerCase()
    const variant = imageVariantIds[token] ?? 'default'
    const explicitId = bracket[3]?.trim()
    if (explicitId) {
      return { block: { type: 'image', id: explicitId, variant }, nextIndex: autoIndex }
    }
    if (token === 'hero') {
      return { block: { type: 'image', id: 'hero', variant }, nextIndex: autoIndex }
    }
    return { block: { type: 'image', id: `image${autoIndex}`, variant }, nextIndex: autoIndex + 1 }
  }

  return null
}

const isTableRow = (line: string) => line.includes('|') && /^\s*\|?.+\|.+\|?\s*$/.test(line)

const splitTableRow = (line: string) => {
  const normalized = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return normalized.split('|').map((cell) => cell.trim())
}

const parseTableAlign = (line: string): TableAlign[] | null => {
  if (!isTableRow(line)) return null
  const cells = splitTableRow(line)
  if (!cells.length || !cells.every((cell) => /^:?-+:?$/.test(cell.replace(/\s/g, '')))) return null
  return cells.map((cell) => {
    const value = cell.replace(/\s/g, '')
    if (value.startsWith(':') && value.endsWith(':')) return 'center'
    if (value.endsWith(':')) return 'right'
    return 'left'
  })
}

const normalizeRowLength = (row: string[], length: number) =>
  Array.from({ length }, (_, index) => inlineText(row[index] ?? ''))

export const parseMarkdown = (markdown: string): ContentBlock[] => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ContentBlock[] = []
  let paragraph: string[] = []
  let list: string[] = []
  let listOrdered = false
  let listStart = 1
  let listDepth: 0 | 1 = 0
  let quote: string[] = []
  let autoImageIndex = 1

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.map(inlineText).join('<br />') })
      paragraph = []
    }
  }

  const flushList = () => {
    if (list.length) {
      blocks.push({
        type: 'list',
        items: list.map(inlineText),
        ordered: listOrdered,
        start: listOrdered ? listStart : undefined,
        depth: listDepth,
      })
      list = []
      listOrdered = false
      listStart = 1
      listDepth = 0
    }
  }

  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ type: 'quote', text: quote.map(inlineText).join('<br />') })
      quote = []
    }
  }

  const flushAll = () => {
    flushParagraph()
    flushList()
    flushQuote()
  }

  let index = 0
  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      flushAll()
      index += 1
      continue
    }

    const nextLine = lines[index + 1]?.trim() ?? ''
    const align = parseTableAlign(nextLine)
    if (isTableRow(line) && align) {
      flushAll()
      const headers = normalizeRowLength(splitTableRow(line), align.length)
      const rows: string[][] = []
      index += 2
      while (index < lines.length && isTableRow(lines[index].trim())) {
        rows.push(normalizeRowLength(splitTableRow(lines[index]), headers.length))
        index += 1
      }
      blocks.push({ type: 'table', headers, rows, align })
      continue
    }

    const imageResult = placeholderToImage(line, autoImageIndex)
    if (imageResult) {
      flushAll()
      blocks.push(imageResult.block)
      autoImageIndex = imageResult.nextIndex
      index += 1
      continue
    }

    if (/^---+$/.test(line)) {
      flushAll()
      blocks.push({ type: 'divider' })
      index += 1
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      flushAll()
      const level = heading[1].length
      blocks.push({ type: `h${level}` as 'h1' | 'h2' | 'h3', text: inlineText(heading[2]) })
      index += 1
      continue
    }

    const quoteLine = line.match(/^>\s?(.+)$/)
    if (quoteLine) {
      flushParagraph()
      flushList()
      quote.push(quoteLine[1])
      index += 1
      continue
    }

    const unorderedListItem = lines[index].match(/^(\s{0,4}|\t)[-*+]\s+(.+)$/)
    if (unorderedListItem) {
      flushParagraph()
      flushQuote()
      const depth = unorderedListItem[1].length > 0 ? 1 : 0
      if (list.length && (listOrdered || listDepth !== depth)) flushList()
      if (!list.length) {
        listOrdered = false
        listStart = 1
        listDepth = depth
      }
      list.push(unorderedListItem[2])
      index += 1
      continue
    }

    const orderedListItem = line.match(/^(\d+)[.)]\s+(.+)$/)
    if (orderedListItem) {
      flushParagraph()
      flushQuote()
      if (list.length && !listOrdered) flushList()
      if (!list.length) {
        listOrdered = true
        listStart = Number(orderedListItem[1])
      }
      list.push(orderedListItem[2])
      index += 1
      continue
    }

    flushList()
    flushQuote()
    paragraph.push(line)
    index += 1
  }

  flushAll()
  return blocks
}
