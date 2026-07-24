# ui/color-input — finish-bar audit

Finish: 3/5   Market: LAGS(React Aria ColorPicker)   Rebuild: polish

Feature-rich, genuinely thoughtful color picker (undo/reset history, per-instance
layoutId sliding pill, in-flight hex-draft protection, drag-aware undo dedup,
contrast-aware inline text). Since the 2026-07-01 baseline (2/5) the P0 AI-palette
tell is **resolved** — defaults now lead with brand-OKLCH Red `#C53637` (not
indigo `#6366F1`/violet), and every story `value` moved off `#6366F1`. A per-
component doc now exists (baseline J). But almost every P1 the baseline flagged is
still open: non-canonical controlled-only API, re-rolled `<input>`, all-caps micro-
labels, bounce-by-default swatch grid, no reduced-motion guard, `focus:` (not
`focus-visible:`), sub-44px touch targets, and a cluster of magic numbers. Shippable
with real gaps — not at the Card bar.

## Scores

| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Radius role tokens throughout (`rounded-control`/`-inner`/`-overlay-lg`/`-pill`) — no `rounded-ds-*`/`rounded-full`. Overlay correctly `bg-surface-overlay`. BUT magic numbers (`w-[272px]`, `style={{height:160}}`, `pl-6`, `h-6 w-6`/`h-4 w-4`, raw `boxShadow` rgba), all-caps `uppercase tracking-wider` labels (type-ramp tell), and default-trigger edge stack (`border-surface-border-strong` + gradient fill + masked `bg-surface-overlay/60` = 3 layers). Default-trigger gradient itself is legit (renders the color). |
| accessibility | gap | Strong basics: real `<button>` triggers, `aria-label`, `role="dialog"`+label on popover, `htmlFor`/`id` field wiring, `aria-invalid` from FormField ctx, axe passes. Gaps: sub-44px targets everywhere (`min-h-6`=24px switcher/undo/reset, `h-6 w-6`=24px swatches, triggers only `py-ds-02`); `focus:` not `focus-visible:` (rings fire on mouse); default trigger `ring-1` no offset vs inline `ring-2 ring-offset-2` (inconsistent); react-colorful picker is pointer-only — mitigated by format fields (documented), still no keyboard 2D nav. No `forced-colors` handling. |
| api-composability | ✗ | Non-canonical: `onChange(string)` not `onValueChange`; no `defaultValue`; `value`→`useState`+`useEffect` mirror (classic clobber-local-edits anti-pattern, `value` defaults `#000000` so never truly uncontrolled). Re-rolls a raw `<input>` (FormatInput) instead of composing DS `Input`; Undo/Reset/format pills are raw `<button>`s not DS `Button`/`ToggleGroup`; no `asChild` on trigger (two looks baked as `variant` enum). Good: `forwardRef`+`displayName`, typed, presets keep `string[]` back-compat. |
| docs-dx | gap | Doc exists and is mostly accurate (props, variants, composability, gotchas, changelog). Does not flag the `onChange`-string / controlled-mirror caveat. Stories cover all variants + formats + disabled + controlled, but no error/RTL/forced-colors/focus-visible story and no axe **play** test in the story. |
| testing | gap | `describeConformance` + `vitest-axe` + format switching + preset-click `onChange` + disabled + inline + the two #142 hex-draft regression tests. Missing: undo/reset, reset-footer appearance, picker-drag, keyboard nav. |
| motion | ✗ | `springs.bouncy` (damping 15, overshoot) + `delay:i*0.02` stagger as the **entrance for a static 10-swatch grid** — decorative overshoot where none is earned (Emil). No `useReducedMotion`/`useMotion` guard: the animated `backgroundColor`/`background`/`boxShadow` on triggers are NOT transform/opacity, so global `MotionConfig reducedMotion="user"` won't quiet them. Raw `boxShadow` hover lift instead of an elevation token. Format-swap fade+`y` and footer height are fine (all have `opacity:0`, no slide-no-fade). |
| state-coverage | gap | hover/active(`whileTap`)/disabled/selected(ring+scale)/undo/reset all deliberately designed. Missing: visual error/invalid surface (unparseable hex silently reverts on blur, no user-visible aria-invalid affordance beyond FormField), read-only, and `focus-visible` parity (inline hover-lift has no keyboard equivalent). |
| content-resilience | gap | Presets `flex-wrap`; hex fixed 6-char; many presets wrap fine. RTL weak: default-trigger gradient is physical `linear-gradient(to right,…)` + `to right` mask + `pl-6` — won't mirror; swatch bleeds physical-left. Popover align delegated to Radix. |
| theming-resilience | ✓ | Chrome uses accent-3/7/9/11 + surface tokens (survives accent-9 swap) and radius **role** tokens (honors `[data-shape]`). Popover `surface-overlay` reads in both themes. Literal preset hexes and inline `rgba` text are the payload / contrast-driven — legitimately exempt. |
| system-cohesion | gap | Uses DS springs, role radius, surface + accent tokens — mostly in tune. Drift: re-rolled input, raw `boxShadow`, inconsistent focus ring between variants, bespoke all-caps micro-label treatment. |
| craft | ✓ | Above bar: `hexDraft` guards in-flight typing (#142), `isDragging` ref dedups undo during drag, contrast-aware inline text (sRGB luminance), original-color preview + hex readout, per-instance `layoutId` avoids cross-instance pill jumps. |
| perceived-performance | ✓ | Live optimistic feedback on picker drag; internal state updates instantly; no layout thrash. Footer reveals via height animate (appear only). |
| market-benchmark | ✗/LAGS | vs React Aria ColorPicker suite (ColorArea/ColorSlider/ColorField/ColorSwatch/ColorWheel) which is fully keyboard-accessible (arrow-key 2D area + sliders, ARIA color semantics). Our 2D picker is pointer-only. We lead RA on built-in undo/reset history + the contrast-aware inline variant. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)

