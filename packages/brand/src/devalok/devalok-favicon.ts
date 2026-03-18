type FaviconFormat = 'ico' | 'svg' | 'png'

export function getDevalokFaviconPath(options?: {
  format?: FaviconFormat
  /** Only used for PNG: 'apple-touch-icon' | 'icon-192' | 'icon-512' */
  name?: 'apple-touch-icon' | 'icon-192' | 'icon-512'
}): string {
  const { format = 'svg', name } = options ?? {}
  const base = '@devalok/shilp-sutra-brand/assets/devalok/favicons'
  if (format === 'ico') return `${base}/favicon.ico`
  if (format === 'svg') return `${base}/favicon.svg`
  return `${base}/${name ?? 'icon-512'}.png`
}

/** Returns a metadata object compatible with Next.js generateMetadata icons field */
export function generateDevalokFavicon() {
  const base = '@devalok/shilp-sutra-brand/assets/devalok/favicons'
  return {
    icon: [
      { url: `${base}/favicon.ico`, sizes: '32x32', type: 'image/x-icon' },
      { url: `${base}/favicon.svg`, type: 'image/svg+xml' },
    ],
    apple: [
      { url: `${base}/apple-touch-icon.png`, sizes: '180x180' },
    ],
  }
}
