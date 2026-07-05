/**
 * index.mjs — HTTP entry: MCP streamable transport (stateless) + /health.
 *
 * Read-only server; every request gets a fresh McpServer + transport, so no
 * session state to leak between clients. Doc content itself is cached
 * per-version in registry.mjs.
 *
 * Env:
 *   PORT            (default 3111)
 *   LOCAL_CORE_DIR  serve a local packages/core working tree as "local" version
 */

import { createServer } from 'node:http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import * as tools from './tools.mjs'
import { cacheStats } from './registry.mjs'

const PORT = Number(process.env.PORT) || 3111

const VERSION_PARAM = z
  .string()
  .optional()
  .describe(
    'shilp-sutra version to serve docs for (semver, e.g. "0.46.0"). ALWAYS pass the consumer\'s installed version from node_modules/@devalok/shilp-sutra/package.json. Defaults to latest.'
  )

function text(s) {
  return { content: [{ type: 'text', text: s }] }
}

function errorText(e) {
  return { isError: true, content: [{ type: 'text', text: e.message }] }
}

function wrap(fn) {
  return async (args) => {
    try {
      return text(await fn(args))
    } catch (e) {
      return errorText(e)
    }
  }
}

function buildServer() {
  const server = new McpServer(
    { name: 'shilp-sutra', version: '0.1.0' },
    {
      instructions:
        'Authoritative, version-exact documentation for the @devalok/shilp-sutra design system. ' +
        'Before answering any shilp-sutra question, read the consumer\'s installed version from ' +
        'node_modules/@devalok/shilp-sutra/package.json and pass it as `version` on every call. ' +
        'Prefer these tools over reading llms.txt or component docs into context — responses are smaller and version-correct.',
    }
  )

  server.tool(
    'find_component',
    'Search shilp-sutra components by keyword (authoritative component index). Empty query lists all. Returns name, tier, one-liner, import path as JSON.',
    { query: z.string().optional(), tier: z.enum(['ui', 'composed', 'shell', 'ai']).optional(), version: VERSION_PARAM },
    wrap(tools.findComponent)
  )

  server.tool(
    'get_component',
    'Authoritative, version-exact reference for one component: props/variants/defaults as JSON, usage rules, examples, composition (compound parts, composes-with, anti-patterns), changelog. Use instead of guessing props or reading doc files.',
    {
      name: z.string().describe('kebab-case component name, e.g. "button", "stat-card"'),
      sections: z.array(z.enum(['api', 'usage', 'examples', 'composition', 'changelog'])).optional()
        .describe('Slice the response — omit for all sections'),
      version: VERSION_PARAM,
    },
    wrap(tools.getComponent)
  )

  server.tool(
    'get_tokens',
    'Design-token reference (color, spacing, typography, radius, shadow, motion, z) as JSON. Omit category for a summary of counts.',
    { category: z.enum(['color', 'spacing', 'typography', 'radius', 'shadow', 'motion', 'z']).optional(), version: VERSION_PARAM },
    wrap(tools.getTokens)
  )

  server.tool(
    'get_setup',
    'Framework install recipe (vite, next-app-router, next-pages, remix, astro, tanstack-start) or guides (customize-brand, server-components, troubleshoot, upgrading). Follow steps exactly — each exists because skipping it broke a real consumer.',
    { framework: z.string().optional(), version: VERSION_PARAM },
    wrap(tools.getSetup)
  )

  server.tool(
    'upgrade',
    'Structured breaking changes + migration pointers between two shilp-sutra versions. Accepts `from` versions older than the docs floor — this is the entry point for consumers on <0.46.',
    {
      from: z.string().describe('currently installed version'),
      to: z.string().optional().describe('target version (default: latest)'),
      version: VERSION_PARAM,
    },
    wrap(tools.upgrade)
  )

  server.tool(
    'search_docs',
    'Full-text search across component docs and recipes for patterns and guidance the other tools don\'t slice (e.g. "focus ring", "dark mode toggle").',
    { query: z.string(), version: VERSION_PARAM },
    wrap(tools.searchDocs)
  )

  return server
}

const httpServer = createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true, ...cacheStats() }))
    return
  }
  if (req.url !== '/mcp') {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('POST /mcp (MCP streamable HTTP) or GET /health')
    return
  }

  try {
    const chunks = []
    for await (const c of req) chunks.push(c)
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined

    // Stateless: fresh server + transport per request (read-only workload).
    const server = buildServer()
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    res.on('close', () => {
      transport.close()
      server.close()
    })
    await server.connect(transport)
    await transport.handleRequest(req, res, body)
  } catch (e) {
    if (!res.headersSent) {
      res.writeHead(500, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: e.message }, id: null }))
    }
  }
})

httpServer.listen(PORT, () => {
  console.log(`shilp-sutra MCP listening on :${PORT} (POST /mcp, GET /health)`)
  if (process.env.LOCAL_CORE_DIR) console.log(`local mode: serving ${process.env.LOCAL_CORE_DIR}`)
})
