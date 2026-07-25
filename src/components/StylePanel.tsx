import { AlignCenter, AlignLeft, AlignRight, Info } from 'lucide-react'
import type { PreviewMode } from './PreviewPanel'
import type { StyleConfig } from '../types/style'

type Props = {
  value: StyleConfig
  previewMode: PreviewMode
  onChange: (value: StyleConfig) => void
  onReset: () => void
}

const update = <K extends keyof StyleConfig>(config: StyleConfig, key: K, value: StyleConfig[K]) => ({
  ...config,
  [key]: value,
})

const numberValue = (value: number, suffix = '') => `${Number.isInteger(value) ? value : value.toFixed(2)}${suffix}`

const whitespacePresets: Record<
  StyleConfig['whitespaceLevel'],
  Pick<StyleConfig, 'lineHeight' | 'paragraphSpacing' | 'sectionSpacing'>
> = {
  compact: {
    lineHeight: 1.75,
    paragraphSpacing: 15,
    sectionSpacing: 52,
  },
  balanced: {
    lineHeight: 1.9,
    paragraphSpacing: 20,
    sectionSpacing: 68,
  },
  airy: {
    lineHeight: 2.1,
    paragraphSpacing: 28,
    sectionSpacing: 88,
  },
}

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
    name: 'White',
    color: '#ffffff',
    value: {
      backgroundColor: '#f6f6f4',
      paperColor: '#ffffff',
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
  const minimumPageMargin = previewMode === 'wechat' ? 22 : 16
  const visiblePageMargin =
    previewMode === 'wechat' ? Math.max(minimumPageMargin, value.wechatPageMargin) : value.pageMargin
  const applyWhitespacePreset = (level: StyleConfig['whitespaceLevel']) => {
    onChange({
      ...value,
      whitespaceLevel: level,
      ...whitespacePresets[level],
    })
  }

  return (
    <section className="control-section">
      <div className="section-title">
        <span>样式设置</span>
        <button type="button" className="reset-style-button" onClick={onReset}>
          恢复默认
        </button>
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
            onChange={(event) => applyWhitespacePreset(event.target.value as StyleConfig['whitespaceLevel'])}
          >
            <option value="compact">Compact</option>
            <option value="balanced">Balanced</option>
            <option value="airy">Airy</option>
          </select>
        </label>
      </div>
      <div className="alignment-field">
        <span>对齐方式</span>
        <div className="alignment-control" role="group" aria-label="正文与引用对齐方式">
          {[
            { value: 'left', label: '左对齐', Icon: AlignLeft },
            { value: 'center', label: '居中', Icon: AlignCenter },
            { value: 'right', label: '右对齐', Icon: AlignRight },
          ].map(({ value: alignment, label, Icon }) => (
            <button
              key={alignment}
              type="button"
              className={value.textAlign === alignment ? 'active' : ''}
              aria-pressed={value.textAlign === alignment}
              onClick={() => onChange(update(value, 'textAlign', alignment as StyleConfig['textAlign']))}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="style-controls-divider" />
      <div className="field-grid slider-grid">
        <label>
          <span>
            <span className="field-title-with-tip">
              页边距
              <span className="field-tooltip">
                <Info size={12} />
                <span role="tooltip">
                  公众号视角为保证阅读安全边距，最小值为 22px；可以继续向右增大留白。
                </span>
              </span>
            </span>
            <b>{numberValue(visiblePageMargin, 'px')}</b>
          </span>
          <input
            type="range"
            min={minimumPageMargin}
            max="56"
            value={visiblePageMargin}
            onChange={(event) =>
              onChange(
                update(
                  value,
                  previewMode === 'wechat' ? 'wechatPageMargin' : 'pageMargin',
                  Number(event.target.value),
                ),
              )
            }
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
    </section>
  )
}
