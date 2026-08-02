import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { isAdmin } from '../auth'
import { sanityRead, sanityPreview } from './client.server'
import type { SanityMediaConfig } from './url'
import {
  siteSettingsQuery,
  experienceQuery,
  educationQuery,
  languagesQuery,
  skillsQuery,
  capabilitiesQuery,
  caseStudiesQuery,
  postsQuery,
  postBySlugQuery,
  postBySlugPreviewQuery,
  caseStudyBySlugQuery,
  allSlugsQuery,
} from './queries'
import {
  fallbackSettings,
  fallbackExperience,
  fallbackEducation,
  fallbackLanguages,
  fallbackSkills,
  fallbackCapabilities,
  fallbackCaseStudies,
  fallbackPosts,
} from './fallback'
import type {
  SiteSettings,
  Experience,
  Education,
  Language,
  SkillCategory,
  Capability,
  CaseStudy,
  Post,
} from './types'

function cachePublic(revalidate = 300) {
  setResponseHeader(
    'Cache-Control',
    `public, s-maxage=${revalidate}, stale-while-revalidate=600`,
  )
}

/**
 * Public Sanity project config needed to build CDN image URLs on the client.
 * Both values are non-secret (they are embedded in every CDN image URL).
 */
export const getPublicMediaConfig = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SanityMediaConfig | null> => {
    cachePublic(3600)
    const projectId = process.env.SANITY_PROJECT_ID
    if (!projectId) return null
    return {
      projectId,
      dataset: process.env.SANITY_DATASET || 'production',
    }
  },
)

export const getSiteSettings = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SiteSettings> => {
    cachePublic()
    if (!sanityRead) return fallbackSettings
    const settings = await sanityRead.fetch<SiteSettings | null>(siteSettingsQuery)
    return settings ?? fallbackSettings
  },
)

export const getExperience = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Experience[]> => {
    cachePublic()
    if (!sanityRead) return fallbackExperience
    const docs = await sanityRead.fetch<Experience[]>(experienceQuery)
    return docs.length ? docs : fallbackExperience
  },
)

export const getEducation = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Education[]> => {
    cachePublic()
    if (!sanityRead) return fallbackEducation
    const docs = await sanityRead.fetch<Education[]>(educationQuery)
    return docs.length ? docs : fallbackEducation
  },
)

export const getLanguages = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Language[]> => {
    cachePublic()
    if (!sanityRead) return fallbackLanguages
    const docs = await sanityRead.fetch<Language[]>(languagesQuery)
    return docs.length ? docs : fallbackLanguages
  },
)

export const getSkills = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SkillCategory[]> => {
    cachePublic()
    if (!sanityRead) return fallbackSkills
    const docs = await sanityRead.fetch<SkillCategory[]>(skillsQuery)
    return docs.length ? docs : fallbackSkills
  },
)

export const getCapabilities = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Capability[]> => {
    cachePublic()
    if (!sanityRead) return fallbackCapabilities
    const docs = await sanityRead.fetch<Capability[]>(capabilitiesQuery)
    return docs.length ? docs : fallbackCapabilities
  },
)

export const getCaseStudies = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CaseStudy[]> => {
    cachePublic()
    if (!sanityRead) return fallbackCaseStudies
    const docs = await sanityRead.fetch<CaseStudy[]>(caseStudiesQuery)
    return docs.length ? docs : fallbackCaseStudies
  },
)

export const getCaseStudyBySlug = createServerFn({ method: 'GET' })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<CaseStudy | null> => {
    cachePublic()
    if (!sanityRead) {
      return fallbackCaseStudies.find((c) => c.slug?.current === data.slug) ?? null
    }
    const doc = await sanityRead.fetch<CaseStudy | null>(caseStudyBySlugQuery, {
      slug: data.slug,
    })
    return doc
  })

export const getPosts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Post[]> => {
    cachePublic()
    if (!sanityRead) return fallbackPosts
    const docs = await sanityRead.fetch<Post[]>(postsQuery)
    return docs.length ? docs : fallbackPosts
  },
)

export const getPostBySlug = createServerFn({ method: 'GET' })
  .validator((data: { slug: string; preview?: boolean }) => data)
  .handler(async ({ data }): Promise<Post | null> => {
    cachePublic()
    if (!sanityRead) {
      return fallbackPosts.find((p) => p.slug?.current === data.slug) ?? null
    }
    // Draft/scheduled preview is only available to the signed-in admin.
    const usePreview = data.preview === true && (await isAdmin())
    const client = usePreview && sanityPreview ? sanityPreview : sanityRead
    const query = usePreview ? postBySlugPreviewQuery : postBySlugQuery
    const doc = await client.fetch<Post | null>(query, {
      slug: data.slug,
    })
    return doc
  })

export const getAllSlugs = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<{ type: 'post' | 'caseStudy'; slug: string }>> => {
    cachePublic(3600)
    if (!sanityRead) return []
    const rows = await sanityRead.fetch<
      Array<{ type: 'post' | 'caseStudy'; slug: string | null }>
    >(allSlugsQuery)
    return rows.filter((r) => r.slug).map((r) => ({ type: r.type, slug: r.slug! }))
  },
)
