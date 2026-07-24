# shell/bottom-navbar — finish-bar audit
Finish: 2/5   Market: LAGS (Material 3 Navigation Bar / iOS Tab Bar)   Rebuild: rebuild

> Source: `packages/core/src/shell/bottom-navbar.tsx` (291 lines, single file).
> Prior baseline: `docs/audits/2026-07-01-ai-giveaway-polish/findings/shell__bottom-navbar.md` scored 3/5 (old rubric, 0=slop→5=Card-bar). **Every P1/P2 from that baseline is still unfixed in source**, and the test file it credited ("real badge test with axe assertion") no longer exists in the tree — so testing regressed. One thing improved: the bar now sits on `bg-surface-chrome` (correct chrome tier, 0.49.0) instead of the old `bg-surface-raised`.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells: active indicator is a legit full-width top underline (tab pattern, not an accent rail), single edge (`border-t`, no shadow → no edge-soup), semantic `accent-*`/`error-*` tokens, radius **role** tokens throughout (`rounded-t-bubble`, `rounded-b-control-inner`, `rounded-overlay-lg`, `rounded-pill` — all verified in semantic.css, NO `rounded-ds-*`/`rounded-full`). But spacing cadence is broken by a pile of magic numbers (see systemic flag). |
| accessibility | ✗ | Overflow "More" menu is a hand-rolled `role="dialog"` with **no focus trap** (Tab escapes the open sheet), **no scroll lock**, **no return-focus**, and **no `aria-modal`**. Backdrop is a static `<div onClick>` with the a11y lint rule suppressed (`jsx-a11y/no-static-element-interactions`) — Escape only works while focus stays in the panel; nothing traps it there. More button has `aria-expanded` but **no `aria-haspopup="dialog"` / `aria-controls`** and the panel has no `id`. Close button `h-ds-sm w-ds-sm` is sub-44px on a touch-first component (a `touch-target` util exists and is unused). Primary links are `h-16`/64px (good), `pb-safe` present, `aria-current="page"` correct. |
| api-composability | ✗ | Dead `user`/`BottomNavbarUser` prop — accepted, documented ("used to determine admin status, presence"), destructured as `_user`, **never read**; stories `NoUser`/`AssociateRole` imply behavior that doesn't exist. Re-rolls the shipped **Sheet/Dialog** primitive by hand and re-rolls **Badge** (NavBadge) with raw values — the exact "re-roll instead of compose" anti-pattern the rubric names. `forwardRef` + `displayName` + `IconInput` typing are correct; path-driven API is reasonable (no value/onValueChange needed). |
| docs-dx | gap | Doc structure is complete (Props/Example/Composability/Gotchas/Changes) but stale vs source: types `icon` as `ReactNode` (source: `IconInput`), documents the dead `user` prop as functional, and "Defaults: None" omits the three real defaults (`currentPath='/'`, `primaryItems=[]`, `moreItems=[]`). |
| testing | ✗ | **No `bottom-navbar.test.tsx` in the tree** (only `.tsx` + `.stories.tsx`). Prior baseline credited a badge+axe test; it's gone. Zero unit/RTL/axe coverage on a component with real a11y surface (dialog semantics, roving focus, badges). Stories exist (10, good state coverage) but no play/axe test. |
| motion | gap | Strong reduced-motion discipline: `useReducedMotion` gates whileTap, the shared-element indicator spring, and the sheet slide (all → `{duration:0}`). Springs come from the shared `motion` lib (`snappy`/`smooth`), press feedback via `whileTap`. Gaps: the backdrop `<div bg-overlay>` is **not** a motion element, so it pops in/out instantly while the sheet slides (no fade); NavBadge's `animate-in zoom-in-75` is a raw CSS animation **not** reduced-motion gated; one shared `layoutId="bottom-nav-indicator"` spans two independent regions (primary items + More button) — fragile origin on list changes. |
| state-coverage | gap | Active/selected (indicator), hover (grid bg), press (whileTap), empty (`NoPrimaryItems`/`NoMoreItems`; More button hidden when `moreItems` empty; badge 0 hidden) all handled. No per-item disabled state; overflow grid is hard `grid-cols-4` regardless of count → 1–3 items render left-packed with dead columns. No loading/error (n/a for nav). |
| content-resilience | gap | `max-w-[70px]` + `flex-1` items with `text-center` labels and **no truncation strategy** — long/i18n-expanded titles wrap unpredictably. Not RTL-safe: `left-0 right-0`, badge `-right-1`, `rounded-b-*` on indicator use physical not logical properties; no mirrored layout. `pb-safe` safe-area is good. Fixed 4-col overflow grid doesn't adapt to item count. |
| theming-resilience | ✓ | Survives brand accent swap (`accent-9`/`accent-11` semantic), honors `[data-shape]` via radius role tokens, correct `surface-chrome` tier, dark-mode safe (indicator is an `accent-9` fill, not a recess that vanishes on near-black). Caveat: hardcoded pixel sizes won't respond to density presets. |
| system-cohesion | gap | Shares the DS spring lib, radius role language, `accent` semantics, Icon API, and `useLink` seam with siblings. Breaks cohesion by re-rolling Sheet + Badge instead of composing them (bespoke drift). |
| craft | gap | Nice touches: shared-element `layoutId` indicator, `pb-safe`, 99+ badge cap, `cursor-pointer`, `aria-current`. Undercut by the sub-44 close target, no label truncation, and the fixed grid. |
| perceived-performance | ✓ | Instant press feedback (`whileTap`), animated indicator, no skeleton needed, no CLS risk, no jank. |
| market-benchmark | ✗ | LAGS Material 3 Navigation Bar / iOS Tab Bar. Peers ship a complete, accessible overflow surface (proper modal with trap/scroll-lock/return-focus), guaranteed touch targets, and label-visibility options; iOS/M3 nail the 44px minimum. We match on animated active indicator + badges but trail on overflow a11y, touch sizing, and i18n label handling. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- **[P0] api-composability + accessibility** — Overflow "More" menu is a hand-rolled dialog (raw backdrop, manual Escape, manual focus `useEffect`) → re-found it on the DS **`Sheet side="bottom"`** primitive. One move deletes the eslint-disable, the raw backdrop, the manual focus effect, and the manual Escape handler, and inherits focus trap + scroll lock + return-focus + `aria-modal` + `aria-haspopup`/`aria-controls`.
- **[P1] testing** — Zero tests. Add RTL + `vitest-axe` covering: active-item `aria-current`, badge render/cap, More-menu open/close + focus behavior, and an axe play test. (Restores lost coverage.)
- **[P1] api-composability** — Resolve the dead `user`/`BottomNavbarUser` prop: implement the documented admin/presence gating **or** remove it (breaking → changeset + deprecated alias) and delete the misleading `NoUser`/`AssociateRole` stories.
- **[P1] accessibility** — Bump the close control to a ≥44px `touch-target` (or use IconButton).
- **[P2] visual-integrity / theming** — Detokenize magic numbers: derive the sheet offset from bar height (not `bottom-[72px]`, which silently detaches if `h-16` changes), move `h-[3px]`/`max-w-[70px]`/badge `text-[10px]`/`h-4` onto size/spacing tokens.
- **[P2] api-composability / cohesion** — Compose `Badge`/`Dot` for NavBadge instead of re-rolling with raw values.
- **[P2] content-resilience** — Add label truncation + logical properties (RTL); make the overflow grid responsive to item count.
- **[P2] motion** — Make the backdrop a motion element that fades with the sheet; reduced-motion-gate the badge `zoom-in-75`.
- **[P3] docs-dx** — Sync the prop table: `icon: IconInput`, document the three defaults, reconcile the `user` prop.

