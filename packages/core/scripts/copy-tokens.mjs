import { cpSync, mkdirSync, existsSync, readdirSync } from 'fs'
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

if (existsSync('src/brand/assets')) {
  mkdirSync('dist/brand/assets', { recursive: true })
  cpSync('src/brand/assets', 'dist/brand/assets', { recursive: true })
  console.log('Brand assets copied to dist/brand/assets/')
}
