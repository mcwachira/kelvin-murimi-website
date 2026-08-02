import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import type { SiteSettings } from '../lib/sanity/types'

const links = [
  ['/', 'Home'],
  ['/experience', 'Experience'],
  ['/skills', 'Skills'],
  ['/portfolio', 'Portfolio'],
  ['/blog', 'Blog'],
  ['/contact', 'Contact'],
] as const

export default function Header({ settings }: { settings: SiteSettings }) {
  const location = (settings.location ?? 'Nairobi, Kenya').toUpperCase()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="masthead">
        <div className="shell masthead-inner">
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span>●</span> {settings.name ?? 'Kelvin Murimi'}
            <em>{settings.tagline ?? 'MEL & Business Intelligence'}</em>
          </Link>
          <span className="masthead-label">FIELD REPORT — {location}</span>
        </div>
      </div>
      <nav className="shell nav" aria-label="Primary navigation">
        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          {links.map(([to, label]) => (
            <Link key={to} to={to} activeProps={{ className: 'active' }} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          <Link to="/contact" className="button small" onClick={() => setMenuOpen(false)}>
            Get in touch →
          </Link>
          <button
            className="menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </header>
  )
}
