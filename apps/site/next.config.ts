import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')

const config: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Standalone tracing must walk up to the monorepo root so workspace
  // dependencies (`@devalok/shilp-sutra` and its dist/) are included.
  outputFileTracingRoot: repoRoot,
  transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-brand'],
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },
}

export default config
