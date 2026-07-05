# ui/menubar — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:5 P3:2

This is a vendored-Radix compound (zero raw visual tells — no accent rails, gradients, emoji, framework palette). It is well-tokenized and a11y-clean. The gaps are all **family-vocabulary drift vs its siblings DropdownMenu / ContextMenu**, **motion inconsistency** (some parts animate via framer, others via CSS, with dead/confused comments), and **doc↔source drift**. It sits a clear notch below the Card bar because of those drifts and missing state-feedback that its own sibling already has.

## Findings

### [P1][G4] Item interaction vocabulary drifts from DropdownMenu sibling
- **Category:** drift / vocabulary
- **Evidence:** menubar.tsx:202 — `MenubarItem` = `... text-ds-md outline-hidden transition-colors focus:bg-surface-raised focus:text-surface-fg ...` vs dropdown-menu.tsx:240 `... transition-colors duration-fast-01 ease-productive-standard hover:bg-surface-raised focus:bg-surface-raised ... active:bg-surface-raised-hover ...`
- **Why:** The two components share an item vocabulary by design (doc line 34 says so), yet Menubar's item: (a) has **no `hover:` bg** — only `focus:`, (b) has **no `active:` pressed feedback**, (c) uses bare `transition-colors` with **no `duration-*`/`ease-*` token** (uniform/default browser timing). DropdownMenu has all three.
- **Fix:** Mirror DropdownMenu's class exactly: add `duration-fast-01 ease-productive-standard hover:bg-surface-raised active:bg-surface-raised-hover` to `MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioItem`, and `MenubarSubTrigger`.

### [P1][M4] Missing hover + press feedback on menu items
- **Category:** motion / state-coverage
- **Evidence:** menubar.tsx:202, :218 (`MenubarCheckboxItem`), :241 (`MenubarRadioItem`) — all keyed on `focus:` only; no `hover:`/`active:` states.
- **Why:** Mouse users get no hover affordance on items (focus follows pointer in Radix, so it mostly works, but checkbox/radio rows and the pressed state still read flat). The sibling provides `hover:` + `active:` micro-feedback; this is a feedback-motion gap (M4) relative to the finish bar.
- **Fix:** Add `hover:bg-surface-raised active:bg-surface-raised-hover` per item; bind transition to `duration-fast-01 ease-productive-standard`.

### [P1][M3] framer-motion sub-content entrance/exit not reduced-motion guarded
- **Category:** motion / a11y
- **Evidence:** menubar.tsx:132-136 — `<motion.div initial={{opacity:0,scale:0.95}} animate={...} exit={...} transition={{ ...springs.snappy, opacity: tweens.fade }}>`
- **Why:** The global `@media (prefers-reduced-motion: reduce)` in semantic.css:675 zeroes **CSS** animation/transition durations only; it does NOT affect framer-motion's JS-driven spring. So `MenubarSubContent` (and the identical `DropdownMenuSubContent`) still scale-pops for reduced-motion users. `MenubarContent` (CSS `animate-popover-in/out`, menubar.tsx:181) IS covered. Inconsistent guarantee within one component.
- **Fix:** Wrap the framer transition with `useReducedMotion()` (framer) → fall back to `withReducedMotion()` (already in lib/motion.ts:58) or a duration-0/opacity-only variant. Apply to both Menubar and DropdownMenu sub-content.

### [P1][J] Doc claims a controlled-open API the code path comments contradict; MenubarMenu ships dead/confused commentary
- **Category:** docs / structural-tell
- **Evidence:** menubar.md:37 "**Controlled open:** Pass `value` + `onValueChange` to Menubar root…" — but menubar.tsx:16-32 `MenubarMenu` body is a 4-paragraph stream-of-consciousness comment ("the cleanest way is…", "Alternative:…", "We'll use a simpler approach:") that resolves to a bare `<MenubarPrimitive.Menu {...props} />` passthrough, plus a second orphaned comment block at :151-159 inside `MenubarContent`.
- **Why:** The comments are an AI/working-draft tell shipped in source — they narrate indecision and describe approaches that were never implemented. They also create doubt about whether the doc's controlled-open claim is real (it is, but on Root, not Menu — the comments muddy it). E8/over-structuring + verbal residue in code.
- **Fix:** Delete the comment blocks at :16-32 and :151-159. Collapse `MenubarMenu` to `const MenubarMenu = MenubarPrimitive.Menu` (it adds nothing). Verify the doc's `value`/`onValueChange` claim against the Root prop surface and keep it only if accurate.

