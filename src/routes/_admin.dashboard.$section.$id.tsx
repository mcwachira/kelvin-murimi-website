import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAdminDocument } from '../lib/sanity/mutations.functions'
import DocumentEditor from '../components/admin/DocumentEditor'
import type { EditorType } from '../components/admin/DocumentEditor'

const typeBySection: Record<string, EditorType> = {
  'case-studies': 'caseStudy',
  blog: 'post',
  experience: 'experience',
  skills: 'skillCategory',
  capabilities: 'capability',
}

export const Route = createFileRoute('/_admin/dashboard/$section/$id')({
  component: EditorPage,
})

function EditorPage() {
  const { section, id } = Route.useParams()

  if (section === 'settings') {
    throw redirect({ to: '/dashboard/$section', params: { section: 'settings' } })
  }
  const type = typeBySection[section]
  if (!type) {
    throw redirect({ to: '/dashboard' })
  }

  const isNew = id === 'new'

  const doc = useQuery({
    queryKey: ['admin', 'doc', type, id],
    queryFn: () => getAdminDocument({ data: { type, id } }),
    enabled: !isNew,
  })

  if (isNew) {
    return (
      <div>
        <BackLink section={section} />
        <DocumentEditor type={type} id="new" doc={null} isDraft={false} />
      </div>
    )
  }

  if (doc.isPending) {
    return (
      <div>
        <BackLink section={section} />
        <p className="muted">Loading…</p>
      </div>
    )
  }
  if (doc.isError) {
    return (
      <div>
        <BackLink section={section} />
        <p className="form-status">Failed to load document.</p>
      </div>
    )
  }
  if (!doc.data.doc) {
    return (
      <div>
        <BackLink section={section} />
        <p className="muted">Document not found.</p>
      </div>
    )
  }

  return (
    <div>
      <BackLink section={section} />
      <DocumentEditor
        type={type}
        id={doc.data.id}
        doc={(doc.data.doc ?? null) as Record<string, unknown> | null}
        isDraft={doc.data.isDraft}
      />
    </div>
  )
}

function BackLink({ section }: { section: string }) {
  return (
    <Link to="/dashboard/$section" params={{ section }} className="secondary small back-link">
      ← Back to list
    </Link>
  )
}
