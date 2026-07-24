# composed/master-detail — finish-bar audit
Finish: 2/5   Market: LAGS (React Aria / Adobe Spectrum list-detail)   Rebuild: polish

MasterDetail is a clean, token-hygienic responsive list+detail layout — no slop tells, no dead classes, no radius/magic-number violations. Since the 2026-07-01 baseline (2/5) it has quietly fixed its worst bug: `activeChildIndex` (lines 112–126) now derives roving focus from the active child and syncs it, closing the prior P0 focus/selection desync. What still holds it below the bar is **a11y correctness** (a listbox with no accessible name and a detail pane that swaps silently) and a **controlled-only, hand-wired API** that owns the ARIA roles but not the selection. Foundation is sound; the fixes are additive polish, not a structural rebuild.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No slop tells; accent-rail already killed (active row is tinted `bg-accent-2 text-accent-11`). Tokens throughout (`px-ds-04`, `border-surface-border`, `ring-accent-7`). No `rounded-ds-*`/`rounded-full`, no arbitrary values. Surface-agnostic by design (consumer wraps) — acceptable for a layout primitive but undocumented as intentional. |
| accessibility | ✗ | `role="listbox"` has **no accessible name** (no `aria-label`/`aria-labelledby`) — SR announces a nameless listbox. Detail pane swaps on `key={selected}` with **no `aria-live`/focus management** — SR users get no notice the detail changed. No `aria-activedescendant` (focus does move, so tolerable). Focus-visible ring + roving tabindex + Arrow/Home/End/Enter/Space all present and correct. |
| api-composability | ✗ | Controlled-only: no `onSelect`/`onValueChange`, no `defaultSelected`, no item-level `value`/`id`. Consumer hand-wires `active={id===sel}` **and** `onClick` on every row (see stories). No `asChild`/`href` — rows can't be anchors (master-detail lists are usually navigable). `cloneElement(child as ReactElement<any>)` injects `ref`/`tabIndex` untyped. `forwardRef`+`displayName` present on ListItem. |
| docs-dx | gap | Doc prop table omits `emptyState` (line 30) and `onNavigate` (line 33) — two public root props undocumented. SSR/matchMedia gotcha is well-documented. |
| testing | ✗ | Tests cover render + `option` role + `aria-selected`/`data-active` only. **No vitest-axe**, no keyboard-nav test, no interaction coverage — the component's headline feature (roving Arrow/Home/End nav) is entirely untested, which is exactly the hole that let the a11y gaps through. No `describeConformance`. |
| motion | gap | Detail slide animates transform+opacity (HW-accel, correct) with `springs.snappy` (DS token, effectively bounce-free). Desktop uses `initial={false}` (no entry anim — good). **No `useReducedMotion`/`withReducedMotion` guard** despite the repo shipping both; relies on a consumer-level `MotionConfig` to reduce. No press/select feedback on rows (color-only). |
| state-coverage | gap | `emptyState` prop supported (good, but never shown in a story). Hover/active/focus/selected deliberately designed. Missing: loading skeleton, per-item `disabled` handling, and `itemCount`/`setItemCount` context is dead weight (written, never read). `childCount` counts non-ListItem children → arrow clamp can target a non-focusable child. |
| content-resilience | gap | List rows have **no truncation** — long names wrap unbounded. RTL: back arrow `IconArrowLeft` never mirrors, and `border-r`/`border-b` are physical, not logical (`border-e`/`border-b` is fine but `border-r` should be `border-e`). `px-ds-*` is horizontal so padding survives RTL. Many-items handled (roving nav scales); no virtualization. |
| theming-resilience | ✓ | All color via semantic tokens (`accent-2/11/7`, `surface-*`); survives an accent-9 swap. No hardcoded radius → shape presets pass trivially. Surface-agnostic so no light↔dark elevation-inversion risk (no sunken track to vanish). |
| system-cohesion | gap | Shares DS spring (`springs.snappy`), focus-ring (`ring-accent-7`), and spacing cadence with siblings. But its controlled-only selection model **diverges from the DS's canonical `value`/`onValueChange`** now used by SegmentedControl et al., and it re-rolls listbox plumbing instead of composing a shared list primitive. |
| craft | gap | Nice: roving tabindex synced to the active child (112–126), `focus-visible:ring-inset`, `data-active` hook for consumers. Missing: truncation, press feedback, and the `Enter/Space`→`click()` shim re-implements native button activation unnecessarily. |
| perceived-performance | gap | Desktop: instant (no entry animation, color transitions only) — no CLS. Mobile: `AnimatePresence mode="wait"` waits for the outgoing pane's exit before mounting the new one → a perceptible gap on every drill-in/back. Consider `mode="popLayout"` or `sync`. |
| market-benchmark | LAGS | vs React Aria `useListBox`/Adobe Spectrum list-detail: they own selection state (`useListState`), full a11y (labeling, `aria-activedescendant`, disabled items), typeahead, and virtualization. We match on roving keyboard nav + responsive collapse; we lag on selection ownership, listbox labeling, typeahead, and disabled items. |
| cross-DS-adoption | n/a | See ideas below. |

