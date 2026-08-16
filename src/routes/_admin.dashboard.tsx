import { createFileRoute, redirect, Link, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import { getAdminViewer } from '../lib/auth.functions'
import { getContactSubmissions } from '../lib/contact.functions'
import { LogOut, LayoutDashboard } from 'lucide-react'

export const Route = createFileRoute('/_admin/dashboard')({
  beforeLoad: async () => {
    const viewer = await getAdminViewer()
    if (!viewer.admin) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
  head: () => ({
    meta: [{ title: 'Dashboard — Kelvin Murimi' }, { name: 'robots', content: 'noindex,nofollow' }],
  }),
})

const sections = [
  ['case-studies', 'Case studies'],
  ['blog', 'Blog posts'],
  ['experience', 'Experience'],
  ['education', 'Education'],
  ['languages', 'Languages'],
  ['skills', 'Skill groups'],
  ['capabilities', 'Capabilities'],
  ['settings', 'Site settings'],
] as const

function AdminLayout() {
  const unread = useQuery({
    queryKey: ['admin', 'messages', 'unread-count'],
    queryFn: async () => (await getContactSubmissions()).filter((m) => !m.read).length,
  })

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/dashboard" className="admin-brand">
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <nav>
          <Link to="/dashboard/messages" activeProps={{ className: 'active' }}>
            Messages
            {Boolean(unread.data) && <span className="nav-badge">{unread.data}</span>}
          </Link>
          {sections.map(([slug, label]) => (
            <Link
              key={slug}
              to="/dashboard/$section"
              params={{ section: slug }}
              activeOptions={{ exact: true }}
              activeProps={{ className: 'active' }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link to="/" className="secondary">
            View site →
          </Link>
          <button
            className="secondary"
            onClick={async () => {
              await authClient.signOut()
              window.location.href = '/'
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
