# ui/stack — finish-bar audit
Finish: 4/5   Market: PARITY (Radix Themes Flex)   Rebuild: polish

Stack is a zero-surface polymorphic flex primitive: `flex` + direction + gap + align + justify + wrap, rendered via `React.createElement` onto `as` (default `div`), `forwardRef` + `displayName`, server-safe. It ships no color, border, shadow, background, font, or motion — the entire visual-tell battery is structurally inapplicable. It mirrors the Text polymorphic pattern (generic `StackComponent` cast preserving `T`), uses DS `gap-ds-*` tokens via a JIT-safe static map, has a clean conformance + RTL test set, a full story matrix, and an accurate doc. Gaps are all minor: unbounded numeric `gap` that silently no-ops, redundant 4-value direction union, no `data-slot`/`asChild` hook, and no responsive direction/gap props (where the market peers lead).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | N/A by construction — no surface/border/shadow/color/radius. Emits only layout + `gap-ds-*` tokens. No slop tells. Story `Box` uses semantic tokens + `rounded-control` role token, not raw palette. |
| accessibility | ✓ | Non-interactive; `as` enables correct semantics (`ul`/`nav`/`section`), tested. Props pass through. No ARIA to own. Nothing to fault. |
| api-composability | gap | `forwardRef`+`displayName`, typed generic preserved, exported types — good. But: (a) `gap: number` is unbounded → `gap={20}`/`gap={-1}` indexes a missing key, yields `undefined`, class silently dropped, no error; (b) 4-value `direction` union (`vertical`/`horizontal`/`row`/`column`) is two ways to say one thing, not staged as `@deprecated`; (c) no `data-slot`/`asChild` hook for the most-composed primitive in the system. |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas/Changes and matches source. Minor: story `gap` control (stack.stories.tsx:16) omits `ds-02b`/`ds-05b`/`ds-07`+ that the type + `gapMap` accept — under-represents, doesn't misrepresent. |
| testing | ✓ | `describeConformance` + RTL covering direction (all 4), gap (token + number), align, justify, wrap, `as`. Strong for a layout primitive. No empty-children (`<Stack />`) assertion; no explicit axe play test (nothing interactive to test). |
| motion | N/A | Correctly no motion. Adding entrance/feedback motion to a pure layout wrapper would be wrong. |
| state-coverage | N/A | No interactive states (hover/active/focus/disabled/loading/error) — non-interactive primitive. |
| content-resilience | ✓ | `wrap` supported, children pass through, zero/one/many all handled. Flexbox main axis is `dir`-aware so horizontal stacks mirror in RTL without logical-property work. |
| theming-resilience | ✓ | No color/radius/shape dependence → survives brand accent-9 swap, `[data-shape]`, and light↔dark trivially. No elevation to invert. |
| system-cohesion | ✓ | Mirrors Text's polymorphic shape exactly (forwardRef impl + `StackComponent` cast); consumes DS spacing tokens. No bespoke drift. |
| craft | ✓ | Polymorphic type preserved across the export, `// @server-safe`, JIT-safe static gap map (the v0.1.1 fix). One small ding: unbounded numeric `gap` fails silently rather than at the type boundary. |
| perceived-performance | ✓ | Pure CSS flex, zero JS runtime, no layout shift, no jank. |
| market-benchmark | gap | vs Radix Themes `Flex` / Chakra `Stack`: our core API (direction/gap/align/justify/wrap/as) is at parity and cleaner than Chakra's prop sprawl. We LAG on responsive prop objects — both peers accept `direction={{ initial: 'column', md: 'row' }}` and responsive `gap`; ours is single-value only (doc punts to raw Tailwind `flex-col md:flex-row`). Chakra also offers a between-children separator. |
| cross-ds-adoption | gap | Concrete imports available (see below). |

## Top gaps (prioritized)
- [P1] api-composability — `gap: number` is unbounded; out-of-range silently drops the class with no error → tighten the numeric side of the public type to `0 | 1 | … | 13` (compile-error on bad input) and drop the `Record<string, string>` annotation so `as const` makes `gapMap` self-checking.
- [P1] market-benchmark — no responsive direction/gap; peers (Radix Themes, Chakra) accept responsive objects → consider a responsive-object form for `direction`/`gap`, or at minimum document the escape hatch more prominently. This is the only axis where we genuinely trail the market.
- [P2] api-composability — redundant 4-value `direction` union not staged as deprecation → pick one canonical pair public (`vertical`/`horizontal`), keep `row`/`column` accepted at runtime but mark `@deprecated` in the type + doc with a removal target.
- [P2] api-composability — no `data-slot="stack"` styling/test anchor → add it (one line, zero risk), consistent with other primitives. `asChild` is optional; `as` already covers the common case.
- [P3] testing/docs — add an empty-children render test; align story `gap` control options + doc with the full accepted token set (or trim `ds-02b`/`ds-05b` from `SpacingToken` if not intended for gap).

## What it does well
- Correctly a sibling primitive, not a Card re-roll — no surface, no drift; adding one would be wrong.
- Polymorphism done right: generic `T` preserved across the exported `StackComponent` cast so `<Stack as="ul">` typechecks against `<ul>` props; `forwardRef` + `displayName='Stack'`.
- Server-safe (`// @server-safe`), zero hydration cost, zero runtime, no CLS.
- JIT-safe static `gapMap` (static class strings, no dynamic `gap-${n}`) — the correct Tailwind pattern.
- Clean conformance + interaction test coverage and an accurate, terse doc with a changelog.

## Cross-DS adoption ideas
- **Radix Themes `Flex`** exposes every layout prop as a responsive object (`direction={{ initial: 'column', md: 'row' }}`, responsive `gap`/`align`/`justify`). Highest-value import — it's the one thing consumers currently drop to raw Tailwind for.
- **Chakra `Stack`** ships `StackSeparator` (a divider auto-inserted between children) — worth considering as an opt-in `separator` slot for lists/toolbars, though it edges toward doing too much for a pure primitive.
- **Radix Themes / Chakra `Spacer`** and `gap` parity across their layout family — our `gap-ds-*` map is already good; a matching `Spacer` primitive would round out the layout set.

## Rebuild note
None needed — the structure is sound and at bar for a zero-surface layout primitive; this is polish, in-place. Scope: (1) bound the numeric `gap` type and drop the `Record<string,string>` annotation so the map self-checks; (2) `@deprecate` the `row`/`column` aliases toward one canonical pair; (3) add `data-slot="stack"`; (4) evaluate a responsive-object form for `direction`/`gap` to close the only real market lag; (5) minor test/doc/story parity tidy. No structural change, no API break (all additive or aliased).
