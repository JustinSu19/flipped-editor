import type { TemplateId } from '../types/template'
import { templateRegistry } from '../templates/templateRegistry'

type Props = {
  selected: TemplateId
  onChange: (id: TemplateId) => void
}

const coverClassByIndex = ['nature', 'essay', 'poetic', 'chapter']

export function TemplateSelector({ selected, onChange }: Props) {
  return (
    <section className="control-section">
      <div className="section-title">
        <span>模板选择</span>
      </div>
      <div className="template-list">
        {templateRegistry.map((template, index) => (
          <button
            key={template.id}
            type="button"
            className={selected === template.id ? 'template-card selected' : 'template-card'}
            onClick={() => onChange(template.id)}
          >
            <div className={`template-cover ${coverClassByIndex[index]}`} aria-hidden="true">
              <b>{String(index + 1).padStart(2, '0')}</b>
              <div className="cover-title" />
              <div className="cover-subtitle" />
              <div className="cover-media" />
              <div className="cover-line" />
              <div className="cover-line short" />
            </div>
            <span>{template.name}</span>
            <small>{template.description}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
