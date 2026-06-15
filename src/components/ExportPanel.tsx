import { Check, Clipboard, Download, ImageDown } from 'lucide-react'

type Props = {
  copied: boolean
  exportingPng: boolean
  pngError?: string
  onCopyHtml: () => void
  onDownloadHtml: () => void
  onDownloadPng: () => void
}

export function ExportPanel({ copied, exportingPng, pngError, onCopyHtml, onDownloadHtml, onDownloadPng }: Props) {
  return (
    <div className="export-panel">
      <button type="button" className="primary-button" onClick={onCopyHtml}>
        {copied ? <Check size={15} /> : <Clipboard size={15} />}
        {copied ? '已复制' : '复制到剪贴板'}
      </button>
      <button type="button" className="secondary-button" onClick={onDownloadHtml}>
        <Download size={15} />
        导出 HTML
      </button>
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
    </div>
  )
}
