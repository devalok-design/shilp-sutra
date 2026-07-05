# composed/content-card — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:4 P3:1

> Context: `ContentCard` is already `@deprecated` (content-card.tsx:58–63) and scheduled for removal next major in favor of `Card` + slots. Almost every finding below is the *exact* drift `Card`/`StatCard` were built to kill. The component still ships in the tarball today, so the tells are live. The cheapest "fix" for most of these is the deprecation path (delete it), but they are scored as real because the default rendering still exhibits them.

## Findings

### [P1][F5] Re-rolls the surface instead of composing `<Card>`
- **Category:** composability / structural-tell
- **Evidence:** content-card.tsx:7–31 — `cva('rounded-surface … transition-[…] …', { variants: { variant: { default: 'bg-surface-raised shadow-raised hover:shadow-raised-hover', outline: 'border border-surface-border …', ghost: '…' } } })`
- **Why:** This is the precise drift StatCard fixed — it hand-rolls surface, radius, shadow, and hover-lift that `Card` already owns as a single source of truth. Two surfaces will diverge over time (Card uses `shadow-raised-hover` only when `interactive`/`elevated`; ContentCard applies hover-lift to *every* `default` card unconditionally).
- **Fix:** Compose `<Card variant=… >` + `<CardHeader>/<CardContent>/<CardFooter>` internally, or (preferred) finish the deprecation and delete the component.

### [P1][F1] Bespoke corner/region props where slots belong
- **Category:** composability
- **Evidence:** content-card.tsx:52–56 — `header?: ReactNode; headerTitle?: string; headerActions?: ReactNode; footer?: ReactNode`
- **Why:** `headerActions` is the canonical `<CardAction>` slot anti-pattern (rubric F1 explicitly names `action`/`headerRight`); `headerTitle` is a `<CardTitle>` slot; `footer` is `<CardFooter>`. Card already exposes all of these as composable children. Injecting content into fixed regions via props is the bespoke-prop tell.
- **Fix:** Replace with the Card slot set (`CardHeader` + `CardTitle` + `CardAction` + `CardFooter`).

### [P1][F4] Mixed slot + prop layout model (and prop-shadowing logic)
- **Category:** composability
- **Evidence:** content-card.tsx:79 `const hasHeader = header || headerTitle || headerActions` and :97 `{header ?? (<>{headerTitle && …}{headerActions && …}</>)}`
- **Why:** Three overlapping ways to populate one region — `header` (escape hatch) silently wins over `headerTitle`/`headerActions` (tested at content-card.test.tsx:42). That's the F4 "fixed-order layout via props that should be slots" smell; the precedence is implicit, not type-enforced.
- **Fix:** Collapse to a single slot-based header (`CardHeader`), removing the prop-precedence branching entirely.

