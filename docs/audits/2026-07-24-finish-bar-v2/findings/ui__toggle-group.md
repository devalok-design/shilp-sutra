# ui/toggle-group — finish-bar audit
Finish: 3/5   Market: PARITY (shadcn/Radix ToggleGroup)   Rebuild: polish

ToggleGroup is a thin, clean compound wrapper over the vendored Radix Toggle Group
primitive, sharing the `toggleVariants` CVA with the base `Toggle` and propagating
`variant`/`size`/`color` to items via context. No slop tells, correct role-token radius,
semantic color tokens, real controlled+uncontrolled support. The score is held at 3 by one
below-bar axis — **motion** (CSS press scale with no reduced-motion guard, drifting from
`Toggle`'s framer spring) — plus a cluster of polish gaps (40px default touch target, doc
omits the `color` axis, thin stories, no `soft` variant, motion cohesion drift). All the
prior-audit findings from 2026-07-01 are still open; nothing was fixed in 0.49/0.50/0.52.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | `rounded-control` role token, `gap-ds-02`; default=bg-only, outline=border-only (no edge-soup); semantic accent/error/success/neutral tokens. Minor: outline `hover:border-surface-border-strong` == resting border (no-op). `active:scale-[0.95]` is an arbitrary scale (transform, not a spacing/sizing magic-number). |
| accessibility | gap | Radix `role=group` + toggle-buttons (aria-pressed) pattern — defensible for a formatting toolbar. focus-visible ring-2/accent-9/offset-2 + roving tabindex from Radix. BUT default `md`=`h-ds-md`=40px < 44px HIG target (still ≥24px WCAG 2.5.8 AA, so not a P0); no `touch-target` util; icon-only items require `aria-label` but nothing enforces/documents it; no `forced-colors` handling. |
| api-composability | gap | `value`/`defaultValue`/`onValueChange` + controlled/uncontrolled via Radix; forwardRef+displayName; typed; context propagation is the right pattern. Gaps: variant axis is `default\|outline` (no canonical `soft`/`ghost`); `asChild` available via Radix but undocumented; re-rolls press motion instead of composing `Toggle`. |
| docs-dx | gap | Doc omits the `color` axis entirely (CVA has `accent\|error\|success\|neutral`, default `accent`) and its Defaults block omits `color`. `asChild` + icon-label guidance absent. Source-vs-doc drift. |
| testing | gap | Strong interaction coverage (single, multiple, controlled, deselect, disabled, className, ref, vitest-axe). Missing: `describeConformance`, a `color`/`size` context-propagation assertion, keyboard arrow-nav test. |
| motion | ✗ | `active:scale-[0.95] transition-transform` — CSS press with **no `motion-reduce`/`useReducedMotion` guard** (reduced-motion users still get the scale), and it **drifts** from base `Toggle`'s `whileTap={{scale:0.95}} transition={springs.snappy}`. Two implementations of one press, two curves. Carried unfixed from prior audit. |
| state-coverage | ✓ | hover / active / focus-visible / disabled / selected (`data-state=on`) all deliberately styled via CVA. loading/empty N/A for a toggle set; `error` is a color variant, appropriate. |
| content-resilience | gap | RTL arrow direction handled by Radix; no truncation strategy for text labels (icon-first design), and many-items overflow is unhandled (`inline-flex`, no wrap/scroll). Fine for 2–5 items, degrades past that. |
| theming-resilience | ✓ | accent-2/9/11 semantic ramp survives a brand swap; `rounded-control` honors `[data-shape]`; on-state `bg-accent-2` tint stays visible in dark (no sunken-track inversion bug). |
| system-cohesion | gap | Shares `toggleVariants`, focus-ring, radius, spacing with `Toggle` (good), but the **press motion diverges** (CSS transition vs framer spring) — a `ToggleGroupItem` and a standalone `Toggle` side-by-side press differently. The exact cohesion tell the rubric names. |
| craft | gap | useMemo'd context, real press feedback. But redundant outline hover class and the CSS/spring split are unpolished edges; no optical corrections beyond the primitive. |
| perceived-performance | ✓ | `transition-colors duration-fast-01` instant feedback, immediate press response, no layout shift, memoized context. |
| market-benchmark | — | PARITY with shadcn/Radix ToggleGroup (near-identical Radix + shared toggle CVA + context propagation). We lead slightly on the `color` axis and the base-Toggle spring; we give it back on the group item's motion drift + reduced-motion miss. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P0] motion — CSS `active:scale-[0.95] transition-transform` ignores `prefers-reduced-motion` AND drifts from `Toggle`'s framer spring → wrap `ToggleGroupPrimitive.Item` in `motion.create` with `whileTap={{scale:0.95}} transition={springs.snappy}`, drop the CSS scale. Fixes motion + system-cohesion + the composability re-roll in one change.
- [P1] accessibility — default `md`=40px touch target; icon-only label not enforced/documented → apply `touch-target` util or bump min height; add a Gotcha requiring `aria-label` on icon-only items + a group label.
- [P1] docs-dx — doc omits the `color` axis and its `accent` default → add `color: "accent"|"error"|"success"|"neutral"` to both prop tables + Defaults; document `asChild` passthrough.
- [P2] api-composability — no `soft` variant (CLAUDE.md prefers soft for non-primary); on-state already uses a soft `*-2` tint so a `soft` resting variant is coherent → add to `toggleVariants`.
- [P2] testing — add `describeConformance`, a `color`/`size` context-propagation test, and a keyboard arrow-nav test.
- [P2] content-resilience — no overflow strategy for many items → document the intended cap or add wrap/scroll guidance.

## What it does well
- Correct compound pattern: children + context propagation for a variable-length set, not a bespoke `items={[]}` prop.
- Full controlled + uncontrolled via the Radix primitive; forwardRef + displayName + exported prop types on both parts.
- Clean visual layer: role-token radius, semantic color ramp, no edge-soup, no slop tells.
- Genuinely good test coverage for interactions (single/multiple/controlled/deselect/disabled) plus a vitest-axe pass.

## Cross-DS adoption ideas
- **Radix / Base UI** expose `orientation` (vertical toggle groups) and `loop`/`rovingFocus` controls — we bury them; surface `orientation` for vertical formatting rails.
- **React Aria (Adobe) ToggleButtonGroup** announces selection changes and enforces min touch targets by default — adopt the touch-target floor and consider a live-region note for single-select changes.
- **shadcn** ships a documented `variant`/`size` context table and a `soft`-style resting look in newer kits — mirror with our `soft` variant + a doc matrix.

## Rebuild note
Polish, not rebuild — the structure (Radix primitive + shared `toggleVariants` + context propagation) is correct and idiomatic. One high-value change dominates: lift the press feedback into framer-motion (`motion.create` + `whileTap` + `springs.snappy`), which simultaneously kills the reduced-motion miss (P0 motion), the system-cohesion drift, and the composability re-roll. Then bump the default touch target, correct the doc's `color` axis, expand stories (sizes/colors/disabled/selected), and optionally add a `soft` variant. No API break required — all additive or internal.
