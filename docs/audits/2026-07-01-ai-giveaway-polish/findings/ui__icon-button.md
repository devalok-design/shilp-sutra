# ui/icon-button — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:2 P3:1

IconButton is a thin, well-built wrapper over `Button` — it composes the base primitive (F5 clean), TS-enforces `aria-label` (a11y strong), inherits all of Button's motion/state machinery, and re-uses the canonical `variant`/`color` axes by passthrough. No visual AI tells in its default rendering. The gaps are all **drift / docs**: the JSDoc and Storybook story carry a stale variant/color vocabulary that contradicts both the doc and the actual Button source, plus an E5 verbal tell in the JSDoc, and a couple of polish gaps (size axis narrower than canonical, no test/story coverage of `soft`/`color`/RTL/forced-colors states).

## Findings

### [P1][G3] JSDoc advertises stale variant/color taxonomy ("default, error")
- **Category:** drift / vocabulary
- **Evidence:** icon-button.tsx:30 — `* **All `Button` variants** are supported: `solid`, `outline`, `ghost`, `link` x `default`, `error`.`
- **Why:** Button's real axes are `variant: solid|soft|outline|ghost|link` and `color: accent|error|success|warning|neutral` (button.tsx:25-38). The JSDoc omits `soft` and lists the pre-v0.29 color names `default`/`error` — the exact old taxonomy CLAUDE.md/G3 flags (`color="default"`). The component's own doc (icon-button.md:12-13) and CHANGELOG (md:43) already record the v2 axes, so the JSDoc is internally inconsistent and will mislead an AI agent reading source.
- **Fix:** Replace with: "All Button variants (`solid`, `soft`, `outline`, `ghost`, `link`) and colors (`accent`, `error`, `success`, `warning`, `neutral`) are supported." Or better, point at Button rather than re-listing (single source of truth).

### [P1][G3] Storybook `variant` argType omits `soft`
- **Category:** drift / docs
- **Evidence:** icon-button.stories.tsx:23-26 — `options: ['solid', 'outline', 'ghost', 'link']`
- **Why:** `soft` is a real Button variant and is the CLAUDE.md-preferred default for non-primary actions (G5). It's missing from the control, so the story never exercises it and a Storybook reader concludes IconButton has no soft variant. There is also no `color` argType at all, so the canonical color axis is undiscoverable in the story.
- **Fix:** Add `'soft'` to the variant options and add a `color` argType (`accent|error|success|warning|neutral`). Add a `soft` example to `AllVariants`.

### [P1][E5] JSDoc engagement-bait closer
- **Category:** verbal-tell
- **Evidence:** icon-button.tsx:47 — `// These are just a few ways — feel free to combine props creatively!`
- **Why:** E5 empty-closer / engagement bait — the "feel free to… creatively!" filler is a model-default closer (the same boilerplate also rides Card.tsx:110 and StatCard, so it is a house-wide tic worth a sweep, not unique to this file). It carries no API information. The `—` is also an E1 em-dash-as-connector instance.
- **Fix:** Delete the comment. JSDoc should end on the last real `@example`.

