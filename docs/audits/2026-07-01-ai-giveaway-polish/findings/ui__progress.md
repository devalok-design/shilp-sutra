# ui/progress — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

## Findings

### [P1][M5] Determinate indicator animates `width` (layout prop) instead of transform
- **Category:** motion
- **Evidence:** progress.tsx:154 — `animate={{ width: \`${value || 0}%\` }}` with `transition={springs.smooth}`; CVA base also has `transition-[width]` (progress.tsx:30 + 199-equiv).
- **Why:** Animating `width` is the rubric's M5 tell — it forces layout/paint each frame instead of a compositor-only transform. A progress bar is exactly the case the bar-fill-via-`scaleX` pattern exists for.
- **Fix:** Animate `transform: scaleX(value/100)` with `transform-origin: left` (full-width indicator), or keep width but drop the spring (see M1). Radix's own pattern is a 100%-wide indicator translated/scaled by a CSS var; align with that.

### [P1][M1] Spring (`springs.smooth`) on the fill can overshoot past the target value
- **Category:** motion
- **Evidence:** progress.tsx:155 — `transition={springs.smooth}` (stiffness 300 / damping 30 / mass 0.8 — underdamped) driving `width`.
- **Why:** A spring on a *quantitative* bar means the fill visually shoots past, e.g., 100% briefly renders >100% then settles back. Overshoot on a value readout is a meaning-bug, not just polish — it reads as the metric exceeding its max. Rubric M1: overshoot only where it means something; a progress value is the one place it must not.
- **Fix:** Use a tween (e.g. `tweens.layout`, productive easing) for the fill. Reserve springs for spatial UI, not data magnitude.

### [P1][G4] Track surface drifts from sibling track component (Slider)
- **Category:** drift / vocabulary
- **Evidence:** progress.tsx:16 — track is `bg-surface-raised`; Slider's track (slider.tsx:11) is `bg-surface-raised-hover`. CLAUDE.md surface rule: **surface-3 = track fills**; `--color-surface-raised` is surface-2 (`neutral-1/2`), `--color-surface-raised-hover` is surface-3 (`neutral-3`).
- **Why:** Two track components in the same family use two different surface levels for the same concept. On a white card (`bg-surface-raised`), Progress's empty track is the *same* color as the card it sits on — the unfilled portion vanishes, leaving only the colored fill floating. Slider got this right.
- **Fix:** Track → `bg-surface-raised-hover` (surface-3, the canonical track-fill level) to match Slider and give the empty track a visible groove.

### [P2][M3] No reduced-motion guard on the determinate fill
- **Category:** motion / a11y
- **Evidence:** progress.tsx:148-156 — determinate `motion.div` springs `width` with no reduced-motion handling. Only the *indeterminate* branch has a guard (`motion-reduce:animate-none`, progress.tsx:139).
- **Why:** A user with `prefers-reduced-motion` still gets the animated/overshooting fill sweep. Rubric M3 / H reduced-motion. Framer-motion respects `MotionConfig reducedMotion` only if a consumer wraps it — the component shouldn't assume that.
- **Fix:** Gate the framer animation (e.g. `useReducedMotion()` → snap to final width, or `initial={false}` + `transition` shortened) so reduced-motion users get an instant set.

### [P2][H] `autoColor` is silently ignored for the indeterminate state
- **Category:** state-coverage
- **Evidence:** progress.tsx:116-125 — `effectiveColor` is only computed `autoColor && value != null`; indeterminate path (progress.tsx:136-141) uses `effectiveColor` which falls back to `color`. Combined with `showLabel` being suppressed for indeterminate (progress.tsx:161), the indeterminate state has narrower behavior with no doc note.
- **Why:** Not a bug per se, but an undocumented state gap — `autoColor` has no meaning without a value, yet the prop accepts both. Edge behavior should be stated.
- **Fix:** Document that `autoColor`/`showLabel` are no-ops in indeterminate mode (JSDoc + doc), or type them out.

### [P2][F6] `indicatorClassName` is the escape hatch where a slot/`asChild` would be cleaner
- **Category:** composability
- **Evidence:** progress.tsx:85-86, 145, 150 — `indicatorClassName` bespoke prop; the story (`CustomIndicator`, progress.stories.tsx:94-106) uses it to override color with `bg-success-9` — which the `color` axis already does.
- **Why:** The one demoed use of `indicatorClassName` (`bg-success-9`) is already expressible as `color="success"`. A bespoke `*ClassName` passthrough is the weakest composability tool; it leaks Tailwind into consumer code and competes with the canonical `color` axis.
- **Fix:** Keep `indicatorClassName` (harmless) but change the story to `color="success"`; if a richer indicator (striped/gradient overlay) is ever wanted, expose it via the Radix `Indicator asChild` slot rather than a class string.

