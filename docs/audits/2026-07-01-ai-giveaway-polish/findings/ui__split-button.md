# ui/split-button — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:6 P2:4 P3:2

## Findings

### [P1][F5] Re-rolls the entire Button styling system instead of composing `<Button>`
- **Category:** composability / drift
- **Evidence:** split-button.tsx:94-119 `getHalfClasses` duplicates Button's `solid/soft/outline × color` compoundVariants verbatim; lines 8,15 import `buttonVariants` only to borrow the `color` *type*, never the styles.
- **Why:** This is exactly the StatCard drift risk the finish bar calls out — two sources of truth for the same colored-button surface. When Button's soft-neutral or solid-accent class changes (it already differs: Button solid adds `hover:shadow-brand`, SplitButton does not), the two visibly diverge with no test catching it.
- **Fix:** Render the two halves as `<Button asChild>` / `<Button>` (Button already supports `asChild` via Slot, and `ButtonGroup` already solves attached radii + shared divider). At minimum, derive the half classes from `buttonVariants({variant,color,size})` rather than a hand-copied map.

### [P1][G3] `variant` and `size` axes drift from the canonical Button taxonomy
- **Category:** vocabulary / drift
- **Evidence:** split-button.tsx:14 `type SplitButtonVariant = 'solid' | 'soft' | 'outline'` (drops canonical `ghost`,`link`); line 16 `'xs'|'sm'|'md'|'icon-xs'|'icon-sm'|'icon-md'` drops `lg` and `compact-*` and uses a parallel hand-rolled height/text/padding map (lines 69-92).
- **Why:** A consumer who knows Button can't transfer that vocabulary — `size="lg"` is a type error here, and the size maps will silently drift from Button's `buttonVariants` size definitions.
- **Fix:** Reuse `VariantProps<typeof buttonVariants>['variant'/'size']` (the same way `color` is already derived on line 15), or document the intentional subset. Don't re-declare a parallel size scale.

### [P1][F1] `dropdownContent` + `dropdownIcon` are bespoke content-injection props, not slots
- **Category:** composability
- **Evidence:** split-button.tsx:23 `dropdownContent?: React.ReactNode`, line 42 `dropdownIcon?: React.ReactNode`, consumed at lines 275/325/349.
- **Why:** The Card-bar pattern is content-through-slots/compound, not corner-props. `dropdownContent` injects a whole panel through one prop; there is no `SplitButton.Menu` / `SplitButton.Trigger` composition. This also forces the panel's a11y (menu semantics, item roles) onto the consumer (see story passing raw `<button>`s).
- **Fix:** Expose a compound API (`<SplitButton.Menu>` rendering proper `role="menu"` + `menuitem` children) or accept the menu via a slot child rather than a prop, so the component owns menu semantics + keyboard nav.

### [P0][H] Dropdown is `role="menu"` but has no menu keyboard navigation or focus management
- **Category:** a11y / state-coverage
- **Evidence:** split-button.tsx:335-351 panel has `role="menu"` and `aria-haspopup="menu"` (lines 261,313) but: focus is never moved into the panel on open, there is no Arrow/Home/End handling, no focus trap, and no focus-return to the trigger on close. Only outside-click (204-216) and Escape (219-226) are wired.
- **Why:** Declaring `role="menu"` is an ARIA contract: a keyboard/screen-reader user expects to enter the menu and arrow between `menuitem`s. As shipped, the menu is unreachable by keyboard and focus is orphaned on close — a broken a11y guarantee (P0 per rubric).
- **Fix:** On open, move focus to the first menu item; implement roving Arrow/Home/End/Tab handling; restore focus to the trigger on close. Or drop `role="menu"` and use a non-menu disclosure contract if arbitrary content is intended. Reusing the existing `DropdownMenu` primitive would inherit all of this.

### [P1][M3] No reduced-motion guard on panel scale animation or primary `active:scale`
- **Category:** motion
- **Evidence:** split-button.tsx:343-346 `initial/animate/exit` scale 0.95↔1 with no `useReducedMotion`; line 290 `active:scale-[0.97]` always on.
- **Why:** Button.tsx imports `useReducedMotion` (button.tsx:6,292) and gates its width/scale motion; SplitButton ships scale motion with no guard, violating M3 and diverging from the sibling's motion discipline.
- **Fix:** Gate the panel scale and the active-scale behind `useReducedMotion()` (fall back to opacity-only), consistent with Button.

