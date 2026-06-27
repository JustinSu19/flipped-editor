import { BookOpenText, FileImage, GripHorizontal, HelpCircle, X } from 'lucide-react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  value: string
  onChange: (value: string) => void
  onInsertImageUpload: (variant: string, file: File) => Promise<string>
  onScroll?: (element: HTMLTextAreaElement) => void
}

const imageInsertOptions = [
  { label: '长竖图 9:16', variant: '9-16' },
  { label: '方图 1:1', variant: 'square' },
  { label: '横幅 21:9', variant: 'wide' },
  { label: '横图 4:3', variant: '4-3' },
  { label: '竖图 3:4', variant: '3-4' },
  { label: '竖图 4:5', variant: 'portrait' },
]

const markdownGuide = [
  { syntax: '# 一级标题', note: '一级标题' },
  { syntax: '## 二级标题', note: '二级标题' },
  { syntax: '### 三级标题', note: '三级标题' },
  { syntax: '**文字**', note: '加粗' },
  { syntax: '*文字*', note: '斜体' },
  { syntax: '> 引用文字', note: '引用' },
  { syntax: '- 无序列表', note: '无序列表' },
  { syntax: '1. 有序列表', note: '有序列表' },
  { syntax: '  - 二级无序列表', note: 'Tab 缩进一级' },
  { syntax: '---', note: '分割线' },
  { syntax: '| 表头 | 表头 |', note: '表格' },
  { syntax: '[image: wide]', note: '图片占位' },
]

