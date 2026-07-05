# composed/master-detail — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:5 P2:5 P3:2

MasterDetail is not an AI-slop shell — the single most recognizable tell (V1 accent rail) was already killed on the active row in `0e453984` (now a tinted `bg-accent-2` row, not a `border-l-4`). Tokens are used throughout; no gradients, emoji, or default-palette colors. What holds it back from the Card bar is **structural/composability + a11y correctness**: a real keyboard/selection state bug, a missing reduced-motion guard, no `asChild` on list items, a controlled-only selection model with no `onSelect`, and thin state coverage (no empty/loading/RTL/disabled shown or handled). This is a "solid but unfinished" composed component, not a giveaway.

## Findings

### [P0][F6/H] `activeIndex` (roving focus) is disconnected from `selected` — keyboard nav starts at wrong item and desyncs
- **Category:** state-coverage
- **Evidence:** master-detail.tsx:245 — `const [activeIndex, setActiveIndex] = React.useState(0)`; :157 `tabIndex: i === activeIndex ? 0 : -1`; :51 `selected?: string | null` never feeds `activeIndex`.
- **Why:** The roving-tabindex focus target is initialized to index 0 and only moved by arrow keys — it never syncs to the `selected` prop. If a consumer mounts with `selected="3"`, Tab still lands on item 0, and after clicking item 4 with the mouse the next ArrowDown jumps back near index 0. Keyboard and pointer selection diverge — a broken interaction guarantee for a listbox.
- **Fix:** Derive the initial/active index from `selected` (map `selected` → child index), or expose an `onSelect(id)` and drive `activeIndex` off the selected item. At minimum, resync `activeIndex` to the selected item's index in an effect when `selected` changes.

### [P1][M3] Detail-pane slide animation has no reduced-motion guard
- **Category:** motion
- **Evidence:** master-detail.tsx:180-186 — `<motion.div initial={isMobile ? { x: 20, opacity: 0 } : false} … exit={isMobile ? { x: -20, opacity: 0 } : undefined} transition={springs.snappy}>`
- **Why:** The mobile drill-in slides content 20px on the x-axis every navigation with no `prefers-reduced-motion` check. The repo ships `withReducedMotion()` in `ui/lib/motion.ts:58` and a `MotionConfig` system precisely for this; this component ignores both. Users with reduced-motion set get the full slide.
- **Fix:** Gate the x-offset behind `useReducedMotion()` (framer) — collapse `initial`/`exit` to opacity-only or `false` when reduced; or wrap the transition in `withReducedMotion`.

### [P1][F2] `MasterDetail.ListItem` hardcodes `<button>` with no `asChild` / polymorphism
- **Category:** composability
- **Evidence:** master-detail.tsx:205 — `<button ref={ref} type="button" role="option" …>`; consumers commonly want a list row to be an `<a href>` (navigable, right-click-open, prefetch).
- **Why:** Master-detail lists are frequently link lists (navigate to `/items/:id`). Forcing a `<button>` means no real anchor semantics; the pattern StatCard solved via `useLink()`/`href` and the DS's general `asChild` convention is absent here. Consumers must re-roll the row to get a link.
- **Fix:** Add `asChild` (Slot) to `ListItem`, or an `href`/`as` escape hatch, so the row can render as an anchor while keeping `role="option"` and roving tabindex.

### [P1][F6] Selection is controlled-only — no `onSelect`/`onValueChange`, no `defaultSelected`
- **Category:** composability
- **Evidence:** master-detail.tsx:51 `selected?: string | null` + :53 `onBack`; there is no `onSelect`/`onValueChange` and no `defaultSelected`. Selection is wired entirely by the consumer putting `onClick` on each `ListItem` (see stories.tsx:36).
- **Why:** The component owns `role="listbox"`/`role="option"` and `aria-selected`, but doesn't own selection — the consumer must manually thread `active={id===selected}` AND `onClick` on every item and keep them in sync. A composed listbox should offer at least an uncontrolled mode (`defaultSelected`) and a single `onSelect(id)` so `active`/`aria-selected` are derived, not hand-wired. This is the same controlled/uncontrolled gap F6 targets.
- **Fix:** Add `onSelect?(id: string)` and `defaultSelected`, derive each item's `active`/`aria-selected` from context by giving `ListItem` a `value`/`id` prop, and support uncontrolled selection.

