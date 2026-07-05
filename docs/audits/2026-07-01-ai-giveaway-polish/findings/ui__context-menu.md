# ui/context-menu — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

This is a thin, well-behaved Radix-menu wrapper. No hard AI tells (no accent rail, no gradient text, no framework palette, no emoji, no rounded-everything). All values use DS tokens. The gaps are all polish/vocabulary-drift relative to its sibling `dropdown-menu.tsx` (which is the more-finished twin) and the Card bar — not slop.

## Findings

### [P1][G4] Item vocabulary drift from sibling DropdownMenu
- **Category:** vocabulary / drift
- **Evidence:** context-menu.tsx:82 `ContextMenuSubTrigger` className = `"flex cursor-default select-none items-center rounded-control px-ds-03 py-ds-02b ..."` vs dropdown-menu.tsx:146 which adds `gap-ds-03 ... [&_svg]:pointer-events-none [&_svg]:h-ico-sm [&_svg]:w-ico-sm [&_svg]:shrink-0` and wraps children in `<span className="min-w-0 truncate">`.
- **Why:** Two menus built from the same Radix `react-menu` primitive ship divergent item styling — ContextMenu items have no leading-icon gap, no SVG auto-sizing, and no long-label truncation, so a ContextMenuItem with an icon + long label renders differently (and can overflow) where the identical DropdownMenuItem would not.
- **Fix:** Lift the item/subtrigger className strings into one shared `menuItemClasses`/`menuSubTriggerClasses` constant (or a `lib/menu-classes.ts`) imported by both files. At minimum, port `gap-ds-03`, the `[&_svg]` sizing block, and the `min-w-0 truncate` child wrapper into ContextMenu.

### [P1][F4] `inset` boolean where a leading-icon slot is the real need
- **Category:** composability
- **Evidence:** context-menu.tsx:76-77,167-168,231 — `inset?: boolean` on SubTrigger/Item/Label adds `pl-ds-07` to fake-align text with checkbox/radio rows.
- **Why:** `inset` is a presentational crutch (manual left-pad to line up with indicator rows) rather than a real leading-icon/indicator slot. It's the Radix-shadcn default and is carried verbatim. Not slop, but it's the kind of bespoke boolean the Card bar replaces with structural composition. (Sibling DropdownMenu carries the same wart — fix together.)
- **Fix:** Acceptable to keep for parity, but the finish-bar move is a real start-slot pattern (icon column that all item types share) so alignment is structural, not a hand-tuned `pl-ds-07`. Track as a family-wide refactor.

### [P2][M3] Entrance/exit scale animation has no in-component reduced-motion guard
- **Category:** motion
- **Evidence:** context-menu.tsx:110-113 (Content) and 144-148 (SubContent) — `initial={{ opacity: 0, scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ ...springs.snappy, opacity: tweens.fade }}`. No `useReducedMotion`/`useMotion()` check; `withReducedMotion` helper (lib/motion.ts:58) is unused here.
- **Why:** Relies entirely on the consumer wrapping the tree in `<MotionProvider>` → `MotionConfig reducedMotion="user"`. FM's MotionConfig auto-disables the transform (scale) but keeps opacity, so it mostly degrades gracefully — but with no provider there is zero reduced-motion respect. Sibling DropdownMenu has the identical gap, so this is a family pattern, not a regression.
- **Fix:** Either document that MotionProvider is required for reduced-motion, or read `useMotion().reducedMotion` and swap to an instant transition (consistent with `ai/blocks/*` which already do `const { reducedMotion } = useMotion()`).

### [P2][G1] Item focus highlight uses `bg-surface-raised` on a `bg-surface-overlay` panel
- **Category:** drift / state-coverage
- **Evidence:** context-menu.tsx:82,173,189,213 `focus:bg-surface-raised focus:text-surface-fg`; panel is `bg-surface-overlay` (line 115, 150).
- **Why:** The focused/active item tint is `surface-raised` (the card surface, level 2) painted on top of an overlay (level 1). It reads fine and matches DropdownMenu, but it's mixing surface levels for a hover/active state where the layering rule would point at a `surface-3`-style step (e.g. `accent-3`/`surface-3`). Flagging for family consistency review, not a hard break.
- **Fix:** Decide one canonical "menu item active" token across DropdownMenu + ContextMenu (e.g. `focus:bg-surface-3` or an `accent` soft step) and apply to both.

### [P2][H] State coverage: no hover/keyboard-nav or RTL/forced-colors story or test
- **Category:** state-coverage
- **Evidence:** context-menu.test.tsx covers open/select/checkbox/radio/sub/axe; context-menu.stories.tsx has Default/WithSubmenu/WithCheckboxAndRadio. Neither exercises `disabled` rendering in a story, focus-visible ring, RTL (sub-menu/chevron mirroring), or forced-colors.
- **Why:** The matrix in section H wants disabled/focus/RTL/forced-colors demonstrated somewhere. `ContextMenuItem` disabled is tested but not shown in a story; chevron (`IconChevronRight`, line 89) does not mirror under RTL and there's no coverage proving it should/shouldn't.
- **Fix:** Add a `Disabled`/`States` story and an RTL note (chevron should point left in RTL — Radix handles `dir`, verify). Optionally a forced-colors visual check.

### [P2][V2] Double-edge risk on overlay panels (shadow + implicit no border is fine; flag the focus combo)
- **Category:** visual-tell
- **Evidence:** context-menu.tsx:115,150 — panels use `shadow-floating` with no border (good, single edge). No V2 violation on the panel itself.
- **Why:** Listed only to record it was checked and is **clean** — elevation-only, matches the Card make-kit rule. No action.
- **Fix:** None. (Kept in table so synthesis sees V2 was evaluated; downgrade/ignore.)

