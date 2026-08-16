import { createFileRoute, Link } from '@tanstack/react-router'
import { CTA, PageHero, Tags } from '../components/Site'
import { getPosts } from '../lib/sanity/data.functions'
import { useSiteSettings } from '../lib/root-data'
import { pageHead } from '../lib/page-head'

export const Route = createFileRoute('/blog/')({
  loader: async () => {
    const posts = await getPosts()
    return { posts }
  },
  head: () =>
    pageHead({
      title: 'Field Notes — Kelvin Murimi',
      description: 'Practical notes on MEL, data quality, dashboards and delivery.',
      path: '/blog',
    }),
  component: Page,
})

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function Page() {
  const { posts } = Route.useLoaderData()
  const settings = useSiteSettings()
  return (
    <main>
      <PageHero eyebrow="FIELD NOTES" title="Ideas from the space between evidence and action.">
        <p>Practical notes on MEL, data quality, dashboards and delivery.</p>
      </PageHero>
      <section className="shell blog-grid">
        {posts.map((p) => (
          <article key={p._id}>
            <div className="case-meta">{formatDate(p.publishedAt)}</div>
            <h2>
              <Link to="/blog/$slug" params={{ slug: p.slug?.current ?? '' }} search={{ preview: false }}>
                {p.title}
              </Link>
            </h2>
            <p>{p.excerpt}</p>
            <Tags items={p.tags} />
          </article>
        ))}
      </section>
      <CTA contact={settings.contact} />
    </main>
  )
}