### [P1][H/a11y] `role="listbox"` uses roving tabindex but no `aria-activedescendant`, and `selected` isn't announced
- **Category:** a11y
- **Evidence:** master-detail.tsx:139-141 `role="listbox" tabIndex={-1}`; items get roving `tabIndex` (:157) but there is no `aria-activedescendant` on the listbox, and no `aria-live`/label on the Detail pane when it swaps.
- **Why:** A listbox with arrow-key navigation should expose the active option to AT via `aria-activedescendant` (or ensure focus moves, which it does here) — but the bigger gap is the Detail pane content swaps on `key={selected}` with no `aria-live` region or heading focus management, so screen-reader users get no notification that the detail changed. Also `role="listbox"` has no accessible name (`aria-label`).
- **Fix:** Add an `aria-label` to the listbox, add `aria-live="polite"` (or move focus to a heading) on the Detail region when `selected` changes, and consider `aria-activedescendant` for completeness.

### [P1][I] `cloneElement` casts children to `ReactElement<any>` and injects `ref`/`tabIndex` untyped
- **Category:** types
- **Evidence:** master-detail.tsx:152 — `React.cloneElement(child as React.ReactElement<any>, { ref: …, tabIndex: … })`
- **Why:** `any` in the child-cloning path defeats type safety — a non-ListItem child (e.g. a divider, a heading) silently gets a `ref`/`tabIndex` injected and counts toward `childCount` (:105), throwing off the roving index and the `setItemCount`. The clone assumes every child is a focusable ListItem.
- **Fix:** Narrow to `ReactElement<MasterDetailListItemProps & { ref?: Ref<HTMLButtonElement> }>` and skip non-ListItem children (filter by element type) so dividers/labels don't corrupt the index count.

### [P2][H] No empty / loading / disabled / RTL / forced-colors coverage in source or stories
- **Category:** state-coverage
- **Evidence:** stories.tsx has only `Default` and `NoSelection`; no disabled item, no loading skeleton, no RTL (back arrow `IconArrowLeft` at :3 never mirrors), no forced-colors story. `emptyState` prop (:31) is never demonstrated in a story.
- **Why:** Card bar requires the applicable state matrix shown. The `emptyState` prop exists but no story exercises it; the mobile back arrow is a directional icon (`IconArrowLeft`) that should mirror in RTL and there's no RTL handling or story. Disabled list items aren't supported (`ListItem` has no `disabled` handling beyond native).
- **Fix:** Add stories for: `emptyState`, mobile/stacked mode, disabled item, RTL. Ensure the back-arrow mirrors under `dir="rtl"` (use a logical/mirroring icon or `rtl:-scale-x-100`).

### [P2][M4] List items animate nothing on select; only color transitions — inconsistent with the DS feedback-motion vocabulary
- **Category:** motion
- **Evidence:** master-detail.tsx:214-215 — `transition-colors duration-fast-01`; the active state is a pure color swap with no press/select micro-feedback, while sibling components (Card `whileTap`, StatCard) use spring feedback.
- **Why:** Not a tell, but a polish gap vs the finish bar — the selection has no press feedback and the detail swap is the only motion. Minor; the color transition is at least tokened.
- **Fix:** Optional `whileTap`/subtle scale on ListItem for press feedback, consistent with Card.

### [P2][F5/G4] Detail/List panes re-roll layout chrome instead of a shared surface vocabulary
- **Category:** drift
- **Evidence:** master-detail.tsx:144 `border-r border-surface-border`; :171 `flex-1 overflow-y-auto`; :173 `border-b border-surface-border px-ds-04 py-ds-03`. No surface-level token (`bg-surface-*`) — the panes are transparent and rely on the consumer's wrapper (stories.tsx:29 adds the outer border + `rounded-surface`).
- **Why:** The component ships no surface of its own, so it doesn't participate in the surface-layering system; each consumer must wrap it (as the story does) to get a card. Not a hard violation (a layout primitive can be surface-agnostic), but it means the "container" story boilerplate is duplicated per consumer instead of being an opt-in `variant`.
- **Fix:** Consider an optional `bordered`/surface variant, or document that MasterDetail is intentionally surface-agnostic and must be wrapped. At minimum document the required wrapper.

### [P2][H] `itemCount`/`setItemCount` context plumbing is dead weight; `childCount` counts non-item children
- **Category:** state-coverage
- **Evidence:** master-detail.tsx:81-83 context exposes `itemCount`/`setItemCount`; :105-108 `const childCount = React.Children.count(children); useEffect(() => setItemCount(childCount) …)`. `itemCount` is never read anywhere; keyboard nav uses local `childCount`.
- **Why:** `itemCount` is written but never consumed — dead state that re-renders the tree on every child change for no effect. And `childCount` includes any non-ListItem child, so the arrow-key clamp (`Math.min(activeIndex+1, childCount-1)`) can point at a non-focusable child.
- **Fix:** Remove the unused `itemCount`/`setItemCount` context fields, and count only valid ListItem children.

