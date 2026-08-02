import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { Eyebrow } from '../components/Site'
import { getSiteSettings } from '../lib/sanity/data.functions'

export const Route = createFileRoute('/contact')({
  loader: async () => ({ settings: await getSiteSettings() }),
  head: () => ({
    meta: [
      { title: 'Contact — Kelvin Murimi' },
      { name: 'description', content: 'Get in touch about MEL, reporting or BI needs.' },
    ],
  }),
  component: Page,
})

function Page() {
  const { settings } = Route.useLoaderData()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const form = event.currentTarget
    const body = new FormData(form)
    try {
      const res = await fetch('/api/contact', { method: 'POST', body })
      const json = (await res.json()) as { message?: string }
      setMessage(json.message ?? 'Thank you — your message has been received.')
      setStatus('done')
      form.reset()
    } catch {
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
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="eyebrow">SEND A MESSAGE</div>
          <label>
            NAME
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            EMAIL
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            MESSAGE
            <textarea name="message" rows={7} required />
          </label>
          <button className="button" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          {status === 'done' && <p className="form-status ok">{message}</p>}
          {status === 'error' && (
            <p className="form-status">Something went wrong. Email me directly instead.</p>
          )}
        </form>
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
