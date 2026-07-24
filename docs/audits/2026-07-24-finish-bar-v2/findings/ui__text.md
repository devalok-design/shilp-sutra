# ui/text — finish-bar audit

Finish: 4/5   Market: PARITY (Radix Themes Text/Heading)   Rebuild: polish

Foundational typography primitive: a polymorphic, server-safe `Text` with a
20-value `variant` axis (headings 2xl–xs, body lg–xs, labels lg–xs, label-plain
lg–sm, caption, overline, code) that auto-selects the correct semantic element
and lets `as` override it. No motion, no interaction, no surfaces — score covers
only the applicable axes; motion / state-coverage / perceived-perf are largely
N/A and not penalized.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No slop tells (no edge-soup/gradient/glow/emoji/pill). No surfaces/radius/shadow to get wrong. Clean token-driven type ramp; uppercase applied via `text-transform`, not hand-typed caps. |
| accessibility | ✓ | Real strength: variant→element map gives semantic h1–h6/p/span/code by default; `as` is the escape hatch for visual-vs-semantic demotion. Uppercase via CSS preserves the accessible name + copy-paste. Contrast/color deferred to consumer className — correct for a primitive. |
| api-composability | ✓ | Correct polymorphic pattern (generic `T` preserved so `htmlFor`/`href` typecheck), `forwardRef` + `displayName`, `ReactNode` children, no `any` in the public surface, sensible `body-md` default. Role-based `variant` enum is a deliberate, coherent taxonomy. Minor: no `truncate`/`wrap`/`color` convenience props. |
| docs-dx | gap | Doc lists all 20 variants correctly, but the example uses a stale color token `text-text-secondary` (DS token is `text-surface-fg-muted`, which the stories use correctly). Changelog stuck at v0.1/v0.2. |
| testing | ✓ | Unit + RTL + `describeConformance` (samples 12/20 variants incl. `code`, `label-plain-md`). Covers default element, `as` override, ref forwarding, uppercase class. No axe test, but low-value for static text. |
| motion | N/A | Static primitive; correctly zero motion. |
| state-coverage | N/A | Non-interactive; no hover/active/disabled/loading/empty/error states apply. |
| content-resilience | gap | No truncation / line-clamp / balance affordance — long text overflow is entirely the consumer's problem. No `wrap`/`lines` prop. RTL fine (no physical padding); uppercase locale edge cases (Turkish i) are a theoretical minor. |
| theming-resilience | ✓ | Ramp is driven by `--typo-*` tokens; font family via `--font-display/-sans/-mono`; color via consumer semantic tokens. Survives accent swap; no dark-mode elevation risk (no surface). `[data-shape]`/density N/A. |
| system-cohesion | gap | **Main finding.** The CVA re-spells all four typographic properties inline (`text-[length:var(--typo-*-size)] font-[number:var(...)] leading-[var(...)] tracking-[var(...)]`) for every one of 20 variants — while `tokens/utilities.css` already ships an exact-match composite `@utility text-heading-2xl … text-code` for each, bound to the same `--typo-*` vars (plus font-family and `text-transform`). Two parallel implementations of the type ramp kept in sync by hand; edit the utility and `Text` silently diverges. Body variants also lean on the `font-sans` base while the utilities bake font-family per-role — a subtle inconsistency. |
| craft | ✓ | Semantic auto-mapping and CSS-driven uppercase are genuine craft. `slop-allow` annotation shows intent. Room: no `text-wrap: balance` on headings, no `tabular-nums` for numeric captions. |
| perceived-perf | ✓ | Server-safe, no client JS beyond `createElement`, no CLS introduced by the component. |
| market-benchmark | ✓ | See below — net PARITY with Radix Themes. |
| cross-ds | ✓ | Concrete import ideas below. |

## Top gaps (prioritized)
- [P1] system-cohesion — type ramp duplicated between `text.tsx` CVA and the `@utility text-*` composites in `utilities.css` → have the CVA emit the single composite class per variant (`variant: 'heading-2xl' → 'text-heading-2xl'`), deleting ~80 arbitrary-value fragments and collapsing to one source of truth. Verify the utilities' baked-in font-family/`text-transform` fully covers what the CVA currently sets (they do for all 20).
- [P2] content-resilience — add an opt-in `truncate` (and/or `lines={n}` clamp) prop; most real usage eventually needs single-line ellipsis.
- [P2] docs-dx — fix the doc example's stale `text-text-secondary` → `text-surface-fg-muted`; refresh the changelog.
- [P2] docs-dx / testing — `text.stories.tsx` argTypes + AllVariants omit `label-plain-lg/md/sm` and `code` (16 of 20 shown); add them so every variant is exercised visually.

## What it does well
- Automatic semantic HTML element per variant — the consumer gets correct heading structure for free, with `as` as a clean visual-vs-semantic escape hatch. This beats peers that force you to pick the element.
- Textbook polymorphic typing: generic `T` survives to the export so element-specific props typecheck; `forwardRef` + `displayName` present.
- Server-safe (`// @server-safe`) — renders in RSC trees with no `"use client"`; near-zero runtime cost.
- Uppercase label/overline variants use `text-transform`, not literal caps — preserves accessible name and copy-paste.
- Fully token-driven ramp; nothing hardcoded in px.

## Cross-DS adoption ideas
- Radix Themes `Text`/`Heading` ship a `truncate` boolean and a `wrap="wrap|nowrap|pretty|balance"` prop — adopt both; `wrap="balance"` on headings is a cheap, high-perceived-quality win.
- Radix's `color` prop maps to the theme's semantic scale; we push color entirely to className. A thin optional `tone`/`color` prop mapping to `surface-fg`/`-muted`/`-subtle`/`accent`/`error` would cut boilerplate without breaking the className path.
- Chakra/MUI Typography expose `noOfLines` (line-clamp) — pairs with the truncate idea for multi-line clamp.
- Consider `font-variant-numeric: tabular-nums` as an opt-in for caption/label variants used in data-dense UIs.

## Rebuild note
Polish, not rebuild. The architecture, typing, semantic mapping, and a11y are
sound and market-competitive. The one structural cleanup is collapsing the CVA
onto the existing `@utility text-*` composites to kill the duplicate type-ramp
definition (P1 maintainability), then bolting on `truncate`/`wrap` convenience
props and syncing the stories/doc. All in-place, no API break.
