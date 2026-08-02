import { createFileRoute } from '@tanstack/react-router'
import { setResponseHeader } from '@tanstack/react-start/server'

/**
 * Sanity webhook target. Verifies the shared secret, derives the public paths
 * affected by the changed document(s), and (when VERCEL_PURGE_TOKEN is set)
 * purges the Vercel edge cache for those paths so edits appear without a
 * redeploy. Without a purge token the endpoint still 200s and newer content
 * is picked up by the `stale-while-revalidate` window on the data functions.
 */
export const Route = createFileRoute('/api/revalidate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const configured = process.env.SANITY_REVALIDATE_SECRET
        if (!configured) {
          return Response.json(
            { error: 'Revalidation is not configured' },
            { status: 503 },
          )
        }

        let payload: unknown = null
        try {
          payload = await request.json()
        } catch {
          // Non-JSON body — fall through to header-only secret checks.
        }

        const headerSecret = request.headers.get('x-sanity-webhook-secret')
        const bodySecret =
          payload && typeof payload === 'object' && !Array.isArray(payload)
            ? (payload as { secret?: unknown }).secret
            : undefined
        const provided =
          typeof headerSecret === 'string' && headerSecret
            ? headerSecret
            : typeof bodySecret === 'string'
              ? bodySecret
              : ''

        if (!provided || provided !== configured) {
          return Response.json({ error: 'Invalid secret' }, { status: 401 })
        }

        const paths = collectPaths(payload)

        setResponseHeader('Cache-Control', 'no-store')

        if (paths.length && process.env.VERCEL_PURGE_TOKEN) {
          try {
            const res = await fetch('https://api.vercel.com/v1/purge', {
              method: 'POST',
              headers: {
                authorization: `Bearer ${process.env.VERCEL_PURGE_TOKEN}`,
                'content-type': 'application/json',
              },
              body: JSON.stringify({ paths }),
            })
            if (!res.ok) {
              console.error(
                `[revalidate] Vercel purge failed (${res.status}): ${await res.text()}`,
              )
            }
          } catch (err) {
            console.error('[revalidate] Vercel purge threw', err)
          }
        }

        return Response.json({ revalidated: true, paths })
      },
    },
  },
})

function collectPaths(payload: unknown): string[] {
  const docs: Array<Record<string, unknown>> = []
  if (Array.isArray(payload)) {
    docs.push(...payload.filter((d): d is Record<string, unknown> => isDoc(d)))
  } else if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (record._type && typeof record._type === 'string') {
      docs.push(record)
    } else if (Array.isArray(record.body)) {
      docs.push(...record.body.filter((d): d is Record<string, unknown> => isDoc(d)))
    }
    if (typeof record.paths === 'string' || Array.isArray(record.paths)) {
      const custom = Array.isArray(record.paths)
        ? record.paths
        : [record.paths]
      return dedupe(custom.filter((p): p is string => typeof p === 'string' && p.startsWith('/')))
    }
  }

  const paths: string[] = []
  for (const doc of docs) {
    paths.push(...pathsForDoc(doc))
  }
  return dedupe(paths)
}

function isDoc(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function pathsForDoc(doc: Record<string, unknown>): string[] {
  const type = typeof doc._type === 'string' ? doc._type : ''
  const rawSlug = doc.slug
  const slug =
    typeof rawSlug === 'string'
      ? rawSlug
      : rawSlug && typeof rawSlug === 'object'
        ? (rawSlug as { current?: unknown }).current
        : undefined
  const slugStr = typeof slug === 'string' && slug ? slug : undefined

  switch (type) {
    case 'post':
      return slugStr ? [`/blog/${slugStr}`, '/blog'] : ['/blog']
    case 'caseStudy':
      return slugStr ? [`/portfolio/${slugStr}`, '/portfolio'] : ['/portfolio']
    case 'experience':
      return ['/experience']
    case 'skillCategory':
      return ['/skills']
    case 'capability':
    case 'siteSettings':
    case 'education':
    case 'language':
      return ['/']
    default:
      return []
  }
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)]
}
