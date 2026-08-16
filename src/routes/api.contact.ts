import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
})

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

/** Best-effort in-memory rate limit — resets on server restart, per-instance only. */
const submissionsByIp = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (submissionsByIp.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  )
  if (timestamps.length >= RATE_LIMIT_MAX) {
    submissionsByIp.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  submissionsByIp.set(ip, timestamps)
  return false
}

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          'unknown'

        if (isRateLimited(ip)) {
          return Response.json(
            { error: 'Too many messages sent recently — please try again later.' },
            { status: 429 },
          )
        }

        let data: z.infer<typeof contactSchema>
        try {
          const form = await request.formData()
          data = contactSchema.parse({
            name: form.get('name')?.toString() ?? '',
            email: form.get('email')?.toString() ?? '',
            message: form.get('message')?.toString() ?? '',
          })
        } catch {
          return Response.json({ error: 'Invalid submission' }, { status: 400 })
        }

        if (!process.env.DATABASE_URL) {
          // No database configured in this environment — fall back to a mailto link
          // so the message isn't silently lost.
          const recipient = process.env.CONTACT_EMAIL
          if (!recipient) {
            return Response.json(
              { error: 'This site is not yet configured to receive messages. Please email directly.' },
              { status: 503 },
            )
          }
          const mailto = `mailto:${recipient}?subject=${encodeURIComponent(
            `Contact from ${data.name}`,
          )}&body=${encodeURIComponent(`${data.message}\n\n— ${data.name} <${data.email}>`)}`
          return Response.json(
            { ok: true, message: 'Thank you — your message has been received.', mailto },
            { status: 202 },
          )
        }

        try {
          const { getPrisma } = await import('../lib/prisma.server')
          await getPrisma().contactSubmission.create({ data })
        } catch (err) {
          console.error('[contact] failed to store submission', err)
          return Response.json(
            {
              error:
                'Something went wrong saving your message. Please try again, or email directly.',
            },
            { status: 500 },
          )
        }

        return Response.json(
          { ok: true, message: 'Thank you — your message has been received.' },
          { status: 202 },
        )
      },
    },
  },
})
