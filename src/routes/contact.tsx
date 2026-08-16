import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Eyebrow } from '../components/Site'
import { useSiteSettings } from '../lib/root-data'
import { pageHead } from '../lib/page-head'

export const Route = createFileRoute('/contact')({
  head: () =>
    pageHead({
      title: 'Contact — Kelvin Murimi',
      description: 'Get in touch about MEL, reporting or BI needs.',
      path: '/contact',
    }),
  component: Page,
})

function Page() {
  const settings = useSiteSettings()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const form = event.currentTarget
    const body = new FormData(form)
    try {
      const res = await fetch('/api/contact', { method: 'POST', body })
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
      if (!res.ok) {
        setMessage(json.error ?? 'Something went wrong. Please try again, or email directly.')
        setStatus('error')
        return
      }
      setMessage(json.message ?? 'Thank you — your message has been received.')
      setStatus('done')
      form.reset()
    } catch {
      setMessage('Network error — please check your connection and try again.')
      setStatus('error')
    }
  }

  const email = settings.contact?.email ?? 'kelvinmurimi181@gmail.com'
  const linkedin = settings.contact?.linkedinUrl ?? 'https://www.linkedin.com/in/kelvin-murimi/'
  const phone = settings.contact?.phone ?? '+254703565172'

  const channels: Array<{ label: string; value: string; href?: string }> = [
    { label: 'EMAIL', value: email, href: `mailto:${email}` },
    { label: 'PHONE', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    { label: 'LINKEDIN', value: linkedin.replace(/^https?:\/\//, ''), href: linkedin },
    { label: 'BASED IN', value: settings.location ?? 'Nairobi, Kenya' },
  ]

  return (
    <main>
      <section className="page-hero shell">
        <Eyebrow>SIGNAL / OPEN CHANNEL</Eyebrow>
        <h1>Get in touch</h1>
        <p className="lede">
          Share the programme, reporting or BI challenge you’re working through. The quickest path is
          email — or use the form below.
        </p>
      </section>

      <section className="shell contact-grid">
        <div className="contact-form-wrap">
          <div className="eyebrow">SEND A MESSAGE</div>
          {status === 'done' ? (
            <div className="form-success">
              <CheckCircle2 size={28} />
              <p>{message}</p>
              <button type="button" className="secondary" onClick={() => setStatus('idle')}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form" noValidate={false}>
              <label>
                NAME
                <input name="name" required autoComplete="name" minLength={2} maxLength={100} />
              </label>
              <label>
                EMAIL
                <input type="email" name="email" required autoComplete="email" maxLength={254} />
              </label>
              <label>
                MESSAGE
                <textarea
                  name="message"
                  rows={7}
                  required
                  minLength={10}
                  maxLength={5000}
                  placeholder="What are you working on, and how can I help?"
                />
              </label>
              <button className="button" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              {status === 'error' && <p className="form-status">{message}</p>}
            </form>
          )}
        </div>
        <aside className="direct-channels">
          <div className="eyebrow">DIRECT</div>
          {channels.map((ch) => (
            <div className="channel" key={ch.label}>
              <span>{ch.label}</span>
              {ch.href ? (
                <a href={ch.href} target={ch.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  {ch.value}
                </a>
              ) : (
                <strong>{ch.value}</strong>
              )}
            </div>
          ))}
          <div className="channel">
            <span>STATUS</span>
            <strong>{settings.availability ?? 'Available for remote roles'}</strong>
          </div>
        </aside>
      </section>
    </main>
  )
}
