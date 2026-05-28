import type { Metadata, Viewport } from 'next'
import { BrandInit } from '@/components/brand-init'
import { ThemeInit } from '@/components/theme-init'
import { SHILP_SUTRA_MINOR } from '@/lib/version'
import './globals.css'

const SITE_URL = 'https://shilp-sutra.devalok.in'
const SITE_TITLE = 'shilp-sutra · Devalok Design System'
const SITE_DESCRIPTION =
  `Your brand. Every component. Out of the box. A React design system from Devalok. Tailwind 4, OKLCH tokens, 119 components. Public beta v${SHILP_SUTRA_MINOR}.`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s · shilp-sutra',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'shilp-sutra',
  authors: [{ name: 'Devalok Design and Strategy Studio', url: 'https://devalok.in' }],
  creator: 'Devalok Design and Strategy Studio',
  publisher: 'Devalok Design and Strategy Studio',
  category: 'design system',
  keywords: [
    'design system',
    'react design system',
    'tailwind 4',
    'tailwindcss 4',
    'shadcn alternative',
    'radix ui',
    'oklch',
    'oklch tokens',
    'accessible components',
    'wcag aa',
    'devalok',
    'shilp-sutra',
    'rsc safe',
    'react server components',
    'next.js components',
    'framer-motion',
    'india',
    'bharat',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  // Icons + apple-touch-icon are auto-discovered by Next 15 from
  // app/icon.tsx and app/apple-icon.tsx. No manual icons[] needed.
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'shilp-sutra',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'shilp-sutra. Your brand. Every component. Out of the box.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: 'Your brand. Every component. Out of the box. From Devalok.',
    creator: '@devalok_in',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-shape="slightly-rounded" suppressHydrationWarning>
      <head>
        <BrandInit />
        <ThemeInit />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
