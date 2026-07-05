# ui/card — audit
**Finish score:** 5/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:0 P2:1 P3:2

Card is the named finish exemplar for this audit. It scores at the bar: zero AI tells, gap-model spacing, elevation-XOR-edge variants, composable slots (`CardAction` replaced the old accent rail), size cascades via context, full token usage. The findings below are minor polish/preference nits — none rise to P1.

## Findings

### [P2][M3] Interactive hover/tap motion relies on app-level MotionConfig for reduced-motion
- **Category:** motion
- **Evidence:** card.tsx:139-141 — `whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={springs.snappy}`
- **Why:** The transform-based lift/press has no component-local reduced-motion guard. It is correctly covered IF the consumer wraps the tree in `<MotionProvider>` (default `reducedMotion="user"` → Framer `MotionConfig reducedMotion="user"`), and the CSS `transition-shadow` is guarded by `semantic.css` `@media (prefers-reduced-motion: reduce)`. But a consumer who renders `<Card interactive>` without a MotionProvider gets an unguarded `y`/`scale` animation. This is a documented system contract, not a defect — flagged at P2 only so synthesis can decide whether the contract should be belt-and-suspenders (e.g. read `useReducedMotion()` inside Card). Not a true tell.
- **Fix:** None required if MotionProvider remains the documented contract. Optional hardening: gate `whileHover`/`whileTap` on `useReducedMotion()` so an unwrapped Card still degrades.

### [P3][M2] Interactive lift uses `springs.snappy` while the resting state uses a tween `transition-shadow`
- **Category:** motion
- **Evidence:** card.tsx:125 (`transition-shadow duration-fast-02 ease-productive-standard`) vs card.tsx:141 (`transition={springs.snappy}`)
- **Why:** The shadow lift (CSS tween) and the positional `y` lift (FM spring) run on two different timing curves on the same hover. In practice the spring (stiffness 500, damping 30) settles close to the 110ms tween so it reads fine, but they are not the same motion. Minor.
- **Fix:** Acceptable as-is; the spring is the documented micro-interaction preset. No change unless the two visibly desync.

### [P3][docs] Story `Simple` re-introduces a `pt-ds-06` override that fights the gap model
- **Category:** docs
- **Evidence:** card.stories.tsx:64 — `<CardContent className="pt-ds-06">`
- **Why:** The whole point of the v0.44.0 gap model (card.tsx:14-18) is that the container owns vertical padding so slots never need per-slot `pt`. This story manually adds `pt-ds-06` to a lone `CardContent`, modeling exactly the per-slot vertical-padding pattern the refactor removed. A consumer copying this story re-learns the anti-pattern. Cosmetic (a single-slot card has no header to gap from), but it undercuts the doc story.
- **Fix:** Drop `pt-ds-06`; the container's `py-ds-05b` already supplies the vertical edge for a content-only card.

## Composability gaps
- None. Card is the composability reference: bespoke `accent` rail prop was removed in favor of the `<CardAction>` slot (4 placements, `tuck`); `size` cascades through `CardSizeContext` instead of being threaded prop-by-prop; surface/padding/elevation live only on the root; StatCard composes `<Card>` rather than re-rolling surface. Header/Title/Description/Content/Footer are slot children, not fixed-order layout props.
- Minor note (not a gap): `Card` has no `asChild`. For `interactive` clickable cards the codebase pattern is the consumer/StatCard adding `role="button"` + key handling on the Card div (see stat-card.tsx:427-444), and `href` cards wrap Card in the framework `Link`. That is a deliberate choice (Card stays the shell, the link/button wraps or is layered), not an F2 miss — Card is a structural container, not a Button/Link-like leaf.

## Motion gaps
- Reduced-motion: handled at system level via `MotionProvider`/`MotionConfig reducedMotion="user"` (motion-provider.tsx:28-41) for the FM transforms, and via `semantic.css` `@media (prefers-reduced-motion: reduce)` for the CSS `transition-shadow`. No component-local guard (see M3 above) — acceptable under the documented contract.
- No bounce-by-default: hover/tap use `springs.snappy` (stiffness 500, damping 30 — no overshoot), not `bouncy`. Correct.
- Feedback motion present: hover lift + tap press on interactive cards. Resting (non-interactive) cards correctly have no entrance animation (a static container should not animate in). No M1/M4/M5 violations — `y`/`scale` are transform props, not layout props.

