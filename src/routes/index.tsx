import { createFileRoute, Link } from '@tanstack/react-router'
import { CTA, Eyebrow, StatusBoard } from '../components/Site'
import {
  getSiteSettings,
  getCapabilities,
  getCaseStudies,
  getPublicMediaConfig,
} from '../lib/sanity/data.functions'
import { assetRefFrom, sanityImageUrl } from '../lib/sanity/url'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [settings, capabilities, caseStudies, media] = await Promise.all([
      getSiteSettings(),
      getCapabilities(),
      getCaseStudies(),
      getPublicMediaConfig(),
    ])
    return { settings, capabilities, caseStudies, media }
  },
  head: ({ loaderData }) => {
    const s = loaderData?.settings
    const ogImage = sanityImageUrl(
      loaderData?.media,
      assetRefFrom(s?.seo?.ogImage),
      { width: 1200 },
    )
    return {
      meta: [
        { title: s?.seo?.metaTitle ?? 'Kelvin Murimi — MEL & Business Intelligence' },
        { name: 'description', content: s?.seo?.metaDescription ?? s?.heroSubcopy ?? '' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: s?.seo?.metaTitle ?? s?.name ?? 'Kelvin Murimi' },
        { property: 'og:description', content: s?.seo?.metaDescription ?? s?.heroSubcopy ?? '' },
        ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: s?.name ?? 'Kelvin Murimi',
            jobTitle: 'Monitoring, Evaluation & Learning and Business Intelligence Professional',
            description: s?.tagline,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Nairobi',
              addressCountry: 'Kenya',
            },
            email: s?.contact?.email,
            sameAs: s?.contact?.linkedinUrl ? [s.contact.linkedinUrl] : undefined,
          }),
        },
      ],
    }
  },
  component: Home,
})

function Home() {
  const { settings, capabilities, caseStudies } = Route.useLoaderData()
  const offers = capabilities
  return (
    <main>
      <section className="hero shell">
        <div>
          <Eyebrow>
            FIELD REPORT — {settings.location?.toUpperCase() ?? 'NAIROBI, KENYA'}
          </Eyebrow>
          <span className="badge">
            {settings.availability?.toUpperCase() ?? 'AVAILABLE FOR REMOTE ROLES'}
          </span>
          <h1>{settings.heroHeadline ?? 'Turning field data into decisions that move programmes forward.'}</h1>
          <p className="lede">
            {settings.heroSubcopy ??
              'MEL and Business Intelligence professional with 5+ years across humanitarian, public health, and agricultural development. I design monitoring systems, build BI dashboards, and translate raw field data into the evidence that programme teams actually use.'}
          </p>
          <div className="button-row">
            <Link to="/contact" className="button">
              Get in touch
            </Link>
            <Link to="/portfolio" className="button secondary">
              View case files
            </Link>
          </div>
        </div>
        <StatusBoard data={settings.statusBoard} />
      </section>

      <section className="band">
        <div className="shell">
          <Eyebrow>WHAT I OFFER</Eyebrow>
          <h2>Capabilities</h2>
          <div className="offer-grid">
            {offers.map((cap, i) => (
              <article key={cap._id}>
                <span>cap - {String(i + 1).padStart(2, '0')}</span>
                <h3>{cap.title}</h3>
                <p>{cap.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell selected-work">
        <div className="section-head">
          <div>
            <Eyebrow>SELECTED WORK</Eyebrow>
            <h2>Field case studies</h2>
          </div>
          <Link to="/portfolio" className="button secondary">
            Full portfolio →
          </Link>
        </div>
        <div className="case-list">
          {caseStudies.slice(0, 3).map((c) => (
            <article key={c._id} className="case-card">
              <div className="case-meta">
                CASE #{String(c.caseNumber ?? 0).padStart(2, '0')} · {c.year}
              </div>
              <h3>
                {c.slug?.current ? (
                  <Link to="/portfolio/$slug" params={{ slug: c.slug.current }}>
                    {c.title}
                  </Link>
                ) : (
                  c.title
                )}
              </h3>
              <div className="case-org">{c.organization}</div>
              {c.summary && <p>{c.summary}</p>}
            </article>
          ))}
        </div>
      </section>

      <CTA contact={settings.contact} />
    </main>
  )
}
