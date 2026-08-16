import '@tanstack/react-start/server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#/generated/prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

/**
 * Lazy Prisma singleton. The client is created on first use so the public
 * site (and server-function imports) never crash when DATABASE_URL is unset.
 * Kept server-only; the generated client imports Node-only modules.
 */
export function getPrisma(): PrismaClient {
  if (globalThis.__prisma) return globalThis.__prisma
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required')
  }
  const adapter = new PrismaPg({ connectionString })
  // Default maxWait (2s) / timeout (5s) are tuned for a local/low-latency DB.
  // Better Auth wraps sign-up/sign-in in a transaction, and a fresh
  // connection to a remote pooled Postgres (e.g. Supabase) can take longer
  // than 2s to hand a pooled connection to the transaction — bump both so
  // real logins don't intermittently fail with "unable to start a
  // transaction in the given time" under normal network latency.
  const client = new PrismaClient({
    adapter,
    transactionOptions: { maxWait: 10_000, timeout: 20_000 },
  })
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = client
  }
  return client
}
