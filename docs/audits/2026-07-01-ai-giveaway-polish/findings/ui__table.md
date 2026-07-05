# ui/table — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:2

Table is a thin, server-safe shadcn-lineage set of semantic `<table>` wrappers. It is clean of the loud AI visual tells (no accent rail, no gradient, no framework palette, no emoji, no rounded-everything). But it falls short of the Card bar in three ways: it ships **dead drift** (border-reset overrides for a border `TableRow` never paints, so rows have no separator by default), a **broken/ineffective hover token**, and it never adopted the **CVA + canonical axis** vocabulary the rest of the family uses (no `size`/density, no striped, no variant) — so it can't be tuned without `className` surgery. Tests/stories/docs are decent but miss the selected/hover/forced-colors/RTL state matrix.

## Findings

### [P1][G2] Dead border-reset overrides reference a border `TableRow` never sets
- **Category:** drift
- **Evidence:** table.tsx:34 `[&_tr:last-child]:border-0` (TableBody) and table.tsx:47 `[&>tr]:last:border-b-0` (TableFooter), but TableRow (table.tsx:58-67) sets only `transition-colors hover:bg-surface-raised data-[state=selected]:bg-accent-3` — **no `border-b`**.
- **Why:** The component carries last-child border-strip logic for a row separator that no row ever draws — dead CSS, and rows render with zero visual separation by default (the data-display table reads as an undifferentiated block). Confirmed DataTable doesn't add it either (data-table-body.tsx:108-115).
- **Fix:** Add the canonical row separator to `TableRow`: `border-b border-surface-border`. The two existing `:last-child:border-0` overrides then become live and correct. (Or, if borderless-by-default is the deliberate look, delete both dead overrides — but a separator is the expected finish for a data table.)

### [P1][H] Hover uses the surface color, not the hover token — no visible row hover in the common case
- **Category:** state-coverage
- **Evidence:** table.tsx:62 `hover:bg-surface-raised`. `--color-surface-raised` = `neutral-1` (light) / `neutral-2` (dark) — the **card/raised fill**, not a hover step. The hover step token is `--color-surface-raised-hover` (semantic.css:170).
- **Why:** A Table placed on a `bg-surface-2` card (the layering-rule default) hovers each row to `surface-raised`, which is at best a near-invisible delta and at worst lighter than the surface it sits on. Hover feedback (H / M4) effectively doesn't read.
- **Fix:** Use `hover:bg-surface-raised-hover` (or a dedicated `--color-table-row-hover`) so the hover step always sits one rung above whatever surface the table is on.

### [P1][G3] No CVA, no canonical axes — density/striping/variant only reachable via className
- **Category:** vocabulary
- **Evidence:** Whole file uses raw `cn(...)` with hardcoded `py-ds-03 px-ds-03` (table.tsx:78, 93) and `h-ds-md` (table.tsx:77). No `cva()`, no `size`/`density`/`striped`/`variant` prop anywhere; `TableProps = React.HTMLAttributes<HTMLTableElement>` (table.tsx:113).
- **Why:** Every sibling primitive (Card, Badge, Button) exposes canonical `size`/`variant` axes; Table is the odd one out. Consumers wanting a compact row, zebra striping, or a bordered variant must hand-roll `className` on every cell — the exact drift the token/axis vocabulary exists to prevent. Falls short of "one vocabulary" finish bar.
- **Fix:** Add a `density` axis (`compact|comfortable` → row `py-ds-02|ds-03`) and a `striped` boolean (odd-row `bg-surface-2`) via CVA on the root, threaded through context the way Card threads size. Keep them opt-in so existing call sites are unaffected.

### [P2][G2] Raw `color-mix` inline expression instead of a token for the footer fill
- **Category:** drift
- **Evidence:** table.tsx:47 `bg-[color-mix(in_srgb,var(--color-surface-raised)_50%,transparent)]`.
- **Why:** A bespoke one-off color computation baked into a class string — the kind of re-rolled value the token system replaces. Not a hard tell, but it's untokenized and won't track theme/forced-colors changes the way a named token would.
- **Fix:** Introduce `--color-table-footer` (or reuse `--color-surface-2`) and use `bg-surface-2` / `bg-table-footer`. Footers reading as a subtle 50% raised wash is a fine intent — just name it.

