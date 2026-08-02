import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const base = process.env.PUBLIC_SITE_URL || 'https://kelvinmurimi.com'
        const text = [
          'User-agent: *',
          'Allow: /',
          'Disallow: /dashboard',
          'Disallow: /login',
          'Disallow: /api/',
          `Sitemap: ${base.replace(/\/$/, '')}/sitemap.xml`,
          '',
        ].join('\n')

        return new Response(text, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
          },
        })
      },
    },
  },
})
