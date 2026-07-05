import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')

// Read shilp-sutra core version at build time so site chips don't drift.
// Exposed as NEXT_PUBLIC_* so client components (SiteHeader, Hero) can read
// it without an fs hop at runtime.
const corePkg = JSON.parse(
  readFileSync(join(repoRoot, 'packages', 'core', 'package.json'), 'utf8'),
) as { version: string }

// Standalone packaging is enabled only when building inside Docker (Railway).
// Windows can't create the symlinks Next 15's standalone tracer needs, so
// local `pnpm -F site build` skips it. Dockerfile sets BUILD_STANDALONE=1.
const standalone = process.env.BUILD_STANDALONE === '1'

const config: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SHILP_SUTRA_VERSION: corePkg.version,
  },
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
  transpilePackages: ['@devalok/shilp-sutra'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'devalok-public-assets.s3.ap-south-1.amazonaws.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },
  // NOTE: /mcp is proxied by app/mcp/route.ts (runtime env read), NOT a
  // rewrite here — rewrites bake at build time and Docker builds don't see
  // Railway service variables unless declared as ARGs.
}

export default config
