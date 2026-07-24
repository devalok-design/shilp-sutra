# ui/button — finish-bar audit
Finish: 4/5   Market: LEADS   Rebuild: polish

Benchmarked against shadcn/ui Button (+ Radix Themes Button, Apple HIG, React Aria `useButton`). Source-verified against `button.tsx`, `button-group.tsx`, `button-processing.tsx`, `lib/motion.ts`, stories, tests, and `docs/components/ui/button.md`. Prior 2026-07-01 baseline: 4/5, P0:0 P1:3 P2:5 — re-verified; the three P1s persist as polish-bar items (none fixed in 0.49/0.50/0.52).

This is a heavily-engineered, intentional component: two-axis variant×color taxonomy, five sizes + compact + icon families, `asChild`, `ButtonGroup` compound context, an `onClickAsync` state machine (idle→loading→success/error→idle), marching-ants processing overlay, grain extraction, and reduced-motion guards on the width FLIP and the ants. It leads shadcn on feature richness and craft. The gaps are all finish-polish, not structure.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Role radius tokens (`rounded-control`/`rounded-pill`), no edge-soup (solid=shadow, outline=border, never both), no gradient/glow/emoji, all semantic step tokens. BUT off-cadence arbitrary spacing `py-[3px]` (compact-xs) and `py-[5px]` (compact-sm) break the ds-03/05/07 cadence — magic-number tell. |
| accessibility | gap | Solid: focus-visible ring+offset, `aria-busy`, `aria-disabled` for processing, spinner `role=status`, keyboard-native. GAPS: icon-only sizes (`icon*`) do NOT enforce/require an accessible name (no `aria-label` requirement or dev warn); `disabled` is opacity+`saturate-[0.3]` only with NO `forced-colors:` fallback (affordance vanishes in HC mode); `ring-offset-2` has no bound offset color so the halo can detach on raised/tinted surfaces. |
| api-composability | ✓ | Canonical `variant` (solid/soft/outline/ghost/link), `color`, `size`, `shape`; `asChild` (Slot+Slottable), `forwardRef`+`displayName`, `IconInput` slots, `ButtonGroup` context inheritance + position-aware radius, `onClickAsync`/`processing` conveniences. `startIcon`/`endIcon` are bespoke corner props but that's the platform convention (MUI/Radix) and inset math needs L/R knowledge. |
| docs-dx | gap | Doc drift persists: `button.md:13-14` types `startIcon`/`endIcon` as `ReactElement (...) | null` — NARROWER than source `IconInput` (`ReactElement | ComponentType | null | undefined`); source is authoritative. `weight` axis appears only under Defaults, not in the Props type block. Stories are otherwise exhaustive. |
| testing | ✓ | `describeConformance` (axe) + 20+ unit tests: click, disabled, loading (all 3 positions), fullWidth, async success/error state machine, pill, compact, processing aria. Solid coverage. |
| motion | gap | `active:scale-[0.95] active:brightness-[0.92] active:saturate-[1.1]` press feedback + `hover:` transform easing (lines 491-493) are STATIC classes, never gated by `prefersReduced` — while the width FLIP (309) and ants (button-processing 141-145) ARE gated. Inconsistent reduced-motion respect. Also: deps-less `offsetWidth→style.width` effect animates a layout prop (`width`) on every render (M5) — gated, but layout-thrashy vs a transform FLIP. Uses DS `durations`, no bounce on functional feedback. |
| state-coverage | ✓ | default/hover/active/focus-visible/disabled/loading/async-success/async-error/processing all deliberately designed + tested + storied. No "empty" state applies. Only miss (forced-colors disabled) is counted under a11y. |
| content-resilience | gap | `whitespace-nowrap` with no truncation/max-width strategy — a long or i18n-expanded label overflows rather than truncating. No RTL directional-icon mirroring (`IconArrowRight` `endIcon` won't flip); no RTL story. Compact/icon families handle short content well. |
| theming-resilience | ✓ | Role radius tokens survive `[data-shape]` presets; accent-9 brand swap safe (all `accent-*`/semantic steps); light↔dark via semantic tokens; no sunken recess to invert (the segmented dark-track class of bug can't occur here). |
| system-cohesion | ✓ | Shares `durations`/`springs` from `lib/motion`, `rounded-control`, the DS focus-ring pattern, `-ds-*` spacing, and the `IconProvider` sizing contract with siblings. `ButtonGroup` is a clean compound. No bespoke drift. |
| craft | ✓ | Optical icon inset per size, `dimIcon` opacity on filled variants (Radix pattern), pill extra horizontal padding, grain child extraction with z-layering, spinner-size mapping, async `Icon animate="draw"` pen-stroke, marching-ants rounded-rect perimeter math with ResizeObserver re-glue. High craft. |
| perceived-performance | ✓ | Instant press feedback, optimistic async state machine, `role=status` spinner, smooth width transition. Layout effect is measured but reduced-motion-gated and rAF-batched. |
| market-benchmark | ✓ LEADS | vs shadcn Button (variant/size/asChild only): we add async state machine, processing overlay, loading positions, ButtonGroup, grain, weight — clearly ahead on features + craft. vs Radix Themes: parity on `loading`; we lead on async/processing. Where peers edge us: React Aria's press-event robustness (pointercancel on drag-off) and icon-only name enforcement. |
| cross-DS-adoption | ✓ | See ideas below — concrete borrows from React Aria + Radix Themes. |

## Top gaps (prioritized)
- [P1] motion — press `active:scale/brightness/saturate` + hover transform not gated by `prefersReduced` while the rest of the component is → wrap those classes in `!prefersReduced && ...` (or convert to a `whileTap` MotionConfig can neutralize); keep color/opacity feedback.
- [P1] accessibility — icon-only sizes carry no enforced accessible name → require/warn on `aria-label` when `size` is an `icon*` variant and children are non-text (dev-time invariant), and document it.
- [P1] docs-dx — `button.md` narrows `startIcon`/`endIcon` to `ReactElement | null` and omits `weight` from the Props type block → widen to `IconInput`, add the `weight` row. Source is authoritative.
- [P2] accessibility — `disabled` relies on opacity+saturate with no `forced-colors:` fallback → add a `forced-colors:disabled:text-[GrayText]` (or border) rule + a forced-colors story.
- [P2] content-resilience — `whitespace-nowrap` with no overflow strategy → document children-fallback + offer an opt-in truncation/max-width path; add an RTL story with a mirrored directional icon.
- [P2] motion — deps-less every-render `offsetWidth→style.width` effect animates a layout prop → prefer a `layout`-prop FLIP (transform) and scope deps to `[children, resolvedSize, loading]`.

## What it does well
- Correct edge discipline: solid uses `shadow-raised`, outline uses `border` — never stacked (no edge-soup), mirroring the Card rule.
- Full role-token radius (`rounded-control`/`rounded-pill`), zero `rounded-ds-*`/`rounded-full` — clears the release-only radius gate.
- Genuinely useful async ergonomics: `onClickAsync` auto-cycles loading→success/error with a drawn check/X and auto-activates the processing ants; `isMountedRef` guards set-state-after-unmount.
- Clean compound: `ButtonGroup` propagates variant/color/size/weight/shape/disabled and drives first/middle/last radius + dividers, with per-child position context separated from group settings.
- Exhaustive stories (variant×color grid, async all-variants, processing speeds/colors, grain real-world) + `describeConformance` axe coverage.

## Cross-DS adoption ideas
- **React Aria (`useButton`)** abstracts press with pointercancel/drag-off handling and enforces an accessible name for icon-only buttons — we could adopt the icon-only-name invariant and a more robust press model than raw `active:`/`onClick`.
- **Radix Themes Button** keeps the label width stable during `loading` by reserving space rather than measuring — a simpler alternative to our every-render `offsetWidth` FLIP for the loading case.
- **Apple HIG / Emil** bounce-free functional springs — already honored here; worth codifying as the button family default so SplitButton/IconButton can't drift.
- **Vercel/Geist** ships a documented `prefix`/`suffix` slot contract with an explicit "arbitrary content → children" escape — we should document the same escape hatch for our `startIcon`/`endIcon`.

## Rebuild note
Polish, not rebuild. The architecture (CVA two-axis + compound ButtonGroup + async/processing state machines) is sound and market-leading; nothing structural is wrong. The finish gaps are surgical: (1) gate the press/hover transforms behind reduced-motion, (2) enforce an accessible name for icon-only buttons, (3) add a forced-colors disabled fallback, (4) fix the `button.md` type drift, (5) replace the two `py-[Npx]` compact values with cadence tokens, and optionally (6) swap the manual width effect for a `layout` FLIP. All in-place edits; no API break required (the `startIcon`/`endIcon` widen is doc-only).
