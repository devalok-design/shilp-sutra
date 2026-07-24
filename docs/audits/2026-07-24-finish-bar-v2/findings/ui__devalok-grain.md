# ui/devalok-grain — finish-bar audit

Finish: 3/5   Market: PARITY (Vercel Geist / Linear texture)   Rebuild: polish

> **Context note (carried from the 2026-07-01 baseline, still valid).** This component *is* a
> brand texture — noise + directional gradient. Gradient / blur / sheen here are the **deliberate
> brand artifact**, not anti-slop tells: the gradient is gated behind an explicit `tint` prop, the
> noise is the documented "Devalok signature," and the whole thing is `aria-hidden` decoration a
> consumer opts into. So visual-integrity is judged on *token drift* and *system cohesion*, not on
> "it has a gradient." Where it falls short of the Card/StatCard bar is motion-system bypass, a
> closed prop surface, an `any` leak, and doc drift.

## Scores

| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No accent rails / emoji / framework palette; gradient+noise+sheen are the intended brand artifact. Drift only: `z-[1]` arbitrary z-index and off-scale `duration-300`. Uses `rounded-[inherit]` (correct — inherits parent, not a `rounded-ds-*` violation). Surface layering N/A (child overlay, not a surfaced container). |
| accessibility | ✓ | Correctly `aria-hidden="true"` + `pointer-events-none`; purely decorative, no interactive semantics to break. Axe test passes. Exactly right for a texture layer. |
| api-composability | gap | Closed surface: no `className` / `style` / `...rest` passthrough; not `forwardRef` (the only public `ui/*` export that doesn't forward a ref, while all siblings do). Feature growth is flag-per-feature (`sheen`/`animated`/`hoverIntensify`). `displayName` is set manually and is **load-bearing** — Button detects grain via `displayName === 'DevalokGrain'` (button.tsx). `data-grain` attr already exists and would be a more robust contract. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas and matches source. But the hero example (devalok-grain.md:38) uses `rounded-ds-lg` — models the exact class the component-radius role-token rule forbids. Should be `rounded-surface`. |
| testing | ✓ | 15-case test: `aria-hidden`, `pointer-events-none`, tinted vs neutral gradient, sheen present/absent, hover-opacity cap at 0.6, solid vs soft noise opacity, animated branch renders, displayName. `vitest-axe` included. (Both test + doc were ADDED since the baseline flagged their absence.) |
| motion | gap | Three drifts: (1) easing hardcoded as raw `[0.2, 0, 0.38, 0.9]` — byte-for-byte `--ease-productive-standard` — instead of a `lib/motion` preset; (2) two motion systems at mismatched tempos (framer entrance 600ms vs CSS `duration-300` hover/gradient crossfades, and 300ms is off the DS scale entirely — max util is `duration-moderate-02` 240ms); (3) reduced-motion guards only the framer entrance — the CSS hover/gradient transitions have no `motion-reduce:transition-none`. Entrance itself is a clean, bounce-free opacity fade (good restraint). |
| state-coverage | ✓ | Applicable states (intensity ×3, surface ×2, sheen, hover-intensify, animated) all deliberately designed. error/empty/loading N/A for a decorative layer. |
| content-resilience | ✓ | No text; fills `inset-0` and inherits parent radius, so it adapts to any parent size/shape. Minor: the 135deg gradient direction is fixed and does not mirror under RTL — cosmetic on a texture. |
| theming-resilience | ✓ | `tint` accepts any CSS color incl. `var(--color-accent-9)` → survives a brand accent swap. Light/dark handled via `dark:hidden`/`dark:block` gradient swap. `rounded-[inherit]` means it honors `[data-shape]` presets for free. |
| system-cohesion | gap | Bespoke drift from the family: re-rolls motion (raw easing + off-scale duration) instead of pulling `lib/motion`; `z-[1]` arbitrary vs the DS `@utility z-*` layers; not `forwardRef`; no `className` merge via `cn`. Reads as adjacent to the system, not fully in tune with it. |
| craft | ✓ | Real details: neutral gradient deliberately suppressed on light surfaces (avoids a dark smudge); hover noise capped at 0.6; `contrast(250%) brightness(105%)` filter for crisp grain; `isolate` stacking context; inline SVG data-URI (zero network). |
| perceived-performance | ✓ | Inline data-URI noise (no request), `pointer-events-none` (no hit-test cost), transform/opacity-only animation, no layout shift. Minor watch: `contrast(250%)` filter over a full-bleed noise layer can be paint-heavy on very large hero surfaces. |
| market-benchmark | PARITY | Few design systems ship a *composable, prop-driven* grain at all — Vercel/Geist bakes noise into backgrounds, Linear uses texture but not as a public component. Concept **leads**; execution **lags its own siblings** (Card/StatCard) on motion tokens + prop surface. Net: parity. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)

