# ui/dialog — finish-bar audit
Finish: 3/5   Market: PARITY (Radix; lags Vaul on mobile drawer)   Rebuild: polish

Dialog is a competent Radix-backed compound with no visual slop tells. It composes the
primitive directly, forwards refs, handles controlled+uncontrolled via `useControllableOpen`,
and exposes `DialogContentRaw` as an escape hatch. The gaps are finish-bar, not slop — and
notably, **all three P1s from the 2026-07-01 audit are still unfixed**: no reduced-motion guard,
a 24px close-button hit target, and a `React.FC` root. Plus unresolved doc z-token drift and no
long-content scroll strategy.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1 visual-integrity | ✓ | No accent rail / gradient / framework palette / emoji / glass. `bg-surface-overlay` (correct overlay surface), `shadow-overlay` with no border (no edge-soup), role radii `rounded-overlay-lg`/`rounded-control-inner`. Minor: `DialogHeader` defaults `text-center` on mobile (reflexive); `left-[50%]/top-[50%]` are canonical centering, not drift. |
| 2 a11y | gap | Radix focus trap/restore, `DialogTitle` required, `sr-only` close label + `title`, `focus-visible:ring-2 ring-accent-9`, axe-clean. BUT close-button hit box is `min-h/w-ds-xs` = **24px < 44px** (dialog.tsx:155; `--size-xs:24px`), worst on mobile full-screen where close + Esc are the only dismiss (no tappable backdrop). `touch-target` util exists (utilities.css:187) and is unused. |
| 3 api-composability | gap | Composes primitive, `asChild` on Trigger/Close, controlled+uncontrolled, `DialogContentRaw`, canonical Radix vocab — strong. BUT root is `React.FC<ComponentPropsWithoutRef<Root>>` (dialog.tsx:67): banned pattern, and `children` isn't in the declared contract (only flows via spread). `responsive` boolean is reasonable but undocumented. No size context on Title/Description (Card threads one). |
| 4 docs-dx | gap | Doc has Compound/Defaults/Example/Composability/Gotchas. BUT references `z-dialog` + `z-popover` (dialog.md:44) — neither token exists; source uses `z-modal`/`z-overlay` (source is truth). `responsive` prop absent from docs. No Props table. |
| 5 testing | gap | RTL + vitest-axe (open state) + trigger/closed/open/close/Escape. No `describeConformance`, no controlled-mode test, no `responsive={false}` coverage. Stories: Default/Confirmation/SimpleMessage/MobileFullScreen with 2 play tests. |
| 6 motion | ✗ | **No `useReducedMotion` guard** — animates scale+translate+opacity on every open with zero `prefers-reduced-motion` respect. Sibling `sheet.tsx:195` has it off the *same* primitive; `withReducedMotion()` helper (motion.ts:58) sits unused. Close-button `active:scale-90` is an un-eased instant snap (`transition-colors` only animates color). Spring itself (`springs.smooth`, ζ≈0.97 near-critical) is bounce-free ✓; transform+opacity only ✓. |
| 7 state-coverage | ✓ | Close button hover/active/focus-visible/disabled all designed. Open/closed via AnimatePresence with exit. Mobile full-screen vs desktop centered is deliberate. Loading/error/empty N/A (shell container). |
| 8 content-resilience | gap | **No `max-height` / `overflow-y-auto` on Content** — long forms overflow the viewport, close button can scroll off. Physical props (`right-ds-05`, `sm:space-x-ds-03`) not logical → imperfect RTL. Mobile full-screen handles small screens well. |
| 9 theming-resilience | ✓ | All semantic tokens (`bg-surface-overlay`, `ring-accent-9`, `bg-overlay`); survives accent-9 swap; role radii honor `[data-shape]`. Elevated (not recessed) so no dark-mode sunken-vanish risk. |
| 10 system-cohesion | gap | Shares springs/tweens/role-radii/focus-ring with siblings, BUT is the **outlier in its own overlay family**: Sheet has `useReducedMotion`, Dialog doesn't; siblings use `forwardRef`/typed-fn, Dialog root is `React.FC`. |
| 11 craft | gap | Nice: memoized context, `forceMount` for exit anim, `DialogContentRaw`, `sr-only`+`title` on close. Undercut by 24px hit target and the instant scale snap. |
| 12 perceived-perf | ✓ | Instant spring open, transform/opacity only (HW-accel, no CLS/jank), memoized context, AnimatePresence exit. |
| 13 market-benchmark | gap | PARITY with Radix (same primitive → a11y/focus parity); we add framer springs + mobile full-screen + `DialogContentRaw`. Lags Vaul (no drag-to-dismiss on mobile full-screen, though our own Sheet has it) and lags on the reduced-motion story we've committed to owning (JS-driven motion → the gap is ours, not the consumer's). |
| 14 cross-DS ideas | n/a | See below. |

