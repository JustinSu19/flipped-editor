import { Check, ChevronDown, Clipboard, FileText, ImageDown, Layers3 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type CopyMode = 'text-style' | 'global-style'

type Props = {
  richCopied: boolean
  exportingPng: boolean
  pngError?: string
  onCopyRichText: (mode: CopyMode) => Promise<void>
  onDownloadPng: () => void
}

const copyModeLabels: Record<CopyMode, string> = {
  'text-style': '只复制文本样式',
  'global-style': '复制全局样式',
}

export function ExportPanel({ richCopied, exportingPng, pngError, onCopyRichText, onDownloadPng }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const menuCloseTimerRef = useRef<number | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const toastCloseTimerRef = useRef<number | null>(null)
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)
  const [copyMenuRendered, setCopyMenuRendered] = useState(false)
  const [toastMode, setToastMode] = useState<CopyMode | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const openCopyMenu = useCallback(() => {
    if (menuCloseTimerRef.current) window.clearTimeout(menuCloseTimerRef.current)
    setCopyMenuRendered(true)
    window.requestAnimationFrame(() => setCopyMenuOpen(true))
  }, [])

  const closeCopyMenu = useCallback(() => {
    setCopyMenuOpen(false)
    if (menuCloseTimerRef.current) window.clearTimeout(menuCloseTimerRef.current)
    menuCloseTimerRef.current = window.setTimeout(() => {
      setCopyMenuRendered(false)
      menuCloseTimerRef.current = null
    }, 220)
  }, [])

  const showCopyToast = useCallback((mode: CopyMode) => {
    setToastMode(mode)
    setToastVisible(false)
    window.requestAnimationFrame(() => setToastVisible(true))
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    if (toastCloseTimerRef.current) window.clearTimeout(toastCloseTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false)
      toastCloseTimerRef.current = window.setTimeout(() => {
        setToastMode(null)
        toastCloseTimerRef.current = null
      }, 260)
      toastTimerRef.current = null
    }, 1800)
  }, [])

  useEffect(() => {
    if (!copyMenuRendered) return

    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && menuRef.current?.contains(target)) return
      closeCopyMenu()
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCopyMenu()
    }

    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [closeCopyMenu, copyMenuRendered])

  useEffect(() => {
    return () => {
      if (menuCloseTimerRef.current) window.clearTimeout(menuCloseTimerRef.current)
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
      if (toastCloseTimerRef.current) window.clearTimeout(toastCloseTimerRef.current)
    }
  }, [])

  const toggleCopyMenu = () => {
    if (copyMenuOpen) {
      closeCopyMenu()
    } else {
      openCopyMenu()
    }
  }

  const chooseCopyMode = async (mode: CopyMode) => {
    closeCopyMenu()
    await onCopyRichText(mode)
    showCopyToast(mode)
  }

  return (
    <div className="export-panel">
      <button
        type="button"
        className={pngError ? 'secondary-button error-button' : 'secondary-button'}
        onClick={onDownloadPng}
        disabled={exportingPng}
        aria-busy={exportingPng}
        title={pngError || undefined}
      >
        <ImageDown size={15} />
        导出 PNG
      </button>
      <div ref={menuRef} className="copy-menu">
        <button
          type="button"
          className="primary-button copy-menu-trigger"
          onClick={toggleCopyMenu}
          aria-haspopup="menu"
          aria-expanded={copyMenuOpen}
        >
          {richCopied ? <Check size={15} /> : <Clipboard size={15} />}
          {richCopied ? '已复制' : '一键复制'}
          <ChevronDown size={14} className={copyMenuOpen ? 'copy-chevron open' : 'copy-chevron'} />
        </button>
        {copyMenuRendered && (
          <div
            className={copyMenuOpen ? 'copy-menu-popover open' : 'copy-menu-popover closing'}
            role="menu"
            aria-label="复制方式"
          >
            <button type="button" role="menuitem" onClick={() => void chooseCopyMode('text-style')}>
              <span className="copy-option-icon text">
                <FileText size={15} />
              </span>
              <span>
                <b>只复制文本样式</b>
                <small>保留排版文字，不带图片元素</small>
              </span>
            </button>
            <button type="button" role="menuitem" onClick={() => void chooseCopyMode('global-style')}>
              <span className="copy-option-icon global">
                <Layers3 size={15} />
              </span>
              <span>
                <b>复制全局样式</b>
                <small>文本、图片和模板一起复制</small>
              </span>
            </button>
          </div>
        )}
      </div>
      {toastMode &&
        createPortal(
          <div className={toastVisible ? 'copy-toast visible' : 'copy-toast'} role="status" aria-live="polite">
            <span className="copy-toast-icon">
              <Check size={16} />
            </span>
            <span>
              <b>{copyModeLabels[toastMode]}</b>
              <small>复制成功，可以粘贴到公众号编辑器了</small>
            </span>
          </div>,
          document.body,
        )}
    </div>
  )
}
