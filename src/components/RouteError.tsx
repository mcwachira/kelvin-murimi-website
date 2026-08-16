import type { ErrorComponentProps } from '@tanstack/react-router'
import { PageHero } from './Site'

/** Vite dev-mode HMR can invalidate a lazy route chunk while the page is open. */
function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /dynamically imported module|Failed to fetch module|Importing a module script failed/i.test(
    message,
  )
}

export default function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const staleChunk = isStaleChunkError(error)
  return (
    <main>
      <PageHero eyebrow="SOMETHING WENT WRONG" title={staleChunk ? 'This page was updated.' : 'Unexpected error.'}>
        <p>
          {staleChunk
            ? 'The app changed since this tab loaded. Reload to pick up the latest version.'
            : "We hit an error rendering this page. You can try again, or reload if that doesn't help."}
        </p>
      </PageHero>
      <section className="shell">
        <div className="button-row">
          {!staleChunk && (
            <button type="button" className="button secondary" onClick={reset}>
              Try again
            </button>
          )}
          <button type="button" className="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
        {import.meta.env.DEV && (
          <pre style={{ marginTop: '1.5rem', overflow: 'auto', fontSize: '.8rem' }}>
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}
      </section>
    </main>
  )
}
