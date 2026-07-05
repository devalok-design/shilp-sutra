# Hosted Docs MCP Server — Design Plan

**Date:** 2026-07-05 (v2 — revised same day after prior-art research + tool-design session)
**Status:** Approved direction — pending Phase 0 start
**Decision context:** Explored replacing shipped docs with an MCP server; rejected replacement (version skew, zero-config discoverability, Figma Make requires tarball files). Decision: **hosted MCP as a complement; a structured manifest shipped in the tarball becomes the machine source of truth.**

## v2 decisions (2026-07-05)

1. **Version floor = 0.46.0** — the release the MCP ships with. No back-fill of older versions. Requests for <0.46 get a pointed redirect to `upgrade(from, to)`, which DOES accept older `from` versions (0.45 and below) so pre-MCP consumers have a tool-served path in.
2. **`mcp-manifest.json` ships in the tarball from 0.46** — structured JSON emitted by `build-component-docs.mjs`: per-component props/variants/import path/examples/token refs/composition, plus a `manifestVersion` field. The server reads the manifest, never parses markdown. Kills the parser-drift risk; JSON responses are ~80% cheaper than prose (Indeed benchmark); Storybook's RFC independently landed on build-time manifest extraction.
3. **llms.txt becomes a ~2-3K router** — component names + one-liners + "call the MCP for details" instructions + connect snippet + fallback order. The always-in-context map; deep content moves behind tools. (Files cost zero context until read — the fix for context hogging is routing, not deletion.)
4. **llms-full.txt and llms-quick.txt are dropped in 0.46.** Fallback chain for MCP-less agents: router llms.txt → `docs/components/<tier>/<name>.md` (~3K per component). Requires: changeset (breaking for doc-path consumers), Karm DS notice, and updating the pre-publish-audit gates that check llms-full regeneration.
5. **Composition is a first-class doc surface** — served as a `composition` section of `get_component`: compound parts + slot contracts, composes-with, contained-by, anti-patterns (the composition-duplication audit's lesson as data). Authored as a `composition` frontmatter block in each `docs/components/*.md`, enforced by a new pre-publish-audit gate, merged into the manifest at build.
6. **Six tools, hard ceiling** (down from seven — see revised tool surface).

## Prior art (researched 2026-07-05)

Survey of how other design systems expose docs to AI agents. Primary sources verified against live pages.

### Who ships what

| System | Approach | Transport | Tool surface | Version skew handling |
|---|---|---|---|---|
| **Nuxt UI** | Hosted MCP at `https://ui.nuxt.com/mcp` + llms.txt/llms-full.txt | Remote HTTP | ~11 tools: `search_components`, `get_component` (with `sections` param: usage/examples/api/theme/changelog), `get_component_metadata`, `search_composables`, `get_migration_guide`, templates/examples | None — serves current docs site; version only via migration-guide tool |
| **shadcn/ui** | Registry protocol + local MCP (`npx shadcn@latest mcp`) | Local stdio | Browse/search/view/install registry items | Sidesteps skew by vendoring source into consumer repo; registry supports query-param versioning (`params: {"version": "v2"}`) and `#ref` pinning at config level |
| **Chakra UI** | Official `@chakra-ui/react-mcp` | Local stdio (npx) | `list_components`, `get_component_props`, `get_component_example`, `get_theme`, `theme_customization`, `v2_to_v3_code_review` (migration as fixed tool), Pro tools behind API key | None — serves docs for whatever the npx package ships |
| **MUI** | Official `@mui/mcp` | Local stdio (npx) | Minimal 2 tools: `useMuiDocs`, `fetchDocs` (URL-chained) | None — latest docs only |
| **Mantine** | llms.txt + llms-full.txt (regen every release) + `@mantine/mcp-server` | Local npx client reading **hosted static data** from mantine.dev (`MANTINE_MCP_DATA_URL` overridable) | `list_items`, `get_item_doc`, `get_item_props`, `search_docs` | None — latest only |
| **Storybook/Chromatic** | Experimental `@storybook/addon-mcp` from build-time Component Manifest; **Chromatic auto-creates hosted MCP at published-storybook-URL/mcp** | Local HTTP or Chromatic-hosted | list / get details / keyword search | Manifest is build-time extracted (version-matched to that build), but hosted endpoint tracks latest publish |
| **Ant Design** | Community only (`mcp-antd-components`, stale since mid-2025) | Local stdio | 6 read-only doc tools | Manual re-extraction; concrete staleness casualty |
| **Nord, PrimeVue** | llms.txt + llms-full.txt + per-page `.md` endpoints | Static hosted | — | None |
| **Context7** | Hosted docs-for-agents MCP (58k stars) | Remote HTTP + local | 2 tools: `resolve-library-id`, `get-library-docs` | **Only player doing per-version docs.** Initially manual demand-driven tag parsing (failed real requests — issue #236); automated tag ingestion June 2025 |

### What this validates in our plan

- **Hosted read-only HTTP MCP is established** (Nuxt UI is the closest architectural match; Context7 proves it at scale).
- **Version-parameterized docs is a real, demanded, unsolved need.** Context7 users explicitly ask to pin docs to installed versions; its demand-driven indexing failed them until automated. Nobody in the DS space handles skew at all. Our tarball-extraction approach covers *every published version automatically* — genuinely differentiated.
- **Docs-in-tarball stance confirmed.** Hosted llms.txt is mostly unfetched (~97% of 38k domains with llms.txt got zero requests for it, May 2026); the surviving niche is coding-agent docs *delivered into context* — exactly what shipping in the tarball does. epilot's postmortem: agents with an upfront doc index hit 100% task success vs 79% with mid-task lookup — static context files stay primary, MCP complements.
- **Progressive disclosure is the endorsed pattern** (Brad Frost, via Into Design Systems): always-on rules (our AGENTS.md/llms.txt) + MCP on-demand for specifics + one orchestration file. Matches our architecture exactly.

### What this changes in our plan

1. **`sections` param on `get_component`** (adopt from Nuxt UI): `usage | examples | api | theme | changelog` — finer than whole-doc slices.
2. **Structured JSON responses for machine-shaped data.** Indeed's benchmark (77 components × 1,056 prompts × 8 MCP configs): structured JSON used 80% fewer tokens than prose Markdown, ~5× cheaper, fewer hallucinations. Prop tables/tokens return JSON; prose (usage guidance) stays Markdown.
3. **Hard per-response token budget (~5K tokens).** Context7's main criticism is 80K-token doc dumps; competitors enforce ~5K caps with chunking.
4. **Keep tool surface minimal.** MCP tool schemas eat context before any docs are fetched (measured practitioner complaint); 7 tools is our ceiling, not a floor to grow.
5. **Drift is a monitored failure mode, not a backlog item.** When docs/tokens/source conflict, agents pick first-found or average across sources. Our same-repo parser CI test is the right guard; add a drift check comparing served props vs CVA source at release time.
6. **New open question — Chromatic auto-MCP.** We already publish to Chromatic; it auto-creates an MCP endpoint from the component manifest at publish time. Experimental, latest-only, no version param — but potentially near-free. Evaluate before building Phase 2 (could reduce scope or serve as interim).

### Sources

Primary: ui.nuxt.com/docs/getting-started/ai/mcp · ui.shadcn.com/docs/mcp + /docs/registry/namespace + /docs/changelog/2025-08-cli-3-mcp · chakra-ui.com/docs/get-started/ai/mcp-server · mui.com/material-ui/getting-started/mcp · mantine.dev/guides/llms · github.com/storybookjs/ds-mcp-experiment-reshaped/discussions/1 (RFC) · github.com/upstash/context7 + issue #236 · nordhealth.design/ai/llms-txt · primevue.dev/llms. Secondary: epilot postmortem (dev.to), Into Design Systems "Your Design System Is Not Ready for AI Agents" (Indeed benchmark, Brad Frost pattern), Codrops Storybook-MCP walkthrough, llms.txt adoption analysis (Spriestersbach).

## Problem

AI agents consuming shilp-sutra today read static files (`llms.txt`, `llms-full.txt`, `docs/components/*.md`, recipes) out of `node_modules`. This works but has two gaps:

1. **Context inefficiency.** An agent wanting one prop table often ingests the 336K `llms-full.txt`. Per-component files help, but agents without file access (Karm agents running against deployed apps, Figma Make contexts, claude.ai sessions) can't reach `node_modules` at all.
2. **Pre-install blindness.** An agent evaluating or setting up shilp-sutra before `pnpm install` has no doc access except the GitHub repo.

A hosted MCP serves both: structured, per-component queries over published docs, reachable from any MCP-capable agent regardless of filesystem access.

## Non-goals

- **Not a replacement** for tarball docs. `llms.txt`, `llms-full.txt`, `docs/`, `make-kit/`, `AGENTS.md` continue to ship. They remain the version-exact source for installed consumers.
- **No local stdio MCP** in this phase (revisit if consumer feedback shows demand).
- **No auth.** Docs are already public on npm. Read-only server, rate-limited.
- **No maintainer-side tooling.** Working IN shilp-sutra keeps CVA source + Storybook MCP (`localhost:6006/mcp`) as truth.

## Architecture

```
Agent ──HTTP (streamable)──▶ MCP server (Railway)
                                  │
                                  ▼
                       version-keyed doc cache
                                  │  (miss)
                                  ▼
              npm registry tarball fetch + extract
        registry.npmjs.org/@devalok/shilp-sutra/-/shilp-sutra-X.Y.Z.tgz
```

**Data source: published npm tarballs.** The server fetches the requested version's tarball from the npm registry, extracts `mcp-manifest.json` plus the supporting files (`docs/components/**`, `docs/recipes/**`, `BREAKING.json`, `MIGRATION.md`, `AGENTS.md`), and caches them keyed by version. Rationale:

- Zero new release steps — nothing to push, nothing that can silently fail in `release.yml` (we have scar tissue: 5 consecutive release failures during 0.37, stamped-docs regen misses on 0.39/0.40).
- Version-aware for free — any published version is servable.
- Tarball docs stay the single source of truth by construction. The server is a pure read-through cache.

Fetch directly from `registry.npmjs.org` (not unpkg/jsDelivr) — one fewer third party, and we need multiple files per version so tarball-extract-once beats per-file CDN calls.

**Cache:** in-memory LRU + disk (Railway volume), keyed `version → {file → content}`. Published versions are immutable, so cache entries never expire. `latest` dist-tag resolution cached ~5 minutes.

## Version-skew mitigation (non-negotiable)

Hosted docs can diverge from a consumer's installed version. Every design choice below exists to keep an agent from writing props that don't exist in the version it's building against.

1. Every tool accepts optional `version` (semver string). Omitted → resolves `latest`.
2. Every response is prefixed with a version banner:
   `Docs for @devalok/shilp-sutra@0.45.2. If the consumer app has a different version installed, pass it as the \`version\` parameter — prop surfaces change between minors.`
3. Server instructions (MCP `instructions` field) tell agents to check the consumer's `package.json` and pass the installed version.
4. `get_breaking_changes(from, to)` makes the skew itself queryable — an agent on 0.42 asking about 0.45 docs can pull the exact delta.

## Tool surface (v2 — six tools, each justified by an agent job)

| Agent job | Tool | Params | Returns | Backing source |
|---|---|---|---|---|
| "What component for X?" | `find_component` | `query`, `tier?`, `version?` | matching components: name + one-liner + tier (~1K). Empty query = full list. | manifest index |
| "How do I use Y correctly?" | `get_component` | `name`, `sections?` (api/usage/examples/composition/theme/changelog), `version?` | props/variants as JSON; usage prose as Markdown; **composition** = compound parts, slot contracts, composes-with, contained-by, anti-patterns. Import line + peer requirements inline (self-sufficient — no follow-up file read). | manifest + `docs/components/{tier}/{name}.md` |
| "What tokens exist?" | `get_tokens` | `category?` (color/spacing/typography/radius/shadow/motion), `version?` | token reference as JSON | manifest token section |
| "Set up a project" | `get_setup` | `framework?` (vite/next-app-router/next-pages/remix/astro/tanstack-start), `version?` | recipe + AGENTS contract quickstart | `docs/recipes/*`, `AGENTS.md` |
| "Upgrading — what breaks?" | `upgrade` | `from`, `to?` | structured breaking changes + migration steps across the range. **Accepts `from` < 0.46** (0.45 and older) — the transition path for pre-MCP consumers. | `BREAKING.json` + `MIGRATION.md` |
| "Find guidance on pattern Z" | `search_docs` | `query`, `version?` | matching sections with component anchors | index built from manifest + per-component md at cache-fill |

Design rules:

- Responses are slices, never whole-file dumps. `get_component("button")` returns ~2-4K, not 336K. Hard cap ~5K tokens per response (Context7's token-bloat criticism is the failure mode to avoid).
- Machine-shaped data (prop tables, tokens, breaking changes) returns structured JSON, not prose — 80% fewer tokens and fewer hallucinations in Indeed's published benchmark. Prose stays Markdown.
- 6 tools is the ceiling. MCP tool schemas consume agent context before any call is made; resist surface growth. New capabilities become sections/params of existing tools (as composition did), not new tools.
- Tool descriptions are written to win tool-choice: "authoritative, version-exact" phrasing, so agents route to the MCP instead of reading files.

### Making agents prefer the MCP over file reads

The context-hog problem is agents reading 336K llms-full.txt to find one prop table — a file costs nothing until read. Mechanisms, in order of leverage:

1. **Router llms.txt (~2-3K)**: the only doc agents load by default. Names + one-liners (enough to know what exists — the epilot "upfront map" finding) + MCP call instructions + connect snippet.
2. **AGENTS.md priority section**: "Prefer MCP tools for component/token/migration detail. Fallback order: MCP → `docs/components/<tier>/<name>.md` → ask the user to connect the MCP." No bulk file to fall back on — llms-full is gone.
3. **Self-sufficient responses**: import path, peer requirements, a11y notes inline in every `get_component` answer, so no follow-up read is ever needed.
4. **eslint-plugin synergy (later)**: `@devalok/eslint-plugin-shilp-sutra` error messages reference the exact MCP call that answers the violation (e.g. "invalid variant — call get_component('button', sections:['api'])").
- Tool descriptions state the version-skew warning so it survives into agent context even if instructions are dropped.
- `search_docs` is a simple section-level text index built at cache-fill time (split `llms-full.txt` on `##` headings). No embeddings, no external search infra.

## Package layout

New workspace package: `packages/mcp-server` (name `@devalok/shilp-sutra-mcp-server`, **`"private": true`** — never published to npm; deployed to Railway only).

```
packages/mcp-server/
  src/
    index.ts          — HTTP server, MCP streamable transport
    registry.ts       — npm registry fetch, tarball extract, version resolve
    cache.ts          — LRU + disk cache
    tools/            — one module per tool
    parse/            — llms-full section splitter, BREAKING.json reader
  Dockerfile          — Railway deploy
  package.json
```

Stack: Node 22, `@modelcontextprotocol/sdk` (streamable HTTP transport), `tar` for extraction. No framework — the SDK's server + `node:http` suffices.

Repo CI: typecheck + a test suite that runs the parser against the *local* `packages/core` doc output (guards doc-format drift — if `build-component-docs.mjs` changes its output shape, the MCP parser test fails in the same PR).

## Ops

- **Hosting:** Railway service in existing Devalok workspace. Deploy on push to `main` when `packages/mcp-server/**` changes.
- **Domain:** `https://shilp-sutra.devalok.in/mcp` (decided 2026-07-05) — the site app proxies `/mcp` to the mcp-server Railway service over the private network (Next.js rewrite gated on `MCP_INTERNAL_URL`). One memorable domain, Nuxt UI precedent (`ui.nuxt.com/mcp`), services stay independently deployable.
- **Rate limit:** basic per-IP token bucket (in-process). No auth.
- **Monitoring:** Railway metrics + `/health` endpoint. Log tool-call counts per tool + version requested (tells us which versions consumers are actually on).
- **Cost:** single small service; docs cache is a few MB per version.

## Discoverability

The MCP is useless if agents don't know it exists. Pointers added in the same release:

1. `llms.txt` + `AGENTS.md`: short "Live docs MCP" section with endpoint URL + the version-param rule.
2. `README.md` badge/section.
3. DS Notice to Karm (`/send-karm-notice`, type `new-feature`) so Karm agents connect it.
4. `make-kit/Guidelines.md` footnote (Make agents can't use MCP today, but harmless).

## Rollout

| Phase | Scope | Exit criteria |
|---|---|---|
| 0. Manifest (in core, ships 0.46) | `build-component-docs.mjs` emits `mcp-manifest.json` (props/variants/imports/examples/tokens/composition, `manifestVersion`); `composition` frontmatter authored for all components; new audit gates (manifest completeness, composition block per component); llms.txt → router; drop llms-full/llms-quick + update audit gates; changeset + Karm DS notice | 0.46.0 publishes with manifest; every component has composition data; audit green |
| 1. Spike | `registry.ts` tarball fetch + `get_component` from manifest, run locally against 0.46 | fetch < 2s cold, < 50ms warm; all 86+ components servable from manifest |
| 2. Full surface | all 6 tools, tests against local core manifest output, rate limit | CI green; manual smoke via Claude Code MCP connect |
| 3. Deploy | Railway service + domain + health checks | live endpoint answers `get_component("button")` for 0.46.x versions |
| 4. Announce | router llms.txt pointers live, README, Karm DS notice | Karm agent successfully uses it with `version` param; `upgrade(from: "0.45.x")` verified |

## Risks

- **Doc-format drift** — parser breaks when `build-component-docs.mjs` output changes. Mitigated by same-repo CI test against local docs (the reason for monorepo placement).
- **Stale `latest` guidance** — agent on old version doesn't pass `version`, gets new docs. Mitigated by banner + instructions + tool-description warnings; residual risk accepted (identical to today's risk of an agent reading GitHub main instead of installed docs).
- **Service dependency creep** — must never become the *only* doc channel. Guard: tarball `files[]` array is a publish gate already; any proposal to remove shipped docs re-opens this plan's rejected alternative.
- **Abuse/scraping** — public unauthenticated endpoint. Low value target (docs are on npm anyway); rate limit suffices.

## Open questions

1. ~~Minimum supported version~~ — **resolved: floor at 0.46.0** (the MCP-ship release). Older versions get a redirect to `upgrade(from, to)`, which accepts pre-0.46 `from` values.
2. ~~get_tokens data source~~ — **resolved: manifest JSON** (decision 2).
3. Expose Storybook links (published GitHub Pages Storybook) in `get_component` responses? Cheap, likely useful.
4. ~~Chromatic auto-generated MCP~~ — **rejected 2026-07-05.** Latest-only, experimental, no version param (misses the plan's core differentiator), and couples the docs surface to a paid service whose footprint we intend to reduce. Building our own.
5. Release-time drift check: compare manifest prop surface vs CVA source (extend `pre-publish-audit.mjs`). Agents blend conflicting sources rather than reconciling them — drift must be caught, not queued. **Now cheap to build: both sides are structured.**
6. Composition frontmatter schema: exact fields (`parts`, `slots`, `composesWith`, `containedBy`, `antiPatterns`) — finalize during Phase 0 authoring of the first 10 components, then gate.
