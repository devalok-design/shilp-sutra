# ui/dropdown-menu — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

## Findings

### [P1][I] Root + Sub typed as `React.FC`
- **Category:** types
- **Evidence:** dropdown-menu.tsx:77 — `const DropdownMenu: React.FC<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>> = ({...})`; same at :109 `const DropdownMenuSub: React.FC<...>`
- **Why:** Rubric I explicitly bans `React.FC` in exported components; it bakes in an implicit `children` and blocks clean generic/ref ergonomics. Every other part in this file uses `forwardRef`; these two are the outliers.
- **Fix:** Drop `React.FC`; type the props explicitly (`function DropdownMenu(props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>)`), or a plain typed arrow returning `JSX.Element`. Roots don't take a ref so `forwardRef` isn't required, but the `React.FC` annotation should go.

### [P1][M3] Scale-entrance animations rely entirely on a consumer-mounted MotionConfig for reduced-motion
- **Category:** motion / a11y
- **Evidence:** dropdown-menu.tsx:175-178 (`initial={{ opacity: 0, scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ ...springs.snappy, opacity: tweens.fade }}`) and :211-215 (same on Content). No `useReducedMotion()` guard, no `withReducedMotion()` import.
- **Why:** framer-motion's default `reducedMotion` is `"never"`. The scale/opacity transition only respects `prefers-reduced-motion` if the consumer wraps the tree in `<MotionProvider>` / `<MotionConfig reducedMotion="user">`. A dropdown dropped into a bare app animates regardless of OS setting. The studio already ships `withReducedMotion()` (lib/motion.ts:58) and `useReducedMotion` is used in sheet.tsx, spinner.tsx, etc. — this overlay opts out of that pattern.
- **Fix:** Either (a) document that DropdownMenu requires MotionProvider for reduced-motion (and assert it in the doc), or (b) gate the transition locally: `const reduce = useReducedMotion(); transition={reduce ? { duration: 0 } : { ...springs.snappy, opacity: tweens.fade }}`. Match whatever sheet.tsx does so the family is consistent.

### [P2][M1] `springs.snappy` overshoots scale on a frequent utility overlay
- **Category:** motion
- **Evidence:** dropdown-menu.tsx:178 / :215 — entrance uses `springs.snappy` (`stiffness 500, damping 30, mass 0.5`) on a `scale: 0.95 → 1`.
- **Why:** A spring on scale gives a slight overshoot/settle. For a Dialog or Toast that's intentional; for a high-frequency action menu it reads slightly bouncy versus the crisp open users expect. Sub-content uses the identical spring, so nested menus inherit the wobble. Borderline — flagging because the rubric (M1) treats spring-overshoot-by-default on routine UI as a reflex unless deliberate; here it isn't documented as deliberate.
- **Fix:** Consider `tweens.fade`-style tween (or `springs.responsive`/a tighter damping) for the panel scale, reserving springy entrances for celebratory surfaces. Low-confidence — verify against the motion showcase intent before changing.

### [P2][H] Loading / busy state not represented; no `aria-busy` story or test
- **Category:** state-coverage
- **Evidence:** dropdown-menu.stories.tsx covers Default, Submenu, Checkbox, Radio, Disabled — no async/loading item state. test.tsx covers closed/open axe + Enter/Escape only.
- **Why:** Rubric H wants the applicable state matrix demonstrated. Menus frequently host async actions (a "Loading…" item, a disabled-while-pending row). Not a defect in the primitive, but the state coverage falls short of the Card bar's "shown in stories or tests."
- **Fix:** Add a story with an item in a pending/disabled state and (optionally) an `aria-busy` content wrapper, or explicitly note loading is out of scope for the primitive.

### [P2][H] No RTL / forced-colors / reduced-motion coverage in stories or tests
- **Category:** state-coverage / a11y
- **Evidence:** No `dir="rtl"` story; `IconChevronRight` (dropdown-menu.tsx:153) on SubTrigger is a directional icon with no mirroring assertion; no forced-colors story.
- **Why:** The submenu chevron points right in LTR and should mirror in RTL. Radix handles direction via `DirectionProvider`, but nothing here demonstrates it, and the chevron isn't logically mirrored in the component. Rubric H lists RTL (directional icons mirror) + forced-colors as required matrix entries.
- **Fix:** Add an RTL story to confirm the chevron + `ml-auto` flip, and a forced-colors story to confirm `focus:bg-surface-raised` highlight survives (focus relies on background color, which can vanish in forced-colors — see next finding).

### [P2][H] Focus indication is background-only — risk in forced-colors
- **Category:** a11y
- **Evidence:** dropdown-menu.tsx:240 (Item) `outline-hidden ... focus:bg-surface-raised`; :146 (SubTrigger) `outline-hidden ... focus:bg-surface-raised data-[state=open]:bg-surface-raised`.
- **Why:** `outline-hidden` removes the UA outline and the only focus affordance is a background tint. In `forced-colors: active` (Windows High Contrast) background colors are flattened, so the focused item may be indistinguishable. Card-bar components keep a forced-colors fallback.
- **Fix:** Add a `forced-colors:` outline (e.g. `forced-colors:focus:outline forced-colors:focus:outline-2`) on Item/SubTrigger/Checkbox/Radio items, or a `@media (forced-colors)` token. Confirm against how Select/Combobox items handle it for family consistency.

