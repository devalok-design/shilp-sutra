# Principal-Architect Audit — Findings & Action Backlog

**Compiled:** 2026-05-09
**Lenses:** 6 (API consistency, Type coherence, Layer enforcement, Compound pattern, Dead code, Edge-case coverage)
**Source docs:** [`00-best-practices.md`](./00-best-practices.md) (rubric) + [`01-`](./01-api-consistency.md), [`02-`](./02-type-coherence.md), [`03-`](./03-layer-enforcement.md), [`04-`](./04-compound-pattern.md), [`05-`](./05-dead-code.md), [`06-`](./06-edge-case-coverage.md)

## Executive summary

shilp-sutra is **architecturally sound** for an AI-generated origin: zero `any` in public API, ~99% `forwardRef`/`displayName` coverage, layer rule enforced, no orphan files, no dead branches, strict TypeScript, no `@ts-nocheck` outside vendored Radix. The codebase passes structural tests of "is this serious software".

The deeper audit, however, surfaces **~145 findings across 6 lenses** that fall into clear **systemic themes** rather than per-component bugs. The five themes that dominate the backlog:

1. **Variant taxonomy Balkanization** — every CVA component invented its own variant value space. Only Button matches the canonical `solid|soft|outline|ghost|link`. Card has `default|elevated|outline|flat`, Alert/Badge ship `subtle` AND `soft` simultaneously, Banner has no `variant` axis at all, Tabs uses `line|contained`, SegmentedControl uses `default|solid`, Toggle uses `default|outline`. Consumers can't transfer mental models between primitives.
2. **`color="default"` survives the v0.32 sweep** — Card, Select-trigger, Progress, StatCard.accent still default to `"default"` despite the documented migration to `"accent"`. CI gate is missing.
3. **Size-scale fragmentation** — at least four scales coexist: `xs|sm|md|lg`, `sm|md|lg`, `xs|sm|md|lg|xl`, and Button's 12-value soup mixing physical size, density, and mode.
4. **RTL: zero coverage** — no component has been tested in `dir="rtl"`. Closes the design system to Arabic/Hebrew/Persian/Urdu markets entirely.
5. **Hardcoded user-facing strings** — 25 English strings baked into 8 components ("Close", "Confirm", "Loading...", file-size units). Blocks localization without source changes.

Beyond the systemic themes are **8 P0 items** (mostly i18n + a11y wiring), **30+ P1 items** (variant normalization, RTL framework, forced-colors backfill, axe coverage), and a long tail of P2/P3 polish.

**Time-to-1.0 implication:** the audit confirms 10-12 weeks aggressive / 5-6 months standard estimate from the public-release roadmap. Variant normalization (Card/Alert/Badge/Banner/Tabs alignment) is the single highest-impact pre-1.0 work — affects every consumer's mental model.

## Findings count

| Lens | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| 1 — API consistency | 0 | ~20 | ~25 | ~10 | ~55 |
| 2 — Type coherence | 0 | 0 | 6 | 14 | 20 |
| 3 — Layer enforcement | 0 | 2 | 6 | 0 | 8 |
| 4 — Compound pattern | 0 | 0 | 1 | 1 | 2 |
| 5 — Dead code | 1 | 6 | 4 | 21 | 32 |
| 6 — Edge case coverage | 8 | 10 | 8 | 8 | 34 |
| **Aggregate** | **9** | **38** | **50** | **54** | **151** |

(Lens 4 came back unusually clean — the codebase has strong compound discipline. Lens 2 also exceeds expectations — type rigor is best-in-class.)

## Top 10 cross-lens themes

These are the patterns that show up repeatedly across multiple lenses and warrant **systemic** rather than per-component fixes.

