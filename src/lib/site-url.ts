export const SITE_URL = 'https://kelvinmurimi.com'

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
