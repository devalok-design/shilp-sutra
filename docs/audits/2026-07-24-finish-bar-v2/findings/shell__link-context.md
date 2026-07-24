# shell/link-context — finish-bar audit
Finish: 5/5   Market: PARITY   Rebuild: none

**What it is:** a headless router-bridge React context. `shell/link-context.tsx` is a 6-line re-export shim; the canonical implementation lives in `packages/core/src/ui/lib/link-context.tsx` (so `ui/` and `shell/` both consume it without violating the `ui ↛ shell` module boundary). `LinkProvider` registers a framework `Link` (Next/Remix/react-router), `useLink()` returns it, and the default is a bare `forwardRef` `<a>` so the hook never throws outside a provider. Consumed by `bottom-navbar`, `sidebar`, `stat-card`, `table-row-link`.

Non-visual utility: motion, visual, theming, content, and perceived-performance axes are **N/A by construction** and not penalized (per rubric).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | N/A | No surface, CVA, color, radius, shadow, or spacing. Fallback `<a>` carries zero styling. No slop tell possible. No `rounded-ds-*`/`rounded-full`, no magic numbers, no edge-soup, no `border-card-strong`. |
| accessibility | ✓ | Renders a real semantic anchor with `href`; test includes a `vitest-axe` pass (no violations) for both provider and default paths. Nothing to over- or under-ARIA. |
| api-composability | ✓ | Archetypal headless-context primitive: `forwardRef` + `displayName` on `DefaultLink`, precise `LinkComponent` type (no `any`, `HTMLAnchorElement`-specific, requires `href: string`), `LinkProviderProps` exported, sensible non-throwing default. Correctly uses React context (single-copy safe, `'use client'`). Minor: `LinkComponent` type is inferred but not exported. |
| docs-dx | gap | Doc has Import/Props/Defaults/Example/Composability/Gotchas/Changes and matches the exported surface. Gap: prop table describes `component` loosely as "ForwardRefComponent" — omits the `href: string` requirement that the exported type enforces (a consumer whose component types `href?` fails `tsc` with no doc hint). |
| testing | ✓ | Unit + RTL + axe; covers with-provider render, `href` forwarding, and the no-provider default fallback. `describeConformance` N/A (headless, no DOM variant surface). |
| motion | N/A | Headless — renders no animated element. |
| state-coverage | ✓ | Only meaningful state is "provider present vs absent"; both deliberately handled via the default. Both tested. |
| content-resilience | N/A | Renders no content of its own; passes children straight through. |
| theming-resilience | N/A | Consumes zero tokens; nothing to survive an accent-9/`data-shape`/density swap. |
| system-cohesion | ✓ | This IS the shared router-bridge slot the whole shell family consumes; canonical-in-`ui/lib`-with-shell-re-export respects the module-boundary lint. No bespoke drift. |
| craft | ✓ | Nice unseen details: non-throwing default so `useLink()` is safe anywhere; documented `eslint-disable` for the intentional content-less anchor; `href` pulled out and re-applied explicitly. |
| perceived-perf | N/A | Context registry; no render cost of consequence. |
| market-benchmark | ✓ | See below — PARITY. |
| cross-DS-adoption | gap | See ideas below — React Aria's `RouterProvider` covers a broader surface. |

No axis scored ✗.

## Top gaps (prioritized)
- [P2] docs-dx — doc's `component` description omits the enforced `href: string` constraint → add one line: "the injected component's props must include `href: string` (Next/Remix/react-router Link all qualify)."
- [P2] api-composability — `LinkComponent` return type is not exported → export it so advanced consumers can annotate a variable holding `useLink()` results without relying on inference.
- [P2] cross-DS-adoption — the bridge is component-injection only; it does not expose client-nav to non-shell components (Button/Menu with `href` still hard-navigate unless the consumer uses `asChild`). See adoption ideas.

## What it does well
- Textbook headless context: single-copy-safe, `'use client'`-annotated, non-throwing default, precise types, exported props interface, `forwardRef`+`displayName`.
- Correct architectural placement — canonical in `ui/lib`, re-exported from `shell` to honor the `ui ↛ shell` boundary rather than duplicating.
- Solves a real consumer problem (client-side nav for data-driven shell link arrays that can't take per-item `asChild`), and the doc explains *why* shell uses this instead of `asChild`.
- Tests cover the load-bearing behaviors (forwarding + default fallback + a11y), not just "renders".

## Cross-DS adoption ideas
- **React Aria `RouterProvider`** passes a `navigate` function (+ optional `useHref`) rather than a `Link` component, so *every* Aria component with an `href` (buttons, menu items, tabs, breadcrumbs) gets client-side navigation and modifier-click/open-in-new-tab handling — not only components that render `<a>`. We could offer an optional `navigate`/`useHref` channel alongside the current component injection so `useLink()` consumers gain correct client-nav without each router shipping a `Link`.
- **MUI `LinkComponent`** (set globally via theme + a `LinkBehavior` `forwardRef` adapter) is the same pattern we have; we match it. Our default-fallback is arguably cleaner than MUI's (no adapter boilerplate required to render at all).
- **Chakra/Ark** rely on `asChild` everywhere and have no dedicated router registry — our data-driven-shell justification is a genuine, defensible divergence; keep it.

## Rebuild note
None. This is a correct, minimal, well-tested headless primitive at the finish bar for its archetype. At most a cosmetic **polish** pass: add the `href: string` note to the doc and export the `LinkComponent` type. The `RouterProvider`-style `navigate` channel is a future enhancement (broadens client-nav beyond `<a>`-rendering components), not a finish-bar defect — track it as a feature, not a rebuild.
