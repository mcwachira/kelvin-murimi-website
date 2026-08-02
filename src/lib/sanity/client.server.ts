import { createClient, type SanityClient } from '@sanity/client'

export function sanityEnv() {
  return {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    writeToken: process.env.SANITY_API_WRITE_TOKEN,
    previewToken: process.env.SANITY_PREVIEW_TOKEN,
  }
}

export const isSanityConfigured = (): boolean => Boolean(process.env.SANITY_PROJECT_ID)

export const sanityRead: SanityClient | null = isSanityConfigured()
  ? createClient({
      projectId: process.env.SANITY_PROJECT_ID!,
      dataset: process.env.SANITY_DATASET || 'production',
      apiVersion: '2026-08-01',
      useCdn: true,
    })
  : null

/** Read client that can see drafts and unpublished changes (used for dashboard preview). */
export const sanityPreview: SanityClient | null =
  isSanityConfigured() && process.env.SANITY_PREVIEW_TOKEN
    ? createClient({
        projectId: process.env.SANITY_PROJECT_ID!,
        dataset: process.env.SANITY_DATASET || 'production',
        apiVersion: '2026-08-01',
        useCdn: false,
        token: process.env.SANITY_PREVIEW_TOKEN,
        perspective: 'previewDrafts',
      })
    : null

export const sanityWrite: SanityClient | null =
  isSanityConfigured() && process.env.SANITY_API_WRITE_TOKEN
    ? createClient({
        projectId: process.env.SANITY_PROJECT_ID!,
        dataset: process.env.SANITY_DATASET || 'production',
        apiVersion: '2026-08-01',
        useCdn: false,
        token: process.env.SANITY_API_WRITE_TOKEN,
      })
    : null

export function requireWriteClient(): SanityClient {
  if (!sanityWrite) {
    throw new Error('Sanity write environment is not configured')
  }
  return sanityWrite
}

export function requireReadClient(): SanityClient {
  if (!sanityRead) {
    throw new Error('Sanity read environment is not configured')
  }
  return sanityRead
}
