import {
  Bold,
  BookOpenText,
  FileImage,
  GripHorizontal,
  Heading1,
  Heading2,
  Heading3,
  HelpCircle,
  Italic,
  PanelTop,
  Quote,
  Table2,
  X,
} from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { StyleConfig } from '../types/style'

type Props = {
  value: string
  onChange: (value: string) => void
  onInsertImageUpload: (variant: string, file: File) => Promise<string>
  styleConfig: StyleConfig
  onStyleChange: (value: StyleConfig) => void
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
  { syntax: '<aside>提示</aside>', note: 'Callout' },
  { syntax: '- 无序列表', note: '无序列表' },
  { syntax: '1. 有序列表', note: '有序列表' },
  { syntax: '  - 二级无序列表', note: 'Tab 缩进一级' },
  { syntax: '  缩进正文', note: '正文缩进一级' },
  { syntax: '---', note: '分割线' },
  { syntax: '| 表头 | 表头 |', note: '表格' },
  { syntax: '[image: wide]', note: '图片占位' },
]

const tableTemplate = `| 维度 | 内容 | 备注 |
| --- | --- | --- |
| 示例一 | 可直接替换 | 说明 |
| 示例二 | 可继续添加 | 说明 |`

const accentOptions = [
  { name: '黑色', value: '#26231f' },
  { name: '朱砂', value: '#9f3f2f' },
  { name: '暖橙', value: '#c46f2f' },
  { name: '靛蓝', value: '#335c8a' },
  { name: '藤紫', value: '#6b527f' },
]

const getLineRange = (text: string, position: number) => {
  const start = text.lastIndexOf('\n', position - 1) + 1
  const nextBreak = text.indexOf('\n', position)
  const end = nextBreak === -1 ? text.length : nextBreak
  return { start, end, line: text.slice(start, end) }
}

