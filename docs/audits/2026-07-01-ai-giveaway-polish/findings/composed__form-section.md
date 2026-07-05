# composed/form-section — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:4 P3:2

FormSection is clean on the loud AI tells — no accent rail, no gradient text, no emoji, no framework palette, tokens throughout, reduced-motion-adjacent motion system in use, tests + stories + doc all present and reasonably matched. Where it falls short of the Card bar is composability (bespoke `title`/`description` string props instead of slots), a dropped ref + duplicated state in the collapsible branch, no controlled `open`, and a missing reduced-motion guard on the chevron.

## Findings

### [P1][F1] `title`/`description` are string props, not slots
- **Category:** composability
- **Evidence:** form-section.tsx:17-18 — `title: string` / `description?: string`; rendered at :38-48 inside a fixed `<div>` header.
- **Why:** This is the exact bespoke-corner-prop pattern Card retired (title prop → slot). A consumer can't put a Badge, a "Required" marker, an action button, or rich text in the header; can't render the title as an `<h2>`/`<h3>` for document outline; can't restructure header layout.
- **Fix:** Keep `title`/`description` as an ergonomic default, but add a composable path — e.g. a `<FormSectionHeader>` / `<FormSectionAction>` slot pair (mirror `CardHeader`/`CardAction`), or accept `title?: React.ReactNode` plus an `action?` that is documented as a slot escape hatch. At minimum widen `title` to `React.ReactNode`.

### [P1][H/types] `ref` is dropped in collapsible mode
- **Category:** state-coverage
- **Evidence:** form-section.tsx:28 `forwardRef<HTMLDivElement, …>`; the ref is only attached to the non-collapsible `<div ref={ref}>` at :76. The `collapsible` branch (:52-73) renders `<Collapsible>` with no `ref`.
- **Why:** `forwardRef` advertises a stable ref contract, but half the time (collapsible) the ref silently resolves to nothing. Breaks focus management, scroll-into-view, measurement, and any consumer relying on the ref.
- **Fix:** Forward `ref` to the `Collapsible` root (Radix Root forwards refs) in the collapsible branch too.

### [P1][F6] duplicated open state; no controlled `open` prop
- **Category:** composability
- **Evidence:** form-section.tsx:50 `const [isOpen, setIsOpen] = React.useState(defaultOpen)`; wired at :54 `onOpenChange={setIsOpen}`. `isOpen` exists only to rotate the chevron (:58), duplicating state the `Collapsible` already owns.
- **Why:** Two sources of truth for one boolean. There is no `open` (controlled) prop, so a consumer can't drive open/closed from outside (e.g. "expand all sections" button, validation-error auto-expand). The local mirror also can't reflect an externally-forced state.
- **Fix:** Add optional `open?: boolean` + pass through to `Collapsible`; drive the chevron off `data-[state=open]` (CSS `group-data-[state=open]:rotate-180`) instead of a mirrored React state, eliminating the duplicate. That also removes the need for the extra `motion.span` state.

### [P1][M3] chevron rotation has no reduced-motion guard
- **Category:** motion
- **Evidence:** form-section.tsx:57-63 `<motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={springs.snappy}>` — no `prefers-reduced-motion` handling; `withReducedMotion` (available in `lib/motion`) is not used.
- **Why:** Card/StatCard participate in the motion system; FormSection animates a spring rotation unconditionally. A reduced-motion user still gets the spring.
- **Fix:** Guard with `useReducedMotion()` (framer) → drop to `duration: 0`, or move the rotation to a CSS `group-data-[state=open]` class that respects the global `@media (prefers-reduced-motion)` handling.

### [P2][types] `{...props}` (div attributes) spread onto `Collapsible` root
- **Category:** types
- **Evidence:** form-section.tsx:16 `FormSectionProps extends React.HTMLAttributes<HTMLDivElement>`; at :54 `{...props}` is spread onto `<Collapsible …>` (Radix `CollapsiblePrimitive.Root`).
- **Why:** The props are typed for a `div` but land on the Collapsible Root, whose prop surface differs (it also accepts `open`/`defaultOpen`/`onOpenChange`, and its `asChild`/`disabled` semantics). Works at runtime because Root spreads to a div, but the typing is a lie in the collapsible branch and could pass through unexpected props.
- **Fix:** Once `ref` + `open` are threaded properly, spread the rest deliberately, or type the collapsible branch against `CollapsibleProps` for the pass-through subset.

### [P2][G2/vocabulary] `space-y-*` layout instead of the gap model
- **Category:** drift
- **Evidence:** form-section.tsx:54, :67, :76, :79 — `space-y-ds-04`. 
- **Why:** Card was deliberately moved off per-element margins to a `flex flex-col gap-*` "gap model" (card.tsx:14-20 comment) precisely so adding/removing children can't unbalance spacing. `space-y-*` is margin-based and drifts from that family convention.
- **Fix:** Use `flex flex-col gap-ds-04` for the outer container and the content wrapper to match the Card/family spacing model.

### [P2][V14/vocabulary] chevron always mounted even when `isOpen` mirrors default; header uses redundant `font-sans`
- **Category:** vocabulary
- **Evidence:** form-section.tsx:39 `text-ds-md font-semibold text-surface-fg font-sans` and :43 `text-ds-sm text-surface-fg-muted font-sans`.
- **Why:** `font-sans` is the DS default sans already applied globally / by `CardTitle` (card.tsx:184 does use it, so this is borderline), but repeating it on the description is redundant noise. Not a hard tell — flagged as minor cadence cleanup.
- **Fix:** Drop the redundant `font-sans` on the description; keep type tokens.

