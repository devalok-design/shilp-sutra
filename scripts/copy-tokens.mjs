import { cpSync, mkdirSync, existsSync } from 'fs'

mkdirSync('dist/tokens', { recursive: true })
cpSync('src/tokens', 'dist/tokens', { recursive: true })
console.log('Tokens copied to dist/tokens/')

if (existsSync('src/brand/assets')) {
  mkdirSync('dist/brand/assets', { recursive: true })
  cpSync('src/brand/assets', 'dist/brand/assets', { recursive: true })
  console.log('Brand assets copied to dist/brand/assets/')
}
