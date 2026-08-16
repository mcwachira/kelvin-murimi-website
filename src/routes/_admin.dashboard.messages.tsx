import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getContactSubmissions,
  markContactSubmissionRead,
  deleteContactSubmission,
} from '../lib/contact.functions'

export const Route = createFileRoute('/_admin/dashboard/messages')({
  component: MessagesPage,
  head: () => ({
    meta: [{ title: 'Messages — Kelvin Murimi' }, { name: 'robots', content: 'noindex,nofollow' }],
  }),
})

function MessagesPage() {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)

  const list = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: () => getContactSubmissions(),
  })

  const setRead = useMutation({
    mutationFn: (vars: { id: string; read: boolean }) =>
      markContactSubmissionRead({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteContactSubmission({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] }),
  })

  const entries = list.data ?? []
  const unreadCount = entries.filter((e) => !e.read).length

  return (
    <div>
      <header className="admin-head">
        <div>
          <h1>Messages</h1>
          <p className="muted">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} — submitted via the
            contact form.
          </p>
        </div>
      </header>

      {list.isPending && <p className="muted">Loading…</p>}
      {list.isError && <p className="form-status">Failed to load messages.</p>}

      {entries.length === 0 && !list.isPending && (
        <div className="empty-state">
          <p>No messages yet.</p>
        </div>
      )}

      <ul className="admin-list">
        {entries.map((entry) => {
          const isOpen = expanded === entry.id
          return (
            <li key={entry.id} className="message-item">
              <button
                type="button"
                className="admin-list-main message-summary"
                onClick={() => {
                  const next = isOpen ? null : entry.id
                  setExpanded(next)
                  if (next && !entry.read) {
                    setRead.mutate({ id: entry.id, read: true })
                  }
                }}
              >
                <strong>
                  {!entry.read && <span className="unread-dot" aria-label="Unread" />}
                  {entry.name}
                </strong>
                <small className="muted">
                  {entry.email} · {formatDate(entry.createdAt)}
                </small>
                {!isOpen && <p className="message-preview">{entry.message}</p>}
              </button>
              {isOpen && (
                <div className="message-body">
                  <p>{entry.message}</p>
                </div>
              )}
              <div className="admin-list-actions">
                <a className="secondary small" href={`mailto:${entry.email}`}>
                  Reply
                </a>
                <button
                  type="button"
                  className="secondary small"
                  disabled={setRead.isPending}
                  onClick={() => setRead.mutate({ id: entry.id, read: !entry.read })}
                >
                  {entry.read ? 'Mark unread' : 'Mark read'}
                </button>
                <button
                  type="button"
                  className="secondary small danger"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm('Delete this message permanently?')) {
                      remove.mutate(entry.id)
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
