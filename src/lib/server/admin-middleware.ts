import { createMiddleware } from '@tanstack/react-start'
import { requireAdmin } from '../auth'
import type { AdminSession } from '../auth'

/**
 * Server-function middleware that rejects unauthenticated and
 * non-admin callers before the handler runs. This is the real security
 * boundary — dashboard route guards are UX only.
 */
export const adminMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await requireAdmin()
    return next({ context: { admin: session } })
  },
)

export type AdminContext = {
  admin: NonNullable<AdminSession>
}
