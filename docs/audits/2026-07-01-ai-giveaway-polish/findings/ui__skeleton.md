# ui/skeleton — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:2

Skeleton is genuinely clean on the headline AI tells: no accent rail, no gradient text, no
indigo/violet palette, no emoji, no blob/glass, no pill spam. Tokens (`bg-skeleton-base`,
`bg-skeleton-shimmer`) are real semantic tokens (`semantic.css:290-291`, with dark +
forced-colors overrides at `:605-606` and `:785-786`), and the shimmer is a legit gradient
(explicitly exempted by the rubric). Reduced-motion is respected. The gap to the Card bar is
**structural**: seven sub-components each re-roll the base surface/radius/animation instead of
composing `Skeleton` (the StatCard-vs-Card drift), there are two divergent shimmer recipes, and
the primitive leans on raw Tailwind dimensions instead of DS spacing tokens.

## Findings

### [P1][F5] Sub-components re-roll the base instead of composing `Skeleton`
- **Category:** composability
- **Evidence:** skeleton.tsx:109 `'bg-skeleton-base rounded-pill'` (SkeletonAvatar); :208 `'bg-skeleton-base rounded-control'` (SkeletonButton); :242 `'w-full bg-skeleton-base rounded-control …'` (SkeletonInput); :282 `'flex-1 bg-skeleton-base rounded-t-control-inner'` (SkeletonChart bar); :311 `'bg-skeleton-base rounded-control …'` (SkeletonImage); :168 `'h-3.5 rounded-control-inner bg-skeleton-base'` (SkeletonText line).
- **Why:** This is exactly the drift StatCard fixed for Card — each sub-component re-implements the surface fill, radius, and animation glue by hand. A change to the base recipe (e.g. base color token, a new animation) won't propagate; six call sites must be kept in sync manually.
- **Fix:** Have every sub-component render `<Skeleton variant=… animation=…>` (or a shared internal `<SkeletonBase>`) for its fill/radius/animation, and only add its own sizing. The base already exposes `circle`/`rectangle`/`text` variants that map to most of these.

### [P1][G2] Two divergent shimmer recipes (single-source-of-truth drift)
- **Category:** drift
- **Evidence:** skeleton.tsx:17 CVA shimmer = `… animate-skeleton-shimmer [background-attachment:fixed] motion-reduce:animate-none`; skeleton.tsx:81 `animationClasses.shimmer` = same string **minus `[background-attachment:fixed]`**.
- **Why:** The base `Skeleton` shimmer and every sub-component's shimmer are defined twice with a real behavioral difference (fixed background attachment changes how the sweep tracks during scroll). They will drift further over time — this is the symptom F5 causes.
- **Fix:** Delete `animationClasses`; route all animation through the CVA (consequence of the F5 fix). If a standalone map must remain, make the two strings byte-identical and add a test asserting parity.

### [P1][G2] Raw Tailwind spacing/size utilities instead of DS spacing tokens
- **Category:** drift
- **Evidence:** skeleton.tsx:92-95 avatar sizes `'h-8 w-8' | 'h-10 w-10' | 'h-12 w-12' | 'h-16 w-16'`; :168 `'h-3.5'` text line; :191-192 button widths `'w-24' | 'w-28' | 'w-32'`; :259 `BAR_HEIGHTS` raw percentages; :320-323 inline SVG `width="24" height="24"`. Button/Input *heights* correctly use `h-ds-sm/md/lg` (:184-188, :225-229), making the avatar/text raw values inconsistent within the same file.
- **Why:** The repo namespaces spacing as `--spacing-ds-*` (CLAUDE.md). SkeletonButton/Input already use `h-ds-*`; SkeletonAvatar/SkeletonText use bare `h-10`/`h-3.5`, so a token change (e.g. avatar size scale) won't track and the file mixes two vocabularies.
- **Fix:** Move avatar sizes and the text line height onto `--spacing-ds-*`-backed utilities (e.g. `h-ds-md w-ds-md`) to match the button/input pattern; or document why avatar deliberately uses a raw scale.

