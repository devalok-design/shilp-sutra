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
 *   POSTHOG_API_KEY optional — enables product analytics (see analytics.mjs)
 */

import { createServer } from 'node:http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import * as tools from './tools.mjs'
import * as analytics from './analytics.mjs'
import { cacheStats } from './registry.mjs'

const PORT = Number(process.env.PORT) || 3111

// Per-IP token bucket: RATE_LIMIT_RPM requests/minute, burst up to the same.
// In-process is enough — single instance, read-only workload, and the data is
// public on npm anyway; this only blunts scraping/runaway loops.
const RATE_LIMIT_RPM = Number(process.env.RATE_LIMIT_RPM) || 60
const buckets = new Map()
function rateLimited(ip) {
  const now = Date.now()
  let b = buckets.get(ip)
  if (!b) {
    b = { tokens: RATE_LIMIT_RPM, at: now }
    buckets.set(ip, b)
  }
  b.tokens = Math.min(RATE_LIMIT_RPM, b.tokens + ((now - b.at) / 60_000) * RATE_LIMIT_RPM)
  b.at = now
  if (b.tokens < 1) return true
  b.tokens -= 1
  return false
}
// Write path (report_issue) gets a much tighter per-IP bucket than reads: it
// creates public GitHub issues, so runaway loops / spam must be blunted hard.
const WRITE_LIMIT_PER_HOUR = Number(process.env.WRITE_LIMIT_PER_HOUR) || 5
const writeBuckets = new Map()
function writeLimited(ip) {
  const now = Date.now()
  let b = writeBuckets.get(ip)
  if (!b) {
    b = { tokens: WRITE_LIMIT_PER_HOUR, at: now }
    writeBuckets.set(ip, b)
  }
  b.tokens = Math.min(WRITE_LIMIT_PER_HOUR, b.tokens + ((now - b.at) / 3_600_000) * WRITE_LIMIT_PER_HOUR)
  b.at = now
  if (b.tokens < 1) return true
  b.tokens -= 1
  return false
}

// Sweep idle buckets so the maps can't grow unbounded.
setInterval(() => {
  const readCutoff = Date.now() - 10 * 60_000
  for (const [ip, b] of buckets) if (b.at < readCutoff) buckets.delete(ip)
  const writeCutoff = Date.now() - 2 * 3_600_000
  for (const [ip, b] of writeBuckets) if (b.at < writeCutoff) writeBuckets.delete(ip)
}, 60_000).unref()

const VERSION_PARAM = z
  .string()
  .optional()
  .describe(
    'shilp-sutra version to serve docs for (semver, e.g. "0.45.0"). ALWAYS pass the consumer\'s installed version from node_modules/@devalok/shilp-sutra/package.json. Defaults to latest.'
  )

function text(s) {
  return { content: [{ type: 'text', text: s }] }
}

function errorText(e) {
  return { isError: true, content: [{ type: 'text', text: e.message }] }
}

// Low-PII properties for analytics. NEVER includes report_issue title/body/
// reproduction — those may carry consumer code or secrets.
function toolProps(name, args = {}) {
  const p = { tool: name, version: args.version || 'latest' }
  if (args.tier) p.tier = args.tier
  if (args.name || args.component) p.component = args.name || args.component
  if (args.category) p.category = args.category
  if (args.framework) p.framework = args.framework
  if (args.query) p.query = args.query
  if (args.from) p.from = args.from
  if (args.to) p.to = args.to
  if (args.severity) p.severity = args.severity
  return p
}

// Wrap a tool handler: run it, emit one `mcp_tool_call` analytics event
// (distinct_id = salted IP hash), map errors to the MCP error envelope.
function instrument(ctx, name, fn) {
  return async (args) => {
    let isError = false
    try {
      return text(await fn(args))
    } catch (e) {
      isError = true
      return errorText(e)
    } finally {
      analytics.capture(analytics.anonId(ctx.ip), 'mcp_tool_call', { ...toolProps(name, args), isError })
    }
  }
}

