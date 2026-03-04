type FaviconColor = 'brand' | 'black' | 'white'
type FaviconSize = 96 | 180 | 192 | 512

export function getKarmFaviconPath(options?: {
  color?: FaviconColor
  size?: FaviconSize
  format?: 'png' | 'svg' | 'ico'
}): string {
  const { color = 'brand', size = 96, format = 'png' } = options ?? {}
  if (format === 'ico') {
    return `@devalok/shilp-sutra-brand/assets/karm/favicons/favicon-${color}.ico`
  }
  if (format === 'svg') {
    return `@devalok/shilp-sutra-brand/assets/karm/favicons/favicon-${color}.svg`
  }
  return `@devalok/shilp-sutra-brand/assets/karm/favicons/favicon-${color}-${size}.png`
}

/** Returns a metadata object compatible with Next.js generateMetadata icons field */
export function generateKarmFavicon(options?: { color?: FaviconColor }) {
  const color = options?.color ?? 'brand'
  return {
    icon: [
      {
        url: getKarmFaviconPath({ color, size: 96, format: 'png' }),
        sizes: '96x96',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: getKarmFaviconPath({ color, size: 180, format: 'png' }),
        sizes: '180x180',
      },
    ],
    manifest:
      '@devalok/shilp-sutra-brand/assets/manifests/karm.webmanifest',
  }
}
