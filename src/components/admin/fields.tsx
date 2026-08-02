import { X, Plus } from 'lucide-react'
import type { PortableTextBlock } from '../../lib/sanity/types'
import { plainTextToBlocks, blocksToPlainText } from '../../lib/sanity/portable-text'

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="admin-field">
      <span>
        {label}
        {hint && <small className="muted"> {hint}</small>}
      </span>
      {children}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  onBlur,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onBlur?: () => void
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onBlur={onBlur}
    />
  )
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} />
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="admin-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

export function ListEditor({
  label,
  values,
  onChange,
  placeholder = 'Add an item…',
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  return (
    <Field label={label}>
      <div className="list-editor">
        {values.map((item, i) => (
          <div key={i} className="list-item">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...values]
                next[i] = e.target.value
                onChange(next)
              }}
            />
            <button
              type="button"
              className="icon-button"
              aria-label={`Remove ${label} item`}
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="secondary add-item"
          onClick={() => onChange([...values, ''])}
        >
          <Plus size={14} /> Add item
        </button>
      </div>
    </Field>
  )
}

/**
 * Plain-text editing surface for Portable Text. Conventions are documented
 * in `plainTextToBlocks` (blank lines, `## ` headings, `- ` bullets, `> ` quotes).
 */
export function BlockTextarea({
  label,
  value,
  onChange,
  rows = 8,
}: {
  label: string
  value: PortableTextBlock[] | undefined
  onChange: (blocks: PortableTextBlock[]) => void
  rows?: number
}) {
  return (
    <Field label={label} hint="Blank line = paragraph · ## heading · - bullet · > quote">
      <textarea
        value={blocksToPlainText(value)}
        onChange={(e) => onChange(plainTextToBlocks(e.target.value))}
        rows={rows}
      />
    </Field>
  )
}