function buildServer(ctx = {}) {
  const server = new McpServer(
    { name: 'shilp-sutra', version: '0.1.0' },
    {
      instructions:
        'Authoritative, version-exact documentation for the @devalok/shilp-sutra design system. ' +
        'Before answering any shilp-sutra question, read the consumer\'s installed version from ' +
        'node_modules/@devalok/shilp-sutra/package.json and pass it as `version` on every call. ' +
        'Prefer these tools over reading llms.txt or component docs into context — responses are smaller and version-correct. ' +
        'SETTING UP in a project? Run this sequence instead of guessing: detect_framework(package.json) → get_setup(recipe) → preflight(framework, imports) to install peer deps → validate_snippet(code) BEFORE you write each file → verify_setup(...) after. This closes the four setup traps: peer-dep cliffs, TW4 dead classes (which fail silently), wrong-recipe, and mis-wired CSS/config. ' +
        'If you hit a bug, a broken recipe, a docs gap, or want to suggest a feature, call report_issue — it files a public GitHub issue for maintainer triage.',
    }
  )

  server.tool(
    'find_component',
    'Search shilp-sutra components by keyword (authoritative component index). Empty query lists all. Returns name, tier, one-liner, import path as JSON.',
    { query: z.string().optional(), tier: z.enum(['ui', 'composed', 'shell', 'ai']).optional(), version: VERSION_PARAM },
    instrument(ctx, 'find_component', tools.findComponent)
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
    instrument(ctx, 'get_component', tools.getComponent)
  )

  server.tool(
    'get_tokens',
    'Design-token reference (color, spacing, typography, radius, shadow, motion, z) as JSON. Omit category for a summary of counts.',
    { category: z.enum(['color', 'spacing', 'typography', 'radius', 'shadow', 'motion', 'z']).optional(), version: VERSION_PARAM },
    instrument(ctx, 'get_tokens', tools.getTokens)
  )

  server.tool(
    'get_setup',
    'Framework install recipe (vite, next-app-router, next-pages, remix, astro, tanstack-start) or guides (customize-brand, server-components, troubleshoot, upgrading). Follow steps exactly — each exists because skipping it broke a real consumer.',
    { framework: z.string().optional(), version: VERSION_PARAM },
    instrument(ctx, 'get_setup', tools.getSetup)
  )

  server.tool(
    'upgrade',
    'Structured breaking changes + migration pointers between two shilp-sutra versions. Accepts `from` versions older than the docs floor — this is the entry point for consumers on <0.45.',
    {
      from: z.string().describe('currently installed version'),
      to: z.string().optional().describe('target version (default: latest)'),
      version: VERSION_PARAM,
    },
    instrument(ctx, 'upgrade', tools.upgrade)
  )

  server.tool(
    'search_docs',
    'Full-text search across component docs and recipes for patterns and guidance the other tools don\'t slice (e.g. "focus ring", "dark mode toggle").',
    { query: z.string(), version: VERSION_PARAM },
    instrument(ctx, 'search_docs', tools.searchDocs)
  )

  server.tool(
    'preflight',
    'Before writing setup code: given a framework and the component subpaths you intend to import, returns the exact install command for the optional PEER dependencies those components need (data-table, charts, date-picker, rich-text-editor, input-otp, file-preview, markdown-viewer). Importing one without its peer fails the build with "Failed to resolve import" — call this first to avoid that. Also flags barrel-import hazards.',
    {
      framework: z.string().optional().describe('vite | next-app-router | next-pages | remix | astro | tanstack-start'),
      imports: z.array(z.string()).optional().describe('Import specifiers or component names you plan to use, e.g. ["@devalok/shilp-sutra/ui/data-table", "date-picker"].'),
      packageManager: z.enum(['pnpm', 'npm', 'yarn', 'bun']).optional().describe('Defaults to pnpm.'),
      version: VERSION_PARAM,
    },
    instrument(ctx, 'preflight', tools.preflight)
  )

  server.tool(
    'validate_snippet',
    'Pre-write linter. Paste the JSX/TSX/CSS you are about to write; returns TW4 dead-class usage (bare `shadow`, `shadow-0N`, `-surface-N`, `bg-gradient-to-*`, `-[--x]`, removed `/tailwind` preset), removed Button variant/color values, invalid enum prop values (checked against the version-exact manifest), and barrel imports of peer-cliff components. Catches the SILENT failures (a dead class throws no error, it just renders nothing).',
    { code: z.string().describe('The code you intend to write (JSX/TSX/CSS).'), version: VERSION_PARAM },
    instrument(ctx, 'validate_snippet', tools.validateSnippet)
  )

  server.tool(
    'detect_framework',
    'Given the consumer app\'s package.json, returns the correct setup recipe id + package manager, so you never guess (or follow a recipe for the wrong framework). Encodes the tricky cases: @tanstack/react-start vs the retired @tanstack/start, Remix vs React-Router-as-Remix, next-app vs next-pages, Vite/React-Router. Feed the result to get_setup.',
    {
      packageJson: z.string().describe('Contents of the consumer app package.json (JSON).'),
      hasAppDir: z.boolean().optional().describe('True if an app/ directory with route files exists (Next routing disambiguation).'),
      hasPagesDir: z.boolean().optional().describe('True if a pages/ directory with route files exists.'),
      version: VERSION_PARAM,
    },
    instrument(ctx, 'detect_framework', tools.detectFramework)
  )

  server.tool(
    'verify_setup',
    'Post-install gate. Pass whatever you have (globalsCss, nextConfig, the imports you used, installedDeps) and it returns a pass/FAIL checklist for the invisible-but-fatal wiring: both CSS imports present AND in the right order, next.config transpilePackages, and that every imported component\'s peers are installed. Turns "the build passed, is it actually wired?" into a checkable answer.',
    {
      framework: z.string().optional(),
      globalsCss: z.string().optional().describe('Contents of the global CSS entry.'),
      nextConfig: z.string().optional().describe('Contents of next.config.* (Next only).'),
      imports: z.array(z.string()).optional().describe('Component import specifiers used in the app.'),
      installedDeps: z.string().optional().describe('Installed deps: the package.json contents, or a space/comma-separated list of package names.'),
      version: VERSION_PARAM,
    },
    instrument(ctx, 'verify_setup', tools.verifySetup)
  )

  server.tool(
    'report_issue',
    'File a bug report, feature request, suggestion, or docs-gap on the shilp-sutra repo when you hit a wall using the design system. ' +
      'Creates a PUBLIC GitHub issue at devalok-design/shilp-sutra (labeled agent-filed + needs-triage) — do not include secrets or private code. ' +
      'Deduplicates against open issues. Prefer this over silently working around a problem: it is how the design system improves. ' +
      'Include the consumer\'s installed version, and a minimal reproduction for bugs.',
    {
      category: z.enum(['bug', 'feature', 'suggestion', 'docs']).describe(
        'bug = broken/incorrect behavior; feature = new capability; suggestion = DX/API/polish idea; docs = missing/wrong/contradictory documentation'
      ),
      title: z.string().describe('One-line summary. Specific — "Button loading spinner ignores size prop", not "Button broken".'),
      body: z.string().describe('What happened / what you want, and why. For bugs: expected vs actual behavior.'),
      reproduction: z.string().optional().describe('Bugs: minimal repro — code snippet, steps, stack trace, or file:line the docs pointed to vs. what you saw.'),
      component: z.string().optional().describe('kebab-case component name if the issue is scoped to one, e.g. "table-row-link".'),
      framework: z.enum(['vite', 'next-app', 'next-pages', 'astro', 'remix', 'tanstack', 'other']).optional()
        .describe('Consumer app framework, if relevant to the bug.'),
      severity: z.enum(['urgent', 'normal', 'nice-to-have']).optional()
        .describe('urgent = install-break / runtime crash / security; normal = API/docs/agent-trap; nice-to-have = polish/preference/feature.'),
      version: VERSION_PARAM,
    },
    instrument(ctx, 'report_issue', (args) => tools.reportIssue(args, ctx))
  )

  return server
}

