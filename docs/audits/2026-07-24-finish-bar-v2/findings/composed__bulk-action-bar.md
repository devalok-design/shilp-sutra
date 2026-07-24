# composed/bulk-action-bar — finish-bar audit
Finish: 2/5   Market: LAGS(React Aria Toolbar / Linear selection bar)   Rebuild: polish (substantial, in-place)

Visually this is at the bar — clean overlay surface, role tokens, single edge, no slop. But the core interaction is **keyboard-broken**: roving `tabIndex` lives on a non-interactive wrapper `<div>` while the real `<Button>` is `tabIndex={-1}`, so keyboard-only users can move the focus ring across actions but cannot invoke them. That is a P0-severity a11y failure on the component's primary function (axe still passes — it can't see it), which caps finish at 2 regardless of the clean visuals. This is the **same defect the 2026-07-01 baseline flagged and it is still unfixed** in source.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | `bg-surface-overlay` + `shadow-floating`, no border → single edge; `rounded-surface` role token; spacing on cadence (`gap-ds-04/02`, `px-ds-05`, `py-ds-03`, `bottom-ds-06`); no accent rail/gradient/glow/emoji/pill-spam. Overlay surface is correct for a floating toolbar. |
| accessibility | ✗ | **Keyboard trap:** roving `tabIndex` on the `motion.div` wrapper (`:93`), inner Button `tabIndex={-1}` (`:102`), focus moved onto the div (`:150`) → Enter/Space on the focused div does nothing; actions unreachable by keyboard. Toolbar model is also inconsistent — Clear-X and Select-all are separate tab stops, not in the arrow roving set. Confirm flow has no `aria-live`/`role`, and focus is not moved to Confirm on open nor restored on cancel — a destructive confirmation invisible to AT. `role="toolbar"` + `aria-label` + Escape-to-clear are good baselines. |
| api-composability | gap | Config-object `actions[]`, not slotted children — can't inject a Select/divider/tooltip-wrapped action; no `asChild` so an action can't be a link/router nav; not `forwardRef`, doesn't spread `HTMLAttributes` (test must `skip:['className','ref','attrs']` — `:27` — documenting the gap); action `color` truncated to `'accent'\|'error'` (2 of 6 canonical). Typed, controlled `show`, composes Button/Badge/Icon — so functional, just behind best-in-class. |
| docs-dx | gap | Doc now exists but is **inaccurate**: lists `icon: ComponentType` (source: `IconInput`), `color: "default"\|"error"` (source: `'accent'\|'error'` — a consumer following the doc passes an invalid value), and omits `requiresConfirmation`, `confirmMessage`, `totalCount`, `onSelectAll`. Says `z-50`; source is `z-sticky` (1100). Source-is-truth violated. |
| testing | gap | Unit + RTL + `vitest-axe` + `describeConformance` + a confirmation interaction test — solid. But **no arrow-then-Enter keyboard-activation test** (which would have caught the trap), no empty-`actions`, no overflow, no RTL/forced-colors. |
| motion | gap | Entrance has `opacity:0` (no slide-no-fade tell). But one `springs.snappy` drives both the 100px bar entrance and per-button micro-flips (large travel should be `springs.smooth`); no local `useReducedMotion` guard (100px slide runs full-amplitude without a consumer `MotionConfig` — `withReducedMotion` helper exists, unused); `AnimatePresence mode="popLayout"` wraps ActionButtons that unmount/remount on the confirm toggle, so exit/enter fire on a state change, not a list change. `springs.snappy` is not bounce-free for a functional element (Emil). |
| state-coverage | gap | disabled ✓, error color ✓, inline confirm ✓. Missing: **no loading/pending state** for async bulk ops (archive/delete are usually async — `onClick` fires with zero pending feedback); empty `actions=[]` renders a dead gap between Badge and Clear-X (still shown); no selected/multi-select-of-actions concept. |
| content-resilience | ✗ | **No overflow strategy** — many actions push a fixed centered bar past the viewport with no wrap/scroll/overflow menu. **RTL broken** — pins with physical `left-1/2 -translate-x-1/2` (not logical), and Arrow Left/Right are not mirrored for RTL. Long labels `whitespace-nowrap` with no truncation. |
| theming-resilience | ✓ | `--color-surface-overlay` defined for light, dark, and `forced-colors` (`Canvas`); `--shadow-floating` themed; `rounded-surface` honors `[data-shape]`. It's a shadowed overlay, not a sunken track — no dark-mode elevation-inversion bug. |
| system-cohesion | ✓ | Shares DS springs, radius role language, focus ring (via Button), spacing tiers, and composes Button/Badge/Icon rather than re-rolling them. Minor drift: 2-of-6 color truncation. |
| craft | gap | Escape-to-clear (`:137`) is a genuine nice touch. But focus is not moved into the bar when it appears; `key={action.label}` collides on duplicate labels; the Confirm button is hardcoded `color="error"` even for non-destructive confirmations. |
| perceived-performance | gap | Instant mount via portal + AnimatePresence, no CLS. But with no per-action pending state, a slow bulk op gives no feedback between click and completion — perceived perf on async actions is undefined. |
| market-benchmark | ✗ | LAGS. Visual finish is at parity with Linear/Gmail selection bars, but we lag React Aria's Toolbar on the keyboard model (single tab stop + roving + real activation), lag Gmail/Linear on async progress feedback, and lag on overflow handling. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- **[P0] accessibility** — keyboard-only users cannot activate actions (roving tabindex on a wrapper div; real Button is `tabIndex={-1}`) → put the roving `tabIndex` on the actual `<Button>` (forward the ref to the button, or forward Enter/Space from the wrapper), and add an arrow-then-Enter activation test that locks it in.
- **[P1] accessibility** — confirm flow is invisible to AT → wrap the confirm cluster in `role="group"` + `aria-live="assertive"`, move focus to Confirm on open, restore on cancel.
- **[P1] content-resilience** — RTL fully broken (physical translate + non-mirrored arrows) and no overflow strategy → use logical positioning, mirror arrow keys under `dir=rtl`, and add an overflow menu (or horizontal scroll) for many actions.
- **[P1] api-composability** — not `forwardRef`, doesn't spread `HTMLAttributes` → `forwardRef` + `extends Omit<HTMLAttributes<HTMLDivElement>,…>`, remove the conformance `ref`/`attrs` skips.
- **[P1] docs-dx** — doc prop table is wrong (icon type, color values, 4 missing props) → regenerate from source/manifest; a consumer currently gets a type error following it.
- **[P2] state-coverage** — no async/pending state → add a per-action `loading`/pending affordance (Button already supports it) so slow bulk ops show progress.
- **[P2] motion** — uniform `springs.snappy` + no reduced-motion guard + popLayout over remounting nodes → `springs.smooth` for the 100px slide, keep ActionButton mounted across confirm, read `useReducedMotion()`.
- **[P2] api-composability** — offer a slot/compound API (`BulkActionBar.Root/Count/Actions/SelectAll`) accepting real `<Button>` children + `asChild`; widen action `color` to the full Button union; keep `actions[]` as shorthand.

