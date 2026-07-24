# ui/collapsible — finish-bar audit
Finish: 4/5   Market: PARITY (Radix Collapsible)   Rebuild: polish

Thin, honest wrapper over the vendored Radix Collapsible primitive (`Root`/`Trigger` re-exported as-is; `Content` wrapped for a className + a Framer wrapper). Inherits Radix's correct a11y and controlled/uncontrolled API for free, uses DS motion tokens (`animate-collapsible-*`, `tweens.fade`), and renders no surface of its own. It is source-unchanged since the 2026-07-01 baseline (still 4/5). The gaps are all in the motion layer and in coverage — none are user-visible-broken, none are ship-blockers.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Renders no surface — structural only. No edge-soup, no accent rail, no gradient/glow/pill tells. Stories use role tokens (`rounded-control`, `border-surface-border-strong`) correctly. |
| accessibility | ✓ | Radix gives a real `<button>` trigger, `aria-expanded`, Enter/Space activation, focus-visible. Test asserts all + axe-clean when expanded. Touch target inherited from consumer's trigger element. |
| api-composability | gap | Composes Radix (no re-roll), controlled (`open`) + uncontrolled (`defaultOpen`) + `onOpenChange`, `asChild` on trigger, `forwardRef`+`displayName`, `CollapsibleProps` exported. BUT the inert `motion.div` inserts a `<div>` between `Content` and `children`, breaking the direct-child contract (consumer `space-y-*`, `:first/last-child` land on the wrapper). No disclosure/chevron helper. |
| docs-dx | gap | Doc has Props/Compound/Example/Composability/Gotchas and matches source, but says "Defaults: none", omits the exported `CollapsibleProps` type, and ships no WithChevron example (the doc tells consumers to hand-roll the rotate from `data-state`). |
| testing | ✓ | Strong: renders, hidden-by-default, defaultOpen, click toggle, second-click collapse, controlled, `onOpenChange`, className merge, axe, Enter/Space, aria-expanded transitions. Only gap: no `disabled` test. |
| motion | gap | The actual disclosure motion (CSS `animate-collapsible-down/up`, 200ms ease-out, bounce-free) is correct and calm. But the Framer `motion.div` animates `opacity: 1 → 1` (`initial={false}`) — a guaranteed **no-op** that pulls the `framer-motion` runtime + a `'use client'` boundary + a DOM node into every consumer for zero payoff. No `useReducedMotion` guard on the JS tween (latent, not covered by the global CSS reset). |
| state-coverage | gap | Hover/active/focus-visible inherited from Radix trigger; `disabled` is supported by Radix but never shown in a story or asserted in a test. No loading/empty/error — correctly n/a for a disclosure. |
| content-resilience | ✓ | Inline expand pushes siblings; Radix measures `--radix-collapsible-content-height` so any content height works; respects parent `overflow`. No directional styles to break RTL. |
| theming-resilience | ✓ | Renders no color/surface of its own — survives brand accent-9 swap and `[data-shape]` presets trivially. No hardcoded radius/shape. Dark-mode elevation inversion n/a (no recess/track). |
| system-cohesion | ✓ | Shares the DS motion lib (`tweens.fade`) and `animate-collapsible-*` tokens. Caveat: the dead wrapper is a **family-wide copy-paste** — Accordion ships the identical inert wrapper — so the drift is shared, not one-off. |
| craft | ✓ | Cursor/focus affordances from Radix are solid. The stray no-op wrapper node is the one anti-craft detail; nothing egregious. |
| perceived-performance | ✓ | Instant toggle, CSS height animation, no CLS beyond the intended push-down. Framer runtime cost is small but avoidable. |
| market-benchmark | gap | Peer = Radix Collapsible (we ARE it, vendored) / Base UI / Ark. Parity by construction, but marginally **behind raw Radix**, which renders children directly with no dead JS wrapper. |
| cross-ds-adoption | gap | Base UI / Ark expose transition lifecycle (`keepMounted`, `onExitComplete`) and polymorphic `render`; several DS ship a disclosure-chevron helper. We have none. |

## Top gaps (prioritized)
- [P1] motion / api-composability — Inert `motion.div` (opacity 1→1, `initial={false}`) ships the framer runtime + a child-contract-breaking wrapper for zero motion → delete it and render `{children}` directly inside `CollapsiblePrimitive.Content` (the CSS height keyframe already carries the motion). Apply the same fix to Accordion's twin.
- [P1] motion — No `useReducedMotion` guard on the JS tween; the global `@media (prefers-reduced-motion)` reset (semantic.css:704) only neutralizes CSS animation/transition durations, not Framer's rAF `animate`. Latent while it's a no-op; dissolves if the wrapper is deleted, otherwise gate with `withReducedMotion` (already exported, unused).
- [P2] state-coverage / testing — Add a `Disabled` story + a test asserting the trigger is inert and non-focusable (`<Collapsible disabled>`).
- [P2] motion / composability — Add a `WithChevron` story showing the canonical `group` + `group-data-[state=open]:rotate-180` + `transition-transform` disclosure pattern (match Accordion's chevron), or ship a small `CollapsibleChevron` helper so consumers stop reinventing it.
- [P2] system-cohesion — Keyframe hardcodes `200ms ease-out` (animations.css:23-24) instead of `--duration-moderate-01b` + `ease-productive-standard` (numerically equal today; cosmetic drift). Tokenize alongside Accordion.
- [P3] docs — Drop/replace "Defaults: none", note the `CollapsibleProps` export and that `CollapsibleContent` forwards `className`+ref.

## What it does well
- Composes the vendored Radix primitive instead of re-rolling open/close state — F5-clean.
- Correct a11y for free (real button, `aria-expanded`, keyboard, focus-visible), verified by tests + axe.
- Both controlled (`open`) and uncontrolled (`defaultOpen`) with `onOpenChange`; `asChild` works on the trigger.
- Zero visual AI tells; renders no surface, so it's immune to surface/shadow/radius/theming failures.
- Genuinely strong test suite for a primitive wrapper (11 cases incl. keyboard + axe).

## Cross-DS adoption ideas
- **Base UI Collapsible** ships a first-class CSS-transition path with `keepMounted` and no JS animation runtime — we could drop Framer here entirely and match it.
- **Ark UI / React Aria Disclosure** expose transition lifecycle callbacks (`onExitComplete`) and polymorphic `render`/`asChild` on the panel — worth considering an exit-complete hook for consumers that unmount on collapse.
- **Common pattern across shadcn/Radix examples** — a reusable disclosure-chevron. Ship `CollapsibleChevron` (mirroring Accordion's baked-in chevron motion) so the affordance is one import, not per-consumer hand-rolling.

## Rebuild note
**Polish, not rebuild.** The primitive is structurally right — correct base, correct a11y, correct API. Scope: (1) delete the inert `motion.div` and render children directly (kills the dead runtime dependency, the stray DOM node, and the latent reduced-motion exposure in one move — do Accordion's twin in the same pass); (2) add `Disabled` + `WithChevron` stories and a `disabled` test; (3) tokenize the keyframe timing; (4) tidy the doc. No structural or API change required.
