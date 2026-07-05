# ui/tree-view — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:6 P3:4

TreeView is genuinely free of the loud visual AI tells — no accent rail, no gradients, no emoji, no rounded-everything, semantic tokens throughout, real `role="tree"` keyboard wiring. It loses the finish bar on (a) a real controlled/uncontrolled API gap that its own "Controlled" story papers over, (b) an a11y semantics mismatch (focusable `role="presentation"` row), (c) a docs claim the source doesn't honor (`actions` hover-reveal), and (d) motion that animates a layout property with no reduced-motion guard.

## Findings

### [P1][F6] No true controlled mode; the "Controlled" story is not controlled
- **Category:** composability
- **Evidence:** tree-view.tsx:28-44 — props expose only `defaultExpanded` / `defaultSelected` + `onSelect` / `onExpand`; there is no `expanded` / `selected` prop. use-tree.ts:24-29 seeds state once from defaults. tree-view.stories.tsx:73-100 — `ControlledExample` passes `defaultExpanded={expandedIds}` and `onExpand={setExpandedIds}`, but pushing new `expandedIds` back into `defaultExpanded` does nothing (defaults seed initial state only).
- **Why:** A consumer who needs to drive expansion/selection from URL/Redux cannot — the story demonstrates a pattern that silently doesn't work as "controlled."
- **Fix:** Add real controlled props (`expanded`/`selected` + `onExpandedChange`/`onSelectedChange`) to `useTree`/TreeView, or stop calling the story "Controlled" and document the `useTree`-hook-driven pattern as the supported external-state path. Prefer the former for the Card bar.

### [P1][H] Focusable row carries `role="presentation"` — semantics/focus mismatch
- **Category:** a11y
- **Evidence:** tree-item.tsx:125-129 — `<div role="presentation" data-tree-item={itemId} tabIndex={disabled ? -1 : 0} onClick onKeyDown ...>`; the treeitem semantics live on the parent `<li role="treeitem">` (tree-item.tsx:115-123), which is not the focused element.
- **Why:** Focus lands on a node explicitly marked presentational (ignored by AT), so a screen reader gets no role/state when the user tabs/arrows onto the row; `aria-selected`/`aria-expanded` sit on the non-focused `<li>`.
- **Fix:** Make the focusable element the treeitem (move `role="treeitem"` + `aria-*` onto the focusable row, or put `tabIndex` on the `<li>` and focus it). Follow the APG tree pattern where the element with `role="treeitem"` is the tabbable one.

### [P1][M3] Collapse + chevron animations have no reduced-motion guard
- **Category:** motion
- **Evidence:** tree-item.tsx:212-215 — `'grid transition-[grid-template-rows] duration-moderate-02 ease-productive-standard'` (collapse); tree-item.tsx:154-157 — `'transition-transform duration-moderate-02'` on the chevron rotate. Neither has a `motion-reduce:` variant. Contrast the system helper `withReducedMotion` in lib/motion.ts:58 and the project's `motion-reduce` utilities, which the framer-driven components honor.
- **Why:** Users with `prefers-reduced-motion` still get the animated expand/collapse and rotating chevron — a stated motion-system rule (M3).
- **Fix:** Add `motion-reduce:transition-none` to both transitions (or gate duration behind reduced motion).

### [P2][M5] Expand/collapse animates a layout property (grid-template-rows)
- **Category:** motion
- **Evidence:** tree-item.tsx:212-215 — animates `grid-template-rows` `0fr`→`1fr`.
- **Why:** Rubric M5 prefers transform/opacity over layout-driving props; grid-template animation forces layout/reflow of the subtree each frame. (It is the idiomatic CSS-only height-auto collapse, so this is a soft flag — but it is animating layout.)
- **Fix:** Acceptable as-is if reduced-motion is honored; otherwise consider framer `layout`/`height: auto` animation or accept the grid-rows trick as a deliberate choice and document it. At minimum pair with M3 fix.

