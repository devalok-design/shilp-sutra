# composed/date-picker — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:5 P2:4 P3:1

Scope: the unit is `composed/date-picker/**`. `date-picker.tsx` (DatePicker) is the primary entry; it composes `calendar-grid.tsx`, `month-picker.tsx`, `year-picker.tsx` inside a `Popover`. The family siblings `date-range-picker.tsx`, `date-time-picker.tsx`, `time-picker.tsx`, `presets.tsx` share the same trigger + surface, so their tells are the picker's default output and are scored here. The visual core is genuinely clean — no accent rails, no gradients, no framework palette, all semantic tokens, real tabler icons via the DS `Icon` API, full roving-tabindex keyboard nav, axe-clean closed. The real gaps are: sub-44px touch targets everywhere, a re-rolled bespoke trigger surface, controlled-only API, a dead hover state, and a disabled-state inconsistency across the family.

Corrections vs the prior draft of this file (verified against source this pass):
- The **Popover DOES animate** its entrance (popover.tsx:83–94 — `motion.div` scale/opacity via `springs.snappy` + `AnimatePresence`). The picker inherits it. The earlier "popover pops in hard / no entrance motion" claim was a false positive and is dropped. The remaining motion gap is *explicit reduced-motion* + inconsistent cell transition tokens, not "no motion."
- The **per-component doc EXISTS** at `packages/core/docs/components/composed/date-picker.md`. J is re-scoped from "missing" to "stale/thin + no state coverage + no make-kit guide."

## Findings

### [P0][H] Sub-44px touch targets on every interactive element
- **Category:** a11y
- **Evidence:** calendar-grid.tsx:273 day cell `'relative flex h-ds-sm w-ds-sm-plus ...'` → `h-ds-sm`=32px × `w-ds-sm-plus`=36px (semantic.css:320/321); date-picker.tsx:133 trigger `'inline-flex h-ds-sm-plus ...'`=36px; date-range-picker.tsx:207 & time-picker.tsx:183 triggers same 36px; month-picker.tsx:86 / year-picker.tsx:81 cells `'h-ds-sm-plus ...'`=36px; nav arrows calendar-grid.tsx:196/220 `h-ds-xs-plus w-ds-xs-plus`=28px; weekday header row `h-ds-sm`=32px (calendar-grid.tsx:240); time-picker.tsx:168 list items `h-ds-sm`=32px.
- **Why:** Rubric H hard-flags interactive touch targets < 44px. The *entire* picker family is built from 28–36px hit areas — a hard a11y giveaway on a pointer/touch surface, and the DS already ships the fix.
- **Fix:** Use the DS `touch-target` utility (utilities.css:181 — `min-width/height:44px`) on interactive cells/trigger/nav-arrows, or wrap the visible cell in a ≥44px padded hit area. Keep the compact visual footprint via inner padding if desired.

### [P1][F5] Trigger re-rolls a bespoke input-like surface instead of composing a base control
- **Category:** composability / drift
- **Evidence:** date-picker.tsx:132–137, date-range-picker.tsx:206–211, time-picker.tsx:182–188, date-time-picker.tsx (same trigger block) all hand-roll the identical string: `'inline-flex h-ds-sm-plus items-center gap-ds-03 rounded-surface border border-surface-border-strong bg-surface-overlay px-ds-04 text-left transition-colors ...'` + focus ring, copy-pasted four times.
- **Why:** The trigger is visually an input/select control but composes neither `Input` nor `Button` nor a shared base — it re-implements height, padding, border, focus ring, disabled inline, four times. This is exactly the drift StatCard fixed by composing `Card`. Any change to control height / focus offset / disabled styling now has to be made in four places and will drift.
- **Fix:** Extract one `PickerTrigger` (or route through the DS `Input`/`Button` via `asChild`) so surface, height, focus ring, and disabled live in one place. All four pickers consume it.

### [P1][F6] Controlled-only API — no uncontrolled mode; `onChange` (input semantics) for a non-input value
- **Category:** composability
- **Evidence:** date-picker.tsx:24–28 `value?: Date | null` + `onChange?`, no `defaultValue`; there is no internal selected-date state — `value` flows straight to `CalendarGrid selected={value}` (date-picker.tsx:112), so an uncontrolled `<DatePicker />` can never show a selection. Same shape on DateTimePicker (date-time-picker.tsx:28–30) and TimePicker (time-picker.tsx:17–19). (DateRangePicker at least mirrors props into local state — date-range-picker.tsx:60–74 — but still has no `defaultStartDate`.)
- **Why:** Rubric F6: supports `value` but not `defaultValue` → no uncontrolled mode. `<DatePicker onChange={fn} />` renders a picker that never reflects the chosen date. Also `onChange` is DOM-`<input>` semantics; DS convention for a non-input value is `onValueChange`.
- **Fix:** Add `defaultValue` and manage selection internally when uncontrolled (standard controlled/uncontrolled pattern). Prefer `onValueChange`; keep `onChange` as a deprecated alias if needed.

