# Multi-Phase Implementation Plan to v1.0

**Date:** 2026-05-09
**Goal:** integrate every open finding from (a) the 2026-05-09 principal-architect audit, (b) world-class-verification residuals, (c) the public-release roadmap into a sequenced, dependency-aware plan to ship `@devalok/shilp-sutra@1.0.0`.

**Total effort estimate:** ~12 weeks aggressive (solo + Claude Code) / ~5-6 months conservative.

## Source documents

| Doc | Role |
|---|---|
| [`docs/plans/2026-05-08-public-release-roadmap.md`](./2026-05-08-public-release-roadmap.md) | Strategic phases (0-4) + open questions. **This plan supersedes its sprint sequencing.** |
| [`docs/audits/2026-05-09-principal-architect/findings.md`](../audits/2026-05-09-principal-architect/findings.md) | 151 findings, 10 cross-lens themes, 9 P0 / 38 P1 |
| [`docs/audits/2026-05-09-principal-architect/world-class-verification.md`](../audits/2026-05-09-principal-architect/world-class-verification.md) | Confirms April audit ~95% closed; 7 residual items |
| [`docs/audits/2026-05-09-principal-architect/00-best-practices.md`](../audits/2026-05-09-principal-architect/00-best-practices.md) | Industry rubric used to derive findings |

## Versioning trajectory (pre-1.0)