| # | Theme | Lenses | Severity | Effort |
|---|---|---|---|---|
| T1 | **Variant taxonomy normalization** — pick canonical `solid\|soft\|outline\|ghost\|link` and migrate Card, Alert, Badge, Banner, Tabs, SegmentedControl, Toggle, Select-trigger | 1, 4 | P1 | L (2 weeks) |
| T2 | **Color enum unification** — single `SemanticColor = 'accent' \| 'neutral' \| 'success' \| 'warning' \| 'error' \| 'info'`. Migrate Switch (3 colors), Toggle (4 different), Slider (4 different no-neutral), ConfirmDialog (2-only). Add CI gate that catches divergence | 1, 6 | P1 | M (1 week) |
| T3 | **`color="default"` removal completion** — Card, Select-trigger, Progress, StatCard.accent. Add pre-publish-audit gate to prevent regression | 1 | P1 | S (~half-day) + S (gate) |
| T4 | **RTL framework** — Storybook decorator + global codemod (`mr-` → `me-`, `pl-` → `ps-`, etc.) + directional-icon mirror utility + RTL stories for top 20 components | 6 | P1 | L (2-3 weeks for top 20) |
| T5 | **Forced-colors backfill** — Select, Tabs, Dialog, Toast, DatePicker, Combobox, Tooltip, Alert, Accordion, Skeleton, Stepper. Add `@media (forced-colors: active)` blocks uniformly | 6 | P1 | M (1 week) |
| T6 | **i18n hot list** — extract 25 hardcoded strings across 8 components into per-component label props with English defaults (Dialog.closeLabel, ConfirmDialog.{confirm,cancel,processing}Label, Spinner.srLabel, Toast file-size formatter, etc.) | 6 | P0 | M (3-4 days) |
| T7 | **`asChild` coverage gap** — Stack (currently uses `as` prop, Mantine antipattern), SegmentedControl, Stepper, Spinner, StatusDot, ColorSwatch, Skeleton, ProgressRing, StatCard, plus ~8 composed/* components | 1 | P1/P2 | M (per-component, batch L) |
| T8 | **Form-control state-API alignment** — Input has rich `state: default\|error\|warning\|success` enum; Switch/Checkbox/Radio expose `error: boolean` only. Asymmetric across the family. Standardize `state` enum or `color` enum across all form controls | 1, 6 | P1 | M |
| T9 | **Layer enforcement extension** — add `no-restricted-imports` for `ai/` layer (currently zero rules); fix `shell/app-command-palette.tsx → composed/` and `ai/command-bar.tsx → composed/` violations | 3 | P1 | S (rule) + M (refactors) |
| T10 | **Story + test coverage backfill** — Sidebar, BadgeGroup, BadgeIndicator, Breadcrumb, IconContext, DataTableToolbar — all 6 lack stories AND tests despite being public exports | 5 | P1 | M (5-6 stories + 6 tests) |

## P0 backlog (all from edge-case + dead-code lenses)

These block 1.0 release. All P0 items are concrete, mechanical, and cumulative effort is ~1 week.

| # | Lens | Component | Issue | Fix | Effort |
|---|---|---|---|---|---|
| P0-1 | 6 | `ui/dialog.tsx:165` | Hardcoded `<button title="Close">` | `closeButtonAriaLabel?: string` prop | S |
| P0-2 | 6 | `composed/confirm-dialog.tsx` | Hardcoded "Confirm"/"Cancel"/"Processing..." | `confirmLabel`/`cancelLabel`/`processingLabel` props | S |
| P0-3 | 6 | `ui/spinner.tsx` | Hardcoded sr-only `Loading...`/`Complete`/`Error` | `srLabel` prop | S |
| P0-4 | 6 | `ui/checkbox.tsx` | `aria-required` not propagated from FormField context | Wire `aria-required={ariaRequired \|\| undefined}` | S |
| P0-5 | 6 | `ui/dialog.tsx` (mobile sheet variant) | Focus trap not verified on mobile | Playwright test for tab cycling | M |
| P0-6 | 6 | `ui/button.tsx` | `onClickAsync` doesn't cleanup on unmount — setState-after-unmount potential | AbortController or mounted ref | S |
| P0-7 | 6 | `shell/data-table.tsx` | Rows not keyboard-navigable (no tabIndex, no arrow keys, WCAG 2.2 fail) | Add tab management + arrow nav + Space toggle | M |
| P0-8 | 6 | `ui/button.tsx` | No `aria-pressed` for toggle-style use | Optional `isPressed?: boolean` → `aria-pressed` | S |
| P0-9 | 5 | `ui/sidebar.tsx` | No tests despite component complexity. Critical for the surface area it covers | Write test suite | M |

**P0 total effort:** ~1 week solo + Claude Code.

## P1 backlog (must-fix before 1.0 freeze)

Grouped by theme. ~30+ items. Cumulative effort: ~6-8 weeks.

### Variant + size + color normalization (T1, T2, T3) — **highest leverage**

- Card: `color="default"` → `"accent"`; variant migration `default\|elevated\|outline\|flat` → `solid\|soft\|outline` + `elevation` axis
- Alert + Badge: drop `variant="subtle"` (it's `soft`); align with `solid\|soft\|outline\|ghost\|link`
- Banner: add `variant: subtle\|solid\|outline` axis (currently has only `color`)
- Select trigger: `color="default"` → `"accent"`
- Progress: `color="default"` → `"accent"`
- StatCard: align `accent` color enum to canonical
- Toggle: rename `default → ghost`; add `solid` and `soft`
- Switch / Slider: add missing color values (error/neutral)
- Slider: add `xs` size value
- Button: split 12-value size into `size` + `density` + `iconOnly`
- Codemod for each of the above + deprecation warnings for one minor

### RTL + forced-colors + a11y (T4, T5)

- Storybook RTL decorator + RTL story for top 20 components
- Codemod margin/padding `*l` → `*s` (start), `*r` → `*e` (end)
- Directional-icon mirror utility (chevron, arrow, search, expand)
- Forced-colors backfill: 11 components missing `@media (forced-colors: active)`
- vitest-axe assertion backfill: 32 components currently lacking explicit axe test (top 15 first)

### Layer enforcement (T9)

- Add ESLint `no-restricted-imports` for `ai/` layer
- Refactor `shell/app-command-palette.tsx → composed/CommandPalette` direct dep
- Refactor `ai/command-bar.tsx → composed/CommandPalette` types

### Coverage backfill (T10)

- Stories: Sidebar, BadgeGroup, BadgeIndicator, Breadcrumb, IconContext
- Tests: same 5 + DataTableToolbar
- Slider story update to match actual `color` axis (currently lying about success/warning)

### Controlled/uncontrolled gaps

- SegmentedControl: add `defaultSelectedId`
- FilterBar: add `defaultSearchValue`
- MultiSelectPopover, MemberPicker, InlineEdit: add `default*` props

### displayName fixes

- Slider, Toggle, Switch, Checkbox, Radio*, SelectTrigger: copy-from-Radix is showing empty/wrong names in DevTools. Set explicit strings.

## P2 backlog (post-1.0 cleanup)

50+ items. Most are polish: doc consistency, additional state coverage, type narrowing, render-prop refinements. Detailed in lens reports.

Notable P2 themes:
- React.FC → function components (13 files, cosmetic)
- Stack ref-typing precision via `as` polymorphism
- Chart `color?: string` → semantic union (4 chart components)
- Path-alias-vs-relative-import consistency decision
- Public-API tightening: `ProcessingSpeed`, `toast-types`, `Slot` to internal-only
- Variant scale alignment for Switch/Checkbox/Radio (add xs/xl)
- `Stack as → asChild` migration

## P3 backlog (polish)

54 items. Animation easing, opacity preview, icon scaling, prefers-reduced-motion crossfade subtlety. Defer indefinitely.

## Pre-1.0 sprint plan

Three-week intensive maps to the public-release roadmap's "Sprint 2" slot. Sequence:

### Sprint A: P0 + variant normalization (week 1)

- All 9 P0 items (~1 week)
- T1 variant taxonomy refactor (Card + Alert + Badge alignment, deprecate aliases for one minor) (~3 days)
- T3 `color="default"` removal completion + CI gate (~1 day)
- Codemod + changeset

**Outcome:** ships as 0.39.0. Breaking change with codemod (per CONTRIBUTING § Versioning + the Mantine v7 lesson incorporated in our policy).

### Sprint B: i18n + RTL framework (weeks 2-3)

- T6 i18n props for 25 hardcoded strings (~3-4 days)
- T4 RTL framework + RTL stories for top 20 components (~2-3 days for framework, then per-component fixes)
- T5 forced-colors backfill across 11 components (~3 days)

**Outcome:** ships as 0.40.0. Localization-ready + global-market viable.

### Sprint C: a11y + coverage backfill (week 4)

- T8 form-control state-API alignment (~2 days)
- T9 layer enforcement fixes (~2 days)
- T10 story + test backfill (~2 days)
- vitest-axe expansion on top 15 components (~2 days)

**Outcome:** ships as 0.41.0. WCAG 2.2 AA bar uniformly cleared. Layer rule airtight.

### Sprint D: P2 selection (week 5+)

Pull a curated set of P2 items based on consumer feedback after 0.41.0. Defer the rest post-1.0.

## Roadmap implications

The audit doesn't fundamentally change the public-release roadmap, but it sharpens it:

| Roadmap item | Audit impact |
|---|---|
| **Phase 1.5.1 (`@devalok/eslint-plugin-shilp-sutra`)** | Now urgent — would catch variant-axis drift, hardcoded i18n strings, missing axe assertions. Move from Sprint 3 to Sprint A/B as enforcement infrastructure |
| **Phase 1.5.2 (codemod policy)** | Confirmed correct — variant normalization NEEDS a codemod (precedent from Mantine v7) |
| **Phase 1.5.3 (codemod package)** | Move forward — backfill v0.38 codemod retroactively + ship variant-normalization codemods in 0.39.0 |
| **Phase 3.4 (a11y conformance page)** | Audit hands you the data — RTL gap (P1, T4), forced-colors backfill (T5), axe coverage gaps (T10) |
| **Phase 3.1 (size-limit per entry)** | Unaffected by audit |
| **1.0 commitment criteria** | Tighten with audit findings: zero P0 outstanding, all T1-T10 themes resolved, variant normalization codemod shipped + adopted by Karm |

## Verdict

shilp-sutra **clears the bar for serious production software** — clean type discipline, layer enforcement, no dead code, strong compound patterns. The audit's task was finding ROOM TO IMPROVE, not foundational issues, and it succeeded.

**Five focused weeks (Sprints A-C above) bring the codebase from "very good for an AI-built DS" to "ready for 1.0 freeze".** The biggest single win is **variant taxonomy normalization** — the bedrock pattern that every consumer learns first. Get that right and the 1.0 promise of "API stability" actually means something.

## Audit cost & artifacts

- **Time:** ~3 hours (research + 6 parallel lens audits + synthesis)
- **Token cost:** ~moderate (subagent-parallel execution kept main context lean)
- **Documents shipped:** 7 markdown files at `docs/audits/2026-05-09-principal-architect/`
- **Findings:** 151 across 6 lenses
- **Cross-lens themes:** 10
- **P0 items:** 9
- **Pre-1.0 effort estimate:** 5 weeks aggressive
