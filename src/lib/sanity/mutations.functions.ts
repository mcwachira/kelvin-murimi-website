import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { adminMiddleware } from '../server/admin-middleware'
import { requireWriteClient, isSanityConfigured } from './client.server'
import {
  contentDocumentSchema,
  siteSettingsSchema,
} from '../validations'
import type { JsonValue } from './types'

const DRAFT_PREFIX = 'drafts.'

const editableTypes = [
    'caseStudy',
    'post',
    'experience',
    'education',
    'language',
    'skillCategory',
    'capability',
] as const

function baseId(id: string): string {
  return id.startsWith(DRAFT_PREFIX) ? id.slice(DRAFT_PREFIX.length) : id
}

function nowIso(): string {
  return new Date().toISOString()
}

export type AdminListEntry = {
  id: string
  type: string
  title: string
  isDraft: boolean
  updatedAt: string | null
  order: number | null
  publishedAt: string | null
  year: string | null
}

export type AdminDocEntry = {
  id: string
  type: string
  isDraft: boolean
  updatedAt: string | null
  publishedAt: string | null
  doc: JsonValue | null
}

async function fetchListForType(
  client: NonNullable<ReturnType<typeof requireWriteClient>>,
  type: string,
): Promise<AdminListEntry[]> {
    const projection = `{
  _id,
  _updatedAt,
  order,
  publishedAt,
  year,
  title,
  name,
  degree
}`
  const [published, drafts] = await Promise.all([
    client.fetch<
      Array<{
        _id: string
        _updatedAt?: string
        order?: number | null
        publishedAt?: string | null
        year?: string | null
        title?: string
        name?: string
          degree?:string
      }>
    >(`*[_type == $type]${projection}`, { type }),
    client.fetch<
      Array<{
        _id: string
        _updatedAt?: string
        order?: number | null
        publishedAt?: string | null
        year?: string | null
        title?: string
        name?: string
          degree?:string
      }>
    >(`*[_type == $type && _id in path("drafts.**")]${projection}`, { type }),
  ])

  const byBase = new Map<string, AdminListEntry>()
  for (const d of published) {
    const id = baseId(d._id)
    byBase.set(id, {
      id,
      type,
      title: d.title ?? d.name ?? d.degree ?? 'Untitled',
      isDraft: false,
      updatedAt: d._updatedAt ?? null,
      order: d.order ?? null,
      publishedAt: d.publishedAt ?? d.year ?? null,
      year: d.year ?? null,
    })
  }
  for (const d of drafts) {
    const id = baseId(d._id)
    byBase.set(id, {
      id,
      type,
      title: d.title ?? d.name ?? d.degree ?? 'Untitled',
      isDraft: true,
      updatedAt: d._updatedAt ?? null,
      order: d.order ?? null,
      publishedAt: byBase.get(id)?.publishedAt ?? null,
      year: d.year ?? byBase.get(id)?.year ?? null,
    })
  }
  return [...byBase.values()].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
}

/**
 * Full document payload for the dashboard editor, draft-aware.
 * Never passes secrets — Sanity content is public once published anyway.
 */
export const getAdminDocument = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .validator(z.object({ type: z.enum(editableTypes), id: z.string().min(1) }))
  .handler(
    async ({ data }): Promise<AdminDocEntry> => {
      if (!isSanityConfigured()) {
        throw new Error('Sanity is not configured in this environment')
      }
      const client = requireWriteClient()
      const id = baseId(data.id)
      const docs = await client.fetch<Array<Record<string, unknown>>>(
        `*[_id in [$publishedId, $draftId]]`,
        { publishedId: id, draftId: `${DRAFT_PREFIX}${id}` },
      )
      const draft = docs.find((d) => String(d._id).startsWith(DRAFT_PREFIX))
      const published = docs.find((d) => !String(d._id).startsWith(DRAFT_PREFIX))
      const chosen = draft ?? published
      return {
        id,
        type: data.type,
        isDraft: Boolean(draft),
        updatedAt: (chosen?._updatedAt as string | undefined) ?? null,
        publishedAt: (published?._updatedAt as string | undefined) ?? null,
        doc: (chosen ?? null) as JsonValue | null,
      }
    },
  )

export const getAdminList = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .validator(z.object({ type: z.enum(editableTypes) }))
  .handler(async ({ data }): Promise<AdminListEntry[]> => {
    if (!isSanityConfigured()) {
      throw new Error('Sanity is not configured in this environment')
    }
    const client = requireWriteClient()
    return fetchListForType(client, data.type)
  })

const saveInput = z
  .object({
    id: z.string().optional(),
    publish: z.boolean().default(false),
    data: contentDocumentSchema,
  })
  .superRefine((value, ctx) => {
    const needsSlug = value.data.type === 'post' || value.data.type === 'caseStudy'
    const hasSlug = 'slug' in value.data.data && Boolean(value.data.data.slug)
    if (needsSlug && !hasSlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Slug is required',
        path: ['data', 'data', 'slug'],
      })
    }
  })

