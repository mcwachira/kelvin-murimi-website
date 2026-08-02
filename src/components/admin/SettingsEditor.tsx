import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { saveSettings } from '../../lib/sanity/mutations.functions'
import { Field, TextInput, TextArea } from './fields'
import type { SiteSettingsInput } from '../../lib/validations'

type StatusStat = { label?: string; value?: string; barLevel?: number }

export default function SettingsEditor({
  doc,
  isDraft,
}: {
  doc: Record<string, unknown> | null
  isDraft: boolean
}) {
  const [state, setState] = useState<Record<string, unknown>>({})
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    setState({ ...(doc ?? {}) })
    setStatus(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc])

  const set = (path: string) => (value: unknown) =>
    setState((prev) => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let cursor: Record<string, unknown> = next
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (typeof cursor[key] !== 'object' || cursor[key] === null) cursor[key] = {}
        cursor = cursor[key] as Record<string, unknown>
      }
      cursor[keys[keys.length - 1]] = value
      return next
    })

  const str = (path: string) => {
    const value = state[path]
    return value === undefined || value === null ? '' : String(value)
  }
  const nested = (path: string) => state[path] as Record<string, unknown> | undefined
  const stats: StatusStat[] = (nested('statusBoard')?.stats as StatusStat[] | undefined) ?? []

  const mutation = useMutation({
    mutationFn: ({ publish }: { publish: boolean }) => {
      const input = buildSettingsInput(state)
      return saveSettings({ data: { ...input, publish } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin'] })
      setStatus('Saved')
      router.invalidate()
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Save failed')
    },
  })

  const contact = nested('contact')
  const statusBoard = nested('statusBoard')

  return (
    <div className="admin-editor">
      <div className="editor-head">
        <div>
          <h2>Site settings</h2>
          <p className="muted">{isDraft ? 'Draft — private until you publish.' : 'Published.'}</p>
        </div>
        <div className="button-row">
          <button className="button" disabled={mutation.isPending} onClick={() => mutation.mutate({ publish: false })}>
            {mutation.isPending ? 'Saving…' : 'Save draft'}
          </button>
          <button className="button primary" disabled={mutation.isPending} onClick={() => mutation.mutate({ publish: true })}>
            Publish
          </button>
        </div>
      </div>

      {status && <p className="form-status ok">{status} — reloading…</p>}
      {error && <p className="form-status">{error}</p>}

      <div className="admin-form">
        <Field label="Name">
          <TextInput value={str('name')} onChange={set('name')} />
        </Field>
        <Field label="Tagline">
          <TextInput value={str('tagline')} onChange={set('tagline')} />
        </Field>
        <Field label="Hero headline">
          <TextArea value={str('heroHeadline')} onChange={set('heroHeadline')} rows={2} />
        </Field>
        <Field label="Hero subcopy">
          <TextArea value={str('heroSubcopy')} onChange={set('heroSubcopy')} rows={3} />
        </Field>
        <Field label="Location">
          <TextInput value={str('location')} onChange={set('location')} />
        </Field>
        <Field label="Availability">
          <TextInput value={str('availability')} onChange={set('availability')} />
        </Field>

        <h3 className="admin-section-title">Status board</h3>
        <Field label="Label">
          <TextInput
            value={(statusBoard?.label as string | undefined) ?? ''}
            onChange={set('statusBoard.label')}
          />
        </Field>
        <Field label="Status text">
          <TextInput
            value={(statusBoard?.statusText as string | undefined) ?? ''}
            onChange={set('statusBoard.statusText')}
          />
        </Field>
        <Field label="Stats">
          <div className="list-editor">
            {stats.map((stat, i) => (
              <div key={i} className="list-item stat-row">
                <input
                  placeholder="Label"
                  value={stat.label ?? ''}
                  onChange={(e) => setStats(i, { ...stat, label: e.target.value })}
                />
                <input
                  placeholder="Value"
                  value={stat.value ?? ''}
                  onChange={(e) => setStats(i, { ...stat, value: e.target.value })}
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  placeholder="Level 1–5"
                  value={stat.barLevel ?? ''}
                  onChange={(e) =>
                    setStats(i, { ...stat, barLevel: e.target.value === '' ? undefined : Number(e.target.value) })
                  }
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Remove stat"
                  onClick={() => setStats(i, undefined)}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="secondary add-item" onClick={() => setStats(stats.length, {})}>
              + Add stat
            </button>
          </div>
        </Field>

        <h3 className="admin-section-title">Contact</h3>
        <Field label="Email">
          <TextInput
            value={(contact?.email as string | undefined) ?? ''}
            onChange={set('contact.email')}
          />
        </Field>
        <Field label="Phone">
          <TextInput
            value={(contact?.phone as string | undefined) ?? ''}
            onChange={set('contact.phone')}
          />
        </Field>
        <Field label="LinkedIn URL">
          <TextInput
            value={(contact?.linkedinUrl as string | undefined) ?? ''}
            onChange={set('contact.linkedinUrl')}
          />
        </Field>

        <h3 className="admin-section-title">SEO</h3>
        <Field label="Meta title">
          <TextInput
            value={(nested('seo')?.metaTitle as string | undefined) ?? ''}
            onChange={set('seo.metaTitle')}
          />
        </Field>
        <Field label="Meta description">
          <TextArea
            value={(nested('seo')?.metaDescription as string | undefined) ?? ''}
            onChange={set('seo.metaDescription')}
            rows={2}
          />
        </Field>
      </div>
    </div>
  )

  function setStats(index: number, stat: StatusStat | undefined) {
    setState((prev) => {
      const next = structuredClone(prev)
      const board = (next.statusBoard as Record<string, unknown> | undefined) ?? {}
      const list = (board.stats as StatusStat[] | undefined) ?? [...stats]
      if (stat === undefined) {
        list.splice(index, 1)
      } else {
        list[index] = stat
      }
      board.stats = list
      next.statusBoard = board
      return next
    })
  }
}

function buildSettingsInput(state: Record<string, unknown>): SiteSettingsInput {
  const contact = state.contact as Record<string, unknown> | undefined
  return {
    name: strOrUndef(state.name),
    tagline: strOrUndef(state.tagline),
    heroHeadline: strOrUndef(state.heroHeadline),
    heroSubcopy: strOrUndef(state.heroSubcopy),
    location: strOrUndef(state.location),
    availability: strOrUndef(state.availability),
    statusBoard: {
      label: strOrUndef((state.statusBoard as Record<string, unknown>)?.label),
      statusText: strOrUndef((state.statusBoard as Record<string, unknown>)?.statusText),
      stats: ((state.statusBoard as Record<string, unknown>)?.stats as StatusStat[] | undefined)?.filter(
        (s) => s.label?.trim() || s.value?.trim(),
      ),
    },
    contact: {
      email: (contact?.email as string | undefined) ?? '',
      phone: strOrUndef(contact?.phone),
      linkedinUrl: strOrUndef(contact?.linkedinUrl),
    },
    seo: {
      metaTitle: strOrUndef((state.seo as Record<string, unknown> | undefined)?.metaTitle),
      metaDescription: strOrUndef(
        (state.seo as Record<string, unknown> | undefined)?.metaDescription,
      ),
    },
  }
}

function strOrUndef(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined
  const s = String(v).trim()
  return s === '' ? undefined : s
}
