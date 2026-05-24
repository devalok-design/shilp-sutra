import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')

// Standalone packaging is enabled only when building inside Docker (Railway).
// Windows can't create the symlinks Next 15's standalone tracer needs, so
// local `pnpm -F site build` skips it. Dockerfile sets BUILD_STANDALONE=1.
const standalone = process.env.BUILD_STANDALONE === '1'

const config: NextConfig = {
  reactStrictMode: true,
  ...(standalone
    ? {
        output: 'standalone' as const,
        // Standalone tracing must walk up to the monorepo root so workspace
        // dependencies (`@devalok/shilp-sutra` and its dist/) are included.
        outputFileTracingRoot: repoRoot,
      }
    : {}),
  transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-brand'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'devalok-public-assets.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },
}

export default config
