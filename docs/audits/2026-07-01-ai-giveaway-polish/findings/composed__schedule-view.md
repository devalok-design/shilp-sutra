# composed/schedule-view — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:6 P2:5 P3:2

## Findings

### [P0][V1] Accent rail on every event block
- **Category:** visual-tell
- **Evidence:** schedule-view.tsx:221 — `'absolute left-ds-01 right-ds-01 rounded-control-inner border-l-[3px] px-ds-02 py-ds-01'`
- **Why:** A 3px colored left stripe on a rounded, colored, shadow-on-hover surface is the single most recognizable AI card tell — the exact pattern we killed on Card in v0.44.0. It is the *default* every event ships with, not an opt-in.
- **Fix:** Drop `border-l-[3px]`. The `eventColorMap` already gives each event a full tinted background (`bg-*-2/3`), a full `border-*-7`, and colored text — emphasis is already carried by weight + tint. If a stronger edge is wanted, use the full `border` (the map already sets border color), never a single-side rail.

### [P1][G3] Off-taxonomy `primary` color value
- **Category:** vocabulary
- **Evidence:** schedule-view.tsx:27 — `color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'`; default at :215 `eventColorMap[event.color ?? 'primary']`; map key at :61 `primary: 'bg-accent-2 border-accent-7 text-accent-11'`
- **Why:** G3 explicitly flags `primary` as drift — the canonical color axis is `accent/neutral/success/warning/error/info`. Card uses `accent`. The value is even implemented via `accent-*` tokens, so the *name* is the only thing off — pure drift. A consumer mapping event types to DS colors will reach for `accent` (per Card/Badge) and get a type error.
- **Fix:** Rename the union member `primary` → `accent` (type + map key + default fallback). Breaking for the `color` prop values — note in CHANGELOG as a rename (narrowing of accepted strings = breaking).

### [P1][F5] Re-rolls the surface instead of composing Card
- **Category:** composability
- **Evidence:** schedule-view.tsx:292-296 — `'flex rounded-control border border-surface-border-strong bg-surface-raised overflow-hidden'` on the root; day header :188-190 re-rolls `bg-surface-raised` / `bg-accent-2`
- **Why:** This is the exact drift StatCard fixed by composing `<Card>`. The root hand-rolls surface + radius + border rather than delegating to the base primitive, so it can drift from the surface/elevation system independently (e.g. it uses `rounded-control`, not Card's `rounded-surface`; a bare border with no shadow = an ad-hoc `outline`-ish variant that isn't the Card `outline`).
- **Fix:** Wrap the grid in `<Card variant="outline" className="overflow-hidden p-0">` (or `flat`) so surface/radius/border come from one place. At minimum align to `rounded-surface` and the Card border token.

### [P1][V2] Double edge on event blocks (border + shadow on hover)
- **Category:** visual-tell
- **Evidence:** schedule-view.tsx:220-223 — full `border-*-7` from `colorClass` + `border-l-[3px]` + `'hover:shadow-raised hover:scale-[1.02] ...'`
- **Why:** V2 bans a border AND a drop shadow on the same element. On hover each event carries both its color border and `shadow-raised` (which itself has a 1px ring) — a triple edge with the rail.
- **Fix:** Pick one. Keep the tinted border for the resting edge; on hover lift with `bg-*-3` / brightness or a subtle `shadow-raised` *without* the border (or vice-versa). Don't stack rail + border + shadow.

### [P1][M3] Infinite pulse on now-indicator, no reduced-motion guard
- **Category:** motion
- **Evidence:** schedule-view.tsx:245-249 — `<motion.span ... animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />`
- **Why:** M3 (no reduced-motion) + a perpetual attention-pulse is a classic AI motion tell. It never rests, ignores `prefers-reduced-motion`, and the `repeat: Infinity` keeps the compositor busy indefinitely. Card/StatCard route motion through the shared motion system which honors MotionConfig/reduced-motion.
- **Fix:** Gate the pulse behind `useReducedMotion()` (framer) → render a static dot when reduced. Prefer the DS motion tokens over an ad-hoc 2s loop, or drop the pulse entirely (a solid dot + the red line already reads as "now").

### [P1][H] No visible focus-visible ring on slot/event buttons
- **Category:** a11y
- **Evidence:** schedule-view.tsx:198-208 (slot `<button>`) and :217-232 (event `<button>`) — classes cover hover only (`hover:bg-surface-raised-hover`, `hover:shadow-raised`); no `focus-visible:*` ring.
- **Why:** H requires a `:focus-visible` treatment; these are keyboard-focusable buttons with only hover feedback, so keyboard users get no indication of focus, and nothing survives forced-colors. The DS `focus-ring` utility exists for exactly this.
- **Fix:** Add the shared `focus-ring` utility (or `focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:outline-none`) to both button classnames.

