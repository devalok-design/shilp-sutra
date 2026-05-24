import type { Metadata, Viewport } from 'next'
import { BrandInit } from '@/components/brand-init'
import { ThemeInit } from '@/components/theme-init'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://shilp-sutra.devalok.in'),
  title: {
    default: 'shilp-sutra — Devalok Design System',
    template: '%s — shilp-sutra',
  },
  description:
    'Your brand. Every component. Out of the box. A React design system from Devalok — Tailwind 4, OKLCH tokens, 119 components. Public beta.',
  applicationName: 'shilp-sutra',
  authors: [{ name: 'Devalok Design & Strategy Studios', url: 'https://devalok.in' }],
  keywords: [
    'design system',
    'react',
    'tailwind 4',
    'shadcn alternative',
    'radix ui',
    'oklch',
    'accessible',
    'devalok',
    'shilp-sutra',
  ],
  openGraph: {
    title: 'shilp-sutra — Devalok Design System',
    description:
      'Your brand. Every component. Out of the box. A React design system from Devalok. Public beta.',
    url: 'https://shilp-sutra.devalok.in',
    siteName: 'shilp-sutra',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'shilp-sutra — Devalok Design System',
    description: 'Your brand. Every component. Out of the box. From Devalok.',
  },
  robots: { index: true, follow: true },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <BrandInit />
        <ThemeInit />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