### [P2][H] Selected-row background has no forced-colors / contrast fallback and isn't a hover-compatible blend
- **Category:** state-coverage
- **Evidence:** table.tsx:62 `data-[state=selected]:bg-accent-3`. In `@media (forced-colors)` accent steps collapse; there's no `forced-colors:` treatment and no border/outline cue for selection.
- **Why:** Selection state (a documented capability — `data-[state=selected]` is wired) vanishes in forced-colors/high-contrast, where bg tints are ignored. The matrix calls for forced-colors coverage on selected/interactive states.
- **Fix:** Pair the tint with a forced-colors-safe cue, e.g. `forced-colors:outline forced-colors:outline-1` or `data-[state=selected]:[forced-color-adjust:none]` with a system color, and confirm hover+selected compose (selected should win).

### [P2][H] No focus-visible / keyboard affordance path for interactive rows
- **Category:** a11y
- **Evidence:** TableRow (table.tsx:55-67) ships `hover:` + `data-[state=selected]:` but no `focus-visible:` styling and no row-level keyboard semantics. The bare Table is presentational, but the selected/hover states imply rows can be acted on.
- **Why:** When a consumer makes rows clickable (the documented selection pattern), there's no focus ring vocabulary to inherit — they start from nothing. Card-bar components ship the focus story even when interactivity is opt-in.
- **Fix:** Provide an optional interactive treatment (e.g. a `data-[interactive]` or recipe class) that includes `focus-visible:ring` + `focus-visible:ring-offset`, mirroring the focus-ring utility used elsewhere.

### [P2][state-coverage] Stories/tests don't demonstrate hover, selected, footer, RTL, or forced-colors
- **Category:** state-coverage
- **Evidence:** table.stories.tsx has Default/Simple/Empty only; no `data-state="selected"` story, no hover demo, no RTL/dark/forced-colors. table.test.tsx (1-77) covers render/scope/cells/rows/className/axe but not selection or footer styling.
- **Why:** The selected-row capability and the footer wash ship untested and unshown — exactly where the dead-border bug above hid. The finish bar requires applicable states demonstrated in stories or tests.
- **Fix:** Add a `Selected` story (`<TableRow data-state="selected">`), confirm hover visually, and add a test asserting the row separator + footer fill render. (The separator test would have caught the G2 dead-override bug.)

### [P2][docs] Doc omits the `data-state="selected"` selection API and the row-hover behavior
- **Category:** docs
- **Evidence:** table.md lists compound structure + composability but never documents `data-state="selected"` → `bg-accent-3` or the hover behavior, despite both being shipped in source (table.tsx:62).
- **Why:** A real, shipped interaction contract is undocumented — consumers can't discover selection without reading source. Docs-parity gap.
- **Fix:** Add a "States" section documenting `data-state="selected"` and hover, with the Badge-in-cell example already present.

### [P3][I] `colSpan`/empty-state ergonomics rely on consumer; no empty-state helper
- **Category:** types
- **Evidence:** Empty story (table.stories.tsx:92-110) hand-rolls `<TableCell colSpan={3} className="h-24 text-center text-surface-fg-muted">`.
- **Why:** The empty state is a copy-paste recipe with a magic `h-24` and manual colSpan — fine for a bare primitive, but it's the kind of repeated boilerplate a small `TableEmpty`/`TableEmptyState` slot would absorb (DataTable already solves this; bare Table punts).
- **Fix:** Optional: ship a `TableEmpty` slot that auto-spans and centers, tokenizing the `h-24`. Low priority since DataTable covers the rich case.

### [P3][G2] `[&>[role=checkbox]]:translate-y-[2px]` magic-pixel nudge
- **Category:** drift
- **Evidence:** table.tsx:78, 93 `[&>[role=checkbox]]:translate-y-[2px]`.
- **Why:** A 2px arbitrary nudge to optically center checkboxes — a hardcoded magic value rather than a token, and a faint alignment hack carried over from the shadcn source.
- **Why minor:** Optical alignment fudges are legitimately sometimes pixel-level; just flagging it's untokenized.
- **Fix:** Acceptable as-is, or replace with `items-center` on the cell flex if the checkbox is the only child.

