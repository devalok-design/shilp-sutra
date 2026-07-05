# composed/multi-select-popover — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:5 P3:2

Source: `packages/core/src/composed/multi-select-popover.tsx`
Test: `packages/core/src/composed/multi-select-popover.test.tsx`
Story: `packages/core/src/composed/multi-select-popover.stories.tsx`
Doc: `packages/core/docs/components/composed/multi-select-popover.md`

Overall: no hard visual tells (no accent rail, no gradient text, no framework-palette brand color, no emoji, no glass/blob). It composes the real `Popover` primitive and uses design tokens throughout. The gaps are motion (staggered-list entrance with no reduced-motion guard), a11y/state-coverage holes (no keyboard toggle on selected via space, missing `aria-disabled`/`role` niceties, disabled items still animate), and composability reflexes (flat prop surface where slots would fit, no `defaultValue`/uncontrolled mode, `renderItem` render-prop instead of a slot). Motion is the main thing keeping it off the Card bar.

## Findings

### [P1][M3] Staggered list entrance has no reduced-motion guard
- **Category:** motion
- **Evidence:** multi-select-popover.tsx:209-211 — `initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springs.snappy, delay: index * 0.02 }}`
- **Why:** Every item slides + fades in on a per-index delay with no `useReducedMotion()` check; a long list becomes a cascading wipe for motion-sensitive users. 30+ sibling components (button, sheet, empty-state, stat-flash) gate motion via `useReducedMotion`; this one doesn't.
- **Fix:** Read `const reduce = useReducedMotion()` and set `initial={reduce ? false : {...}}` plus `delay: reduce ? 0 : index * 0.02`; or drop the per-item entrance entirely (a filter list that re-mounts on every keystroke shouldn't re-animate).

### [P1][M2] Per-item stagger re-fires on every search keystroke
- **Category:** motion / state-coverage
- **Evidence:** multi-select-popover.tsx:193-211 — `let itemCounter = 0` recomputed each render; `delay: index * 0.02` on each `motion.button` keyed by `item.id`, filtered list changes as `search` state changes (line 275 `onChange`).
- **Why:** Because `filteredItems` shrinks/re-orders per keystroke, remounted rows replay the slide-in — the list jitters while typing. This is the "robotic/uniform-timing that means nothing" motion tell; entrance animation on a live-filtered list is decorative, not communicative.
- **Fix:** Remove the entrance animation from filtered rows, or animate the list container once on popover open (via `AnimatePresence`/`stagger` on mount) rather than per-row on every filter pass.

### [P1][F6] No uncontrolled mode / `defaultValue`
- **Category:** composability
- **Evidence:** multi-select-popover.tsx:39-42 — `value: string[]` and `onValueChange` are both required, no `defaultValue?: string[]`.
- **Why:** Rubric F6 — supports `value` but not `defaultValue`; consumers who just want a self-managing multi-select must wire their own state (every story and the test does exactly this boilerplate: `const [selected, setSelected] = useState`). `onValueChange` naming is correct, but the controlled-only contract is a gap vs. the DS convention.
- **Fix:** Make `value`/`onValueChange` optional, add `defaultValue?: string[]`, and internally fall back to a `useState(defaultValue ?? [])` when uncontrolled (mirror the pattern already in `Popover` itself, popover.tsx:16-32).

### [P1][F1] `renderItem` render-prop where a slot / compound child fits
- **Category:** composability
- **Evidence:** multi-select-popover.tsx:49-50, 221-223 — `renderItem?: (item, selected) => React.ReactNode`; consumed as `<span className="flex-1 min-w-0">{renderItem(item, isSelected)}</span>`.
- **Why:** The whole component is a monolithic data-driven black box (items in, one render-prop escape hatch out). Card-bar composition would expose the item row / search / empty regions as slots (`MultiSelectPopover.Item`, `.Search`, `.Empty`) or at least let the trigger and content compose. A single render-prop is the reflex, not composition.
- **Fix:** Keep `renderItem` for back-compat but consider a compound API (`MultiSelectPopover.Item`) so custom rows, disabled affordances, and the check indicator compose instead of forcing the consumer to re-implement the row shell.

### [P2][H] Selected items animate/scale but disabled items still play entrance + are keyboard-skippable inconsistently
- **Category:** state-coverage / a11y
- **Evidence:** multi-select-popover.tsx:206-208 `disabled={item.disabled}` on the `motion.button`; line 216 `disabled:opacity-action-disabled disabled:cursor-not-allowed`; keyboard handler multi-select-popover.tsx:186-190 checks `!item.disabled` for Enter but ArrowUp/Down (lines 180-185) still land focus on disabled rows.
- **Why:** Arrow navigation can focus a disabled row (it's counted in `filteredItems.length`), then Enter no-ops silently — a dead keystroke. Disabled state is visually handled but not fully handled in keyboard nav.
- **Fix:** Skip disabled items when advancing `focusedIndex`, or expose them as non-focusable; add `aria-disabled` alongside `disabled` for AT clarity.

### [P2][H] `role="listbox"` on a `<div>` with no `aria-label`, and options aren't keyboard-reachable by roving tabindex
- **Category:** a11y
- **Evidence:** multi-select-popover.tsx:285 `<div ref={listRef} role="listbox" aria-multiselectable="true">`; items are `<button role="option">` (line 200-205). Focus is virtual (`aria-activedescendant` on the input, line 278) but the listbox has no accessible name.
- **Why:** A `role="listbox"` needs an accessible name (`aria-label`/`aria-labelledby`). Also mixing real `<button>` focusables with an `aria-activedescendant` virtual-focus model on the input is a split focus model — buttons are individually tabbable AND the input drives active descendant, which can double-announce.
- **Fix:** Add `aria-label` to the listbox; make option buttons `tabIndex={-1}` so the input's `aria-activedescendant` is the single focus source, or drop activedescendant and use true roving focus. Add a11y assertions to the test (currently zero axe/role coverage in the test file).

### [P2][H] No keyboard toggle by Space; Enter-only, and native button semantics fight the virtual-focus model
- **Category:** a11y / state-coverage
- **Evidence:** multi-select-popover.tsx:186-190 — only `Enter` toggles via `handleSearchKeyDown`; Space typed in the search input inserts a space (correct for a textbox) but there's no way to toggle the active-descendant row by keyboard other than Enter.
- **Why:** Fine for a combobox pattern, but worth noting the row `<button>`s, when tabbed to directly, respond to Space/Enter natively — two different interaction models depending on how you got there. Inconsistent.
- **Fix:** Commit to one model (virtual focus via input, buttons non-tabbable) and document Enter as the toggle key.

### [P2][M4] Popover width is fixed via inline style, `maxSelections` replace has no feedback motion
- **Category:** motion / state-coverage
- **Evidence:** multi-select-popover.tsx:264 `style={{ width: width ?? 240 }}`; toggle FIFO-replace at multi-select-popover.tsx:154-159 silently drops the oldest selection.
- **Why:** When `maxSelections` is hit, an existing selection's check silently disappears with no motion/feedback — the user doesn't see what got bumped. Rubric M4 (missing feedback motion on a meaningful state change).
- **Fix:** Animate the deselected row's check out (`AnimatePresence` on the check span) so the FIFO replacement is visible.

### [P2][J] Doc prop table omits `disabled` interaction, keyboard model, and reduced-motion; no story for disabled / async / empty / maxSelections
- **Category:** docs / state-coverage
- **Evidence:** stories only cover Default, WithGroups, PreSelected, WithDescription (multi-select-popover.stories.tsx:37-121) — no `onSearch` async, no `maxSelections`, no `disabled` item, no empty state, no `renderItem` story. Doc (multi-select-popover.md) has no keyboard/a11y section.
- **Why:** Rubric H requires applicable states demonstrated in stories OR tests; loading (`Spinner`), async, disabled, and empty are all shipped code paths with no visual coverage. Card/StatCard demonstrate their states.
- **Fix:** Add stories: AsyncSearch (with `onSearch` + loading spinner), MaxSelections, DisabledItems, Empty, CustomRenderItem. Add a Keyboard/A11y section to the doc.

### [P3][G2] Hardcoded `max-h-[240px]` arbitrary value instead of a token
- **Category:** drift
- **Evidence:** multi-select-popover.tsx:285 `className="max-h-[240px] overflow-y-auto py-ds-02"`
- **Why:** Arbitrary px in an arbitrary-value bracket rather than a spacing/size token. Minor, but it's a raw value the token system could own; also the default `width` fallback `240` (line 264) is a magic number duplicated conceptually.
- **Fix:** Use a `--spacing-ds-*` / size token or a named max-height utility; extract the `240` default width to a named constant shared with the max-height if they're meant to relate.

### [P3][I] `image` rendered as bare `<img>` with `src` and empty `alt`, no width/height reservation
- **Category:** types / a11y
- **Evidence:** multi-select-popover.tsx:225-231 — `<img src={item.image} alt="" className="h-ico-md w-ico-md rounded-pill object-cover shrink-0" />`
- **Why:** `alt=""` (decorative) is defensible next to the label, but there's no `loading`/decoding hint and no fallback for broken images; a design-system avatar row would typically reuse the `Avatar` primitive rather than a raw `<img>`.
- **Fix:** Consider composing the `Avatar` component (fallback initials, consistent ring) instead of a raw `<img>`; at minimum add `loading="lazy"`.

## Composability gaps
- **Controlled-only** — no `defaultValue` / uncontrolled fallback (F6). Every consumer must own state; boilerplate repeated in all 4 stories + test.
- **Monolithic data-in API** — items/groups/renderItem is a black box; no compound slots for Item / Search / Empty / Footer (F1). The trigger is the only real slot (`children`).
- **`renderItem` render-prop** rather than a composable child (F1) — the reflex escape hatch.
- **No `asChild` on the content** and no way to inject a footer/action bar (e.g. "Clear all" / "Done") — common multi-select need with nowhere to put it.
- Does compose the base `Popover` primitive correctly (good — not an F5 re-roll of surface/overlay).

## Motion gaps
- **No `useReducedMotion` guard anywhere** in the component (M3) — the per-item slide-in, the check `springs.bouncy` scale-in (line 242-244), all play regardless of the user's reduced-motion setting. Sibling components read `useReducedMotion`; this one is the outlier.
- **Per-item entrance stagger re-fires on every keystroke** (M2) — decorative, jittery, and meaningless on a live-filtered list.
- **No exit/feedback motion on FIFO replacement** (M4) — silently dropped selection has no visible transition.
- `springs.bouncy` on the check-mark is acceptable (matches StatCard's deliberate delta-feedback moment) — not flagged as an M1 overshoot tell.

## Polish plan (ordered steps to reach the finish bar)
1. **Gate all motion behind `useReducedMotion()`** — `initial={reduce ? false : ...}`, `delay: reduce ? 0 : ...`. (M3, the single biggest finish gap.)
2. **Kill or rework the per-item entrance stagger** so it doesn't replay on every filter keystroke — animate the list once on open, not per-row per-render. (M2)
3. **Add uncontrolled mode** — optional `value`, `defaultValue`, internal state fallback mirroring `Popover`. (F6)
4. **Fix keyboard/a11y**: skip disabled rows in arrow nav, add `aria-disabled`, give the listbox an `aria-label`, commit to a single focus model (virtual via input → option buttons `tabIndex={-1}`). (H)
5. **Add feedback motion** for FIFO `maxSelections` replacement (animate the bumped check out). (M4)
6. **Expand stories + tests** to cover async/loading, disabled, empty, maxSelections, renderItem; add axe/keyboard assertions. (J, H)
7. **Tokenize** `max-h-[240px]` and the `240` default width; consider `Avatar` for the image row. (G2, I)

## Clean (rubric dims that pass)
- **V1 accent rail:** none — no colored left/top stripe anywhere.
- **V2 double edge:** overlay uses `bg-surface-overlay` + shadow via the Popover primitive; the list rows use bg-only hover, no border+shadow doubling.
- **V3 gradient text / V4 framework palette:** none — no `bg-clip-text`, no `indigo/violet/slate` as brand; uses `accent-2/accent-11` semantic tokens.
- **V5 emoji:** none in source, story, or doc.
- **V6 blob/glass/glow / V7 rounded-everything / V8 pill spam:** none — `rounded-pill` only on the avatar image (legitimate) and progress not present here.
- **V9 font:** uses `font-body` / `text-ds-*` tokens, no hardcoded Inter/Geist.
- **V12 eyebrow / V14 all-caps:** the group header uses `uppercase tracking-wider` (line 289) — this is a single load-bearing section label (group name), an accepted use, not all-caps-everywhere.
- **G1 surface:** overlay content correctly uses `bg-surface-overlay` (surface-1 tier is correct for popovers per the layering rule); no surface drift.
- **G2 tokens (mostly):** spacing/radius/color via tokens; only `max-h-[240px]` and magic `240` are raw.
- **G3 variant taxonomy:** N/A — no CVA variant axes; `align` mirrors the Popover primitive's own prop.
- **F5 base primitive:** composes real `Popover`/`PopoverContent`/`PopoverTrigger` — does not re-roll overlay surface.
- **E1–E8 verbal:** doc + JSDoc are clean — no em-dash tic as connector, no AI vocabulary, no meta-hedging, no tricolon padding.
- **Types:** proper `forwardRef` + `displayName`, exported prop/item/group interfaces, no `any`, `onValueChange` (not `onChange`) naming is correct DS convention.
