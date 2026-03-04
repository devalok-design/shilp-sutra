type FaviconColor = 'brand' | 'black' | 'white'
type FaviconSize = 16 | 32 | 96 | 180 | 512

export function getDevalokFaviconPath(options?: {
  color?: FaviconColor
  size?: FaviconSize
  format?: 'png' | 'svg'
}): string {
  const { color = 'brand', size = 32, format = 'png' } = options ?? {}
  if (format === 'svg') {
    return `@devalok/shilp-sutra/brand/assets/devalok/favicons/favicon-${color}.svg`
  }
  return `@devalok/shilp-sutra/brand/assets/devalok/favicons/favicon-${color}-${size}.png`
}

/** Returns a metadata object compatible with Next.js generateMetadata icons field */
export function generateDevalokFavicon(options?: { color?: FaviconColor }) {
  const color = options?.color ?? 'brand'
  return {
    icon: [
      {
        url: getDevalokFaviconPath({ color, size: 32, format: 'png' }),
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: getDevalokFaviconPath({ color, size: 96, format: 'png' }),
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: getDevalokFaviconPath({ color, format: 'svg' }),
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: getDevalokFaviconPath({ color, size: 180, format: 'png' }),
        sizes: '180x180',
      },
    ],
  }
}
