import { useLoaderData } from '@tanstack/react-router'
import type { SanityMediaConfig } from './sanity/url'
import type { SiteSettings } from './sanity/types'

/**
 * Reads data already fetched once by the root route loader (see __root.tsx),
 * so pages that only need it for display don't issue a duplicate server-fn
 * round trip on every navigation.
 */
export function useSiteSettings(): SiteSettings {
  return useLoaderData({ from: '__root__' }).settings
}

export function useMediaConfig(): SanityMediaConfig | null {
  return useLoaderData({ from: '__root__' }).media
}
