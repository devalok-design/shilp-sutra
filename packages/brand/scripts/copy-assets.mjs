import { cpSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdirSync, statSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcAssets = join(__dirname, '..', 'src', 'assets')
const distAssets = join(__dirname, '..', 'dist', 'assets')

const assetExtensions = new Set(['.svg', '.png', '.webp', '.ico', '.webmanifest'])

function copyAssetsRecursive(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyAssetsRecursive(srcPath, destPath)
    } else {
      const ext = entry.slice(entry.lastIndexOf('.'))
      if (assetExtensions.has(ext)) {
        cpSync(srcPath, destPath)
      }
    }
  }
}

copyAssetsRecursive(srcAssets, distAssets)
console.log('Assets copied to dist/assets/')