### [P1][G2] Arbitrary pixel values instead of tokens (pervasive)
- **Category:** drift
- **Evidence:** schedule-view.tsx — `w-[60px]` (:117), `min-w-[80px]` (:182), `h-[480px]` (:294), `border-l-[3px]` (:221), `h-[2px]` (:241), `-left-[5px] -top-[4px] h-[10px] w-[10px]` (:246)
- **Why:** G2 — hardcoded px instead of `--spacing-ds-*` / size tokens. Six arbitrary-value classes; the time column width, min column width, fixed 480px height, and the now-dot geometry are all off-scale magic numbers.
- **Fix:** Map to DS spacing/size tokens where they exist (`w-ds-*`, `h-ds-*`); for the 2px line and 10px dot use the nearest token or a documented exception. Replace fixed `h-[480px]` with an intrinsic/consumer-controlled height (see P2 below).

### [P2][H] Fixed 480px height — not responsive, clips content
- **Category:** state-coverage
- **Evidence:** schedule-view.tsx:294 — `'h-[480px]'` hardcoded on the root
- **Why:** A time grid whose height is a fixed magic number squeezes/expands every slot to fit 480px regardless of hour-range; with `startHour=6, endHour=22` (16h) each slot becomes tiny and event text is unreadable. Docs even warn events "may be clipped." Not consumer-overridable except by fighting the class.
- **Fix:** Make height a prop (or derive from slot count with a min slot height, letting the container scroll). At minimum document that consumers override via `className`/`style` and that `h-*` from `className` will need to win the cascade.

### [P2][H] Slot buttons flood the a11y tree
- **Category:** a11y
- **Evidence:** schedule-view.tsx:197-209 — one `<button aria-label="…">` per slot; with defaults (10h / 30min) that's 20 buttons per day column, ×7 in week view = 140 buttons, each announced.
- **Why:** Every empty slot is a labeled interactive control even when `onSlotClick` is not provided — huge screen-reader noise and tab-stops for no action.
- **Fix:** When `onSlotClick` is undefined, render slots as non-interactive `<div aria-hidden>` grid lines (no button, no tabindex, no label). Only make them buttons when a handler exists.

### [P2][M2] Slot/event use ad-hoc easing, not the duration scale by importance
- **Category:** motion
- **Evidence:** schedule-view.tsx:202 `transition-colors ease-productive-standard` (no duration → default), :223 `duration-fast-02`
- **Why:** M2 — timing is inconsistent/under-specified: slot hover has no explicit duration token while events use `fast-02`. Not egregious but not the intentional-scale bar.
- **Fix:** Give slot hover an explicit `duration-fast-02` to match, or standardize both on one token.

### [P2][V2] Now-indicator dot geometry hand-placed with negative px
- **Category:** visual-tell
- **Evidence:** schedule-view.tsx:246 — `'absolute -left-[5px] -top-[4px] h-[10px] w-[10px] rounded-pill bg-error-9'`
- **Why:** Magic-number centering of a decorative dot; brittle and off-token (ties to G2). Minor visual-polish gap vs the Card bar.
- **Fix:** Center with transforms (`left-0 top-0 -translate-x-1/2 -translate-y-1/2`) and a token-sized dot.

### [P2][J] Doc/changelog stale + surface-vocabulary undocumented
- **Category:** docs
- **Evidence:** schedule-view.md:17 lists `"primary" | …` (will drift once renamed); :46-47 changelog frozen at `v0.1.0`; no note that root is a bespoke surface rather than a Card.
- **Why:** J — per-component doc will mismatch CVA/type after the `primary→accent` rename; changelog hasn't tracked any of the token/motion work since v0.1.0.
- **Fix:** Update the color list after the rename; add a changes entry; note the surface it composes.

### [P3][H] Week-view horizontal scroll has no keyboard affordance
- **Category:** a11y
- **Evidence:** schedule-view.tsx:300 — `'flex flex-1 divide-x divide-surface-border overflow-x-auto'`
- **Why:** The 7-column scroller is mouse/trackpad only; keyboard users can reach columns via slot buttons but the scroll region itself isn't focusable. Minor for a display grid.
- **Fix:** Consider `tabIndex={0}` + `role="group"` on the scroller, or rely on focusing inner buttons (acceptable).

### [P3][H] Now-indicator relies on mount-time `new Date()` — never ticks
- **Category:** state-coverage
- **Evidence:** schedule-view.tsx:172-178 — `const now = new Date()` computed in render, no interval
- **Why:** The "current time" line is only correct at render; it drifts as time passes with no `setInterval` update. Users watching a live schedule see a stale line. Arguably out of scope (state-coverage nit) but it undercuts the feature's whole point.
- **Fix:** Add an interval (e.g. every 60s) to re-render the indicator, or document that it's render-time only.

