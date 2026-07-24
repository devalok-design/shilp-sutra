# ui/alert-dialog — finish-bar audit

Finish: 3/5   Market: LAGS(shadcn/Radix AlertDialog)   Rebuild: polish

Competent Radix `alertdialog` wrapper: correct overlay surface tokens, role-based radius, single-edge shadow, real focus management (initial focus on Cancel), AnimatePresence enter/exit with a bounce-free spring, a controlled+uncontrolled root, and a genuinely nice `responsive` mobile-sheet mode. No visual slop tells. Its ceiling is set by one structural fault carried unchanged from the 2026-07-01 baseline: `AlertDialogAction`/`AlertDialogCancel` **re-roll the Button CVA by hand** instead of composing `<Button>`, so the single most common use — a destructive confirm — has no `color` axis and forces consumers to paste raw `bg-error-9` strings. None of the prior polish plan has landed.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Correct `bg-surface-overlay`/`bg-overlay`, `rounded-overlay-lg`/`rounded-control` role tokens, `shadow-overlay` with no border (no edge-soup), semantic type composites. Uses the legit `border-surface-border-strong` (NOT the dead `border-card-strong`). Only nit: `left-[50%] top-[50%]` arbitrary values where `left-1/2` exists. |
| accessibility | gap | Radix delivers `role="alertdialog"`, focus trap, Esc, focus-on-Cancel; both buttons have `focus-visible:ring-2` + offset and `disabled` handling; axe-clean test. Gap: footer buttons are `h-ds-md` = **40px**, below the 44px touch-target bar, no `touch-target` util. No explicit `forced-colors` handling (relies on semantic tokens). |
| api-composability | ✗ | Action/Cancel hand-roll Button styling instead of composing `<Button>` — a parallel, already-drifted copy (missing `hover:shadow-brand`, extra `active:bg-accent-10`). No `color` axis → destructive confirm (the #1 use) needs raw `className`. No `size` axis. Cancel defaults to `outline`, against the house soft-over-outline pref. Root typed `React.FC`. Controlled/uncontrolled, forwardRef, exported types, `responsive` prop are all clean. |
| docs-dx | gap | Doc page exists with full section coverage, but Props section **omits the `responsive` prop** that source ships. Composability claim "non-dismissible by clicking outside **or pressing Escape**" is inaccurate — Radix AlertDialog closes on Escape by default unless `onEscapeKeyDown` is prevented. |
| testing | ✓ | RTL + vitest-axe, controlled state, className merge, action/cancel handlers, open/close. No `describeConformance`, no reduced-motion or mobile/responsive assertion (mobile only in a story). |
| motion | gap | `springs.smooth` is near-critically damped (ζ≈0.97, bounce-free — correct for a confirm surface); overlay `tweens.fade` easeOut; differentiated enter/exit; transform+opacity only. Gap: **no local `useReducedMotion()` guard** — correct behavior depends on an ambient `MotionConfig`; standalone it animates regardless of OS preference (Button guards itself). Mobile slide is `y:'100%'` with no fade (see systemic flag). |
| state-coverage | gap | hover/active/focus-visible/disabled deliberately styled. Missing a **loading/pending** state on Action — async confirm is the canonical use; ConfirmDialog adds it on top, but AlertDialog itself has none. No long-content story. |
| content-resilience | gap | `responsive` handles mobile (full-screen sheet). But content is a `grid` with **no `max-height`/`overflow-y`** — long body text overflows the viewport on desktop (`max-w-lg`, no `max-h`). Footer uses physical `sm:space-x-ds-03` rather than logical `gap` (not RTL-mirrored). |
| theming-resilience | ✓ | Semantic tokens throughout (`accent-9/10`, `surface-overlay`, `surface-border-strong`); role radius honors `[data-shape]`; survives an accent-9 swap; overlay is a legit surface so no dark-mode elevation-inversion risk. |
| system-cohesion | gap | Shares springs, role radius, focus-ring, spacing tiers with siblings — but the hand-rolled Action/Cancel are a second copy of Button that has already drifted from it, breaking the "thousand voices in tune" test. (`React.FC` matches the Dialog family — a family-wide tell, not unique.) |
| craft | ✓ | Initial focus on Cancel (safe default, thoughtful), `transform: none` centering fix, responsive mobile sheet, no layout shift. |
| perceived-performance | ✓ | Instant open via `forceMount` + AnimatePresence, transform-based centering (no CLS), fast fade. No skeleton needed. |
| market-benchmark | gap | vs shadcn/Radix: shadcn composes `buttonVariants()` (single source of truth) — we hand-roll and lack a destructive `color` slot, so we LAG on the core API path. We LEAD on the `responsive` mobile-sheet + framer physics + focus-on-Cancel, which shadcn/Radix don't ship. |
| cross-ds-adoption | ✓ | Ideas captured below. |

## Top gaps (prioritized)
- [P0] api-composability — Action/Cancel re-roll Button; no `color` axis for the destructive confirm (raw `bg-error-9` className in the story) → make them thin `<Button>`-composing wrappers (Action `variant="solid"`, Cancel `variant="soft" color="neutral"`); `color`/`size` come free. Kills the drift, the outline default, and the destructive-path hack in one move.
- [P1] motion — no local reduced-motion guard → read `useReducedMotion()` and collapse the panel to the opacity-only `tweens.fade` when reduced; don't depend on an ambient provider.
- [P1] state-coverage — no loading/pending Action → expose a `loading` (or lean on composed Button's) and demonstrate the async-confirm + `aria-busy` path in a story.
- [P1] docs-dx — doc omits `responsive` and mis-states Escape as non-dismissible → add `responsive` to Props, correct the Escape claim.
- [P2] content-resilience — content has no `max-h`/`overflow-y` for long bodies; footer `space-x` is physical, not logical → add scroll containment and switch to `gap` for RTL.
- [P2] accessibility — 40px footer buttons < 44px → apply `touch-target` (folds into the compose-Button fix if Button carries it).
- [P2] api — root is `React.FC` → plain typed function with explicit `children`.

## What it does well
- Clean overlay visuals: correct surface + role-radius + single-edge shadow, zero slop tells, no dead `border-card-strong`.
- Real a11y core from Radix: `alertdialog` role, focus trap, and a deliberate initial-focus-on-Cancel safety default.
- `responsive` mobile-sheet mode (full-screen slide-up) is a genuine lead over shadcn/Radix.
- Restrained, bounce-free spring on a confirmation surface — the right motion judgment; differentiated overlay-fade vs panel-spring.
- Correct dual-mode controlled/uncontrolled root, forwardRef throughout, exported prop types.

## Cross-DS adoption ideas
- **shadcn** composes `buttonVariants()` in Action/Cancel — adopt the compose-`<Button>` pattern so both buttons inherit variant/color/size/focus/hover-shadow from a single source.
- **Radix** exposes `onEscapeKeyDown`/`onPointerDownOutside` for controlled dismissal semantics — worth surfacing (and documenting accurately) rather than the current blanket "non-dismissible" doc claim.
- **assistant-ui / common confirm dialogs** bake an async `pending` state into the primary action (spinner + disabled + `aria-busy`) — the destructive-confirm use case needs this natively.
- **Vaul** bottom-sheet does drag-to-dismiss on mobile — intentionally NOT applicable here (AlertDialog must be choice-gated), but the sheet spring/inset language is worth keeping aligned with our own Sheet.

## Rebuild note
Polish, not rebuild. The Radix wiring, surfaces, a11y core, and motion physics are sound — the fix is the unchanged 2026-07-01 plan: rewrite Action/Cancel to compose `<Button>` (kills the drift, the outline default, the missing `color`/`size` axes, and the destructive-className hack), add a local `useReducedMotion()` guard, expose a loading Action, add content overflow containment, correct the doc (`responsive` prop + Escape claim), and de-`React.FC` the root. All in-place; no structural teardown.
