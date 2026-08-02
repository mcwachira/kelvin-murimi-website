import { createFileRoute, Link } from '@tanstack/react-router'
import { CTA, DashboardMock, PageHero, PortableContent, Tags } from '../components/Site'
import { getCaseStudies, getSiteSettings, getPublicMediaConfig } from '../lib/sanity/data.functions'
import type { PortableTextBlock } from '../lib/sanity/types'

export const Route = createFileRoute('/portfolio')({
  loader: async () => {
    const [cases, settings, media] = await Promise.all([
      getCaseStudies(),
      getSiteSettings(),
      getPublicMediaConfig(),
    ])
    return { cases, settings, media }
  },
  head: () => ({
    meta: [
      { title: 'Portfolio — Kelvin Murimi' },
      { name: 'description', content: 'Selected, client-safe examples of analysis translated into action.' },
    ],
  }),
  component: Page,
})

function Page() {
  const { cases, settings, media } = Route.useLoaderData()
  return (
    <main>
      <PageHero eyebrow="CASE FILES" title="Where the data led, and what changed because of it.">
        <p>Selected, client-safe examples of analysis translated into action.</p>
      </PageHero>
      <section className="shell cases">
        {cases.map((c) => (
          <article key={c._id}>
            <div className="case-meta">
              CASE {String(c.caseNumber ?? cases.indexOf(c) + 1).padStart(2, '0')} · {c.year} ·{' '}
              {c.organization}
            </div>
            <h2>
              {c.slug?.current ? (
                <Link to="/portfolio/$slug" params={{ slug: c.slug.current }}>
                  {c.title}
                </Link>
              ) : (
                c.title
              )}
            </h2>
            <Tags items={c.tags} />
            {c.summary && <p className="summary">{c.summary}</p>}
            <div className="case-grid">
              {(
                [
                  ['APPROACH', c.approach],
                  ['ANALYSIS', c.analysis],
                  ['OUTCOME', c.outcome],
                ] as Array<[string, PortableTextBlock[] | undefined]>
              ).map(([label, blocks]) => (
                <div key={label}>
                  <div className="eyebrow">{label}</div>
                  <PortableContent blocks={blocks} media={media} />
                </div>
              ))}
            </div>
            {c.hasSampleDashboard && <DashboardMock mock={c.dashboardMock} />}
          </article>
        ))}
      </section>
      <CTA title="Interested in seeing client-safe dashboard samples?" contact={settings.contact} />
    </main>
  )
}