Per [`CONTRIBUTING.md` § Versioning](../../CONTRIBUTING.md#versioning--breaking-changes), pre-1.0 breaking changes ship as **minor** bumps with `**BREAKING:**` prefix and a codemod when scope exceeds 2 components.

| Version | Phase | Theme |
|---|---|---|
| 0.38.0 (shipped) | n/a | Deprecation sweep + doc-driven AI-agent setup |
| 0.39.0 | Phase 1 | P0 closures + variant/color taxonomy normalization (codemod) |
| 0.40.0 | Phase 2 | i18n + RTL + forced-colors + a11y baseline |
| 0.41.0 | Phase 3 | Layer enforcement + form-control state alignment + coverage backfill |
| 0.42.0 | Phase 4 | Tooling ecosystem (eslint-plugin + codemods package) |
| 0.43.x | Phase 5 | Trust signals (per-component size budgets, a11y page, perf benchmarks) |
| 0.44.0 | Phase 6 | Starter templates + docs site + bundle docs in tarball |
| (measurement window) | Phase 7 | Observe agent feedback. CLI go/no-go decision |
| (conditional) 0.45.x | Phase 7 | CLI MVP (only if measurement says it's needed) |
| 1.0.0-rc.x | Phase 8 | API freeze + name lock + 1.0 RC |
| 1.0.0 | Phase 9 | Public launch |

## Phase map

```
Phase 1 (2 wks)  ─→  Phase 2 (3 wks)  ─→  Phase 3 (1 wk)  ─→  Phase 4 (2 wks)  ─→  Phase 5 (2 wks)  ─→  Phase 6 (3 wks)
   P0 + variant         i18n + RTL +         layer + state +      tooling                trust              starters +
   normalization        forced-colors        coverage             ecosystem              signals            docs site
                                                                                                                   │
                                                                                                                   ▼
                                                                                                          Phase 7 (4-6 wks)
                                                                                                          measurement +
                                                                                                          CLI conditional
                                                                                                                   │
                                                                                                                   ▼
                                                                                                          Phase 8 (1 wk)
                                                                                                          1.0-rc + name lock
                                                                                                                   │
                                                                                                                   ▼
                                                                                                          Phase 9 (1-2 wks)
                                                                                                          public launch
```

---

## Phase 1 — Foundation closure (Weeks 1-2) → ships as 0.39.0

### Goal

Close every P0 from today's audit + the world-class residual P0 (P0-06 reduced-motion). Normalize the variant + color taxonomy across all CVA components. Establish enforcement tooling (codemod + ESLint rule) so the work doesn't drift.

### Scope

#### 1.1 — All 9 audit P0s (3-4 days)

| # | Audit ref | Component | Fix |
|---|---|---|---|
| P0-1 | `findings.md` | `ui/dialog.tsx` | `closeButtonAriaLabel?: string` prop |
| P0-2 | `findings.md` | `composed/confirm-dialog.tsx` | `confirmLabel`/`cancelLabel`/`processingLabel` props |
| P0-3 | `findings.md` | `ui/spinner.tsx` | `srLabel?: string` prop |
| P0-4 | `findings.md` | `ui/checkbox.tsx` | Wire `aria-required` from FormField context |
| P0-5 | `findings.md` | `ui/dialog.tsx` | Mobile sheet variant focus-trap test |
| P0-6 | `findings.md` | `ui/button.tsx` | `onClickAsync` unmount cleanup (AbortController/mounted ref) |
| P0-7 | `findings.md` | `shell/data-table.tsx` | Keyboard navigation (tabIndex + arrow keys + Space toggle) |
| P0-8 | `findings.md` | `ui/button.tsx` | Optional `isPressed?: boolean` → `aria-pressed` |
| P0-9 | `findings.md` | `ui/sidebar.tsx` | Add test suite |

#### 1.2 — World-class residual closure (1-2 days)

Per [`world-class-verification.md`](../audits/2026-05-09-principal-architect/world-class-verification.md) "Findings still requiring action":

| Item | Fix |
|---|---|
| P0-06 | Either complete formal 74-file reduced-motion audit OR scope-downgrade to "covered by MotionProvider for declarative cases; imperative animations TBD" |
| P1-04 (text-code typography) | Add `text-code-{xs,sm,md,lg}` composite to `tokens/utilities.css` mapping to `--font-mono` + matching `--text-ds-*` size tokens. Adds Tailwind utility for the existing `--font-mono` token |
| P1-10 (z-50 in avatar-group) | Replace `z-50` with semantic `z-popover` or `z-dropdown` token in `composed/avatar-group.tsx` — last remaining stacking violation |
| Toast `aria-live` partial | Fire `assertive` for `variant="error"` regardless of `isUrgent` |
| `file-upload.test.tsx` + `date-utils.test.tsx` | Write missing tests (other 5 of P0-16's seven exist) |
| P1-35 (Toggle color axis) | Covered by 1.3 below (T2 color enum unification) |
| Card `size` dead CVA | Lens 1 #39 — flag as P3 post-1.0 cleanup |

#### 1.3 — Variant + color taxonomy normalization (T1 + T2 + T3) (5-7 days)

The biggest single piece of pre-1.0 work. Touches every CVA component.

**Variant axis migration:**
- Card: `default|elevated|outline|flat` → `solid|soft|outline` + new `elevation` axis
- Alert + Badge: drop `subtle` (it equals `soft`); align with `solid|soft|outline|ghost|link`
- Banner: add `variant: subtle|solid|outline` axis (currently has only `color`)
- Toggle: rename `default` → `ghost`; add `solid` and `soft`
- Tabs, SegmentedControl: document deviation in llms-full.txt OR migrate to canonical
- Slider: add `xs` size

**Color axis unification:**
- Single canonical `SemanticColor = 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info'`
- Migrate Switch (currently 3), Toggle (currently 4 different), Slider (currently 4 no-neutral), ConfirmDialog (currently 2-only)
- Remove `color="default"` from Card, Select-trigger, Progress, StatCard.accent

**Codemod (`@devalok/shilp-sutra-codemods`):**
- jscodeshift transforms for each renamed/removed axis
- Backward-compat aliases live for one minor (deprecated with dev warning, removed in 0.40.0)

#### 1.4 — Enforcement tooling MVP (2-3 days)

- `pre-publish-audit.mjs` gate: scan for `color="default"` outside allowlist → fail
- `pre-publish-audit.mjs` gate: scan for hardcoded `<button title="Close">` patterns → fail
- Phase-1.5.1 of public-release-roadmap PULLED FORWARD: ship `@devalok/eslint-plugin-shilp-sutra` MVP with these rules:
  - `no-bare-shadow` (rubric §2 — already exists in audit)
  - `no-color-default` (catches the v0.32 leftovers)
  - `no-hardcoded-i18n-string` (heuristic — flag string literals in JSX text nodes)
  - `prefer-asChild` (warn on `as=` usage)

### Exit criteria

- [ ] All 9 audit P0s closed; tests pass
- [ ] World-class residual P0s closed
- [ ] Codemod ships + tested against Karm consumer code (dry-run)
- [ ] `eslint-plugin-shilp-sutra` MVP at `packages/eslint-plugin/` with 4 rules
- [ ] Pre-publish-audit blocks `color="default"` regressions
- [ ] Changeset bodies clear: ALL breaking changes flagged with `**BREAKING:**` prefix

### Risk

- **Scope creep on variant migration.** 7 components × 2 axes = 14 files of CVA + 14 codemod transforms. Sticking to mechanical rename + alias pattern keeps it bounded.
- **Karm consumer breaks.** Codemod must be adopted on Karm side BEFORE merging 0.39.0 to avoid Karm CI breaking. Run dry-run against Karm repo first; coordinate timing.

---

## Phase 2 — i18n + RTL + a11y baseline (Weeks 3-5) → ships as 0.40.0

### Goal

Eliminate hardcoded English strings. Add RTL framework + RTL stories for top 20 components. Complete forced-colors backfill across all 11 missing components. Backfill `vitest-axe` assertions on top 15 interactive components.

### Scope

#### 2.1 — i18n hot-list extraction (T6) (3-4 days)

25 hardcoded English strings across 8 components → per-component label props with English defaults. Backwards-compatible.

| Component | Props to add |
|---|---|
| Dialog | `closeButtonAriaLabel?: string` (P0 already; reinforced here) |
| ConfirmDialog | `confirmLabel`, `cancelLabel`, `processingLabel` (P0 already) |
| Spinner | `srLabel?: string` (P0 already) |
| Toast | `formatFileSize?: (bytes: number) => string` (replaces hardcoded "B"/"KB"/"MB"/"GB") |
| FileUpload | `errors?: { tooLarge?: string; invalidType?: string }` |
| Pagination | `previousLabel`, `nextLabel` |
| DatePicker | `selectDateLabel`, `clearLabel` |
| Combobox | `noResultsText`, `loadingText` |
| Calendar | Verify locale-awareness via `date-fns` already; document if so |

ESLint rule `no-hardcoded-i18n-string` shipped in Phase 1 — this phase is the migration to satisfy it.

#### 2.2 — RTL framework (T4) (5-7 days)

**Step 1: Storybook RTL infrastructure (1 day)**
- Storybook decorator that toggles `dir="rtl"` globally + via toolbar
- RTL story for one canonical component (Button) as reference

**Step 2: Logical-property codemod (1-2 days)**
- jscodeshift transform: `mr-` → `me-`, `ml-` → `ms-`, `pr-` → `pe-`, `pl-` → `ps-`, `border-r` → `border-e`, `border-l` → `border-s`, etc.
- Run across `packages/core/src/**`
- Manual review of edge cases

**Step 3: Directional-icon mirror utility (1 day)**
- New `<DirectionalIcon>` component or `dir-mirror` className utility
- Apply to: chevron, arrow, search, expand-collapse, swipe, slide directions
- Document usage pattern in customize-brand.md

**Step 4: RTL stories for top 20 components (3-4 days)**
- Button, Input, Checkbox, Select, Tabs, Dialog, Toast, Spinner, Toggle, Slider, DatePicker, Combobox, Autocomplete, Switch, Tooltip, DataTable, Accordion, FormField, ConfirmDialog, FileUpload
- Each gets a `RTL` story variant
- Visual review via Chromatic

#### 2.3 — Forced-colors backfill (T5) (3 days)

11 components missing `@media (forced-colors: active)` blocks:
Select, Tabs, Dialog, Toast, DatePicker, Combobox, Tooltip, Alert, Accordion, Skeleton, Stepper

Pattern (already established in v0.36.0 for Button/Input/Checkbox):
```css
@media (forced-colors: active) {
  /* component-specific overrides using Canvas, CanvasText, Highlight, LinkText */
}
```

#### 2.4 — vitest-axe backfill (T part of T5) (3 days)

32 components currently lack explicit `vitest-axe` assertions. Backfill top 15:
Button, Input, Checkbox, Select, Tabs, Dialog, Toast, DatePicker, Combobox, Slider, Switch, Toggle, DataTable, FormField, FileUpload

### Exit criteria

- [ ] 25 hardcoded strings extracted to props with defaults
- [ ] RTL Storybook decorator active
- [ ] Logical-property codemod run; zero `mr-`/`ml-`/`pr-`/`pl-` in source
- [ ] 20 components have RTL story variants
- [ ] 11 components have forced-colors media queries
- [ ] 15 components have new vitest-axe tests
- [ ] No regressions on existing chromatic baselines (or all approved as intentional)

### Risk

- **Logical-property codemod breaks visual baseline.** Run with chromatic comparison; expect ~30-50 baseline updates (intentional). Accept all as new baselines after spot-check.
- **RTL stories reveal DEEP issues.** Some components may need restructuring beyond CSS (e.g., Slider track-fill direction). Time-box: if a single component RTL fix exceeds 1 day, split into a follow-up issue and document the deviation.

---

## Phase 3 — Layer enforcement + form-state + coverage backfill (Week 6) → ships as 0.41.0

### Goal

Close the 2 P1 layer violations. Align form-control state APIs. Backfill stories + tests for the 6 components missing both.

### Scope

#### 3.1 — Layer enforcement (T9) (1 day)

- Add `no-restricted-imports` ESLint rule for `ai/` layer (currently has zero boundary rules)
- Refactor `shell/app-command-palette.tsx`: remove direct `composed/CommandPalette` import OR document explicit cross-layer pairing in CONTRIBUTING.md
- Refactor `ai/command-bar.tsx`: move shared command types out of `composed/` (to `ui/` or new `types/` sibling) OR duplicate

#### 3.2 — Form-control state-API alignment (T8) (2 days)

Standardize `state: 'default'|'error'|'warning'|'success'` (Input pattern) across:
- Switch (currently boolean `error`)
- Checkbox (currently boolean `error`)
- Radio (currently boolean `error`)
- Slider (currently no state)

OR migrate Input to boolean `error: boolean` (the simpler pattern). Pick one direction; document in rubric.

Recommendation: Input pattern (richer, supports warning/success).

#### 3.3 — Story + test backfill (T10) (2 days)

| Component | Add |
|---|---|
| `ui/sidebar.tsx` | Story (high-priority — major component) + tests |
| `ui/badge-group.tsx` | Story + tests |
| `ui/badge-indicator.tsx` | Story + tests |
| `ui/breadcrumb.tsx` | Story + tests |
| `ui/icon-context.tsx` | Story (foundational story showing cascade) + minimal test |
| `ui/data-table-toolbar.tsx` | Tests (story exists or merge into DataTable stories) |

#### 3.4 — Controlled/uncontrolled gaps (1 day)

Add `default*` props for uncontrolled mode:
- SegmentedControl: `defaultSelectedId`
- FilterBar: `defaultSearchValue`
- MultiSelectPopover: `defaultSelectedIds`
- MemberPicker: `defaultSelectedIds`
- InlineEdit: `defaultValue`

#### 3.5 — `displayName` precision (1 day)

Set explicit `displayName` strings on Slider, Toggle, Switch, Checkbox, Radio*, SelectTrigger (currently copy from Radix vendored primitives, showing empty/wrong in DevTools).

### Exit criteria

- [ ] ESLint enforces ai/ layer boundary
- [ ] No direct shell→composed or ai→composed imports
- [ ] Switch/Checkbox/Radio/Slider expose `state` enum
- [ ] 6 components have new stories + tests
- [ ] 5 components support uncontrolled mode
- [ ] Slider/Toggle/Switch/Checkbox/Radio/SelectTrigger have explicit displayNames

### Risk

- **State-API migration is breaking** (Switch's `error: boolean` → `state: 'error'`). Codemod required. Same alias-then-remove pattern as Phase 1.

---

## Phase 4 — Tooling ecosystem (Weeks 7-8) → ships as 0.42.0

### Goal

Ship the developer-tooling packages that PROTECT the work done in Phases 1-3. Without these, the system drifts back over time.

### Scope

#### 4.1 — `@devalok/eslint-plugin-shilp-sutra` v1 (3-5 days)

Expand from Phase-1 MVP to full rule set:
- `no-bare-shadow` (existed)
- `no-color-default` (existed)
- `no-hardcoded-i18n-string` (existed, refined)
- `prefer-asChild` (existed)
- `no-ds-padding-shorthand` — flag `p-4` instead of `p-ds-04`
- `prefer-soft-over-outline` — warn on `<Button variant="outline">` for non-primary contexts
- `prefer-per-component-import` — warn on `import { Button } from '@devalok/shilp-sutra/ui'` (suggest `/ui/button`)
- `valid-variant-axis` — verify variant prop matches CVA source
- Documentation site for each rule

Ship as separate npm package: `@devalok/eslint-plugin-shilp-sutra@1.0.0`

#### 4.2 — `@devalok/shilp-sutra-codemods` v1 (3-4 days)

Consolidated codemod package. Each transform is jscodeshift + dry-run + diff-mode.

Backfill historical codemods retroactively:
- `v0.38-deprecation-sweep` (variant=filled→solid, action→actions, startIcon→startSection, etc.)
- `v0.39-variant-normalization` (Card/Alert/Badge/Banner/Toggle migration)
- `v0.40-i18n-extraction` (auto-prop-extraction skeleton — humans complete)
- `v0.40-rtl-codemod` (logical properties)
- `v0.41-state-api-alignment` (boolean error → state enum)

Usage: `npx @devalok/shilp-sutra-codemods v0.39-variant-normalization src/`

#### 4.3 — `@devalok/shilp-sutra-snippets` (VS Code) (1 day)

Tiny VS Code package with snippets:
- `bn` → `<Button variant=$0>$1</Button>`
- `dlg` → full Dialog scaffold
- `fld` → FormField scaffold
- etc.

Skip building a full extension — snippets give 80% of the value at 5% of the cost.

### Exit criteria

- [ ] eslint-plugin v1 published to npm
- [ ] codemods package published to npm
- [ ] VS Code snippets published to VS Code Marketplace
- [ ] Documentation for each in `packages/core/docs/recipes/` (linting.md, codemods.md, snippets.md)

### Risk

- **ESLint plugin maintenance burden.** Each rule is an ongoing surface. Limit to high-value rules first; resist scope creep.
- **Codemod package versioning.** Pin codemods to specific shilp-sutra versions; document compatibility matrix.

---

## Phase 5 — Trust signals (Weeks 9-10) → ships as 0.43.x

### Goal

Add the metrics + visibility that consumers (and future-1.0 evaluators) check before adopting.

### Scope

#### 5.1 — Per-entry-point bundle-size budgets (3 days)

Per public-release-roadmap Phase 3.1.

- Install `size-limit` per package
- Target: `<5KB` tree-shaken Button, `<20KB` typical 5-component import
- Per-entry budget in `packages/core/package.json`
- CI gate fails on regression > 10%
- Per-component badge generated in `llms-full.txt` (Phase 3.2 of roadmap)

#### 5.2 — Public Chromatic link (1 day)

Per roadmap Phase 3.3. Add Chromatic project URL to README badges row.

#### 5.3 — Dedicated a11y conformance page (3 days)

Per roadmap Phase 3.4.

- New file: `packages/core/docs/accessibility.md` (ships in tarball)
- WCAG 2.2 AA conformance claim per component (build via script that reads `vitest-axe` tests + manual checklist)
- Keyboard navigation matrix
- Forced-colors support per component
- Reduced-motion support per component
- RTL support per component

#### 5.4 — Performance benchmark (3 days, P2)

Per roadmap Phase 3.8 (was P2 — pull forward as a 1.0 marketing asset).

- New file: `apps/perf-benchmark/` with cold-render of 100 buttons + 10 dialogs vs MUI/Mantine/Chakra
- Public results page in marketing site (Phase 6)

### Exit criteria

- [ ] Bundle size CI gate active per entry
- [ ] Per-component size badge in llms-full
- [ ] Public Chromatic link in README
- [ ] `accessibility.md` shipped in tarball
- [ ] Perf benchmark public

---

## Phase 6 — Starters + docs site + bundled docs tree (Weeks 11-13) → ships as 0.44.0

### Goal

Per public-release-roadmap Phase 2. The conversion-funnel assets.

### Scope

#### 6.1 — Bundle docs tree in npm package (1.8 of roadmap) (2 days)

Mirror `docs/` site tree into `dist/docs/` like Next.js does at `node_modules/next/dist/docs/`. AI agents read locally.

#### 6.2 — Starter repos per framework (2.2 of roadmap) (1.5 weeks)

`shilp-sutra-starter-{next,vite,astro}` — 3 starters for the most common frameworks. Each: working homepage + auth shell + dashboard demo.

Skip Remix/TanStack starters until demand emerges.

#### 6.3 — Marketing/docs site (2.3 of roadmap) (1 week)

Astro Starlight (decision needed — see roadmap open question 3). Hosts:
- Live demos
- Theming playground
- AI-agent integration page
- Migration guides
- Recipes
- Examples gallery (2.6 of roadmap — pull in here)
- Comparison page (4.6 of roadmap — pull in here)

### Exit criteria

- [ ] `dist/docs/` mirrored tree in tarball
- [ ] 3 starter repos public, working, linked from README
- [ ] Marketing site live at `shilp-sutra.devalok.in` or similar
- [ ] Examples gallery covers dashboard + auth + settings + marketing-landing

---

## Phase 7 — Measurement window + conditional CLI (Weeks 14-19+)

### Goal

Observe consumer + AI-agent feedback. Decide CLI go/no-go.

### Scope

#### 7.1 — Measurement (4-6 weeks observation, parallel with other work)

Track via labeled GitHub issues + ai-agent-feedback template:
- Install-failure rate per framework (target: <10%)
- Recipe step that trips agents most
- Common questions / patterns of confusion
- Karm-side bug count post 0.40+

#### 7.2 — CLI go/no-go decision (~Week 18)

Trigger conditions for CLI build (per roadmap § 5):
- `>50%` of new external installs require manual triage, OR
- Agent-success rate `<80%` on supported frameworks, OR
- Repeated requests for "automate this"

**If yes:** build CLI per roadmap § 5 cost estimate (4-5 weeks). Ships as 0.45.0.
**If no:** skip CLI, declare doc-driven sufficient. Move to Phase 8.

### Exit criteria

- [ ] Measurement dashboard published (could be a markdown table updated weekly)
- [ ] Go/no-go decision documented in roadmap "Decisions logged"
- [ ] If CLI: MVP shipped + tested against 3 frameworks

---

## Phase 8 — 1.0 RC (Week 20+) → ships as 1.0.0-rc.0

### Goal

Freeze API, lock name, prep launch.

### Scope

#### 8.1 — Name lock (1 day)

Decision: keep `@devalok/shilp-sutra` (cultural identity, brand-scoped) vs unscoped `shilp-sutra` (broader reach). Per public-release-roadmap open question 1.

#### 8.2 — 1.0 commitment criteria check (1 day)

Verify each criterion (per roadmap open question 2):
- [ ] 0.40+ minor without breaking changes since [version]
- [ ] 3+ external consumers with non-trivial usage
- [ ] All P0 issues closed
- [ ] At least one full successful breaking-release cycle WITH codemod (v0.39 sweep)
- [ ] Bundle size targets met (Phase 5)
- [ ] Public roadmap on GitHub Projects (3.9 of roadmap — ship in this phase)
- [ ] Quarterly review cadence active (3.10)

#### 8.3 — Launch assets (1 week)

- Public-launch blog post draft (4.2 of roadmap)
- 90-second demo video (4.3 — install → working dashboard)
- Comparison page polished (4.6)
- Discord OR GitHub Discussions setup (4.10 — pick one)
- Twitter/Bluesky thread drafts
- HN "Show HN" post drafted

#### 8.4 — Ship 1.0.0-rc.0 (1 day)

Tag as release-candidate. 2-week soak period for community feedback. Critical bug fixes only.

### Exit criteria

- [ ] Name decision logged
- [ ] All 1.0 criteria verified
- [ ] Launch assets ready
- [ ] 1.0.0-rc.0 published

---

## Phase 9 — Public launch (Weeks 22-24) → ships as 1.0.0

### Goal

Hit launch button.

### Scope

#### 9.1 — RC → 1.0.0 (1 day)

Apply RC fixes. Promote to 1.0.0.

#### 9.2 — Launch sequence (1 week)

Tuesday/Wednesday morning US Pacific.

- Submit to: awesome-react, awesome-design-systems, daily.dev, Product Hunt
- "Show HN:" post
- Twitter/Bluesky/Mastodon launch thread
- Reddit r/reactjs, r/webdev (answer real questions, don't spam)
- Engage in HN comments (be honest, accept criticism)

#### 9.3 — Post-launch monitoring (1 week)

- Watch issues + ai-agent-feedback labels
- Daily triage for 5-7 days
- Patch release as needed (1.0.1, 1.0.2)
- "Customer story" page once 3+ public adopters with logos (4.9)

### Exit criteria

- [ ] 1.0.0 live on npm
- [ ] HN post lands (front page or not — engagement is the metric)
- [ ] At least 3 external commits/issues from non-Karm consumers within 2 weeks
- [ ] No P0 issues open beyond 48 hours

---

## Cross-cutting (continuous)

| # | Item | Cadence |
|---|---|---|
| C.1 | PR-template enforcement (story + test + axe + bundle) | per PR |
| C.2 | Quarterly dep-audit (Tailwind, framer, sonner, vendored Radix) | quarterly |
| C.3 | Roadmap status updates (this doc + public-release-roadmap.md) | weekly |
| C.4 | Karm-side compatibility check after each shilp-sutra minor | per minor |
| C.5 | `/send-karm-notice` for any breaking change | per breaking minor |
| C.6 | Issue-template triage | weekly |
| C.7 | Pre-publish-audit gate review | per release |
| C.8 | **Figma component sync** — per [`CLAUDE.md` § Figma Component Generation](../../CLAUDE.md) HARD RULE: every component change must propagate to the Figma library via the workflow scripts (`figma-sync-tokens.mjs`, `figma-sync-components.mjs`, `figma-drift-check.mjs`). Skipping costs 3-5× rework (Button was rebuilt 4× on 2026-04-20 from this lapse) | per breaking change OR per minor |
| C.9 | "Stories are a publish gate" — every public component MUST have a `.stories.tsx` per [`CLAUDE.md`](../../CLAUDE.md) (learned 2026-03-12). Already gated by pre-publish-audit but flagged here as continuous discipline | per PR |
| C.10 | "Test release.yml end-to-end before merging" — never merge release-workflow changes without running them e2e first (cost 5 consecutive release failures during 0.37 publish per `feedback_test_release_yml_before_merge.md`) | per release.yml change |
| C.11 | Test discipline — NEVER stack test runs; one at a time, foreground only (per `feedback_test_discipline.md`) | per CI run |

## Total time estimate

| Phase | Effort | Calendar |
|---|---|---|
| 1 — Foundation closure | 2 wks | 2 wks |
| 2 — i18n + RTL + a11y | 3 wks | 3 wks |
| 3 — Layer + state + coverage | 1 wk | 1 wk |
| 4 — Tooling ecosystem | 2 wks | 2 wks |
| 5 — Trust signals | 2 wks | 2 wks |
| 6 — Starters + docs site | 3 wks | 3 wks |
| 7 — Measurement + conditional CLI | 4-6 wks observation; +4-5 wks CLI if built | 4-6 wks (parallel-able) |
| 8 — 1.0 RC | 1 wk | 1 wk |
| 9 — Launch | 1-2 wks | 1-2 wks |
| **Total (no CLI)** | **15 wks active work** | **~16-18 wks calendar** |
| **Total (with CLI)** | **20 wks active work** | **~22-24 wks calendar** |

**Realistic launch window:** late August to early November 2026 (depending on CLI go/no-go).

## Decisions still open

These need answers before specific phases — listed here so they don't block when reached:

| Phase | Decision | Resolve by |
|---|---|---|
| 1 | Variant normalization scope — full migration or only the worst offenders (Card/Alert/Badge)? | Phase 1 kickoff |
| 3 | Form-state alignment direction (rich `state` enum or simple `error: boolean`)? | Phase 3 kickoff |
| 6 | Marketing site stack — Astro Starlight vs Nextra? | Phase 5 end |
| 7 | CLI go/no-go criteria threshold | Phase 7 start |
| 8 | Name lock — keep scoped or rename? | Phase 8 start |
| 8 | Funding — GitHub Sponsors / Open Collective / skip? | Phase 8 start |

## How this plan relates to existing docs

- **`public-release-roadmap.md`** is the strategic-level doc. Phase numbering 0-4 there maps approximately to Phases 1-9 here. This document is the **execution-level** plan; the roadmap is the **why-and-what-if**. They should stay consistent — when one updates, update the other.
- **`findings.md`** is the source of truth for what's broken. This plan is what we DO about it.
- **`world-class-verification.md`** confirmed prior audit ~95% closed. This plan absorbs the 7 still-open items into appropriate phases.
- **`00-best-practices.md`** is the rubric. This plan is the path to satisfying the rubric.

## Tracking

Each phase ships with a changeset describing the user-facing impact + a section in this doc updated with `✅ DONE`. Don't let the plan drift behind the code.

Quarterly review (per cross-cutting C.3): re-evaluate phase ordering based on what's been learned.
