# ui/visually-hidden — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:2 P3:1

## Findings

### [P1][V5] Emoji used as icon system in the story
- **Category:** visual-tell
- **Evidence:** `packages/core/src/ui/visually-hidden.stories.tsx:36-40` — `<span aria-hidden="true">&#9998;</span>` (pencil ✏) and `<span aria-hidden="true">&#128465;</span>` (wastebasket 🗑) as the visible glyphs in Add/Edit/Delete icon-button demos; also `:21` `X` and `:32` `+` as bare text glyphs.
- **Why:** V5 hard-bans emoji/text-as-icon in component, story, or doc source — even when `aria-hidden`. We ship lucide via the Icon API; a story demoing "icon button with VisuallyHidden label" using an HTML entity emoji reads as vibe-coded and teaches the wrong pattern.
- **Fix:** Use the real Icon set in the stories: `<Icon icon={IconX} />`, `<IconPlus/>`, `<IconPencil/>`, `<IconTrash/>` inside the buttons, with `VisuallyHidden` carrying the label. Even better, demo against the actual `IconButton` component so the story shows the canonical pairing.

### [P2][F2] No `asChild` for the primary documented use-case
- **Category:** composability
- **Evidence:** `packages/core/src/ui/visually-hidden.tsx:9-13` always renders a literal `<span>`; `llms-full.txt:4942` documents the canonical use as `<DialogTitle asChild><VisuallyHidden>...</VisuallyHidden></DialogTitle>`.
- **Why:** F2 — the documented canonical use (wrapping `DialogTitle`/`SheetTitle`) relies on the *parent* supporting `asChild`, forcing `<DialogTitle asChild>`. A `VisuallyHidden` that itself supported `asChild`/Slot would let consumers visually-hide an arbitrary element (`<VisuallyHidden asChild><h2>…</h2></VisuallyHidden>`) without an extra wrapper span. Radix's own `VisuallyHidden` ships `asChild` for exactly this reason. Not broken, but below the Card composability bar.
- **Fix:** Accept `asChild?: boolean` and render via the vendored `Slot` primitive when set, merging `sr-only` onto the child's className. Keep the bare `<span>` default.

### [P2][J] No per-component doc / story under-demonstrates the real pattern
- **Category:** docs
- **Evidence:** No `packages/core/docs/components/**/visually-hidden.md` exists (Glob: no files); `visually-hidden.stories.tsx` only demos hand-rolled buttons, never the canonical DialogTitle pairing that `llms-full.txt:4942` calls the primary use.
- **Why:** J — the project documents components via `llms*.txt` + Storybook autodocs (no `docs/components/` tree exists, so the missing `.md` is not itself a gap). The real gap is that the story doesn't show the load-bearing pattern (skip-link or `DialogTitle asChild`), so the live demo and the written guidance diverge.
- **Fix:** Add a story showing `<VisuallyHidden>` wrapping a `DialogTitle` (or a skip-to-content link, which is the other classic use) so the demo matches the documented canonical use.

### [P3][I] Empty interface extends — eslint `no-empty-object-type` smell
- **Category:** types
- **Evidence:** `packages/core/src/ui/visually-hidden.tsx:6-7` — `export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {}`.
- **Why:** I/style — an empty `interface extends` is equivalent to a type alias and trips `@typescript-eslint/no-empty-object-type` under many configs. Harmless here (it survives lint in this repo), and the named export is deliberate so consumers can import the props type — so keep the export, just make it not-empty when `asChild` lands.
- **Fix:** When adding `asChild` (F2), this interface gains a real member and the smell disappears. Until then, leave as-is; flag only for awareness.

## Composability gaps
- No `asChild`/Slot — the documented DialogTitle/SheetTitle pairing pushes the polymorphism onto the parent (`<DialogTitle asChild>`) instead of letting `VisuallyHidden` adopt the child element. Radix parity would be `asChild`.
- Otherwise correctly minimal: forwards ref, spreads `...props`, merges `className` via `cn`, no bespoke corner-props, no re-rolled surface/tokens. It is a leaf primitive and composes cleanly into anything.

## Motion gaps
- None, and correctly so. `VisuallyHidden` is a static a11y primitive — no entrance/exit/feedback motion is appropriate. M1–M5 N/A.

## Polish plan (ordered steps to reach the finish bar)
1. Replace the emoji/text glyphs in `visually-hidden.stories.tsx` with real `Icon` components (lucide/tabler via the Icon API), ideally demoing the actual `IconButton` + `VisuallyHidden` pairing (kills V5).
2. Add `asChild?: boolean` backed by the vendored `Slot`, merging `sr-only` onto the child — gives the documented DialogTitle pattern a first-class path and fills the empty-interface (F2 + I).
3. Add a story for the canonical use (DialogTitle wrap and/or skip-link) so the live demo matches `llms-full.txt` guidance (J).

## Clean (rubric dims that pass)
- **V1–V4, V6–V15:** no accent rail, no double edge, no gradient text, no framework palette, no blob/glass/glow, no rounded-everything, no pill spam, no decorative numbering/kicker/all-caps — the source is one `<span className="sr-only">`.
- **G1–G5 (drift/vocabulary):** uses Tailwind's canonical `sr-only` (not a re-rolled px/hex offscreen hack), no surface assignment needed (it's invisible by design), no variant axes to drift.
- **E1–E8 (verbal):** JSDoc is absent and the llms-full entry is plain and accurate ("content is in the DOM, just positioned off-screen") — no AI vocabulary, em-dash tics, or hedging.
- **H (state coverage) / a11y:** correct semantics — it is the a11y primitive; axe-clean test at `__tests__/visually-hidden.test.tsx:36-44`; renders accessible-but-hidden content. No interactive states apply.
- **F1, F3–F6:** no bespoke corner-props, well under the 8-prop threshold, not a compound, no controlled/uncontrolled surface, nothing to re-roll.
- **I (types) mostly:** `forwardRef` + `displayName` present, ref typed to `HTMLSpanElement` (specific, not `HTMLElement`), no `any`, props type exported.
- **Server-safe:** correctly annotated `// @server-safe` (line 1) and listed in `llms-full.txt:210`.