const getLineRange = (text: string, position: number) => {
  const start = text.lastIndexOf('\n', position - 1) + 1
  const nextBreak = text.indexOf('\n', position)
  const end = nextBreak === -1 ? text.length : nextBreak
  return { start, end, line: text.slice(start, end) }
}

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, Props>(function MarkdownEditor(
  { value, onChange, onInsertImageUpload, onScroll },
  ref,
) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const insertImageMenuRef = useRef<HTMLDivElement>(null)
  const guideDragRef = useRef({ x: 0, y: 0, left: 0, top: 0 })
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingVariant, setPendingVariant] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guidePosition, setGuidePosition] = useState({ left: 138, top: 112 })
  const lineCount = Math.max(28, value.split('\n').length)
  const lines = Array.from({ length: lineCount }, (_, index) => index + 1)

  useEffect(() => {
    if (!menuOpen) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && insertImageMenuRef.current?.contains(target)) return
      setMenuOpen(false)
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const setTextareaRef = (node: HTMLTextAreaElement | null) => {
    if (typeof ref === 'function') {
      ref(node)
      return
    }
    if (ref) ref.current = node
  }

  const insertAtCursor = (token: string) => {
    const textarea = typeof ref === 'object' ? ref?.current : null
    const insertText = `\n\n${token}\n\n`
    if (!textarea) {
      onChange(`${value}${insertText}`)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const nextValue = `${value.slice(0, start)}${insertText}${value.slice(end)}`
    onChange(nextValue)
    setMenuOpen(false)
    window.requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + insertText.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const chooseImage = (variant: string) => {
    setPendingVariant(variant)
    setMenuOpen(false)
    fileInputRef.current?.click()
  }

  const handleImageFile = async (fileList: FileList | null) => {
    const file = fileList?.[0]
    const variant = pendingVariant
    if (fileInputRef.current) fileInputRef.current.value = ''
    setPendingVariant(null)
    if (!file || !variant || !file.type.startsWith('image/')) return
    const token = await onInsertImageUpload(variant, file)
    insertAtCursor(token)
  }

  const handleGuideDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    guideDragRef.current = {
      x: event.clientX,
      y: event.clientY,
      left: guidePosition.left,
      top: guidePosition.top,
    }
  }

  const handleGuideDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const nextLeft = guideDragRef.current.left + event.clientX - guideDragRef.current.x
    const nextTop = guideDragRef.current.top + event.clientY - guideDragRef.current.y
    setGuidePosition({
      left: Math.min(Math.max(12, nextLeft), window.innerWidth - 292),
      top: Math.min(Math.max(72, nextTop), window.innerHeight - 360),
    })
  }

  const closeGuide = (event: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setGuideOpen(false)
  }

  const handleListEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return false

    const textarea = event.currentTarget
    const editorValue = textarea.value
    if (textarea.selectionStart !== textarea.selectionEnd) return false

    const cursor = textarea.selectionStart
    const { start: lineStart, line } = getLineRange(editorValue, cursor)
    const beforeCursor = editorValue.slice(lineStart, cursor)
    const afterCursor = editorValue.slice(cursor, lineStart + line.length)
    const unordered = line.match(/^(\s*)([-*+])\s+(.*)$/)
    const ordered = line.match(/^(\s*)(\d+)([.)])\s+(.*)$/)
    if (!unordered && !ordered) return false

    event.preventDefault()

    if (unordered) {
      const [, indent, marker, content] = unordered
      const markerText = `${indent}${marker} `
      if (!content.trim() && beforeCursor.trim() === marker.trim()) {
        const nextValue = `${editorValue.slice(0, lineStart)}${editorValue.slice(lineStart + markerText.length)}`
        onChange(nextValue)
        window.requestAnimationFrame(() => {
          textarea.focus()
          textarea.setSelectionRange(lineStart, lineStart)
        })
        return true
      }
      const insertText = `\n${markerText}`
      const nextValue = `${editorValue.slice(0, cursor)}${insertText}${editorValue.slice(cursor)}`
      onChange(nextValue)
      window.requestAnimationFrame(() => {
        textarea.focus()
        const nextCursor = cursor + insertText.length
        textarea.setSelectionRange(nextCursor, nextCursor)
      })
      return true
    }

    if (ordered) {
      const [, indent, rawNumber, delimiter, content] = ordered
      const currentMarker = `${indent}${rawNumber}${delimiter} `
      if (!content.trim() && beforeCursor.trim() === `${rawNumber}${delimiter}`) {
        const nextValue = `${editorValue.slice(0, lineStart)}${editorValue.slice(lineStart + currentMarker.length)}`
        onChange(nextValue)
        window.requestAnimationFrame(() => {
          textarea.focus()
          textarea.setSelectionRange(lineStart, lineStart)
        })
        return true
      }
      const nextMarker = `${indent}${Number(rawNumber) + 1}${delimiter} `
      const insertText = `\n${nextMarker}`
      const nextValue = `${editorValue.slice(0, cursor)}${insertText}${afterCursor}${editorValue.slice(
        cursor + afterCursor.length,
      )}`
      onChange(nextValue)
      window.requestAnimationFrame(() => {
        textarea.focus()
        const nextCursor = cursor + insertText.length
        textarea.setSelectionRange(nextCursor, nextCursor)
      })
      return true
    }

    return false
  }

  const handleTabKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab') return false
    const textarea = event.currentTarget
    const editorValue = textarea.value
    const { start: lineStart, end: lineEnd, line: currentLine } = getLineRange(editorValue, textarea.selectionStart)
    const isListLine = /^(\s*)[-*+]\s+/.test(currentLine)
    if (!isListLine) return false

    event.preventDefault()
    const currentIndent = currentLine.match(/^(\s*)/)?.[1] ?? ''

    if (event.shiftKey) {
      if (!currentIndent) return true
      const removeCount = currentIndent.startsWith('\t') ? 1 : Math.min(2, currentIndent.length)
      const nextValue = `${editorValue.slice(0, lineStart)}${currentLine.slice(removeCount)}${editorValue.slice(
        lineEnd,
      )}`
      onChange(nextValue)
      window.requestAnimationFrame(() => {
        textarea.focus()
        const cursor = Math.max(lineStart, textarea.selectionStart - removeCount)
        textarea.setSelectionRange(cursor, cursor)
      })
      return true
    }

    if (currentIndent.length > 0) return true
    const nextValue = `${editorValue.slice(0, lineStart)}  ${editorValue.slice(lineStart)}`
    onChange(nextValue)
    window.requestAnimationFrame(() => {
      textarea.focus()
      const cursor = textarea.selectionStart + 2
      textarea.setSelectionRange(cursor, cursor)
    })
    return true
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (handleListEnter(event)) return
    handleTabKey(event)
  }

  return (
    <section className="editor-section">
      <div className="section-title markdown-title">
        <span className="markdown-title-icon">
          <BookOpenText size={15} />
        </span>
        <span>Markdown 输入</span>
        <button
          type="button"
          className="markdown-guide-trigger"
          aria-label="Markdown 语法参考"
          onClick={() => setGuideOpen(true)}
        >
          <HelpCircle size={14} />
        </button>
        <div className="markdown-actions">
          <small>字数: {value.replace(/\s/g, '').length}</small>
          <div ref={insertImageMenuRef} className="insert-image-menu">
            <button type="button" className="insert-image-button" onClick={() => setMenuOpen((open) => !open)}>
              <FileImage size={14} />
              插入图片
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="insert-image-file-input"
              onChange={(event) => void handleImageFile(event.target.files)}
            />
            {menuOpen && (
              <div className="insert-image-popover">
                {imageInsertOptions.map((option) => (
                  <button key={option.variant} type="button" onClick={() => chooseImage(option.variant)}>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {guideOpen &&
        createPortal(
          <aside
            className="markdown-guide"
            style={{ left: guidePosition.left, top: guidePosition.top }}
            aria-label="Markdown 语法参考"
          >
            <div
              className="markdown-guide-header"
              onPointerDown={handleGuideDragStart}
              onPointerMove={handleGuideDragMove}
            >
              <span>
                <GripHorizontal size={14} />
                Markdown 速查
              </span>
              <button
                type="button"
                aria-label="关闭 Markdown 语法参考"
                onPointerDown={closeGuide}
                onClick={closeGuide}
              >
                <X size={14} />
              </button>
            </div>
            <div className="markdown-guide-list">
              {markdownGuide.map((item) => (
                <div key={item.syntax} className="markdown-guide-row">
                  <code>{item.syntax}</code>
                  <span>{item.note}</span>
                </div>
              ))}
            </div>
          </aside>,
          document.body,
        )}
      <div className="code-editor-shell">
        <div ref={gutterRef} className="line-gutter" aria-hidden="true">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className="editor-input-stack">
          <textarea
            ref={setTextareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={(event) => {
              if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop
              onScroll?.(event.currentTarget)
            }}
            spellCheck={false}
            placeholder="Paste your Markdown here..."
          />
        </div>
      </div>
    </section>
  )
})
