# ui/icon — finish-bar audit

Finish: 4/5   Market: LEADS (vs MUI SvgIcon / lucide-react / Chakra Icon)   Rebuild: polish

Icon is a leaf primitive: a context-aware wrapper around a Tabler (ForwardRef SVG) component that standardizes size tiers, per-size stroke weights, a11y, animation presets, and a loading→success/error state machine (delegating to `Spinner`). No surface of its own, so most visual/layout tells are N/A. It is genuinely well-built and ahead of typical icon wrappers. The remaining gaps are a real `forwardRef` contract dishonesty, motion presets that bypass the DS token scale, and a state-branch that drops the reduced-motion guard + the `label`.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Leaf primitive — no surface/border/shadow/gradient/emoji. Real Tabler set. No `rounded-ds-*`/`rounded-full`; `SIZE_PX` are numeric SVG dims (not arbitrary Tailwind), so no magic-number tell. Story-only vocab drift: `text-text-secondary`/`-tertiary` + raw `text-xs` (not `text-ds-xs`) — component source is clean. |
| accessibility | ✓ | Textbook icon a11y: `label`→`role="img"`+`aria-label`+`<title>`; decorative→`aria-hidden="true"`; axe-clean both ways (icon.test.tsx:164-174). 44px target correctly N/A (non-interactive; Button owns the target). `currentColor` = forced-colors safe. Gap: `state="loading"` branch silently drops `label` and sets no `aria-busy`. |
| api-composability | gap | Typed unions, no `any` in props, `forwardRef`+`displayName`, context-inheritance model, polymorphism via `icon` prop, controlled-motion object escape hatch, deprecation-free. BUT declared `forwardRef<SVGSVGElement>` while the animated branch forwards `ref` to a `motion.span` (icon.tsx:208) via `ref as any` (3 sites) — a consumer using `ref`+`animate` gets an `HTMLSpanElement`, not the `SVGSVGElement` the type promises. |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas/Changes and matches source (object-form + `draw` both documented). Minor: story `argTypes` omit `draw` and the `{rotate,scale}` object form. |
| testing | ✓ | `describeConformance` + size tiers, stroke weights, label/decorative, context inheritance + override, animation wrappers, state machine + priority, style forwarding, axe (labeled + decorative). Thorough. |
| motion | gap | `draw`/preset/object branches respect `useReducedMotion` and animate only transform/opacity/pathLength (HW-accel). BUT `ANIMATION_PRESETS` hardcodes `duration: 1/2/1.5` + string `'linear'`/`'easeInOut'` (icon.tsx:30-43) instead of `lib/motion.ts` `durations`/`tweens`/`springs`. State-branch entrance opacity tween (icon.tsx:108-119) runs *before* `prefersReduced` is consulted. (`spin`=linear is correct for continuous rotation; object-form correctly uses `springs.snappy`.) |
| state-coverage | ✓ | idle/loading/success/error state machine + spin/pulse/bounce/draw presets. hover/active/focus N/A (non-interactive leaf). Loading lacks `aria-busy` (see a11y). |
| content-resilience | ✓ | Fixed-geometry glyph — no text overflow/i18n-expansion surface. Directional-icon RTL mirroring not offered (no `flip` prop / logical handling) — a consumer concern, minor. |
| theming-resilience | ✓ | Pure `currentColor` inheritance; zero hardcoded colors in-component; survives accent-9 swap and light↔dark trivially. No radius/elevation surface to invert. |
| system-cohesion | gap | Shares the context model, `Spinner` delegation, and size→spinner-size mapping with siblings — but preset motion doesn't route through the shared `springs`/`tweens`/`durations` scale that Card/StatCard use. Bespoke timing drift. |
| craft | ✓ | Per-size stroke tiers (lighter strokes on smaller icons, STROKE_MAP) is a real optical-refinement most wrappers skip; size-tier→spinner-size mapping; `draw` pen-stroke for check/X with a shorter second X-stroke + delay. Above-bar. |
| perceived-perf | ✓ | transform/opacity/pathLength only → no CLS; instant. Minor: state="loading" doesn't expose Spinner's `delay` flicker-guard, so a fast async can flash a spinner. |
| market-benchmark | LEADS | No direct Radix/Base-UI peer (they ship raw). Vs MUI `SvgIcon` (fontSize tiers + `titleAccess`), Chakra `Icon` (`boxSize`), lucide-react (raw): ours adds IconProvider context inheritance, per-size optical stroke tiers, and a loading state machine none of them have. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] api-composability — `forwardRef<SVGSVGElement>` but the animated branch forwards `ref` to a `motion.span` (3× `ref as any`). → Forward the ref to the inner SVG in the animated branch too (keep the `SVGSVGElement` contract honest), or widen the declared ref type + document that animated icons expose the wrapper span. Type the Tabler ref as `React.Ref<SVGSVGElement>` — no cast needed.
- [P1] motion / system-cohesion — presets hardcode `1s/2s/1.5s` + string easings instead of `lib/motion.ts` tokens. → Derive durations from `durations` and easings from `tweens`/`springs`, or add named loop presets to `lib/motion.ts`. This is the single change separating it from "AI-default motion."
- [P2] motion / a11y — state-branch entrance tween runs unguarded by `prefersReduced`; `label` is dropped and no `aria-busy` set. → Route the state branch through `prefersReduced` (skip the wrapper opacity tween — Spinner already handles its own reduced-motion), pass `label` to Spinner as its accessible name, set `aria-busy`.
- [P2] docs-dx — story `argTypes` omit `draw` and the `{rotate,scale}` object form. → Add `draw` to the `animate` control options + one object-form story.
- [P2] perceived-perf — state="loading" can flash a spinner on fast async. → Optionally forward a `delay` through to `Spinner` (it already supports `delay` for flicker-avoidance).
- [P3] visual-integrity — story labels use undefined `text-text-secondary`/`-tertiary` + raw `text-xs`; MigrationGuide uses an uppercase+tracking eyebrow kicker. → Story-only; sweep to `text-surface-fg-muted`/`text-ds-xs` family-wide.