- **[P1] motion** — hardcoded easing `[0.2,0,0.38,0.9]` + off-scale `duration-300` + reduced-motion only half-covered → add a `textureReveal` preset in `lib/motion` bound to `--ease-productive-standard`; move hover/gradient crossfades onto a DS duration util (or into the framer path) and add `motion-reduce:transition-none`.
- **[P1] api-composability** — closed surface → accept `className` (merge via `cn`) + `...rest: HTMLAttributes<HTMLSpanElement>` spread onto the wrapper; wrap in `forwardRef<HTMLSpanElement>`. Keep `data-grain` + the manual `displayName` (Button depends on the latter).
- **[P1] types** — `{...(wrapperProps as any)}` (devalok-grain.tsx:136) is an `any` leak → type it as the framer `HTMLMotionProps<'span'>` subset it is, or branch the static/motion render paths so each is typed cleanly.
- **[P2] docs-dx** — doc example uses `rounded-ds-lg` (devalok-grain.md:38) → change to `rounded-surface` so the doc models the role-token rule instead of violating it.
- **[P2] visual-integrity / system-cohesion** — `z-[1]` arbitrary z-index → acceptable given the `isolate` context is local, but document it as intra-component and exempt, or use a named layer.

## What it does well

- Textbook decorative-layer a11y: `aria-hidden` + `pointer-events-none`, verified by tests.
- Gradient gated behind explicit `tint`, with the neutral gradient deliberately suppressed on light surfaces — a real craft judgment, not a default dump.
- Zero-network inline SVG noise; transform/opacity-only motion; no CLS.
- `rounded-[inherit]` + `tint` accepting `var(--color-*)` make it theme- and shape-resilient with no extra wiring.
- Comprehensive stories (10) + a 15-case test suite (both added since the baseline).

## Cross-DS adoption ideas

- **Vercel/Geist** bakes film-grain noise straight into background utilities — we could expose a `blend` prop (`mix-blend-overlay` / `soft-light`) so the grain interacts with the underlying fill instead of layering opaque noise on top; reads far more natural on mid-tone surfaces.
- **Linear-style animated grain** — an optional slow film-grain shift (translate the noise tile a few px on a long loop) for hero surfaces, reduced-motion-gated. Currently `animated` only fades in once.
- **React Aria / Radix passthrough convention** — every decorative primitive there still forwards `className` + ref; adopting that (see P1) closes the one composability gap that separates this from the rest of the DS.

## Rebuild note

**Polish, not rebuild.** The architecture is sound — a single `aria-hidden` overlay with gradient/noise/sheen layers, correct decorative semantics, theme-resilient tint, good perf. Every gap is an in-place fix: (1) route motion through `lib/motion` with DS durations + a full reduced-motion gate, (2) open the prop surface (`className`/`...rest`/`forwardRef`), (3) drop the `as any`, (4) fix the doc's `rounded-ds-lg` example. No structural change to the layering or the brand artifact itself. Estimated a single focused polish pass; the additions since 2026-07-01 (test + doc) already closed the baseline's biggest gaps, holding it at a solid 3/5.