## Composability gaps
- **No `density`/`striped`/`variant` axes (F5-adjacent / G3):** unlike Card's CVA, Table can't be tuned without per-cell `className`. The most-requested table affordances (compact rows, zebra striping, bordered vs borderless) are absent.
- **No size context propagation:** Card threads `size` through `CardSizeContext` so slots stay in sync; Table has no equivalent, so cell padding can't follow a root density choice. If density is added it should propagate via context the same way.
- **No `TableEmpty` slot:** the empty state is a hand-rolled colSpan recipe (F1) rather than a composable slot; every consumer reinvents it.
- **No `asChild` (acceptable):** table elements are not polymorph targets; F2 not applicable.
- **Otherwise composes correctly:** pure semantic slot wrappers, no bespoke corner-props, no `title`/`action` props — structurally this is the right shape for a presentational table.

## Motion gaps
- **None expected and none present.** The file is `// @server-safe` (table.tsx:1) with zero framer-motion — correct for a static, server-renderable table. M1–M5 are N/A by design.
- **One latent gap:** `transition-colors` (table.tsx:62) animates the hover color but the hover token itself is wrong (see P1/H), so the only feedback motion the component has doesn't visibly fire in the common surface-2 case. Fixing the token makes the existing transition meaningful — no new motion needed.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the row separator (P1/G2):** add `border-b border-surface-border` to `TableRow`; the existing `:last-child:border-0` overrides in TableBody/TableFooter become live and correct. This is the single highest-impact fix — it removes dead code AND gives the table the separation it currently lacks.
2. **Fix the hover token (P1/H):** `hover:bg-surface-raised` → `hover:bg-surface-raised-hover` so hover reads on a surface-2 card.
3. **Add forced-colors + focus-visible coverage (P2/H):** selection outline fallback for forced-colors; an optional interactive-row focus ring.
4. **Adopt CVA axes (P1/G3):** `density` (compact/comfortable) + `striped`, propagated via a `TableSizeContext` mirroring Card. Keep opt-in, default to today's look.
5. **Tokenize the footer fill (P2/G2):** replace the inline `color-mix` with `bg-surface-2` or a named `--color-table-footer`.
6. **Backfill stories/tests/docs (P2):** Selected story, separator + footer assertions in the test (would have caught step 1's bug), document `data-state="selected"`.
7. **Optional (P3):** `TableEmpty` slot to absorb the colSpan/`h-24` boilerplate.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No left/top colored stripe anywhere.
- **V2 double edge:** clean — rows use a border for separation (once fixed), surfaces use no shadow; no border+shadow on one element.
- **V3 gradient text / V4 framework palette / V5 emoji / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** all clean. Uses semantic tokens (`text-surface-fg-muted`, `bg-accent-3`), no raw indigo/violet/slate, no emoji in source/story/doc, no decorative rounding (a `<table>` carries no radius), no New/Beta pills.
- **V9 fonts:** uses `text-ds-md` token (table.tsx:13), no hardcoded Inter/Geist.
- **E1–E8 verbal:** doc + stories + JSDoc are clean — no em-dash tic as connector, no AI vocabulary, no meta-hedging, no chatbot artifacts. Sample data ("Mudit Kumar / Priya Sharma / Ravi Patel", invoice rows) is concrete, not slop.
- **I types:** correct `forwardRef` + `displayName` on all 8 wrappers, specific element types (`HTMLTableCellElement`, `HTMLTableSectionElement`), exported `TableProps`/`TableRowProps`/`TableCellProps`, no `any`, no `React.FC`, no stringly enums.
- **G1 surface:** correct — Table sets no surface of its own (inherits consumer surface), so it's not in the SURFACE1 conversation; footer wash is a legitimate subtle fill.
- **a11y baseline:** `scope="col"` on headers (table.tsx:75), `caption-bottom` caption, axe-clean test (table.test.tsx:73). Semantic HTML throughout.
