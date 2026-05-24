# Contributing to Shilp Sutra

## Setup

```bash
pnpm install
pnpm dev        # Start Storybook at localhost:6006
pnpm test       # Run tests
pnpm typecheck  # Type check
pnpm lint       # Lint
```

## Component Checklist

Every component MUST have:

- [ ] `React.forwardRef` with proper element type
- [ ] `displayName` set
- [ ] `className` prop accepted and merged via `cn()`
- [ ] Remaining props spread (`...props`)
- [ ] CVA for any component with `variant` or `size` props
- [ ] Exported prop types interface
- [ ] Unit test with `vitest-axe` assertion
- [ ] Storybook story with `tags: ['autodocs']`

## Compound Component Policy

Convert to compound component pattern when:
- Component exceeds 8 props, OR
- Contains 2+ independently renderable sections

Example: `AdminDashboard.Root` / `AdminDashboard.Calendar` / `AdminDashboard.Content`

## Module Boundaries

```
primitives/ → ui/ → composed/ → shell/
```

| Layer | Purpose | May import from |
|---|---|---|
| `ui/` | Generic primitives, zero domain knowledge | `primitives/` only |
| `composed/` | Built from ui/, domain-agnostic, may have complex state | `ui/` |
| `shell/` | App-level singletons, rendered once per layout | `ui/`, `composed/` |

**Forbidden imports:**
- `ui/` must NOT import from `composed/` or `shell/`
- `composed/` must NOT import from `shell/`

## Commit Convention

```
type(scope): description

feat(ui): add new component
fix(a11y): resolve contrast issue
test(composed): add tests for DatePicker
refactor(shell): update sidebar layout
docs: update README
```

## Testing

- Every component needs a `.test.tsx` file
- Use `@testing-library/react` for rendering
- Include at least one `vitest-axe` accessibility assertion
- Test behavior, not implementation details
- `pnpm test:coverage` for coverage report (thresholds enforced)

**File location convention:**
- Co-located: `ui/button.test.tsx` — primary functional tests
- Subdirectory: `ui/__tests__/button-a11y.test.tsx` — supplementary a11y or feature-specific tests
- Both locations are scanned by Vitest. Use co-located for the main suite, `__tests__/` for focused follow-ups

## Pull Requests

- Run `pnpm typecheck && pnpm lint && pnpm test` before submitting
- Include story updates for any visual changes
- Add a changeset (`pnpm changeset`) describing user-visible impact — see Versioning section below

## Versioning & Breaking Changes