### [P1][H] `disabled` prop present on TimePicker/DateTimePicker but missing on DatePicker/DateRangePicker
- **Category:** state-coverage / a11y / vocabulary
- **Evidence:** TimePicker has `disabled?: boolean` (time-picker.tsx:33) and wires it (`:180` `disabled={disabled}`, `:186` `disabled && 'opacity-action-disabled pointer-events-none'`); DateTimePicker also has it (date-time-picker.tsx:36-area). DatePicker (date-picker.tsx:24–39) and DateRangePicker (date-range-picker.tsx:22–36) declare **no** `disabled` prop and never style a disabled trigger or set `aria-disabled`.
- **Why:** Rubric H requires disabled (+`aria-disabled`) coverage; two of the four family entry points support it and two silently don't — a state-coverage hole *and* an intra-family vocabulary inconsistency.
- **Fix:** Add `disabled` to DatePicker + DateRangePicker with the same treatment TimePicker uses (`disabled` on the button, `opacity-action-disabled pointer-events-none`, prevent open). Best done once via the shared `PickerTrigger` from F5.

### [P1][H/M4] Dead hover state on every trigger — hover sets the border to the color it already is
- **Category:** state-coverage / motion
- **Evidence:** date-picker.tsx:133–134 default `border border-surface-border-strong` then `'hover:border-surface-border-strong'`; identical no-op on date-range-picker.tsx:207–208 and time-picker.tsx:183–184.
- **Why:** Interactive control whose hover is a no-op = missing feedback motion (M4) and an incomplete hover state (H). Reads as boilerplate that was wired but never given a real value — the calendar *cells* correctly use `hover:bg-surface-raised-hover`, so the trigger is the odd one out.
- **Fix:** Make hover meaningful and consistent with the cells — e.g. `hover:bg-surface-raised-hover` or a darker border step (`hover:border-surface-border-strong` → a stronger step-8 token). Fix once in the shared trigger.

### [P1][M2] Inconsistent / untokenized cell transitions across the family
- **Category:** motion
- **Evidence:** month-picker.tsx:86 and year-picker.tsx:81 cells use bare `transition-colors` (no duration/easing token), while calendar-grid.tsx:273 cells correctly use `transition-colors duration-fast-01 ease-productive-standard`. Same concept, two timings.
- **Why:** Rubric M2 — the day grid animates with the DS timing tokens; the month/year grids fall back to the browser default. Sibling views of the same picker animate at different speeds → the "uniform-but-actually-inconsistent" tell.
- **Fix:** Normalize month/year cell transitions to `duration-fast-01 ease-productive-standard` (share the cell class or a `pickerCellBase`).

### [P2][V14] Always-on uppercase + wide tracking on weekday / time-column headers
- **Category:** visual-tell
- **Evidence:** calendar-grid.tsx:240 `'... text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-subtle'`; repeated on TimePicker column headers time-picker.tsx:212/236/261/287 ("Hr"/"Min"/"Sec").
- **Why:** Rubric V14 flags `uppercase tracking-*` as reflexive default emphasis. Weekday labels are already `Su/Mo/Tu` (already capitalized two-letter) so `uppercase` is a no-op and `tracking-wider` is purely decorative letter-spacing. Mild, defensible as a calendar convention — flag, don't hard-ban.
- **Fix:** Drop `tracking-wider`; reconsider `uppercase` on the already-capitalized weekday labels. Keep only if documented as a deliberate calendar style.

