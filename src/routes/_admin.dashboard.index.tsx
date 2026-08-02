import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAdminList } from '../lib/sanity/mutations.functions'
import type { AdminListEntry } from '../lib/sanity/mutations.functions'

export const Route = createFileRoute('/_admin/dashboard/')({
  component: DashboardHome,
})

const cards = [
  ['case-studies', 'Case studies', 'caseStudy'],
  ['blog', 'Blog posts', 'post'],
  ['experience', 'Experience', 'experience'],
  ['skills', 'Skill groups', 'skillCategory'],
  ['capabilities', 'Capabilities', 'capability'],
] as const

type SectionSlug = (typeof cards)[number][0]
type SanityType = (typeof cards)[number][2]

function DashboardHome() {
  const list = useQuery({
    queryKey: ['admin-list'],
    queryFn: async (): Promise<Record<SectionSlug, AdminListEntry[]>> => {
      const rows = await Promise.all(
        cards.map(async ([section, , type]) => ({
          section,
          entries: await getAdminList({ data: { type } as { type: SanityType } }),
        })),
      )
      return Object.fromEntries(rows.map((r) => [r.section, r.entries])) as Record<
        SectionSlug,
        AdminListEntry[]
      >
    },
  })

  return (
    <div>
      <header className="admin-head">
        <div>
          <h1>Content lake</h1>
          <p className="muted">
            Manage published and draft content without opening Sanity Studio. Drafts stay private
            until you publish.
          </p>
        </div>
        <Link to="/dashboard/$section" params={{ section: 'settings' }} className="button secondary">
          Edit site settings
        </Link>
      </header>

      {list.isPending && <p className="muted">Loading…</p>}
      {list.isError && <p className="form-status">Failed to load dashboard data.</p>}

      <section className="dash-grid">
        {cards.map(([section, label]) => {
          const entries = list.data?.[section] ?? []
          const draftCount = entries.filter((e) => e.isDraft).length
          return (
            <Link key={section} to="/dashboard/$section" params={{ section }} className="dash-card">
              <span>{label}</span>
              <strong>{entries.length}</strong>
              <small>
                {draftCount > 0 ? `${draftCount} draft${draftCount > 1 ? 's' : ''}` : 'All published'} · Manage →
              </small>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
