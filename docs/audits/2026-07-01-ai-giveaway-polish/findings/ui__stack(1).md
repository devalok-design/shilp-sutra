# ui/stack — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:2 P3:2

Stack is a zero-surface polymorphic flex primitive (`flex` + direction + gap + align + justify + wrap). It ships no color, no border, no shadow, no background, no font, no motion — so the entire visual-tell battery (V1–V15) is structurally inapplicable, and there is nothing to "vibe-code" a look onto. It mirrors the Text polymorphic pattern (`as` + `forwardRef` + `StackComponent` cast), is server-safe, has a clean conformance test, a full story set, and an accurate doc. The gaps are vocabulary bloat (redundant direction aliases), a couple of robustness/type nits, and a missing `data-slot`/asChild affordance — all minor.

## Findings

### [P1][G3] Redundant direction-axis aliases bloat the vocabulary
- **Category:** vocabulary
- **Evidence:** stack.tsx:25 — `direction?: 'vertical' | 'horizontal' | 'row' | 'column'`; doc stack.md:35 — `"row" and "column" are aliases for "horizontal" and "vertical"`
- **Why:** Four values for a two-state axis means two ways to say the same thing — every call site / codegen / Storybook control now has to pick, and two app files can diverge on style for identical layout. The aliases are documented as intentional, so this is a deliberate-but-questionable choice, not a hard tell; but it is exactly the kind of "more surface than the concept needs" drift the unified-vocabulary bar discourages.
- **Fix:** Pick one canonical pair (`vertical`/`horizontal` reads best for a Stack) as the public type. If `row`/`column` must stay for migration, keep them accepted at runtime but mark `@deprecated` in the type union and the doc, with a removal target — don't present four equal options.

### [P2][types] `gapMap` typed `Record<string, string>` defeats key checking and silently no-ops out-of-range gaps
- **Category:** types
- **Evidence:** stack.tsx:51 — `const gapMap: Record<string, string> = { ... } as const`; consumed at stack.tsx:101 — `gap != null && gapMap[String(gap)]`
- **Why:** `gap` accepts `SpacingToken | number`, but `number` is unbounded — `gap={20}` or `gap={-1}` indexes a missing key, yields `undefined`, and the cn() entry is silently dropped (no gap class, no error). The `Record<string, string>` annotation also discards the literal-key information the `as const` would otherwise give, so TS can't catch a typo'd key inside the file.
- **Fix:** Narrow the numeric side of the public `gap` type to the supported range (`0 | 1 | … | 13`) so out-of-range is a compile error, and drop the `Record<string, string>` annotation (let `as const` infer) so the map is its own source of truth. Alternatively, keep `number` but document that only 0–13 resolve.

### [P2][F2] No `data-slot` / styling hook and no `asChild` for a foundational layout primitive
- **Category:** composability
- **Evidence:** stack.tsx:93–109 — renders bare `React.createElement(Component, { ref, className, ...props })`; no `data-slot`, no Slot/asChild path.
- **Why:** Stack covers element polymorphism via `as` (good, and correct for a non-Radix primitive — `asChild` is not strictly required here). But it offers no stable hook for consumers/parents to target a Stack in descendant selectors, and no way to merge Stack's flex behavior onto an existing child element the way `asChild` would. For the single most-composed primitive in the system this is a real (if low-severity) polish gap. Card/StatCard get their composition story from slots; Stack's only lever is `as`.
- **Fix:** Add `data-slot="stack"` to the rendered element (cheap, zero-risk, gives a styling/test anchor consistent with other primitives). Consider an `asChild` escape hatch via the vendored Slot only if a concrete need appears — `as` already covers the common case, so this is lower priority than `data-slot`.

### [P3][state-coverage] Empty-children / zero-child behavior not exercised in tests
- **Category:** state-coverage
- **Evidence:** stack.test.tsx — covers direction/gap/align/justify/wrap/as but never renders `<Stack />` with no children.
- **Why:** The rubric calls out "empty state that crashes on zero children." Stack won't crash (children is optional and just passes through), but the guarantee is untested. Non-interactive primitive, so this is a nicety, not a gap that bites.
- **Fix:** Add one test asserting `<Stack data-testid="s" />` renders an empty flex `div` without throwing.