### [P3][docs] Doc omits `emptyState` and `onNavigate` props; SSR gotcha is good
- **Category:** docs
- **Evidence:** master-detail.md:10-20 props table lists `selected/onBack/masterWidth/breakpoint` + `active`, but omits `emptyState` (tsx:31) and `onNavigate` (tsx:33).
- **Why:** Doc prop table drifts from source — two public root props undocumented.
- **Fix:** Add `emptyState` and `onNavigate` rows to the doc.

### [P3][types] `breakpoints` record is `Record<string, string>` but `breakpoint` prop is a 3-value union
- **Category:** types
- **Evidence:** master-detail.tsx:48 `const breakpoints: Record<string, string>`; :29 `breakpoint?: 'sm' | 'md' | 'lg'`.
- **Why:** The lookup `breakpoints[breakpoint]` (:244) is untyped against the union; a typo'd key would resolve `undefined` silently. Minor.
- **Fix:** Type as `Record<'sm'|'md'|'lg', string>`.

## Composability gaps
- **No `asChild` on `ListItem`** — can't render list rows as anchors (F2). Master-detail lists are usually navigable link lists.
- **Controlled-only selection with no `onSelect`/`defaultSelected`** — consumer hand-wires `active` + `onClick` on every item; the listbox owns a11y roles but not selection (F6).
- **`selected` and internal `activeIndex` are two disconnected sources of truth** — the roving-focus index doesn't derive from the selected item (P0).
- **No item-level `value`/`id`** — `active` is passed manually; the component can't derive `aria-selected` itself.
- **Surface-agnostic by necessity** — every consumer re-wraps it to get a bordered card (stories do this); no opt-in surface variant (F5-adjacent).

## Motion gaps
- **No reduced-motion guard** on the detail slide (M3) despite `withReducedMotion()`/MotionConfig existing in the repo.
- **No press/select feedback** on list items (M4) — only a color transition; siblings use spring micro-feedback.
- Detail transition correctly animates `x`+`opacity` (transform, not layout) — M5 clean.
- `springs.snappy` is a real DS token, not a bounce-by-default — M1 clean.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the selection/focus desync (P0):** give `ListItem` a `value`/`id`, derive `activeIndex` from `selected`, resync on change.
2. **Add uncontrolled selection + `onSelect`:** support `defaultSelected`, derive `active`/`aria-selected` in context so consumers stop hand-wiring both `active` and `onClick`.
3. **Add reduced-motion guard** to the detail-pane slide (`useReducedMotion` / `withReducedMotion`).
4. **Add `asChild` to `ListItem`** so rows can be anchors.
5. **a11y pass:** `aria-label` on the listbox, `aria-live`/focus management on the Detail region, mirror the back arrow in RTL.
6. **Type hardening:** drop `ReactElement<any>` and filter non-ListItem children; type `breakpoints` to the union; remove dead `itemCount` context.
7. **State-coverage stories:** `emptyState`, stacked/mobile, disabled item, RTL.
8. **Docs:** add `emptyState`/`onNavigate` to the prop table.

## Clean (rubric dims that pass)
- **V1 accent rail:** killed — active row is a tinted `bg-accent-2 text-accent-11` row (:217), not a colored left stripe (fixed in `0e453984`).
- **V2 double-edge / V3 gradient text / V4 default palette / V5 emoji / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** none present.
- **V9–V15 visual reflexes:** no hardcoded Inter/Geist, no decorative numbering, no eyebrow kicker, no all-caps default, no AI imagery. `font-sans` (:213) is the DS token, not a raw face.
- **G1 surface / G2 tokens / G3 variant axes:** spacing/color all via `-ds-*` and semantic tokens; no raw px/hex/dead-TW3 classes; no non-canonical variant axis names (there is no CVA variant axis here).
- **E1–E8 verbal tells:** JSDoc, doc, and story copy are direct and clean — no em-dash tic, AI vocabulary, meta-hedging, or engagement bait.
- **M1/M5:** intentional spring tokens, transform+opacity animation (not layout props).
- **Focus-visible:** real `focus-visible:ring-2 ring-accent-7 ring-inset` on items (:216), `focus-visible:outline-hidden` on listbox — focus is not removed without replacement.
- **Keyboard nav present:** ArrowUp/Down/Home/End + Enter/Space activation (:113-135, :196-201).