const getSelectedLineRange = (text: string, selectionStart: number, selectionEnd: number) => {
  const adjustedEnd = selectionEnd > selectionStart && text[selectionEnd - 1] === '\n' ? selectionEnd - 1 : selectionEnd
  const start = text.lastIndexOf('\n', selectionStart - 1) + 1
  const nextBreak = text.indexOf('\n', adjustedEnd)
  const end = nextBreak === -1 ? text.length : nextBreak
  return { start, end, text: text.slice(start, end) }
}

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, Props>(function MarkdownEditor(
  { value, onChange, onInsertImageUpload, styleConfig, onStyleChange, onScroll },
  ref,
) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const insertImageMenuRef = useRef<HTMLDivElement>(null)
  const guideDragRef = useRef({ x: 0, y: 0, left: 0, top: 0 })
  const editHistoryRef = useRef<{ undo: string[]; redo: string[] }>({ undo: [], redo: [] })
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingVariant, setPendingVariant] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guidePosition, setGuidePosition] = useState({ left: 138, top: 112 })
  const lineCount = Math.max(28, value.split('\n').length)
  const lines = Array.from({ length: lineCount }, (_, index) => index + 1)

  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

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
    textareaRef.current = node
  }

  const pushUndoSnapshot = (previousValue: string) => {
    const history = editHistoryRef.current
    if (history.undo.at(-1) !== previousValue) {
      history.undo = [...history.undo.slice(-79), previousValue]
    }
    history.redo = []
  }

  const replaceSelection = (nextValue: string, cursorStart: number, cursorEnd = cursorStart, previousValue?: string) => {
    if (previousValue !== undefined && previousValue !== nextValue) pushUndoSnapshot(previousValue)
    const scrollTop = textareaRef.current?.scrollTop ?? 0
    const scrollLeft = textareaRef.current?.scrollLeft ?? 0
    onChange(nextValue)
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(cursorStart, cursorEnd)
      textarea.scrollTop = scrollTop
      textarea.scrollLeft = scrollLeft
      if (gutterRef.current) gutterRef.current.scrollTop = scrollTop
    })
  }

  const preventToolbarMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const insertAtCursor = (token: string) => {
    const textarea = textareaRef.current
    const insertText = `\n\n${token}\n\n`
    if (!textarea) {
      onChange(`${value}${insertText}`)
      return
    }
    const currentValue = textarea.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const scrollTop = textarea.scrollTop
    const scrollLeft = textarea.scrollLeft
    const nextValue = `${currentValue.slice(0, start)}${insertText}${currentValue.slice(end)}`
    pushUndoSnapshot(currentValue)
    onChange(nextValue)
    setMenuOpen(false)
    window.requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + insertText.length
      textarea.setSelectionRange(cursor, cursor)
      textarea.scrollTop = scrollTop
      textarea.scrollLeft = scrollLeft
      if (gutterRef.current) gutterRef.current.scrollTop = scrollTop
    })
  }

  const toggleWrapSelection = (before: string, after = before, placeholder = '文字') => {
    const textarea = textareaRef.current
    if (!textarea) return insertAtCursor(`${before}${placeholder}${after}`)
    const currentValue = textarea.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = currentValue.slice(start, end) || placeholder

    if (selected.startsWith(before) && selected.endsWith(after) && selected.length > before.length + after.length) {
      const replacement = selected.slice(before.length, selected.length - after.length)
      const nextValue = `${currentValue.slice(0, start)}${replacement}${currentValue.slice(end)}`
      replaceSelection(nextValue, start, start + replacement.length, currentValue)
      return
    }

    if (currentValue.slice(start - before.length, start) === before && currentValue.slice(end, end + after.length) === after) {
      const nextValue = `${currentValue.slice(0, start - before.length)}${selected}${currentValue.slice(end + after.length)}`
      const selectionStart = start - before.length
      replaceSelection(nextValue, selectionStart, selectionStart + selected.length, currentValue)
      return
    }

    const nextValue = `${currentValue.slice(0, start)}${before}${selected}${after}${currentValue.slice(end)}`
    const selectionStart = start + before.length
    replaceSelection(nextValue, selectionStart, selectionStart + selected.length, currentValue)
  }

  const formatCurrentLines = (formatter: (line: string) => string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const currentValue = textarea.value
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd
    const { start, end, text } = getSelectedLineRange(currentValue, selectionStart, selectionEnd)
    const lines = text.split('\n')
    const replacement = lines.map(formatter).join('\n')
    const nextValue = `${currentValue.slice(0, start)}${replacement}${currentValue.slice(end)}`
    replaceSelection(nextValue, start, start + replacement.length, currentValue)
  }

  const applyHeading = (level: 1 | 2 | 3) => {
    const prefix = `${'#'.repeat(level)} `
    const textarea = textareaRef.current
    if (!textarea) return
    const { text } = getSelectedLineRange(textarea.value, textarea.selectionStart, textarea.selectionEnd)
    const shouldRemove = text
      .split('\n')
      .filter((line) => line.trim())
      .every((line) => line.startsWith(prefix))

    formatCurrentLines((line) => {
      if (shouldRemove) return line.replace(/^#{1,3}\s+/, '')
      const content = line.replace(/^#{1,3}\s+/, '').trimStart()
      return content ? `${prefix}${content}` : `${prefix}标题`
    })
  }

  const applyQuote = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    const { text } = getSelectedLineRange(textarea.value, textarea.selectionStart, textarea.selectionEnd)
    const shouldRemove = text
      .split('\n')
      .filter((line) => line.trim())
      .every((line) => line.startsWith('> '))

    formatCurrentLines((line) => {
      if (shouldRemove) return line.replace(/^>\s?/, '')
      return `> ${line || '引用文字'}`
    })
  }

  const toggleCallout = () => {
    const textarea = textareaRef.current
    if (!textarea) {
      insertAtCursor(`<aside>
这里写一段提示、补充说明或重点观察。
</aside>`)
      return
    }

    const currentValue = textarea.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = currentValue.slice(start, end)
    const selectedCallout = selected.match(/^(\s*)<aside(?:\s[^>]*)?>\n?([\s\S]*?)\n?<\/aside>(\s*)$/i)

    if (selectedCallout) {
      const replacement = `${selectedCallout[1]}${selectedCallout[2]}${selectedCallout[3]}`
      const nextValue = `${currentValue.slice(0, start)}${replacement}${currentValue.slice(end)}`
      replaceSelection(nextValue, start + selectedCallout[1].length, start + selectedCallout[1].length + selectedCallout[2].length, currentValue)
      return
    }

    const beforeSelection = currentValue.slice(0, start)
    const afterSelection = currentValue.slice(end)
    const openMatch = beforeSelection.match(/\n{0,2}<aside(?:\s[^>]*)?>\n?$/i)
    const closeMatch = afterSelection.match(/^\n?<\/aside>\n{0,2}/i)
    if (openMatch && closeMatch) {
      const beforeBlock = currentValue.slice(0, start - openMatch[0].length)
      const afterBlock = currentValue.slice(end + closeMatch[0].length)
      const wasBlockSeparated = openMatch[0].includes('\n') || closeMatch[0].includes('\n')
      const keepBeforeBreak = wasBlockSeparated && beforeBlock.trim() && !beforeBlock.endsWith('\n\n') ? '\n\n' : ''
      const keepAfterBreak = wasBlockSeparated && afterBlock.trim() && !afterBlock.startsWith('\n\n') ? '\n\n' : ''
      const nextValue = `${beforeBlock}${keepBeforeBreak}${selected}${keepAfterBreak}${afterBlock}`
      const selectionStart = beforeBlock.length + keepBeforeBreak.length
      replaceSelection(nextValue, selectionStart, selectionStart + selected.length, currentValue)
      return
    }

    const content = selected || '这里写一段提示、补充说明或重点观察。'
    const leadingBreak = start > 0 && currentValue[start - 1] !== '\n' ? '\n\n' : ''
    const trailingBreak = end < currentValue.length && currentValue[end] !== '\n' ? '\n\n' : ''
    const replacement = `${leadingBreak}<aside>\n${content}\n</aside>${trailingBreak}`
    const nextValue = `${currentValue.slice(0, start)}${replacement}${currentValue.slice(end)}`
    const selectionStart = start + leadingBreak.length + '<aside>\n'.length
    replaceSelection(nextValue, selectionStart, selectionStart + content.length, currentValue)
  }

  const insertTable = () => {
    insertAtCursor(tableTemplate)
  }

  const chooseAccentColor = (accentColor: string) => {
    onStyleChange({ ...styleConfig, accentColor })
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
        replaceSelection(nextValue, lineStart, lineStart, editorValue)
        return true
      }
      const insertText = `\n${markerText}`
      const nextValue = `${editorValue.slice(0, cursor)}${insertText}${editorValue.slice(cursor)}`
      replaceSelection(nextValue, cursor + insertText.length, cursor + insertText.length, editorValue)
      return true
    }

    if (ordered) {
      const [, indent, rawNumber, delimiter, content] = ordered
      const currentMarker = `${indent}${rawNumber}${delimiter} `
      if (!content.trim() && beforeCursor.trim() === `${rawNumber}${delimiter}`) {
        const nextValue = `${editorValue.slice(0, lineStart)}${editorValue.slice(lineStart + currentMarker.length)}`
        replaceSelection(nextValue, lineStart, lineStart, editorValue)
        return true
      }
      const nextMarker = `${indent}${Number(rawNumber) + 1}${delimiter} `
      const insertText = `\n${nextMarker}`
      const nextValue = `${editorValue.slice(0, cursor)}${insertText}${afterCursor}${editorValue.slice(
        cursor + afterCursor.length,
      )}`
      replaceSelection(nextValue, cursor + insertText.length, cursor + insertText.length, editorValue)
      return true
    }

    return false
  }

  const handleTabKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab') return false
    const textarea = event.currentTarget
    const editorValue = textarea.value
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd

    if (selectionStart !== selectionEnd) {
      event.preventDefault()
      const { start, end, text } = getSelectedLineRange(editorValue, selectionStart, selectionEnd)
      const replacement = text
        .split('\n')
        .map((line) => {
          if (!event.shiftKey) return `\t${line}`
          if (line.startsWith('\t')) return line.slice(1)
          if (line.startsWith('  ')) return line.slice(2)
          if (line.startsWith(' ')) return line.slice(1)
          return line
        })
        .join('\n')
      const nextValue = `${editorValue.slice(0, start)}${replacement}${editorValue.slice(end)}`
      replaceSelection(nextValue, start, start + replacement.length, editorValue)
      return true
    }

    const { start: lineStart, end: lineEnd, line: currentLine } = getLineRange(editorValue, selectionStart)
    event.preventDefault()

    const currentIndent = currentLine.match(/^(\s*)/)?.[1] ?? ''

    if (event.shiftKey) {
      if (!currentIndent) return true
      const removeCount = currentIndent.startsWith('\t') ? 1 : Math.min(2, currentIndent.length)
      const nextValue = `${editorValue.slice(0, lineStart)}${currentLine.slice(removeCount)}${editorValue.slice(
        lineEnd,
      )}`
      replaceSelection(nextValue, Math.max(lineStart, selectionStart - removeCount), Math.max(lineStart, selectionStart - removeCount), editorValue)
      return true
    }

    if (currentIndent.length > 0) return true
    const nextValue = `${editorValue.slice(0, lineStart)}\t${editorValue.slice(lineStart)}`
    replaceSelection(nextValue, selectionStart + 1, selectionStart + 1, editorValue)
    return true
  }

  const handleUndoRedo = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey
    const isRedo =
      ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && event.shiftKey) ||
      ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y')
    if (!isUndo && !isRedo) return false

    const history = editHistoryRef.current
    const source = isUndo ? history.undo : history.redo
    const target = isUndo ? history.redo : history.undo
    const nextValue = source.pop()
    if (nextValue === undefined) return false

    event.preventDefault()
    const currentValue = event.currentTarget.value
    target.push(currentValue)
    onChange(nextValue)
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      const cursor = Math.min(textarea.selectionStart, nextValue.length)
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
    return true
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (handleUndoRedo(event)) return
    if (handleListEnter(event)) return
    handleTabKey(event)
  }

  const handleEditorChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    editHistoryRef.current = { undo: [], redo: [] }
    onChange(event.target.value)
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
          <button type="button" className="insert-table-button" onClick={insertTable}>
            <Table2 size={14} />
            插入表格
          </button>
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
      <div className="markdown-format-toolbar" aria-label="Markdown 格式工具栏">
        <div className="format-tool-group">
          <button type="button" className="format-icon-button format-heading-button" onMouseDown={preventToolbarMouseDown} onClick={() => applyHeading(1)} title="一级标题">
            <Heading1 size={14} />
          </button>
          <button type="button" className="format-icon-button format-heading-button" onMouseDown={preventToolbarMouseDown} onClick={() => applyHeading(2)} title="二级标题">
            <Heading2 size={14} />
          </button>
          <button type="button" className="format-icon-button format-heading-button" onMouseDown={preventToolbarMouseDown} onClick={() => applyHeading(3)} title="三级标题">
            <Heading3 size={14} />
          </button>
          <span className="toolbar-divider" aria-hidden="true" />
          <button type="button" className="format-icon-button" onMouseDown={preventToolbarMouseDown} onClick={() => toggleWrapSelection('**')} title="加粗">
            <Bold size={14} />
          </button>
          <button type="button" className="format-icon-button" onMouseDown={preventToolbarMouseDown} onClick={() => toggleWrapSelection('*')} title="斜体">
            <Italic size={14} />
          </button>
          <button type="button" className="format-icon-button" onMouseDown={preventToolbarMouseDown} onClick={applyQuote} title="引用">
            <Quote size={14} />
          </button>
          <button type="button" className="format-icon-button" onMouseDown={preventToolbarMouseDown} onClick={toggleCallout} title="Callout">
            <PanelTop size={14} />
          </button>
        </div>
        <div className="accent-color-group" aria-label="文本主题色">
          {accentOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styleConfig.accentColor.toLowerCase() === option.value.toLowerCase() ? 'active' : ''}
              onMouseDown={preventToolbarMouseDown}
              onClick={() => chooseAccentColor(option.value)}
              title={`文本主题色：${option.name}`}
            >
              <span style={{ background: option.value }} />
            </button>
          ))}
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
              <button type="button" aria-label="关闭 Markdown 语法参考" onPointerDown={closeGuide} onClick={closeGuide}>
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
            onChange={handleEditorChange}
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
