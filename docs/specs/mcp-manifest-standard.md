# MCP Manifest & AI-Surface Standard

**Status:** Draft v1 — 2026-07-05
**Applies from:** @devalok/shilp-sutra 0.45.0
**Companion schema:** `packages/core/mcp-manifest.schema.json`
**Plan:** `docs/plans/2026-07-05-hosted-docs-mcp-plan.md`

## Principle: mimic conventions agents already know

Every machine-readable shape in this standard mirrors an established convention that AI agents have seen extensively in training. A bespoke format forces every agent to learn it in-context; a familiar one works zero-shot. Each section below names the convention it borrows.

| Surface | Borrowed convention |
|---|---|
| Prop metadata | react-docgen / Storybook ArgTypes (`props` keyed by name; `type.name`, `required`, `defaultValue`, `description`) |
| Manifest container | package.json-style top-level metadata + JSON Schema 2020-12 validation (house precedent: `BREAKING.schema.json`) |
| Router file | llms.txt spec (llmstxt.org): H1 → blockquote summary → H2 sections → `[name](target): description` lines |
| Tool naming | MCP ecosystem norm: `snake_case` verbs (`get_component`, not `getComponent`/`component.get`) |
| Tool errors | MCP spec `isError` content results with actionable message text (never bare failures) |
| Versioning | semver everywhere; `manifestVersion` self-describes the format like `$schema` does |

## 1. `mcp-manifest.json`

Emitted by `build-component-docs.mjs` at build time, ships in the tarball root (`files[]` entry). One file per release; never edited by hand.

### Top level

```jsonc
{
  "$schema": "./mcp-manifest.schema.json",
  "manifestVersion": "1.0.0",          // format version — bump per this standard's changelog
  "package": "@devalok/shilp-sutra",
  "packageVersion": "0.45.0",           // must equal package.json version (audit gate)
  "generatedAt": "<build timestamp>",
  "components": { /* keyed by kebab-name, §1.1 */ },
  "tokens": { /* §1.2 */ }
}
```

### 1.1 Component entry (react-docgen shape)

Keyed by kebab-name (`"button"`, `"stat-card"`). Fields:

```jsonc
{
  "displayName": "Button",
  "tier": "ui",                          // ui | composed | shell | ai
  "import": "@devalok/shilp-sutra/ui/button",
  "serverSafe": false,
  "description": "One-line purpose (from doc H1 block)",
  "props": {                             // react-docgen convention: object keyed by prop name
    "variant": {
      "type": { "name": "enum", "value": ["solid", "soft", "outline", "ghost", "link"] },
      "required": false,
      "defaultValue": "solid",
      "description": ""
    },
    "loading": {
      "type": { "name": "boolean" },
      "required": false,
      "description": "disables button, shows spinner"
    }
    // type.name ∈ enum | boolean | string | number | function | ReactNode | ReactElement | object | union
    // non-enum unions carry "raw" with the literal type text
  },
  "subComponents": {                     // props owned by compound children (§2), NOT the root
    "TableCell": { "props": { "numeric": { "type": { "name": "boolean" }, "required": false } } },
    "TableRowLink": { "note": "separate import: ui/table-row-link", "props": { "href": { "type": { "name": "string" }, "required": true } } }
  },
  "examples": [                          // fenced jsx blocks from the doc, verbatim
    "<Button variant=\"solid\" color=\"error\" ...>Delete project</Button>"
  ],
  "composition": {                       // §1.3
    "parts": [], "slots": [], "composesWith": [], "containedBy": [],
    "contexts": [], "antiPatterns": []
  },
  "gotchas": [ "DO NOT use variant=\"destructive\" — use variant=\"solid\" color=\"error\"" ],
  "storybook": "https://devalok-design.github.io/shilp-sutra/?path=/docs/ui-button",
  "docPath": "docs/components/ui/button.md"   // fallback pointer for MCP-less agents
}
```

### 1.2 Tokens

Mirrors the token categories agents query: `color`, `spacing`, `typography`, `radius`, `shadow`, `motion`, `z`. Each entry: `name` (CSS var), `utility` (Tailwind class it generates, if any), `value` light/dark where applicable, `usage` one-liner. Extracted from `src/tokens/*.css` at build.

### 1.3 Composition block

The design-intent layer — NOT extractable from CVA. Authored in each component doc (§2) and parsed into the manifest.

| Field | Meaning | Example (Card) |
|---|---|---|
| `parts` | Compound subcomponents + their slot contract | `{ "name": "CardHeader", "slot": "top", "required": false }` |
| `slots` | Named children positions on the root | `{ "name": "children", "accepts": ["CardHeader", "CardContent", "CardFooter"] }` |
| `composesWith` | Components this legitimately wraps/pairs with | `["StatCard builds ON Card — never re-rolls it"]` → `{ "component": "stat-card", "relation": "specializes" }` |
| `containedBy` | Where this component legitimately lives | `["page", "master-detail", "activity-feed"]` |
| `contexts` | React contexts consumed/provided that change behavior | `{ "name": "ButtonGroup", "effect": "inherits variant/color/size; position-aware radius" }` |
| `antiPatterns` | Known misuse, phrased as DO NOT + alternative | `"DO NOT rebuild Card's surface inside a widget — compose <Card> and pass sections"` |