### [P1][F6] Controlled-only open API — no `defaultOpen` (uncontrolled-with-initial gap)
- **Category:** composability / types
- **Evidence:** split-button.tsx:26-28 `open` + `onOpenChange`; internal state seeds `useState(false)` (line 163) with no way to set an uncontrolled initial-open.
- **Why:** Rubric F6 — supports the controlled side but the uncontrolled path has no `defaultOpen`. Minor, but it's the standard disclosure contract (Radix/our DropdownMenu both expose `defaultOpen`).
- **Fix:** Add `defaultOpen?: boolean` and seed `useState(defaultOpen ?? false)`.

### [P1][G2] Hand-rolled chevron SVG instead of the Icon API / lucide-tabler set
- **Category:** drift / visual-tell (V5-adjacent)
- **Evidence:** split-button.tsx:131-137 inline `<svg>` ChevronDown with hardcoded `width="12" height="12"`, `strokeWidth="1.5"`.
- **Why:** Every other component uses `@tabler/icons-react` via the `Icon` API (StatCard line 3, Button line 4). A bespoke SVG with raw px drifts from icon sizing/stroke tokens and won't track icon-size context.
- **Fix:** Use `<Icon icon={IconChevronDown} />` (the default) and keep `dropdownIcon` as the override. Removes the hand-rolled SVG and raw px.

### [P2][M2] Panel uses a single moderate duration with no enter/exit differentiation
- **Category:** motion
- **Evidence:** split-button.tsx:346 `transition={{ duration: durations.moderate01 }}` applied identically to `animate` and `exit`.
- **Why:** The motion system (and Button) differentiate enter (fast/snappy) vs exit (slower/relaxed); a single symmetric duration is the "uniform timing" reflex (M2).
- **Fix:** Use the spring/tween tokens (`springs.snappy` for enter, a relaxed tween for exit) as Card/StatCard do, instead of a flat `moderate01`.

### [P2][H] Loading and busy states absent; `aria-busy`/disabled-reason not surfaced on dropdown
- **Category:** state-coverage
- **Evidence:** SplitButtonProps (lines 18-50) has no `loading`; Button ships `loading`+`aria-busy` (button.tsx:217,499). Split actions (Save / Save & …) frequently need a pending state.
- **Why:** Falls short of Button's state coverage — a split primary action can't show in-flight state without the consumer swapping children manually.
- **Fix:** Add `loading` that disables both halves and renders a Spinner in the primary half with `aria-busy`, mirroring Button.

### [P2][H] Focus ring is hardcoded `ring-accent-9` for every color
- **Category:** a11y
- **Evidence:** split-button.tsx:267,291,317 `focus-visible:ring-accent-9` on error/success/warning/neutral variants too.
- **Why:** Button does the same, so this is a house convention rather than a unique tell — but on an `error`-colored destructive split action the accent-blue ring reads slightly off. Flagging as a polish gap, not a violation.
- **Fix:** Optionally key the ring off `color` (`ring-error-9` etc.), or confirm it's an intentional single-focus-color convention and leave.

### [P2][J] No per-component doc; story menu items are raw `<button>`s, not `menuitem`s
- **Category:** docs / a11y
- **Evidence:** no `docs/components/**/split-button.md` exists (Glob empty); stories (split-button.stories.tsx:19-27, 194-202) put plain `<button>`s inside a `role="menu"` panel — not `role="menuitem"`.
- **Why:** Docs-parity gap, and the canonical examples model an a11y-incorrect menu (raw buttons under role=menu), which consumers will copy.
- **Fix:** Add a per-component doc with the prop table; fix story dropdown items to `role="menuitem"` (the open-axe test on line 174 already uses `role="menuitem"`, so the stories are inconsistent with the test).

### [P3][G5] Default variant is `solid` — fine for a primary split action, but soft is the house default for non-primary
- **Category:** vocabulary
- **Evidence:** split-button.tsx:149 `variant = 'solid'`.
- **Why:** SplitButton's primary half is genuinely a primary action, so `solid` default is defensible (not a violation). Noting per the soft-over-outline preference only for completeness.
- **Fix:** None required; leave `solid`.

