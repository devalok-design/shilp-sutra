/**
 * github.mjs — minimal GitHub App client for the one write path (report_issue).
 *
 * No octokit: we mint the App JWT with node:crypto (RS256), exchange it for a
 * short-lived installation token (cached until ~1min before expiry), and hit
 * the REST API with fetch. Keeps the server's dep surface tiny and its blast
 * radius scoped — the App is installed with issues:write on ONE repo only.
 *
 * Env (all required to enable writes; absent → configured===false, tool returns
 * a graceful "not configured" error instead of crashing):
 *   GITHUB_APP_ID
 *   GITHUB_APP_PRIVATE_KEY        PEM; literal "\n" escapes are normalized
 *   GITHUB_APP_INSTALLATION_ID
 *   FEEDBACK_REPO                 "owner/name" (default devalok-design/shilp-sutra)
 */

import { createSign } from 'node:crypto'

const APP_ID = process.env.GITHUB_APP_ID
const PRIVATE_KEY = (process.env.GITHUB_APP_PRIVATE_KEY || '').replace(/\\n/g, '\n')
const INSTALL_ID = process.env.GITHUB_APP_INSTALLATION_ID
const REPO = process.env.FEEDBACK_REPO || 'devalok-design/shilp-sutra'

export const configured = Boolean(APP_ID && PRIVATE_KEY && INSTALL_ID)
export const feedbackRepo = REPO

const API = 'https://api.github.com'
const UA = 'shilp-sutra-mcp-server'

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

/** App-level JWT, RS256-signed with the App private key. Valid ~9min. */
function appJwt() {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: APP_ID }))
  const data = `${header}.${payload}`
  const sig = createSign('RSA-SHA256').update(data).sign(PRIVATE_KEY)
  return `${data}.${b64url(sig)}`
}

let tokenCache = { token: null, exp: 0 }

async function installationToken() {
  if (tokenCache.token && tokenCache.exp - Date.now() > 60_000) return tokenCache.token
  const res = await fetch(`${API}/app/installations/${INSTALL_ID}/access_tokens`, {
    method: 'POST',
    headers: { authorization: `Bearer ${appJwt()}`, accept: 'application/vnd.github+json', 'user-agent': UA },
  })
  if (!res.ok) throw new Error(`GitHub App auth failed (HTTP ${res.status}). Check GITHUB_APP_* env on the server.`)
  const j = await res.json()
  tokenCache = { token: j.token, exp: Date.parse(j.expires_at) }
  return j.token
}

async function ghFetch(path, init = {}) {
  const token = await installationToken()
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'user-agent': UA,
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  return res
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * Find an existing OPEN issue whose title matches `title` (normalized-equal or
 * one contains the other) — so repeated agent submissions don't spawn dupes.
 * Returns { number, html_url } or null. Search failures are non-fatal (return null).
 */
export async function findDuplicate(title) {
  const q = encodeURIComponent(`repo:${REPO} is:issue is:open in:title ${title}`)
  const res = await ghFetch(`/search/issues?per_page=10&q=${q}`)
  if (!res.ok) return null
  const { items = [] } = await res.json()
  const nt = norm(title)
  const hit = items.find((it) => {
    const ni = norm(it.title)
    return ni === nt || ni.includes(nt) || nt.includes(ni)
  })
  return hit ? { number: hit.number, html_url: hit.html_url } : null
}

/** Create an issue. Returns { number, html_url }. Throws with an agent-readable message. */
export async function createIssue({ title, body, labels }) {
  const res = await ghFetch(`/repos/${REPO}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title, body, labels }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Failed to create issue (HTTP ${res.status}). ${detail.slice(0, 300)}`)
  }
  const j = await res.json()
  return { number: j.number, html_url: j.html_url }
}
