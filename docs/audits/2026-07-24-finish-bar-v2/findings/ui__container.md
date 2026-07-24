# ui/container — finish-bar audit
Finish: 5/5   Market: PARITY   Rebuild: none

> Non-visual layout primitive (server-safe, polymorphic wrapper). Motion,
> state-coverage, perceived-performance and most visual/theming visuals are
> N/A by design — a wrapper that painted a surface or animated would itself
> be a slop tell. Scored only on the applicable axes; N/A rows are not
> penalized. Source verified: `container.tsx` ships exactly
> `mx-auto w-full px-page-x` + one max-width token + `className`.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Only `mx-auto w-full px-page-x` + `max-w-layout/-body/-full`. No border, fill, shadow, radius, or accent — zero surface, so zero edge-soup/rail/glass tells. No `rounded-ds-*`/`rounded-full`. No magic numbers — `px-page-x` → `--spacing-page-x` (ds-05, ds-06 at breakpoint); `max-w-layout` → `--max-width` 1280px, `-body` → 960px, all token-backed (`utilities.css:322`, `semantic.css:555`). |
| accessibility | ✓ | Semantics delegated to consumer via `as` (`main`/`section`/`article`). No ARIA needed for a layout box; adds no roles that could mislead. `px` padding is physically symmetric → no RTL hazard. |
| api-composability | ✓ | Polymorphic `as` (idiomatic; `asChild`/Slot would be redundant), `forwardRef` + `displayName`, exported `ContainerProps`, spreads `ComponentPropsWithRef<T>` so element-native props typecheck. Typed string-literal union, no `any`. Composes the token layer, re-rolls nothing. Same polymorphic-cast pattern as `text.tsx`/`stack.tsx` — deliberate. |
| docs-dx | gap | Doc (`container.md`) is accurate but thin: props table lists only `maxWidth`/`as`; never states the component forwards `ref` and spreads native props for the `as` element. Carried P2 from 2026-07-01 baseline — still open. Story tagged `stable`+`autodocs`. |
| testing | ✓ | `describeConformance` + targeted RTL asserts: default div, all 3 `maxWidth` values, base classes, `as="main"`/`as="section"`. Full axis coverage for a non-interactive primitive. |
| motion | N/A | No entrance/hover/press by design — correct for a structural wrapper. No `slide-no-fade`, no springs. |
| state-coverage | N/A | Non-interactive, no fill/border/text — no hover/active/focus/disabled/loading/empty/error matrix to design. |
| content-resilience | ✓ | Constrains width, centers, and delegates overflow to content. Zero/one/many children agnostic. `w-full` + `mx-auto` + symmetric gutters are RTL-safe. `full` escape hatch for full-bleed. |
| theming-resilience | ✓ | All values are CSS vars — survives brand swap, responds to the responsive `--spacing-page-x` override at breakpoint, and to any `--max-width` theme override. No hardcoded px in the component. |
| system-cohesion | ✓ | Shares the exact polymorphic-component idiom and token-consumption discipline of its layout siblings (`stack.tsx`, `text.tsx`). No bespoke drift. |
| craft | ✓ | Responsive gutter (ds-05 → ds-06) is a quiet nicety; `body` reading-width preset (960px) shows layout-grade thought, not a single dumb max-width. Clean minimal surface area (2 props). |
| perceived-performance | N/A | Static, `// @server-safe`, no hooks/context/JS runtime — zero-cost in an RSC tree. Nothing to jank. |
| market-benchmark | PARITY | vs Radix Themes `Container` / MUI `Container` / Chakra `Container` — see below. |
| cross-DS | — | Ideas listed below. |

## Top gaps (prioritized)
- [P2] docs-dx — doc omits ref-forwarding + native-prop-spread of the `as` element → add one line under Props: "Forwards `ref` and spreads all native props for the element chosen via `as`."
- [P2] api-composability — no gutter escape hatch → consider a `disableGutters`/`padded={false}` boolean for full-bleed rows that still want the max-width+centering (today `full` drops the width cap but you still get `px-page-x`; there's no "cap width, kill padding" combination).
- [P3] api-composability — `maxWidth` is a fixed 3-preset union; no responsive form → see Radix idea below. Enhancement, not a gap against bar.

## What it does well
- Textbook minimal primitive: does exactly one job (center + cap width + gutter) and nothing else — no surface, no motion, no state to get wrong.
- Fully token-backed; no magic numbers; responsive gutter baked into the token, not the component.
- Correct polymorphism: `as` + ref preservation + native-prop spread, typed so `<Container as="main">` accepts `<main>` props at compile time.
- Server-safe, verified against actual class output; tests and stories cover every axis.

## Cross-DS adoption ideas
- **Radix Themes Container** takes responsive object props (`size={{ initial: '1', md: '3' }}`). We could let `maxWidth` accept a responsive record (`{ initial, md, ... }`) for pages that widen the cap at larger breakpoints — currently impossible without a wrapper.
- **MUI Container** ships `disableGutters` and `fixed` (snap to the breakpoint min-width rather than a fluid max). A `disableGutters` boolean is the cheapest useful addition (see P2); `fixed`-style breakpoint snapping is likely over-engineering for our flat 3-preset model.
- **Chakra Container** has `centerContent` (flex-column-center the children). Minor, but a common ask for marketing/hero blocks — could be a `center` boolean rather than making consumers add a Stack.

## Rebuild note
None. This is an exemplary base primitive already at the finish bar — the 5/5 from the 2026-07-01 baseline holds on re-verification. The only open item is a one-line docs addition (P2, carried) plus two purely additive API enhancements (`disableGutters`, responsive `maxWidth`) that are opportunities, not deficiencies. No structural change, no visual/motion/a11y work indicated.
