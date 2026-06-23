import type { PreviewMode } from './PreviewPanel'
import type { StyleConfig } from '../types/style'

type Props = {
  value: StyleConfig
  previewMode: PreviewMode
  onChange: (value: StyleConfig) => void
  onReset: () => void
}

const WECHAT_PAGE_MARGIN = 22

const update = <K extends keyof StyleConfig>(config: StyleConfig, key: K, value: StyleConfig[K]) => ({
  ...config,
  [key]: value,
})

const numberValue = (value: number, suffix = '') => `${Number.isInteger(value) ? value : value.toFixed(2)}${suffix}`

const themes: Array<{
  name: string
  color: string
  value: Pick<StyleConfig, 'backgroundColor' | 'paperColor' | 'textColor' | 'titleColor'>
}> = [
  {
    name: 'Paper',
    color: '#f8f1dc',
    value: {
      backgroundColor: '#f5f5f2',
      paperColor: '#f8f1dc',
      textColor: '#665f50',
      titleColor: '#3f392f',
    },
  },
  {
    name: 'Ivory',
    color: '#f1ead8',
    value: {
      backgroundColor: '#f7f6f1',
      paperColor: '#f1ead8',
      textColor: '#625a4a',
      titleColor: '#3b3429',
    },
  },
  {
    name: 'Soft',
    color: '#fbf8f1',
    value: {
      backgroundColor: '#faf9f5',
      paperColor: '#fbf8f1',
      textColor: '#6a655d',
      titleColor: '#403c36',
    },
  },
  {
    name: 'Mist',
    color: '#edf4ef',
    value: {
      backgroundColor: '#f5f7f4',
      paperColor: '#edf4ef',
      textColor: '#59665d',
      titleColor: '#2f3d34',
    },
  },
  {
    name: 'Ink',
    color: '#26231f',
    value: {
      backgroundColor: '#171614',
      paperColor: '#26231f',
      textColor: '#d7d0c3',
      titleColor: '#f4ead9',
    },
  },
]

export function StylePanel({ value, previewMode, onChange, onReset }: Props) {
  const pageMarginLocked = previewMode === 'wechat'
  const visiblePageMargin = pageMarginLocked ? WECHAT_PAGE_MARGIN : value.pageMargin

  return (
    <section className="control-section">
      <div className="section-title">
        <span>样式设置</span>
        <button type="button" className="reset-style-button" onClick={onReset}>
          恢复默认
        </button>
      </div>
      <div className="field-grid slider-grid">
        <label className={pageMarginLocked ? 'disabled-field' : undefined}>
          <span>
            页边距 <b>{numberValue(visiblePageMargin, 'px')}</b>
          </span>
          <input
            type="range"
            min="16"
            max="56"
            value={visiblePageMargin}
            disabled={pageMarginLocked}
            title={pageMarginLocked ? '公众号视角已按实际阅读宽度固定，切到杂志视角可调整' : undefined}
            onChange={(event) => onChange(update(value, 'pageMargin', Number(event.target.value)))}
          />
        </label>
        <label>
          <span>
            正文字号 <b>{numberValue(value.fontSize, 'px')}</b>
          </span>
          <input
            type="range"
            min="12"
            max="18"
            value={value.fontSize}
            onChange={(event) => onChange(update(value, 'fontSize', Number(event.target.value)))}
          />
        </label>
        <label>
          <span>
            行距 <b>{numberValue(value.lineHeight)}</b>
          </span>
          <input
            type="range"
            min="1.7"
            max="2.3"
            step="0.05"
            value={value.lineHeight}
            onChange={(event) => onChange(update(value, 'lineHeight', Number(event.target.value)))}
          />
        </label>
        <label>
          <span>
            段落间距 <b>{numberValue(value.paragraphSpacing, 'px')}</b>
          </span>
          <input
            type="range"
            min="14"
            max="36"
            value={value.paragraphSpacing}
            onChange={(event) => onChange(update(value, 'paragraphSpacing', Number(event.target.value)))}
          />
        </label>
        <label>
          <span>
            章节间距 <b>{numberValue(value.sectionSpacing, 'px')}</b>
          </span>
          <input
            type="range"
            min="48"
            max="104"
            value={value.sectionSpacing}
            onChange={(event) => onChange(update(value, 'sectionSpacing', Number(event.target.value)))}
          />
        </label>
        <label>
          <span>
            图片圆角 <b>{numberValue(value.imageRadius, 'px')}</b>
          </span>
          <input
            type="range"
            min="0"
            max="28"
            value={value.imageRadius}
            onChange={(event) => onChange(update(value, 'imageRadius', Number(event.target.value)))}
          />
        </label>
      </div>
      <div className="field-grid select-grid">
        <label>
          <span>纸张字体</span>
          <select
            value={value.fontFamily}
            onChange={(event) => onChange(update(value, 'fontFamily', event.target.value as StyleConfig['fontFamily']))}
          >
            <option value="songti">Songti</option>
            <option value="fangsong">Fangsong</option>
            <option value="serif">Serif</option>
            <option value="yahei">微软雅黑</option>
          </select>
        </label>
        <label>
          <span>留白</span>
          <select
            value={value.whitespaceLevel}
            onChange={(event) =>
              onChange(update(value, 'whitespaceLevel', event.target.value as StyleConfig['whitespaceLevel']))
            }
          >
            <option value="compact">Compact</option>
            <option value="balanced">Balanced</option>
            <option value="airy">Airy</option>
          </select>
        </label>
      </div>
      <div className="swatch-row">
        {themes.map((theme) => (
          <button
            key={theme.name}
            type="button"
            className={value.paperColor.toLowerCase() === theme.value.paperColor.toLowerCase() ? 'active' : ''}
            onClick={() => onChange({ ...value, ...theme.value })}
          >
            <span style={{ background: theme.color }} />
            {theme.name}
          </button>
        ))}
      </div>
    </section>
  )
}
