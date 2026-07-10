/**
 * registry.mjs — version resolution, tarball fetch/extract, per-version cache.
 *
 * Data source is the published npm tarball (registry.npmjs.org): the docs the
 * consumer actually has installed. Published versions are immutable, so cache
 * entries never expire; only the `latest` dist-tag resolution has a TTL.
 *
 * Local mode: set LOCAL_CORE_DIR to a packages/core checkout to serve its
 * working-tree docs under the pseudo-version "local" — used for development
 * and for testing manifest-backed tools before 0.45 is published.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import * as tar from 'tar'

const PACKAGE = '@devalok/shilp-sutra'
const REGISTRY = 'https://registry.npmjs.org'
const LATEST_TTL_MS = 5 * 60 * 1000

/** Tarball paths worth keeping (everything the doc-reading tools read). */
const KEEP = [
  'mcp-manifest.json',
  'llms.txt',
  'BREAKING.json',
  'MIGRATION.md',
  'AGENTS.md',
]
const KEEP_PREFIXES = ['docs/components/', 'docs/recipes/']

function wanted(path) {
  return KEEP.includes(path) || KEEP_PREFIXES.some((p) => path.startsWith(p))
}

/** version → Map(path → string content). Immutable once filled. */
const cache = new Map()
let latestCache = { value: null, at: 0 }

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.json()
}

export async function resolveLatest() {
  if (latestCache.value && Date.now() - latestCache.at < LATEST_TTL_MS) return latestCache.value
  const meta = await fetchJson(`${REGISTRY}/${PACKAGE}`)
  latestCache = { value: meta['dist-tags'].latest, at: Date.now() }
  return latestCache.value
}

export async function listVersions() {
  const meta = await fetchJson(`${REGISTRY}/${PACKAGE}`)
  return Object.keys(meta.versions)
}

/** Extract wanted files from a gzipped tarball buffer. Entries are under "package/". */
function extractDocs(tgzBuffer) {
  const files = new Map()
  const parser = new tar.Parser({
    onReadEntry(entry) {
      const path = entry.path.replace(/^package\//, '')
      if (!wanted(path)) {
        entry.resume()
        return
      }
      const chunks = []
      entry.on('data', (c) => chunks.push(c))
      entry.on('end', () => files.set(path, Buffer.concat(chunks).toString('utf8')))
    },
  })
  parser.end(gunzipSync(tgzBuffer))
  return files
}

function loadLocal(dir) {
  const files = new Map()
  for (const f of KEEP) {
    const p = join(dir, f)
    if (existsSync(p)) files.set(f, readFileSync(p, 'utf8'))
  }
  for (const prefix of KEEP_PREFIXES) {
    const base = join(dir, prefix)
    if (!existsSync(base)) continue
    const walk = (rel) => {
      for (const entry of readdirSync(join(dir, rel), { withFileTypes: true })) {
        const childRel = `${rel}${entry.name}`
        if (entry.isDirectory()) walk(`${childRel}/`)
        else files.set(childRel, readFileSync(join(dir, childRel), 'utf8'))
      }
    }
    walk(prefix)
  }
  return files
}

/**
 * Get the doc set for a version. Returns { version, files } where files is
 * Map(path → content). Throws with an agent-actionable message on failure.
 */
export async function getDocs(versionInput) {
  const localDir = process.env.LOCAL_CORE_DIR
  if (localDir && (!versionInput || versionInput === 'local')) {
    // Local mode default: serve the working tree, stamped with its real version.
    const files = loadLocal(localDir)
    const manifest = files.get('mcp-manifest.json')
    const version = manifest ? JSON.parse(manifest).packageVersion : 'local'
    return { version, files, local: true }
  }

  const version = versionInput || (await resolveLatest())
  if (cache.has(version)) return { version, files: cache.get(version) }

  const bare = PACKAGE.split('/')[1]
  const url = `${REGISTRY}/${PACKAGE}/-/${bare}-${version}.tgz`
  const res = await fetch(url)
  if (res.status === 404) {
    throw new Error(
      `Version ${version} not found on npm. Call with no version for latest, or check the version string.`
    )
  }
  if (!res.ok) throw new Error(`Tarball fetch failed: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const files = extractDocs(buf)
  cache.set(version, files)
  return { version, files }
}

export function cacheStats() {
  return { versions: [...cache.keys()], latest: latestCache.value }
}
