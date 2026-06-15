import { Clock, Maximize2 } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  actions: ReactNode
  onFullscreen: () => void
}

export function Toolbar({ actions, onFullscreen }: Props) {
  return (
    <header className="app-toolbar">
      <div className="window-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="toolbar-brand">
        <span className="brand-mark">
          <img src="/favicon.svg" alt="" />
        </span>
        <div className="brand-row">
          <h1>Flipped Editor</h1>
          <p>Markdown to WeChat Magazine Editor</p>
        </div>
      </div>
      <div className="toolbar-actions">
        <div className="toolbar-status">
          <Clock size={14} />
          <span>文档已保存</span>
        </div>
        {actions}
        <button type="button" className="toolbar-button" onClick={onFullscreen}>
          <Maximize2 size={15} />
          全屏预览
        </button>
      </div>
    </header>
  )
}
