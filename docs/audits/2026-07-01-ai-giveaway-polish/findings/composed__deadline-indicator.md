# composed/deadline-indicator — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:5 P3:2

DeadlineIndicator is a small inline status span: it computes minutes-remaining from a
`deadline`, maps it to a success/warning/error text color, formats relative/absolute time,
and pulses opacity when critical/overdue. It is structurally clean — no card, no accent rail,
no gradient, no emoji, semantic color tokens throughout. The real gaps are **motion** (an
unguarded infinite pulse with a magic-number duration) and **a11y/state-coverage** (the
auto-refresh and the urgency are invisible to assistive tech). It does not need to compose a
base primitive — it is a leaf text node — so most composability dimensions are N/A.

## Findings

### [P1][M3] Infinite pulse has no reduced-motion guard
- **Category:** motion
- **Evidence:** deadline-indicator.tsx:105-110 — `<motion.span … animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />`
- **Why:** A forever-repeating opacity flash ships with no `prefers-reduced-motion` respect; vestibular/ADHD users get a perpetual flicker. The sibling `composed/empty-state.tsx:55,83-84` already does the correct guard (`const reducedMotion = useReducedMotion()` → `animate={reducedMotion ? {} : …}`), so this is a drift from an established in-repo pattern, not a missing capability.
- **Fix:** `const reducedMotion = useReducedMotion()`; gate the pulse: `animate={reducedMotion ? undefined : { opacity: [1, 0.7, 1] }}` and drop the repeat transition when reduced. When reduced, fall through to the static `<span>` branch.

### [P1][H] Auto-refresh + urgency are invisible to assistive tech (no aria-live / role=status)
- **Category:** a11y / state-coverage
- **Evidence:** deadline-indicator.tsx:68-73 (`setInterval(forceUpdate, refreshInterval)` re-renders text every 60s) and the render spans at :105-114 / :120-129 carry no `role`, `aria-live`, or `aria-label`.
- **Why:** The component's whole job is to communicate time pressure, yet (a) the 60s text updates ("12h left" → "11h left" → "Overdue") are never announced, and (b) success/warning/critical is encoded by color alone — a screen-reader user gets the same flat reading of "Overdue" whether it pulses red or not. Urgency that only exists in pixels fails non-visual users.
- **Fix:** Add `role="status"` (or `aria-live="polite"`) to the span so refresh updates are announced; consider an `aria-label` that includes the urgency tier (e.g. `aria-label="Critical: 2h left"`) since color carries the warning/critical distinction visually.

### [P2][M2] Pulse duration is a raw magic number, off the duration scale
- **Category:** motion / drift
- **Evidence:** deadline-indicator.tsx:109 — `transition={{ duration: 2, repeat: Infinity }}`
- **Why:** `2` (seconds) is hardcoded, not drawn from `ui/lib/motion.ts` `durations` (longest preset is `slow02: 0.7`) nor any `--duration-*` token. Card/StatCard pull all timing from `springs`/`tweens`/`durations`. A bare `2` is the timing equivalent of a hardcoded px.
- **Fix:** Define an explicit ambient/attention loop in the motion lib (e.g. a `pulse` preset) or at minimum a named local constant with a comment; reference it instead of the literal. Pair with the M3 guard.

### [P2][H] WCAG 2.2.2 — auto-updating moving content with no pause/stop
- **Category:** a11y / motion
- **Evidence:** deadline-indicator.tsx:108-109 — `repeat: Infinity` with no mechanism to stop, plus the 60s `setInterval` at :71.
- **Why:** WCAG 2.2.2 (Pause/Stop/Hide) targets content that moves/blinks automatically and runs >5s. The pulse runs indefinitely. The reduced-motion guard (M3) is the primary mitigation, but the indefinite blink on its own is a borderline 2.2.2 concern for many critical/overdue items on one screen (a task list of overdue rows all flickering).
- **Fix:** Reduced-motion guard satisfies the spec for users who set the preference; additionally consider damping the pulse (3–4 cycles then settle, or a softer opacity floor than 0.7→1) so a board of overdue items isn't a strobe field.

