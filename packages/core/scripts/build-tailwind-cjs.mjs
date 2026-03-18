// Builds a CJS version of the Tailwind preset for consumers using require()
// (Tailwind's config loader uses CommonJS require() even in ESM projects)
//
// Uses esbuild for robust ESM→CJS conversion instead of hand-rolled regexes.
// esbuild handles all import/export patterns including edge cases that regex misses.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = resolve(__dirname, '..', 'dist', 'tailwind')
const outfile = resolve(dist, 'index.cjs')

buildSync({
  entryPoints: [resolve(dist, 'preset.js')],
  outfile,
  format: 'cjs',
  platform: 'node',
  bundle: false,       // Don't resolve imports — keep externals as-is
  logLevel: 'warning',
})

// esbuild wraps default exports as { default: X }. Tailwind's config loader
// expects `module.exports = preset` directly. Append a flat re-export.
const cjs = readFileSync(outfile, 'utf8')
writeFileSync(outfile, cjs + '\nmodule.exports = module.exports.default;\nmodule.exports.default = module.exports;\n')

console.log('\u2713 Built dist/tailwind/index.cjs (CommonJS via esbuild)')
