import { createFileRoute, Link } from '@tanstack/react-router'
import { CTA, PageHero, Tags } from '../components/Site'
import { getPosts, getSiteSettings } from '../lib/sanity/data.functions'

export const Route = createFileRoute('/blog/')({
  loader: async () => {
    const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()])
    return { posts, settings }
  },
  head: () => ({
    meta: [
      { title: 'Field Notes — Kelvin Murimi' },
      { name: 'description', content: 'Practical notes on MEL, data quality, dashboards and delivery.' },
    ],
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
  const { posts, settings } = Route.useLoaderData()
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
