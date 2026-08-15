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
  const client = new PrismaClient({ adapter })
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = client
  }
  return client
}
