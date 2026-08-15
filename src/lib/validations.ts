import { z } from 'zod'

const slug = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL-safe slug')

const tags = z.array(z.string().min(1).max(60)).max(30)

const portableBlocks = z.array(z.record(z.string(), z.unknown())).max(200).optional()

export const caseStudySchema = z.object({
  caseNumber: z.number().int().min(0).optional().nullable(),
  title: z.string().min(1).max(180),
  slug: slug.optional().nullable(),
  year: z.string().max(20).optional().nullable(),
  organization: z.string().max(160).optional().nullable(),
  tags: tags.optional(),
  summary: z.string().max(500).optional().nullable(),
  approach: portableBlocks,
  analysis: portableBlocks,
  outcome: portableBlocks,
  hasSampleDashboard: z.boolean().optional(),
  dashboardMock: z
    .object({
      quarterlyOutputData: z
        .array(
          z.object({
            label: z.string().max(60).optional(),
            value: z.number().finite().optional(),
          }),
        )
        .max(12)
        .optional(),
      coveragePercent: z.number().min(0).max(100).optional(),
      kpis: z
        .array(
          z.object({
            label: z.string().max(60).optional(),
            value: z.string().max(60).optional(),
            status: z.enum(['on-track', 'below-target']).optional(),
          }),
        )
        .max(12)
        .optional(),
    })
    .optional(),
  order: z.number().int().optional(),
})

export const postSchema = z.object({
  title: z.string().min(1).max(180),
  slug: slug.optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z
    .object({
      _type: z.string().optional(),
      asset: z
        .object({
          _type: z.string().optional(),
          _ref: z.string().optional(),
        })
        .optional(),
    })
    .optional()
    .nullable(),
  body: portableBlocks,
  tags: tags.optional(),
  publishedAt: z.string().optional().nullable(),
  seo: z
    .object({
      metaTitle: z.string().max(180).optional().nullable(),
      metaDescription: z.string().max(300).optional().nullable(),
    })
    .optional(),
  order: z.number().int().optional(),
})

export const educationSchema = z.object({
    degree: z.string().min(1).max(180),
    institution: z.string().max(180).optional().nullable(),
    order: z.number().int().optional(),
})
export const languageSchema = z.object({
    name: z.string().min(1).max(80),
    level: z.string().max(80).optional().nullable(),
    order: z.number().int().optional(),
})

export const experienceSchema = z.object({
  title: z.string().min(1).max(180),
  organization: z.string().max(160).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().optional(),
  bullets: z.array(z.string().min(1).max(400)).max(20).optional(),
  order: z.number().int().optional(),
})

export const skillCategorySchema = z.object({
  title: z.string().min(1).max(120),
  order: z.number().int().optional(),
  skills: z.array(z.string().min(1).max(80)).max(40).optional(),
})

export const capabilitySchema = z.object({
  order: z.number().int().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
})

export const siteSettingsSchema = z.object({
  name: z.string().max(120).optional(),
  tagline: z.string().max(240).optional().nullable(),
  heroHeadline: z.string().max(240).optional().nullable(),
  heroSubcopy: z.string().max(600).optional().nullable(),
  statusBoard: z
    .object({
      label: z.string().max(160).optional(),
      statusText: z.string().max(160).optional(),
      stats: z
        .array(
          z.object({
            label: z.string().max(80).optional(),
            value: z.string().max(40).optional(),
            barLevel: z.number().int().min(1).max(5).optional(),
          }),
        )
        .max(12)
        .optional(),
    })
    .optional(),
  contact: z
    .object({
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().max(40).optional().nullable(),
      linkedinUrl: z.string().max(300).optional().nullable(),
    })
    .optional(),
  location: z.string().max(120).optional().nullable(),
  availability: z.string().max(120).optional().nullable(),
  seo: z
    .object({
      metaTitle: z.string().max(180).optional().nullable(),
      metaDescription: z.string().max(300).optional().nullable(),
    })
    .optional(),
})

export const contentDocumentSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('caseStudy'), data: caseStudySchema }),
    z.object({ type: z.literal('post'), data: postSchema }),
    z.object({ type: z.literal('experience'), data: experienceSchema }),
    z.object({ type: z.literal('education'), data: educationSchema }),
    z.object({ type: z.literal('language'), data: languageSchema }),
    z.object({ type: z.literal('skillCategory'), data: skillCategorySchema }),
    z.object({ type: z.literal('capability'), data: capabilitySchema }),
])

export type CaseStudyInput = z.infer<typeof caseStudySchema>
export type PostInput = z.infer<typeof postSchema>
export type ExperienceInput = z.infer<typeof experienceSchema>
export type SkillCategoryInput = z.infer<typeof skillCategorySchema>
export type CapabilityInput = z.infer<typeof capabilitySchema>
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>
export type ContentDocumentInput = z.infer<typeof contentDocumentSchema>
export type EducationInput = z.infer<typeof educationSchema>
export type LanguageInput = z.infer<typeof languageSchema>
