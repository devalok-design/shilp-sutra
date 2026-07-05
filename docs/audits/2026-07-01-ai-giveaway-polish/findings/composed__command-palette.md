# composed/command-palette — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:3

This is a genuinely well-built component: it composes the `Dialog` primitive (does not re-roll the overlay surface), respects reduced-motion through `useMotion()`, implements the full ARIA combobox/listbox/option pattern with keyboard nav, and has controlled/uncontrolled open state with a clean `setOpen` indirection. It is NOT AI slop. The findings below are polish gaps and a real docs drift, not hard tells.

## Findings

### [P1][J] Docs claim "cmdk-style fuzzy matching" but the impl is plain substring `.includes()`
- **Category:** docs / drift
- **Evidence:** docs/components/composed/command-palette.md:29 — `Built on Dialog (portal) + cmdk-style fuzzy matching.` vs command-palette.tsx:194 — `getFilterValue(item).toLowerCase().includes(q)`
- **Why:** "fuzzy matching" implies subsequence/scored matching (fzf-style); the code is a case-insensitive substring contains with no ranking. A consumer expecting fuzzy ("dsh" → "Dashboard") will file a bug.
- **Fix:** Change the doc to "substring (contains) filtering" OR implement real fuzzy matching. Pick one; the doc must match the source.

### [P1][J] Per-component doc prop table is stale — omits 7 shipped props
- **Category:** docs
- **Evidence:** command-palette.md:7-13 lists only `groups, placeholder, onSearch, emptyMessage`. Source ships `open, defaultOpen, onOpenChange, keybinding, maxHeight, footerHints, emptyState, renderLabel, filterValue` (command-palette.tsx:79-97, 42-45).
- **Why:** Doc parity is a soft publish gate (rubric J). The controlled-state, keybinding, and footer props are the component's headline features and are entirely undocumented in the prop table.
- **Fix:** Regenerate the prop table from the `CommandPaletteProps` interface; add `CommandItem.renderLabel` / `filterValue` to the item shape line.

### [P2][G2] Raw px/percent values instead of tokens (StatCard, the exemplar, has none)
- **Category:** drift / vocabulary
- **Evidence:** command-palette.tsx:332 `max-w-[560px]`, `top-[20%]`; :474 `min-w-[20px]`; :525,:529 `h-[20px]`; :300 `z-[1]`.
- **Why:** G2 — re-rolled values. The design system has spacing/size/z tokens; these arbitrary values bypass them. `z-[1]` in particular duplicates what a `z-` utility or `isolate` would express. The Card/StatCard bar uses zero arbitrary numeric values.
- **Fix:** Bind to tokens where one exists (kbd height → a control-size token or `h-ico-md` like the footer arrows already use; `min-w` → spacing token). `max-w-[560px]` for the palette width is defensible as a one-off layout constant but ideally a named token; `top-[20%]` is a deliberate vertical placement — acceptable but comment it.

### [P2][M2] Per-index entrance stagger can compound into a slow, robotic cascade
- **Category:** motion
- **Evidence:** command-palette.tsx:434 `delay: itemIndex * 0.03` (items) and :412 `delay: groupIdx * 0.06` (groups), keyed on the FLAT item index.
- **Why:** M2 — uniform per-item delay. With a realistic palette (the story ships 12 items across 3 groups) the last item waits `11 * 30ms = 330ms` on top of group fade — the list visibly "types itself in" on every open, which reads as the AI stagger reflex rather than intentional feedback. It also re-runs on every filter keystroke change of group membership.
- **Fix:** Cap the stagger (`Math.min(itemIndex, 6) * 0.03`) or use a container `staggerChildren` (the motion lib already exports a `stagger()` helper) so total duration is bounded regardless of count. Consider not re-staggering on query change (only on open).

