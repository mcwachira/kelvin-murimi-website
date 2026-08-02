import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  CTA,
  DashboardMock,
  PageHero,
  PortableContent,
  Tags,
} from '../components/Site'
import {
  getCaseStudyBySlug,
  getSiteSettings,
  getPublicMediaConfig,
} from '../lib/sanity/data.functions'
import type { PortableTextBlock } from '../lib/sanity/types'

export const Route = createFileRoute('/portfolio/$slug')({
  loader: async ({ params }) => {
    const [study, settings, media] = await Promise.all([
      getCaseStudyBySlug({ data: { slug: params.slug } }),
      getSiteSettings(),
      getPublicMediaConfig(),
    ])

    // If the study isn't available (Sanity not configured or missing doc), fall back to seeded content
    if (!study) {
      const { fallbackCaseStudies } = await import('../lib/sanity/fallback')
      const fb = fallbackCaseStudies.find((c) => c.slug?.current === params.slug) ?? null
      if (!fb) throw notFound()
      return { study: fb, settings, media }
    }

    return { study, settings, media }
  },
  head: ({ loaderData }) => {
    const study = loaderData?.study
    if (!study) return { meta: [{ title: 'Case File — Kelvin Murimi' }] }
    return {
      meta: [
        { title: `${study.title} — Kelvin Murimi` },
        { name: 'description', content: study.summary ?? '' },
        { property: 'og:title', content: study.title },
        { property: 'og:description', content: study.summary ?? '' },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: study.title,
            datePublished: study.year ? `${study.year}-01-01` : undefined,
            author: { '@type': 'Person', name: 'Kelvin Murimi' },
            about: study.tags,
          }),
        },
      ],
    }
  },
  component: Page,
})

function Page() {
  const { study, settings, media } = Route.useLoaderData()
  const number = String(study.caseNumber ?? 0).padStart(2, '0')
  return (
    <main>
      <PageHero
        eyebrow={`CASE ${number} · ${study.year} · ${study.organization}`}
        title={study.title}
        cover={study.coverImage}
        media={media}
      >
        <Tags items={study.tags} />
      </PageHero>
      <section className="shell">
        {study.summary && <p className="lede">{study.summary}</p>}
        <div className="case-grid">
          {(
            [
              ['APPROACH', study.approach],
              ['ANALYSIS', study.analysis],
              ['OUTCOME', study.outcome],
            ] as Array<[string, PortableTextBlock[] | undefined]>
          ).map(([label, blocks]) => (
            <div key={label}>
              <div className="eyebrow">{label}</div>
              <PortableContent blocks={blocks} media={media} />
            </div>
          ))}
        </div>
        {study.hasSampleDashboard && <DashboardMock mock={study.dashboardMock} />}
      </section>
      <CTA title="Interested in seeing client-safe dashboard samples?" contact={settings.contact} />
    </main>
  )
}
