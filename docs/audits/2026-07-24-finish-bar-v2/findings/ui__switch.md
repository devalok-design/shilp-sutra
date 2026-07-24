# ui/switch — finish-bar audit
Finish: 3/5   Market: PARITY (Radix / React Aria)   Rebuild: polish

Switch is a well-composed, primitive-backed toggle: it wraps vendored Radix
`@primitives/react-switch`, wires `useFormField` (state/describedby/required),
exposes a real `focus-visible` ring + offset, `touch-target`, a `thumbIcon`
slot, and size/color/state axes. a11y and testing are genuinely at bar. It drops
from a would-be 4 to a 3 because of one functional defect (RTL thumb travels the
wrong way) plus a cluster of unresolved structural gaps carried straight from
the 2026-07-01 baseline — the internal state fork, no in-component
reduced-motion guard, magic-px track widths, and a border+shadow double edge.
The `error`→`state` (FieldState) migration since baseline is the one real
improvement, and the per-component doc now exists (but its Gotchas are stale).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | `border-2 … shadow-raised` on the track = double edge (V2); thumb stacks `shadow-raised-hover` on top. `rounded-pill` is correct (no radius-ds). Magic-px widths `w-[38px]`/`w-[52px]`. No accent rail/gradient/emoji/glow. |
| accessibility | ✓ | `role="switch"` via Radix; `focus-visible:ring-2` + `ring-offset-2`; `touch-target`; `disabled:cursor-not-allowed`; `aria-invalid`/`aria-describedby`/`aria-required` wired from form ctx; icon-only covered by `aria-label` in tests; axe-clean via conformance. |
| api-composability | gap | `checked/defaultChecked/onCheckedChange` canonical for a toggle; `state` on FieldState (good). But internal `useState` mirror (L48-61) forks the primitive's state; `color` is a 3-value subset (accent/success/warning — no neutral/info) that overlaps with `state`'s track tint. `forwardRef`+`displayName`, typed, no `any`. |
| docs-dx | gap | Doc now exists w/ Props/Defaults/Example/Composability/Changes — but **Gotchas still reference the removed `error` boolean** ("Use error prop…", "when error is true"), contradicting the `state` API the Props table lists. Source props carry no JSDoc/@example. |
| testing | ✓ | unit + RTL + `describeConformance` (axe); covers controlled, uncontrolled, disabled-no-toggle, thumbIcon, `state="error"` precedence, md/accent defaults. Missing: RTL, reduced-motion, forced-colors render tests. |
| motion | gap | No in-component `useReducedMotion()` — relies on an ancestor `MotionConfig` consumers may not mount (Button guards in-component = the bar). `springs.snappy` damping ratio ≈0.95 → slight overshoot on a functional toggle (Emil: `bounce:0`). transform/opacity only (HW-accel); `whileTap` press feedback present. |
| state-coverage | ✓ | default/checked/disabled/disabled-checked/focus/track-hover/error/success/warning all deliberately designed. No loading (N/A). Checked-track has no distinct hover (minor). |
| content-resilience | ✗ | **RTL broken:** thumb animates hardcoded `x: +travel` (L87) with no `dir` awareness — in RTL it slides right when it must slide left. No text content to overflow, so this axis is the RTL defect. |
| theming-resilience | ✓ | accent-9 swap via token; bordered track won't vanish in dark like a sunken recess would; `rounded-pill` survives `[data-shape]`. Density N/A. |
| system-cohesion | ✓ | shares `springs.snappy`, `rounded-pill`, focus-ring, `touch-target`, `opacity-action-disabled` with siblings. Bespoke drift limited to the state mirror + `travel` constants. |
| craft | gap | Nice press-scale + centered thumbIcon + cursor affordances, but hand-tuned `travel` px must stay in sync with track/thumb widths (can silently desync), and the JS state mirror risks thumb↔`data-state` desync on external state change. |
| perceived-performance | ✓ | instant optimistic spring feedback; transform-based, no CLS; no jank. |
| market-benchmark | PARITY | vs Radix/React Aria — we add spring thumb, press-scale, `thumbIcon`, size/color/state over bare Radix, but lag React Aria on RTL correctness and in-component reduced-motion; state-fork is a correctness liability neither peer has. |
| cross-DS | — | see ideas below. |

## Top gaps (prioritized)
- [P1] content-resilience — RTL thumb travels wrong direction (hardcoded `+x`) → derive sign from `dir` (negate `travel` in RTL), or drive position from `data-state` via a logical-property CSS transform so direction is automatic.
- [P1] api/craft — internal `useState` mirror forks Radix's checked state to feed Framer; thumb can desync from `data-[state]` on native reset / external change → drop the mirror, drive the thumb from `data-[state=checked]:translate-x-*` + `transition-transform` (kills the mirror, the `travel` constants, the RTL bug, AND the reduced-motion gap in one move).
- [P1] motion — no in-component reduced-motion guard → add `useReducedMotion()` and collapse the spring/`whileTap` (or, via the CSS-transform refactor, inherit the base-layer `prefers-reduced-motion` for free).
- [P1] docs-dx — Gotchas reference the removed `error` boolean, contradicting `state` → rewrite Gotchas to the `state`/`color` model; add JSDoc + @example to `SwitchProps`.
- [P2] visual-integrity — track carries border-2 AND `shadow-raised` (double edge) → keep the border (it carries the unchecked affordance) and drop `shadow-raised`; reserve elevation for the thumb.
- [P2] visual-integrity — `w-[38px]`/`w-[52px]` magic-px + `travel` constants → express via spacing tokens and derive travel from track − thumb − borders.

## What it does well
- Real switch semantics + full form-context a11y wiring (invalid/describedby/required) — a genuine strength most DS switches skip.
- `thumbIcon` ReactNode slot + size/color/state axes give more expressive range than bare Radix.
- Clean motion primitives: transform/opacity only, shared `snappy` token, `whileTap` press feedback, no mount slide-in (no `initial` → no slide-no-fade tell).
- Correct radius role token (`rounded-pill`) — no release-gate radius violation.
- Solid, behavior-focused test suite incl. conformance/axe and `state` precedence.

## Cross-DS adoption ideas
- **React Aria (Adobe):** automatic RTL mirroring from layout direction — we hardcode `x`. Adopt logical-direction thumb travel.
- **Radix / Base UI:** drive the thumb purely from `data-state` (CSS transform), no JS state copy — the canonical pattern that removes our desync + reduced-motion + RTL issues at once.
- **Apple HIG / iOS:** thumb "stretch" (elongate) on press-drag and drag-to-toggle (not just click) — a tactile affordance neither Radix nor we offer.

## Rebuild note
**Polish, not rebuild.** No structural/API teardown needed — the Radix backbone,
a11y wiring, and axis vocabulary are sound. The highest-leverage single move is
replacing the JS `internalChecked` mirror + Framer `animate={{x}}` with a
pure-CSS `data-[state=checked]:translate-x-*` + `transition-transform` thumb:
that one refactor closes the RTL defect (logical properties), the state-fork
desync, the reduced-motion gap, and the `travel` magic-constants together. Then
resolve the double edge (drop track `shadow-raised`), tokenize the sm/lg widths,
and fix the stale doc Gotchas. Est. small, self-contained.