### [P3][docs] Doc Defaults section omits the implicit `direction='vertical'` rationale and the number→token edge
- **Category:** docs
- **Evidence:** stack.md:30 — `Raw numbers map 1:1 to the ds-0N token set`; source supports 0–13 but the doc/story `gap` control list (stack.stories.tsx:16) only exposes a subset (`ds-01..ds-06, ds-08`) and omits `ds-02b`/`ds-05b` half-steps that the type and `gapMap` (stack.tsx:68,72) accept.
- **Why:** Minor docs/story parity gap — the half-step tokens (`ds-02b`, `ds-05b`) are real in the source and absent from both the Storybook control options and the doc prose. Source wins; the doc/story just under-represent the API.
- **Fix:** Either add `ds-02b`/`ds-05b` to the Storybook `gap` options and a one-line doc note, or (if half-steps aren't meant for `gap`) trim them from the accepted `SpacingToken`/`gapMap` so type and docs agree.

## Composability gaps
- No `data-slot="stack"` styling/test hook on the rendered element (F2-adjacent). Cheapest single win.
- Polymorphism is `as`-only — adequate for a layout primitive, but there is no `asChild` to merge Stack's flex layout onto a consumer-provided element. Acceptable by design; flagged only for completeness.
- Direction expressed as a 4-value union (vertical/horizontal/row/column) rather than a single canonical pair — splits the call-site vocabulary (G3 above).

## Motion gaps
- None that are defects. Stack is a static, non-interactive layout primitive with no surface; M1–M5 are not applicable — there is no entrance/exit/feedback motion to own, and adding any would be wrong for a pure layout wrapper. (Contrast Card/StatCard, which legitimately own hover-lift and value-reveal motion because they are content surfaces.)

## Polish plan (ordered steps to reach the finish bar)
1. Add `data-slot="stack"` to the rendered element (one line, zero-risk styling/test anchor).
2. Resolve the direction-alias bloat: keep one canonical pair public; `@deprecate` `row`/`column` in the type + doc with a removal target, or commit to them and document why both exist.
3. Tighten the `gap` numeric type to the supported 0–13 range and drop the `Record<string, string>` annotation so the `gapMap` keys are self-checked; decide whether `ds-02b`/`ds-05b` are valid `gap` values and make type, `gapMap`, story controls, and doc all agree.
4. Add an empty-children render test.

## Clean (rubric dims that pass)
- **V1–V8 (visual tells):** N/A by construction — no surface, border, shadow, color, gradient, radius, pill, or emoji anywhere in source/story/doc. Story `Box` helper uses semantic tokens (`bg-surface-raised`, `border-surface-border-strong`), not raw palette.
- **V9 (font):** No hardcoded font; primitive sets no type. Story uses `text-ds-*` tokens.
- **E1–E8 (verbal):** Doc and JSDoc are terse and direct — no em-dash tic as connector, no AI vocabulary, no hedging, no tricolon padding, no over-structuring.
- **F5 (re-rolls base):** Correctly does NOT compose Card — it's a sibling primitive, not a surface; re-rolling would be wrong. Mirrors the Text polymorphic pattern exactly (forwardRef impl + `StackComponent` cast), so no drift from the established primitive shape.
- **F6 (controlled/uncontrolled):** N/A — no stateful value.
- **G1/G2/G4 (surface/token drift):** No surface to mis-level; uses `gap-ds-*` tokens via JIT-safe static map (the v0.1.1 fix), no hardcoded px/hex/dead-TW4-syntax.
- **G5 (soft-vs-outline):** N/A — no variant.
- **H (a11y/state):** Non-interactive; `as` enables correct semantic elements (`ul`/`nav`/`section`), tested. `forwardRef` + `displayName='Stack'` present (stack.tsx:112). Conformance test wired (stack.test.tsx:7).
- **I (types):** No `any`, no `React.FC`, no stringly enums; polymorphic generic preserved across the export; `StackProps`/`SpacingToken` exported. (One nit on `gapMap` typing logged as P2.)
- **J (docs parity):** Doc prop table matches source; story exists (publish gate satisfied); changelog section present.
