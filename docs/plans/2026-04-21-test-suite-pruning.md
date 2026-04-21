# Test Suite Pruning — Plan

**Date**: 2026-04-21
**Status**: draft (pending user review)
**Trigger**: 0.38.0 stable shipped; memory note `project_test_suite_pruning` flagged this as next after 0.37.
**Revision**: original draft was grounded in a memory note ("target 400-800 tests"). Rewritten 2026-04-21 after researching how leading DS libraries (Radix, React Aria, Mantine, Base UI, Chakra, Ark, shadcn) actually test, plus published philosophy from Primer, Storybook, Reshaped, and Kent C. Dodds. The count target was folklore, not a benchmark.

## Reframing — what the research changed

Three findings overturned the original approach:

1. **No primary source names a "target test count."** React Aria, Primer, Storybook, Sparkbox, Reshaped, Carbon — none publish ratios or numbers. "400-800 tests for 120 components" was speculation. A better target is behavioral: suite runtime, no assertion duplicating a Chromatic story, no test that breaks on a CVA rename.

2. **Kent C. Dodds' "test less" argument has a load-bearing carve-out.** From his testing-trophy essay: *"I maintain 100% coverage on my open-source libraries due to their reusable nature and higher risk of breaking consuming projects."* We are exactly that category. Before cutting any test, the question is: "does a consumer blow up if this regresses silently?" If yes → keep it.

3. **Our bloat is the *pattern*, not the count.** Our density per component (~10 tests across 234 files for ~120 components) is within band of Mantine (2-7 inline + shared helpers) and Chakra v2 (~7). What's out of band:
   - **Exhaustive CVA variant enumeration** — nobody does this. Mantine samples; Base UI tests once via `describeConformance`; Radix has no variants; Chakra tests 1-2 named variants.
   - **Separate `-a11y.test.tsx` files per component** (we have 45+) — everyone else inlines one `axe` call at the top of the main component test.
   - **Per-file `forwardRef` and `className` tests** — Mantine + Base UI have shared conformance helpers that run once per component, not per variant per component.
   - **32 duplicate file pairs** — accreted, nobody cleaned up.

## Industry ground truth (for reference when deciding what to keep)

Data from reading actual test files in each repo, not marketing docs.