### [P2][M2] Inconsistent animation strategy: Content uses CSS, SubContent uses framer
- **Category:** motion
- **Evidence:** menubar.tsx:181 `MenubarContent` → `data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out` (CSS); menubar.tsx:132 `MenubarSubContent` → framer `motion.div` with spring.
- **Why:** Two animation systems in one component for the same conceptual gesture (a popover scaling in). The code comment (:161-164) explains *why* (Menu doesn't expose open state) but the result is timing divergence: CSS popover-in is 150ms productive-entrance; the sub uses `springs.snappy` (stiffness 500). Same family, two feels.
- **Fix:** Either drive both via CSS keyframes (preferred for consistency — sub-content can use the same `data-[state]` + `animate-popover-in/out`), or document the divergence as intentional. CSS path also fixes the M3 reduced-motion gap for free.

### [P2][G2] Hardcoded radio-dot dimensions instead of an icon/token
- **Category:** drift
- **Evidence:** menubar.tsx:248 — `<IconCircle className="h-2 w-2 fill-current" />`
- **Why:** Raw `h-2 w-2` (8px) escapes the icon-size token system (`h-ico-sm` etc. used everywhere else in this file). Minor token re-roll. (Sibling DropdownMenu does the same, so it's consistent drift — still a re-roll.)
- **Fix:** Use an `ico-*` token or a sized `<Icon>` for the indicator dot.

### [P2][H] No stories/tests for checkbox, radio, sub-menu, disabled-hover, or RTL states
- **Category:** state-coverage / docs
- **Evidence:** menubar.stories.tsx has a single `Default` story (items + shortcuts + separators only); menubar.test.tsx covers checkbox-fires + disabled-renders but no story demonstrates `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarSub`, `inset`, or RTL/forced-colors.
- **Why:** Card bar requires applicable states shown in stories OR tests. Sub-menus, radio groups, and the `inset` prop ship with no visual coverage; the chevron in `MenubarSubTrigger` does not mirror in RTL (no `rtl:` handling, IconChevronRight is directional).
- **Fix:** Add stories: WithCheckboxAndRadio, WithSubmenu, Inset, RTL. Add `rtl:rotate-180` (or logical chevron) to `MenubarSubTrigger`'s chevron for directional mirroring.

### [P2][M5/M4] Trigger has no motion token on its transition; relies on bare `transition-colors`
- **Category:** motion
- **Evidence:** menubar.tsx:88 — `MenubarTrigger` = `... outline-hidden transition-colors hover:bg-surface-raised-hover focus-visible:bg-surface-raised-hover data-[state=open]:bg-surface-raised-hover`
- **Why:** Hover/focus feedback exists (good) but the transition has no `duration-*`/`ease-*` token — default UA timing. Uniform-timing reflex (M2) and divergence from DropdownMenu items which bind `duration-fast-01 ease-productive-standard`.
- **Fix:** Add `duration-fast-01 ease-productive-standard`.

### [P3][docs] Doc "Changes" stops at v0.18.0; no entry for current motion/animation behavior
- **Category:** docs
- **Evidence:** menubar.md:45-53 — last changelog entry v0.18.0; the framer-motion sub-content + CSS popover animations are undocumented.
- **Why:** Per-component doc stale relative to source motion behavior.
- **Fix:** Add a Changes entry when the above motion fixes land.

### [P3][types] `MenubarMenu`/`MenubarSub` typed as `React.FC`
- **Category:** types
- **Evidence:** menubar.tsx:16 `const MenubarMenu: React.FC<...>`, :37 `const MenubarSub: React.FC<...>`
- **Why:** Rubric I flags `React.FC`. Minor; consistent with DropdownMenu sibling. If `MenubarMenu` collapses to a primitive re-export (see J fix), this disappears.
- **Fix:** Drop `React.FC`; type as explicit function returning `ReactElement`, or re-export the primitive.

## Composability gaps
- **F2 (partial, acceptable):** `MenubarTrigger` has no explicit `asChild`, but it forwards to `MenubarPrimitive.Trigger` which supports `asChild` via spread — so consumers can still polymorph. Not a real gap; noting for completeness.
- **F6 (clean):** `MenubarSub` correctly implements the controlled/uncontrolled pattern (`open`/`defaultOpen`/`onOpenChange`, menubar.tsx:37-60), matching the sibling. Good.
- **F4/F5 (clean):** Pure slot-based compound built on the vendored primitive — does not re-roll surface (uses `bg-surface-overlay`, `shadow-floating`/`shadow-raised` like its family). Composes the primitive correctly.
- **Real gap:** `MenubarMenu` is a no-op wrapper that adds only confused comments (see J). It should be a primitive re-export — the wrapper is composability noise, not a slot.

## Motion gaps
- **M3:** framer sub-content scale-pop ignores `prefers-reduced-motion` (CSS guard doesn't reach framer JS). Real, P1.
- **M2:** Two animation systems (CSS popover for Content, framer spring for SubContent) → divergent timing for the same gesture.
- **M4:** Items lack `hover:`/`active:` feedback that the sibling has; triggers/items lack `duration-*`/`ease-*` tokens (default UA timing).
- **Clean:** No bounce-by-default (`springs.snappy` is intentional, no overshoot); `MenubarContent` exit handled via CSS `popover-out`; no layout-prop animation (transform/opacity only).

## Polish plan (ordered steps to reach the finish bar)
1. **Unify item vocabulary with DropdownMenu** — copy the exact item/checkbox/radio/subtrigger class string (adds `hover:bg-surface-raised`, `active:bg-surface-raised-hover`, `duration-fast-01 ease-productive-standard`). Closes G4, M4, M2-on-items.
2. **Add the same `duration-fast-01 ease-productive-standard`** to `MenubarTrigger`. Closes the trigger timing reflex.
3. **Reduced-motion guard the framer sub-content** (`useReducedMotion()` → `withReducedMotion`) — or, preferably, convert `MenubarSubContent` to the CSS `animate-popover-in/out` path so both Content and SubContent share one system. Closes M3 + M2.
4. **Delete the dead comment blocks** (:16-32, :151-159) and collapse `MenubarMenu`/drop `React.FC`. Closes J + the types nit.
5. **Tokenize the radio dot** (`h-2 w-2` → ico token).
6. **Add stories** for checkbox/radio, submenu, inset, RTL; add directional chevron mirroring (`rtl:rotate-180`) to `MenubarSubTrigger`.
7. **Refresh the doc** Changes section + verify the controlled-open claim.

## Clean (rubric dims that pass)
- **A (visual tells):** No accent rail (V1), no double-edge (single `shadow-raised`/`shadow-floating`, no border+shadow), no gradient text (V3), no framework palette — all semantic tokens (V4), no emoji icons (lucide/tabler via Icon API) (V5), no blob/glass/glow (V6), single radius vocabulary `rounded-overlay`/`rounded-control` (V7), no pill spam (V8).
- **B:** No safe-face font (uses `text-ds-md`), no decorative numbering, no eyebrow kicker, no all-caps default.
- **E (verbal):** Doc + JSDoc are clean — no em-dash tic abuse, no AI vocabulary, no hedging. (The *code comments* are the only verbal residue — flagged under J.)
- **F:** Slot-based compound, composes the primitive, correct controlled/uncontrolled on Sub.
- **G1 (surface):** `bg-surface-overlay` for menu panels is the canonical overlay vocabulary shared with DropdownMenu/ContextMenu — correct, not a drift.
- **H (a11y baseline):** Real `role="menubar"`/`menuitem` semantics via Radix, keyboard nav, `data-disabled` + `opacity-action-disabled`, `outline-hidden` paired with `focus-visible:`/`focus:` bg replacement, axe-clean test (menubar.test.tsx:152).
- **I:** `forwardRef` + `displayName` on every part; no `any`; type exports present.
