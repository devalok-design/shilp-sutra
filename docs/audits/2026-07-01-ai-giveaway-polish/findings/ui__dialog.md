# ui/dialog — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

Dialog is a competent, Radix-backed compound with no hard visual AI tells (no accent rail, no
gradient, no framework palette, no emoji, one radius vocabulary). It composes the primitive
correctly and forwards refs. The gaps are finish-bar, not slop: **no reduced-motion guard**
(its own sibling Sheet has one off the same primitive), a **24px close-button hit target**, a
**`React.FC` root with implicit children typing**, and **docs/source drift** (`z-dialog` vs
`z-modal`). None are P0.

## Findings

### [P1][M3] No reduced-motion guard on overlay/content animation
- **Category:** motion
- **Evidence:** dialog.tsx:135-155 — overlay `initial/animate/exit` opacity + content `motion.div` spring `{ ...springs.smooth }` with scale/translate, no `useReducedMotion()` anywhere in file.
- **Why:** Dialog animates scale + opacity + slide-up on every open with zero `prefers-reduced-motion` respect. Its direct sibling `sheet.tsx:6,204,231` imports and uses `useReducedMotion()` off the *same* `@primitives/react-dialog` base — Dialog is the outlier. `motion.ts:58` even ships a `withReducedMotion()` helper that's unused here.
- **Fix:** `const isReduced = useReducedMotion()`; when true, drop the scale/translate offsets to a plain opacity fade (or `withReducedMotion(transition)` to zero duration), matching Sheet.

### [P1][H] Close-button hit target is 24×24px, below the 44px minimum
- **Category:** a11y
- **Evidence:** dialog.tsx:165 — `min-h-ds-xs min-w-ds-xs` on the close `<button>`; `semantic.css:516` `--size-xs: 24px`. The icon is `size="lg"` but the interactive box is 24px.
- **Why:** Rubric H hard-flags interactive touch targets < 44px. 24px is a tap-miss on mobile — and on mobile this dialog is *full-screen*, so the only dismiss affordances are this button and Escape (no visible backdrop to tap).
- **Fix:** Bump to `min-h-ds-xl min-w-ds-xl` (44px) or wrap in a 44px hit box with the glyph centered, mirroring the touch-target utility used elsewhere.

### [P1][I] `Dialog` root is `React.FC` (banned) and drops `children` from its prop contract
- **Category:** types
- **Evidence:** dialog.tsx:66 — `const Dialog: React.FC<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>>`. Rubric I bans `React.FC`. `ComponentPropsWithoutRef<Root>` does not include `children`, and `React.FC`'s implicit-children was removed in React 18 types — so `children` is only accepted via the spread, not the declared type.
- **Why:** Inconsistent with the rest of the file (every other part uses `forwardRef` with explicit prop interfaces) and with the house convention. `React.FC` also blocks generics/ref typing if ever needed.
- **Fix:** Type as a plain function: `function Dialog({ ... }: DialogProps)` where `DialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>` (Root already includes `children`); keep `displayName`.

### [P2][J] Docs say `z-dialog`; source uses `z-modal` (token doesn't exist)
- **Category:** docs
- **Evidence:** docs/components/ui/dialog.md:44 — "DialogContent uses `z-dialog` (configured in Tailwind theme). Nested overlays … Popover uses `z-popover` (1400)". Source: dialog.tsx:157 `z-modal`, dialog.tsx:109 overlay `z-overlay`. `utilities.css:255-256` only defines `z-overlay`/`z-modal`; there is no `z-dialog` or `z-popover` utility in tokens.
- **Why:** Doc references two z-utilities that don't exist in the token layer — source is authoritative (rubric J). A consumer copying `z-dialog`/`z-popover` gets nothing.
- **Fix:** Update the doc to `z-modal` (content) / `z-overlay` (backdrop) with the real values (`--z-modal: 1300`, `--z-overlay: 1200` from semantic.css:445-446), or define the named utilities if the layering story actually wants them.

### [P2][H] No story or test for `responsive={false}`, mobile slide-up, dark, or forced-colors
- **Category:** state-coverage
- **Evidence:** dialog.tsx:117-120 ships a `responsive` prop; the only mobile coverage is the `MobileFullScreen` story (dialog.stories.tsx:140) which relies on a viewport global, and no story exercises `responsive={false}`. No forced-colors / reduced-motion / dark story. Tests (dialog.test.tsx) cover open/close/escape/axe only.
- **Why:** Rubric H asks interactive components to demonstrate forced-colors, reduced-motion, dark, and the prop-driven layout modes. The `responsive` boolean (the one bespoke prop on Content) is undocumented in the .md and unexercised.
- **Fix:** Add a `responsive={false}` story (always-centered) and a forced-colors/reduced-motion variant; document `responsive` in dialog.md's prop list.

### [P2][M2] `active:scale-90` press on close button has no transition / motion-system tie-in
- **Category:** motion
- **Evidence:** dialog.tsx:165 — `transition-colors duration-fast-01 … active:scale-90`. The `transition-colors` only animates color; `scale-90` snaps with no transition and isn't tied to the spring/tween scale used elsewhere.
- **Why:** Inconsistent feedback motion — the close button's press is an un-eased instant snap while the rest of the system uses `springs.snappy`/tween presets. Minor but it's the kind of detail the Card bar nails.
- **Fix:** Either include `transition` on transform (`transition-[color,transform]`) or use a `motion.button` with `whileTap={{ scale: 0.9 }} transition={springs.snappy}` consistent with Button/CardAction.

