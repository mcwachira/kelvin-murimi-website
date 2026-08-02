import { createServerFn } from '@tanstack/react-start'
import { isAdmin, getCurrentSession } from './auth'

/**
 * Client-callable check used by route guards. Guards are UX only — every
 * mutation independently verifies the session via `adminMiddleware`.
 */
export const getAdminViewer = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getCurrentSession()
    return {
      admin: await isAdmin(),
      email: session?.user.email ?? null,
      name: session?.user.name ?? null,
    }
  },
)
