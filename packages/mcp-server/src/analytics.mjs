/**
 * analytics.mjs — optional PostHog product analytics for the MCP server.
 *
 * Off by default: with no POSTHOG_API_KEY the client never initializes and
 * capture()/shutdown() are no-ops — identical safety posture to github.mjs.
 * When configured, every tool call emits one `mcp_tool_call` event so we can
 * see which docs tools consumer agents actually use, which versions they pass,
 * and error rates.
 *
 * Privacy: distinct_id is a salted hash of the client IP (rough unique-client
 * counting, never the raw IP). Only low-PII args are captured — feedback body /
 * reproduction are NEVER sent (may carry consumer code or secrets).
 *
 * Env:
 *   POSTHOG_API_KEY   PostHog project API key (enables analytics)
 *   POSTHOG_HOST      ingestion host (default https://eu.i.posthog.com)
 *   POSTHOG_IP_SALT   salt for the distinct_id hash (default: a constant)
 */

import { createHash } from 'node:crypto'

const API_KEY = process.env.POSTHOG_API_KEY
const HOST = process.env.POSTHOG_HOST || 'https://eu.i.posthog.com'
const SALT = process.env.POSTHOG_IP_SALT || 'shilp-sutra-mcp'

export const configured = Boolean(API_KEY)

let client = null
if (configured) {
  if (!process.env.POSTHOG_IP_SALT) {
    // The default salt is public (it ships in this source file), so distinct_ids
    // built from it are reversible to raw IPs by anyone with event access. Warn
    // loudly so a real salt gets set in any environment that actually ingests.
    console.warn(
      '[analytics] POSTHOG_IP_SALT is unset — using the public default salt; IP-derived distinct_ids are reversible. Set POSTHOG_IP_SALT to a secret.'
    )
  }
  const { PostHog } = await import('posthog-node')
  // flushAt low + short interval: this is a long-running server with sparse,
  // bursty traffic — we'd rather ship events promptly than hold a big batch.
  client = new PostHog(API_KEY, { host: HOST, flushAt: 20, flushInterval: 10_000 })
}

/** Salted hash of the client IP → stable-per-IP anonymous distinct_id. */
export function anonId(ip) {
  if (!ip || ip === 'unknown') return 'anonymous'
  return 'ip_' + createHash('sha256').update(SALT + ip).digest('hex').slice(0, 16)
}

/** Fire-and-forget capture. No-op when unconfigured; never throws into the request path. */
export function capture(distinctId, event, properties = {}) {
  if (!client) return
  try {
    client.capture({ distinctId, event, properties })
  } catch {
    // analytics must never break a tool response
  }
}

/** Flush + close on shutdown so buffered events aren't lost. */
export async function shutdown() {
  if (!client) return
  try {
    await client.shutdown()
  } catch {
    // ignore
  }
}