### [P2][docs/J] Doc claims `actions` reveals on hover; source renders it always
- **Category:** docs
- **Evidence:** docs/components/ui/tree-view.md:60 — "`actions` reveals on row hover (same pattern as Message.Actions)." tree-item.tsx:197-205 — `actions` is rendered unconditionally with no `group-hover`/opacity reveal; the row is not `group` and has no hover-reveal class.
- **Why:** Documented behavior the component does not implement — drift that misleads consumers and AI agents reading the doc.
- **Fix:** Either implement the hover-reveal (`group` on the row + `opacity-0 group-hover:opacity-100 focus-within:opacity-100` on the actions span) or correct the doc to "always visible."

### [P2][F1] `actions` / `secondaryLabel` are bespoke content props, not slots
- **Category:** composability
- **Evidence:** tree-item.tsx:21-23 — `secondaryLabel?: React.ReactNode`, `actions?: React.ReactNode`; rendered into fixed end-of-row regions at tree-item.tsx:190-205.
- **Why:** Card-bar pattern injects rich-region content through composable slots (cf. `CardAction`), not fixed corner props. Two `ml-auto` regions also compete (see P3 below).
- **Fix:** Lower priority for a dense row — acceptable as props given the row's fixed layout — but if pushing to the bar, expose `<TreeItem.Actions>` / `<TreeItem.Meta>` slots or document these as the intentional fixed-region API.

### [P2][H] Row touch target below 44px
- **Category:** a11y
- **Evidence:** tree-item.tsx:131-133 — `py-ds-02 px-ds-02` with `text-ds-sm`; row height ≈ line-height + ~2×ds-02, under the 44px minimum.
- **Why:** Interactive rows below the 44px touch target (rubric H). File-tree density is a legitimate reason to be compact, so soft flag.
- **Fix:** Offer a comfortable/`size` density or document the compact target as deliberate (trees are inherently dense).

### [P2][H] Chevron does not mirror in RTL
- **Category:** a11y
- **Evidence:** tree-item.tsx:151-158 — `IconChevronRight` rotated `rotate-90` when expanded; no `rtl:` mirroring. State matrix requires directional icons to mirror in RTL.
- **Why:** In RTL the collapse chevron should point left; it still points right.
- **Fix:** Add `rtl:-scale-x-100` (or swap to a logical chevron) and verify the expanded rotation direction in RTL.

