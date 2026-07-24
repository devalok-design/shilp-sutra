# composed/command-palette — finish-bar audit
Finish: 3/5   Market: LAGS(cmdk)   Rebuild: polish

Prior baseline (2026-07-01) scored this 4/5. The structure has not regressed — but the v2 rubric surfaces a **confirmed dead-class visual bug** the prior pass called "CLEAN" (V2 border-only), the P1 docs drift is **still unfixed**, and the M2 stagger is **still unbounded**. Net: a genuinely well-built component held back by contained, all-fixable-in-place defects. Not slop; not at bar.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Overlay/surface layering correct (`bg-surface-overlay`, `shadow-overlay`), radius mostly role tokens. BUT `border border-card-strong` on 5 keycaps (L378, 517, 520, 525, 529) is a **dead class** — only `border-card` is a defined `@utility`; there is no `--color-card-strong`. Those borders render as `currentColor` (text color), not a themed border. Also bare `rounded` on 3 kbds (L474, 517, 520) instead of a role token, and `max-w-[560px]`/`top-[20%]` magic numbers. |
| accessibility | gap | Strong: full ARIA combobox/listbox/option, `aria-activedescendant`, active-index sync, Enter/Escape, rAF autofocus, `VisuallyHidden` title+desc. Gap: active row is **background-only** (`bg-surface-raised-hover`) with **no forced-colors / focus-visible outline fallback** — keyboard users in high-contrast lose the selection indicator (baseline P2 H, unfixed). No Home/End/PageUp-Down. |
| api-composability | ✓ | Canonical `open`/`defaultOpen`/`onOpenChange`; controlled+uncontrolled with stale-closure-safe `openRef`; `keybinding` (string/array/false), `maxHeight`, `footerHints`, `emptyState`, `renderLabel`, `filterValue`; `ReactNode` labels; `forwardRef`+`displayName`; no `any`; composes `Dialog` (does not re-roll overlay). Data-driven not slot-based, but that is the standard cmdk pattern. |
| docs-dx | ✗ | Prop table (docs L7-13) lists only 4 of 11+ shipped props — `open`, `defaultOpen`, `onOpenChange`, `keybinding`, `maxHeight`, `footerHints`, `emptyState` (the headline features) are entirely undocumented. Composability line still claims **"cmdk-style fuzzy matching"** — the impl is plain `.includes()` substring (L194), no scoring/subsequence. False claim + stale table = below bar. (Baseline P1×2, unfixed.) |
| testing | gap | Thorough for props: axe (closed/open/empty), controlled/uncontrolled, keybinding variants, ReactNode+filterValue, renderLabel, custom empty/footer/maxHeight, shortcut keycaps. Missing: the **core keyboard-nav interaction** — no test that ArrowDown moves activeIndex, Enter fires `onSelect`+closes, or Escape closes. The headline feature is untested. |
| motion | gap | Reduced-motion genuinely respected (`useMotion()` → `noInit`/`noMotionTransition` on every motion element); transform/opacity only; `springs.snappy`/`tweens.fade` tokens. Gap: **unbounded flat-index stagger** (`itemIndex * 0.03` L434, `groupIdx * 0.06` L412) — last of 12 items waits ~330ms, "types itself in" (AI stagger reflex) and **re-fires on every filter keystroke** that changes membership. `springs.snappy` is ~0.95 damping ratio (faint overshoot) — fine for entrance. |
| state-coverage | gap | hover / active / focus(input) / empty (+custom `emptyState`) all designed; zero/one/many groups safe. Missing: **no loading/async state** (sync-only by design, but a palette is usually server-fed) and **no per-item `disabled`** (a deferred follow-up). No error state. |
| content-resilience | ✓ | `truncate` on label, `line-clamp-1` on description, `maxHeight`+`overflow-y-auto`, scroll-active-into-view. Zero/one/many handled. RTL: uses physical `px-ds-*` and literal `↑↓` — RTL-neutral enough for a centered overlay, minor logical-property nit. |
| theming-resilience | gap | Semantic tokens throughout (`accent-2/6/11`, `surface-*`); radius role tokens honor `[data-shape]`; dark overlay/active-row survive. BUT the `border-card-strong` dead class means 5 keycap borders **do not theme at all** (render `currentColor`) — a direct theming-resilience defect, not just cosmetic. |
| system-cohesion | ✓ | Shares `Dialog`, motion springs, radius language, `Icon`/`IconProvider` API, spacing tokens, focus model with siblings. The dead class + bare `rounded` are the only drift tells; otherwise "in tune." |
| craft-unseen | ✓ | Scroll-active-into-view, platform-aware modifier display (Ctrl→⌘ via `getModifierDisplay`), rAF autofocus on open, animated return-arrow on the active row, `onMouseEnter` syncs activeIndex with keyboard, stale-closure-safe `openRef`. Real, felt polish. |
| perceived-performance | ✓ | Instant substring filter, no async so no skeleton needed, no CLS. Only cost is the entrance stagger delaying last-row appearance (~330ms) — noted under motion, minor here. |
| market-benchmark | ✗ | vs **cmdk** (pacocoursey) / Raycast / Linear: we LAG on matching quality — substring `.includes()` only, **no fuzzy scoring or result ranking** (cmdk ships `command-score`); no virtualization for large lists; no async/loading state; no per-item disabled. At parity on ARIA + keyboard nav; ahead on reduced-motion discipline. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P0] visual-integrity / theming — `border-card-strong` is a **dead class** (no `@utility`, no `--color-card-strong`; only `border-card` exists). 5 keycaps render `currentColor` borders instead of a themed border. → replace with `border-card` (or `border-surface-border-strong`, already used on the input/footer separators for consistency).
- [P1] docs-dx — prop table omits 7 shipped props + the false "cmdk-style fuzzy matching" claim. → regenerate table from `CommandPaletteProps`; change "fuzzy matching" to "substring (contains) filtering" OR implement real fuzzy. (Unfixed from 2026-07-01.)
- [P1] motion — bound the stagger: `Math.min(itemIndex, 6) * 0.03` or a container `staggerChildren`; do not re-stagger on query change (only on open). (Unfixed from 2026-07-01.)
- [P1] accessibility — add a `@media (forced-colors)` outline/border on `[aria-selected=true]` so the active row survives high-contrast (active state is background-only today).
- [P2] testing — add interaction tests for ArrowDown/ArrowUp wrap, Enter→onSelect+close, Escape→close.
- [P2] visual — bare `rounded` on 3 kbds → `rounded-control`; comment `max-w-[560px]`/`top-[20%]` as deliberate layout constants or tokenize.
- [P2] state — no async/loading path; a palette that fetches results has no `loading` affordance. Consider a `loading` prop + skeleton rows.

