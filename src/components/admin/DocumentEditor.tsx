import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { saveContentDocument, uploadImage } from '@/lib/sanity/mutations.functions'
import { slugify } from '@/lib/slugify'
import { Field, TextInput, TextArea, Toggle, ListEditor, BlockTextarea, BodyImageInserter } from './fields'
import type { CaseStudyInput, ContentDocumentInput } from '@/lib/validations'
import { blocksToPlainText, plainTextToBlocks } from '@/lib/sanity/portable-text'
import type { PortableTextBlock, PortableTextItem } from '@/lib/sanity/types'

export type EditorType = 'caseStudy' | 'post' | 'experience' | 'education' | 'language' | 'skillCategory' | 'capability'

type State = Record<string, unknown>

function coverRefFrom(doc: Record<string, unknown> | null): string {
  const img = doc?.coverImage as { asset?: { _ref?: string } } | undefined
  return img?.asset?._ref ?? ''
}

export default function DocumentEditor({
                                         type,
                                         id,
                                         doc,
                                         isDraft,
                                       }: {
  type: EditorType
  id: string
  doc: Record<string, unknown> | null
  isDraft: boolean
}) {
  const [state, setState] = useState<State>({})
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    const base = { ...(doc ?? {}) }
    if (base.slug && typeof base.slug === 'object' && !Array.isArray(base.slug)) {
      base.slug = (base.slug as { current?: string }).current ?? ''
    }
    if (base.dashboardMock && typeof base.dashboardMock === 'object' && base.dashboardMockJson === undefined) {
      try {
        base.dashboardMockJson = JSON.stringify(base.dashboardMock)
      } catch {
        // Non-serializable mock — leave the field empty.
      }
    }
    const seo = base.seo as { metaTitle?: string; metaDescription?: string } | undefined
    if (base.metaDescription === undefined && seo?.metaDescription) {
      base.metaDescription = seo.metaDescription
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing form state from an async-loaded `doc` prop; safe, not render-derived
    setState(base)
    setStatus(null)
    setError(null)
  }, [doc])

  const set = (key: string) => (value: unknown) => setState((prev) => ({ ...prev, [key]: value }))
  const str = (key: string) => (state[key] as string | undefined) ?? ''
  const bool = (key: string) => Boolean(state[key])
  const list = (key: string) => ((state[key] as string[] | undefined) ?? []).map(String)
  const blocks = (key: string) => (state[key] as PortableTextBlock[] | undefined) ?? []
  const bodyItems = (state.body as PortableTextItem[] | undefined) ?? []

  const mutation = useMutation({
    mutationFn: ({ publish }: { publish: boolean }) => {
      const input = buildInput(type, state)
      return saveContentDocument({
        data: {
          id: id === 'new' ? undefined : id,
          publish,
          data: { type, data: input } as ContentDocumentInput,
        },
      })
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

  const title = str('title') || str('name') || str('degree')

  return (
      <div className="admin-editor">
        <div className="editor-head">
          <div>
            <h2>{id === 'new' ? `New ${typeLabel(type)}` : title || 'Untitled'}</h2>
            {id !== 'new' && (
                <p className="muted">
                  {isDraft ? 'Draft — private until you publish.' : 'Published.'}
                </p>
            )}
          </div>
          <div className="button-row">
            <button
                className="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ publish: false })}
            >
              {mutation.isPending ? 'Saving…' : 'Save draft'}
            </button>
            <button
                className="button primary"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ publish: true })}
            >
              Publish
            </button>
          </div>
        </div>

        {status && <p className="form-status ok">{status} — reloading…</p>}
        {error && <p className="form-status">{error}</p>}

        <div className="admin-form">
          <Field label="Title">
            <TextInput
                value={title}
                onChange={set('title')}
                placeholder={`${typeLabel(type)} title`}
            />
          </Field>

          {(type === 'post' || type === 'caseStudy') && (
              <Field label="Slug" hint="URL path — auto-fills from title on blur">
                <TextInput
                    value={str('slug')}
                    onChange={set('slug')}
                    onBlur={() => {
                      if (!str('slug')) set('slug')(slugify(title))
                    }}
                    placeholder={slugify(title) || 'url-slug'}
                />
              </Field>
          )}

          {type === 'education' && (
              <div className="field-grid">
                <Field label="Degree">
                  <TextInput value={str('degree')} onChange={set('degree')} />
                </Field>
                <Field label="Institution">
                  <TextInput value={str('institution')} onChange={set('institution')} />
                </Field>
              </div>
          )}

          {type === 'language' && (
              <div className="field-grid">
                <Field label="Language">
                  <TextInput value={str('name')} onChange={set('name')} />
                </Field>
                <Field label="Level" hint='e.g. "Fluent", "Native"'>
                  <TextInput value={str('level')} onChange={set('level')} />
                </Field>
              </div>
          )}

          {type === 'caseStudy' && (
              <>
                <div className="field-grid">
                  <Field label="Case number">
                    <TextInput
                        value={String(state['caseNumber'] ?? '')}
                        onChange={(v) => set('caseNumber')(v === '' ? undefined : Number(v))}
                        placeholder="1"
                    />
                  </Field>
                  <Field label="Year">
                    <TextInput value={str('year')} onChange={set('year')} placeholder="2024" />
                  </Field>
                  <Field label="Organization">
                    <TextInput value={str('organization')} onChange={set('organization')} />
                  </Field>
                </div>
                <Field label="Summary">
                  <TextArea value={str('summary')} onChange={set('summary')} rows={3} />
                </Field>
                <Toggle
                    label="Include the sample dashboard mock"
                    checked={bool('hasSampleDashboard')}
                    onChange={set('hasSampleDashboard')}
                />
              </>
          )}

          {type === 'post' && (
              <>
                <Field label="Excerpt">
                  <TextArea value={str('excerpt')} onChange={set('excerpt')} rows={3} />
                </Field>
                <Field label="Published at" hint="When the post becomes public. Leave blank to publish immediately.">
                  <input
                      type="datetime-local"
                      value={toLocalInput(str('publishedAt'))}
                      onChange={(e) => set('publishedAt')(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  />
                </Field>
                <Field label="Cover image" hint="PNG/JPG/WebP, up to 8 MB">
                  <CoverImageUpload value={coverRefFrom(doc)} onChange={(ref) => set('coverImage')(ref ? { _type: 'image', asset: { _type: 'reference', _ref: ref } } : null)} />
                </Field>
              </>
          )}

          {type === 'experience' && (
              <>
                <div className="field-grid">
                  <Field label="Organization">
                    <TextInput value={str('organization')} onChange={set('organization')} />
                  </Field>
                  <Field label="Start date">
                    <TextInput value={str('startDate') ?? ''} onChange={set('startDate')} placeholder="2021-06" />
                  </Field>
                  <Field label="End date">
                    <TextInput value={str('endDate') ?? ''} onChange={set('endDate')} placeholder="2024-06" />
                  </Field>
                  <Field label=" " hint="Leave blank if current">
                    <Toggle label="Current role" checked={bool('isCurrent')} onChange={set('isCurrent')} />
                  </Field>
                </div>
                <ListEditor label="Highlights" values={list('bullets')} onChange={set('bullets')} />
              </>
          )}

          {type === 'skillCategory' && (
              <ListEditor label="Skills" values={list('skills')} onChange={set('skills')} />
          )}

          {type === 'capability' && (
              <Field label="Description">
                <TextArea value={str('description')} onChange={set('description')} rows={3} />
              </Field>
          )}

          {(type === 'caseStudy' || type === 'post') && (
              <ListEditor label="Tags" values={list('tags')} onChange={set('tags')} />
          )}

          {type === 'caseStudy' && (
              <>
                <BlockTextarea label="Approach" value={blocks('approach')} onChange={set('approach')} />
                <BlockTextarea label="Analysis" value={blocks('analysis')} onChange={set('analysis')} />
                <BlockTextarea label="Outcome" value={blocks('outcome')} onChange={set('outcome')} />
                <Field label="Dashboard mock (JSON)" hint="Optional sample metrics shown on the case study page">
                  <TextArea
                      value={str('dashboardMockJson')}
                      onChange={set('dashboardMockJson')}
                      rows={5}
                      placeholder={'{"quarterlyOutputData":[{"label":"Q1","value":18}],"coveragePercent":87,"kpis":[]}'}
                  />
                </Field>
              </>
          )}

          {type === 'post' && (
              <>
                <Field label="Body" hint="Blank line = paragraph · ## heading · - bullet · > quote">
              <textarea
                  value={blocksToPlainText(bodyItems.filter((b): b is PortableTextBlock => b._type === 'block'))}
                  onChange={(e) => {
                    const images = bodyItems.filter((b) => b._type !== 'block')
                    set('body')([...plainTextToBlocks(e.target.value), ...images])
                  }}
                  rows={12}
              />
                </Field>
                <Field label="Body images" hint="Appended to the end of the post">
                  <BodyImageInserter
                      onInsert={(block) => set('body')([...bodyItems, block])}
                  />
                  {bodyItems.filter((b) => b._type === 'image').length > 0 && (
                      <div className="list-editor">
                        {bodyItems.filter((b) => b._type === 'image').map((img) => (
                            <div key={img._key as string} className="list-item">
                              <span>{(img as { alt?: string }).alt || '(no alt text)'}</span>
                              <button
                                  type="button"
                                  className="icon-button"
                                  aria-label="Remove image"
                                  onClick={() => set('body')(bodyItems.filter((b) => b._key !== img._key))}
                              >
                                ×
                              </button>
                            </div>
                        ))}
                      </div>
                  )}
                </Field>
                <Field label="Meta description">
                  <TextArea value={str('metaDescription')} onChange={set('metaDescription')} rows={2} />
                </Field>
              </>
          )}

          <Field label="Order" hint="Lower numbers sort first">
            <TextInput
                value={String(state['order'] ?? '')}
                onChange={(v) => set('order')(v === '' ? undefined : Number(v))}
            />
          </Field>
        </div>
      </div>
  )
}

function CoverImageUpload({ value, onChange }: { value: string; onChange: (ref: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await uploadImage({ data: form })
      onChange(res.assetId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
      <div className="cover-upload">
        {value && <p className="muted">Asset: {value}</p>}
        <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {busy && <p className="muted">Uploading…</p>}
        {error && <p className="form-status">{error}</p>}
        {value && (
            <button type="button" className="secondary" onClick={() => onChange('')}>
              Remove image
            </button>
        )}
      </div>
  )
}

function typeLabel(type: EditorType): string {
  switch (type) {
    case 'caseStudy':
      return 'case study'
    case 'post':
      return 'post'
    case 'experience':
      return 'role'
    case 'education':
      return 'education entry'
    case 'language':
      return 'language'
    case 'skillCategory':
      return 'skill group'
    case 'capability':
      return 'capability'
  }
}

function buildInput(type: EditorType, state: State): ContentDocumentInput['data'] {
  const base = {
    title: String(state.title ?? ''),
    slug: strOrUndef(state.slug),
    order: numOrUndef(state.order),
  }
  switch (type) {
    case 'caseStudy': {
      let dashboardMock: unknown
      if (typeof state.dashboardMockJson === 'string' && state.dashboardMockJson.trim()) {
        try {
          dashboardMock = JSON.parse(state.dashboardMockJson) as CaseStudyInput['dashboardMock']
        } catch {
          dashboardMock = undefined
        }
      }
      return {
        ...base,
        caseNumber: numOrUndef(state.caseNumber),
        year: strOrUndef(state.year),
        organization: strOrUndef(state.organization),
        tags: listOrUndef(state.tags),
        summary: strOrUndef(state.summary),
        approach: (state.approach as PortableTextBlock[] | undefined) ?? [],
        analysis: (state.analysis as PortableTextBlock[] | undefined) ?? [],
        outcome: (state.outcome as PortableTextBlock[] | undefined) ?? [],
        hasSampleDashboard: Boolean(state.hasSampleDashboard),
        dashboardMock: dashboardMock as CaseStudyInput['dashboardMock'],
      }
    }
    case 'post':
      return {
        ...base,
        excerpt: strOrUndef(state.excerpt),
        coverImage: (state.coverImage as
            | { _type?: string; asset?: { _type?: string; _ref?: string } }
            | null
            | undefined),
        body: (state.body as PortableTextItem[] | undefined) ?? [],
        tags: listOrUndef(state.tags),
        publishedAt: strOrUndef(state.publishedAt),
        seo: {
          metaTitle: strOrUndef(state.title),
          metaDescription: strOrUndef(state.metaDescription),
        },
      }
    case 'experience':
      return {
        ...base,
        organization: strOrUndef(state.organization),
        startDate: strOrUndef(state.startDate),
        endDate: strOrUndef(state.endDate),
        isCurrent: Boolean(state.isCurrent),
        bullets: listOrUndef(state.bullets),
      }
    case 'education':
      return {
        degree: String(state.degree ?? ''),
        institution: strOrUndef(state.institution),
        order: numOrUndef(state.order),
      }
    case 'language':
      return {
        name: String(state.name ?? ''),
        level: strOrUndef(state.level),
        order: numOrUndef(state.order),
      }
    case 'skillCategory':
      return { title: String(state.title ?? ''), order: numOrUndef(state.order), skills: listOrUndef(state.skills) }
    case 'capability':
      return {
        ...base,
        description: strOrUndef(state.description),
      }
  }
}

function strOrUndef(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined
  const s = String(v).trim()
  return s === '' ? undefined : s
}

function numOrUndef(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  return undefined
}

function listOrUndef(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const cleaned = v.map(String).filter((s) => s.trim() !== '')
  return cleaned.length ? cleaned : undefined
}

/** Convert an ISO timestamp to a `datetime-local` input value (local time). */
function toLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}