import type { StyleConfig } from '../types/style'
import type { TemplateId } from '../types/template'

const key = 'flipped-editor-state'
const schemaVersion = 3

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
    const styleConfig = parsed.styleConfig
      ? {
          ...parsed.styleConfig,
          pageMargin:
            parsed.styleConfig.pageMargin === undefined || parsed.styleConfig.pageMargin === 22
              ? 43
              : parsed.styleConfig.pageMargin,
        }
      : parsed.styleConfig
    if (!parsed.version && parsed.styleConfig?.fontSize === 12) {
      return {
        ...parsed,
        styleConfig: {
          ...styleConfig,
          fontSize: 14,
        } as StyleConfig,
      }
    }
    return {
      ...parsed,
      styleConfig,
    }
  } catch {
    return {}
  }
}

export const saveState = (state: PersistedState) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ...state, version: schemaVersion }))
  } catch (error) {
    console.warn('Flipped Editor could not save the local draft.', error)
  }
}