### [P2][J] Doc contradicts source: claims "does not live-update" while source auto-refreshes every 60s
- **Category:** docs / drift
- **Evidence:** docs/components/composed/deadline-indicator.md:28 (`**Doesn't live-update** — uses Date.now() at render time`) and :34 (`does not live-update (re-render to refresh)`) vs deadline-indicator.tsx:26-27 + 68-73 (`refreshInterval` default `60000`; `setInterval(forceUpdate, refreshInterval)`).
- **Why:** The component DOES live-update every 60s by default; the doc tells consumers the exact opposite. A consumer trusting the doc will add a redundant parent interval or assume the value is stale — both wrong. Per docs-parity rule, source wins.
- **Fix:** Rewrite both lines to describe the actual behavior: auto-refreshes every `refreshInterval` ms (default 60000); pass a falsy `refreshInterval` (e.g. `0`) to disable ticking.

### [P2][J] `refreshInterval` prop missing from the doc props table
- **Category:** docs
- **Evidence:** docs/components/composed/deadline-indicator.md:8-15 (Props + Defaults list `deadline`, `warningThreshold`, `criticalThreshold`, `format`, `showIcon` only) vs source public prop `refreshInterval` (deadline-indicator.tsx:27).
- **Why:** The per-component doc must list the full public prop surface; `refreshInterval` is a documented, defaulted public prop silently omitted from the table.
- **Fix:** Add `refreshInterval: number (ms, auto-refresh interval; 0 disables)` to Props and `refreshInterval={60000}` to Defaults.

### [P3][G2] Redundant hardcoded `font-sans` on the span
- **Category:** drift / vocabulary
- **Evidence:** deadline-indicator.tsx:107 and :123 — `'inline-flex items-center gap-ds-01 font-sans text-ds-sm'`
- **Why:** Sans is already the DS body default, so `font-sans` is a no-op restatement. It's harmless and CardTitle does the same defensively (card.tsx:184), so this is a nit, not a real tell — flagged only for consistency review.
- **Fix:** Drop `font-sans` unless it's deliberately guarding against an inherited mono context (if so, leave a comment); otherwise rely on the inherited family.

### [P3][V-soft] "Traffic-light everything" — bright success-green for any far-off deadline
- **Category:** visual-tell (mild)
- **Evidence:** deadline-indicator.tsx:88-89 — `else { colorClass = 'text-success-11' }` (default branch for anything past the warning threshold).
- **Why:** A deadline six months out renders in saturated success-green. Coloring *every* non-urgent deadline green is a mild reflex (status-color-everything); a far-off deadline is usually just "fine," which often reads better as neutral/muted text, reserving color for warning/critical/overdue. This is a design preference, not a hard tell — flagged for the synthesis pass to decide.
- **Fix:** Consider `text-surface-fg-muted` (or `-subtle`) for the far-off/default tier and let warning/critical/overdue be the only colored states, so color = "pay attention."

## Composability gaps
- None that matter. This is a leaf text component (`<span>`), correctly typed as `HTMLSpanElement` with `forwardRef` + `displayName`. It does not need `asChild`, slots, or to compose Card — wrapping it in Card/StatCard would be a consumer's job. F1–F6 are effectively N/A.
- Minor: the two render branches (pulse `motion.span` at :103-118 vs static `span` at :120-129) duplicate the className, ref, icon, and tooltip-wrap logic. Not a rubric tell, but it's the kind of fork where the M3 fix should consolidate to one render path (single element, conditional `motion`/animate props) rather than two near-identical trees.

