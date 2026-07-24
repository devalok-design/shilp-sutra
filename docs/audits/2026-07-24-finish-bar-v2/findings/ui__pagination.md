# ui/pagination — finish-bar audit
Finish: 3/5   Market: PARITY (shadcn/ui Pagination)   Rebuild: polish

Clean, non-slop, near-identical to the shadcn pagination pattern. Real semantics (`nav`/`ul`/`li`/`button`), `aria-current="page"`, per-button `aria-label`, sr-only ellipsis, role radius token, tabular-nums, forwardRef+displayName throughout, thorough tests. Gaps are all finish-bar polish, not slop — and most carry over unfixed from the 2026-07-01 finding (still 36px, still controlled-only, still `active:scale-95` unguarded, still broken `p` doc snippet, still empty `cn('')`).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No accent rail/gradient/emoji/glow/pill-spam. `rounded-control` role token (6px), `bg-accent-9`/`surface-raised-hover`/`surface-fg` semantic tokens, `gap-ds-02`/`pl-ds-03` cadence. Fill-only buttons → no edge-soup. Active page has no hover/press differentiation (minor). |
| accessibility | gap | Strong ARIA (`nav[aria-label=pagination]`, `aria-current`, icon-only aria-labels, `aria-hidden`+sr-only ellipsis, native `<button>` keyboard nav, focus-visible ring+offset). BUT interactive buttons are 36px (`h/w-ds-sm-plus` = 36px) — below the DS's own 44px `touch-target` bar (util exists at utilities.css:187, unused here). Meets WCAG 2.5.8 AA (24px), fails the DS hard bar. |
| api-composability | gap | forwardRef everywhere, `asChild` on Link, clean compound + `PaginationNav` wrapper. BUT `PaginationNav` is controlled-only — no `defaultCurrentPage`/uncontrolled mode (forces `useState` for trivial cases); no `size` axis unlike the Card family; `asChild` typed on Previous/Next but unusable (Slot single-child vs injected icon+label). |
| docs-dx | gap | Has Compound/Utility/Composability/Gotchas + router-integration note. BUT example snippet references undefined `p` (`setPage(p - 1)` — loop var is `page`); no canonical Props/Types/Defaults table. |
| testing | ✓ | generatePagination edge cases (small/equal/near-start/near-end/middle/siblingCount=2/single/two), interaction (click/prev/next/clamp), aria-current, nav landmark, ref, `describeConformance` (carries the axe pass). |
| motion | ✗ | `active:scale-95` on `transition-colors` only → scale is not in the transition, so press snaps with no easing; AND no `motion-reduce:`/`useReducedMotion` guard (violates the explicit reduced-motion requirement siblings honor). Bypasses framer/MotionConfig, so it diverges from Button/Card press feedback. Two failures on one axis. |
| state-coverage | gap | hover/active/focus-visible/disabled designed. Active (current) page button stays clickable with zero hover/press affordance. loading/empty are N/A for pagination. |
| content-resilience | gap | `tabular-nums` prevents width jitter as page numbers change (nice); ellipsis handles large counts. BUT "Previous"/"Next" + their aria-labels are hardcoded English (no i18n, no icon-only override); directional chevrons not verified to mirror in RTL (Icon API mirroring unconfirmed, no RTL story). |
| theming-resilience | ✓ | `rounded-control` honors `[data-shape]` presets (2px/6px/10px per semantic.css); `accent-9`/`accent-fg`/`surface-*` survive a brand swap; forced-colors handled at the token layer (`--color-accent-fg: HighlightText`, `--color-surface-raised-hover: Canvas`). Transparent nav → no dark-mode elevation-inversion risk. |
| system-cohesion | gap | Shares radius/focus-ring/spacing/tabular vocabulary with siblings. BUT raw-CSS `active:scale-95` press feedback drifts from the framer-motion press used by Button/Card; no `size` axis where the Card family has one; doc steers to DataTable footers but offers no compact density. |
| craft | gap | `tabular-nums` is a genuine craft win (no digit reflow). Chevron+label spacing (`pl-ds-03 pr-ds-04`) is optically tuned. BUT current page is an interactive `<button>` with no affordance (should be non-interactive or feedback'd); `PaginationItem` carries dead `cn('', className)`. |
| perceived-performance | ✓ | Pure-function page layout, instant feedback, no async/skeleton, no CLS; `tabular-nums` keeps row width stable across page changes. |
| market-benchmark | PARITY | vs shadcn/ui Pagination: structurally near-identical (compound parts, 36px buttons, props-controlled, hardcoded labels, generatePagination-equivalent). We add `PaginationNav` + typed `generatePagination` export (slight lead on DX). Behind React Aria (Adobe) on i18n + uncontrolled state + disabled-current. Net: parity with shadcn, a step behind React Aria. |
| cross-ds-adoption | gap | Concrete imports available (see below). |

## Top gaps (prioritized)
- [P1] accessibility — 36px interactive page/prev/next buttons fail the DS 44px `touch-target` bar → wrap the hit box with the `touch-target` util (or a `@media (pointer:coarse)` box) while keeping 36px visual density; don't enlarge the glyph.
- [P1] motion — `active:scale-95` snaps (not in `transition-colors`) and has no reduced-motion guard → add `transition-transform` + `motion-reduce:active:scale-100`; align with Button's press feedback.
- [P1] api-composability — `PaginationNav` is controlled-only → add `defaultCurrentPage` + internal controllable-state so trivial cases don't need `useState`; keep `onPageChange` firing in both modes.
- [P2] content-resilience — hardcoded English "Previous"/"Next" + aria-labels → let `children` override the label and expose a `labels` prop on `PaginationNav`; verify/force RTL chevron mirroring with a story.
- [P2] docs-dx — broken snippet: `p` is undefined → use `page` with clamping; add a canonical Props/Types/Defaults table.
- [P2] state-coverage / stories — only `Default` + `WithActive`, both static → add a stateful `PaginationNav` story, a disabled-edge story (page 1 / last), RTL + forced-colors decorators.
- [P3] craft — current page stays interactive with no affordance → make it non-interactive (`aria-disabled`, no onClick) or give it hover/press feedback; drop dead `cn('', className)` in `PaginationItem`.
- [P3] api — `asChild` typed on Previous/Next but unusable (two children vs Slot single-child) → document as unsupported or restructure so the anchor is the Slot with icon+label inside.

## What it does well
- Genuinely not slop: no accent rail, gradient text, glow/glass, emoji, or raw framework palette. Every value is a semantic/`ds-*` token.
- Correct navigation semantics + ARIA: `nav[role=navigation][aria-label]`, `aria-current="page"`, icon-only `aria-label`s, `aria-hidden`+sr-only "More pages" ellipsis.
- `tabular-nums` on page numbers — a small, real craft detail that stops width jitter as the active page grows/shrinks.
- `rounded-control` role token → theming/shape-preset safe; forced-colors handled at the token layer.
- Two-tier API done right: composable low-level parts for custom rendering + a `PaginationNav` convenience wrapper + a standalone typed `generatePagination` helper (reusable in DataTable footers).
- Thorough tests: pure-function edge cases, interaction, clamping, aria, ref, conformance.

## Cross-DS adoption ideas
- **React Aria (Adobe)** localizes Prev/Next via `useLocale`/messages and auto-mirrors direction in RTL — we should adopt a `labels` prop + locale-aware chevron mirroring instead of baked English.
- **React Aria / TanStack** expose uncontrolled state (`defaultValue` / internal pagination state hook) — add `defaultCurrentPage` + `useControllableState` to `PaginationNav`.
- **shadcn/ui** renders the current page as non-interactive (no onClick, styled as current) — we keep it a live button with no affordance; adopt the non-interactive-current pattern.
- **Carbon / MUI DataGrid pagination** ship page-size selectors and a "jump to page" input — a `renderPage`/slot escape hatch on `PaginationNav` (or a compact `size="sm"` axis for dense table footers) would close the DataTable-footer use case the doc points at.

## Rebuild note
Polish, not rebuild — the structure, semantics, tokens, and tests are sound; this is the shadcn pattern executed cleanly. In-place fixes: (1) expand the hit box to 44px via the existing `touch-target` util while keeping 36px visuals; (2) fix the press micro-motion — `transition-transform` + `motion-reduce` guard; (3) add uncontrolled mode (`defaultCurrentPage`); (4) localizable/slottable Prev/Next labels + RTL chevron verification; (5) repair the broken doc `p` snippet and thin stories. No structural/API break required — all additive or internal. Every gap here was flagged on 2026-07-01 and remains unshipped, so this is a backlog-clearing polish pass, not new discovery.