### [P2][state-coverage] No determinate value clamping; `value > 100` overflows the track silently
- **Category:** state-coverage
- **Evidence:** progress.tsx:154 — `width: \`${value || 0}%\`` with no clamp. StatCard's inline `ProgressBar` *does* clamp (stat-card.tsx:192 `Math.max(0, Math.min(100, progress))`). `autoColor` even branches on `value > 100` → `error` (progress.tsx:119) implying out-of-range is expected input.
- **Why:** Family inconsistency: the sibling progress bar in StatCard clamps, this one doesn't. A value of 150 yields `width:150%` (overflows / clipped by `overflow-hidden` but `aria-valuenow` may go out of range too).
- **Fix:** Clamp `value` to 0–100 for width (keep raw value for `autoColor` threshold if intended), matching StatCard's ProgressBar.

### [P3][docs] No per-component doc / make-kit entry verified
- **Category:** docs
- **Evidence:** No `packages/core/docs/components/**/progress.md` found (Glob empty). Component relies on JSDoc + stories only.
- **Why:** Rubric J: per-component doc with prop table is part of the bar. Card/StatCard finish includes doc parity.
- **Fix:** Confirm Progress is covered in llms-full.txt / make-kit with accurate `size`/`color`/`autoColor` props; add per-component doc if the family has them.

### [P3][E1] Em-dash connector in JSDoc/story copy
- **Category:** verbal-tell
- **Evidence:** progress.tsx:56 comment `full-bleed children — dividers`; progress.tsx:75 `next to the bar (only when value is set)`; story line 209 `auto color: ... — error`; the boilerplate `// These are just a few ways — feel free to combine props creatively!` (progress.tsx:76).
- **Why:** Rubric E1 (em-dash as stylistic connector) + E5-ish filler closer. The "feel free to combine props creatively!" line is template engagement-bait shared across components.
- **Fix:** Low priority; if doing a verbal sweep, drop the boilerplate closer and the stylistic em-dashes. (Shared across the family — fix system-wide, not just here.)

## Composability gaps
- `indicatorClassName` (P2/F6) is a class-string passthrough doing work the `color` axis already does; prefer the Radix `Indicator asChild` slot for any real indicator customization.
- No `asChild` on the root — acceptable for a non-polymorphic bar, but the determinate indicator already uses `asChild` internally (progress.tsx:146), so the pattern is available if richer indicators are wanted.
- `value` is controlled-only (no `defaultValue`/uncontrolled) — fine for a display-only progress primitive (F6 doesn't apply; it has no user-driven value).
- Re-rolls the track surface rather than sharing a "track" surface vocabulary with Slider (see G4) — not a primitive-composition gap, but a token-vocabulary one.

## Motion gaps
- M5: determinate fill animates `width` (layout prop) — should be `transform: scaleX`.
- M1: `springs.smooth` overshoots a quantitative value — use a tween / productive easing, no overshoot.
- M3: determinate fill has no reduced-motion guard (only the indeterminate branch does).
- Indeterminate animation is correctly tokenized (`animate-progress-indeterminate`, `--duration-slow-02`) and guarded (`motion-reduce:animate-none`) — that branch is clean.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the fill animation (M5+M1):** switch the determinate indicator from `animate={{ width }}` + `springs.smooth` to `transform: scaleX(value/100)` (origin-left) with `tweens.layout` (no overshoot). Remove `transition-[width]` from the CVA.
2. **Reduced-motion (M3):** add `useReducedMotion()` (or `motion-reduce`) so the fill snaps for reduced-motion users.
3. **Track surface (G4):** change track to `bg-surface-raised-hover` to match Slider and give the empty track a visible groove on white cards.
4. **Clamp value** to 0–100 for the rendered width (match StatCard's ProgressBar); keep raw value only for the `autoColor` threshold if intentionally supporting overflow.
5. **Story cleanup (F6):** change `CustomIndicator` to `color="success"`; document `autoColor`/`showLabel` as indeterminate no-ops.
6. **Verbal sweep (E1/E5):** drop the boilerplate "feel free to combine props creatively!" closer and stylistic em-dashes (do family-wide).

## Clean (rubric dims that pass)
- **V1 accent rail:** none — no left/top colored stripe; fill is a tokenized bar. Clean.
- **V2 double-edge:** track has bg only, no border+shadow. Clean.
- **V3 gradient text:** n/a; label is solid `text-surface-fg-muted` tabular-nums. Clean.
- **V4 framework palette:** uses semantic `accent/success/warning/error-9`, no raw indigo/slate. Clean.
- **V5 emoji:** none. **V7 radius:** `rounded-pill` is correct for a bar. **V8 pill spam:** none.
- **G2 tokens:** spacing/duration/color all tokenized (`gap-ds-03`, `duration-moderate-02`, semantic colors). No raw px/hex.
- **G3 variant axes:** `size` (sm/md/lg) and `color` (default/success/warning/error) are on the canonical taxonomy. (`color="default"` for the brand fill is the canonical neutral-name; acceptable.)
- **I types:** `forwardRef` + `displayName` present; `ProgressProps` exported; omits `color` from primitive to retake it via CVA (correct, avoids the string-color tell). No `any`, no `React.FC`.
- **H a11y:** `progressbar` role + `aria-valuenow` via Radix; tests assert role + valuenow + 0 + indeterminate. Indeterminate correctly drops `aria-valuenow`. axe via `describeConformance`.
- **Stories/tests:** present and reasonably thorough (sizes×colors matrix, indeterminate, label, autoColor interactive); meets the publish gate.