## What it does well
- Correct icon a11y contract in both directions (decorative `aria-hidden` vs labeled `role="img"`+`aria-label`+`<title>`), axe-verified.
- Per-size optical stroke tiers — a craft detail (lighter strokes at 14/16px) that raw icon libs and most wrappers don't do.
- IconProvider context inheritance with explicit-prop-override precedence — the right composition model for a leaf; Button/IconGroup/Input all feed it.
- Pure `currentColor` — theming/forced-colors resilience is free.
- `draw` pathLength animation and the state machine both respect reduced-motion in their branches; all motion is transform/opacity/pathLength (no layout props).
- Strong test + story coverage; conformance included; doc matches source.

## Cross-DS adoption ideas
- **MUI `SvgIcon` `titleAccess`** — we do the equivalent via `label`+`<title>`; MUI also exposes `inheritViewBox` for non-24px icons. Consider tolerating non-24px `viewBox` in the `draw` branch (currently hardcoded `0 0 24 24`).
- **Material's directional RTL auto-flip** — chevrons/arrows mirror under `dir="rtl"`. Add an opt-in `flipRtl?: boolean` (logical transform) so consumers don't hand-swap left/right glyphs.
- **lucide `absoluteStrokeWidth`** — keeps stroke visually constant regardless of size. Our STROKE_MAP deliberately does the opposite (optical tiering); worth documenting the choice, and possibly offering `stroke="absolute"` as an escape hatch.
- **Icon spritesheet / tree-shake note (Geist, Radix Icons)** — document that `icon={IconX}` keeps per-icon tree-shaking (vs a monolithic sprite), since consumers weigh bundle cost.

## Rebuild note
Polish, not rebuild — the structure (context wrapper + delegation to Spinner + branch-per-mode) is sound and market-leading for an icon primitive. Scope: (1) fix the `forwardRef` ref-target dishonesty so `ref`+`animate` returns the promised `SVGSVGElement`; (2) route the three loop presets through `lib/motion.ts` tokens; (3) guard the state branch with `prefersReduced` and pass `label`/`aria-busy`/`delay` into Spinner; (4) close story-control parity for `draw`/object-form. All in-place edits, no API break.