### [P3][I] Root + Shortcut typed as `React.FC`
- **Category:** types
- **Evidence:** context-menu.tsx:17 `const ContextMenu: React.FC<...>`, :45 `ContextMenuSub: React.FC<...>`, :258 `ContextMenuShortcut = (...) => {...}` (plain fn, no ref forwarding).
- **Why:** Section I flags `React.FC`. Here it's defensible — `Root`/`Sub` are state containers that render no DOM of their own, and the underlying Radix `Root`/`Sub` are themselves `React.FC` (primitive .d.ts:14,70). `ContextMenuShortcut` is a display-only span with no `forwardRef`/`displayName`-via-forwardRef (it sets `.displayName` manually). Low impact.
- **Fix:** Leave `Root`/`Sub` as-is (matches primitive). Optionally `forwardRef` `ContextMenuShortcut` for ref parity with the other parts.

### [P3][J] Doc compound list omits `ContextMenuShortcut` and `ContextMenuGroup`/`ContextMenuPortal`
- **Category:** docs
- **Evidence:** context-menu.md:7-16 compound tree lists Item/Checkbox/Radio/Label/Separator/Sub but not `ContextMenuShortcut` (exported, used in stories) nor `ContextMenuGroup`/`ContextMenuPortal` (both exported, lines 41-43, 277-293).
- **Why:** Per-component doc's part inventory is incomplete vs the export surface; minor parity gap (section J).
- **Fix:** Add `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal` to the compound list. The DropdownMenu JSDoc already documents all parts — mirror that.

## Composability gaps
- **Shared item-class source missing (F4/G4):** ContextMenu and DropdownMenu hand-duplicate near-identical item/subtrigger/checkbox/radio className strings. They've already drifted (gap, svg-sizing, truncate present in Dropdown, absent here). One shared constant module would make them a single vocabulary.
- **`inset` boolean instead of a structural leading slot (F4):** carried from shadcn; a real icon/indicator column would remove the manual `pl-ds-07`.
- **No bespoke-prop-vs-slot violations otherwise:** every part is a thin pass-through to the Radix primitive (good — composes, doesn't re-roll). `asChild` is available on Trigger via the primitive and documented (md:34). Controlled/uncontrolled is correct: Radix context-menu Root has no `open` prop by design (right-click only), and `ContextMenuSub` correctly implements controlled+uncontrolled (lines 45-68). No F6 gap.

## Motion gaps
- **No in-component reduced-motion guard (M3):** scale entrance/exit depends on a consumer-provided MotionProvider; helper `withReducedMotion` unused.
- **Otherwise intentional:** uses `springs.snappy` for transform + `tweens.fade` for opacity (M2-correct: differentiated spring vs tween, not uniform). No bounce-by-default (M1 clean — `snappy` is stiffness 500/damping 30, no overshoot). Animates `scale`+`opacity` (transform/opacity), not layout props (M5 clean). Has entrance AND exit via AnimatePresence + forceMount (M4 clean).

## Polish plan (ordered steps to reach the finish bar)
1. **De-duplicate item styling with DropdownMenu** — extract shared `menuItemClasses` / `menuSubTriggerClasses` / indicator-row classes into `lib/menu-classes.ts`; import in both. This auto-fixes G4 and pulls in the missing `gap-ds-03`, `[&_svg]` sizing, and `min-w-0 truncate`.
2. **Add reduced-motion respect** — read `useMotion().reducedMotion` (or document MotionProvider as required) and short-circuit the scale transition to instant. Mirror across the menu family.
3. **Unify the "active item" surface token** — pick one (`surface-3` or accent-soft) for focus/highlight across ContextMenu + DropdownMenu (G1).
4. **Story/test coverage** — add a Disabled/States story; add an RTL check for the sub-trigger chevron.
5. **Doc parity** — list Shortcut/Group/Portal in context-menu.md; mirror DropdownMenu's full-part JSDoc block onto the ContextMenu root for discoverability.
6. **(Optional) `forwardRef` ContextMenuShortcut** for ref parity.

## Clean (rubric dims that pass)
- **V1** no accent rail. **V3** no gradient text. **V4** no indigo/violet/slate-as-brand — only semantic surface/accent tokens. **V5** no emoji (real icons via `Icon` + tabler). **V6** no blob/glass/glow (`shadow-floating` is intentional elevation). **V7** one radius vocabulary (`rounded-control`, `rounded-overlay`). **V8** no pill spam.
- **V2** single edge — overlay panels use shadow, no border.
- **G2** no re-rolled tokens — all spacing `*-ds-*`, no bare `shadow`/`rounded`/`bg-gradient-to-*`/`w-[--var]`. `h-px` separator is the one literal and is correct for a 1px rule.
- **G3** N/A — no CVA variant axes (thin primitive wrapper).
- **F2/F5** composes the Radix primitive directly; `asChild` available on Trigger; does not re-roll surface.
- **E1–E8** docs/JSDoc/stories clean — no em-dash tic abuse, no AI vocabulary, no over-structuring. (Doc uses `—` sparingly and correctly as punctuation, not as a stylistic connector tic.)
- **Motion M1/M2/M4/M5** intentional and differentiated (see Motion gaps).
- **A11y** axe-clean test present (context-menu.test.tsx:155); disabled item carries `data-[disabled]:pointer-events-none` + `opacity-action-disabled`; keyboard model inherited from Radix.
