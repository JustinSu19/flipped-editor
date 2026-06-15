import { Feather } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function DecorTextPanel({ value, onChange }: Props) {
  return (
    <section className="control-section decor-text-section">
      <div className="section-title">
        <Feather size={15} />
        <span>刊头小字</span>
        <small>实时预览</small>
      </div>
      <label className="decor-text-field">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="例如：知古青年/ ZhiGu QingNian"
          maxLength={48}
        />
      </label>
      <div className="decor-text-preview">{value.trim() || '留空则不显示刊头小字'}</div>
    </section>
  )
}
