# ui/tabs — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

Tabs is a competent, token-driven, accessible compound built on the vendored Radix primitive. It has **no hard AI tells** — no accent rail, no gradient text, no framework palette, no emoji, no glass/blob, tokens used throughout, focus-visible present, keyboard nav inherited from Radix. What keeps it off the Card bar: animation ships with **no reduced-motion guard** (the helper exists and is unused), a couple of **dead/raw utilities** that bypass the token system (`duration-100`, the meaningless `ring-offset-background`), a **controlled-state mirror in the root** that re-implements what Radix already tracks (drift risk + a real bug surface), missing **forced-colors** fallback on the indicator, and **docs/state-coverage gaps** (the `color` axis is undocumented in the prop table; no forced-colors / reduced-motion / RTL demonstration).

## Findings

### [P1][M3] Indicator + content animations have no reduced-motion guard
- **Category:** motion
- **Evidence:** tabs.tsx:276-279 — `<motion.span layoutId={…-contained} … transition={springs.smooth} />`; tabs.tsx:286-298 line indicator same; tabs.tsx:321-327 content `<motion.div initial={{opacity:0}} animate={{opacity:1}} transition={tweens.fade}>`
- **Why:** A `prefers-reduced-motion: reduce` user still gets a spring-sliding pill/underline and a fade on every tab switch. `lib/motion.ts:58` ships a `withReducedMotion()` helper that this file never calls, and there's no `useReducedMotion()`/`MotionConfig` gate — so motion is unconditional.
- **Fix:** Gate the `layoutId` springs and the content fade behind `useReducedMotion()` (or wrap in `MotionConfig`): when reduced, drop the `layoutId` slide to an instant position change and set the content transition to `duration: 0`. Mirror whatever Card/Dialog do for the system-wide guard.

