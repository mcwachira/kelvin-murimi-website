import { createFileRoute } from '@tanstack/react-router'
import { CTA, PageHero } from '../components/Site'
import { getExperience, getEducation, getLanguages } from '../lib/sanity/data.functions'
import { useSiteSettings } from '../lib/root-data'
import { pageHead } from '../lib/page-head'
import type { Experience } from '../lib/sanity/types'

export const Route = createFileRoute('/experience')({
  loader: async () => {
    const [experience, education, languages] = await Promise.all([
      getExperience(),
      getEducation(),
      getLanguages(),
    ])
    return { experience, education, languages }
  },
  head: () =>
    pageHead({
      title: 'Experience — Kelvin Murimi',
      description: 'Where the work has taken me — a timeline of MEL and BI roles.',
      path: '/experience',
    }),
  component: Page,
})

function formatRange(entry: Experience) {
  const start = entry.startDate ? new Date(entry.startDate).getFullYear() : ''
  const end = entry.isCurrent ? 'Present' : entry.endDate ? new Date(entry.endDate).getFullYear() : ''
  if (start && end) return `${start} — ${end}`
  return start || end || ''
}

function Page() {
  const { experience, education, languages } = Route.useLoaderData()
  const settings = useSiteSettings()
  return (
    <main>
      <PageHero eyebrow="TIMELINE / POSITIONS HELD" title="Experience.">
        <p>Roles grounded in evidence, delivery and the practical realities behind every dataset.</p>
      </PageHero>

      <section className="shell timeline">
        {experience.map((entry) => (
          <article key={entry._id}>
            <div className="eyebrow">● {formatRange(entry)}</div>
            <div>
              <h2>{entry.title}</h2>
              {entry.organization && <p className="org">{entry.organization}</p>}
              {(entry.bullets?.length ?? 0) > 0 && (
                <ul>
                  {entry.bullets!.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="shell cream split">
        <div>
          <div className="eyebrow">EDUCATION</div>
          <h2>Education.</h2>
          {education.map((edu) => (
            <p key={edu._id}>
              {edu.degree}
              {edu.institution && edu.institution !== '—' ? ` · ${edu.institution}` : ''}
            </p>
          ))}
        </div>
        <div>
          <div className="eyebrow">LANGUAGES</div>
          {languages.map((lang) => (
            <p key={lang._id}>
              {lang.name} — {lang.level}
            </p>
          ))}
        </div>
      </section>

      <CTA contact={settings.contact} />
    </main>
  )
}
