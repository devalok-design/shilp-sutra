# ui/tooltip — finish-bar audit
Finish: 4/5   Market: PARITY (Radix Tooltip)   Rebuild: polish

Thin, well-behaved wrapper over the vendored Radix Tooltip primitive. Composes the primitive (no re-rolled positioning/portal), uses semantic tokens throughout (`bg-surface-inverted`, `rounded-overlay-sm`, `shadow-floating`, `z-tooltip`, `px-ds-04 py-ds-02b`, `text-body-sm`), threads a real controlled/uncontrolled `open` shim so `AnimatePresence` can drive exit, and ships an auto-provider that kills the classic "tooltip silently never renders" footgun. No visual slop tells. Notably clean on both systemic tells this pass targets: the enter/exit **does** include `opacity: 0` (no slide-no-fade), and there is no `border-card-strong` / dead-class usage. The score is held at 4 (not higher) by two P1 gaps that have now persisted a full audit cycle: no reduced-motion guard, and a doc that advertises a `<TooltipArrow>` export the source doesn't have.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | surface-inverted (neutral-12/1) is correct for a transient overlay; `rounded-overlay-sm` role token; `shadow-floating` only, no border → no edge-soup; no accent rail/gradient/glow/emoji. `py-ds-02b` (6px) is a defined token, not a magic number (semantic.css:314). |
| accessibility | ✓ | Radix `role="tooltip"` pattern; axe-clean test (test:99); forced-colors mapped at token level (surface-inverted→CanvasText/Canvas, semantic.css:741); high-contrast neutral-12/neutral-1. Focus-open path is correct via Radix but untested (→ testing). |
| api-composability | gap | Composes primitive, `asChild` trigger, controlled+uncontrolled shim, `forwardRef`+`displayName` on Content. But `Tooltip`/`TooltipProvider` typed `React.FC` (discouraged); `sideOffset` map keyed `Record<string,…>` so a bad `side` silently falls back to `{}` (line 67/79). |
| docs-dx | gap | Doc claims `<TooltipArrow>` (md:28) — no such export (source exports only Tooltip/Content/Provider/Trigger). Changelog says "Changed to text-surface-1" but source uses `text-surface-inverted-fg`. No real Props/Types table; no `SimpleTooltip` cross-link. |
| testing | gap | Unit + `vitest-axe` present, but no `describeConformance`, no focus-open interaction test, no `defaultOpen` test, no `onOpenChange` controlled test. Only forced-`open` and hover exercised. |
| motion | gap | `springs.snappy` is near-critically damped (bounce-free, correct); enter/exit differentiated via AnimatePresence; transform/opacity only; origin-aware side slide. One real miss: **no `useReducedMotion()` guard** — relies on an optional ancestor MotionConfig. sheet.tsx:195 self-guards; tooltip does not. |
| state-coverage | gap | Inert-label contract means hover/focus/open/closed is the full matrix (fine). Gap is demonstration: no dark-mode story despite theme-flipping surface (v0.22 shipped a dark-mode invisibility bug), no forced-colors story. |
| content-resilience | ✓ | multi-line wrap (`max-w`) + custom rich content stories; `overflow-hidden`; Radix flips `side` in RTL; symmetric side offsets. |
| theming-resilience | ✓ | neutral-based (survives accent-9 swap untouched); forced-colors tokens defined; radius role token honors `[data-shape]`; light↔dark surface inversion is intentional (surface-inverted). Only the guarding *story* is missing (→ testing). |
| system-cohesion | ✓ | shares `springs.snappy`, `rounded-overlay-sm`, `z-tooltip`, `useControllableOpen`, shared motion lib. Minor drift: does not adopt sheet's reduced-motion self-guard convention. |
| craft | ✓ | auto-provider removes the "no provider → nothing renders" footgun; side-based slide origin; `useMemo` on context value; `forceMount` + AnimatePresence for a real exit. |
| perceived-performance | ✓ | instant spring settle; transform-only (no CLS); 300ms delay via provider; proper mount/unmount. |
| market-benchmark | PARITY | vs Radix Tooltip: at parity, slightly ahead on auto-provider ergonomics + framer exit, slightly behind on built-in reduced-motion handling and an exposed arrow. |
| cross-DS-adoption | gap | See ideas below — Base UI reduced-motion data-attrs, React Aria touch/long-press, Radix Arrow. |

## Top gaps (prioritized)
- [P1] motion — no `useReducedMotion()` guard; scale+slide pop fires for reduced-motion users in any consumer without a MotionProvider ancestor → add `const reduce = useReducedMotion()` and gate `initial`/`exit` to opacity-only (mirror sheet.tsx:195).
- [P1] docs-dx — doc advertises a `<TooltipArrow>` export that doesn't exist → an agent importing it hits a build error. Either export+style `TooltipPrimitive.Arrow` (fill = surface-inverted) or delete the clause (md:28). Also fix the stale `text-surface-1` changelog line.
- [P2] testing — add focus-open `play` step (`userEvent.tab()` → assert tooltip), a `defaultOpen` test, and an `onOpenChange` controlled test; the animation-shim logic is otherwise only hit by one forced-`open` test.
- [P2] state-coverage — add a dark-mode story (surface-inverted flips; a dark story would have caught the v0.22 invisibility bug) and a forced-colors note.
- [P3] api — drop `React.FC` on `Tooltip`/`TooltipProvider`; key `sideOffset` as `Record<'top'|'bottom'|'left'|'right', …>` so a bad `side` fails loudly instead of `{}`.

## What it does well
- Auto-provider: no "silently renders nothing" footgun, without forcing a bespoke prop — genuine ergonomic craft.
- Correct enter/exit — `opacity: 0` present in both `initial` and `exit`, so it fades while it slides (avoids the slide-no-fade tell entirely).
- Correct overlay surface + single edge treatment: `bg-surface-inverted` + `shadow-floating`, no border → no edge-soup.
- Clean token discipline: role radius, DS spacing/z, composite type utility; zero arbitrary values in component source.
- Bounce-free functional motion (`springs.snappy`) — appropriate for a high-frequency micro-overlay.

## Cross-DS adoption ideas
- **Base UI Tooltip** emits reduced-motion / instant-phase data attributes and a `skipDelayDuration` "instant" transition group — we should bake reduced-motion into the component (not defer to an optional ancestor) and consider a documented instant-group behavior.
- **React Aria (Adobe)** tooltip has built-in touch/long-press handling and explicitly designs around hover-invisibility on touch — our doc warns about it (md:33) but the component offers no touch affordance; worth considering a paired-label helper or `SimpleTooltip` touch story.
- **Radix** exposes `Tooltip.Arrow` — we neither ship nor style it despite the doc claiming it. Ship it styled to the inverted surface fill, or stop advertising it.

## Rebuild note
**Polish, not rebuild.** Structure is sound — it correctly composes the vendored Radix primitive and the API surface is canonical (`open`/`defaultOpen`/`onOpenChange`, `asChild`). All gaps are in-place fixes: add the `useReducedMotion` guard (P1), resolve the `TooltipArrow` doc/source mismatch (P1), tighten two types (P3), and backfill focus-open/`defaultOpen`/dark-mode coverage (P2). No structural change needed; these are the same P1s the 2026-07-01 baseline flagged and they remain open.