### [P2][H] State-coverage holes in stories: no forced-colors, RTL, disabled, or "today"-vs-selected demo
- **Category:** state-coverage / a11y
- **Evidence:** date-picker.stories.tsx covers value/format/constraints/controlled/range/time but has no forced-colors story, no RTL story (nav chevrons IconChevronLeft/Right at calendar-grid.tsx:199/223 won't auto-mirror in RTL), no reduced-motion, no disabled-trigger story, and no explicit "today" highlight demo. The "today" marker is **color-only** (`font-semibold text-accent-11`, calendar-grid.tsx:282–283) — it also carries `font-semibold`, which helps, but the accent color is the primary cue.
- **Why:** Rubric H wants the applicable state matrix demonstrated + verified. Directional chevrons in RTL and the accent "today" marker are the riskiest unshown states (color-only differentiation degrades in forced-colors).
- **Fix:** Add RTL + forced-colors stories; verify the today indicator survives forced-colors (add a non-color cue like a ring/underline if `font-semibold` alone isn't enough); add a disabled-trigger story once `disabled` lands on DatePicker.

### [P2][G2] Hardcoded px arbitrary values instead of DS tokens
- **Category:** drift
- **Evidence:** the magic width `"w-[252px]"` is repeated in three files (calendar-grid.tsx:188, month-picker.tsx:64, year-picker.tsx:59); event dots calendar-grid.tsx:293 `'h-[4px] w-[4px]'` and :288 `absolute bottom-[2px] left-0 right-0`; time-picker.tsx:165 `max-h-[200px]`, :215/239/264 `min-w-[48px]`, :298 `min-w-[44px]`, date-range-picker.tsx:233 `min-w-[140px]`.
- **Why:** Rubric G2 — raw px arbitrary values instead of `--spacing-ds-*`. The `252px` calendar width duplicated across three files is a live drift risk (change one, the grids desync).
- **Fix:** Promote the calendar width to a shared const/token; use the smallest spacing token for the dot size/offset (or document why a sub-token px is intentional for a 4px indicator).

### [P2][F1/I] `CalendarEvent.color?: string` is a stringly-typed escape hatch, and event dots are a fixed bespoke region
- **Category:** composability / types
- **Evidence:** calendar-grid.tsx:28–32 `interface CalendarEvent { color?: string }`; :294 `style={{ backgroundColor: evt.color ?? 'var(--color-accent-9)' }}`.
- **Why:** Rubric I flags `color?: string` — a consumer can pass any raw hex, bypassing the semantic palette and inviting off-brand dots. The dot rendering is also a fixed inline region rather than a render slot (rubric F1), so there's no clean way to customize the per-day marker.
- **Fix:** Type `color` to the semantic palette union (`'accent' | 'success' | 'warning' | 'error' | 'info'`) mapped to tokens; keep a raw string only as a documented escape hatch. Optionally expose a `renderDay`/day-content slot for custom markers.

### [P2][J] Per-component doc is stale/thin; no make-kit guide
- **Category:** docs
- **Evidence:** `docs/components/composed/date-picker.md` exists but: (a) its DatePicker prop table omits nothing critical yet documents `onChange` with no note that there's no uncontrolled mode; (b) it has **no state-coverage / a11y section** (touch targets, keyboard map, forced-colors); (c) the family's `format` vs `timeFormat` split (see G3) is presented as-is without flagging the inconsistency; (d) no `make-kit/components/date-picker*.md` exists (CLAUDE.md lists 15 per-component make-kit guides — date-picker isn't one).
- **Why:** Rubric J — doc present but the prop table doesn't surface the controlled-only constraint or a11y, and the make-kit guide is absent for a shipped family.
- **Fix:** Add controlled/uncontrolled + `disabled` notes once the API settles; add a keyboard/a11y section; add the make-kit guide.

### [P3][G3] Family prop-name split: `format` (TimePicker) vs `timeFormat` (DateTimePicker) for the same 12h/24h concept
- **Category:** vocabulary
- **Evidence:** time-picker.tsx:21 `format?: '12h' | '24h'`; date-time-picker.tsx:38 `timeFormat?: '12h' | '24h'`. Same axis, two names.
- **Why:** Minor intra-family vocabulary inconsistency. Not on the canonical variant/size/color axes, so low severity — but it's a real "two names for one thing" tell within a single kit.
- **Fix:** Standardize on one (`timeFormat` reads clearest inside a date-time context; `format` collides with the imported `date-fns` `format`). Deprecate the alias.

## Composability gaps
- Trigger re-rolls an input-like surface (height/border/padding/focus/disabled) copy-pasted across 4 pickers instead of composing a base control — the F5 drift StatCard solved (date-picker.tsx:132–137 et al.).
- Controlled-only: no `defaultValue`/uncontrolled mode on DatePicker/TimePicker/DateTimePicker; DatePicker's selection is purely derived from `value`, so uncontrolled never shows a choice (date-picker.tsx:24–28, :112).
- `onChange` used for a non-input value where DS convention is `onValueChange`.
- No `asChild` on any trigger — consumers can't swap the trigger element (it's a fixed `<button>`). Given the trigger is exactly the kind of element (button-like) that F2 asks polymorphism for, this is a real gap.
- `disabled` supported on TimePicker/DateTimePicker but absent on DatePicker/DateRangePicker — inconsistent API surface.
- `CalendarEvent.color?: string` is stringly-typed instead of a semantic-token union or a render slot; day-cell content is a fixed region with no slot.

## Motion gaps
- Trigger hover is a no-op (`hover:border-surface-border-strong` == default border) — missing feedback motion (M4), across all triggers (date-picker.tsx:134, date-range-picker.tsx:208, time-picker.tsx:184).
- Month/year picker cells use bare `transition-colors` (no duration/easing token) while calendar cells use `duration-fast-01 ease-productive-standard` — inconsistent cell timing (M2; month-picker.tsx:86, year-picker.tsx:81).
- No *explicit* reduced-motion consideration in the unit. (Mitigated: the Popover entrance motion — popover.tsx:83–94 — is the only entrance motion, and framer-motion honors `MotionConfig` globally; but the popover motion block itself has no `useReducedMotion` guard, so reduced-motion relies entirely on a consumer-provided `MotionConfig`.)
- NOT a gap (corrected from prior draft): the calendar popover DOES have a scale/opacity entrance via the shared Popover — it does not "pop in hard."

## Polish plan (ordered steps to reach the finish bar)
1. **Touch targets (P0, H):** apply the DS `touch-target` utility to every interactive cell / trigger / nav-arrow / time-list item so each has a ≥44px hit area; preserve the compact look via inner padding.
2. **Extract one `PickerTrigger` (F5):** collapse the four copy-pasted trigger strings into one shared control (or `asChild` into DS `Input`/`Button`) — surface, height, focus ring, hover, and disabled live in one place.
3. **Fix trigger states on the shared trigger (H/M4):** give hover a real effect (`hover:bg-surface-raised-hover`); add `disabled` (+`aria-disabled`, `opacity-action-disabled`, prevent open) so DatePicker/DateRangePicker match TimePicker.
4. **Controlled + uncontrolled (F6):** add `defaultValue`, internal state when uncontrolled, and `onValueChange` (deprecate `onChange` alias) across DatePicker/TimePicker/DateTimePicker.
5. **Normalize cell motion (M2):** share one cell class so month/year cells use the same `duration-fast-01 ease-productive-standard` as day cells.
6. **Tokens + types (G2/F1/I):** replace `w-[252px]` (×3) and dot px with a shared const/token; type `CalendarEvent.color` to a semantic union; consider a `renderDay` slot.
7. **Stories + docs (H/J/G3):** add RTL, forced-colors, disabled, and today-vs-selected stories; verify today survives forced-colors (add a non-color cue if needed); refresh the doc with controlled/uncontrolled + a11y sections; standardize `format`/`timeFormat`; add the make-kit guide.

## Clean (rubric dims that pass)
- **V1 accent rail:** none — no left/top colored stripe on the popover or cells.
- **V2 double edge:** the calendar surface is the Popover's own `shadow-floating` (popover.tsx:89); cells are border-free. The picker's redundant `border-surface-border-strong` on PopoverContent (date-picker.tsx:153) sits on the overlay but is a cosmetic re-declaration, not a card double-edge.
- **V3 gradient text / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** none — consistent `rounded-control` / `rounded-surface` / `rounded-overlay`, no glow, no pills.
- **V4 framework palette:** all colors are semantic tokens (`accent-9/10/11`, `surface-fg-*`, `success/error-11`, `surface-raised-hover`) — no raw indigo/violet/slate. (calendar-grid.tsx:276–283)
- **V5 emoji icons:** none — real tabler icons via the DS `Icon` API (IconCalendarEvent, IconClock, IconChevronLeft/Right).
- **V9 font / V10 numbering / V11 everything-a-card / V12 kicker / V13 hero / V15 imagery:** clean.
- **E1–E8 verbal:** JSDoc, stories, and the doc are plain and direct — no em-dash tic, AI vocab, hedging, engagement bait, or placeholders.
- **M1 bounce-by-default / M5 animating layout props:** clean — the inherited Popover entrance is a modest scale/opacity `springs.snappy`, no overshoot; nothing animates width/height/top/left.
- **Keyboard a11y:** full Arrow/Home/End/Enter/Space grid navigation with roving tabindex across day/month/year grids (calendar-grid.tsx:142–185, month-picker.tsx:42–61, year-picker.tsx:38–56); roles `grid`/`gridcell`/`columnheader`/`row`; sensible `aria-label`s; `aria-selected`/`aria-disabled` set; axe-clean in closed state (date-picker.test.tsx:18–21).
- **I types (mostly):** `forwardRef` + `displayName` on every component; specific `HTMLButtonElement`/`HTMLDivElement` refs; no `any` in the public surface (the lone `color?: string` is flagged above as the only stringly-typed prop).
- **G1 surface:** the calendar renders inside the Popover overlay (`bg-surface-overlay` / `rounded-overlay` / `shadow-floating`, popover.tsx:89) — correct overlay layer per the MANDATORY layering rule.
- **G4 surface vocabulary / M3 entrance motion:** the picker correctly delegates surface + entrance animation to the shared Popover rather than re-rolling either.
