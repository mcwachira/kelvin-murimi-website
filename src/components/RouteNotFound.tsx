import { Link } from '@tanstack/react-router'
import { PageHero } from './Site'

export default function RouteNotFound() {
  return (
    <main>
      <PageHero eyebrow="404" title="This page doesn't exist.">
        <p>The link may be out of date, or the page may have moved.</p>
      </PageHero>
      <section className="shell">
        <div className="button-row">
          <Link to="/" className="button">
            Back to home
          </Link>
          <Link to="/portfolio" className="button secondary">
            View case files
          </Link>
        </div>
      </section>
    </main>
  )
}