Shilp Sutra follows [Semantic Versioning](https://semver.org/) — strictly, even pre-1.0.

| Bump | When to use |
|---|---|
| **patch** (`0.x.y` → `0.x.y+1`) | Bug fixes, internal refactors, doc-only changes, dep bumps that don't change runtime behavior, additive non-breaking optional props |
| **minor** (`0.x.y` → `0.x+1.0`) | New components, new variants/sizes/props on existing components, new tokens, new exports, documentation that ships in the npm tarball (e.g. `docs/recipes/`), any change that grows public surface without breaking existing usage |
| **major** (`0.x.y` → `0.x+1.0`) — pre-1.0 we still bump minor for breaks but flag them clearly | Any removal, rename, signature change, prop rename, default-value change that flips behavior, peer-dep range tightening, output-tree restructure, or any change requiring a consumer-side code change to migrate |

**Pre-1.0 reality.** While we're on `0.x`, breaking changes ship as **minor** bumps (per semver convention for `0.y.z`). They are clearly tagged in the changeset body with a `**BREAKING:**` prefix and a migration block. Do NOT slip a breaking change into a patch — even pre-1.0.

### Changesets are mandatory

Every PR that touches `packages/*/src` MUST include a changeset:

```bash
pnpm changeset
```

The changeset file should:
- Name the affected package(s) at the right bump level
- Lead with the user-facing impact (not the internal "what")
- Include a before/after snippet for any breaking change
- Link to the migration guide section if one exists

Doc-only PRs that don't ship in the npm tarball (e.g. `docs/audit/*`, `docs/plans/*`) do not require a changeset. Doc PRs that DO ship in the tarball (anything under `packages/core/docs/` listed in `files`) require one — they widen the public surface.

### Deprecation policy

Before removing a public API:

1. **Deprecate first.** Add a runtime warning (in dev only) and a `@deprecated` JSDoc tag. Document in CHANGELOG under `### Deprecated`.
2. **Wait at least one minor release** before removal. Consumers need a release cycle to migrate.
3. **Remove in a clearly-marked breaking release.** Document in CHANGELOG under `### Removed` and provide a migration block in `MIGRATION.md`.

The v0.38 deprecation sweep is the canonical example — see commits `dff85b37`...`ec5112be` and `MIGRATION.md#v0380--deprecation-sweep`.

### Codemod policy

**Any breaking change that touches more than two components MUST ship with a codemod.** Adopted from Mantine v7's `mantine6to7` lessons — small breaks can be hand-migrated, but cross-component sweeps without automation create migration walls that stall consumer upgrades.

Rules:

1. **Threshold: >2 components touched.** Count the number of consumer-facing component exports impacted. Renames, prop signature changes, default-value flips, removed variants all count. A token-only break (no component code change) does not count toward the threshold.
2. **Codemod lives in [`@devalok/shilp-sutra-codemods`](https://github.com/devalok-design/shilp-sutra-codemods).** One repo, one codemod per minor that requires one. Built on `jscodeshift`. Each codemod is named for the version that introduced the break: `0.40-to-0.41.js`.
3. **Codemod ships in the same PR as the breaking change.** The break is not mergeable without it. Reviewer checks: `pnpm changeset` body links to the codemod path, `MIGRATION.md` references it, the codemod has unit tests.
4. **Consumer migration is one command:** `npx @devalok/shilp-sutra-codemods <version-pair> <path>`. Document in `MIGRATION.md` next to the manual instructions — codemod first, manual as fallback.
5. **Backfill on demand, not retroactively.** We do not owe codemods for breaks shipped before this policy (e.g. 0.38 deprecation sweep). Backfill only if a consumer explicitly asks during their upgrade.

### Public API surface

The "public API" includes:

- All `exports` paths in `packages/core/package.json` and `packages/brand/package.json`
- Component prop names, types, default values, behavior
- Component DOM structure and slot contracts (e.g. `data-*` attributes consumers might style against)
- All CSS custom property names declared in `tokens/*.css` (consumers override these)
- All Tailwind utility-generating namespaces (`--spacing-ds-*`, `--text-ds-*`, etc.)
- The `llms.txt`, `llms-full.txt`, and `docs/recipes/` content shape (AI agents and consumer docs reference these)

Internal-only:

- Anything under `src/primitives/` (vendored Radix — not considered semver-stable for direct consumption)
- Build scripts under `scripts/` (except `pre-publish-audit.mjs`, which is run by external CI consumers — treat its CLI surface as semver-stable)
- Test fixtures, Storybook stories, the Vite playground app

If a change touches public-API surface, it's a real semver event. Err toward the higher bump.

## Beta SLA

> Active for the `0.40.0` public beta window. See [docs/plans/2026-05-24-beta-release-plan.md](./docs/plans/2026-05-24-beta-release-plan.md) for the full beta plan.

The beta SLA scopes maintainer commitment honestly — bot ack is automated, human commitment is to **triage**, not fix.

| Category | Definition | Bot ack | Human triage | Fix posture |
|---|---|---|---|---|
| **Urgent** | Install-break, runtime crash on supported framework, or security. Reproduces on documented setup. Not solvable by re-reading docs. | Immediate (auto-comment) | ≤48h best-effort | Top of queue; ETA posted in issue |
| **Normal** | API ambiguity, agent-trap, doc gap, behavior contradicting docs. | Immediate | Weekly Monday | Batched into next minor |
| **Nice-to-have** | Polish, preference, feature request. | Immediate | Weekly Monday | "If it fits" — no commitment |

**Bot ack** = auto-comment via [`agent-feedback-ack`](./.github/workflows/agent-feedback-ack.yml) GitHub Action. Means "we received this." Not "a human has read it."

**Human SLA scopes triage, not fix.** Fix ETAs are issue-specific and posted in the issue after triage. We do not promise calendar fix times — one maintainer, real life.

**Urgent definition (objective, baked into [`ai-agent-feedback.yml`](./.github/ISSUE_TEMPLATE/ai-agent-feedback.yml)):**

Urgent = ALL of:
- Reproduces on documented setup (recipe-followed install)
- Breaks: install OR initial render OR build OR security
- Not solvable by re-reading existing docs

NOT urgent:
- Visual preference / "looks wrong"
- Missing feature request
- Confusion about docs (= normal, doc-gap)
- Breaks only on undocumented framework or post-modification
- Already-known issue with existing workaround

Maintainer reserves the right to reclassify during triage; reclassification is the norm, not a slight.

**Travel/sick weeks:** SLA pauses. Pinned Discussion notice. No silent drift — public acknowledgment that the clock paused.

**Weekly digest:** Mondays AM, posted to GitHub Discussions. "Heard / Shipped / Open / Beta scoreboard" format. Miss two weeks → beta credibility tanks. Discipline > tooling.

**Post-beta:** This SLA section is rewritten or removed when [exit criteria](./docs/plans/2026-05-24-beta-release-plan.md#7-exit-criteria) are met.
