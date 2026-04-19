/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-brand'],
  // No Turbopack here — Next 15 + default Webpack pipeline is the whole point
  // of this variant. We want to see @tailwindcss/postcss drive CSS generation
  // against our tokens + @source fallback under the Webpack resolution rules.
}

export default nextConfig