- [P1] api-composability — non-canonical controlled-only API: `onChange(string)` not `onValueChange`, no `defaultValue`, `value` mirrored via `useEffect` (clobbers in-flight edits), and hex/RGB/HSL fields re-roll a raw `<input>` → adopt `useControllableState`, add `defaultValue`, rename `onChange`→`onValueChange` (keep deprecated alias one minor), render fields through DS `Input`.
- [P1] accessibility — sub-44px touch targets throughout (24px switcher/undo/reset/swatches) + `focus:` instead of `focus-visible:` + inconsistent focus ring (default `ring-1` no offset vs inline `ring-2 offset-2`) → apply `touch-target`/min-h-11, switch to `focus-visible:`, unify ring.
- [P1] motion — bounce-by-default swatch entrance + no reduced-motion guard for animated `backgroundColor`/`background`/`boxShadow` → swap swatch entrance to `springs.snappy`, read `useReducedMotion` and snap color/shadow animations to instant when reduced.
- [P2] visual-integrity — magic numbers (`w-[272px]`, `height:160`, `pl-6`, `h-6 w-6`, raw `boxShadow` rgba) + all-caps micro-labels → tokenize or comment the fixed picker dims, `pl-6`→`pl-ds-*`, raw shadow→`shadow-raised-hover`, drop `uppercase tracking-wider`.
- [P2] state-coverage — no visible error/invalid state on unparseable hex; inline hover-lift has no focus-visible equivalent → add an invalid affordance + mirror the lift on focus-visible.
- [P2] content-resilience — physical `to right` gradient/mask + `pl-6` don't mirror in RTL → logical properties + `to inline-end`.

## What it does well

- In-flight hex-draft protection (`hexDraft`) so partial typing isn't clobbered by re-renders (#142) — a subtle, correct detail.
- Drag-aware undo: `isDragging` ref pushes a single undo entry per drag sequence instead of spamming history.
- Contrast-aware inline-variant text via real sRGB relative-luminance math.
- Per-instance `layoutId` (`instanceId`) so multiple pickers on one page don't share/jump the sliding format pill.
- P0 AI-palette tell fully resolved: brand-OKLCH spectrum led by Red, all story values off `#6366F1`.
- Correct overlay surface + radius role tokens; no `rounded-ds-*`/`rounded-full`, no accent rails, no emoji, no slide-no-fade.

## Cross-DS adoption ideas

- **React Aria ColorArea/ColorSlider** — keyboard-accessible 2D saturation/brightness area + hue slider with arrow-key nav and ARIA color roles. Adopting (or wrapping the field-editing behind an accessible area) closes our single biggest lag vs RA.
- **EyeDropper API** — modern pickers (and RA examples) expose a screen eyedropper where `window.EyeDropper` exists; a small opt-in button would be high-value, low-cost.
- **Alpha channel** — RA ColorField/ColorSlider support alpha; we're RGB/HSL hex-only. Consider an optional `format`/`alpha` extension.
- **Recent-colors memory** — a short MRU strip above presets (common in design tools) complements the existing undo/reset history.

## Rebuild note

**polish**, not rebuild. The architecture is sound (Popover-hosted, role tokens, correct surface, real craft). Every open gap is in-place fixable: adopt `useControllableState` + `defaultValue` + `onValueChange` alias and drop the `useEffect` mirror; compose DS `Input` for the fields (and DS `Button`/`ToggleGroup` for footer/switcher); add a `useReducedMotion` guard and de-bounce the swatch entrance; `focus:`→`focus-visible:` and raise targets to 44px; tokenize the handful of magic numbers and drop the all-caps labels. No structural teardown required. The one thing polish can't fully solve — keyboard access to the 2D picker area — needs a react-colorful replacement or an accessible ColorArea wrapper, which is the only candidate for a scoped structural change.
