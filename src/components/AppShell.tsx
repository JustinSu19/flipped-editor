import type { ReactNode } from 'react'
import { Toolbar } from './Toolbar'

type Props = {
  editor: ReactNode
  preview: ReactNode
  inspector: ReactNode
  toolbarActions: ReactNode
  onFullscreen: () => void
}

export function AppShell({ editor, preview, inspector, toolbarActions, onFullscreen }: Props) {
  return (
    <main className="app-shell">
      <Toolbar actions={toolbarActions} onFullscreen={onFullscreen} />
      <div className="workspace">
        <aside className="editor-panel">{editor}</aside>
        {preview}
        <aside className="inspector-panel">{inspector}</aside>
      </div>
    </main>
  )
}
