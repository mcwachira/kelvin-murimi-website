export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  _id, _rev, name, tagline, heroHeadline, heroSubcopy,
  statusBoard, contact, location, availability, seo
}`

export const experienceQuery = `*[_type == "experience"]|order(order asc, startDate desc){
  _id, _type, title, organization, startDate, endDate, isCurrent, bullets, order
}`

export const educationQuery = `*[_type == "education"]|order(order asc, _createdAt asc){
  _id, _type, degree, institution, order
}`

export const languagesQuery = `*[_type == "language"]|order(order asc, _createdAt asc){
  _id, _type, name, level, order
}`

export const skillsQuery = `*[_type == "skillCategory"]|order(order asc){
  _id, _type, title, order, skills
}`

export const capabilitiesQuery = `*[_type == "capability"]|order(order asc){
  _id, _type, order, title, description
}`

export const caseStudiesQuery = `*[_type == "caseStudy"]|order(order asc){
  _id, _type, caseNumber, title, slug, year, organization,
  tags, summary, approach, analysis, outcome, hasSampleDashboard, dashboardMock, order
}`

export const postsQuery = `*[_type == "post" && defined(publishedAt) && publishedAt <= now()]|order(publishedAt desc){
  _id, _type, title, slug, excerpt, coverImage, tags, publishedAt, seo
}`

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0]{
  _id, _type, title, slug, excerpt, coverImage, body, tags, publishedAt, seo
}`

/** Draft/scheduled-inclusive variant used only behind the admin preview route. */
export const postBySlugPreviewQuery = `*[_type == "post" && slug.current == $slug][0]{
  _id, _type, title, slug, excerpt, coverImage, body, tags, publishedAt, seo
}`

export const caseStudyBySlugQuery = `*[_type == "caseStudy" && slug.current == $slug][0]{
  _id, _type, caseNumber, title, slug, year, organization,
  tags, summary, approach, analysis, outcome, hasSampleDashboard, dashboardMock, order
}`

/** All published slugs for sitemaps, regardless of type. Excludes scheduled/unpublished posts. */
export const allSlugsQuery = `*[
  defined(slug.current) &&
  (_type == "caseStudy" || (_type == "post" && defined(publishedAt) && publishedAt <= now()))
]{
  "type": _type, "slug": slug.current
}`
