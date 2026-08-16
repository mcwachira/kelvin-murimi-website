/**
 * Standalone Node entry point for running the built app outside Vercel
 * (e.g. in a Docker container). `vite build` emits dist/server/server.js as a
 * Web-standard fetch(request) => Response handler with no listener attached
 * (Vercel's @vercel/node builder calls it directly) — this file adapts that
 * handler onto a real HTTP listener via srvx.
 */
import { serve } from 'srvx/node'
import handler from './dist/server/server.js'

serve({
  fetch: handler.fetch,
  port: Number(process.env.PORT) || 3000,
  hostname: '0.0.0.0',
})
