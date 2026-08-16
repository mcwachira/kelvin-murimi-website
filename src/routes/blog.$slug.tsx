import { createFileRoute, notFound } from '@tanstack/react-router'
import { CTA, PageHero, PortableContent, Tags } from '../components/Site'
import { getPostBySlug, getPublicMediaConfig } from '../lib/sanity/data.functions'
import { useSiteSettings } from '../lib/root-data'
import { assetRefFrom, sanityImageUrl } from '../lib/sanity/url'
import { absoluteUrl } from '../lib/site-url'

export const Route = createFileRoute('/blog/$slug')({
  validateSearch: (search: Record<string, unknown>) => ({
    preview:
      search.preview === true || search.preview === '1' || search.preview === 'true'
        ? true
        : undefined,
  }),
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({ params, deps }) => {
    const [post, media] = await Promise.all([
      getPostBySlug({ data: { slug: params.slug, preview: deps.preview } }),
      getPublicMediaConfig(),
    ])

    // If the post isn't available (Sanity not configured or missing doc), fall back to seeded content
    if (!post) {
      const { fallbackPosts } = await import('../lib/sanity/fallback')
      const fb = fallbackPosts.find((p) => p.slug?.current === params.slug) ?? null
      if (!fb) throw notFound()
      return { post: fb, media }
    }

    return { post, media }
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post
    const media = loaderData?.media
    if (!post) {
      return { meta: [{ title: 'Field Note — Kelvin Murimi' }] }
    }
    const ogImage = sanityImageUrl(media, assetRefFrom(post.coverImage), {
      width: 1200,
    })
    const canonical = post.slug?.current ? absoluteUrl(`/blog/${post.slug.current}`) : undefined
    return {
      meta: [
        { title: `${post.title} — Kelvin Murimi` },
        { name: 'description', content: post.excerpt ?? '' },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.excerpt ?? '' },
        ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
        ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
        { name: 'twitter:card', content: ogImage ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: post.title },
        { name: 'twitter:description', content: post.excerpt ?? '' },
        ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
        { name: 'robots', content: post.publishedAt ? 'index,follow' : 'noindex,nofollow' },
      ],
      links: canonical ? [{ rel: 'canonical', href: canonical }] : [],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            datePublished: post.publishedAt,
            description: post.excerpt,
            keywords: post.tags,
            author: { '@type': 'Person', name: 'Kelvin Murimi' },
          }),
        },
      ],
    }
  },
  component: Page,
})

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })
}

function Page() {
  const { post, media } = Route.useLoaderData()
  const settings = useSiteSettings()
  const isPreview = Route.useSearch().preview
  return (
    <main>
      <PageHero
        eyebrow={`${formatDate(post.publishedAt)} · FIELD NOTE`}
        title={post.title}
        cover={post.coverImage}
        media={media}
      >
        <Tags items={post.tags} />
        {isPreview && (
          <p className="eyebrow" style={{ color: 'var(--amber)' }}>
            DRAFT PREVIEW — this content is not public
          </p>
        )}
      </PageHero>
      <article className="shell prose article">
        <PortableContent blocks={post.body} media={media} />
      </article>
      <CTA contact={settings.contact} />
    </main>
  )
}
