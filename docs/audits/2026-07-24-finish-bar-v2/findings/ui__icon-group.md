# ui/icon-group — finish-bar audit

Finish: 3/5   Market: PARITY (Chakra `Group`/`HStack`; LAGS Radix Toolbar on the toolbar path)   Rebuild: polish

A tiny non-visual layout primitive: `IconProvider` + a flex row that propagates `size`/`stroke` to child `<Icon>`s via context, with an optional `role="toolbar"`. It has no surface, border, shadow, or radius of its own, so most visual/motion/state axes are N/A. It is clean of every AI-slop tell and reuses the canonical `IconSize`/`IconStroke` types. The gaps are all on finish-bar craft dimensions: off-cadence raw Tailwind gaps, an overreaching `role="toolbar"` API that ships wrong ARIA and contradicts its own doc, a silently-dropped `label`, and no `...rest` pass-through. Nothing changed in source since the 2026-07-01 baseline (also 3/5), so the score holds.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells, no surface/radius/shadow/rail/gradient/emoji. Only blemish: raw `gap-0.5/1/2` (icon-group.tsx:8-12) sit off the `--spacing-ds-*` cadence the rest of the lib uses. No `rounded-ds-*`/`rounded-full`; no magic bracket values. |
| accessibility | gap | Default (no role) path is clean — children are `<Icon>` carrying their own labels. But `role="toolbar"` (line 40-44) is wrong-pattern: a WAI-ARIA toolbar promises roving-tabindex + focusable controls; IconGroup adds no focus management and its children are decorative SVGs. The `Toolbar` story (stories:45-57) demonstrates exactly this broken pattern. `label` is silently discarded unless `role="toolbar"` — a quiet a11y footgun. No axe play test. |
| api-composability | gap | forwardRef + displayName + exported `IconGroupProps`, no `any`, canonical `IconSize`/`IconStroke` reused, composes `IconProvider` correctly (not re-rolled). But: NO `...rest` spread — `id`, `data-*`, `aria-*`, `style`, handlers all blocked (conformance skips `attrs`, test:16-18), diverging from every sibling that extends `HTMLAttributes`. No `asChild`/polymorphism (locked to `<div>`). `label` accepted-but-ignored isn't expressed in the type (should be a `role`+`label` discriminated union). `gap: tight/default/loose` is a one-off vocabulary. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas and matches the prop surface — but it contradicts the API: it says "IconGroup … Not interactive … use ButtonGroup or ToggleGroup, not IconGroup" while the component ships `role="toolbar"` and the canonical story is literally named `Toolbar`. One of them is stale. |
| testing | gap | Solid for a primitive: `describeConformance` + RTL covering gap classes, role present/absent, label-gating, multi-child. No `vitest-axe` assertion. The `skip: ['attrs']` codifies the missing pass-through as intentional. |
| motion | N/A | Static, non-interactive layout primitive — no animation surface. |
| state-coverage | N/A | No hover/active/focus/disabled/loading; `children` is required so there's no empty state. Nothing to design. |
| content-resilience | gap | `inline-flex` with no wrap strategy — many icons overflow horizontally with no `flex-wrap` escape. RTL is safe (logical `gap`, no directional arrows). No truncation concern (icons, not text). |
| theming-resilience | ✓ | No colors/radius/shadow of its own → nothing to break on an accent-9 swap, `[data-shape]`, or dark-mode elevation inversion. Children inherit theme correctly. |
| system-cohesion | gap | Two family drifts: raw `gap-0.5/1/2` while 605 `gap-ds-*` usages exist across `src/ui`; and no `HTMLAttributes` extension / `...rest` while siblings (Card, IconButton) all provide it. `tight/default/loose` gap vocab is not shared. |
| craft | ✓ | Quiet wins: `useMemo` on the context value (icon-context:20) avoids needless child re-renders, canonical shared types, `items-center` optical alignment, forwardRef. |
| perceived-performance | ✓ | Trivially instant; memoized context; zero layout shift. |
| market-benchmark | gap | As a context-propagation + layout primitive it's at PARITY with Chakra `Group`/`HStack` and simpler than Radix Toolbar. It LAGS Radix Toolbar specifically on the `role="toolbar"` path (no roving focus, no orientation, no separator). |
| cross-ds-adoption | gap | Concrete imports available from peers (see below). |

## Top gaps (prioritized)
- [P1] accessibility — `role="toolbar"` ships wrong ARIA (no roving-tabindex, decorative children) and the `Toolbar` story demonstrates it → either remove the `role`/`label` props and point consumers to ButtonGroup/ToggleGroup (matches the doc), or keep it only as a documented escape hatch that REQUIRES focusable children + consumer-owned roving focus, and rebuild the story with real buttons.
- [P1] docs-dx — doc "Not interactive / use ButtonGroup" directly contradicts the shipped `role="toolbar"` + `Toolbar` story → pick one and delete the other; the API and doc must agree.
- [P1] api-composability / system-cohesion — no `...rest` spread blocks `id`/`data-*`/`style`/handlers → `extends React.HTMLAttributes<HTMLDivElement>`, spread `{...rest}` after className/role, drop `skip: ['attrs']`.
- [P2] visual-integrity / system-cohesion — map `tight→gap-ds-01`, `default→gap-ds-02`, `loose→gap-ds-03` (px already match: 2/4/8) so gaps track the token scale.
- [P2] accessibility — `label` silently no-ops unless `role="toolbar"` → apply `aria-label` whenever `label` is set, or model role+label as a discriminated union so the type expresses the coupling.
- [P2] content-resilience — add an optional `wrap` for many-icon overflow.
- [P3] api-composability — optional `asChild`/Slot for `<nav>`/`<ul>` semantics.

## What it does well
- Zero AI-slop tells; no surface/shadow/radius drift because it deliberately owns none.
- Reuses canonical `IconSize`/`IconStroke` instead of re-rolling an axis; composes `IconProvider` rather than duplicating context.
- `useMemo`'d context value — a real, unseen perf nicety for a primitive that will wrap large icon clusters.
- forwardRef + displayName + exported props type; typed literals, no `any`, no `React.FC`.
- Theme- and RTL-safe by construction.

## Cross-DS adoption ideas
- **Radix Toolbar** — if an interactive variant is ever wanted, it provides roving-tabindex, `orientation`, and `Toolbar.Separator`. Don't bolt this onto IconGroup; it's the reason the doc already routes toolbars to ButtonGroup/ToggleGroup.
- **React Aria `Group`** — a labelable, non-interactive grouping semantic (`role="group"` + `aria-label`) that would let `label` actually mean something without over-claiming `toolbar`. This is the honest home for the discarded `label`.
- **Chakra `Group`/`HStack`** — `wrap` + `separator` props for overflow and visual dividers between clustered icons.

## Rebuild note
Polish, not rebuild — the primitive is structurally sound (right composition, right types, clean visuals). Scope: (1) resolve the toolbar API-vs-doc contradiction (remove `role`/`label` or promote to a documented, focus-managed escape hatch + honest `Toolbar` story); (2) `extends HTMLAttributes` + `...rest`; (3) map gaps to `gap-ds-01/02/03`; (4) make `label` non-silent or type-coupled; (5) optional `wrap` and `asChild`. No structural teardown needed.
