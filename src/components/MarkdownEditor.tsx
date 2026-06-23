import { BookOpenText, FileImage } from 'lucide-react'
import { forwardRef, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  onScroll?: (element: HTMLTextAreaElement) => void
}

const imageInsertOptions = [
  { label: '普通图片', token: '{{image}}' },
  { label: '顶部首图 hero', token: '[image: hero]' },
  { label: '横幅 wide', token: '[image: wide]' },
  { label: '方图 square', token: '[image: square]' },
  { label: '小图 small', token: '[image: small]' },
  { label: '分栏 split', token: '[image: split]' },
]

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, Props>(function MarkdownEditor(
  { value, onChange, onScroll },
  ref,
) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const lineCount = Math.max(28, value.split('\n').length)
  const lines = Array.from({ length: lineCount }, (_, index) => index + 1)

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

  const handleTabKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab') return
    const textarea = event.currentTarget
    const lineStart = value.lastIndexOf('\n', textarea.selectionStart - 1) + 1
    const lineEnd = value.indexOf('\n', textarea.selectionStart)
    const currentLineEnd = lineEnd === -1 ? value.length : lineEnd
    const currentLine = value.slice(lineStart, currentLineEnd)
    const isListLine = /^(\s*)[-*+]\s+/.test(currentLine)
    if (!isListLine) return

    event.preventDefault()
    const currentIndent = currentLine.match(/^(\s*)/)?.[1] ?? ''

    if (event.shiftKey) {
      if (!currentIndent) return
      const removeCount = currentIndent.startsWith('\t') ? 1 : Math.min(2, currentIndent.length)
      const nextValue = `${value.slice(0, lineStart)}${currentLine.slice(removeCount)}${value.slice(currentLineEnd)}`
      onChange(nextValue)
      window.requestAnimationFrame(() => {
        textarea.focus()
        const cursor = Math.max(lineStart, textarea.selectionStart - removeCount)
        textarea.setSelectionRange(cursor, cursor)
      })
      return
    }

    if (currentIndent.length > 0) return
    const nextValue = `${value.slice(0, lineStart)}  ${value.slice(lineStart)}`
    onChange(nextValue)
    window.requestAnimationFrame(() => {
      textarea.focus()
      const cursor = textarea.selectionStart + 2
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <section className="editor-section">
      <div className="section-title markdown-title">
        <span className="markdown-title-icon">
          <BookOpenText size={15} />
        </span>
        <span>Markdown 输入</span>
        <div className="markdown-actions">
          <small>字数: {value.replace(/\s/g, '').length}</small>
          <div className="insert-image-menu">
            <button type="button" className="insert-image-button" onClick={() => setMenuOpen((open) => !open)}>
              <FileImage size={14} />
              插入图片
            </button>
            {menuOpen && (
              <div className="insert-image-popover">
                {imageInsertOptions.map((option) => (
                  <button key={option.token} type="button" onClick={() => insertAtCursor(option.token)}>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="code-editor-shell">
        <div ref={gutterRef} className="line-gutter" aria-hidden="true">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <textarea
          ref={setTextareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleTabKey}
          onScroll={(event) => {
            if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop
            onScroll?.(event.currentTarget)
          }}
          spellCheck={false}
          placeholder="Paste your Markdown here..."
        />
      </div>
    </section>
  )
})
