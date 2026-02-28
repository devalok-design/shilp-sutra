import { cpSync, mkdirSync } from 'fs'

mkdirSync('dist/tokens', { recursive: true })
cpSync('src/tokens', 'dist/tokens', { recursive: true })

console.log('Tokens copied to dist/tokens/')
