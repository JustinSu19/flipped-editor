import type { StyleConfig } from '../types/style'
import type { TemplateId } from '../types/template'

const key = 'flipped-editor-state'
const schemaVersion = 2

export type PersistedState = {
  version?: number
  markdown: string
  selectedTemplate: TemplateId
  styleConfig: StyleConfig
}

export const loadState = (): Partial<PersistedState> => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (!parsed.version && parsed.styleConfig?.fontSize === 12) {
      return {
        ...parsed,
        styleConfig: {
          ...parsed.styleConfig,
          fontSize: 14,
        },
      }
    }
    return parsed
  } catch {
    return {}
  }
}

export const saveState = (state: PersistedState) => {
  localStorage.setItem(key, JSON.stringify({ ...state, version: schemaVersion }))
}