### [P1][F5/G2] Root re-implements controlled/uncontrolled state Radix already owns
- **Category:** drift
- **Evidence:** tabs.tsx:62-99 — `const [activeValue, setActiveValue] = React.useState(valueProp ?? defaultValue ?? '')` + a `useEffect` to "Sync controlled value" + a `handleValueChange` that double-tracks, feeding a separate `TabsValueContext` used only to compute `isActive` (tabs.tsx:257).
- **Why:** Radix `Tabs.Root` already tracks the active value and stamps `data-state="active"` on each trigger. This shadow copy exists only so `TabsTrigger` can decide whether to render the `motion.span` indicator — but it duplicates source-of-truth state, adds an effect, and is fragile: e.g. an uncontrolled consumer who changes `defaultValue` between renders, or a controlled consumer passing `value={undefined}` transiently, can desync the mirror from Radix's real state. The contained variant already keys off `isActive` for its absolutely-positioned pill; a cleaner read is `data-[state=active]` / Radix's own state rather than a parallel context.
- **Fix:** Drive the indicator's presence off the trigger's own `data-state` (CSS `group`/`data-[state=active]` or Radix's `useTabsContext` if exposed) and delete `TabsValueContext` + the mirror state + the sync effect. One source of truth.

### [P1][G2] Raw `duration-100` + dead `ring-offset-background` bypass the token system
- **Category:** drift
- **Evidence:** tabs.tsx:151 — `transition-colors duration-100 …` (raw Tailwind duration, not a DS `duration-fast-*` utility); tabs.tsx:315 — `'ring-offset-background focus-visible:…'` where `ring-offset-background` resolves to nothing (no `--color-background` token exists; repo-wide this class appears **only** in tabs.tsx — Button at button.tsx:22 uses bare `ring-offset-2`).
- **Why:** `duration-100` is the one hardcoded ms value in the file (everywhere else is `duration-fast-02` etc. via the motion vocabulary); `ring-offset-background` is a shadcn leftover that emits no rule — dead noise that implies a token that doesn't exist.
- **Fix:** Replace `duration-100` with the matching `duration-fast-*` utility (70/110ms). Drop `ring-offset-background` entirely (it does nothing) or bind the offset color to a real surface token if a visible offset is intended.

### [P2][H/a11y] Active indicator has no forced-colors fallback
- **Category:** a11y
- **Evidence:** tabs.tsx:242-245 `lineIndicatorColorMap` → `bg-accent-9` / `bg-surface-fg`; tabs.tsx:277 contained pill `bg-surface-overlay shadow-raised`.
- **Why:** In Windows High Contrast / `forced-colors: active`, background-color and box-shadow are flattened — the only signal of the active tab (a colored bar / a shadowed pill) can disappear, leaving no visible selected state. Radix sets `aria-selected` so SRs are fine, but sighted forced-colors users lose the visual.
- **Fix:** Add a `forced-colors:` fallback — e.g. an `outline`/`border` on the active trigger or a `forced-colors:bg-[Highlight]` on the indicator — so selection survives color flattening. Show it in a forced-colors story.

### [P2][J] `color` axis missing from the doc prop table
- **Category:** docs
- **Evidence:** docs/components/ui/tabs.md:13-16 lists TabsList props as `variant / size / orientation` only — no `color`; it appears solely buried in the v0.31.0 Changes entry (tabs.md:58-59). Source ships `color?: 'accent' | 'neutral'` on `TabsListProps` (tabs.tsx:196-197) and a full Colors story exists (tabs.stories.tsx:181-229).
- **Why:** Doc prop table is stale vs source — a consumer reading the table won't know `color` exists. J (docs parity) gate.
- **Fix:** Add `color: "accent" | "neutral"` (default `accent`) to the TabsList section of tabs.md and to llms-full.txt if it mirrors this.

### [P2][H] No reduced-motion / forced-colors / RTL story or test
- **Category:** state-coverage
- **Evidence:** tabs.stories.tsx covers Line, Contained, Disabled, Sizes, Colors, Vertical, VerticalContained, ManyTabs — but none demonstrate reduced-motion, forced-colors, or RTL (directional concern: the vertical line indicator pins `left-0` at tabs.tsx:292, which should mirror to the right edge in RTL). tabs.test.tsx covers render/switch/aria-selected/size/color/axe/keyboard — no reduced-motion or dir=rtl assertion.
- **Why:** The Card bar requires the applicable state matrix be demonstrated. Motion + directional indicator are exactly the states most likely to regress.
- **Fix:** Add a reduced-motion story (once M3 is fixed) and an RTL story; verify the vertical line indicator flips edges under `dir="rtl"`.

### [P2][M4] Content has entrance fade but no exit; LayoutGroup re-instantiated per list
- **Category:** motion
- **Evidence:** tabs.tsx:321-327 — content `motion.div` animates `initial→animate` opacity only, no `AnimatePresence`/exit (Radix unmounts inactive panels, so the new panel pops in with no crossfade out of the old); tabs.tsx:220 wraps each `TabsList` in its own `<LayoutGroup>` with a `useId`-scoped `layoutId`.
- **Why:** Enter-only fade with hard unmount is the "uniform/one-directional" motion smell (M2-adjacent); not broken, just unfinished vs the intentional enter/exit the rubric asks for. The per-list `LayoutGroup` is actually correct (isolates indicators between multiple tab bars on a page) — noting it so it isn't "fixed" away.
- **Fix:** Optional polish — wrap content in `AnimatePresence mode="wait"` for a crossfade, or accept enter-only as deliberate and document it. Low priority.

### [P3][G3] `variant: line | contained` is off the canonical button taxonomy
- **Category:** vocabulary
- **Evidence:** tabs.tsx:124-148, 154-164 — `variant` axis is `line | contained`, not the canonical `solid/soft/outline/ghost/link`.
- **Why:** Rubric G3 names the canonical variant taxonomy. Tabs legitimately need their own pattern vocabulary (underline vs pill is the universal tab idiom), so this is a defensible domain-specific axis, not button-variant drift — flagging only for the synthesis pass to confirm it's an accepted exception.
- **Fix:** None recommended; keep `line | contained`. Confirm it's whitelisted as an intentional per-component axis.

### [P3][F1] `color` could be a richer semantic axis but is acceptable as-is
- **Category:** composability
- **Evidence:** tabs.tsx:108 `type TabsColor = 'accent' | 'neutral'` — only two of the canonical color values (no success/warning/error/info).
- **Why:** Minor; tabs rarely need semantic-status coloring, so the reduced set is reasonable. Not a tell.
- **Fix:** None now; widen to the full color axis only if a real use case appears (widening is non-breaking).

## Composability gaps
- **Root double-tracks state** (F5/G2, P1): `TabsValueContext` + mirror `useState` + sync effect duplicate Radix's own active-value tracking. Should read `data-state`/Radix context instead of maintaining a parallel copy. This is the one genuine composability/drift defect.
- **No `asChild` consideration** — N/A and correct: Tabs parts are built on Radix primitives that already forward refs and accept `data-*`; consumers compose via the four sub-components. No bespoke corner-props, no `icon`/`action`/`badge` props — content goes through `children`. Composability model is otherwise clean (matches the Card slot philosophy).
- **Controlled/uncontrolled (F6):** Correct on the surface — supports `value`, `defaultValue`, `onValueChange` (proper non-input naming), delegates to Radix. The risk is purely the redundant mirror above, not a missing mode.

## Motion gaps
- **No reduced-motion guard** on indicator springs or content fade (M3, P1) — `withReducedMotion`/`useReducedMotion` unused despite existing in `lib/motion.ts`.
- **No exit animation** on content; Radix hard-unmounts inactive panels so switches are enter-only fades, no crossfade (M4, P2).
- **No forced-colors fallback** for the active indicator (overlaps a11y H) — motion's end-state (the colored/shadowed indicator) vanishes under color flattening.
- **Clean:** uses `springs.smooth` (no `backOut`/overshoot-by-default → M1 clean); `layoutId` slide animates transform, not layout props (M5 clean); per-list `LayoutGroup` correctly scopes the shared-layout indicator.

## Polish plan (ordered steps to reach the finish bar)
1. **Reduced-motion (M3):** gate the `layoutId` indicator springs and the content fade behind `useReducedMotion()` / `MotionConfig`; instant position + `duration:0` when reduced.
2. **Kill the state mirror (F5):** drive indicator presence off the trigger's `data-[state=active]` / Radix context; delete `TabsValueContext`, the mirror `useState`, and the sync `useEffect`.
3. **Token hygiene (G2):** swap raw `duration-100` for a `duration-fast-*` utility; delete the dead `ring-offset-background` class.
4. **Forced-colors fallback (H/a11y):** add a `forced-colors:` outline/border on the active trigger so selection survives color flattening.
5. **Docs parity (J):** add the `color` axis to the tabs.md prop table (and llms-full.txt).
6. **State demos (H):** add reduced-motion + forced-colors + RTL stories; assert the vertical line indicator mirrors edge under `dir="rtl"`.
7. **Optional (M4):** `AnimatePresence` crossfade on content, or document enter-only as deliberate.

## Clean (rubric dims that pass)
- **V1 accent rail:** none — the line underline is the tab's selection indicator (legitimate UI), not a decorative card rail.
- **V2 double-edge:** contained pill uses `shadow-raised` (elevation) without a competing border; line list uses `border-b` only. No double edge.
- **V3 gradient text / V4 framework palette / V5 emoji / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** all absent. Colors are `accent-*` / `surface-*` semantic tokens; radii are `rounded-surface` / `rounded-control` from the DS vocabulary.
- **V9 safe-face font:** `font-sans` token, no hardcoded Inter/Geist.
- **E1–E8 verbal tells:** JSDoc and doc prose are direct and technical — no em-dash tic abuse, no AI vocabulary, no hedging, no engagement bait, no placeholders.
- **a11y baseline:** `role="tab"`/`aria-selected` (via Radix), keyboard arrow nav tested, `focus-visible:ring-2 ring-accent-9`, `disabled:` handled, axe-clean test present.
- **types/I:** proper `forwardRef` on all four parts, `displayName` set, `VariantProps`-derived types, exported type aliases (`TabsProps`, `TabsListProps`, `TabsContentProps`, `TabsColor/Size/Orientation`); no `any`, no `React.FC`, no stringly enums.
- **G1 surface:** TabsList contained uses `bg-surface-raised`, pill `bg-surface-overlay` — appropriate levels for an inline control bar, not a card-on-surface-1 violation.