## What it does well
- Clean visual foundation: correct chrome surface tier, radius **role** tokens (release-gate-safe), single-edge treatment, no slop tells, legit tab-underline indicator.
- Exemplary reduced-motion discipline — every animated element is gated, entrance/exit differentiated via `AnimatePresence`.
- Shared-element `layoutId` indicator is a genuinely nice cross-item animation.
- Props-driven + router-agnostic via `useLink`/LinkProvider — good decoupling seam.
- Sensible empty handling (More button hides when no overflow, badge 0 hidden), `pb-safe`, 99+ cap.

## Cross-DS adoption ideas
- **Vaul (bottom drawer):** drag-to-dismiss + velocity + snap points + built-in a11y for the "More" sheet — exactly the surface we're hand-rolling. Adopt Vaul (or our own Sheet) instead of the raw `<div onClick>`.
- **Material 3 Navigation Bar:** pill-shaped active indicator *behind the icon* (vs our top underline) and label-visibility modes (always / selected-only) for narrow viewports — worth offering as a variant.
- **Radix NavigationMenu / Toolbar semantics:** proper `aria-haspopup`/`aria-controls` wiring and roving-tabindex conventions to model the More trigger↔panel relationship.
- **iOS Tab Bar:** guaranteed 44px hit targets on every control — a floor we currently miss on the close button.

## Rebuild note
**Rebuild** (scoped, structural). The bar shell itself is fine — this is not a visual redo. The structural reasons: (1) the overflow menu must be re-founded on the `Sheet` primitive rather than a hand-rolled `role="dialog"` (it currently lacks focus trap, scroll lock, return-focus, `aria-modal`, and the trigger↔panel ARIA relationship — a11y contract that cannot be patched incrementally without effectively rebuilding it into Sheet); and (2) the dead `user` prop is a breaking API change to remove. Bundle with: compose Badge, add tests, fix the close touch target, detokenize magic numbers, and add label truncation + RTL. This component was flagged at the same points on 2026-07-01 and shipped unfixed for a full quarter — the rebuild is overdue, not speculative.