## What it does well
- Clean, correct floating-overlay visuals — right surface tier, single edge treatment, role radius/shadow, on-cadence spacing. No anti-slop tells whatsoever.
- Composes DS primitives (Button/Badge/Icon) and shares the system spring/radius/focus language.
- Escape-to-clear keyboard shortcut is a thoughtful, non-obvious touch.
- Inline per-action confirmation is a differentiated feature (better than a separate dialog for lightweight destructive intents) — the pattern is right even though its a11y wiring isn't.
- Entrance animation includes `opacity:0` (no slide-no-fade defect), and theming survives light/dark/forced-colors at the token level.

## Cross-DS adoption ideas
- **React Aria `Toolbar`** gets the exact model we're missing: a single tab stop, roving focus across all controls (including clear/select-all), and real keyboard activation because focus lands on the controls themselves. Adopt its structure.
- **Linear / Gmail selection bars** show per-action progress (spinner in-place) during async bulk ops and collapse extra actions into a `⋯` overflow menu when the set is large — both directly address our state-coverage and content-resilience gaps.
- **Radix `Toolbar`** offers `ToolbarButton`/`ToolbarSeparator`/`ToolbarToggleGroup` slotted primitives — a template for a compound API that keeps the `actions[]` shorthand as a convenience layer.
- **Vaul/Sonner motion baseline** — differentiate enter (larger, `smooth`) from micro-feedback (`snappy`) and add a local reduced-motion fallback rather than depending on a consumer `MotionConfig`.

## Rebuild note
**Polish, not structural rebuild** — but a substantial polish, and the a11y item is a ship-stopper for keyboard users. The config-object API is a legitimate design choice (DataTable consumes it internally) and can stay; the fixes are known and in-place: (1) move roving `tabIndex` onto the real Button + add an activation test, (2) make the confirm flow AT-visible with `role`/`aria-live`/focus management, (3) `forwardRef` + `HTMLAttributes` spread, (4) logical/RTL positioning + mirrored arrows + an overflow menu, (5) async pending state, (6) motion differentiation + reduced-motion guard, (7) correct the doc from source. A slotted compound API is a nice-to-have that can follow. No new tokens or structural teardown required.
