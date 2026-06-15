import { FileImage, FileText } from 'lucide-react'
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

  return (
    <section className="editor-section">
      <div className="section-title markdown-title">
        <FileText size={16} />
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
