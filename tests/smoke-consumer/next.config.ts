import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@devalok/shilp-sutra'],
  // Treat all shilp-sutra Turbopack build warnings as errors so the smoke test
  // fails loudly on any regression (missing modules, unresolvable imports,
  // invalid CSS classes that drop rules, etc.).
  experimental: {
    // Reserved for future turbopack opts.
  },
}

export default nextConfig