### [P2][V14] All-caps `uppercase tracking-wider` group headers
- **Category:** visual-tell
- **Evidence:** command-palette.tsx:416 — `text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-subtle`
- **Why:** V14 — all-caps + letter-spacing as the default section-label treatment is a mild AI eyebrow/kicker reflex. Defensible here (group labels are real categories, used once per group) so it is borderline, but it is the reflex pattern and worth a conscious decision.
- **Fix:** Keep if deliberate (command palettes conventionally do this — Linear/Raycast use small-caps-ish labels), but consider `font-medium` + `text-surface-fg-subtle` without uppercase for a calmer, less-templated look. Low priority.

### [P2][H] No focus-visible ring on the option buttons; active state is background-only
- **Category:** a11y / state-coverage
- **Evidence:** command-palette.tsx:440-445 — option button classes are `... transition-[color,background-color] ...` with active = `bg-surface-raised-hover`; no `focus-visible:` ring, and the buttons never receive DOM focus (focus stays on the input, `aria-activedescendant` drives the active row).
- **Why:** The active row is communicated only by a low-contrast background swap. In forced-colors mode (where `bg-surface-raised-hover` may collapse) there is no border/outline fallback to show which item is active, so keyboard users in high-contrast lose the selection indicator. The matrix requires forced-colors coverage.
- **Fix:** Add a forced-colors fallback for the active row (e.g. `[&[aria-selected=true]]:forced-colors:outline` or a `border` that survives forced-colors). Add a `@media (forced-colors)` outline on the active option.

### [P3][F1/F4] Content injected via bespoke props rather than slots
- **Category:** composability
- **Evidence:** props `emptyState?: ReactNode` (cmd-palette.tsx:78), `footerHints?: FooterHint[] | false` (:96), data-driven `groups`/`items` arrays (:68-72).
- **Why:** F1 — `emptyState` and the footer are fixed-region content delivered as props instead of composable children/slots. This is the standard data-driven command-palette pattern (cmdk does the same) and is reasonable, but it is not the Card-bar "slots over bespoke props" model, so flag for awareness.
- **Fix:** Acceptable as-is for a data-driven widget; if a future major reworks the API, consider a slot-based composition (`<CommandPalette.Empty>`, `<CommandPalette.Footer>`). Do NOT churn this now.

### [P3][drift] Story title `Shell/CommandPalette` while the component lives in `composed/`
- **Category:** drift
- **Evidence:** command-palette.stories.tsx:132 — `title: 'Shell/CommandPalette'`; file path `src/composed/command-palette.tsx`; doc says `Category: composed`.
- **Why:** Storybook sidebar files it under Shell, but its layer is composed (and there is a separate `shell/app-command-palette`). Minor taxonomy inconsistency that can confuse navigation.
- **Fix:** Retitle to `Composed/CommandPalette` (or confirm Shell is intentional and align the doc).

### [P3][a11y] `aria-expanded={true}` hardcoded literal
- **Category:** a11y
- **Evidence:** command-palette.tsx:366 — `aria-expanded={true}`
- **Why:** The combobox listbox is always rendered while open so `true` is technically correct, but a hardcoded literal is brittle if a future change hides the list (e.g. empty-collapse). Minor.
- **Fix:** Bind to a real condition (`aria-expanded={filteredGroups.length > 0 || open}`) or leave with a comment that the listbox is always present while mounted.

## Composability gaps
- Data-driven `groups`/`items` model rather than slot composition (F1) — standard for this component class; acceptable but not the Card-bar slot model.
- `emptyState` and `footerHints` are fixed-region content delivered as props, not children/slots (F1/F4) — would be a `<CommandPalette.Empty>` / `.Footer>` in a slot-based design.
- Composes the `Dialog` primitive correctly (F5 CLEAN — does not re-roll the overlay surface; uses `DialogContentRaw` + `bg-surface-overlay shadow-overlay`).
- Controlled/uncontrolled is fully covered (F6 CLEAN — `open` + `defaultOpen` + `onOpenChange`, with a stale-closure-safe `openRef`).
- No `asChild` — not applicable; this is not a polymorphic leaf element.

