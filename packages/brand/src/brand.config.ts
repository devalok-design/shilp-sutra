export const BRAND_VERSION = '0.1.1'

export const brandConfig = {
  devalok: {
    colors: {
      brand: '#D33163',
      brandDark: '#B8284F',
    },
    minSize: { monogram: 24, wordmark: 48, full: 80 },
    clearSpace: '0.5em',
  },
  karm: {
    colors: {
      brand: '#D33163',
      brandDark: '#B8284F',
    },
    minSize: { icon: 16, wordmark: 48, wordmarkIcon: 64 },
    clearSpace: '0.5em',
  },
} as const

export type BrandName = keyof typeof brandConfig
