import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminList, deleteDocument } from '../lib/sanity/mutations.functions'
import SettingsEditor from '../components/admin/SettingsEditor'
import { Plus } from 'lucide-react'

const typeBySection: Record<string, string> = {
  'case-studies': 'caseStudy',
  blog: 'post',
  experience: 'experience',
  skills: 'skillCategory',
  capabilities: 'capability',
}

const titleBySection: Record<string, string> = {
  'case-studies': 'Case studies',
  blog: 'Blog posts',
  experience: 'Experience',
  skills: 'Skill groups',
  capabilities: 'Capabilities',
  settings: 'Site settings',
}

export const Route = createFileRoute('/_admin/dashboard/$section')({
  component: SectionPage,
})

function SectionPage() {
  const { section } = Route.useParams()
  const queryClient = useQueryClient()

  const isSettings = section === 'settings'
  const type = typeBySection[section]

  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const mod = await import('../lib/sanity/mutations.functions')
      return mod.getAdminSettings()
    },
    enabled: isSettings,
  })

  const list = useQuery({
    queryKey: ['admin', 'list', type],
    queryFn: () => getAdminList({ data: { type: type as 'caseStudy' } }),
    enabled: !isSettings && Boolean(type),
  })

  const remove = useMutation({
    mutationFn: (id: string) =>
      deleteDocument({ data: { type: type as 'caseStudy', id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })

  if (isSettings) {
    return (
      <div>
        <header className="admin-head">
          <div>
            <h1>Site settings</h1>
            <p className="muted">Hero, status board and contact details.</p>
          </div>
        </header>
        {settingsQuery.isPending && <p className="muted">Loading…</p>}
        {settingsQuery.isError && <p className="form-status">Failed to load settings.</p>}
        {settingsQuery.data && (
          <SettingsEditor
            doc={(settingsQuery.data.doc ?? null) as Record<string, unknown> | null}
            isDraft={settingsQuery.data.isDraft}
          />
        )}
      </div>
    )
  }

  if (!type) {
    throw redirect({ to: '/dashboard' })
  }

  const entries = list.data ?? []

  return (
    <div>
      <header className="admin-head">
        <div>
          <h1>{titleBySection[section]}</h1>
          <p className="muted">Draft edits stay private until you publish.</p>
        </div>
        <Link to="/dashboard/$section/$id" params={{ section, id: 'new' }} className="button">
          <Plus size={14} /> New entry
        </Link>
      </header>

      {list.isPending && <p className="muted">Loading…</p>}
      {list.isError && <p className="form-status">Failed to load {titleBySection[section]}.</p>}

      {entries.length === 0 && !list.isPending && (
        <div className="empty-state">
          <p>Nothing here yet.</p>
          <Link to="/dashboard/$section/$id" params={{ section, id: 'new' }} className="button">
            Create the first entry
          </Link>
        </div>
      )}

      <ul className="admin-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link to="/dashboard/$section/$id" params={{ section, id: entry.id }} className="admin-list-main">
              <strong>{entry.title || 'Untitled'}</strong>
              <small className="muted">
                {entry.isDraft ? 'Draft' : 'Published'}
                {entry.updatedAt ? ` · updated ${formatDate(entry.updatedAt)}` : ''}
              </small>
            </Link>
            <div className="admin-list-actions">
              {entry.isDraft && (
                <Link
                  to="/dashboard/$section/$id"
                  params={{ section, id: entry.id }}
                  className="secondary small"
                >
                  Review
                </Link>
              )}
              <button
                className="secondary small danger"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm('Delete this entry permanently?')) {
                    remove.mutate(entry.id)
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}
