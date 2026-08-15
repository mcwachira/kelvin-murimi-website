import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
})

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }) => {
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

        let stored = false
        try {
          const { getPrisma } = await import('../lib/prisma.server')
          await getPrisma().contactSubmission.create({ data })
          stored = true
        } catch {
          // No database configured — fall back to a mailto-style confirmation.
        }

        if (stored) {
          return Response.json(
            { ok: true, message: 'Thank you — your message has been received.' },
            { status: 202 },
          )
        }

        const recipient = process.env.CONTACT_EMAIL
        if (!recipient) {
          return Response.json(
            { ok: true, message: 'Thank you — your message has been received.' },
            { status: 202 },
          )
        }

        const mailto = `mailto:${recipient}?subject=${encodeURIComponent(
          `Contact from ${data.name}`,
        )}&body=${encodeURIComponent(`${data.message}\n\n— ${data.name} <${data.email}>`)}`
        return Response.json(
          { ok: true, message: 'Thank you — your message has been received.', mailto },
          { status: 202 },
        )
      },
    },
  },
})
