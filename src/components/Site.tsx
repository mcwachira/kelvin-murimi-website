import { Link } from '@tanstack/react-router'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { sanityImageUrl, assetRefFrom, type SanityMediaConfig } from '../lib/sanity/url'
import type {
  CaseStudy,
  ContactInfo,
  PortableTextItem,
  StatusBoard as StatusBoardData,
} from '../lib/sanity/types'

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

export function PageHero({
  eyebrow,
  title,
  children,
  cover,
  media,
}: {
  eyebrow: string
  title: string
  children?: React.ReactNode
  cover?: { asset?: { _ref?: string } } | null
  media?: SanityMediaConfig | null
}) {
  return (
    <section className="page-hero shell">
      <div className="page-hero-inner">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
          {children && <div className="lede">{children}</div>}
        </div>
        {cover && (
          <div className="hero-cover">
            <CoverImage image={cover} media={media} alt={title} />
          </div>
        )}
      </div>
    </section>
  )
}

export function CTA({
  title = 'Ready to discuss your MEL or BI needs?',
  contact,
}: {
  title?: string
  contact?: ContactInfo | null
}) {
  const email = contact?.email ?? 'kelvin@example.com'
  const linkedin = contact?.linkedinUrl ?? 'https://www.linkedin.com'
  return (
    <section className="cta shell">
      <div>
        <Eyebrow>LET’S WORK TOGETHER</Eyebrow>
        <h2>{title}</h2>
      </div>
      <div className="button-row">
        <a className="button" href={`mailto:${email}`}>
          Email me
        </a>
        <a
          className="button secondary"
          href={linkedin}
          target="_blank"
          rel="noreferrer"
        >
          Connect on LinkedIn
        </a>
      </div>
    </section>
  )
}

export function Tags({ items }: { items?: string[] }) {
  if (!items?.length) return null
  return (
    <div className="tags">
      {items.map((x) => (
        <span key={x}>{x}</span>
      ))}
    </div>
  )
}

export function BackHome() {
  return (
    <Link to="/" className="text-link">
      ← Back home
    </Link>
  )
}

const BARS = ['▂▄▆█', '▂▅▇', '▄▇', '▃▆█', '▃▆█'] as const

export function StatusBoard({ data }: { data?: StatusBoardData | null }) {
  const stats = data?.stats ?? []
  return (
    <aside className="status">
      <div className="status-head">
        <span>{data?.label ?? 'STATUS BOARD — KELVIN MURIMI'}</span>
        <span className="live">● {data?.statusText ?? 'Open to remote roles'}</span>
      </div>
      {stats.map((stat, i) => (
        <div className="stat" key={stat._key ?? `${stat.label}-${i}`}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <i>{BARS[Math.min(i, BARS.length - 1)]}</i>
        </div>
      ))}
    </aside>
  )
}

export function DashboardMock({ mock }: { mock?: CaseStudy['dashboardMock'] }) {
  if (!mock) return null
  const values = mock.quarterlyOutputData ?? []
  const max = Math.max(1, ...values.map((v) => v.value ?? 0))
  return (
    <div className="cream mock">
      <div className="mock-title">
        <span>SAMPLE DASHBOARD MOCK-UP</span>
        <small>Illustrative only — no client data</small>
      </div>
      <div className="mock-grid">
        <div>
          <div className="bars">
            {values.map((v, i) => (
              <i
                key={v.label ?? i}
                style={{ height: `${Math.round(((v.value ?? 0) / max) * 100)}%` }}
                title={`${v.label}: ${v.value}`}
              />
            ))}
          </div>
          <b>Quarterly outputs</b>
        </div>
        <div
            className="donut"
            style={{ '--coverage': mock.coveragePercent ?? 0 } as React.CSSProperties}
        >
          <strong>{mock.coveragePercent ?? 0}%</strong>
          <span>coverage</span>
        </div>
        <div className="kpis">
          {(mock.kpis ?? []).map((kpi) => (
            <p key={kpi.label}>
              {kpi.label} <em className={kpi.status === 'below-target' ? 'warn' : ''}>{kpi.value}</em>
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

const portableComponents = (media?: SanityMediaConfig | null): PortableTextComponents => ({
  block: {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const src = sanityImageUrl(media, value?.asset, { width: 1200 })
      if (!src) return null
      return (
        <figure>
          <img src={src} alt={value?.alt ?? ''} loading="lazy" />
        </figure>
      )
    },
    code: ({ value }) => (
      <pre>
        <code lang={value?.language ?? ''}>{value?.code ?? ''}</code>
      </pre>
    ),
  },
})

export function PortableContent({
  blocks,
  media,
}: {
  blocks?: PortableTextItem[]
  media?: SanityMediaConfig | null
}) {
  if (!blocks?.length) return null
  return <PortableText value={blocks} components={portableComponents(media)} />
}

export function CoverImage({
  image,
  media,
  alt = '',
}: {
  image?: { asset?: { _ref?: string } } | null
  media?: SanityMediaConfig | null
  alt?: string
}) {
  const src = sanityImageUrl(media, assetRefFrom(image), { width: 1200 })
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="cover"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  )
}
