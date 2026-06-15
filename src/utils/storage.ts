import type { StyleConfig } from '../types/style'
import type { TemplateId } from '../types/template'

const key = 'flipped-editor-state'

export type PersistedState = {
  markdown: string
  selectedTemplate: TemplateId
  styleConfig: StyleConfig
}

export const loadState = (): Partial<PersistedState> => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export const saveState = (state: PersistedState) => {
  localStorage.setItem(key, JSON.stringify(state))
}