### [P3][G2] Raw `min-w-[8rem]` and `h-2 w-2` arbitrary values instead of tokens
- **Category:** drift
- **Evidence:** dropdown-menu.tsx:180 / :217 `min-w-[8rem]`; :287 `<IconCircle className="h-2 w-2 fill-current" />` (radio dot).
- **Why:** Rubric G2 prefers DS tokens over arbitrary px/rem. `8rem` panel min-width and the `h-2 w-2` radio dot are hardcoded rather than a `--spacing-ds-*` / size token. Minor — these are small one-offs, not a brand-color or shadow drift.
- **Fix:** Map `8rem` to a spacing/size token if one fits; use `h-ds-* w-ds-*` (or an icon size token) for the radio dot.

### [P3][V/J] Doc lists "Defaults: none" and omits the v0.x motion + token surface
- **Category:** docs
- **Evidence:** docs/components/ui/dropdown-menu.md:19-20 "Defaults\n    none"; no mention of the framer-motion entrance animation, `shadow-floating`, or `bg-surface-overlay` surface in the doc body.
- **Why:** Rubric J (docs parity). The doc is otherwise accurate (compound list, keyboard model, asChild guidance all match source), but it under-documents the animated overlay surface and reduced-motion dependency, which is exactly the M3 gap above.
- **Fix:** Add a one-line "Surface: `surface-overlay` + `shadow-floating`; entrance animated via framer-motion (respects reduced-motion when wrapped in MotionProvider)."

## Composability gaps
- **None material — this is a strong compound.** F1–F5 all pass: it composes the vendored Radix primitive (F5 ✓), uses `asChild` on Trigger/Content/SubContent for polymorphism (F2 ✓), is fully slot/part-based with no bespoke corner-props (F1/F4 ✓), and is not a flat >8-prop component (F3 ✓).
- **F6 (controlled/uncontrolled):** Handled correctly — both `DropdownMenu` and `DropdownMenuSub` bridge controlled `open` + uncontrolled `defaultOpen` with an internal `isControlled` check (dropdown-menu.tsx:83-93, :115-125) and fire `onOpenChange` (correct event name for non-input semantics). The local state mirror exists only to feed `DropdownMenuOpenContext` for `AnimatePresence`; the Radix root is still passed `open`/`onOpenChange`, so no double-source-of-truth bug. Clean.
- Minor: `DropdownMenuShortcut` is a plain function (not forwardRef), so it can't receive a ref — acceptable for a display-only span, consistent with similar shadcn-lineage shortcuts.

## Motion gaps
- **M3 (reduced-motion):** No local guard; depends on consumer mounting MotionProvider/MotionConfig. See P1 finding. This is the most important motion gap.
- **M1 (spring overshoot):** `springs.snappy` scale entrance on a routine action menu — mild bounce, possibly more than this surface wants. See P2 finding.
- **M2 (timing):** Content and SubContent use the identical transition — fine here (both are the same gesture class), not robotic-uniform across unrelated motions.
- **M4 (feedback motion):** Present and good — `transition-colors duration-fast-01` on item hover/focus/active (dropdown-menu.tsx:240, :256, :280), `AnimatePresence` enter/exit on both panels. ✓
- **M5 (layout props):** Clean — animates `opacity` + `scale` (transforms), never width/height/top/left. ✓

## Polish plan (ordered steps to reach the finish bar)
1. **Drop `React.FC`** on `DropdownMenu` (:77) and `DropdownMenuSub` (:109); use an explicitly-typed function. (P1, types)
2. **Add reduced-motion guard** to Content + SubContent transitions — `useReducedMotion()` → zero-duration, matching sheet.tsx, so the menu works without a MotionProvider. (P1, motion/a11y)
3. **Add a forced-colors focus fallback** (outline) to Item / SubTrigger / Checkbox / Radio so focus survives High Contrast. (P2, a11y)
4. **Add RTL + forced-colors stories** and confirm the SubTrigger chevron mirrors. (P2, state-coverage)
5. **Reconsider the entrance spring** — evaluate a tween or tighter spring for the panel scale to drop the overshoot on this high-frequency surface. (P2, motion)
6. **Tokenize** `min-w-[8rem]` and the `h-2 w-2` radio dot; (P3) and **expand the doc** to cover the overlay surface + reduced-motion dependency. (P3, docs)

## Clean (rubric dims that pass)
- **V1–V8 (visual tells):** No accent rail, no double-edge (overlay uses `shadow-floating` only, no border — single edge ✓), no gradient text, no raw indigo/violet/slate (uses `surface-overlay`, `surface-raised`, `error-11` semantic tokens), no emoji icons (lucide/tabler `IconCheck`/`IconChevronRight`/`IconCircle`), no blob/glass/glow, single radius vocabulary (`rounded-overlay`, `rounded-control`), no pill-badge spam.
- **V9 (font):** No hardcoded Inter/Geist — uses `text-ds-md`/`text-ds-sm` tokens.
- **E1–E8 (verbal):** JSDoc and doc prose are direct and clean — no em-dash tic abuse (em-dashes used are legitimate prose), no contrastive negation, no AI-vocab buzzwords, no meta-hedging, no chatbot artifacts.
- **G1 (surface):** Correct — overlays use `bg-surface-overlay` (rubric: overlays belong on surface-1/overlay tier). ✓
- **G3 (variant axes):** No CVA variant axes to drift (the component is part-based, not variant-driven) — N/A, clean.
- **F1–F6 (composability):** All pass (see above).
- **State coverage that IS present:** disabled (`data-[disabled]:opacity-action-disabled` + Disabled story), hover/focus/active, open/closed, checkbox checked, radio selected, keyboard (Enter/Escape tested), axe-clean in both open and closed states.
- **Truncation handled:** `min-w-0 truncate` on SubTrigger (:152) and RadioItem (:290) labels — overflow-safe.