### [P3][types] `dividerColor` / `getHalfClasses` key on `string`, not the `SplitButtonColor` union
- **Category:** types
- **Evidence:** split-button.tsx:54 `Record<SplitButtonVariant, Record<string, string>>`, line 94 `color: string`, with `?? map.accent` fallbacks (lines 118,126,229).
- **Why:** Stringly-typed color maps lose exhaustiveness — a new color won't fail the build, it'll silently fall back to accent.
- **Fix:** Key on `SplitButtonColor` and drop the `?? accent` fallbacks so a missing color is a compile error.

## Composability gaps
- Does not compose `<Button>` / `<ButtonGroup>` — re-implements colored-half styling, divider, attached radii, and per-size height/padding maps by hand (F5). ButtonGroup already solves the attached-radii + shared-divider problem this component re-rolls.
- `dropdownContent`/`dropdownIcon` are content-injection props, not a compound `SplitButton.Menu`/`SplitButton.Trigger` slot API (F1). The component owns no menu semantics.
- No `asChild` on the primary half — can't polymorph the primary action into a link/`Form` submit the way a real Button can (F2).
- Controlled-only open state; no `defaultOpen` (F6).
- Size/variant axes are a hand-picked subset with a parallel scale rather than the shared Button vocabulary (G3).

## Motion gaps
- No `prefers-reduced-motion` guard on the panel scale animation or the primary `active:scale-[0.97]` (M3); sibling Button gates motion via `useReducedMotion`.
- Symmetric single-duration enter/exit (`moderate01`) — no enter-vs-exit differentiation, the uniform-timing reflex (M2).
- Trigger half has only `transition-colors` (no press feedback) while the primary half has `active:scale` — inconsistent micro-feedback across the two halves (M4-adjacent).

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the duplicated styling (F5/G3):** render the two halves with the real `<Button>` (asChild for the primary), or derive half classes from `buttonVariants(...)`. Adopt Button's `variant`/`size`/`color` types wholesale. Delete `getHalfClasses`, `heightClass`, `textClass`, `primaryPadding`, `triggerPadding`, `radiusClass`.
2. **Fix the menu a11y (P0/H):** either reuse the existing `DropdownMenu` primitive for the panel (inherits roving focus, focus return, item roles) or implement focus-move-on-open + Arrow/Home/End + focus-restore, and make the panel own `menuitem` semantics. Replace bespoke outside-click/Escape effects with the primitive's.
3. **Slot the menu (F1):** expose `SplitButton.Menu`/`SplitButton.Trigger` (or accept the menu as a typed child) instead of `dropdownContent`/`dropdownIcon` props.
4. **Motion discipline (M2/M3):** gate scale behind `useReducedMotion`; use `springs.snappy` enter / relaxed-tween exit instead of flat `moderate01`. Add press feedback to the trigger half.
5. **State coverage (H):** add `loading` (Spinner + `aria-busy`, disables both halves) and `defaultOpen` (F6).
6. **Icon + types (G2/types):** replace the inline ChevronDown SVG with `<Icon icon={IconChevronDown} />`; key color maps on `SplitButtonColor` and drop accent fallbacks.
7. **Docs/stories (J):** add a per-component doc + prop table; fix story dropdown items to `role="menuitem"` to match the open-axe test.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No left/top colored stripe; the divider is a 1px hairline between halves, not a rail.
- **V2 double-edge:** clean — solid uses `shadow-raised` only, outline uses `border` only (split-button.tsx:249-250). No element carries both.
- **V3 gradient text / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** none. Uses `rounded-control` consistently (lines 89-92), `bg-surface-overlay` + `shadow-floating` on the panel.
- **V4 framework palette:** clean — all colors are semantic tokens (`accent-9`, `surface-border`, etc.), no raw indigo/violet/slate.
- **V5 emoji:** none in source/test/story.
- **G1 surface:** panel correctly uses `bg-surface-overlay` (overlay surface, per layering rule); group has no surface bg of its own. Correct.
- **E* verbal tells:** JSDoc/comments are terse and clean — no em-dash tic, AI vocabulary, or hedging.
- **forwardRef/displayName:** present (lines 141,359); ref typed to `HTMLDivElement` (correct for the group wrapper).
- **Escape + outside-click close:** wired and tested (test lines 39-52).
- **focus-visible:** present on all three buttons (`:focus-visible:ring-2`), not removed.
