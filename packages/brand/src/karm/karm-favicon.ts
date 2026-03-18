type FaviconFormat = 'ico' | 'png'

export function getKarmFaviconPath(options?: {
  format?: FaviconFormat
  /** Only used for PNG: 'apple-touch-icon' | 'icon-192' | 'icon-512' */
  name?: 'apple-touch-icon' | 'icon-192' | 'icon-512'
}): string {
  const { format = 'ico', name } = options ?? {}
  const base = '@devalok/shilp-sutra-brand/assets/karm/favicons'
  if (format === 'ico') return `${base}/favicon.ico`
  return `${base}/${name ?? 'icon-512'}.png`
}

/** Returns a metadata object compatible with Next.js generateMetadata icons field */
export function generateKarmFavicon() {
  const base = '@devalok/shilp-sutra-brand/assets/karm/favicons'
  return {
    icon: [
      { url: `${base}/favicon.ico`, sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: `${base}/apple-touch-icon.png`, sizes: '180x180' },
    ],
    manifest: '@devalok/shilp-sutra-brand/assets/manifests/karm.webmanifest',
  }
}