## What it does well
- Composes `Dialog` correctly — does not re-roll the overlay surface or shadow (the StatCard/Card anti-pattern is absent here).
- Reduced-motion is exemplary: `useMotion()` gates *every* motion element, with `noInit` collapsing entrance transforms.
- Controlled/uncontrolled done right, with a stale-closure-safe `openRef` in `setOpen`.
- Full ARIA combobox/listbox/option pattern with `aria-activedescendant` and mouse/keyboard active-index sync.
- Craft details: platform-aware modifier glyphs, scroll-into-view, rAF autofocus, animated return-arrow on the active row.

## Cross-DS adoption ideas
- **cmdk**: real fuzzy scoring (`command-score`) with automatic result ranking — we do unranked substring only; "dsh" → "Dashboard" fails today.
- **cmdk**: `shouldFilter={false}` + async/loading state for server-driven results — we have no async story at all.
- **cmdk / Base UI**: virtualized listbox for large command sets — we render every item + stagger every item.
- **cmdk**: `<Command.Empty>` / `<Command.Group>` slot composition — a future major could offer `<CommandPalette.Empty>`/`.Footer>` alongside the data-driven API (do not churn now).
- **Raycast**: per-item `disabled` + section item-counts + a nested actions submenu on the active row.

## Rebuild note
**Polish, not rebuild.** The architecture is sound — Dialog composition, ARIA pattern, controlled-state plumbing, and reduced-motion handling are all at or above bar and should not be touched. The gaps are all in-place fixes: swap the `border-card-strong` dead class (P0, one find/replace), regenerate the stale doc + drop the false fuzzy claim, bound the entrance stagger, add a forced-colors active-row outline, and add keyboard-nav interaction tests. To close the market gap with cmdk (fuzzy scoring, async/loading, virtualization) is a separate, optional feature investment — not required to reach the finish bar for the current sync/data-driven scope.