## Top gaps (prioritized)
- [P1] motion — no `useReducedMotion` on scale/translate/opacity animation → mirror `sheet.tsx:195`: collapse to opacity-only fade (or `withReducedMotion(transition)`) when reduced. Headline gap; vestibular a11y.
- [P1] a11y — 24px close target < 44px → bump to `min-h/w-ds-xl` (44px) or wrap in a `touch-target` box with the glyph centered. Same defect exists on Sheet's close (systemic overlay issue).
- [P1] api — `React.FC` root drops `children` from the declared type → retype as a typed function with explicit `DialogProps` (Root already includes children); keep `displayName`.
- [P2] content-resilience — no scroll cap → add `max-h-[calc(100dvh-…)] overflow-y-auto` (or document that consumers must), so tall content scrolls inside the panel instead of the viewport.
- [P2] docs — `z-dialog`/`z-popover` don't exist → fix to `z-modal`/`z-overlay`; document the `responsive` prop + add a Props table.
- [P2] motion — close-button `active:scale-90` instant snap → `transition-[color,transform]` or a `whileTap` spring consistent with Button.
- [P3] cohesion/vocab — `space-y/x-*` in Header/Footer → gap model (`flex flex-col gap-ds-02b`) matching Card; consider `text-left` mobile default.

## What it does well
- No visual slop: one radius vocabulary, elevation-only (no border+shadow edge-soup), semantic tokens throughout, no framework-palette/gradient/emoji.
- Clean composition: wraps `@primitives/react-dialog` directly (no re-roll), `asChild` on Trigger/Close, controlled+uncontrolled via shared `useControllableOpen`, `DialogContentRaw` for full portal control.
- `forceMount` + AnimatePresence gives real exit animations; context value memoized.
- Near-critically-damped `springs.smooth` (bounce-free) + transform/opacity-only = HW-accelerated, no CLS.
- Mobile full-screen slide-up from `y:'100%'` is intentional drawer physics (checked against the slide-no-fade tell — NOT a violation; it enters fully offscreen, a fade would look wrong).

## Cross-DS adoption ideas
- **Vaul** — drag-to-dismiss on the mobile full-screen path (our own Sheet already has `drag='y'`; Dialog's mobile takeover should too, gated on `!isReduced`).
- **Base UI / Radix** — scroll-lock + a built-in scrollable body region so long content scrolls inside the panel; expose a `scrollable`/body-slot pattern instead of leaving `max-height` to the consumer.
- **React Aria (Adobe)** — automatic reduced-motion honoring baked into the overlay layer rather than per-component; we should centralize this in a shared overlay motion helper so no sibling can forget it again (Dialog just did).
- **Radix** — logical positioning (`inset-inline-end` vs `right-ds-05`) for correct RTL close-button placement.

## Rebuild note
**Polish, not rebuild.** Structure, composition, and primitive integration are sound — the same 3/5 the prior audit gave, and the same polish plan applies because none of it landed. Ordered: (1) add `useReducedMotion` → opacity-only fade, matching Sheet; (2) enlarge close target to 44px; (3) retype root off `React.FC`; (4) add content scroll cap; (5) fix `z-dialog`/`z-popover` docs + document `responsive`; (6) transform transition on close press; (7) gap model in Header/Footer. Consider centralizing overlay reduced-motion so Dialog can't drift from Sheet again.
