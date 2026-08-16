import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  CTA,
  DashboardMock,
  PageHero,
  PortableContent,
  Tags,
} from '../components/Site'
import { getCaseStudyBySlug } from '../lib/sanity/data.functions'
import { useMediaConfig, useSiteSettings } from '../lib/root-data'
import { absoluteUrl } from '../lib/site-url'
import type { PortableTextBlock } from '../lib/sanity/types'

export const Route = createFileRoute('/portfolio/$slug')({
  loader: async ({ params }) => {
    const study = await getCaseStudyBySlug({ data: { slug: params.slug } })

    // If the study isn't available (Sanity not configured or missing doc), fall back to seeded content
    if (!study) {
      const { fallbackCaseStudies } = await import('../lib/sanity/fallback')
      const fb = fallbackCaseStudies.find((c) => c.slug?.current === params.slug) ?? null
      if (!fb) throw notFound()
      return { study: fb }
    }

    return { study }
  },
  head: ({ loaderData }) => {
    const study = loaderData?.study
    if (!study) return { meta: [{ title: 'Case File — Kelvin Murimi' }] }
    const canonical = study.slug?.current ? absoluteUrl(`/portfolio/${study.slug.current}`) : undefined
    return {
      meta: [
        { title: `${study.title} — Kelvin Murimi` },
        { name: 'description', content: study.summary ?? '' },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: study.title },
        { property: 'og:description', content: study.summary ?? '' },
        ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: study.title },
        { name: 'twitter:description', content: study.summary ?? '' },
      ],
      links: canonical ? [{ rel: 'canonical', href: canonical }] : [],
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
  const { study } = Route.useLoaderData()
  const settings = useSiteSettings()
  const media = useMediaConfig()
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
