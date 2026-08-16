import { absoluteUrl } from './site-url'

/** Standard title/description/OG/Twitter/canonical meta for a static page. */
export function pageHead({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: absoluteUrl(path) },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    links: [{ rel: 'canonical', href: absoluteUrl(path) }],
  }
}
