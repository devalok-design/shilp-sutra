---
"@devalok/shilp-sutra": minor
---

feat(release): ship a machine-readable `BREAKING.json` manifest

Closes the structured-data half of devalok-design/shilp-sutra#62. AI agents and migration tooling can now answer "what breaks between X and Y?" programmatically instead of parsing CHANGELOG prose.

### What ships

- **`packages/core/BREAKING.json`** — manifest of every breaking change per version, categorised: `moved` (import-path change), `narrowed` (prop type accepts less), `removed`, `renamed`, `notes`. Populated with the full 0.40.0 data: all 27 barrel→subpath moves + the 17-component Icon API narrowing (`React.ReactNode` → `IconInput`), with peer-dep and eslint-rule cross-refs on each move.
- **`packages/core/BREAKING.schema.json`** — canonical JSON Schema for the manifest. Editors auto-validate via `$schema`.
- **Two new subpath exports** — `@devalok/shilp-sutra/BREAKING.json` and `@devalok/shilp-sutra/BREAKING.schema.json`. Consumers can `import manifest from '@devalok/shilp-sutra/BREAKING.json'`.
- **Tarball ships both files** (added to `files[]`).

### What the publish mechanism enforces

- **New pre-publish-audit gate** (`scripts/validate-breaking-manifest.mjs`) — runs as part of every release:
  - manifest structurally valid (required fields, allowed fields, array shapes)
  - every `moved.to` path resolves against the current `package.json#exports` (catches stale manifest entries pointing at non-existent subpaths)
  - **discipline check:** if the current version's CHANGELOG section contains a breaking signal (`feat!` / `**Breaking.`) AND the manifest has no entry for that version → audit fails. Mirrors the `/publish-release` narrowing-is-breaking checklist with tooling teeth.

### Consumer usage

```js
import manifest from '@devalok/shilp-sutra/BREAKING.json'

const fromV = '0.39.0'
const toV = '0.40.0'
// Versions between fromV+1 and toV
const breaksInRange = Object.entries(manifest.versions).filter(([v]) =>
  v > fromV && v <= toV,
)
// breaksInRange.flatMap(([_, e]) => e.moved) → every import-path change to apply
// breaksInRange.flatMap(([_, e]) => e.narrowed) → every type narrowing to inspect
```

Recipes (`docs/recipes/upgrading.md`), `AGENTS.md`, `llms.txt`, and `llms-quick.txt` now route agents at the manifest first, prose second.

### Why minor, not patch

New tarball-shipped file + two new subpath exports = new public API surface. Per `CONTRIBUTING.md → Versioning`, any new public surface is a real semver event → minor under 0.x.

### What this does NOT cover

- The `migrate` CLI from #62 item #5 — deferred. The eslint plugin's `migration` preset already does the mechanical autofixes; a CLI wrapper that reads `BREAKING.json` is a future build.
- Backfill of pre-0.40.0 breaking changes — added on demand, not retroactively (per the existing codemod policy).