| Library | Files | Per-component density | CVA variant matrix | a11y pattern | className/ref tests |
|---|---|---|---|---|---|
| shadcn/ui | 0 component tests | — | — | delegated to consumer | none |
| Radix Primitives | 20 files for 48 primitives (27 untested) | 3-44 tests, heavy keyboard/focus | N/A (headless) | 1 inline `axe` per component | ~0 |
| React Aria / Spectrum | 403 | 14-30 per component | N/A (headless) | role-queries + occasional `jest-axe` | 15 className tests in Button (className is a contract feature there) |
| Mantine | 587 | 2-7 inline + ~20 shared helper tests | sampled via `itSupportsVariant` (asserts `data-variant="x"` is set, doesn't enumerate) | shared `tests.axe([...])` helper — one call | via `itSupportsClassName`, `itSupportsRef` helpers — one call per component |
| Chakra v2 | 103 | ~7 per component | 1-2 named variants, no matrix | shared `testA11y()` helper | absent in Button |
| Base UI (MUI) | 275 | 4-177 (depth per prop, not per variant) | one assertion via `describeConformance` | `jest-axe` light + aria-attr assertions | `describeConformance` — one className, one ref, one spread assertion |
| Ark UI | 134 | 8-15 per component (state machines tested upstream in Zag) | N/A (headless) | `vitest-axe` first `it()` | absent |
| **shilp-sutra (ours)** | **234** | **~10 per component** | **exhaustive enumeration** | **split into 45 separate `-a11y.test.tsx` files** | **per-file, often per-variant** |

## Current state (audited 2026-04-21)

- 234 test files / 2,292 tests in `packages/core/src`
- Runtime: ~10 minutes local
- Distribution: `ui/` 148, `composed/` 55, `ai/` 15, `shell/` 8, `hooks/` 5, `motion/` 2, `tokens/` 1, root 1
- 32 components have duplicate paired files (colocated + `__tests__/`) — see list in Wave 4

## Targets (pattern-based, not count-based)

- **Runtime**: `pnpm test` under 2 minutes locally (from ~10min). Stretch: <60s.
- **Zero** RTL assertions that duplicate a Storybook story visible to Chromatic.
- **Zero** tests that would need to change when a CVA variant is renamed.
- **One** `axe` assertion per component (inline at top of main test), not one file.
- **One** conformance-helper call per component that covers className, ref, polymorphic, variant/size data-attrs — replacing N×M per-file assertions.
- A consumer-blast-radius mental model (per Kent Dodds): keep any test whose silent regression would break an external app.

No raw count target. If we hit the above, count falls out naturally — likely somewhere between 800 and 1400, but that's an output, not an input.

## Strategy — five waves, lowest risk first

Ordered so each wave is independently valuable and we can stop/reassess between.

### Wave 1 — Build a conformance helper (highest leverage, zero deletion)

Model: Mantine's `itSupportsSystemProps` + Base UI's `describeConformance`.

Create `packages/core/src/test-utils/conformance.ts`:

```ts
// rough sketch, not final API
export function describeConformance(
  Component: React.ElementType,
  options: {
    variants?: readonly string[]
    sizes?: readonly string[]
    polymorphic?: boolean
    refType?: 'HTMLElement' | 'SVGElement'
    requiredProps?: Record<string, unknown>
  }
) {
  describe('conformance', () => {
    it('forwards ref', () => { /* once, not per variant */ })
    it('merges className', () => { /* once */ })
    it('spreads HTML attrs', () => { /* once */ })
    if (options.variants) {
      it('accepts every declared variant without error', () => {
        // renders each with default props, asserts no throw + distinct classes
      })
    }
    if (options.sizes) {
      it('accepts every declared size without error', () => { /* same */ })
    }
    if (options.polymorphic) {
      it('honors asChild / as prop', () => { /* once */ })
    }
  })
}
```

Then in each existing component test:
```ts
describeConformance(Button, { variants: buttonVariants, sizes: ['xs','sm','md','lg'], polymorphic: true })
// + component-specific behavior tests below
```

**Outcome**: one helper replaces repeated conformance tests across ~80 components. Nothing is deleted yet — the helper runs alongside existing tests initially, and we use it to *verify equivalence* before deleting the originals in Waves 3-4.

**Risk**: Very low. Additive.

### Wave 2 — Inline the `-a11y.test.tsx` files (structural cleanup, 45 files removed)

45+ separate `-a11y.test.tsx` files is our invention. Every other library I audited inlines one `axe` assertion as the first `it()` in the main component test. Adopt that:

```ts
// ui/button.test.tsx
import { axe, toHaveNoViolations } from 'vitest-axe'
expect.extend({ toHaveNoViolations })

describe('Button', () => {
  it('passes axe audit', async () => {
    const { container } = render(<Button>hi</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
  // ... rest of behavior tests
})
```

For components with genuinely complex a11y state machines (Dialog, Combobox, Tree), we can keep multiple axe calls in-file — but no separate file.

**Outcome**: 45 files removed. Slight test-count drop (because many a11y files had 1-8 tests each — total ~200 tests, replaced by ~80 inlined axe calls + a handful of state-specific axe calls kept).

**Risk**: Low. Coverage is preserved; just relocated.

### Wave 3 — Delete CVA variant matrix enumeration (biggest per-pattern waste)

This is the pattern NO mature DS tests. Targets:

```ts
// DELETE THESE (representative)
it('applies solid variant for info', () => { ... })
it('applies solid variant for success', () => { ... })
it('applies solid variant for warning', () => { ... })
it('applies solid variant for error', () => { ... })
it('applies solid variant for neutral', () => { ... })
it('applies subtle variant', () => { ... })
it('applies outline variant', () => { ... })
// ... etc ×5 variants ×5 intents ×4 sizes
```

Replaced by: `describeConformance(Alert, { variants: ['solid','subtle','outline'] })` from Wave 1 — asserts each variant renders without error and produces distinct classes. Visual correctness moves to Storybook stories + Chromatic (when configured).

Where to look: components with heavy variant axes — Button (40 tests), Alert (23 in `__tests__/`), Badge (23), Card, Select (22), Tabs (13), Switch (15), Toggle (12).

**Outcome**: ~300-500 tests deleted. Covered by Wave 1 helper + stories.

**Risk**: Medium. Preconditions:
- Wave 1 helper is merged and green.
- Chromatic is **already active** (`.github/workflows/visual-review.yml`, fires on push to main, last 5 runs green). Acts as the visual backstop — catches any true visual break when we delete RTL variant assertions.

### Wave 4 — Merge the 32 duplicate file pairs

Every component below has BOTH a colocated `X.test.tsx` AND a `__tests__/X.test.tsx`. Merge into one.

**ui/ (18):** accordion, alert, alert-dialog, aspect-ratio, autocomplete, collapsible, color-input, container, context-menu, icon, label, link, menubar, navigation-menu, progress, segmented-control, stack, text

**composed/ (14):** activity-feed, avatar-group, command-palette, confirm-dialog, content-card, empty-state, loading-skeleton, member-picker, page-header, page-skeletons, priority-indicator, rich-text-editor, schedule-view, status-badge

Process per component:
1. Diff the two files; dedupe tests with same intent (usually the `__tests__/` one is newer and more thorough).
2. Merge surviving tests into the colocated file `X.test.tsx`.
3. Delete `__tests__/X.test.tsx`.

**Convention decision**: colocated wins. It's the majority pattern already, and `__tests__/` is what created the duplication problem. One convention, enforced. (Exception: files genuinely too big to colocate cleanly, like `data-table-integration.test.tsx` — case-by-case.)

**Outcome**: 32 files deleted, ~100-200 redundant tests dropped via dedupe.

**Risk**: Low. Merge is additive before delete.

### Wave 5 — Heavy-suite audit (judgment call, per-file)

The 8 heaviest suites don't match the industry pattern — they need hand review, not mechanical rules.

- `composed/date-picker/__tests__/date-picker.test.tsx` — 70 tests
- `ui/__tests__/data-table-integration.test.tsx` — 51 tests
- `composed/rich-chat-input.test.tsx` — 41 tests
- `ui/button.test.tsx` — 40 tests (should shrink dramatically after Waves 1+3)
- `ui/toast.test.tsx` — 38 tests
- `ui/combobox.test.tsx` — 35 tests
- `ai/__tests__/command-bar.test.tsx` — 33 tests
- `ui/tree-view/__tests__/tree-view.test.tsx` — 30 tests

Benchmark: Base UI's `ComboboxRoot.test.tsx` has 177 tests but it's a genuine 20-prop beast with controlled/uncontrolled, async loading, filtering, keyboard nav across all states. Our Combobox at 35 is probably *under*-tested on state-machine edges, not over. Don't cut just because the number is big — apply the Kent Dodds question.

Per test in these files, ask:
- Does this verify behavior a consumer relies on? → keep
- Is this a regression test from a shipped bug? → keep (gold)
- Is this testing an implementation detail (DOM structure, intermediate state)? → cut
- Is this already covered by `describeConformance`? → cut
- Is this duplicated in a Storybook story? → cut

**Outcome**: variable. Could be 100-300 tests trimmed depending on what's there.

**Risk**: Medium-high — this is the wave most likely to cut something load-bearing. Pair with user review.

## What we explicitly keep

Per Kent Dodds carve-out + industry consensus:

- **All compound state machine tests** (Dialog, Select, Combobox, DropdownMenu, Tabs, FormField context, DataTable sort/pagination). Radix tests these at 44 `it()` per component — we should too.
- **Keyboard navigation + focus management tests.** Radix's whole test suite is ~60% this. Highest-value category.
- **Controlled/uncontrolled pairs.** Every compound component tests both modes.
- **`@server-safe` annotation checks** — SSR correctness guarantee.
- **SSR smoke test** (`__tests__/ssr-render.test.tsx`).
- **Specific regression tests** referencing a shipped bug — grep for bug numbers or incident dates in test names.
- **Integration tests** (Button-in-ButtonGroup, Label-in-FormField).
- **At least one `axe` call per component** (inlined per Wave 2).

## What we explicitly cut

- CVA variant matrix enumeration.
- className-merging tests (tested by tailwind-merge upstream; covered once by conformance helper).
- forwardRef smoke tests (React guarantees; covered once by conformance helper).
- "renders without crashing" tests (SSR smoke covers this).
- DOM-structure snapshots (universal consensus: first thing to cut).
- Duplicate file pairs.
- Tests that reach into implementation details (specific class names, intermediate internal state).

## What we explicitly defer

<!-- Chromatic setup removed — already active, not a deferred item. -->

- **Playwright golden flows** — separate initiative, out of scope.
- **Storybook play-function conversion** — the Reshaped/Storybook-team argument says many of our RTL tests should become `play` functions. Worth considering post-prune, not during.
- **`packages/brand/` tests** — only 3 files, not worth touching.

## Execution sequence

1. User reviews this plan. Approve / course-correct on scope.
2. **Wave 1** — Build `describeConformance` helper. Adopt in 5-10 representative components as proof. Commit.
3. **Wave 2** — Inline a11y files. Commit (files deleted).
4. Verify green, runtime measurement.
5. **Wave 3** — Delete variant matrix enumeration (Button, Alert, Badge, Card, Select, Tabs, Switch, Toggle first). Commit. Re-measure.
6. **Wave 4** — Merge 32 duplicate pairs. Commit.
7. Verify green.
8. **Wave 5** — Heavy-suite hand audit. Per-file, user-reviewed. Multiple commits.
9. Final: update `CLAUDE.md` test references, update `memory/project_test_suite_pruning.md` with actuals, remove the "planned" status.

Each wave is its own PR-worthy commit. We can stop between any two.

## Decisions needed before Wave 1 starts

1. **Helper API shape.** Sketch above is Mantine-style (`itSupportsSystemProps({ variant: true, size: true })`) or Base UI-style (`describeConformance(Component, { ... })`). Base UI's explicit options object reads better for us — recommend that. Confirm or specify an alternative.

2. **Chromatic in parallel or later?** Recommend parallel — someone (or future session) configures `CHROMATIC_PROJECT_TOKEN` while we do Waves 1-4. Wave 3 doesn't strictly need it but benefits from it.

3. **Session cadence.** Recommend one wave per session, commit between. Wave 1 + Wave 2 could bundle (they're small); Waves 3/4/5 each stand alone.

## References

### Primary (philosophy)
- [React Aria Testing](https://react-aria.adobe.com/testing)
- [Primer React testing guide](https://github.com/primer/react/blob/main/contributor-docs/testing.md)
- [Storybook Component Testing](https://storybook.js.org/docs/writing-tests)
- [Reshaped — Testing design systems in 2025](https://reshaped.so/blog/testing-design-systems)
- [Sparkbox — DS component testing](https://sparkbox.com/foundry/design_system_component_testing_unit_testing_behavior_testing)
- [Kent C. Dodds — Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) (note the open-source-library carve-out)

### Code audits referenced for patterns
- Radix Primitives — `radix-ui/primitives` (20 test files, interaction-focused)
- React Aria / Spectrum — `adobe/react-spectrum` (403 files, pattern-testers)
- Mantine — `mantinedev/mantine` (shared `itSupportsSystemProps` helpers)
- Base UI — `mui/base-ui` (`describeConformance` pattern)
- Chakra v2 — `chakra-ui/chakra-ui` (lean API-surface testing)
- Ark UI — `chakra-ui/ark` (axe-first, 8 tests per Dialog)
- shadcn/ui — `shadcn-ui/ui` (zero component tests, delegated)

### Internal
- `memory/project_test_suite_pruning.md` — original spec (count target now deprecated in favor of pattern targets)
- `memory/feedback_test_discipline.md` — one test run at a time, foreground
- `scripts/pre-publish-audit.mjs` — publish gate that runs the suite