## Motion gaps
- **M3 (P1):** infinite pulse with no `useReducedMotion()` guard — the headline gap; sibling `empty-state.tsx` shows the correct pattern.
- **M2 (P2):** `duration: 2` is a raw literal, off the `durations`/`--duration-*` scale.
- **M4:** no entrance motion when the indicator first mounts or when it crosses a threshold (e.g. a deadline ticking from warning → critical produces no transition, just an abrupt color swap). Lower priority for an inline status atom, but a color crossfade on threshold change would match the StatCard-bar intentionality. Not separately scored above (folded into polish plan).
- No animating-layout-props issue (M5 clean — only opacity is animated).

## Polish plan (ordered steps to reach the finish bar)
1. **Add the reduced-motion guard (M3).** Import `useReducedMotion`; collapse the two render branches into one element that conditionally applies `animate`/`transition` only when `shouldPulse && !reducedMotion`. This kills the dual-tree duplication at the same time.
2. **Tokenize the pulse timing (M2).** Replace `duration: 2` with a named motion constant (add a `pulse`/`attention` loop preset to `ui/lib/motion.ts`, or a local `const ATTENTION_PULSE` with a comment). Soften the floor (e.g. `0.85` instead of `0.7`) so a list of overdue rows isn't a strobe.
3. **Wire a11y (H).** Add `role="status"` + `aria-live="polite"` so the 60s refresh and threshold changes are announced; add an `aria-label` that names the urgency tier so the warning/critical/overdue distinction isn't color-only.
4. **Fix the doc (J ×2).** Rewrite the two "doesn't live-update" lines to describe the `refreshInterval` auto-refresh, and add `refreshInterval` to the Props/Defaults tables.
5. **(Optional) Re-tier the default color (V-soft).** Move far-off deadlines to muted/neutral text; reserve color for warning/critical/overdue so color reads as urgency.
6. **(Optional) Threshold-change crossfade (M4).** Animate the color transition when a deadline crosses a threshold so the state change is felt, not just swapped.

## Clean (rubric dims that pass)
- **V1 accent rail:** none — inline text, no card surface, no left/top stripe. Clean.
- **V2 double edge / V6 blob-glass-glow / V7 rounded-everything:** N/A — no surface, no border, no shadow, no radius. Clean.
- **V3 gradient text:** none — solid semantic color classes only. Clean.
- **V4 framework palette:** uses semantic tokens (`text-success-11`, `text-warning-11`, `text-error-11`), no raw `indigo/violet/slate`. Clean.
- **V5 emoji:** none in source/story/test — uses `IconClock` via the Icon API. Clean.
- **V8 pill spam / V10–V14 (numbering, eyebrow, all-caps, hero):** N/A / clean.
- **G1 surface:** N/A — not a surface component, so SURFACE1 layering doesn't apply.
- **G3 variant axes:** no CVA variant/size/color axes (it's threshold-driven), so no axis-naming drift. Tokens used for spacing/type (`gap-ds-01`, `text-ds-sm`). Clean.
- **E1–E8 verbal tells:** JSDoc and visible strings ("Overdue", "Due now", "left") are terse and literal — no em-dash tic, no AI vocabulary, no hedging. Clean.
- **I types:** `forwardRef<HTMLSpanElement>`, correct element ref, `displayName` set, props extend `HTMLAttributes<HTMLSpanElement>`, no `any`, thresholds are typed numbers, `format` is a string-union. Clean.
- **M5 animating layout props:** only `opacity` animates. Clean.
- **J docs (stories/test present):** has a stories file (6 stories: FarAway/Warning/Critical/Overdue/WithIcon/AbsoluteFormat) and a test file (8 specs + `describeConformance` + axe). A per-component markdown doc DOES exist at `docs/components/composed/deadline-indicator.md` — but it has two accuracy defects (see the two [P2][J] findings: contradicts source on live-update, and omits `refreshInterval`). Story coverage does not demonstrate reduced-motion or the auto-refresh, which ties to the motion/a11y findings above.
