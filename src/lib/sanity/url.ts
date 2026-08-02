import imageUrlBuilder from '@sanity/image-url'

export type SanityMediaConfig = {
  projectId: string
  dataset: string
}

/**
 * Build an asset URL from a Sanity asset reference (e.g.
 * `image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg`).
 *
 * Client-safe: it takes an explicit (public) project config instead of
 * reading server-only env vars. Returns `null` when no config/ref is given.
 */
export function sanityImageUrl(
  config: SanityMediaConfig | null | undefined,
  assetRef: string | { _ref?: string } | undefined | null,
  opts?: { width?: number; height?: number; format?: 'jpg' | 'webp' },
): string | null {
  if (!config || !config.projectId || !assetRef) return null
  const ref = typeof assetRef === 'string' ? assetRef : assetRef._ref
  if (!ref) return null

  const builder = imageUrlBuilder({
    projectId: config.projectId,
    dataset: config.dataset,
  })
  let image = builder.image({ _ref: ref, _type: 'image' })
  if (opts?.width) image = image.width(opts.width)
  if (opts?.height) image = image.height(opts.height)
  if (opts?.format) image = image.format(opts.format)
  return image.url()
}

/** Resolve a document's own asset reference (coverImage / ogImage / body images). */
export function assetRefFrom(
  value: unknown,
): string | { _ref?: string } | undefined | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const rec = value as { asset?: { _ref?: string }; _ref?: string }
    return rec._ref ?? rec.asset?._ref ?? null
  }
  return null
}
