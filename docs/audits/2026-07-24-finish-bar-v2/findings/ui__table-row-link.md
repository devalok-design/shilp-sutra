# ui/table-row-link — finish-bar audit

Finish: 4/5   Market: LEADS   Rebuild: polish

A thin, unusually high-craft utility: a real `<a>` that stretches the click
target across a table row via a cell-anchored `after:` pseudo-element, routed
through `LinkContext` for framework router-awareness. It exists to kill the
`onClick`-on-`<tr>` anti-pattern (breaks cmd/middle-click + SR link semantics).
Its ceiling is capped by **zero test coverage** and a couple of small
resilience gaps, not by any design or a11y defect.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Clean. Role token `rounded-control-inner` (honors `[data-shape]`), `text-surface-fg`, `font-medium`, no edge-soup/gradient/glow. One raw arbitrary value `after:w-[100vw]` — flagged as magic-number per rubric, but it is the *canonical* stretched-link mechanism (no spacing token can express a viewport span; clipped by Table's `overflow-x-clip`). Not off-cadence drift. |
| accessibility | ✓ | This is the component's entire reason to exist and it nails it: real anchor → cmd/ctrl+click, middle-click, context-menu "open in new tab", SR link announcement. Stretch mode suppresses its own outline and delegates a row-level focus ring to `TableRow`'s `has-[[data-slot=row-link]:focus-visible]` rule (confirmed in table.tsx:112, with `-outline-offset-2`). `stretch={false}` carries its own `focus-visible:outline-2 outline-accent-9 outline-offset-2`. Icon-only siblings get `aria-label` in examples. Minor: no `forced-colors` treatment (relies on native link semantics — acceptable); focus ring only appears if used inside `TableRow` (coupling, but documented). |
| api-composability | ✓ | `href` required, `stretch?: boolean` (clean, no rename debt), spreads `AnchorHTMLAttributes`, `forwardRef` + `displayName`, `children: ReactNode`. Routes through `LinkContext.useLink()` so Next/React-Router consumers get client-side nav for free — real composability, not re-rolled. No `any`, no stringly types. |
| docs-dx | ✓ | Doc has Props/Example/Composability/Gotchas/Changes and matches source. Genuinely good: placement contract (primary cell must be `relative`), Safari-`<tr>` rationale, `z-[1]` escape hatch, "one navigation owner per row". Trivial drift: doc example uses `IconButton size="sm"`, stories use `size="xs"`. |
| testing | ✗ | **No `table-row-link.test.tsx` exists.** Non-trivial behavior is untested: stretch pseudo-element presence, `stretch={false}` branch, `LinkContext` override routing, outline suppression, ref forwarding. No `vitest-axe`, no `describeConformance`. This is the single biggest gap and the reason it isn't a 5. |
| motion | N/A | Correctly no motion — navigation is a high-frequency action and should not animate. `hover:underline` (title-only) is instant. Restraint is right here. |
| state-coverage | gap | focus-visible (both modes) and hover (title-only underline) are designed. In stretch mode the link has **no self-hover affordance** — delegated entirely to `TableRow`'s row hover (fine by design). Missing: no `aria-current` / active-row ("you are here") state, and no disabled treatment (anchors don't disable — usually N/A, but a disabled row link has no story). |
| content-resilience | gap | `children` is `ReactNode`; truncation delegated to the cell. **RTL: uses physical `after:left-0` + `w-[100vw]`, not logical `inset-inline-start`.** In an RTL table the 100vw overlay is anchored to the physical left, which may mis-cover the row. `inset-y-0` is fine. Small but real. |
| theming-resilience | ✓ | Role token radius (survives shape presets), `text-surface-fg` + `accent-9` focus (survives accent-9 swap). Nothing theme-fragile; no elevation/recess to invert in dark. |
| system-cohesion | ✓ | Shares the DS focus-ring language (accent-9, offset-2), radius role token, and the `LinkContext` router-abstraction with siblings. No bespoke drift. `data-slot="row-link"` is the contract `TableRow` keys off — tight, intentional coupling. |
| craft-unseen | ✓ | Standout for its size: cell-anchored (not row-anchored) pseudo-element *because* Safari ignores `position:relative` on `<tr>`; 100vw span + `overflow-x-clip` containment; real-anchor for middle-click; documented `z-[1]` layering so menu buttons stay clickable; focus suppression paired with a delegated row ring. These are the details users feel and never notice. |
| perceived-perf | ✓ | CSS-only overlay, zero JS on interaction, instant, no layout shift/CLS, no jank. |
| market-benchmark | ✓ LEADS | Peer set: GitHub row/block links, TanStack Table (row-model, ships no link primitive), shadcn/Radix (no dedicated accessible row-link). Most libraries hand you `onRowClick` (a11y-broken) or leave the stretched-link hack to the consumer. Shipping a correct, router-aware "block link" (Inclusive Components pattern) as a first-class primitive puts us **ahead** of the named peers. |
| cross-ds-adoption | — | See below. |

## Top gaps (prioritized)
- [P0] testing — no test file at all. → Add `table-row-link.test.tsx`: renders as `<a href>`; `stretch` toggles the `after:` overlay; `stretch={false}` renders underline+own focus ring; `LinkProvider` override swaps the element; ref forwards; `vitest-axe` clean inside a `<Table>`.
- [P1] content-resilience (RTL) — physical `left-0` on the 100vw overlay. → Switch to logical `after:inset-inline-start-0` (or `after:start-0`) so RTL tables get correct coverage; verify against Table's clip.
- [P2] state-coverage — no active-row affordance. → Consider an `aria-current`/`data-current` passthrough + a subtle row-level "current" style, so a row-link can express "this is the open record".
- [P2] docs-dx — `size="sm"` vs `size="xs"` mismatch between doc example and stories. → Align (trivial).

## What it does well
- Correct a11y-first premise: a real anchor, not a `<tr>` click handler — the whole point, executed cleanly.
- Router-aware via `LinkContext` — Next.js/React Router consumers get client-side nav with no extra wiring.
- Exceptional craft-per-line: Safari `<tr>` workaround, 100vw+clip mechanism, delegated row focus ring, `z-[1]` escape hatch — all documented in code and the `.md`.
- Clean, honest API with a well-reasoned `stretch` trade-off (selectability vs whole-row target) surfaced in JSDoc, doc, and a dedicated story.

## Cross-DS adoption ideas
- **Inclusive Components / GitHub block-link**: offer a hybrid where the *title text* sits at `z-[1]` above the overlay so the title stays selectable while the rest of the row is clickable — softens today's binary `stretch` vs `stretch={false}`.
- **TanStack Table / Linear**: an `aria-current="page"` + current-row highlight convention for "the row you're viewing", which list-detail layouts need.
- **Next.js**: pass-through for `prefetch` and expose it in the `LinkContext` contract so router `Link` props (prefetch, scroll, replace) flow through predictably.
- **React Aria**: "Enter opens the focused row" keyboard affordance when the row (not just the anchor) holds focus, for grid-like tables.

## Rebuild note
**Polish, not rebuild.** The structure is correct and market-leading; nothing about the stretched-anchor/`LinkContext` architecture needs replacing. Scope: (1) author the missing test file — the P0; (2) swap the one physical RTL property for a logical one; (3) optional `aria-current`/current-row convention and the doc size fix. All in-place, no API break.
