export type PortableTextBlock = {
  _type: 'block'
  _key?: string
  style?: 'normal' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'code'
  listItem?: 'bullet'
  markDefs?: Array<{
    _key: string
    _type: string
    href?: string
  }>
  children?: Array<{
    _type: 'span'
    _key?: string
    text: string
    marks?: string[]
  }>
}

export type PortableTextItem =
  | PortableTextBlock
  | {
      _type: 'image'
      _key?: string
      asset?: { _ref: string; _type?: string }
    }
  | {
      _type: 'code'
      _key?: string
      code?: string
      language?: string
    }

export type Slug = { _type?: 'slug'; current?: string | null }

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type Seo = {
  metaTitle?: string | null
  metaDescription?: string | null
  ogImage?: { asset?: { _ref?: string } } | null
}

export type StatusStat = {
  _key?: string
  label?: string
  value?: string
  barLevel?: number
}

export type StatusBoard = {
  label?: string
  statusText?: string
  stats?: StatusStat[]
}

export type ContactInfo = {
  email?: string
  phone?: string
  linkedinUrl?: string
}

export type SiteSettings = {
  _id: string
  _type: 'siteSettings'
  _rev?: string
  name?: string
  tagline?: string
  heroHeadline?: string
  heroSubcopy?: string
  statusBoard?: StatusBoard
  contact?: ContactInfo
  location?: string
  availability?: string
  seo?: Seo
}

export type Experience = {
  _id: string
  _type: 'experience'
  _rev?: string
  title: string
  organization?: string
  startDate?: string | null
  endDate?: string | null
  isCurrent?: boolean
  bullets?: string[]
  order?: number
}

export type Education = {
  _id: string
  _type: 'education'
  degree?: string
  institution?: string
  order?: number
}

export type Language = {
  _id: string
  _type: 'language'
  name?: string
  level?: string
  order?: number
}

export type SkillCategory = {
  _id: string
  _type: 'skillCategory'
  title: string
  order?: number
  skills?: string[]
}

export type Capability = {
  _id: string
  _type: 'capability'
  order?: number
  title?: string
  description?: string
}

export type DashboardKpi = {
  _key?: string
  label?: string
  value?: string
  status?: 'on-track' | 'below-target'
}

export type DashboardMock = {
  quarterlyOutputData?: Array<{ _key?: string; label?: string; value?: number }>
  coveragePercent?: number
  kpis?: DashboardKpi[]
}

export type CaseStudy = {
  _id: string
  _type: 'caseStudy'
  caseNumber?: number
  title: string
  slug?: Slug
  year?: string
  organization?: string
  tags?: string[]
  summary?: string
  approach?: PortableTextBlock[]
  analysis?: PortableTextBlock[]
  outcome?: PortableTextBlock[]
  hasSampleDashboard?: boolean
  dashboardMock?: DashboardMock
  order?: number
}

export type Post = {
  _id: string
  _type: 'post'
  title: string
  slug?: Slug
  excerpt?: string
  coverImage?: { asset?: { _ref?: string; _type?: string } } | null
  body?: PortableTextItem[]
  tags?: string[]
  publishedAt?: string | null
  seo?: Seo
  order?: number
}
