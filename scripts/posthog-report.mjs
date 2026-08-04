#!/usr/bin/env node
/**
 * posthog-report.mjs — read the analytics we already collect.
 *
 * Both instrumented surfaces write to the SAME PostHog project (EU region):
 *   - apps/site          posthog-js       $pageview, $pageleave, autocapture,
 *                                         code_copied, cta_click
 *   - packages/mcp-server posthog-node    mcp_tool_call, mcp_rate_limited
 *   - packages/core       nothing. A UI library must not phone home; do not add it.
 *
 * Until this script existed there was no way to READ any of it without opening
 * the PostHog UI, which meant distribution decisions got made on npm download
 * counts and GitHub clone counts — both of which are heavily polluted by our own
 * CI and flatter the numbers.
 *
 * WHAT THIS CAN AND CANNOT TELL YOU
 *   CAN:    which component docs pages people open, which components AI agents
 *           look up through the MCP, which install snippets get copied, which
 *           CTAs convert, MCP error rates and cold-cache latency.
 *   CANNOT: which components are actually imported or rendered in consumer apps.
 *           The published package ships zero telemetry. MCP component lookups are
 *           the closest available proxy for real usage — they measure interest,
 *           not adoption. Do not present them as adoption.
 *
 * SETUP
 *   The ingestion key (`phc_…`) that the site and MCP use is write-only and will
 *   NOT work here. Reading needs a PERSONAL API key (`phx_…`):
 *
 *     PostHog → top-right avatar → Personal API keys → Create
 *     Scopes needed (read-only is enough):  query:read, project:read
 *     Then:  export POSTHOG_PERSONAL_API_KEY=phx_...
 *
 *   Optional:
 *     POSTHOG_PROJECT_ID    skip project auto-discovery
 *     POSTHOG_API_HOST      default https://eu.posthog.com
 *                           NOTE: this is the APP host, not the ingestion host.
 *                           `eu.i.posthog.com` accepts events but serves no API.
 *
 * USAGE
 *   node scripts/posthog-report.mjs                # last 30 days
 *   node scripts/posthog-report.mjs --days 7
 *   node scripts/posthog-report.mjs --json         # machine-readable
 *
 * The key is read from the environment only — never pass it as an argv flag,
 * where it would land in shell history and process listings.
 */

const API_HOST = (process.env.POSTHOG_API_HOST || 'https://eu.posthog.com').replace(/\/$/, '')
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY

const argv = process.argv.slice(2)
const asJson = argv.includes('--json')
const daysArg = argv.indexOf('--days')
const DAYS = daysArg === -1 ? 30 : Number(argv[daysArg + 1])

if (!Number.isInteger(DAYS) || DAYS < 1 || DAYS > 365) {
  console.error(`--days must be an integer between 1 and 365 (got ${argv[daysArg + 1]})`)
  process.exit(2)
}

if (!API_KEY) {
  console.error(`POSTHOG_PERSONAL_API_KEY is not set.

This needs a PERSONAL API key (phx_...), not the phc_ ingestion key the site and
MCP server use — that one is write-only and cannot read.

  PostHog -> avatar (top right) -> Personal API keys -> Create
  Scopes: query:read, project:read   (read-only is enough)

  export POSTHOG_PERSONAL_API_KEY=phx_...

Optional: POSTHOG_PROJECT_ID to skip auto-discovery, POSTHOG_API_HOST if the
project is not on EU cloud (default ${API_HOST}).`)
  process.exit(1)
}

if (!API_KEY.startsWith('phx_')) {
  console.error(
    `POSTHOG_PERSONAL_API_KEY does not look like a personal API key (expected a phx_ prefix, got "${API_KEY.slice(0, 4)}…").\n` +
      `A phc_ key is the publishable INGESTION key — it can write events but cannot read them.`,
  )
  process.exit(1)
}

