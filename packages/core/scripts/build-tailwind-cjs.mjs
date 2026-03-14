// Builds a CJS version of the Tailwind preset for consumers using require()
// (Tailwind's config loader uses CommonJS require() even in ESM projects)

import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = resolve(__dirname, '..', 'dist', 'tailwind')

// Read the ESM preset — it's a single const assignment + export default
const presetSrc = await readFile(resolve(dist, 'preset.js'), 'utf8')

// Convert: strip the ESM export, add module.exports
// The file looks like: const r = { ... };\nexport {\n  r as default\n};
const varMatch = presetSrc.match(/^const\s+(\w+)\s*=/m)
if (!varMatch) {
  console.error('ERROR: Could not find variable name in preset.js output. The Rollup output format may have changed.')
  process.exit(1)
}
const varName = varMatch[1]

const cjs = presetSrc
  .replace(/^export\s*\{\s*\w+\s+as\s+default\s*\}\s*;?\s*$/m, '')
  .trimEnd()
  .replace(/^const\s+(\w+)\s*=/m, (_, name) => {
    return `const ${name} =`
  }) + `\nmodule.exports = ${varName};\nmodule.exports.default = module.exports;\n`

// Validate that the ESM→CJS conversion removed all export statements
if (/\bexport\s/.test(cjs)) {
  console.error('ERROR: CJS conversion failed — output still contains ESM export statements.')
  console.error('The Rollup output format may have changed. Update the regex in build-tailwind-cjs.mjs.')
  process.exit(1)
}

await writeFile(resolve(dist, 'index.cjs'), cjs)
console.log('✓ Built dist/tailwind/index.cjs (CommonJS)')