### [P1][G3] Non-canonical `padding` variant axis; no `size` axis
- **Category:** vocabulary / drift
- **Evidence:** content-card.tsx:19–24 `padding: { default, compact, spacious, none }`
- **Why:** Padding is not one of the canonical CVA axes (`variant`/`size`/`color`/`shape`). Card expresses the same intent through its `size` axis (`sm/md/lg`) driving the gap model. `padding` + the `getPadding`/`getContentPadding` switch (`:33–47`) re-implement that scale by hand, off-taxonomy.
- **Fix:** Map intent onto `size` (or delegate to Card's `size`); drop the standalone `padding` axis and the two switch helpers.

### [P1][G2] Hardcoded hex colors and raw px in the shipped story
- **Category:** drift / visual-tell
- **Evidence:** content-card.stories.tsx:142 `background: '#22c55e'`; :189 & :260 `background: '#D33163'`; :190 `color: '#fff'`; pervasive raw `fontSize: 13/12/11`, `borderRadius: 6/9999`, `padding: '4px 10px'` inline styles throughout
- **Why:** `#22c55e` (Tailwind green-500) and `#D33163` (raw brand pink literal) bypass the semantic token system the DS exists to enforce — the demos teach the wrong pattern to anyone reading them. `#D33163` should be `var(--color-accent-9)`/a Button; the green dot should be `success-9`. This is the "raw palette as brand" tell living in the canonical usage examples.
- **Fix:** Replace inline styles with DS components (`Button`, `Badge`, `Text`) and token vars; no raw hex/px in stories.

## Composability gaps
- **Does not compose `Card`** (F5): re-rolls `rounded-surface` + `bg-surface-raised` + `shadow-raised` + hover-lift that Card owns. This is the headline gap — it is a parallel, drift-prone copy of the exemplar.
- **Bespoke region props instead of slots** (F1/F4): `header`/`headerTitle`/`headerActions`/`footer` should be `CardHeader`/`CardTitle`/`CardAction`/`CardFooter`. `headerActions` in particular is the textbook `CardAction` case.
- **No `asChild`** (F2): minor — a card container is rarely polymorphed, so this is low-priority, but it cannot become a `<section>`/`<article>` without an extra wrapper. Card has the same gap, so not a regression vs the bar.
- **Header escape-hatch precedence is implicit** (F4): `header` overriding `headerTitle` is documented only by a test, not by types.

## Motion gaps
- **No reduced-motion concern, but also no entrance/feedback motion beyond a CSS hover transition.** content-card.tsx:8 `transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard` — this is a reasonable, token-based hover transition (M4 partially satisfied: hover feedback exists on all three variants via `hover:shadow-raised-hover` / `hover:border-…` / `hover:bg-…`).
- **[P2][M3-adjacent]** The hover transition is pure CSS with no `motion-reduce:` guard. CSS `transition` is generally tolerable under reduced-motion (it's not transform/translate motion), so this is low severity, but Card's equivalent hover-lift uses `whileHover={{ y: -3 }}` through framer's MotionConfig which *does* respect reduced-motion — another point of divergence from the exemplar.
- **No `will-change` cleanup**: content-card.tsx:8 `will-change-[box-shadow]` is set permanently on every card (not just during interaction), which is a minor perf smell (keeps a compositor layer alive). Card does not do this.

## Additional findings (P2/P3)

### [P2][V2] `outline` variant pairs a border with the base `transition-[…box-shadow]` but no shadow — clean; however `default` has no border (good). No actual double-edge.
- **Category:** visual-tell — **CLEAN**, noted to confirm V2 was checked: variants are correctly elevation-XOR-border.

### [P2][J] No per-component doc; story lacks `play`/interaction test
- **Category:** docs / state-coverage
- **Evidence:** no `docs/components/**/content-card.md` exists (Glob: no files); content-card.stories.tsx has zero `play` functions or a11y assertions
- **Why:** Below the bar — stories are visual-only, no interaction/axe coverage. (Mitigated: the unit IS covered by `describeConformance` at content-card.test.tsx:7–11, which gives baseline a11y/ref/className conformance.)
- **Fix:** If keeping, add interaction coverage; if deprecating, acceptable as-is.

### [P2][G4] Surface vocabulary diverges from family
- **Category:** drift / vocabulary
- **Evidence:** content-card.tsx:16 `outline: 'border border-surface-border'` vs Card's `outline: 'border border-surface-border-strong'` (card.tsx:30)
- **Why:** Two cards in the same family render the `outline` edge at different token strengths (`-border` vs `-border-strong`). Same axis name, different result — the G4 family-inconsistency tell.
- **Fix:** Align to `surface-border-strong` (or delegate to Card).

### [P2][docs] Deprecation JSDoc points to MIGRATION.md but ships no dev-time warning
- **Category:** docs
- **Evidence:** content-card.tsx:58–63 `@deprecated …` with no runtime `console.warn` / no `@deprecated` reflected in the exported `contentCardVariants`
- **Why:** Rubric J: `@deprecated` should pair with a dev warning + CHANGELOG. JSDoc-only deprecation is invisible at runtime; consumers on JS (no TS hints) get no signal.
- **Fix:** Add a dev-only `console.warn` once-guarded, or confirm CHANGELOG + lint rule covers it.

### [P3][I] `headerTitle` hardcodes an `<h3>` heading level
- **Category:** types / a11y
- **Evidence:** content-card.tsx:100 `<h3 className="text-ds-base font-semibold …">`
- **Why:** Forces document outline level h3 regardless of context — a card in an h1/h2 region or nested deeper can't adjust. Minor (the `header` escape hatch exists), but it's a baked structural assumption.
- **Fix:** Accept a heading-level prop or (better, via deprecation) use `CardTitle` which is a neutral `<div>`.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No `border-l-4`/colored stripe. Clean.
- **V3 gradient text / V6 blob-glass-glow / V7 rounded-everything:** none. Uses `rounded-surface` token, single radius. Clean.
- **V4 framework palette in the component source:** the *component* uses only semantic tokens (`surface-*`, `surface-border*`). Raw hex appears only in the story (flagged G2), not the shipped component.
- **V5 emoji-as-icon:** none in source, story, or test. Clean.
- **V2 double-edge:** variants are correctly elevation-XOR-border. Clean.
- **E1–E8 verbal tells:** JSDoc + story copy are plain and direct; no em-dash tic abuse beyond legitimate use, no AI-vocabulary, no meta-hedging. (Story copy "feel free to combine props creatively" does NOT appear here — that closer lives in Card/StatCard, not ContentCard.) Clean.
- **F6 controlled/uncontrolled:** N/A — no stateful value. Clean.
- **I types:** `forwardRef` + `displayName` present (content-card.tsx:64, :134); props typed via `VariantProps`; no `any`, no `React.FC`, no stringly-typed color. Clean (aside from the P3 h3 nit).
- **G1 surface level:** `bg-surface-raised` for a card-on-page is correct per the MANDATORY layering rule. Clean.
- **H state-coverage baseline:** `describeConformance` covers ref/className/a11y; hover state present on all variants. Adequate for a deprecated container.

## Polish plan (ordered steps to reach the finish bar)
1. **Decide the deprecation path first.** This component is already `@deprecated`. The honest fix for F5/F1/F4/G3/G4 is to **delete it next major** and point consumers at `Card` + slots. If that's confirmed, steps 2–4 are unnecessary and the remaining work is just the migration note.
2. **If kept interim:** reimplement as a thin composition over `<Card>` — `ContentCard` becomes `<Card variant size>` wrapping `<CardHeader>/<CardTitle>/<CardAction>/<CardContent>/<CardFooter>`, deleting the bespoke `cva`, the `getPadding`/`getContentPadding` switches, and the `will-change`/hover hand-roll. This closes F5, G2 (component), G4, M3-divergence, and the perf smell at once.
3. **Map `padding` → Card's `size` axis** (G3); drop the off-taxonomy `padding` variant.
4. **Add a dev-time deprecation `console.warn`** (once-guarded) so JS consumers get the signal (J).
5. **Fix the stories regardless of path** (G2): swap inline hex (`#22c55e`, `#D33163`, `#fff`) and raw px for DS components + token vars so the canonical examples stop teaching the anti-pattern; add at least one `play`/axe interaction.
