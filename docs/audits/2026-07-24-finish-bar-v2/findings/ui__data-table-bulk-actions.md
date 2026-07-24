# ui/data-table-bulk-actions — finish-bar audit

Finish: 2/5   Market: LAGS (Linear / Notion / Airtable bulk-action bars)   Rebuild: polish

> Internal, non-exported sub-component of DataTable — but it IS visible (a fixed floating toolbar), so all visual/a11y/motion axes apply. Source takes explicit props (`table`, `selectedRows`, `bulkActions`); it does NOT read from a context (the doc is wrong — see docs axis).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean token use — `rounded-overlay`, `rounded-control-inner`, `shadow-floating`, `bg-surface-overlay`, no edge-soup (shadow-only, no competing border), no gradient/glow/emoji. But off-cadence bare utilities: `bottom-6`, `h-5` (divider) sit on the consumer numeric scale, not `--spacing-ds-*`; `p-ds-01` (2px) is below the ds-03/05/07 cadence. No `rounded-ds-*`/`rounded-full`, no `border-card-strong`. |
| accessibility | ✗ | `role="toolbar"` + `aria-label` ✓, X has `aria-label="Clear selection"` ✓, divider `aria-hidden` ✓. BUT: (1) hand-rolled X button is ~20–24px (`p-ds-01` + `Icon size="sm"`), no `touch-target` util → below 44px; (2) the X `<button>` has NO `focus-visible:ring` — only hover styles, so keyboard focus is invisible; (3) `role="toolbar"` implies the WAI-ARIA toolbar pattern (arrow-key roving tabindex, Home/End) and none of it is implemented. |
| api-composability | gap | Typed generic `<TData>`, typed `BulkAction` interface. But `label: string` (no `ReactNode` → no icons in actions), `color?: 'accent' \| 'error'` is narrower than Button's 6 colors, and the variant mapping is hardcoded (`error → solid`, else → `outline`). No `forwardRef`/`displayName`. Internal, so acceptable — but the surface is thin. |
| docs-dx | ✗ | Doc actively CONTRADICTS source: claims it "reads selection state + bulkActions config from DataTableContext" — source takes explicit `table`/`selectedRows`/`bulkActions` props, no context. Exactly the doc-rot the rubric warns about. No Props/Types table (justifiable for internal, but the false context claim is not). |
| testing | ✗ | No `.test.tsx` file exists. Zero unit/RTL/axe coverage on a visible interactive toolbar. |
| motion | ✗ | `animate-in slide-in-from-bottom-2` with NO `fade-in-*` → slides in already fully opaque (slide-no-fade). No `motion-safe:`/reduced-motion guard. No exit animation (unmounts abruptly — no AnimatePresence). Doesn't share the DS framer spring vocabulary. No press feedback (`active:scale`) on the buttons or X. |
| state-coverage | gap | hover (X + Buttons) ✓, disabled (Button) ✓. Missing: focus-visible on X, no pending/loading affordance for async `onClick`, and an empty `bulkActions` array renders a lonely count + divider + X (undesigned degenerate state). |
| content-resilience | gap | `whitespace-nowrap` on count ✓. But the fixed, centered (`left-1/2 -translate-x-1/2`) bar has NO max-width / overflow / "more" menu — many actions or long i18n labels overflow the viewport on mobile with no wrap or scroll strategy. |
| theming-resilience | ✓ | Semantic tokens throughout; survives an accent-9 swap; role radius honors `[data-shape]`. `bg-surface-overlay` is a solid tier (dark ≈ `oklch(0.13 …)`) so it does NOT vanish on near-black — no elevation-inversion bug here. |
| system-cohesion | gap | Reuses Button/Icon/z-sticky/role tokens ✓. But re-rolls the icon button as a raw `<button>` instead of `<Button variant="ghost" size="icon-sm">` (composition-duplication anti-pattern), and its one-off CSS slide diverges from the DS's framer-spring motion used elsewhere. |
| craft-details | gap | Divider `aria-hidden`, `whitespace-nowrap`, `transition-colors` on X hover are nice touches. Undercut by the missing focus ring, missing active state, and sub-44px hit area. |
| perceived-performance | gap | `fixed` positioning → no layout shift (CLS-safe), instant CSS appear. But no optimistic/pending feedback: a slow bulk `onClick` gives the user nothing (button can't enter loading). |
| market-benchmark | ✗ (LAGS) | vs Linear/Notion/Airtable selection bars: they ship keyboard nav, overflow/"more" menu, Escape-to-clear, fade+spring enter/exit, and per-action pending states. We have none of those. TanStack Table is headless (no UI peer). |
| cross-DS-adoption | n/a (see ideas) | — |

## Top gaps (prioritized)
- [P0] accessibility — X button below 44px + no `focus-visible` ring; `role="toolbar"` without keyboard roving → fix: swap X for `<Button variant="ghost" size="icon-sm" aria-label>` (gets ring + touch-target for free), and either implement arrow-key roving tabindex or drop to `role="group"` if a true toolbar pattern isn't intended.
- [P0] testing — no test file → add RTL + `vitest-axe`: renders count, fires `onClick` with `selectedRows`, `resetRowSelection` on clear, disabled action, axe pass.
- [P1] motion — slide-no-fade + no reduced-motion + no exit → add `fade-in-0`, wrap in `motion-safe:` (or a `useReducedMotion` guard), and give it an exit (AnimatePresence) so it doesn't pop out.
- [P1] docs-dx — doc claims context data-flow that doesn't exist → correct to explicit-props description; add a minimal Props table.
- [P1] design-pref — non-error actions use `variant="outline"`; CLAUDE.md defaults secondary actions to `soft` → switch the non-error branch to `variant="soft"` (the floating overlay surface is exactly where soft reads well).
- [P2] content-resilience — no overflow strategy → cap width + collapse extra actions into a "More" menu, or horizontal scroll on mobile.
- [P2] api — `label: string` → `ReactNode` (icons); consider widening `color` to Button's full set.

## What it does well
- Correct role-token discipline: `rounded-overlay` + `rounded-control-inner`, `shadow-floating` alone (no border → no edge-soup), `z-sticky`, `bg-surface-overlay`.
- Solid ARIA scaffolding for a sub-component: labeled toolbar, aria-hidden divider, labeled icon-only clear button.
- Theming- and dark-mode-safe: solid overlay tier won't vanish on near-black; no hardcoded colors.
- Reuses the DS Button/Icon rather than restyling text — the action buttons inherit variant/color/disabled correctly.

## Cross-DS adoption ideas
- **Linear / Notion** selection bars: Escape-to-clear + an explicit count-with-affordance ("3 selected · Select all 128"). We could add Escape handling and an optional select-all bridge.
- **Airtable / Linear**: overflow "More" menu when actions exceed the bar width — pairs with our existing DropdownMenu.
- **Vercel/Geist toast + Vaul**: spring-based enter/exit with fade; we already ship framer + the DS spring — this bar should use it instead of a one-off CSS slide.
- **React Aria toolbar**: proper roving-tabindex toolbar behavior — adopt it (or its pattern) so `role="toolbar"` is honest.

## Rebuild note
Polish, not rebuild — the structure (fixed floating bar of Buttons + clear) is sound and the token usage is largely correct. In-place fixes: (1) replace the raw `<button>` X with `Button variant="ghost" size="icon-sm"` to inherit focus ring + 44px target; (2) add `fade-in-0` + `motion-safe:` + an exit transition; (3) switch non-error actions to `variant="soft"`; (4) add overflow handling and pending affordance; (5) fix the doc's false context claim; (6) author stories + a test with an axe assertion. Only "make `role="toolbar"` a real roving-tabindex toolbar" edges toward structural — everything else is surface polish.