## Top gaps (prioritized)
- [P0] accessibility — listbox has no accessible name + detail pane swaps with no `aria-live`/focus move → add `aria-label`/`aria-labelledby` to the listbox and an `aria-live="polite"` region (or move focus to the detail heading) on `selected` change.
- [P1] api-composability — controlled-only, hand-wired `active`+`onClick`, no `asChild` → add item `value`/`id` + root `onSelect`/`defaultSelected` (derive `active`/`aria-selected` from context); add `asChild`/`href` so rows can be anchors.
- [P1] testing — no axe, no keyboard-nav coverage on the headline feature → add vitest-axe + Arrow/Home/End/Enter interaction tests + `describeConformance`.
- [P2] motion — no reduced-motion guard → gate the x-offset behind `useReducedMotion()`/`withReducedMotion`.
- [P2] content-resilience — no truncation, RTL back-arrow + `border-r` don't mirror → add `truncate` option on rows, mirror the arrow (`rtl:-scale-x-100` or logical icon), switch `border-r`→`border-e`.
- [P2] state-coverage — dead `itemCount` context; `childCount` counts non-item children → remove unused context fields, count only valid ListItems; add `emptyState`/disabled/loading stories.
- [P3] docs — add `emptyState` + `onNavigate` to the prop table; type `breakpoints` as `Record<'sm'|'md'|'lg', string>`.

## What it does well
- Zero slop: no accent rail, gradient, glow, emoji, or default-palette color; the V1 accent-rail tell was killed pre-baseline.
- Full token discipline — spacing, color, focus-ring, and spring all semantic; no dead TW3 classes, no radius-role violation, no arbitrary values.
- Roving tabindex now correctly derives from the active child and resyncs on change (fixes the prior P0 desync).
- Complete keyboard nav (Arrow/Home/End + Enter/Space) with a real `focus-visible:ring-2 ring-inset` — focus is never removed without replacement.
- Motion is transform+opacity only with a DS spring token, and desktop correctly opts out of entry animation (`initial={false}`).

## Cross-DS adoption ideas
- **React Aria `useListState`/`useListBox`** — own selection internally (`selectedKey`/`defaultSelectedKey`/`onSelectionChange`) so consumers stop hand-wiring `active` + `onClick`; derive `aria-selected` from state. This is the single biggest API upgrade.
- **React Aria / Spectrum** — typeahead (type a letter to jump to the matching row) and per-item `isDisabled` with skip-on-arrow; we have neither.
- **Radix `asChild` (Slot)** — let a ListItem render as an `<a href>` while keeping `role="option"` + roving tabindex, for navigable link lists.
- **TanStack Virtual** — virtualized listbox for large master lists; we render every row.
- **Vaul/Sonner motion feel** — `mode="popLayout"` or an origin-aware crossfade instead of `mode="wait"` to kill the drill-in latency gap on mobile.

## Rebuild note
**Polish, not rebuild.** The compound structure (Root/List/Detail/ListItem), context wiring, responsive matchMedia collapse, and roving-focus sync are architecturally sound and worth keeping. The work is additive: (1) a11y — name the listbox + announce detail swaps; (2) API — introduce item `value`/`id` + `onSelect`/`defaultSelected` + `asChild`, keeping the current controlled `selected`/`active` props as still-supported inputs (no hard break); (3) reduced-motion guard; (4) drop the dead `itemCount` context and filter non-ListItem children; (5) tests (axe + keyboard) and doc/prop-table fixes. None of this requires restructuring the component tree.
