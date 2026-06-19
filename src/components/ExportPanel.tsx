import { Check, Clipboard, ImageDown } from 'lucide-react'

type Props = {
  richCopied: boolean
  exportingPng: boolean
  pngError?: string
  onCopyRichText: () => void
  onDownloadPng: () => void
}

export function ExportPanel({ richCopied, exportingPng, pngError, onCopyRichText, onDownloadPng }: Props) {
  return (
    <div className="export-panel">
      <button type="button" className="primary-button" onClick={onCopyRichText}>
        {richCopied ? <Check size={15} /> : <Clipboard size={15} />}
        {richCopied ? '已复制' : '一键复制'}
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
