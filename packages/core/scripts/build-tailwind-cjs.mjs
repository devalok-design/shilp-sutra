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
const cjs = presetSrc
  .replace(/^export\s*\{\s*\w+\s+as\s+default\s*\}\s*;?\s*$/m, '')
  .trimEnd()
  // Find the variable name (e.g., "const r = {")
  .replace(/^const\s+(\w+)\s*=/m, (_, name) => {
    // Append module.exports at the end
    return `const ${name} =`
  }) + '\nmodule.exports = ' +
  presetSrc.match(/^const\s+(\w+)\s*=/m)[1] + ';\nmodule.exports.default = module.exports;\n'

await writeFile(resolve(dist, 'index.cjs'), cjs)
console.log('✓ Built dist/tailwind/index.cjs (CommonJS)')
