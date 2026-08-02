import { Link } from '@tanstack/react-router'
import type { SiteSettings } from '../lib/sanity/types'

export default function Footer({ settings }: { settings: SiteSettings }) {
  const contact = settings.contact
  const location = settings.location ?? 'Nairobi, Kenya'
  return (
    <footer>
      <div className="shell">
        <div className="eyebrow">
          FIELD REPORT — {settings.name?.toUpperCase() ?? 'KELVIN MURIMI'} — {location.toUpperCase()}
        </div>
        <div className="footer-grid">
          <div>
            <div className="brand">
              <span>●</span> {settings.name ?? 'Kelvin Murimi'}
            </div>
            <p>{settings.tagline ?? 'MEL & Business Intelligence'}</p>
            <p>{location} · {settings.availability ?? 'Available for remote roles'}</p>
          </div>
          <div>
            {contact?.email && (
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            )}
            {contact?.phone && <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>}
            {contact?.linkedinUrl && (
              <a href={contact.linkedinUrl} target="_blank" rel="noreferrer">
                LinkedIn ↗
              </a>
            )}
          </div>
          <div className="footer-nav">
            <Link to="/experience">Experience</Link>
            <Link to="/skills">Skills</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <p className="copy">© 2026 Kelvin Murimi</p>
      </div>
    </footer>
  )
}
