import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { adminMiddleware } from './server/admin-middleware'
import { getPrisma } from './prisma.server'

export type ContactSubmissionEntry = {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  createdAt: string
}

export const getContactSubmissions = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async (): Promise<ContactSubmissionEntry[]> => {
    const rows = await getPrisma().contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      message: r.message,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    }))
  })

export const markContactSubmissionRead = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(z.object({ id: z.string().min(1), read: z.boolean() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await getPrisma().contactSubmission.update({
      where: { id: data.id },
      data: { read: data.read },
    })
    return { ok: true }
  })

export const deleteContactSubmission = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await getPrisma().contactSubmission.delete({ where: { id: data.id } })
    return { ok: true }
  })
