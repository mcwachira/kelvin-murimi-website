// import '@tanstack/react-start/server-only'
// import { betterAuth } from 'better-auth'
// import { prismaAdapter } from '@better-auth/prisma-adapter'
// import { tanstackStartCookies } from 'better-auth/tanstack-start'
// import { getRequestHeaders } from '@tanstack/react-start/server'
// import { getPrisma } from './prisma.server'

// type AuthInstance = ReturnType<typeof betterAuth>

// /**
//  * Lazy Better Auth instance so importing this module never crashes when the
//  * database is not configured. Session reads are guarded anyway — admin-only
//  * surfaces and mutations reject cleanly without a database.
//  */
// let authInstance: AuthInstance | null = null

// export function getAuth(): AuthInstance {
//   if (!authInstance) {
//     // Cast bridges the generic-variance of the adapter options type.
//     authInstance = betterAuth({
//       baseURL: process.env.BETTER_AUTH_URL,
//       secret: process.env.BETTER_AUTH_SECRET,
//       database: prismaAdapter(getPrisma(), {
//         provider: 'postgresql',
//         transaction: true,
//       }),
//       emailAndPassword: {
//         enabled: true,
//         minPasswordLength: 8,
//       },
//       plugins: [tanstackStartCookies()],
//       advanced: {
//         cookiePrefix: 'kelvin_portfolio',
//       },
//     }) as unknown as AuthInstance
//   }
//   return authInstance
// }

// export type AdminSession = {
//   user: {
//     id: string
//     name: string
//     email: string
//   }
// } | null

// function adminEmail(): string {
//   return process.env.ADMIN_EMAIL ?? ''
// }

// /**
//  * Read the current session for the in-flight request. Returns `null` when
//  * unauthenticated or when auth/db are not configured. Admin status is derived
//  * from the configured ADMIN_EMAIL.
//  */
// export async function getCurrentSession(): Promise<AdminSession> {
//   try {
//     const session = await getAuth().api.getSession({
//       headers: getRequestHeaders(),
//     })
//     if (!session?.user) return null
//     return {
//       user: {
//         id: session.user.id,
//         name: session.user.name ?? '',
//         email: session.user.email ?? '',
//       },
//     }
//   } catch {
//     return null
//   }
// }

// /** True only when the request carries a session for the configured admin email. */
// export async function isAdmin(): Promise<boolean> {
//   const email = adminEmail()
//   if (!email) return false
//   const session = await getCurrentSession()
//   return session?.user.email?.toLowerCase() === email.toLowerCase()
// }

// export async function requireAdmin(): Promise<AdminSession> {
//   const session = await getCurrentSession()
//   if (!session) throw new Error('Unauthorized: not signed in')
//   if (session.user.email.toLowerCase() !== adminEmail().toLowerCase()) {
//     throw new Error('Unauthorized: this account is not an administrator')
//   }
//   return session
// }
