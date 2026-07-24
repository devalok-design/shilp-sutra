# composed/responsive-modal — finish-bar audit
Finish: 4/5   Market: PARITY (Vaul)   Rebuild: polish

Responsive overlay: centered Dialog at md+, content-height / snap-point bottom sheet below, on one accessible primitive (`@primitives/react-dialog`). Compound API, drag-to-dismiss, optional iOS-style detents, full-bleed background slot. No prior baseline finding (added 0.49.0 via #115).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Role tokens throughout (`rounded-overlay-lg`, `rounded-control-inner`, `rounded-pill`), correct `bg-surface-overlay`/`bg-overlay`, single `shadow-overlay`. But raw arbitrary values: `max-h-[85dvh]`, `max-h-[90dvh]`, `left-[50%]/top-[50%]`, inline `height:${maxSnap*100}dvh`, and drag-handle `h-1 w-8` (raw TW scale, off ds-cadence). Mobile `border-t border-surface-border-strong` + `shadow-overlay` ring = mild double-edge on the top lip. Spacing spans 6 ds tiers (01/02/02b/03/04/05/06) vs the 03/05/07 cadence. |
| accessibility | gap | Strong core: dialog focus-trap/Escape/scroll-lock from primitive, required Title label, `sr-only` + `title` on close, `focus-visible:ring-2 ring-accent-9`, `border-strong` has forced-colors=`CanvasText` override. **Miss: close button hit area is `min-h-ds-xs min-w-ds-xs` = 24×24px** — far below the 44px `touch-target` util that sibling composed comps use. Dialog has other exits (Escape/footer) so not fatal, but the primary affordance fails target-size. |
| api-composability | ✓ | Best-in-class: controlled+uncontrolled (`open`/`defaultOpen`/`onOpenChange` — Radix-canonical), `dismissable` shared via context, compound 11 parts, all `forwardRef`+`displayName`, `asChild` passthrough, `snapPoints`/`defaultSnapPoint`. **Composes** the dialog primitive (alternative-to Dialog/Sheet) rather than re-rolling — the anti-drift ideal. |
| docs-dx | ✓ | Doc matches source (props, defaults, mobile-only caveats, z-stacking gotcha, "don't add your own max-h"). Compose/alternative-to relations mapped. 5 stories cover Default/Scrolling/Snap/NonDismissable/Background. |
| testing | gap | Desktop RTL + axe + open/close/Escape/dismissable-false covered. But 0% of the mobile logic — `nearestSnapIndex`, `restY`, `handleDragEnd` (the bug-prone math) — is tested; jsdom-no-layout is a fair excuse for drag, but `nearestSnapIndex` is a pure function and unit-testable today. No `describeConformance`. |
| motion | gap | Good springs/tweens (`springs.smooth` ~critically damped, bounce-free for a functional overlay), `tweens.fade` overlay, `active:scale-90` press, transform/opacity-only (HW-accel), AnimatePresence exit, interruptible. **Miss: `useReducedMotion` only gates `canDrag` — the enter/exit spring + scale + overlay fade run at full motion for reduced-motion users.** `withReducedMotion` helper exists in motion.ts and is unused here. |
| state-coverage | ✓ | Close button hover/active/focus-visible/disabled all designed; `dismissable=false` is a deliberate state (no close btn, blocks Escape/outside/drag). Empty/error/loading are consumer content (N/A for a shell). |
| content-resilience | gap | Internal scroll body + height caps, ScrollingBody (20 sections) + snap-picker (12 items) stories, `flex-col-reverse sm:flex-row` footer, `text-center sm:text-left` header. **RTL: close button pinned with physical `right-ds-05`** (not `end-`/logical) — stays right in RTL instead of mirroring. Otherwise symmetric (`inset-x-0`). |
| theming-resilience | ✓ | Role radius honors `[data-shape]`; `surface-overlay` has light/dark; `surface-border-strong` swaps neutral-7→neutral-5 dark + `CanvasText` forced-colors — deliberately chosen so the sheet top lip survives dark elevation. No accent-9-swap breakage. |
| system-cohesion | ✓ | Shares `springs.smooth`, `tweens.fade`, accent-9 focus ring, role radius, ds spacing, and the very dialog primitive with Dialog/Sheet. Feels like one system; no bespoke spring or radius. |
| craft | ✓ | `useDragControls` so the scroll body never fights the drag (handle-only initiation), `ResizeObserver` to express snaps in px, snap projection onto the visible-fraction axis, reset-to-opening-snap on reopen, `cursor-grab`/`touch-none`, close button `z-10` above `-z-10` background. Genuinely thoughtful. |
| perceived-performance | ✓ | `forceMount` + AnimatePresence = instant, transform-based drag, no CLS, spring settle. Trivial first-frame before `sheetHeight` measures (activeSnap animates in). |
| market-benchmark | PARITY | vs **Vaul** (drawer gold standard) + Radix Dialog. LEADS on the unified desktop-Dialog/mobile-Sheet switch (Vaul doesn't do responsive mode-switching). LAGS Vaul on: controlled active-snap API, overlay-opacity tied to drag position, background-scaling. Radix Dialog parity on the desktop half (we compose it). |
| cross-DS-adoption | ✓ | Concrete imports listed below. |

## Top gaps (prioritized)
- [P1] accessibility — close button tap target is 24×24px (`min-h/w-ds-xs`) → swap to the `touch-target` @utility (44px) as siblings do; keep the visual icon size.
- [P1] motion — reduced-motion not honored for enter/exit/overlay (only disables drag) → branch `initial/animate/exit/transition` on `reduced` (or route through `withReducedMotion`) so reduced-motion users get an opacity-only, no-slide/no-scale transition.
- [P2] content-resilience — close button uses physical `right-ds-05` → use logical `end-ds-05` (or `inset-inline-end`) so it mirrors in RTL.
- [P2] testing — extract/unit-test `nearestSnapIndex` (pure); it's the snap-selection brain and currently has zero coverage.
- [P2] visual-integrity — the arbitrary `max-h-[85dvh]/[90dvh]` and `h-1 w-8` handle are off-token; consider dvh cap constants + a ds-sized handle to stay on cadence (magic-number tell).

## What it does well
- Real composition, not a re-roll: one primitive, alternative-to Dialog/Sheet, so focus-trap/Escape/scroll-lock/portal come for free and stay consistent.
- The drag mechanics are the standout — `useDragControls` + handle-only initiation solves the classic scroll-vs-drag fight, and the snap math (measure → project → nearest → dismiss-below-lowest) is correct and velocity-aware.
- `dismissable={false}` is wired end-to-end (hides close, blocks Escape/outside/drag, still allows programmatic close) and tested.
- Dark-mode sheet lip was thought about: `surface-border-strong` exists specifically so the top edge doesn't vanish on near-black.

## Cross-DS adoption ideas
- **Vaul — overlay fade tied to drag** (`fadeFromIndex`): dim the overlay proportionally as the sheet is dragged down; today the overlay is binary open/closed. Big perceived-quality win.
- **Vaul — controlled snap point** (`activeSnapPoint`/`setActiveSnapPoint`): expose the active snap so consumers can drive it (e.g. "expand" button). We only manage it internally.
- **Vaul — `shouldScaleBackground`**: the iOS card-stack effect where the page behind scales/insets as the sheet rises. Optional, high-polish.
- **Vaul — px or % snap points**: we accept only viewport fractions; allowing px snaps helps fixed-height content.

## Rebuild note
Polish, not rebuild. Structure (compound + single-primitive composition + drag/snap engine) is sound and market-competitive — no reason to restructure. In-place fixes: (1) 44px touch-target on the close button, (2) honor reduced-motion on the enter/exit + overlay animation, (3) logical `end-` for the close button, (4) unit-test `nearestSnapIndex`, (5) optionally replace the arbitrary dvh caps / raw-scale handle with tokens. Items 1–2 are the ones that actually move the finish score to 5.