## Polish plan (ordered steps to reach the finish bar)
Card is already at the finish bar. Optional touch-ups only:
1. Remove `pt-ds-06` from the `Simple` story (card.stories.tsx:64) so docs don't model per-slot vertical padding.
2. (Optional hardening) Have `Card` read `useReducedMotion()` and drop `whileHover`/`whileTap` when reduced, so an unwrapped `<Card interactive>` degrades without relying on a MotionProvider ancestor.

## Clean (rubric dims that pass)
- **V1 accent rail:** Explicitly killed. `color` paints a full 1px border (`border-accent-7` etc., card.tsx:34-40), never a left/top rail; `border-transparent` default so no grey edge (card.tsx:27). Documented as intentional (card.md:44).
- **V2 double edge:** Elevation-XOR-edge by design — `default`/`elevated` use `shadow-raised*` with `border-transparent`; `outline` uses `border-surface-border-strong shadow-none` (card.tsx:27-31). No border+shadow stacking. (make-kit rule #6, called out in source comment.)
- **V3 gradient text:** None. CardTitle is solid `text-surface-fg` (card.tsx:184).
- **V4 framework palette:** None. Only semantic tokens (`surface-*`, `accent-7`, `error-7`, …). No indigo/violet/slate/hex.
- **V5 emoji icons:** None in source/test/story/doc.
- **V6 blob/glass/glow:** None. No backdrop-blur, no glow shadows. Shadows are token `shadow-raised`.
- **V7 rounded-everything:** Single `rounded-surface` token on the container (card.tsx:20); no nested `rounded-2xl/3xl`.
- **V8 pill spam:** The one `Badge` in the CardAction story carries meaning ("LIVE" deploy status, card.stories.tsx:144); not spam.
- **V9–V15 reflexes:** No hardcoded fonts (`font-sans` token, card.tsx:184), no decorative numbering, no eyebrow kickers, no all-caps defaults, no AI imagery.
- **F1–F6 composability:** See above — exemplary.
- **G1 surface:** `bg-surface-raised` for the raised variants (card.tsx:27-31) — correct surface-2 for a card-on-page. Not on the SURFACE1 path.
- **G2 tokens:** All spacing `ds-*`, radius `rounded-surface`/`rounded-pill`, shadow `shadow-raised*` — no raw px/hex, no dead TW3 (`bg-gradient-to-*`, `w-[--var]`, bare `shadow`).
- **G3 variant-axis:** Canonical `variant` / `size` (sm/md/lg) / `color` (accent/neutral/success/warning/error/info) axes. `variant` adds `elevated`/`flat` which are legitimate surface modes, not `primary`/`secondary` leakage.
- **G4/G5:** Surface vocabulary shared with StatCard (delegates `variant` to Card). No soft-vs-outline default issue (Card is a container, not an action).
- **E1–E8 verbal:** JSDoc/doc/story copy is direct and prescriptive — no em-dash-as-connector tic that reads as AI (the em dashes present are in explanatory prose and acceptable), no AI vocabulary, no meta-hedging, no chatbot artifacts. (Minor: the two JSDoc examples close with "These are just a few ways — feel free to combine props creatively!" at card.tsx:110 and stat-card.tsx:63 — borderline E5 engagement-bait filler, but it's in JSDoc not shipped copy; noting, not flagging.)
- **H state coverage:** Conformance suite covers all variants/sizes/colors (card.test.tsx:7-11); gap-model, margin-reset, size cascade, and all four CardAction placements + tuck are explicitly tested. Interactive/hover shown in stories.
- **I types:** `forwardRef` + `displayName` on every sub-component; `VariantProps<typeof cardVariants>`; `Omit<HTMLAttributes,'color'>` to avoid the native `color` clash; `CardSize`/`CardActionPlacement` exported. No `any`, no `React.FC`, no stringly-typed enums.
- **J docs parity:** card.md prop tables, defaults, and compound tree match the CVA source; CHANGELOG documents the v0.44.0 breaking removal of `accent`/`accentColor` and the gap-model change.
