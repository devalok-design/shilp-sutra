# @devalok/shilp-sutra

> Radix UI + Tailwind 4 (CSS-first) + CVA design system for Devalok apps, v{{VERSION}}.
> Built on the same primitives as shadcn/ui but with DIFFERENT prop APIs — never guess from shadcn knowledge; verify every prop.
> This file is a ROUTER: it tells you what exists and where to get details. Do not look for prop tables here — fetch them per component (MCP tool or per-component doc file below).

## How to get component details (in priority order)

1. **shilp-sutra MCP** (if connected): `get_component(name)` — version-exact props/variants/examples/composition as JSON. Also: `find_component(query)`, `get_tokens(category)`, `get_setup(framework)`, `upgrade(from, to)`, `search_docs(query)`. Pass your installed version (`node_modules/@devalok/shilp-sutra/package.json`) as `version` on every call.
   Connect: `claude mcp add --transport http shilp-sutra https://mcp.shilp-sutra.devalok.in/mcp`
2. **No MCP?** Read the single per-component file linked in the index below (`node_modules/@devalok/shilp-sutra/docs/components/...`, ~3K tokens each). Read only the components you need — never bulk-read the directory.
3. **Machine-readable everything**: `mcp-manifest.json` at the package root (all props/tokens/composition as JSON, react-docgen shape). Prefer targeted reads of it over any prose.

## Project setup (first install)

Use a recipe — do not improvise. Recipes ship at `node_modules/@devalok/shilp-sutra/docs/recipes/`:
install-next-app-router.md · install-next-pages.md · install-vite.md · install-astro.md · install-remix.md · install-tanstack-start.md · customize-brand.md (token overrides) · server-components.md (RSC matrix) · troubleshoot.md

Branding fast path: **https://shilp-sutra.devalok.in/themer** — archetypes (`/themer/archetypes`), brand color (`/themer/brand`), wizard (`/themer/wizard`). Paste the result CSS after `@import "@devalok/shilp-sutra/css";`.

## Hard rules (always apply)

- Prefer Button `variant="soft"` over `variant="outline"` for non-primary actions.
- No `variant="destructive"` / `variant="secondary"` / `color="danger"` — use `variant="solid" color="error"`, `variant="soft"`, `color="error"`.
- Spacing cadence: `ds-03` (related) / `ds-05` (grouped) / `ds-07` (section).
- Cards/widgets/panels sit on `bg-surface-2`; `bg-surface-1` is for page + overlays only.
- Compose, don't re-roll: build on existing components (check `get_component(name, sections:["composition"])` or the doc's Composability section) instead of rebuilding their surface.
- Icons: `startIcon={<Icon icon={IconX} />}` wrapper form, never bare icon components.

## Upgrading

Breaking changes are machine-readable in `BREAKING.json` (see `BREAKING.schema.json`); human guide in `MIGRATION.md`. Via MCP: `upgrade(from: "<installed>", to: "<target>")`.

## Component index

Format: `[name](doc path): summary`. Import paths follow `@devalok/shilp-sutra/<tier>/<name>`.

{{COMPONENT_INDEX}}

## Tokens

Categories: color, spacing (`ds-01`…), typography (`text-ds-*`), radius (`rounded-ds-*`), shadow (`shadow-raised`/`shadow-overlay`/…), motion, z-layers. Full reference: `get_tokens(category)` via MCP, or the `tokens` object in `mcp-manifest.json`.