### [P2][H] collapsible header/title has no heading semantics or aria-labelling
- **Category:** a11y
- **Evidence:** form-section.tsx:39 title rendered as a `<span>`; collapsible trigger (:55) wraps the header but has no `aria-controls`/section landmark; non-collapsible header is a bare `<span>` too.
- **Why:** A "form section" is a semantic grouping. Rendering the title as a `<span>` gives assistive tech no outline entry and no `role="group"`/`aria-labelledby` tying the fields to the section title. Radix Collapsible provides trigger↔content wiring, but the section itself isn't labelled.
- **Fix:** Allow the title to render as a heading (or add `role="group"` + `aria-labelledby` pointing at the title id). Widening `title` to a slot (F1) makes this natural.

### [P3][docs] doc lists `defaultOpen: boolean` but omits it applies only when collapsible in the Props table
- **Category:** docs
- **Evidence:** form-section.md:11 Props table lists `defaultOpen` flatly; the "only applies when collapsible" caveat is buried in Gotchas (:36). Doc also references `FormField`/`PageHeader` composition that FormSection doesn't enforce.
- **Why:** Minor parity nit; the Gotcha covers it so not load-bearing.
- **Fix:** Note the coupling inline in the Props table.

### [P3][state-coverage] no story/test for `open` controlled, RTL, or reduced-motion
- **Category:** state-coverage
- **Evidence:** form-section.stories.tsx has Default / WithDescription / Collapsible / Multiple; no controlled-open, no RTL (chevron doesn't need mirroring but the layout does), no forced-colors, no reduced-motion story.
- **Why:** Below the Card bar's "demonstrate every applicable state" — though most of these become relevant only after `open`/slots land.
- **Fix:** Add a controlled-open story once the prop exists; a reduced-motion note.

## Composability gaps
- `title`/`description` are fixed string props with a hardcoded header layout — no header slot, no action slot, no way to inject a Badge/marker/button (F1). This is the Card `title`-prop → `CardHeader`/`CardAction` slot lesson, unlearned.
- No `open` (controlled) prop — open state is only uncontrolled via `defaultOpen`, and it's duplicated in local `useState` (F6).
- No `asChild` and no compound sub-components; the whole component is a flat props API. For a "section" primitive a `<FormSection.Header>` / `<FormSection.Content>` compound (or slot props) would let consumers vary header content and place actions.
- Ref contract is only honoured in one of two branches (collapsible drops it).

## Motion gaps
- Chevron rotation (`springs.snappy`) has no reduced-motion guard (M3) — `withReducedMotion` / `useReducedMotion` unused.
- The chevron animation is driven by a mirrored React state (`isOpen`) rather than the Collapsible's own `data-[state]`, which is both a duplicate-state smell and forces JS animation where a CSS `group-data-[state=open]:rotate-180` transition would be simpler and automatically respect the global reduced-motion CSS.
- No entrance motion differentiation issue — expand/collapse is handled by `CollapsibleContent`'s own animation (fine). The header itself has no hover/press feedback on the trigger beyond the chevron (acceptable for a section header, not flagged as a gap).

## Polish plan (ordered steps to reach the finish bar)
1. Forward `ref` to `Collapsible` in the collapsible branch (P1, one line) — restores the ref contract.
2. Drive the chevron off `data-[state=open]` via CSS (`group-data-[state=open]:rotate-180 transition-transform`) and delete the `isOpen` `useState` — removes duplicate state and the unguarded spring in one move (fixes F6 partial + M3).
3. Add optional `open?: boolean` controlled prop, threaded to `Collapsible` (completes F6).
4. Widen `title` to `React.ReactNode` and add a header `action?`/slot escape hatch (or a `<FormSectionHeader>`/`<FormSectionAction>` compound) so headers can carry badges/actions/rich content (F1/F4).
5. Add `role="group"` + `aria-labelledby` (title id) so the section is a labelled grouping for AT (H).
6. Switch `space-y-ds-04` → `flex flex-col gap-ds-04` to match the Card/family gap model (G2).
7. Type the collapsible-branch pass-through deliberately instead of spreading div attrs onto the Root; drop redundant `font-sans` on description.
8. Add controlled-open + reduced-motion stories; note `defaultOpen` coupling inline in the doc props table.

## Clean (rubric dims that pass)
- **V1 accent rail:** none — header/content separator is a full-width `border-b border-surface-border-subtle` (form-section.tsx:65, :78), not a colored left/top rail.
- **V2 double edge:** no border+shadow on the same surface; FormSection has no surface/shadow at all (it's a layout grouping, correct — G1 surface layering N/A).
- **V3 gradient text / V4 framework palette / V5 emoji / V6 blob-glass / V7 rounded-everything / V8 pill spam:** none present.
- **G2 tokens:** spacing/type/color all via `-ds-*` and semantic tokens; no raw px/hex/dead-TW4 utilities.
- **G3 variant-axis drift:** no CVA variants (simple layout component) — nothing off-taxonomy.
- **M1 bounce-by-default:** chevron uses `springs.snappy` (no overshoot), appropriate; `CollapsibleContent` uses `tweens.fade`. No gratuitous bounce.
- **E1–E8 verbal tells:** JSDoc-free source; doc + story copy is plain and free of AI vocabulary, em-dash tics, contrastive negation, and chatbot artifacts.
- **Tests + stories + doc all exist** and are wired to `describeConformance`; axe test present; prop names match source.
