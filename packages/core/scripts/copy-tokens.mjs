import { cpSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Copy only .css files from tokens (exclude .mdx, .tsx, .d.ts, etc.)
const srcTokens = join(__dirname, '..', 'src', 'tokens')
const distTokens = join(__dirname, '..', 'dist', 'tokens')

mkdirSync(distTokens, { recursive: true })

for (const file of readdirSync(srcTokens)) {
  if (file.endsWith('.css')) {
    cpSync(join(srcTokens, file), join(distTokens, file))
  }
}
console.log('Token CSS files copied to dist/tokens/')
