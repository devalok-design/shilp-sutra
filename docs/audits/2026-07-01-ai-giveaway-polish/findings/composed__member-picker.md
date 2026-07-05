# composed/member-picker — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:4 P3:2

MemberPicker is a thin, honest wrapper around `MultiSelectPopover` (F5 is clean — it does NOT re-roll surface/popover). Its own default rendering carries no hard visual AI tells (no accent rail, no gradient text, no glass, no emoji, no framework palette). The real gaps are **API/vocabulary drift** (its public prop shape diverges from the base primitive's clean `value`/`onValueChange` controlled contract and invents a `multiple` boolean that leaks a confusing `onSelect(id)` toggle-derivation onto the consumer), **composability** (fixed avatar `renderItem`, no way to reach the base primitive's richer features), and a **doc G5 violation** (outline default). Motion tells (staggered-delay entrance, bouncy check, no reduced-motion guard) live in the base primitive it delegates to, so they are inherited — noted here as inherited, scored against MultiSelectPopover.

## Findings

### [P1][F6] `onSelect(id)` is a non-standard controlled contract; no uncontrolled mode, no `onValueChange`
- **Category:** composability / vocabulary
- **Evidence:** member-picker.tsx:26-28 — `selectedIds: string[]; onSelect: (memberId: string) => void` and :54-60 the wrapper re-derives the toggled id from the base primitive's clean `onValueChange(ids)` (`const toggled = added ?? removed; if (toggled) onSelect(toggled)`).
- **Why:** The base `MultiSelectPopover` already exposes the canonical controlled pair `value: string[]` + `onValueChange: (ids) => void`. MemberPicker throws that away, hands the consumer a single toggled id, and (per its own doc/story) makes the consumer re-implement toggle/replace logic that the base primitive already does correctly. That is the F6 "fires onChange for non-input semantics; consumer must derive state" smell, plus lost information (a `maxSelections` replace that drops two ids at once can't be represented as one toggled id).
- **Fix:** Expose `value: string[]` + `onValueChange: (ids: string[]) => void` (mirror the base). Keep `onSelect` only as an optional deprecated convenience alias. Consider a `defaultValue` for an uncontrolled mode.

### [P1][G3] `multiple` boolean instead of the canonical selection axis; collides with base `maxSelections`
- **Category:** vocabulary / drift
- **Evidence:** member-picker.tsx:27 `multiple?: boolean`, :69 `maxSelections={multiple ? undefined : 1}`.
- **Why:** The base primitive models selection cardinality with `maxSelections?: number`. MemberPicker re-expresses the same concept as a `multiple` boolean and translates it, so a family that should share one vocabulary now has two names for "how many can I pick." A consumer who wants "pick up to 3" cannot express it. `multiple` is also the native `<select>` word, which sets a wrong mental model (native multiple ≠ this popover's replace-on-overflow behavior).
- **Fix:** Drop `multiple`; forward `maxSelections?: number` straight through (or keep `multiple` as a documented sugar for `maxSelections: multiple ? undefined : 1`, but the number prop is the source of truth).

### [P1][F1] Avatar row is a hardcoded `renderItem`, not a slot — richer base features are unreachable
- **Category:** composability
- **Evidence:** member-picker.tsx:70-82 — a fixed `renderItem` returning Avatar + name. The base primitive supports `renderItem`, `groups`, `onSearch` (async), `emptyMessage`, `align`, `width`, `searchDebounce`, `description` per item — none are forwarded or overridable.
- **Why:** F1/F5-adjacent: the wrapper bakes one presentation and blocks every other base capability. A consumer who wants member roles (item `description`), grouped teams (`groups`), or server-side member search (`onSearch`) must abandon MemberPicker and drop to MultiSelectPopover, losing the avatar convenience. The wrapper adds a member type and initials fallback but caps its own ceiling.
- **Fix:** Forward the useful base props (`onSearch`, `emptyMessage`, `align`, `width`, `groups`, `renderItem` override) via `...` passthrough of a typed subset; let `member.avatar`/initials be the *default* row, overridable.

### [P1][G5] Doc + stories default the trigger to `variant="outline"` / bordered button
- **Category:** drift (soft-vs-outline preference)
- **Evidence:** member-picker.md:21 `<Button variant="outline">Assign Members</Button>`; stories use hand-rolled `border border-surface-border-strong` buttons (member-picker.stories.tsx:56-58, 86-88, 106-108, 124-126, 144-146, 171-173).
- **Why:** CLAUDE.md design preference: non-primary actions default to `variant="soft"` unless on a colored/raised bg or icon-dense toolbar. A "Assign member" trigger on the page surface is exactly the soft case. Every shipped example teaches outline.
- **Fix:** Change the doc example to `<Button variant="soft">Assign members</Button>` and update stories to use the real `Button` with `variant="soft"` instead of ad-hoc bordered `<button>`s.

### [P1][I] `MemberPickerMember` has no exported doc of `avatar` semantics; `children` typed loosely; passthrough is untyped
- **Category:** types
- **Evidence:** member-picker.tsx:23 `extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'>` then `{...props}` (:83) spreads those div attrs onto `MultiSelectPopover`, whose own props are NOT `div` attrs (it forwards to `PopoverContent`). The `div` prop surface is a fiction — MemberPicker never renders a `div`.
- **Why:** Extending `ComponentPropsWithoutRef<'div'>` advertises `onClick`, `style`, etc. on a `<div>` that doesn't exist; the spread lands on PopoverContent. This is a types/API-honesty gap: the ref is `HTMLDivElement` (:36) but forwards to the base primitive's ref which is PopoverContent's div — coincidentally fine, but the prop contract misrepresents what's rendered.
- **Fix:** Type the passthrough against the base primitive's props (e.g. `Pick<MultiSelectPopoverProps, 'align' | 'width' | 'onSearch' | 'emptyMessage' | ...>`) rather than `div` attributes; keep the ref type honest.

### [P2][H] No focus-return / trigger a11y contract documented; empty state only via base
- **Category:** state-coverage / a11y
- **Evidence:** EmptyMemberList story (member-picker.stories.tsx:115-132) relies entirely on the base primitive's `emptyMessage` default ("No results found") — MemberPicker exposes no way to customize the empty message for the member context (e.g. "No members").
- **Why:** Empty is a real member-picker state (no teammates yet). The wrapper hides the base `emptyMessage` prop, so the empty copy is generic. Not broken, but below the finish bar for state coverage the component can express.
- **Fix:** Forward `emptyMessage` (default it to something member-appropriate like "No members found").

### [P2][state] No selected-state affordance on the trigger; selection only visible inside the open popover
- **Category:** state-coverage
- **Evidence:** Component renders only `children` as trigger (member-picker.tsx:85); `selectedIds` is used solely to compute toggles (:49-60), never surfaced. Stories manually reflect count in the trigger label (:89), i.e. the *consumer* must do it.
- **Why:** A member picker's most useful default is showing the chosen avatars/count on the trigger (assignee stack). The component has `members` + `selectedIds` and could offer an opt-in avatar-stack trigger, but ships nothing, pushing the most common need onto every consumer.
- **Fix (P2, opt-in):** Offer an optional default trigger (avatar stack + count) when `children` is omitted, or a `renderTrigger(selectedMembers)` slot.

### [P2][motion] Inherited entrance motion has no reduced-motion guard (M3) and per-item stagger delay (M2)
- **Category:** motion
- **Evidence:** Inherited from base — multi-select-popover.tsx:209-211 `initial={{ opacity: 0, x: -8 }} … transition={{ ...springs.snappy, delay: index * 0.02 }}` and :242-244 bouncy check `springs.bouncy`. No `useReducedMotion`/MotionConfig guard anywhere in the chain.
- **Why:** Every member row animates in with a staggered x-slide and the check pops with a bounce spring, with no `prefers-reduced-motion` respect. This is M2 (uniform per-index stagger) + M1-lite (bouncy) + M3 (no reduced-motion). It renders through MemberPicker's default, so users see it, but the source is the base primitive.
- **Fix:** Fix in MultiSelectPopover (its audit): gate entrance/stagger/bounce behind `useReducedMotion()`; MemberPicker inherits.

### [P2][docs] Doc "Changes" and prop table drift from real behavior
- **Category:** docs
- **Evidence:** member-picker.md:8 documents `avatar?` but not that the base does async/groups; :26-30 "Composability" claims flexibility the wrapper actually blocks (it says use MultiSelectPopover for non-members — correct — but doesn't note MemberPicker can't do async/grouped members at all).
- **Why:** J docs-parity: the doc oversells composability the component doesn't expose and undersells the base delegation.
- **Fix:** Regenerate the doc from the true (post-fix) prop surface; note forwarded base props.

### [P3][H] Trigger keyboard/focus behavior undocumented
- **Category:** a11y
- **Evidence:** Relies on `PopoverTrigger asChild` (base :256) — correct, but MemberPicker's doc never states the trigger must be a focusable element; a story passing a raw `<div>` would break keyboard access silently.
- **Why:** Minor; the pattern is right, the guardrail/doc is missing.
- **Fix:** Doc note: trigger `children` must be a focusable interactive element (Button/IconButton).

### [P3][vocabulary] `MemberPickerMember.avatar` vs base `image`
- **Category:** vocabulary
- **Evidence:** member-picker.tsx:20 `avatar?: string` mapped to base `image` at :51.
- **Why:** Minor naming divergence across the family (base calls the same field `image`). Defensible (avatar is member-appropriate), so P3 not P1.
- **Fix:** Fine to keep; note the mapping in the type doc.

## Composability gaps
- Non-standard controlled contract: `onSelect(id)` instead of the base's `value`/`onValueChange(ids)`; no `defaultValue`/uncontrolled mode (F6).
- `multiple` boolean re-expresses `maxSelections` and blocks "pick up to N" (G3).
- Hardcoded avatar `renderItem`; no override slot; base `groups`, `onSearch`, `emptyMessage`, `align`, `width`, `description` all unreachable (F1).
- No trigger slot / no default assignee-stack trigger; selection state never surfaced on the trigger.
- Passthrough typed as `<div>` attributes, misrepresenting what renders (types honesty).

## Motion gaps
- All inherited from `MultiSelectPopover` (this wrapper adds zero motion of its own):
  - No `prefers-reduced-motion` guard on row entrance, stagger, or the bouncy check (M3).
  - Per-index `delay: index * 0.02` stagger + `springs.bouncy` check pop (M2 / M1-lite).
- Fix belongs in the base primitive's audit; MemberPicker inherits the fix for free.

## Polish plan (ordered steps to reach the finish bar)
1. **Align the controlled contract:** expose `value` + `onValueChange(ids)` (mirror base), demote `onSelect` to an optional deprecated alias, add `defaultValue` for uncontrolled use.
2. **Replace `multiple` with `maxSelections?: number`** forwarded to the base (keep `multiple` as documented sugar only).
3. **Open composability:** forward a typed subset of base props (`onSearch`, `emptyMessage`, `groups`, `align`, `width`, `renderItem` override, item `description`); keep avatar row as the default, overridable.
4. **Fix types honesty:** type passthrough against `MultiSelectPopoverProps` (not `<div>` attrs).
5. **Add a default/opt-in trigger** (avatar stack + count) or a `renderTrigger(selected)` slot so selection is visible without consumer plumbing.
6. **G5:** switch doc + stories to `Button variant="soft"`; replace ad-hoc bordered `<button>`s in stories with the real Button.
7. **Inherit the base's motion fix** (reduced-motion guard) once MultiSelectPopover is fixed.
8. **Regenerate the doc** from the corrected prop surface; add trigger-must-be-focusable note; add a member-appropriate `emptyMessage` default.

## Clean (rubric dims that pass)
- **F5 (compose, don't re-roll):** correctly delegates surface/popover/search to `MultiSelectPopover` — no bespoke surface, no re-rolled tokens.
- **V1–V8 visual tells:** no accent rail, no gradient text, no glass/blob/glow, no framework palette, no emoji, no rounded-everything, no pill spam in its own source.
- **G1 surface:** overlay surface comes from the base's `bg-surface-overlay` on `PopoverContent` — correct layer.
- **G2 tokens:** uses `gap-ds-03`, `h-ico-md`, `text-ds-*`, semantic `text-surface-fg` — no raw px/hex/dead TW3 utilities in its own code.
- **E1–E8 verbal tells:** doc/JSDoc/stories are plain and direct — no em-dash tic, no AI vocabulary, no meta-hedging, no emoji.
- **Tests + stories exist:** trigger render, open, onSelect, search filter, initials fallback covered; stories cover single/multi/custom-placeholder/preselected/empty (publish-gate satisfied, though stories should use the real Button).
- **forwardRef + displayName** present and correct.