### [P2][V2] SkeletonInput ships a border AND a fill (double-edge)
- **Category:** visual-tell
- **Evidence:** skeleton.tsx:242 `'w-full bg-skeleton-base rounded-control border border-skeleton-base/30 …'`
- **Why:** A 1px border on top of a filled surface is the double-edge reflex (V2). It's the only sub-component with a border; the real Input's edge is conveyed by the skeleton's fill alone in every sibling. The `/30` opacity of a near-identical token makes the border nearly invisible anyway — cost with no payoff.
- **Fix:** Drop the `border border-skeleton-base/30`; let the fill be the shape, consistent with SkeletonButton.

### [P2][V5] Inline hand-rolled SVG icon instead of the Icon API
- **Category:** structural-tell
- **Evidence:** skeleton.tsx:319-335 — a literal `<svg>…<rect/><circle/><polyline/></svg>` image-placeholder glyph.
- **Why:** The DS has an Icon API over lucide/tabler (used in StatCard via `@tabler/icons-react`). A bespoke inline SVG is the "AI redraws an icon by hand" tell and bypasses the icon sizing/color system. Note the file is `// @server-safe`, so it can't import the framer-motion-bound `Icon`, but it could use a bare lucide/tabler glyph component.
- **Fix:** Replace the inline SVG with `IconPhoto` (tabler) or the lucide equivalent rendered directly (no motion), sized via a `--spacing-ds-*` class.

### [P2][H] Sub-components are not `aria-hidden` and rely on an optional wrapper
- **Category:** a11y
- **Evidence:** Base `Skeleton` sets `aria-hidden="true"` (skeleton.tsx:64); SkeletonAvatar/Text/Button/Input/Chart/Image (:103-340) set **no** ARIA. `SkeletonGroup` (:351) provides `role="status"`/`aria-busy`, but it is optional.
- **Why:** Used standalone (the stories frequently do — e.g. `AvatarSizes`, `ButtonSizes`, `FormSkeleton` has no Group), these render as empty `<div>`s exposed to AT with no name and no busy semantics. The base primitive hides itself; the sub-components don't, so behavior is inconsistent depending on which one you grab.
- **Fix:** Add `aria-hidden="true"` to each sub-component's root (their content is decorative), keeping `SkeletonGroup` as the live-region wrapper for the announce.
- **Note:** existing test only axe-checks the SkeletonGroup-wrapped case (skeleton.test.tsx:136), so this gap is untested.

### [P2][M2] No animation differentiation; uniform infinite loop only
- **Category:** motion
- **Evidence:** Only `pulse` / `shimmer` / `none`; no entrance/exit. Card/StatCard use the motion system (`springs`, `tweens`, `motionProps`) for mount transitions.
- **Why:** Minor for a placeholder (a skeleton is inherently a steady-state loop, so this is largely acceptable), but there is no exit/crossfade when real content swaps in — the rubric's "missing feedback motion / no enter-exit differentiation" applies at the boundary. This is a polish gap, not a tell.
- **Fix:** Optional — expose a fade-out on unmount via `AnimatePresence` at the consumer boundary, or document that the swap is the consumer's job. Low priority.

### [P2][docs] No per-component doc / prop table
- **Category:** docs
- **Evidence:** No `docs/components/**/skeleton.md` exists (none of the components have per-component docs in that path). JSDoc on `SkeletonProps` (:27-55) covers the base only; the seven sub-components' props (`lines`, `lastLineWidth`, `spacing`, `bars`, `width="icon"`, etc.) have only terse inline comments.
- **Why:** The base is well-documented; the sub-components (which are the bulk of the surface) are under-documented relative to the Card/StatCard JSDoc bar. Not a Skeleton-specific miss since the docs/components path is empty repo-wide, hence P2.
- **Fix:** Add JSDoc blocks to `SkeletonText`/`SkeletonChart`/`SkeletonButton`/`SkeletonImage` matching the base's depth (variants, examples).