function stripEmpty(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) {
    const mapped = value.map(stripEmpty)
    return mapped.length ? mapped : undefined
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = stripEmpty(v)
      if (cleaned !== undefined) out[k] = cleaned
    }
    return Object.keys(out).length ? out : undefined
  }
  return value
}

export const saveContentDocument = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(saveInput)
  .handler(
    async ({ data }): Promise<{ id: string; isDraft: boolean }> => {
      if (!isSanityConfigured()) {
        throw new Error('Sanity is not configured in this environment')
      }
      const client = requireWriteClient()
      const type = data.data.type
      const id = baseId(data.id ?? crypto.randomUUID())
      const payload = data.data.data
      const slug = 'slug' in payload ? payload.slug : undefined
      const publishable = data.publish
      const publishedAt =
        type === 'post' &&
        publishable &&
        !(payload as Record<string, unknown>).publishedAt
          ? nowIso()
          : undefined
      const body = {
        ...(stripEmpty(payload) as Record<string, unknown>),
        slug: slug ? { _type: 'slug', current: slug } : undefined,
        ...(publishedAt ? { publishedAt } : {}),
        _updatedAt: nowIso(),
      }

      if (publishable) {
        await client.createOrReplace({
          ...body,
          _id: id,
          _type: type,
          _createdAt: nowIso(),
        })
        await client.delete(`${DRAFT_PREFIX}${id}`).catch(() => undefined)
        return { id, isDraft: false }
      }

      await client.createOrReplace({
        ...body,
        _id: `${DRAFT_PREFIX}${id}`,
        _type: type,
      })
      return { id, isDraft: true }
    },
  )

export const saveSettings = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(
    siteSettingsSchema.extend({ publish: z.boolean().default(false) }),
  )
  .handler(
    async ({ data }): Promise<{ id: string; isDraft: boolean }> => {
      if (!isSanityConfigured()) {
        throw new Error('Sanity is not configured in this environment')
      }
      const client = requireWriteClient()
      const body = {
        ...(stripEmpty(data) as Record<string, unknown>),
        _updatedAt: nowIso(),
      }

      if (data.publish) {
        await client.createOrReplace({
          ...body,
          _id: 'siteSettings',
          _type: 'siteSettings',
        })
        await client.delete('drafts.siteSettings').catch(() => undefined)
        return { id: 'siteSettings', isDraft: false }
      }
      await client.createOrReplace({
        ...body,
        _id: 'drafts.siteSettings',
        _type: 'siteSettings',
      })
      return { id: 'siteSettings', isDraft: true }
    },
  )

export const getAdminSettings = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async (): Promise<{
    isDraft: boolean
    publishedAt: string | null
    doc: JsonValue | null
  }> => {
    if (!isSanityConfigured()) {
      throw new Error('Sanity is not configured in this environment')
    }
    const client = requireWriteClient()
    const docs = await client.fetch<Array<Record<string, unknown>>>(
      `*[_id in ["siteSettings", "drafts.siteSettings"]]`,
    )
    const draft = docs.find((d) => String(d._id).startsWith(DRAFT_PREFIX))
    const published = docs.find((d) => !String(d._id).startsWith(DRAFT_PREFIX))
    return {
      isDraft: Boolean(draft),
      publishedAt: (published?._updatedAt as string | undefined) ?? null,
      doc: (draft ?? published ?? null) as JsonValue | null,
    }
  })

export const deleteDocument = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(
    z.object({
      type: z.enum(editableTypes),
      id: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    if (!isSanityConfigured()) {
      throw new Error('Sanity is not configured in this environment')
    }
    const client = requireWriteClient()
    const id = baseId(data.id)
    await client.delete(id).catch(() => undefined)
    await client.delete(`${DRAFT_PREFIX}${id}`).catch(() => undefined)
    return { ok: true }
  })

export const reorderDocuments = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(
    z.object({
      type: z.enum(editableTypes),
      ids: z.array(z.string().min(1)).max(200),
    }),
  )
  .handler(async ({ data }) => {
    if (!isSanityConfigured()) {
      throw new Error('Sanity is not configured in this environment')
    }
    const client = requireWriteClient()
    const tx = client.transaction()
    data.ids.forEach((rawId, index) => {
      const id = baseId(rawId)
      tx.patch(id, { set: { order: index } }).commit()
    })
    await tx.commit()
    return { ok: true }
  })

export const uploadImage = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(z.instanceof(FormData))
  .handler(async ({ data }): Promise<{ assetId: string }> => {
    if (!isSanityConfigured()) {
      throw new Error('Sanity is not configured in this environment')
    }
    const file = data.get('file')
    if (!(file instanceof File)) {
      throw new Error('No file provided')
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image uploads are allowed')
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Image must be 8 MB or smaller')
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    const client = requireWriteClient()
    const asset = await client.assets.upload('image', buffer, {
      filename: file.name || 'upload.jpg',
      contentType: file.type,
    })
    return { assetId: asset._id }
  })
