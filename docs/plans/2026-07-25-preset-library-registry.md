# Preset Library + Registry (shadcn-compatible, MCP-served)

**Status:** Design agreed 2026-07-25. Build not yet started.
**Owner decision:** hard-remove `AppSidebar` in the next major; build both blocks + registry; new website page; be best-in-class.

## The bet

shilp-sutra ships **primitives** (npm, versioned, maintained) + a **Preset Library**: pre-assembled,
real-world shapes (sidebars, dashboards, auth screens…) built FROM our primitives, that a consumer
pulls into their own codebase and owns. Discovery + install is AI-native: "tell your MCP you want
the projects-sidebar preset, and voilà."

This replaces the config-driven wrapper pattern (`AppSidebar`). The primitive `ui/sidebar` is already
maximally composable (24 parts); the wrapper only ever chased shapes composition gives for free
(Karm's S9/S10/S11 backlog, unshipped since 0.9.2). Presets give unlimited shapes without a
forever-growing config API.

## Architecture: be a first-class shadcn registry (do NOT invent a format)

shadcn's `registry.json` / `registry-item.json` is the de-facto standard, and the shadcn MCP already
installs from third-party **namespaced** registries via the consumer's `components.json`:

```jsonc
// consumer components.json
{ "registries": { "@devalok": "https://shilp-sutra.devalok.in/r/{name}.json" } }
```

Then: `npx shadcn add @devalok/sidebar-projects`, or agent NL: "add @devalok/sidebar-projects".
We inherit the entire shadcn install/CLI/MCP ecosystem for free.

### registry-item.json shape we emit (per preset)
- `name`, `type: "registry:block"`, `title`, `description`, `author`, `categories: ["sidebar", …]`
- `dependencies`: `["@devalok/shilp-sutra", "@tabler/icons-react", …]`  ← npm deps, NOT copied-in
- `registryDependencies`: usually **empty** — we do NOT copy primitives; presets import them from the pkg
- `files`: the preset `.tsx` (+ any helpers), `type: "registry:component"`, `target: "@components/…"`
- `docs`: setup note (needs `@devalok/shilp-sutra` installed + CSS imported)
- `meta`: our extras (preview image, brand notes, anti-slop clearance)

### Why this beats vanilla shadcn (the "even better")
- **Hybrid lifecycle:** shadcn freezes everything pasted (incl. primitives). Ours freezes only the
  *assembly wiring*; primitives import from `@devalok/shilp-sutra` and keep getting fixes via `pnpm update`.
- **Design-intent layer:** our MCP serves discovery/preview/brand/anti-slop the shadcn MCP can't.
- **On-brand distribution:** we already lead with the MCP as our AI-first surface; a preset registry
  served over MCP is the native next step, not a bolt-on.

## Surfaces

1. **Registry endpoint** `apps/site/app/r/[name]/route.ts` (+ `registry.json` index) — version-exact,
   built from real TSX in the repo. Emitted by a generator (mirror `build-mcp-manifest.mjs`).
2. **Preset source** — real, buildable, tested TSX. Reuse existing `apps/site/content/blocks/` +
   `/blocks/[slug]` infra (already has dashboard/pricing/signup). Add sidebar presets first.
3. **MCP tools** (`packages/mcp-server`) — `list_presets`, `get_preset`, `preview_preset`
   (discovery/preview). Install stays shadcn-CLI/MCP native. Add to tool-list generator + smoke.
4. **Website: Preset Library page** `/presets` (or `/library`) — gallery, live preview, copy the
   `shadcn add @devalok/…` command + the MCP prompt. This is the marketing centrepiece.

## First presets (sidebar, to unblock AppSidebar removal)
- `sidebar-app` — staff/app nav: logo + groups + user footer (AppSidebar's default shape)
- `sidebar-projects` — collapsible parent w/ children (Karm S9), badges (S10), group `+` action (S11)
- `sidebar-client` — client-portal nav (Karm's client shell)
- `sidebar-minimal` — icon rail, collapsible

## Sequence
1. Author sidebar presets as real TSX in `/blocks` (prove the shape). Tested, SSR-safe, Setu/anti-slop clean.
2. Registry generator + `/r/[name].json` endpoint + `registry.json` index; validate with real `shadcn add`.
3. MCP discovery tools + `/presets` website page.
4. Deprecate `AppSidebar`: DS notice to Karm, migration (agent pulls preset, swaps import), remove next major.

## Open / to research more
- shadcn `registry:block` multi-file + `target` alias behavior against our pkg-import model (spike a real install).
- Private/namespaced auth: presets are public → no token; keep endpoint CORS-open + version-exact.
- Preview images: reuse OG/satori pipeline? Or live iframe in `/presets`.
- Naming: `/presets` vs `/library` vs `/blocks` (already have `/blocks` for generic blocks — presets may be a superset or a sibling).

## Karm migration (blast radius)
`AppSidebar` used in ~25 Karm spots incl. `app/(staff)/admin/layout.tsx`, `staff-shell-client.tsx`,
`client/(portal)/client-shell-client.tsx`, `app/providers.tsx`. Hard-remove = major bump + DS notice +
coordinated migration. MCP-delivered preset makes it AI-automatable.

---

# DETAILED IMPLEMENTATION PLAN (researched + validated against shadcn docs, 2026-07-25)

## Hybrid model — VALIDATED (with one spike gate)
- shadcn `dependencies` (npm pkgs, installed by pkg manager) and `registryDependencies` (other
  REGISTRY items) are **orthogonal**. Empty `registryDependencies` is legal — nothing requires it.
- shadcn's import-rewrite is scoped to `@/registry` + configured `@/components|ui|lib|hooks` aliases.
  A **bare external specifier** (`@devalok/shilp-sutra/ui/sidebar`, `@tabler/icons-react`) matches
  none → passes through UNTOUCHED. Same path `lucide-react` takes in vanilla shadcn items.
- `shadcn build` reads `registry.json` → emits `public/r/<name>.json` (inlines file `content`).
- Namespaced install is first-party: consumer `components.json` → `{ registries: { "@devalok":
  "https://shilp-sutra.devalok.in/r/{name}.json" } }` → `npx shadcn add @devalok/sidebar-app`.
- **PHASE 0 SPIKE — DONE, PASSED (2026-07-25).** Real `npx shadcn@latest add ./item.json` into a
  minimal TS project (hand-written components.json). Confirmed: (a) external `@devalok/shilp-sutra/*`
  + `@tabler/icons-react` imports written **verbatim, not rewritten**; (b) shadcn ran
  `npm install "@devalok/shilp-sutra@^X" "@tabler/icons-react"` and added them to package.json
  (the `dependencies` path is real — first run even rejected `^0.54.0` as unpublished, proving it);
  (c) `target: "components/devalok/<file>"` resolved against the consumer `@/components` alias →
  `src/components/devalok/…`. **DECISION: use plain `components/<…>` target form** (no `@components/`
  alias-token needed). Hybrid model validated end-to-end.

## Hard gotchas
- **CSS prerequisite is THE trap.** Presets emit NO `cssVars` (tokens come from the installed
  `@devalok/shilp-sutra/css`). Consumer MUST have `@import "@devalok/shilp-sutra/css"` wired or it
  installs unstyled. The `docs` field must say this loudly + point to MCP `get_setup`.
- **No `@/` site aliases in a preset.** `shadcn add` would rewrite them to the consumer's (nonexistent)
  alias → broken. The existing demo blocks import `@/lib/version` — so presets need their OWN dir
  (`content/presets/`, NOT `content/blocks/`) + a build-time gate rejecting any `@/` import.
- Never emit the `tailwind` field (deprecated for TW4 → `cssVars.theme`).
- Naming collision: shadcn shipped a `preset` CLI command (share-config-codes) — DIFFERENT concept.
  Ours installs via `shadcn add`, not `shadcn preset`. Keep "Preset Library" as product name; disambiguate in copy.

## Surfaces (files)
- **Generator** `apps/site/scripts/build-registry.mjs` (mirror `build-mcp-manifest.mjs`): scan
  `content/presets/*/`, DERIVE `dependencies` from real imports (mirror `derive-peer-map.mjs`), gate
  `@/` imports, emit `registry.generated.json` (gitignored → turbo `outputs`, generate-on-build),
  validate every item against a vendored shadcn JSON schema with `ajv`, `--check` drift mode. Optional
  CI oracle: `npx shadcn build` cross-check.
- **Endpoint** `app/r/[name]/route.ts` + `app/r/registry.json/route.ts` (route handlers, mirror
  `app/mcp/route.ts` — runtime headers/version, not static `public/r`). CORS `*`, `s-maxage=300 SWR`,
  accept `<name>` and `<name>.json`, 404 with `availableNames`.
- **MCP tools** (`packages/mcp-server`): `list_presets`, `get_preset`, `preview_preset` — discovery/
  preview/brand only; install stays shadcn-native. Fetch LIVE site registry (version-independent, like
  `check_slop`). Wiring that gates in CI: `generate-tool-list.mjs` CATEGORY (new `Presets`),
  `smoke.mjs` 13→16, `how_to_use` map + `using_a_preset` sequence, server `instructions`.
- **Site `/presets`** page + `/presets/[slug]` (mirror `/blocks` infra → `presets-registry.ts`).
  Detail page Install panel: `shadcn add @devalok/<slug>` (hero) + `components.json` registries snippet
  + the **natural-language MCP prompt** ("tell your agent: add the @devalok/<slug> preset") + CSS-prereq
  callout. Gallery shippable BEFORE the endpoint exists.

## Phases (core ~7–10 working days)
0. Spike (0.5–1d, gate) · 1. Presets + `/presets` page (3–4d, shippable as gallery) ·
2. Registry generator + endpoint (2–3d, makes install real) · 3. MCP tools (1.5–2d) ·
4. AppSidebar hard-remove — next MAJOR, cross-repo Karm migration (separate track).

## Human-call decisions (surface to Mudit)
1. **Route name** `/presets` (rec) vs `/library` vs fold into `/showcase`.
2. **Version-exactness**: single-latest registry (rec — frozen-on-copy) vs versioned `/r/[ver]/[name]`.
3. **`@devalok/shilp-sutra` pin in `dependencies`**: caret-to-authored-minor `^0.54.0` (rec — fixes flow,
   major drift blocked per narrowing-is-breaking) vs unpinned latest.
4. **MCP preset source**: fetch live site registry (rec) vs ship into npm tarball.
5. **Preview images**: static screenshots (existing `_shot.mjs`) for cards + live React on detail (rec).
6. **Presets dir**: new `content/presets/` (rec) vs flag in `content/blocks/`.
7. **`target` form**: `components/devalok/<slug>/…` vs `@components/…` alias-token (spike decides).
8. **`shadcn build` oracle in CI?** (rec yes, drift job only.)
9. Every preset = brand output → `setu_check` + `check_slop` gate in Phase-1 "done".

---

## Release order + pin (0.x) — learned from the Karm migration (2026-07-25)

- **Registry dep pin is BARE on 0.x** (`build-registry.mjs` `pinFor`). A caret is
  broken in beta: `^0.53.0` EXCLUDES 0.54.0, so it fights a consumer upgrading to
  the version that ships the preset; and the site deploys from `main` (which can
  lead npm), so a version pin can demand an unpublished version → `shadcn add`
  hard-fails (Phase-0 spike recorded exactly this). Bare = latest/keep-existing,
  always resolvable. Switch to `^{major}.0.0` only at 1.0.
- **Release order:** publish npm FIRST, then redeploy `apps/site`. With the bare pin
  this is no longer a hard-fail (bare always resolves), but redeploying after the
  publish keeps `meta.shilpSutraVersion` in the registry matched to the published
  version instead of leading it.
- **Deprecation cycle collapsed to zero published releases** for AppSidebar
  (0.53.0 undeprecated → 0.54.0 removed). Deliberate for a 0.x beta with one
  coordinated consumer; recorded in BREAKING.json 0.54.0 notes. Post-1.0 removals
  get a real deprecate→remove window.
