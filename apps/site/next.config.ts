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
  // Build-time lint runs the root monorepo's flat config, which references
  // `react-hooks/exhaustive-deps` — a rule provided by a plugin not installed
  // inside apps/site. Lint runs in CI / pre-publish-audit; skipping during
  // Next build keeps shipping unblocked.
  eslint: { ignoreDuringBuilds: true },
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
    ],
  },
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },
}

export default config
