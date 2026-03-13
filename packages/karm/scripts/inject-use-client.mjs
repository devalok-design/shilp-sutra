/**
 * Post-build: inject "use client" directive into all JS and .d.ts files in dist/.
 * All karm components are client-only (use React hooks).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(full))
    } else if (
      ['.js', '.mjs'].includes(extname(entry.name)) ||
      entry.name.endsWith('.d.ts')
    ) {
      files.push(full)
    }
  }
  return files
}

async function inject() {
  const files = await walk(DIST)
  let count = 0
  for (const file of files) {
    const content = await readFile(file, 'utf8')
    if (content.startsWith('"use client"') || content.startsWith("'use client'")) continue
    await writeFile(file, `"use client";\n${content}`)
    count++
  }
  console.log(`[inject-use-client] Added "use client" to ${count} files in karm dist/`)
}

inject().catch(console.error)