### [P2][F4] Title/Description style baked into compound parts blocks size variation
- **Category:** composability
- **Evidence:** dialog.tsx:231 `DialogTitle` hardcodes `text-ds-lg font-semibold`; dialog.tsx:245 `DialogDescription` hardcodes `text-ds-md`. No size axis, unlike Card which threads a `CardSizeContext` so slots scale together.
- **Why:** Not a tell, but below the Card bar: a large confirmation dialog and a dense inline form dialog use identical type. Card solved this with a size context; Dialog has none.
- **Fix:** Optional — thread a size context (sm/md/lg) like Card, or document that overrides go through `className`. Low priority; current single-size is defensible for modals.

### [P3][G4] Header uses `space-y-*`/`space-x-*` while the rest of the system moved to the gap model
- **Category:** vocabulary
- **Evidence:** dialog.tsx:201 `DialogHeader` `space-y-ds-02b`; dialog.tsx:215 `DialogFooter` `sm:space-x-ds-03`. Card's gap-model comment (card.tsx:14-19) and the make-kit rule explicitly favor `gap` over `space-*`/per-child margins.
- **Why:** `space-y/x` adds margins to children (the "bottom-heavy" failure mode Card's comment calls out). Flex `gap` is the house pattern. Cosmetic here but it's vocabulary drift from the family.
- **Fix:** `flex flex-col gap-ds-02b` for header; `flex flex-col-reverse sm:flex-row sm:justify-end gap-ds-03` for footer.

### [P3][H] `DialogHeader` defaults to `text-center` on mobile
- **Category:** state-coverage
- **Evidence:** dialog.tsx:201 — `text-center sm:text-left`.
- **Why:** Centered header text on small screens is a mild reflexive default (leans toward the "centered hero" look, V13-adjacent) and disagrees with the left-aligned, asymmetric house preference. Not a hard tell since it flips to left at `sm`.
- **Fix:** Consider `text-left` throughout, or leave as a deliberate mobile choice if validated. Low priority.

## Composability gaps
- `Dialog` root typed `React.FC` instead of the house `forwardRef`/typed-function pattern (F-adjacent / I). Children only flow through the spread, not the declared type.
- Title/Description carry fixed type with no size axis — Card threads a size context so slots scale together; Dialog does not (F4). Acceptable for modals but below the bar.
- `responsive` is the one bespoke layout prop on Content; it's correct as a boolean (not slot-worthy) but is undocumented and unexercised by stories/tests.
- Strong positives: composes `@primitives/react-dialog` directly (no re-roll), `asChild` available on Trigger/Close via the primitive, `DialogContentRaw` exposed for full portal control, controlled+uncontrolled both handled (dialog.tsx:73-83).

## Motion gaps
- **No `useReducedMotion()`** (M3) — the headline gap; sibling Sheet has it off the same primitive, and `withReducedMotion()` helper sits unused.
- Close-button `active:scale-90` is an instant snap with no transform transition, not tied to the spring/tween presets (M2).
- Enter and exit on the centered (desktop) path use the same `springs.smooth` for the scale/translate and a fade for opacity — reasonable, no overshoot-by-default (M1 clean), but there's no enter/exit *differentiation* and timing is uniform across overlay+content.
- No `layout`-prop animation abuse (M5 clean): uses transform (`scale`, `x/y` %) and opacity.

## Polish plan (ordered steps to reach the finish bar)
1. Add `useReducedMotion()` and collapse to an opacity-only fade when reduced (match Sheet). (M3, P1)
2. Enlarge the close-button hit target to ≥44px (`min-h-ds-xl min-w-ds-xl` or a touch-target wrapper). (H, P1)
3. Retype `Dialog` root from `React.FC` to a typed function component with an explicit `DialogProps` that includes `children`. (I, P1)
4. Fix dialog.md z-index references (`z-dialog`→`z-modal`, drop the non-existent `z-popover`); document the `responsive` prop. (J/H, P2)
5. Make the close-button press use a transform transition / `whileTap` spring consistent with Button. (M2, P2)
6. Convert `space-y/x-*` in Header/Footer to the gap model. (G4, P3)
7. Add `responsive={false}` + forced-colors/reduced-motion stories. (state-coverage, P2)

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double-edge:** content uses `shadow-overlay` with no border — elevation only. **V3 gradient text:** none. **V4 framework palette:** uses semantic tokens (`bg-overlay`, `bg-surface-overlay`, `ring-accent-9`); no indigo/violet/slate. **V5 emoji:** none. **V6 blob/glass/glow:** plain `bg-overlay` backdrop, no backdrop-blur. **V7 rounded-everything:** `rounded-overlay-lg` only, one vocabulary. **V8 pill spam:** none.
- **V9–V15** clean (uses `text-ds-*` tokens, no eyebrow/numbering/all-caps).
- **E1–E8 verbal:** JSDoc and doc copy are direct and accurate; no em-dash tic as connector, no AI vocabulary, no hedging, no placeholders.
- **G1 surface:** correct — overlays legitimately use `bg-surface-overlay`/`surface-1` family (overlay is on the SURFACE1 allowlist intent). **G2 tokens:** uses `--spacing-ds-*`, `rounded-overlay-lg`, `shadow-overlay`, `z-modal`/`z-overlay` — no raw hex/px/dead-TW3 utilities. **G3 axis names:** n/a (no CVA variant axis; `responsive` is a clear boolean).
- **F (composition):** composes the base primitive, exposes `asChild`, `DialogContentRaw`, controlled+uncontrolled — strong.
- **a11y core:** axe-clean test passes; `DialogTitle` required + documented; focus trap/restore via Radix; close has `sr-only` label + `title`; `focus-visible:ring-2`.
- **M1 bounce-by-default:** clean (`springs.smooth`, no overshoot). **M5 layout props:** clean (transform+opacity).