### [P3][G3] `variant` axis is shape-named, off the canonical taxonomy
- **Category:** vocabulary
- **Evidence:** skeleton.tsx:9-13 `variant: rectangle | circle | text`.
- **Why:** Canonical `variant` is `solid/soft/outline/ghost/link` (rubric G3). For a non-interactive primitive a shape axis is defensible (there's no fill-style concept), but it diverges from the family vocabulary and a future reader may expect `shape` to be the axis name for shapes.
- **Fix:** Consider renaming the axis to `shape` (reserving `variant` for the canonical meaning), or leave as-is and document the intentional deviation. Low priority — behavior is correct.

### [P3][G2] Stories use arbitrary px dimensions
- **Category:** drift
- **Evidence:** skeleton.stories.tsx:32 `h-4 w-[250px]`, :92 `h-[125px] … rounded-overlay-lg`, plus many `w-[NNNpx]`.
- **Why:** Demo-only sizing on the consumer side, not a shipped default — flagged at P3 per the rubric's "flag defaults, not consumer opt-ins." Arbitrary px in the showcase still models a non-token habit to readers.
- **Fix:** Where convenient, use `--spacing-ds-*` widths in the canonical stories so examples model token usage.

## Composability gaps
- Seven sub-components (`SkeletonAvatar/Text/Button/Input/Chart/Image`) re-roll `bg-skeleton-base` + radius + animation instead of composing the base `Skeleton` — the F5 drift StatCard solved by composing Card. (skeleton.tsx:109, 168, 208, 242, 282, 311)
- Two definitions of the shimmer recipe (CVA `:17` vs helper `:81`) that already differ by `[background-attachment:fixed]`.
- No `asChild` — acceptable here; a skeleton is always a plain `div`, no polymorphism need.
- No bespoke-prop-should-be-slot issue; sub-components are reasonable composition units (not corner-props).

## Motion gaps
- No reduced-motion gap: both `pulse` and `shimmer` carry `motion-reduce:animate-none` (skeleton.tsx:16-17, 81). Clean.
- No bounce/elastic, no animating layout props — clean (M1, M5 pass).
- M2: only a single infinite loop; no entrance/exit or content-swap crossfade at the real-content boundary. Minor polish gap, inherent to placeholders.

## Polish plan (ordered steps to reach the finish bar)
1. **Compose the base.** Introduce a shared `SkeletonBase` (or render `<Skeleton>`) and rebuild Avatar/Text/Button/Input/Chart/Image on top of it, so fill + radius + animation have one source. Removes F5 and the shimmer drift in one move.
2. **Delete `animationClasses`** once (1) lands; route all animation through the CVA. Add a parity test if any standalone map survives.
3. **Drop the SkeletonInput border** (V2) — fill is the shape.
4. **Tokenize raw dimensions** — move avatar sizes and text-line height onto `--spacing-ds-*`-backed utilities to match the button/input height pattern already in the file.
5. **Add `aria-hidden="true"`** to every sub-component root; keep `SkeletonGroup` as the live region. Add an axe test for a standalone sub-component.
6. **Replace the inline image SVG** with a tabler/lucide glyph (no-motion, server-safe), sized via a token class.
7. (Optional) Rename `variant`→`shape` or document the deviation; deepen sub-component JSDoc to the Card bar.

## Clean (rubric dims that pass)
- **V1** no accent rail. **V3** no gradient text. **V4** no indigo/violet/slate palette — neutral tokens only. **V6** no blob/glass/glow. **V7** one radius vocabulary (`rounded-control`/`-inner`/`-pill`/`-t-control-inner`), no rounded-2xl/3xl. **V8** no pill spam.
- **V9** no hardcoded Inter/Geist. **V10/V12/V13/V14** N/A (no headings/kickers/heroes/all-caps in component).
- **E1–E8** verbal: JSDoc/comments are direct and prescriptive; no em-dash tic as connector beyond legitimate range/aside use, no AI vocabulary, no hedging. (Minor: the four JSDoc examples all close with "These are just a few ways — feel free to combine props creatively!" — a borderline E5 engagement-bait closer, but it's a shared house template across components, not Skeleton-specific.)
- **M1, M3, M5** motion: no bounce, reduced-motion respected, no layout-prop animation.
- **I** types: clean `forwardRef` + `displayName` on every component, `HTMLDivElement` refs, `VariantProps`-derived + exported prop interfaces, no `any`, no `React.FC`, no stringly-typed color.
- **H** state coverage (for a non-interactive primitive): `none` animation for paused/test, `SkeletonGroup` provides `role=status`/`aria-busy`/sr-only label, `lines=0`/`bars=0` guarded via `Math.max(1, …)` (:157, :269). Forced-colors handled at the token layer.
- Tokens: `bg-skeleton-base`/`-shimmer` are semantic tokens with dark + forced-colors overrides; shimmer uses TW4-correct `bg-linear-to-r` (not dead `bg-gradient-to-r`).
