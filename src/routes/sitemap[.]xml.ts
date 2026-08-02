import { createFileRoute } from '@tanstack/react-router'
import { getAllSlugs } from '../lib/sanity/data.functions'

export const Route = createFileRoute('/sitemap.xml')({

  server: {
    handlers: {
      GET: async () => {
        const base = process.env.PUBLIC_SITE_URL || 'https://kelvinmurimi.com'
        const [slugs, staticPaths] = await Promise.all([
          getAllSlugs().catch(() => []),
          Promise.resolve([
            '/',
            '/experience',
            '/skills',
            '/portfolio',
            '/blog',
            '/contact',
          ]),
        ])

        const urlFor = (path: string) => {
          const loc = `${base.replace(/\/$/, '')}${path}`
          return `<url><loc>${escapeXml(loc)}</loc></url>`
        }

        const entries = [
          ...staticPaths.map(urlFor),
          ...slugs
            .filter((s) => s.slug)
            .map((s) => urlFor(s.type === 'post' ? `/blog/${s.slug}` : `/portfolio/${s.slug}`)),
        ]

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
          },
        })
      },
    },
  },
})

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
