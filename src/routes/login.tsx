import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    // Already signed in as admin — skip the form.
    const viewer = await import('../lib/auth.functions').then((m) => m.getAdminViewer())
    if (viewer.admin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
  head: () => ({
    meta: [{ title: 'Sign in — Kelvin Murimi' }, { name: 'robots', content: 'noindex,nofollow' }],
  }),
})

function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const form = event.currentTarget
    const email = new FormData(form).get('email')?.toString() ?? ''
    const password = new FormData(form).get('password')?.toString() ?? ''
    try {
      const res = await authClient.signIn.email({ email, password })
      if (res.error) {
        setError(res.error.message ?? 'Sign-in failed')
        setBusy(false)
        return
      }
      window.location.href = '/dashboard'
    } catch {
      setError('Unexpected error during sign-in')
      setBusy(false)
    }
  }

  return (
    <main className="shell auth-wrap">
      <form onSubmit={handleSubmit} className="auth-card">
        <h1>Sign in</h1>
        <p className="muted">Admin access only. Your session is verified against the configured admin email.</p>
        {error && <p className="form-status">{error}</p>}
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" name="password" required autoComplete="current-password" />
        </label>
        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
