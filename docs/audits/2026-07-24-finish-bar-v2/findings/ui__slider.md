# ui/slider — finish-bar audit
Finish: 4/5   Market: PARITY (Radix; LAGS React Aria on thumb labels + marks/output)   Rebuild: polish

Slider is a thin, disciplined wrapper over the vendored Radix Slider primitive. It composes the base cleanly, forwards controlled (`value`) + uncontrolled (`defaultValue`) with `onValueChange` straight through, derives thumb count from the value array, wires real a11y from FormField (`aria-invalid`/`aria-describedby`/`aria-required`), uses semantic tokens throughout, and has zero visual slop tells — `rounded-pill` is the correct radius role token, no accent rail, no gradient, no glow. Since the 2026-07-01 audit the `sm` track height was tokenized (`h-[4px]` → `h-ds-02`), but the rest of that audit's P1/P2 findings persist: a stale docs lie, two magic-number values, a drifting color axis, and no reduced-motion guard. All gaps are polish-level; none are P0.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | `rounded-pill` role token correct, semantic tokens throughout, no slop tells. But `lg: h-[10px]` (no 10px token) and thumb `border-[3px]` + `active:scale-[1.15]` are magic numbers. Thumb border+shadow is a deliberate knob exception (colored ring = state affordance, shadow = lift). |
| accessibility | gap | Single-thumb fully wired: `touch-target` 44px hit area on sub-44px thumb, `focus-visible:ring-2 ring-offset-2` per-color, `aria-invalid/describedby/required` from FormField, keyboard from Radix, disabled. Gap: range/multi-thumb thumbs get NO `aria-label` (only `thumbCount === 1`, slider.tsx:109) — range sliders are unlabelled by default. No explicit `forced-colors` handling. |
| api-composability | gap | Canonical `value`/`defaultValue`/`onValueChange`, controlled+uncontrolled, `forwardRef`+`displayName`, typed `SliderSize`/`SliderColor` from CVA. Gaps: `color` axis is `accent/success/warning/error` — drifts from family taxonomy (Card/Badge add `neutral`/`info`); no per-thumb `labels?: string[]`/`thumbProps` escape hatch for range. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas, but line 25 + 32 FALSELY claim "Slider does NOT auto-consume FormField state" — source (slider.tsx:81-84) calls `useFormField()` and wires aria-invalid/describedby/required. Source wins; the doc misinforms AI agents into hand-wiring what's already done. Same lie the 2026-07-01 audit flagged P1 — unfixed. |
| testing | gap | `describeConformance` + RTL render/value/min-max/disabled/step; story `play` asserts visible + `aria-valuenow`. Missing: `onValueChange` firing, two-thumb render assertion, explicit axe play test in the test file. |
| motion | gap | CSS transition on transform/box-shadow, `duration-fast-02` (<300ms), `ease-productive-standard` (strong curve, not ease-in) — good. But NO reduced-motion guard (no `motion-reduce:` variant, not routed through MotionConfig) on `active:scale-[1.15]`; scale of 1.15 is a touch large. Range fill has no width transition on value change. |
| state-coverage | ✓ | hover (shadow-raised-hover), active (scale + shadow), focus-visible (ring), disabled (opacity-action-disabled + pointer-events-none) all deliberately designed. Error color path exists. Empty/loading/selected are n/a for a slider. |
| content-resilience | ✓ | Radix handles dir/RTL and thumb positioning; range fill `absolute h-full` mirrors under Radix dir. thumbCount derived from array handles 1, 2, and 3+ thumbs. No text content to overflow. |
| theming-resilience | ✓ | All semantic tokens — survives accent-9 swap; `rounded-pill` honors `[data-shape]`. Range fill (accent-9) stays visible in dark; thumb is `surface-overlay` (elevated) so it doesn't vanish like the segmented dark-track bug. Track recess (`surface-raised-hover`) is subtle in dark — minor, not a vanish. |
| system-cohesion | gap | Shares radius role token, focus-ring, duration names, semantic tokens with siblings. Drift: motion is raw CSS while the family routes feedback through framer-motion + MotionConfig (so global reduced-motion can't damp the thumb scale); `color` axis membership differs from Card/Badge. |
| craft | ✓ | `touch-target` giving a 16px thumb a 44px hit area is a real unseen detail; per-size border widths scale the ring; press-scale + shadow lift read as a physical knob. |
| perceived-performance | ✓ | Radix drag feedback is instant; transform/opacity animations are HW-accelerated; no layout shift. |
| market-benchmark | gap | PARITY with Radix (we wrap it — keyboard/drag/dir inherited). LAGS React Aria (Adobe): no per-thumb labels, no value output/tooltip, no marks/ticks, no `Intl` number formatting, no reduced-motion guard. |
| cross-ds-adoption | gap | See ideas below — thumb labels, marks/ticks, value output are the concrete imports. |

## Top gaps (prioritized)
- [P1] docs-dx — Doc (slider.md:25,32) falsely states "Slider does NOT auto-consume FormField state" while source does → reword to "consumes FormField for a11y wiring (aria-invalid/describedby/required) but renders no visual validation treatment." Persisted unfixed from the 2026-07-01 audit.
- [P1] motion — No reduced-motion guard on `active:scale-[1.15]` → add `motion-reduce:transition-none motion-reduce:active:scale-100`, or route the press feedback through the motion system so MotionConfig can damp it.
- [P1] accessibility — Range/multi-thumb thumbs are unlabelled (aria-label only when thumbCount===1) → add `labels?: string[]` / `thumbProps` and apply per-thumb.
- [P2] api-composability — `color` axis missing `neutral`/`info` vs family taxonomy → add them, or document the deliberate 4-tone restriction.
- [P2] visual-integrity — `lg: h-[10px]` (no token; ds-02b=6px is the top step) and `border-[3px]` are magic numbers → add a 10px spacing token or snap to scale; use `border-4` if it reads.
- [P2] testing — No `onValueChange` test and no two-thumb render assertion; stories omit focus/error/RTL/forced-colors → add them.

## What it does well
- Clean composition of the vendored Radix primitive — no re-rolled drag/keyboard logic; keyboard nav (arrows/Home/End/PageUp/Down) and RTL come for free.
- Genuine a11y wiring from FormField (aria-invalid/describedby/required) plus `touch-target` giving the small thumb a compliant 44px hit area — a detail most DS sliders miss.
- Correct radius vocabulary (`rounded-pill`), all semantic tokens, zero visual slop tells, controlled + uncontrolled with proper `onValueChange` semantics.
- Thumb reads as a physical knob (colored state ring over an elevation shadow) — an intentional, well-judged exception to the no-border+shadow rule.

## Cross-DS adoption ideas
- React Aria (Adobe) Slider exposes per-thumb `aria-label`/`aria-labelledby` and a `<SliderOutput>` value readout — we could add `labels?: string[]` and an optional value bubble/tooltip on drag.
- React Aria / Base UI support marks/ticks with labels along the track — we have none; a `marks` prop (positions + optional labels) would close a common product need (e.g. quality presets).
- React Aria formats the displayed value via `Intl.NumberFormat` (currency/percent/unit) — a `formatOptions` passthrough would make our slider presentation-complete.
- Base UI / Radix range sliders honor `minStepsBetweenThumbs` (we document it but don't surface it as a first-class prop) — could be promoted to the typed surface.

## Rebuild note
Polish, not rebuild. The structure is right: a thin Radix wrapper composing the base primitive with a small, sensible prop surface. The work is a set of in-place fixes — correct the stale FormField docs claim (P1), add the reduced-motion guard on the press scale (P1), label range thumbs (P1), tokenize `h-[10px]`/`border-[3px]` (P2), and align the `color` axis with the family taxonomy (P2). No structural reason to rebuild; everything is a targeted edit within the existing CVA + wrapper.
