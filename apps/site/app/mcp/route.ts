/**
 * /mcp — runtime proxy to the shilp-sutra-mcp Railway service.
 *
 * A route handler (not a next.config rewrite) on purpose: rewrites are baked
 * at build time, and Docker builds don't see Railway service variables unless
 * declared as ARGs. Reading MCP_INTERNAL_URL at request time means the proxy
 * follows variable changes without a rebuild.
 */

import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
])

async function proxy(req: NextRequest): Promise<Response> {
  const base = process.env.MCP_INTERNAL_URL
  if (!base) {
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32603, message: 'MCP backend not configured' }, id: null },
      { status: 503 },
    )
  }

  const headers = new Headers()
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value)
  })
  // Preserve the real client IP for the backend's per-IP rate limiter.
  const clientIp = req.headers.get('x-forwarded-for') ?? ''
  if (clientIp) headers.set('x-forwarded-for', clientIp)

  const upstream = await fetch(`${base.replace(/\/$/, '')}/mcp`, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
    // Node fetch requires duplex for streamed request bodies.
    // @ts-expect-error -- duplex is not yet in the TS fetch types
    duplex: 'half',
  })

  const responseHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) responseHeaders.set(key, value)
  })

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}

export { proxy as GET, proxy as POST, proxy as DELETE }
