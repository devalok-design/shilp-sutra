# Shilp Sutra — Dead Code & Circular Import Audit

**Date**: 2026-08-10
**Scope**: Whole monorepo — unused files, unused exports, unused dependencies, circular imports
**Method**: `knip` (TypeScript-aware, respects the `exports` map) for dead code; `gitnexus check --cycles` for import cycles. **Every finding below was verified by hand** against the source before being recorded. One tool finding was rejected as a false positive — see [Rejected](#rejected-do-not-act-on).
**Commit audited**: `a06620b5`

---

## Table of Contents

1. [Summary](#summary)
2. [Confirmed Findings](#confirmed-findings)
3. [Rejected](#rejected-do-not-act-on)
4. [Report Noise](#report-noise-configuration-not-rot)
5. [Recommended Follow-up](#recommended-follow-up)
6. [Appendix: Tooling Evaluation](#appendix-tooling-evaluation)

---

## Summary

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 1 | `apps/playground/tailwind.config.ts` imports a path that no longer exists | Medium | Trivial |
| 2 | 3 dead files inside the published package | Low | Trivial |
| 3 | 10 unused d3 dependencies (+7 other unused devDeps) | Low | Small |
| 4 | `packages/core/src/primitives/` ships parallel `.js` and `.ts` copies | Medium | Large |
| 5 | 4 circular imports | Medium | Small |

Raw tool output: 173 unused files, 253 unused exports, 17 unused devDependencies, 1 unlisted dependency, 1 unresolved import. After verification, roughly 20% of that is real — the rest is missing configuration (see [Report Noise](#report-noise-configuration-not-rot)).

---

## Confirmed Findings

### 1. Broken import in the playground Tailwind config

`apps/playground/tailwind.config.ts:1`

```ts
import preset from '../../packages/core/src/tailwind/preset'
```

`packages/core/src/tailwind/` does not exist. Not renamed — absent. Verified: no `preset` module anywhere in `packages/core` outside `ui/shape-presets.stories.tsx` and `composed/date-picker/presets.tsx`, neither of which is this.

This is a Tailwind v4 repo, where `tailwind.config.ts` is not consumed at all. The repo also ships an ESLint rule — `@devalok/eslint-plugin-shilp-sutra/no-tailwind-config-preset` — written specifically to flag this pattern. The playground violates our own rule while pointing at a dead path.

**Action**: delete `apps/playground/tailwind.config.ts`.

### 2. Three dead files in the published package

Zero references repo-wide, confirmed by full-repo grep excluding `node_modules`, `dist`, `.next`:

```
packages/core/src/ui/lib/slot.ts
packages/core/src/ui/lib/index.ts
packages/core/src/ui/charts/_internal/scales.ts
```

**Action**: delete. Confirm none appear in the `exports` map of `packages/core/package.json` first.

### 3. Unused dependencies

Ten of the seventeen form one cluster — d3:

```
d3-array  d3-format  d3-interpolate  d3-time-format  d3-transition
@types/d3-array  @types/d3-format  @types/d3-interpolate
@types/d3-time-format  @types/d3-transition
```

Charts appear to have moved off d3 without the dependencies being removed.

Also unused: `axe-core`, `sharp`, `esbuild`, `@emoji-mart/react`, `@arethetypeswrong/cli`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`.

**Caution before removing**: `@typescript-eslint/*` and `@arethetypeswrong/cli` may be invoked indirectly via `eslint.config.js` or a `verify` step rather than imported. Check invocation, not just imports.

### 4. `packages/core/src/primitives/` has parallel `.js` and `.ts` copies

The vendored primitives directory contains both compiled `.js` and source `.ts`/`.tsx` versions of the same modules:

- `_internal/rect.js` **and** `_internal/rect.ts`
- `react-slot.tsx`, while sibling `.js` files (`react-dialog.js`, `react-menu.js`, `react-popover.js`, `react-select.js`, `react-alert-dialog.js`) import `"./react-slot"`

Module resolution silently picks one; the other is dead weight shipped to consumers.

Scale: **18 of the 173 flagged files and 133 of the 253 unused exports live in this one directory** — over half the entire report.

**Action**: this is a design decision, not a cleanup. Decide whether the vendored primitives are `.js`-canonical or `.ts`-canonical, then remove the other copy. Needs its own scoped piece of work.

### 5. Circular imports

All four verified by reading both sides of each pair:

```
composed/extensions/mention-suggestion.tsx  ↔  composed/rich-text-editor.tsx
ui/badge-group.tsx                          ↔  ui/badge.tsx
ui/button-group.tsx                         ↔  ui/button.tsx
ui/tree-view/tree-item.tsx                  ↔  ui/tree-view/tree-view.tsx
```

Worked example — `ui/badge.tsx:327` has `import { BadgeGroup } from './badge-group'`, and `ui/badge-group.tsx:5` has `import { Badge, type BadgeProps } from './badge'`.

**Why it matters**: cycles resolve fine until bundler or import order changes, then surface as `undefined is not a component` at runtime in a consumer app — not here. Three of the four are the same shape (`X` ↔ `X-group`), so one pattern fix likely clears them: move the shared type/variant into a third module both can import.

---

## Rejected (do not act on)

**knip reported**: `@devalok/shilp-sutra` is an unlisted dependency of `packages/eslint-plugin`, at `src/rules/no-tailwind-config-preset.ts:9:4`.

**Verified false.** Line 9 sits inside a JSDoc block documenting the very pattern the rule detects. knip's parser read a code sample in a comment as a real import. `packages/eslint-plugin/package.json` is correct as written.

---

## Report Noise (configuration, not rot)

Of the 173 files knip called unused:

| Count | What | Why flagged |
|-------|------|-------------|
| 105 | `tests/smoke-consumer*` | Deliberate consumer test apps; knip has no entry point declared for them |
| 30 | `*/scripts/*.mjs` | Invoked via package.json / turbo, never imported |
| 2 | `.storybook/mocks/*` | Wired through Storybook aliases |
| 18 | `packages/core/src/primitives/_internal/*` | Real, but part of finding #4 — not independent |

Roughly 80% of the raw report is missing configuration. Any recurring use of knip needs a `knip.json` first, or the signal drowns.

---

## Recommended Follow-up

1. Fix #1 and #2 — trivial deletions.
2. Add `knip` as a devDependency with a `knip.json` declaring `tests/smoke-consumer*` and `*/scripts/*` as entry points. That takes the report from 173 files to roughly 30 real ones.
3. Wire `pnpm check:dead` into the existing `verify` script, which already chains eight checks.
4. Scope #4 (primitives `.js`/`.ts` duplication) as separate work — it is the largest real item here.
5. Fix the three `X` ↔ `X-group` cycles as one pattern change.

---

## Appendix: Tooling Evaluation

This audit began as an evaluation of [GitNexus](https://github.com/abhigyanpatwari/GitNexus) (v1.6.9), which builds a code knowledge graph and exposes it to AI agents over MCP. Recording the outcome so the evaluation is not repeated.

**Where it was accurate.** Indexed the repo in 35.4s — 20,771 nodes, 31,210 edges. Direct-dependant analysis for `Dot` matched grep exactly: same 9 files, no false positives, no misses, and at symbol rather than file granularity. Transitive impact was genuine — it correctly identified `AvatarHero` as affected by a `Dot` change via `Avatar`, where `avatar.preview.tsx` never mentions `Dot`. Grep cannot produce that.

**Where it failed.** Components whose public export name is minted by `Object.assign` under a different name than the implementation are invisible to its call graph:

| Symbol | Incoming edges in graph | Actually used in |
|--------|------------------------|------------------|
| `Progress` | 0 | 11 files |
| `TopBar` | 0 | 3 files |
| `MasterDetail` | 0 | 4 files |
| `Message` | 0 | 3 files |
| `RichTextEditor` | 0 | 4 files |
| `Badge` | 50 | 47 files |
| `Avatar` | 28 | 31 files |
| `Dot` | 10 | 10 files |

Cause: `const Progress = Object.assign(ProgressBase, {...})` at `ui/progress.tsx:316`. Consumers write `<Progress>`; the graph holds `Progress` as an inert node with no edges while the real node is `ProgressBase`. `Badge` escapes only because `badge.tsx:330` names its base `Badge` and exports `BadgeCompound as Badge`.

It reports these as `"impactedCount": 0, "risk": "LOW"` with no uncertainty flag. **A dead-code sweep built on this graph would recommend deleting five live components.** That is why this audit used knip instead — knip flagged none of the eight, because it reads the TypeScript type system and the package `exports` map rather than inferring a call graph.

**Other notes.** Half the graph (10,358 of ~21,000 nodes) is markdown headings, not code. On Windows both search backends are unavailable — the LadybugDB FTS extension will not install (BM25 disabled) and the VECTOR index is unsupported (semantic falls back to a capped exact scan). Licence is PolyForm Noncommercial 1.0.0, so studio use would require a commercial licence.

**Verdict**: not adopted. Its cycle detection was useful and is the source of finding #5. Its blast-radius analysis is real but has a silent false-negative mode that disqualifies it for release gating — which is the job we would have wanted it for. Untested and potentially still interesting: cross-repo `group` impact analysis for design-system version rollouts across consumer repos.