### [P2][G1] Row hover uses `bg-surface-raised` — invisible when the tree sits inside a card
- **Category:** drift
- **Evidence:** tree-item.tsx:134 — `'hover:bg-surface-raised'`.
- **Why:** `surface-raised` is the surface-2 (card) background. A TreeView placed inside a `Card`/panel (the common case — sidebars, file pickers) gets a hover that equals the container background, so hover feedback disappears. The layering rule wants hover on a surface-2 element to be surface-3.
- **Fix:** Use the hover step for the surrounding surface (e.g. `hover:bg-surface-3` / the system's row-hover token) so hover reads on both page and card backgrounds.

### [P3][I] `depth` is a public prop documented "used internally"
- **Category:** types
- **Evidence:** tree-item.tsx:29-30 — `/** Depth level (used internally) */ depth?: number`; exported on `TreeItemProps` and cloned in at tree-item.tsx:220 / tree-view.tsx:55.
- **Why:** An internal layout prop leaks into the public type surface; a consumer can set a wrong `depth` and break indentation/`aria-level`.
- **Fix:** Move depth to context (already have `TreeContext`) or `@internal` it and omit from the exported props type.

### [P3][G3] No `size`/density axis; off-taxonomy `onSelect` naming
- **Category:** vocabulary
- **Evidence:** tree-view.tsx:26 — `Omit<..., 'onSelect'>` then re-adds `onSelect?: (ids: string[]) => void`; no `size`/`color`/`variant` axis anywhere.
- **Why:** Family standardizes a `size` axis and prefers `onValueChange`-style names for non-input selection (rubric F6/G3). `onSelect` shadows the native DOM handler (hence the Omit).
- **Fix:** Consider `onSelectionChange` and a `size` density axis; low priority.

### [P3][layout] Double `ml-auto` when both `secondaryLabel` and `actions` are set
- **Category:** state-coverage
- **Evidence:** tree-item.tsx:191 (`ml-auto` on secondaryLabel) and tree-item.tsx:199 (`ml-auto` on actions).
- **Why:** Two `ml-auto` siblings split the free space rather than pinning both to the right edge — untested combination (no story/test renders both together).
- **Fix:** Wrap meta+actions in one right-aligned flex group; add a story exercising both slots together.

### [P3][state-coverage] Stories miss disabled / both-slots / RTL / forced-colors / empty
- **Category:** state-coverage
- **Evidence:** tree-view.stories.tsx — stories cover Default, WithCheckboxes, Controlled, CustomIcons, Nested only. No disabled-row, no `secondaryLabel`+`actions`, no RTL, no forced-colors, no empty-tree story.
- **Why:** Card bar shows every applicable state; disabled + actions/meta exist in the API but are demoed only in tests.
- **Fix:** Add stories for disabled rows, a row with secondaryLabel + actions, and an empty tree.

## Composability gaps
- No real controlled mode (`expanded`/`selected` props) — only initial defaults + callbacks; the "Controlled" story doesn't actually control (F6).
- `actions` / `secondaryLabel` are fixed-region props rather than slots; defensible for a dense row but below the slot-composition bar (F1).
- `depth` internal layout prop leaks into the public `TreeItemProps`.
- No `asChild`/polymorphism on the row (rows aren't link/button-shaped by default, so low priority — but a clickable file-tree row often wants to be an `<a>`; no `href`/`asChild` path exists).

## Motion gaps
- No `prefers-reduced-motion` guard on the grid-rows collapse or the chevron rotate (M3).
- Collapse animates `grid-template-rows` (a layout prop) rather than transform/opacity (M5) — idiomatic but layout-driving.
- No press/`active:` feedback on the row (only hover color shift) (M4, minor).

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the focus/semantics mismatch** — make the tabbable element the `role="treeitem"` (or move tabIndex onto the `<li>`), so AT announces role + state on focus. (P1/a11y)
2. **Add real controlled props** (`expanded`/`selected` + `onExpandedChange`/`onSelectedChange`) and rewrite the "Controlled" story to actually control; keep defaults for uncontrolled use. (P1/composability)
3. **Add reduced-motion guards** (`motion-reduce:transition-none`) to the collapse and chevron transitions. (P1/motion)
4. **Reconcile the `actions` hover-reveal doc** — implement `group`+`opacity` reveal or correct the doc; wrap meta+actions in one right-aligned group to kill the double `ml-auto`. (P2)
5. **Fix the hover surface token** so hover reads inside a card (surface-3 row hover), and **mirror the chevron in RTL**. (P2)
6. **Backfill stories** — disabled, secondaryLabel+actions together, empty tree, RTL. (P2/P3)
7. **Internalize `depth`** (context-driven, drop from public props). (P3)

## Clean (rubric dims that pass)
- V1 no accent rail — selected state is a tinted `bg-accent-3 text-accent-11`, not a stripe (tree-item.tsx:136-137).
- V2 no double edge; V3 no gradient text; V4 semantic accent tokens only (no raw indigo/violet/slate as brand); V5 no emoji; V6 no blob/glass/glow; V7 single `rounded-control` radius vocabulary; V8 no pill spam.
- V9 type tokens (`text-ds-sm`, `text-ds-xs`), no hardcoded Inter/Geist.
- G2 tokens not raw values — spacing/radius/duration/color all `ds`/semantic; indentation uses `var(--spacing-ds-05b)` (tree-item.tsx:131).
- E1–E8 verbal: source/doc/story copy is clean — no em-dash tic, no AI vocabulary, no meta-hedging, no emoji.
- A11y baseline good: `role="tree"`, `role="treeitem"`, `aria-expanded`/`aria-selected`/`aria-level`/`aria-multiselectable`, `aria-disabled`, focus-visible ring (`focus-visible:ring-2 focus-visible:ring-accent-9`), full Arrow/Home/End keyboard nav, indeterminate checkbox state, decorative chevron `aria-hidden`+`tabIndex={-1}`. Axe-clean test present (tree-view.test.tsx:180).
- Types: `forwardRef` + `displayName` on both components, no `any`, props exported, `IconInput` typed icon. Disabled handling correct (`tabIndex={-1}`, `pointer-events-none`).