`relation` vocabulary (closed set): `specializes` (StatCard→Card), `contains`, `pairs` (Label+Input), `provides-context`, `consumes-context`, `alternative-to`.

## 2. Component doc authoring grammar (`docs/components/{tier}/{name}.md`)

Docs stay hand-authored Markdown (humans + MCP-less agents read them) but the section grammar is now normative — the manifest parser consumes it, and the audit gate enforces it.

Required H2 sections, in order: `Props`, `Defaults`, `Example`, `Composability`, `Gotchas`, `Changes`. (`Composability` was already present in newer docs; it becomes mandatory.)

Parse rules:
- **Header block**: `- Import:` / `- Server-safe:` / `- Category:` bullets (existing format, unchanged).
- **Props**: one prop per indented line, `name: type-expression (parenthetical → description)`. Enum values as `"a" | "b"` literals. `(default: X)` parenthetical sets defaultValue when not in Defaults section. Never cram two props on one line (`href: string; stretch: boolean` is invalid — the parser reads one prop per line and the second is lost/mangled).
  - **Subcomponent props**: an `### Subpart` H3 heading inside the Props section scopes every prop line beneath it to that subcomponent, emitted under `subComponents[Name].props` — NOT on the root entry. This is load-bearing: `numeric` under `### TableCell / TableHead` must not read as a `<Table>` prop, or an agent writes `<Table numeric>` and hits TS2322 (#132). A heading may name several subparts sharing a block (`### TableCell / TableHead`, split on `/`) and may carry a parenthetical note (`### TableRowLink (separate import: ui/table-row-link)` → `subComponents.TableRowLink.note`). Props above the first `### ` belong to the root.
- **Defaults**: `name="value"` comma-separated (existing format).
- **Example**: fenced ```jsx blocks, copied verbatim into `examples[]`.
- **Composability**: bold-lead bullets. Machine-parsed via a leading tag vocabulary: `**Part:**`, `**Slot:**`, `**Composes:**`, `**Contained-by:**`, `**Context:**`. Untagged bold-lead bullets (like today's prose) remain human prose and land in the manifest as `composition.notes[]` — so existing docs parse without rewrites, and tagging is incremental.
- **Gotchas**: each bullet → `gotchas[]` string, verbatim.

## 3. MCP tool conventions

- Tool names: `snake_case` verb-first. Reference tools: `find_component`, `get_component`, `get_tokens`, `get_setup`, `upgrade`, `search_docs`. Setup-journey tools (added 0.47): `detect_framework`, `preflight`, `validate_snippet`, `verify_setup`. Write path: `report_issue`. (The original "six tools, hard ceiling" was relaxed in 0.47 for the setup journey — resist growth beyond genuinely distinct agent jobs; new capabilities should still prefer becoming params/sections of an existing tool.)
- Every tool: optional `version` (semver string, default = latest ≥0.45). Sub-floor requests return an `isError: false` guidance result (not a failure): "0.45.2 predates MCP doc coverage (floor 0.45.0). Call upgrade(from: \"0.45.2\", to: \"0.45.0\") for the migration path."
- Response envelope: first line is the version banner (`Docs for @devalok/shilp-sutra@0.45.0 — pass your installed version if different`); then content. Machine data as JSON in a fenced block; prose as Markdown. ≤5K tokens per response — over-budget results truncate with an explicit `truncated: true` marker + narrowing hint (never silent).
- Errors: MCP `isError: true` with self-correcting text ("Unknown component 'btn'. Closest: button, split-button. Call find_component(\"btn\") to search."). shadcn CLI 3.0 precedent: error messages are written for LLM self-correction.

## 4. Router `llms.txt` (replaces cheatsheet in 0.45)

Conforms to llmstxt.org: H1 package name → blockquote (what it is, one paragraph, MCP-first instruction) → H2 sections. Target ≤3K tokens. Contents: MCP connect snippet + tool one-liners; component index as `[name](docs/components/tier/name.md): one-liner` (llms.txt link-line convention, pointing at tarball-relative paths for MCP-less fallback); token categories list; fallback order statement. No prop tables, no examples — those live behind `get_component`.

`llms-full.txt` and `llms-quick.txt` are removed in 0.45 (breaking; changeset + Karm DS notice required).

## 5. Standard versioning

This document + schema version together as `manifestVersion` (semver). Additive manifest fields = minor. Field removal/rename or parse-rule change = major. The MCP server declares which `manifestVersion` range it supports; mismatch = explicit error, never silent misparse.

## Changelog

- **1.0.0** (2026-07-05) — initial standard.
