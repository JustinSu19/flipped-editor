import type { StyleConfig } from '../types/style'

type Props = {
  value: StyleConfig
  onChange: (value: StyleConfig) => void
  onReset: () => void
}

const update = <K extends keyof StyleConfig>(config: StyleConfig, key: K, value: StyleConfig[K]) => ({
  ...config,
  [key]: value,
})

const numberValue = (value: number, suffix = '') => `${Number.isInteger(value) ? value : value.toFixed(2)}${suffix}`

export function StylePanel({ value, onChange, onReset }: Props) {
  return (
    <section className="control-section">
      <div className="section-title">
        <span>样式设置</span>
        <button type="button" className="reset-style-button" onClick={onReset}>
          恢复默认
        </button>
      </div>
      <div className="field-grid slider-grid">
        <label>
          <span>
            文章宽度 <b>{numberValue(value.articleWidth, 'px')}</b>
          </span>
          <input type="range" min="360" max="430" value={value.articleWidth} onChange={(e) => onChange(update(value, 'articleWidth', Number(e.target.value)))} />
        </label>
        <label>
          <span>
            正文字号 <b>{numberValue(value.fontSize, 'px')}</b>
          </span>
          <input type="range" min="12" max="18" value={value.fontSize} onChange={(e) => onChange(update(value, 'fontSize', Number(e.target.value)))} />
        </label>
        <label>
          <span>
            行距 <b>{numberValue(value.lineHeight)}</b>
          </span>
          <input type="range" min="1.7" max="2.3" step="0.05" value={value.lineHeight} onChange={(e) => onChange(update(value, 'lineHeight', Number(e.target.value)))} />
        </label>
        <label>
          <span>
            段落间距 <b>{numberValue(value.paragraphSpacing, 'px')}</b>
          </span>
          <input type="range" min="14" max="36" value={value.paragraphSpacing} onChange={(e) => onChange(update(value, 'paragraphSpacing', Number(e.target.value)))} />
        </label>
        <label>
          <span>
            章节间距 <b>{numberValue(value.sectionSpacing, 'px')}</b>
          </span>
          <input type="range" min="48" max="104" value={value.sectionSpacing} onChange={(e) => onChange(update(value, 'sectionSpacing', Number(e.target.value)))} />
        </label>
        <label>
          <span>
            图片圆角 <b>{numberValue(value.imageRadius, 'px')}</b>
          </span>
          <input type="range" min="0" max="28" value={value.imageRadius} onChange={(e) => onChange(update(value, 'imageRadius', Number(e.target.value)))} />
        </label>
        <label>
          <span>
            图片滤镜 <b>{Math.round(value.imageFilterStrength * 100)}%</b>
          </span>
          <input type="range" min="0" max="1" step="0.05" value={value.imageFilterStrength} onChange={(e) => onChange(update(value, 'imageFilterStrength', Number(e.target.value)))} />
        </label>
      </div>
      <div className="field-grid select-grid">
        <label>
          <span>纸张字体</span>
          <select value={value.fontFamily} onChange={(e) => onChange(update(value, 'fontFamily', e.target.value as StyleConfig['fontFamily']))}>
            <option value="songti">Songti</option>
            <option value="fangsong">Fangsong</option>
            <option value="serif">Serif</option>
          </select>
        </label>
        <label>
          <span>留白</span>
          <select value={value.whitespaceLevel} onChange={(e) => onChange(update(value, 'whitespaceLevel', e.target.value as StyleConfig['whitespaceLevel']))}>
            <option value="compact">Compact</option>
            <option value="balanced">Balanced</option>
            <option value="airy">Airy</option>
          </select>
        </label>
      </div>
      <div className="swatch-row">
        {[
          ['#f7f3e8', 'Paper'],
          ['#f4f0e6', 'Ivory'],
          ['#faf9f5', 'Soft'],
          ['#f5f7f4', 'Mist'],
        ].map(([color, name]) => (
          <button key={color} type="button" onClick={() => onChange(update(value, 'paperColor', color))}>
            <span style={{ background: color }} />
            {name}
          </button>
        ))}
      </div>
    </section>
  )
}