## Composability gaps
- **F5 (primary gap):** Does not compose `<Card>` — hand-rolls surface/radius/border on the root (`bg-surface-raised border rounded-control`). Should build on Card like StatCard does, so surface/elevation live in one place. This is the headline composability miss.
- **No slot for the header/toolbar.** ScheduleView is a closed box: no way to inject a "week of…" title, view-switcher, or today button. A consumer must wrap it externally. A `header`/`toolbar` slot or `<ScheduleView.Header>` compound would match the Card slot model.
- **Event rendering is not slot/render-prop composable.** Event content is fixed (`<span line-clamp-2>{title}</span>`); no `renderEvent`/`children` escape hatch for attendees, icons, or status. Bespoke `title`-only rendering where a render prop belongs.
- **`asChild` (F2):** N/A for the grid container itself, but the slot buttons could benefit from consumer-controlled elements. Low priority.
- **Controlled/uncontrolled (F6):** N/A — this is a stateless display component driven by `date`/`view` props; that's correct.

## Motion gaps
- **M3:** Infinite `scale: [1,1.3,1]` pulse on the now-dot with no `prefers-reduced-motion` guard (schedule-view.tsx:245-249). Highest-priority motion fix.
- **M4/M2:** No entrance motion for events (they pop in), and slot hover has no explicit duration token while events use `duration-fast-02` — inconsistent timing vs the Card/StatCard intentional-motion bar.
- **Layout-prop note (M5):** Event `top`/`height` are set via inline style as static layout (not animated), and slot heights are `%` — this is fine (not animating layout props). The only animated properties are `scale` (transform) — good. No M5 violation.

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the rail (P0/V1):** remove `border-l-[3px]` from event blocks; rely on the full tinted bg + border + text from `eventColorMap`.
2. **Rename `primary`→`accent` (G3)** in the `ScheduleEvent['color']` union, `eventColorMap` key, and the `?? 'primary'` fallback; update doc + CHANGELOG (breaking value rename).
3. **Compose Card (F5):** wrap the grid root in `<Card variant="outline" className="p-0 overflow-hidden">`; drop the hand-rolled `bg-surface-raised border rounded-control`; align radius to `rounded-surface`.
4. **Reduced-motion guard (M3):** gate the now-dot pulse behind `useReducedMotion()`; render a static dot otherwise, or drop the infinite loop.
5. **Focus-visible (H):** add the DS `focus-ring` utility to slot and event buttons.
6. **De-noise the a11y tree (H):** only render slot buttons when `onSlotClick` is provided; otherwise `aria-hidden` grid-line divs.
7. **Detokenize magic numbers (G2):** replace `w-[60px]`, `min-w-[80px]`, `h-[2px]`, `border-l-[3px]`, dot geometry with tokens; make the `h-[480px]` a prop or intrinsic height.
8. **Resolve double-edge (V2)** on hover; standardize hover durations (M2).
9. **Add composition escape hatches:** a header/toolbar slot and a `renderEvent` render prop.
10. **Refresh docs (J):** color list, surface note, changelog entry; consider live-ticking the now-indicator.

## Clean (rubric dims that pass)
- **V3 gradient text:** none. No `bg-clip-text`.
- **V4 framework palette:** colors are all semantic DS tokens (`accent-*`, `success-*`, `surface-*`) — the only issue is the *name* `primary`, not raw indigo/slate.
- **V5 emoji, V8 pill-spam, V10 decorative numbering, V12 eyebrow, V13 hero, V14 all-caps, V15 AI imagery:** none present.
- **V6 blob/glass/glow:** none.
- **V7 rounded-everything:** uses `rounded-control-inner` / `rounded-pill` deliberately, not `rounded-3xl` everywhere.
- **E1–E8 verbal tells:** JSDoc, doc, and story copy are direct and clean — no em-dash tic, no AI vocabulary, no hedging, no placeholders.
- **Types (I):** proper `forwardRef` + `displayName`; `ScheduleEvent`/`ScheduleViewProps` exported; no `any`; specific `HTMLDivElement` ref; typed handlers. `color?: string` is avoided (proper union).
- **M5:** animates transform/opacity only, not layout props.
- **A11y baseline (partial):** root has `role="region"` + descriptive `aria-label`; events/slots are real `<button>`s with accessible labels; time column `aria-hidden`. (Gaps are focus-visible + slot flooding, above.)
- **Tests + stories exist:** conformance harness + 7 behavior tests; 4 stories incl. EmptyState — publish-gate satisfied.
