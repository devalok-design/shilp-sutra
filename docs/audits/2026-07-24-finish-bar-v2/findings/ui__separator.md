# ui/separator — finish-bar audit
Finish: 4/5   Market: PARITY (Radix/shadcn Separator)   Rebuild: polish

> Baseline (2026-07-01) was **2/5** — dragged down by the interpolated-gradient P0 (dead `bg-[image:linear-gradient(${deg},…)]` that couldn't survive the TW4 scanner) plus three decorative gradient variants. All of that was resolved in 0.45.0: `variant` is now a deprecated no-op, the component always renders a solid hairline via `bg-surface-border`, and the hairline is tokenized (`h-px`/`w-px`, no arbitrary `h-[1px]`). This is now a clean, minimal primitive.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Single hairline, `bg-surface-border` semantic token, `shrink-0`, `h-px`/`w-px` (no arbitrary values). No edge-soup, no gradient, no radius token in play. Clean by absence. |
| accessibility | ✓ | `role="separator"` / `role="none"` via Radix, `decorative` default `true`; both paths tested. `--color-surface-border` maps to `CanvasText` under `forced-colors` (semantic.css:743) so it survives HCM. No touch-target/keyboard axis applies to a divider. |
| api-composability | gap | `forwardRef` + `displayName`, fully typed off `ComponentPropsWithoutRef`, composes Radix `Root`, `...props` spreads (so `asChild` flows through). But the dead `variant` prop still lingers as a no-op **past its own stated 0.45.0 removal** (JSDoc says removed, it's 0.52 and it's still typed) — TS cruft. No `label`/children slot for the ubiquitous centered "OR" divider. |
| docs-dx | gap | Doc is accurate for the live surface (correctly omits `variant`), good Composability + Gotchas. But `separator.stories.tsx:14-18` **still exposes a `variant` radio control with all four gradient options** — an interactive control for a feature that does nothing. `asChild` is neither documented nor demoed. |
| testing | ✓ | `describeConformance` + orientation (h/w class) + `decorative` role assertions (both true/false). Axe via conformance. Complete for a divider's small surface. |
| motion | N/A | Static divider — no entrance/feedback motion expected. Correctly still (no missing reduced-motion guard because there's no animation). |
| state-coverage | ✓ | A hairline has effectively one state; no hover/active/disabled/loading/empty semantics apply. Nothing lazy here. |
| content-resilience | gap | RTL-safe (symmetric `h-px`/`w-full`, no physical props). But the vertical-height footgun (vertical needs explicit parent height) is documented, not mitigated — no `self-stretch` fallback. No content slot, so long-text/i18n N/A. |
| theming-resilience | ✓ | `--color-surface-border` has a dark override (neutral-6 → neutral-4, semantic.css:610) and forced-colors mapping. Neutral-based, survives a brand accent-9 swap. No radius → `[data-shape]` N/A. No sunken-track dark-vanish risk (it's a foreground line, not a recess). |
| system-cohesion | ✓ | Consumes the same `surface-border` token siblings use for edges; no bespoke drift. Menu/DropdownMenu/Sheet separators wrap this one. One voice. |
| craft | ✓ | `shrink-0` guards against flex collapse — the kind of unseen detail that stops a divider disappearing in a flex row. Only blemish is the dead `variant` prop as residual cruft. |
| perceived-performance | ✓ | Zero-cost static element, no layout shift, no jank. N/A-adjacent but nothing to fault. |
| market-benchmark | PARITY | Matches Radix Separator / shadcn exactly (div, orientation, decorative, role). MUI Divider *leads* on richer affordances (labeled children, `textAlign`, `flexItem`, `variant="inset"/"middle"`), but that's a heavier component, not a primitive. At the primitive tier we're at bar. |
| cross-DS-adoption | gap | Concrete imports available from MUI Divider — see below. |

## Top gaps (prioritized)
- **[P1] docs-dx** — stories still ship a live `variant` radio (`gradient`/`gradient-left`/`gradient-right`) for a no-op prop → drop the `variant` argType from `separator.stories.tsx`; it advertises a dead control to anyone browsing Storybook autodocs.
- **[P2] api-composability** — dead `variant` prop lingers past its promised 0.45.0 removal → schedule removal in the next major (removing it is a type-narrowing = breaking, so it needs a major bump, not a patch). Keep the deprecated alias until then, but stop surfacing it in stories.
- **[P2] content-resilience** — vertical-height footgun is documented but not mitigated → consider a `self-stretch` default (or a data-attr the parent flex honors) so a bare `<Separator orientation="vertical" />` in a flex row shows without the consumer supplying `h-6`.
- **[P2] api-composability / docs-dx** — `asChild` flows through untested/undocumented → add one test + one story (`<hr>` and a menu `<li role="separator">`) and a Composability note, so polymorphism is a guarantee not an accident.
- **[P3] api-composability] labeled divider** — no children slot for the common centered "OR" divider → consumers hand-roll it. See adoption idea.

## What it does well
- Recovered fully from a 2/5 baseline — the interpolated-gradient P0 and the decorative-gradient slop are gone; it's now the right amount of nothing.
- Tokenized hairline (`h-px`/`w-px`, `bg-surface-border`) with proper dark + forced-colors coverage inherited from the token — theming/HCM "just work" with zero component-local code.
- `shrink-0` is a real craft detail: prevents the line collapsing to 0 inside a flex parent.
- Correct a11y model (decorative default + `decorative={false}` semantic escape), and both branches are tested.
- Composes the vendored Radix primitive instead of re-rolling a `<div>`; typed, `forwardRef`, `displayName`, exported `SeparatorProps`.

## Cross-DS adoption ideas
- **MUI Divider** exposes a `children` slot for a centered/aligned label (the "OR" divider) plus `textAlign="left|center|right"` and `variant="fullWidth|inset|middle"`. We punt this common pattern entirely — worth a thin, opt-in `<Separator>label</Separator>` layout (logical `start`/`center`/`end` alignment, not physical) layered above the primitive, without touching the hairline default.
- **MUI Divider** `flexItem` prop makes a vertical divider stretch to its flex siblings' height — directly addresses our documented vertical-height footgun; adopt the behavior (as a `self-stretch` default) even if not the prop name.
- **Radix / shadcn** keep the primitive exactly this minimal — confirmation that adding label/inset belongs in a *separate composed* component, not by bloating this primitive's prop surface.

## Rebuild note
**Polish, not rebuild.** The primitive is structurally correct and at market parity. Scope: (1) remove the dead `variant` argType from the stories immediately (no API change); (2) add `asChild` test + story + doc note; (3) give vertical a `self-stretch` fallback for the height footgun; (4) queue the actual `variant` prop removal for the next major (it's a type-narrowing → breaking, needs a major bump + BREAKING.json entry, not a patch). A labeled-divider affordance, if wanted, is a new composed component — do not grow this primitive to hold it.