const httpServer = createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true, analytics: analytics.configured, ...cacheStats() }))
    return
  }
  if (req.url !== '/mcp') {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('POST /mcp (MCP streamable HTTP) or GET /health')
    return
  }

  // Behind the site proxy the client IP arrives in x-forwarded-for.
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
  if (rateLimited(ip)) {
    analytics.capture(analytics.anonId(ip), 'mcp_rate_limited', { type: 'read', limit: RATE_LIMIT_RPM })
    res.writeHead(429, { 'content-type': 'application/json', 'retry-after': '60' })
    res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: `Rate limit: ${RATE_LIMIT_RPM} requests/minute. Retry after 60s.` }, id: null }))
    return
  }

  try {
    const chunks = []
    for await (const c of req) chunks.push(c)
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined

    // Stateless: fresh server + transport per request. ctx carries the per-IP
    // write guard for report_issue (the one non-read-only tool).
    const server = buildServer({
      ip,
      checkWriteLimit: () => {
        if (writeLimited(ip)) {
          analytics.capture(analytics.anonId(ip), 'mcp_rate_limited', { type: 'write', limit: WRITE_LIMIT_PER_HOUR })
          throw new Error(
            `Feedback rate limit: ${WRITE_LIMIT_PER_HOUR} submissions/hour per client. ` +
              'Retry later, or file at https://github.com/devalok-design/shilp-sutra/issues/new/choose.'
          )
        }
      },
    })
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
  if (analytics.configured) console.log('analytics: PostHog enabled')
})

// Flush buffered analytics before the process exits (Railway sends SIGTERM on redeploy).
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    httpServer.close()
    analytics.shutdown().finally(() => process.exit(0))
  })
}