## Motion gaps
- M2: flat-index per-item stagger (`itemIndex * 0.03`) is unbounded — with many items the cascade gets long and re-fires on filter changes. Cap it or use a bounded `staggerChildren`.
- M3: CLEAN — reduced-motion is genuinely respected via `useMotion()` → `noInit`/`noMotionTransition` applied to every motion element (lines 297-299, 353, 394, 410-412, 432-434, 488-490).
- M4: CLEAN — option rows have hover/active feedback (`hover:bg-surface-raised`, active bg swap, icon/shortcut color shift, animated return-arrow on active).
- M5: CLEAN — animations use `opacity`/`y` (transform), not layout props; the only layout-ish transition is `transition-[color,background-color]`.
- M1: CLEAN — uses `springs.snappy` / `tweens.fade` (intentional tokens), no `backOut`/overshoot-by-default.

## Polish plan (ordered steps to reach the finish bar)
1. Fix the docs drift (P1): correct "fuzzy matching" → "substring filtering" and regenerate the prop table to cover all shipped props + the `renderLabel`/`filterValue` item fields.
2. Bound the entrance stagger (P2 M2): cap per-item delay or switch to a container `staggerChildren`; stop re-staggering on every query change.
3. Add a forced-colors active-row fallback (P2 H): outline/border on `[aria-selected=true]` under `@media (forced-colors)`.
4. Replace arbitrary numeric utilities with tokens where one exists (P2 G2): kbd `h-[20px]`/`min-w-[20px]` → size tokens; reconsider `z-[1]`. Leave `max-w-[560px]`/`top-[20%]` if commented as deliberate layout constants.
5. Optional (P3): retitle story to `Composed/CommandPalette`; reconsider uppercase group headers; bind `aria-expanded`.

## Clean (rubric dims that pass)
- V1 accent rail: none. V2 double-edge: none (overlay uses shadow only; kbds use border-only). V3 gradient text: none. V4 framework palette: none — uses semantic `accent`/`surface` tokens throughout. V5 emoji: none (real Tabler icons via Icon API). V6 blob/glass/glow: none. V7 rounded-everything: uses `rounded-overlay-lg`/`rounded-surface`/`rounded-control` vocabulary, pills only where appropriate. V8 pill spam: none.
- V9 fonts: uses `font-sans` / `text-ds-*` tokens (story-only inline `fontSize` px is in non-shipping story render, acceptable). V10 decorative numbering: none. V11-V13: n/a (single overlay, not a marketing layout).
- E1-E8 verbal tells: JSDoc and doc prose are direct and clean — no em-dash tics, no AI vocabulary, no hedging. (One em dash appears in JSDoc/doc as a genuine punctuation dash, not a stylistic connector reflex.)
- F5 composes base primitive (Dialog) — does not re-roll surface. F6 controlled/uncontrolled complete.
- G1 surface: CLEAN — overlay correctly on `bg-surface-overlay` / inner chrome on `bg-surface-raised` (surface-1 tier is correct for an overlay per the layering rule). G3 no variant-axis drift (no CVA axes here; it's a single-config widget). 
- H state coverage: keyboard nav (arrows/enter/escape), focus management (input autofocus on open via rAF), empty state (incl. zero-children safe), ARIA combobox/listbox/option, `aria-activedescendant`, scroll-active-into-view, platform-aware modifier display. Strong.
- I types: no `any` in the public API; `forwardRef` + `displayName` present; `IconInput` (not `ReactNode`) used consistently; controlled-state types correct. CLEAN.
- M1/M3/M4/M5 motion: clean (see Motion gaps).
- Tests: thorough — a11y (closed/open/empty), controlled/uncontrolled, keybinding variants, ReactNode labels + filterValue, renderLabel, custom empty/footer/maxHeight. Stories: 15 variants covering all features.