### [P2][H] Tests + stories miss soft, color, RTL, forced-colors, focus-visible coverage
- **Category:** state-coverage
- **Evidence:** icon-button.test.tsx (8 cases — only renders/aria-label/shape/loading/click) and icon-button.stories.tsx (no `soft`, no `color` matrix, no RTL/forced-colors/reduced-motion story).
- **Why:** The H matrix wants disabled/loading/RTL/forced-colors/dark demonstrated. Loading + disabled are covered; soft variant, the color axis, focus-visible ring, RTL (directional icons like the Toolbar story's chevrons should mirror), and forced-colors are not shown or asserted. `describeConformance` (test:10) covers the baseline, but the icon-button-specific surface (soft/color passthrough) is untested.
- **Fix:** Add a `States`/`SoftAndColors` story and a test asserting `variant="soft"`/`color` reach the underlying button. Consider an RTL story for the chevron toolbar.

### [P2][G3] Size axis narrower than canonical (sm/md/lg only)
- **Category:** vocabulary
- **Evidence:** icon-button.tsx:11-17 — `sizeMap = { sm, md, lg }`; `type IconButtonSize = 'sm' | 'md' | 'lg'`
- **Why:** Button exposes `icon-xs … icon-lg` (button.tsx:52-55), i.e. an `xs` icon size exists in the primitive but IconButton can't reach it. The canonical size taxonomy is `xs/sm/md/lg/xl` (G3). Not a tell — a deliberate 3-tier subset is defensible — but it's a quiet capability gap vs the primitive it wraps, and an `xs` toolbar icon button is a common need.
- **Fix:** Consider adding `xs` (→ `icon-xs`). At minimum, document that the subset is intentional so it doesn't read as drift.

### [P3][F1] `icon` is a prop, not a child — acceptable here
- **Category:** composability
- **Evidence:** icon-button.tsx:58 — `icon: IconInput`
- **Why:** F1 flags content-injecting props that should be slots. For an icon-*only* button the single icon IS the child, so a prop is the right call (matches Button's own `startIcon`/`endIcon` convention and the system-wide `IconInput` contract). Noting it only to confirm it was considered and is a choice, not a tell — no change needed.
- **Fix:** None. Leave as `icon` prop.

## Composability gaps
- None material. IconButton composes `Button` (the base primitive — F5 clean), inherits `asChild` by passthrough (only `startIcon|endIcon|fullWidth|loadingPosition|children|size|shape` are Omitted, so `asChild`, `onClickAsync`, `processing`, ButtonGroup context all flow through — icon-button.tsx:50, 76). The `icon` prop is the correct shape for an icon-only control, not a bespoke corner-prop. Single-icon content as a prop is justified (F1 N/A).

## Motion gaps
- None. IconButton adds no motion of its own and delegates entirely to `Button`, which already provides hover/press feedback, `useReducedMotion` guarding (button.tsx:292, 303, 522), spring tokens, and a centered loading spinner. M1–M5 all satisfied via the wrapped primitive. `loadingPosition="center"` is correctly hard-set (icon-button.tsx:75) so the spinner replaces the glyph in-place rather than shifting layout.

## Polish plan (ordered steps to reach the finish bar)
1. Fix the JSDoc variant/color list (icon-button.tsx:30) to the real v2 axes, or replace with a pointer to Button — kills the G3 drift.
2. Delete the engagement-bait closer comment (icon-button.tsx:47) — kills the E5/E1 verbal tell. (Sweep the same line out of Card/StatCard JSDoc while there.)
3. Add `'soft'` to the story `variant` options and add a `color` argType + a soft/color example (stories.tsx:23) — closes the Storybook drift and surfaces the preferred non-primary default.
4. Add a state/RTL/forced-colors story and a test asserting `soft`/`color` reach the button — closes the H state-coverage gap.
5. (Optional) Add an `xs` size mapping to `icon-xs`, or document the 3-tier subset as intentional.

## Clean (rubric dims that pass)
- **A. Visual tells (V1–V8):** none. No accent rail, no gradient, no raw indigo/violet palette, no emoji, no blob/glass/glow, no rounded-everything (uses `rounded-control` via Button + `rounded-pill` only for the explicit `circle` shape — V7 clean), no pill-badge spam.
- **B. Visual reflexes (V9–V15):** none. No hardcoded fonts, no decorative numbering, no eyebrow kickers, no all-caps emphasis.
- **C. Motion (M1–M5):** clean — inherits Button's intentional, reduced-motion-aware motion.
- **F. Composability:** composes the base primitive (F5), passes `asChild` through (F2), 4 props well under the F3 threshold, no compound-misuse (F4), controlled-state handled by Button (F6).
- **G1/G2/G4:** no surface drift (renders a button, not a card — surface rule N/A), no re-rolled tokens (only `rounded-pill` token used; sizing/color all via Button tokens), surface vocabulary consistent.
- **I. Types:** strong — `forwardRef<HTMLButtonElement>`, `displayName` set (icon-button.tsx:83), `icon: IconInput` (shared contract, no `any`), `aria-label: string` required via the interface (TS-enforced a11y). No `React.FC`, no stringly-typed enums.
- **H. a11y baseline:** `aria-label` required at the type level — the standout a11y win for an icon-only control; loading sets `aria-busy` + renders `role="status"` spinner (verified in test:60-66).
- **J. Docs parity:** the per-component doc (icon-button.md) is accurate and matches the CVA source; the drift is in JSDoc + story, not the doc.
