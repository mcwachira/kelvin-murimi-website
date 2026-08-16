import { X, Plus } from 'lucide-react'
import type { PortableTextBlock } from '@/lib/sanity/types'
import { plainTextToBlocks, blocksToPlainText } from '@/lib/sanity/portable-text.ts'
import {useState} from "react";
import {uploadImage} from "#/lib/sanity/mutations.functions.ts";

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

export function BodyImageInserter({
                                    onInsert,
                                  }: {
  onInsert: (block: { _type: 'image'; _key: string; asset: { _type: 'reference'; _ref: string }; alt: string }) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!alt.trim()) {
      setError('Add alt text before uploading')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await uploadImage({ data: form })
      onInsert({
        _type: 'image',
        _key: `img-${Math.random().toString(36).slice(2, 10)}`,
        asset: { _type: 'reference', _ref: res.assetId },
        alt,
      })
      setAlt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }
  return (
      <div className="cover-upload">
        <input placeholder="Alt text (required)" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <input type="file" accept="image/*" disabled={busy} onChange={(e) => handleFile(e.target.files?.[0])} />
        {busy && <p className="muted">Uploading…</p>}
        {error && <p className="form-status">{error}</p>}
      </div>
  )
}