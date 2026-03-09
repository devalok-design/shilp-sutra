import { cpSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'

// Copy only .css files from tokens (exclude .mdx, .tsx, .d.ts, etc.)
const srcTokens = 'src/tokens'
const distTokens = 'dist/tokens'

mkdirSync(distTokens, { recursive: true })

for (const file of readdirSync(srcTokens)) {
  if (file.endsWith('.css')) {
    cpSync(join(srcTokens, file), join(distTokens, file))
  }
}
console.log('Token CSS files copied to dist/tokens/')
