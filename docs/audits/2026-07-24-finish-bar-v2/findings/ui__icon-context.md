# ui/icon-context — finish-bar audit
Finish: 5/5   Market: PARITY (Radix/Ark context primitives)   Rebuild: none

Headless React context primitive: a typed `IconContext`, a memoized `IconProvider`
(renders only `<IconContext.Provider>`, zero DOM of its own), a `useIconContext()`
hook, and exported `IconSize`/`IconStroke`/`IconContextValue` types. No CVA, no
Tailwind classes, no tokens, no motion, no copy. The visual, a11y, motion, state,
content, theming, and perceived-perf axes are **N/A by construction** — there is
nothing to render, so nothing can drift toward a slop look. This is the primitive
that lets Button / IconGroup / StatCard / Icon share icon sizing instead of
re-rolling it. Scored only on the applicable axes per the non-visual-utility rule.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | N/A | Renders no DOM/surface. No classes, tokens, radius, shadow, spacing — nothing to converge. |
| accessibility | N/A | Non-interactive, no focusable element, no ARIA surface. Correctly forwards nothing. |
| api-composability | ✓ | This *is* the composability primitive. Nests correctly (inner overrides outer); `forwardRef` unneeded (no DOM); types exported via barrel; sensible domain enums (`IconSize`/`IconStroke`). Minor: `IconProviderProps` is an inline intersection, not a named export. |
| docs-dx | ✓ | Doc matches source exactly — exports, prop shapes, empty-object fallback contract, memoization note, Changes section all align. Story intentionally exempt (`pre-publish-audit.mjs:845`). |
| testing | ✓ | `__tests__/icon-context.test.tsx` present; covers default/override size + stroke propagation, axe-clean (per prior baseline). |
| motion | N/A | No DOM, no animation. Motion correctly lives downstream in `Icon` (guarded by `useReducedMotion`). |
| state-coverage | N/A | Non-interactive; no hover/active/disabled/loading/empty/error states to design. |
| content-resilience | N/A | Pure `children` pass-through; owns no text, layout, or overflow behavior. |
| theming-resilience | N/A | No tokens, no styles — survives any accent/shape/density swap trivially. |
| system-cohesion | ✓ | The shared sizing channel siblings build on (Button, IconGroup, StatCard, Icon). "Thousand voices in tune" — this is what keeps icon sizing coherent DS-wide. |
| craft-unseen | ✓ | `useMemo` on the value object avoids needless consumer re-renders; safe `{}` default lets the hook degrade without a mounted provider. Deliberate, correct micro-details. |
| perceived-performance | ✓ | Memoized value = no re-render churn in tight/hot trees; the documented safe-for-loops contract. |
| market-benchmark | ✓ (PARITY) | Equivalent to Radix/Ark headless context primitives. On par for its purpose; slightly behind Radix's `createContextScope` (scoped multi-instance contexts + dev-time "used outside provider" error) but that capability isn't needed for a global icon-sizing channel. |
| cross-ds-adoption | ✓ | Ideas noted below; none blocking. |

## Top gaps (prioritized)
- [P2] api-composability — `IconProvider`'s props are an inline intersection (`IconContextValue & { children }`) with no named export → export an `IconProviderProps` type for parity with other components' prop-type exports. Purely a surface nicety; no rubric violation.
- [P3] docs-dx — a few connector em-dashes in the Composability/Gotchas prose (verbal-tell E1); keep the Exports definition-list dashes, soften only the rhetorical ones. Doc-voice nit, non-blocking.

## What it does well
- Correct headless modeling: no DOM element, so no `forwardRef`/`displayName` ceremony, no surface to slop.
- Memoized value + safe empty-object fallback — the two details that make a context primitive actually safe to use everywhere.
- Full type surface exported (`IconContextValue`, `IconSize`, `IconStroke`) with no `any`, no stringly-typed enums, no narrowing.
- Doc is accurate to source and honest about the fallback contract; correctly story-exempt.
- Nests predictably (inner overrides outer) and is genuinely reused across the DS rather than re-rolled — the drift-avoidance the rubric praises.

## Cross-DS adoption ideas
- **Radix `createContextScope` / `createContext(rootComponentName, defaultContext)` helper** — provides a scoped, collision-safe context factory that throws a clear dev-time error when a hook is consumed outside its provider. We deliberately return `{}` instead (fallback-by-design), which is right here, but a shared `createContext` helper with an opt-in dev warning could serve future primitives that genuinely require a provider.
- **Ark/React-Aria pattern of colocating the provider with a `useXContext` that documents required-vs-optional** — we already do the optional variant well; worth keeping as the house pattern if more sizing/scale channels are added (density, motion).

## Rebuild note
None. This is at the finish bar for a headless primitive — minimal, correctly typed, memoized, documented, tested, and actively composed by siblings. The only follow-ups are a P2 named-type export and a P3 doc-voice nit; both are in-place polish, not structural. No visual/a11y/motion exposure to fix because the component renders nothing.