/** Fail loudly with PostHog's own error text; a silent empty table reads as "no traffic". */
async function api(path, init = {}) {
  const res = await fetch(`${API_HOST}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const body = await res.text()
  if (!res.ok) {
    throw new Error(
      `${init.method || 'GET'} ${path} -> ${res.status} ${res.statusText}\n${body.slice(0, 600)}`,
    )
  }
  try {
    return JSON.parse(body)
  } catch {
    throw new Error(`${path} returned non-JSON:\n${body.slice(0, 300)}`)
  }
}

async function resolveProjectId() {
  if (process.env.POSTHOG_PROJECT_ID) return process.env.POSTHOG_PROJECT_ID
  const { results = [] } = await api('/api/projects/')
  if (results.length === 0) throw new Error('This key can see no projects. Check its scopes.')
  if (results.length > 1) {
    const list = results.map((p) => `  ${p.id}  ${p.name}`).join('\n')
    throw new Error(
      `This key can see ${results.length} projects — set POSTHOG_PROJECT_ID to pick one:\n${list}`,
    )
  }
  return results[0].id
}

/** Run one HogQL query, returning { columns, rows }. */
async function hogql(projectId, query) {
  const out = await api(`/api/projects/${projectId}/query/`, {
    method: 'POST',
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  })
  return { columns: out.columns ?? [], rows: out.results ?? [] }
}

const SINCE = `timestamp >= now() - INTERVAL ${DAYS} DAY`

/**
 * `isError` arrives as a JSON boolean from posthog-node, but a property that has
 * ever been sent as a string would compare false against `true`. Normalising via
 * toString keeps the count honest across both shapes.
 */
const IS_ERROR = `toString(properties.isError) IN ('true', '1')`

const REPORTS = [
  {
    section: 'Site — traffic',
    title: 'Pageviews',
    query: `SELECT count() AS pageviews,
                   count(DISTINCT person_id) AS people,
                   count(DISTINCT $session_id) AS sessions
            FROM events
            WHERE event = '$pageview' AND ${SINCE}`,
  },
  {
    section: 'Site — traffic',
    title: 'Top pages',
    query: `SELECT properties.$pathname AS path,
                   count() AS views,
                   count(DISTINCT person_id) AS people
            FROM events
            WHERE event = '$pageview' AND ${SINCE}
            GROUP BY path ORDER BY views DESC LIMIT 25`,
  },
  {
    section: 'Site — traffic',
    title: 'Component docs pages (interest, NOT usage)',
    query: `SELECT replaceOne(properties.$pathname, '/components/', '') AS component,
                   count() AS views,
                   count(DISTINCT person_id) AS people
            FROM events
            WHERE event = '$pageview'
              AND properties.$pathname LIKE '/components/%'
              AND ${SINCE}
            GROUP BY component ORDER BY views DESC LIMIT 30`,
  },
  {
    section: 'Site — traffic',
    title: 'Referrers',
    query: `SELECT properties.$referring_domain AS referrer,
                   count(DISTINCT person_id) AS people,
                   count() AS pageviews
            FROM events
            WHERE event = '$pageview' AND ${SINCE}
            GROUP BY referrer ORDER BY people DESC LIMIT 20`,
  },
  {
    section: 'Site — conversion',
    title: 'code_copied',
    query: `SELECT properties.context AS context,
                   properties.language AS language,
                   properties.manager AS manager,
                   count() AS copies,
                   count(DISTINCT person_id) AS people
            FROM events
            WHERE event = 'code_copied' AND ${SINCE}
            GROUP BY context, language, manager ORDER BY copies DESC LIMIT 25`,
  },
  {
    section: 'Site — conversion',
    title: 'cta_click',
    query: `SELECT properties.cta AS cta,
                   properties.location AS location,
                   count() AS clicks,
                   count(DISTINCT person_id) AS people
            FROM events
            WHERE event = 'cta_click' AND ${SINCE}
            GROUP BY cta, location ORDER BY clicks DESC LIMIT 25`,
  },
  {
    section: 'MCP — usage',
    title: 'Tool calls',
    query: `SELECT properties.tool AS tool,
                   count() AS calls,
                   count(DISTINCT person_id) AS clients,
                   countIf(${IS_ERROR}) AS errors,
                   round(avg(toFloat(properties.duration_ms))) AS avg_ms,
                   round(quantile(0.95)(toFloat(properties.duration_ms))) AS p95_ms
            FROM events
            WHERE event = 'mcp_tool_call' AND ${SINCE}
            GROUP BY tool ORDER BY calls DESC`,
  },
  {
    section: 'MCP — usage',
    title: 'Components looked up by agents (closest proxy for real usage)',
    query: `SELECT properties.component AS component,
                   count() AS lookups,
                   count(DISTINCT person_id) AS clients
            FROM events
            WHERE event = 'mcp_tool_call'
              AND properties.component IS NOT NULL
              AND ${SINCE}
            GROUP BY component ORDER BY lookups DESC LIMIT 30`,
  },
  {
    section: 'MCP — usage',
    title: 'Versions requested',
    query: `SELECT properties.version AS version, count() AS calls
            FROM events
            WHERE event = 'mcp_tool_call' AND ${SINCE}
            GROUP BY version ORDER BY calls DESC LIMIT 20`,
  },
  {
    section: 'MCP — usage',
    title: 'Frameworks detected',
    query: `SELECT properties.framework AS framework, count() AS calls
            FROM events
            WHERE event = 'mcp_tool_call'
              AND properties.framework IS NOT NULL
              AND ${SINCE}
            GROUP BY framework ORDER BY calls DESC LIMIT 20`,
  },
  {
    section: 'MCP — usage',
    title: 'Search queries agents asked (verbatim)',
    query: `SELECT properties.query AS query, count() AS times
            FROM events
            WHERE event = 'mcp_tool_call'
              AND properties.query IS NOT NULL
              AND ${SINCE}
            GROUP BY query ORDER BY times DESC LIMIT 30`,
  },
  {
    section: 'MCP — health',
    title: 'Errors by tool',
    query: `SELECT properties.tool AS tool, count() AS errors
            FROM events
            WHERE event = 'mcp_tool_call' AND ${IS_ERROR} AND ${SINCE}
            GROUP BY tool ORDER BY errors DESC LIMIT 20`,
  },
  {
    section: 'MCP — health',
    title: 'Rate limiting',
    query: `SELECT properties.type AS type, count() AS hits, count(DISTINCT person_id) AS clients
            FROM events
            WHERE event = 'mcp_rate_limited' AND ${SINCE}
            GROUP BY type ORDER BY hits DESC`,
  },
  {
    section: 'MCP — health',
    title: 'Daily call volume',
    query: `SELECT toDate(timestamp) AS day,
                   count() AS calls,
                   count(DISTINCT person_id) AS clients
            FROM events
            WHERE event = 'mcp_tool_call' AND ${SINCE}
            GROUP BY day ORDER BY day DESC LIMIT 60`,
  },
]

function renderTable(columns, rows) {
  if (rows.length === 0) return '  (no events in window)'
  const head = columns.map(String)
  const body = rows.map((r) => r.map((c) => (c === null || c === undefined ? '—' : String(c))))
  const widths = head.map((h, i) =>
    Math.max(h.length, ...body.map((r) => (r[i] ?? '').length)),
  )
  const line = (cells) => '  ' + cells.map((c, i) => c.padEnd(widths[i])).join('  ')
  return [line(head), '  ' + widths.map((w) => '─'.repeat(w)).join('  '), ...body.map(line)].join(
    '\n',
  )
}

// Project resolution is the first call that touches the network, so it is where
// a bad key or wrong host surfaces. Report it as a message, not a stack trace —
// the fix is always in the environment, never in this file.
let projectId
let reportedFailure = false
try {
  projectId = await resolveProjectId()
} catch (e) {
  console.error(`Could not reach the PostHog API.\n\n${e.message}\n`)
  if (/401|authentication/i.test(e.message)) {
    console.error(
      `A 401 here means the key is wrong, revoked, or missing the project:read scope.\n` +
        `If the project is not on EU cloud, set POSTHOG_API_HOST (current: ${API_HOST}).`,
    )
  }
  // exitCode, not exit(): once a fetch has run, calling process.exit() while a
  // keep-alive socket is still closing trips a libuv assertion on Windows
  // ("!(handle->flags & UV_HANDLE_CLOSING)") and reports 127 instead of 1.
  // Letting the loop drain costs a second and gives the right exit code.
  process.exitCode = 1
  reportedFailure = true
}

const out = { host: API_HOST, projectId, days: DAYS, generatedAt: new Date().toISOString(), reports: [] }
let failed = 0

for (const r of reportedFailure ? [] : REPORTS) {
  try {
    const { columns, rows } = await hogql(projectId, r.query)
    out.reports.push({ ...r, columns, rows })
  } catch (e) {
    failed++
    out.reports.push({ ...r, error: e.message })
  }
}

if (reportedFailure) {
  // Nothing to print; the reason is already on stderr and exitCode is set.
} else if (asJson) {
  console.log(JSON.stringify(out, null, 2))
} else {
  console.log(`\nshilp-sutra analytics — last ${DAYS} days`)
  console.log(`project ${projectId} on ${API_HOST}, generated ${out.generatedAt}\n`)
  let section = ''
  for (const r of out.reports) {
    if (r.section !== section) {
      section = r.section
      console.log(`\n═══ ${section} ${'═'.repeat(Math.max(0, 60 - section.length))}\n`)
    }
    console.log(`▸ ${r.title}`)
    console.log(r.error ? `  QUERY FAILED: ${r.error.split('\n')[0]}` : renderTable(r.columns, r.rows))
    console.log('')
  }
  console.log(
    `Reminder: docs-page views and MCP lookups measure INTEREST, not adoption.\n` +
      `The published package ships no telemetry, so nothing here tells you which\n` +
      `components are actually rendered in a consumer app.\n`,
  )
}

// A failed query is a broken report, not a quiet footnote — exit non-zero so a
// scheduled run cannot silently degrade into an empty dashboard.
if (failed > 0) {
  console.error(`\n${failed} of ${REPORTS.length} queries failed (see above).`)
  process.exitCode = 1
}
