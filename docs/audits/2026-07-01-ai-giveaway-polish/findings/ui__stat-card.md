# ui/stat-card — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:4 P3:3

StatCard is one of the two named finish exemplars (Card + StatCard). It composes `<Card>`/`<CardContent>` rather than re-rolling surface (F5 clean), the v0.43 accent left-rail was deleted (V1 clean), the metric value is solid-colored + `tabular-nums` (V3 clean), delegates surface to Card via a canonical 4-way `variant` (G3/G4 clean), and `accentStyle="tint"`'s gradient is an explicit, documented, brand-token-bound opt-in (not a tell). The remaining gaps are motion-finish and a small API/composability set — nothing structural or AI-slop. Notable real gap: the component's OWN entrance animations are not self-guarded for reduced motion the way its `StatFlash` dependency is, and the sparkline runs a raw CSS keyframe that no `prefers-reduced-motion` path covers.

## Findings

### [P1][M3] Sparkline draw animation has no reduced-motion guard
- **Category:** motion
- **Evidence:** stat-card.tsx:176-186 — `animation: pathLength > 0 ? \`sparkline-draw-${id...} 1s ease-out forwards\` : 'none'` + injected `@keyframes`
- **Why:** A raw CSS keyframe (1s stroke-dashoffset draw) runs on every sparkline mount; it is outside framer-motion entirely, so neither `useReducedMotion` nor a consumer `<MotionConfig reducedMotion>` can suppress it. A reduced-motion user sees the line draw regardless. This is the one finding that is a guaranteed default-on motion with no escape hatch.
- **Fix:** Gate via `useReducedMotion()` — when reduced, set `strokeDashoffset: 0` and `animation: 'none'` so the line renders statically; or wrap the keyframe in `@media (prefers-reduced-motion: no-preference)`.

### [P2][M3] StatCard's own entrance animations rely on a consumer-supplied MotionProvider for reduced-motion
- **Category:** motion
- **Evidence:** stat-card.tsx:282-284 (delta `y`), :288-291 (icon `scale: 1.4`), :355-358 (value `y: '100%'`), :304-309 / :371-378 / :381-388 / :391-398 (fades). None call `useReducedMotion`.
- **Why:** `StatFlash` self-guards (`stat-flash.tsx:103,117,135`), but StatCard does not. framer-motion only auto-reduces `y`/`scale` if a `<MotionConfig reducedMotion="user">` is in the tree (our `MotionProvider`). A consumer rendering `<StatCard>` without `MotionProvider` gets the slide-up + scale entrance regardless of OS preference. The finish bar is self-contained, like StatFlash.
- **Fix:** Add `const prefersReduced = useReducedMotion()` and set `initial={prefersReduced ? false : {...}}` on the value/label/delta motion elements (mirror the StatFlash pattern), so reduced-motion holds even without a provider.

### [P2][M1] Bounce/overshoot on the delta arrow by default
- **Category:** motion
- **Evidence:** stat-card.tsx:286-291 — delta arrow `initial={{ opacity: 0.5, scale: 1.4 }}` … `transition={springs.bouncy}` (`stiffness 400, damping 15` = overshoot, motion.ts:27 "celebration feedback")
- **Why:** `springs.bouncy` is the celebration spring; using it on every delta arrow entrance makes a routine trend indicator bounce on each mount. M1 is "overshoot only where it means something" — a +12% delta isn't a celebration. The scale-from-1.4 also reads as a tiny zoom-in tell.
- **Fix:** Use `springs.snappy` (the micro-interaction spring already used for the icon chip on :329/:339) or `springs.smooth` for the delta; reserve `bouncy` for `flash`/celebration paths.

### [P2][M5] ProgressBar animates the layout `width` property
- **Category:** motion
- **Evidence:** stat-card.tsx:199 — `transition-[width] duration-moderate-02 …` with `style={{ width: \`${clamped}%\` }}` (:201)
- **Why:** Rubric M5 — animating `width` (a layout-triggering prop) instead of `transform: scaleX`. On low-end devices this is a layout/paint per frame. The DS convention is transform + opacity.
- **Fix:** Animate `transform: scaleX(clamped/100)` with `transform-origin: left` (and `transition-transform`), keeping the track full-width; or accept it as a documented exception (progress fills are a common width-animation case) — but it's a default ship, so flag it.

### [P2][F1/F6] `label`/`title` dual-alias props for one slot
- **Category:** composability
- **Evidence:** stat-card.tsx:66-68 — `label?: string` + `title?: string` ("alias for label"); resolved at :236 `title ?? label ?? ''`
- **Why:** Two props for the same string, both optional, neither required — invites "set both, which wins?" ambiguity (doc gotcha line 68 admits it) and is API surface that a single `label` (or a header slot) would cover. It's the small bespoke-prop end of F1.
- **Fix:** Pick one canonical prop (`label`), `@deprecate` `title` with a dev warning, or expose the metric heading as a slot. At minimum mark precedence in types.

### [P3][F1] Content arrives via bespoke props, not slots (icon, footer, delta, secondaryLabel)
- **Category:** composability
- **Evidence:** stat-card.tsx:81 `icon`, :110 `footer: React.ReactNode`, :75-78 `delta`, :86 `secondaryLabel`
- **Why:** A metric tile is a legitimately "config-shaped" component, so this is borderline — but the prop count (≈20 layout/content props, CONTRIBUTING F3 threshold is 8) is high and several (`footer`, `icon`) are content that a slot would carry more flexibly. Unlike Card (which moved its corner action to `<CardAction>`), StatCard keeps everything as flat props.
- **Fix:** Not required for a metric tile, but consider a `<StatCard.Footer>` slot and accepting `children` for an escape hatch; keep the flat props as the ergonomic default.

### [P3][H] No `asChild` / clickable card uses `role="button"` on a div instead of a real button
- **Category:** a11y / state-coverage
- **Evidence:** stat-card.tsx:429-444 — `<Card role="button" tabIndex={0} onKeyDown=…>`; href path wraps in `<Link>` (:411).
- **Why:** Hand-rolled button semantics on a div (role + tabIndex + Enter/Space handler) is functional and tested (test:88-119) but is the pattern `asChild`/Slot exists to avoid; forced-colors and AT edge cases are easier to lose than with a native `<button>`. Minor because keyboard activation IS covered.
- **Fix:** Acceptable as-is; if revisited, render the interactive surface through a Slot/`asChild` so a real `<button>`/`<a>` carries semantics.

### [P3][H] Loading skeleton has no `aria-busy`/`aria-live`; value swap is silent
- **Category:** state-coverage / a11y
- **Evidence:** stat-card.tsx:241-251 — loading branch renders pulse divs inside `<Card>` with no `aria-busy="true"` or live region.
- **Why:** Rubric H: "loading with no `aria-busy`; async with no `aria-live`." A screen-reader user gets no signal that the tile is loading or that the value arrived.
- **Fix:** Add `aria-busy={true}` to the loading `<Card>` (and ideally `aria-live="polite"` on the value region) so the data-arrival is announced.

## Composability gaps
- `label` + `title` are redundant aliases for one heading (F6-ish API smell) — collapse to one or slot it.
- No `children`/slot escape hatch; all content (icon, footer, delta, secondary, comparison) is fixed-position bespoke props (~20 props vs CONTRIBUTING's 8-prop compound threshold). Justifiable for a metric tile, but it is the opposite end of the spectrum from Card's slot model.
- Interactive mode hand-rolls button/link semantics instead of `asChild`/Slot polymorphism (Card itself also lacks `asChild`, so this is family-consistent, not a regression).
- `footer` typed `React.ReactNode` is the right call (flexible), so not all content props are over-constrained — only `icon`/`label`/`title` are candidates.

## Motion gaps
- **Sparkline CSS keyframe (stat-card.tsx:180) has zero reduced-motion path** — the only motion here that no provider or hook can suppress. Hard M3.
- **StatCard's own y/scale entrances are not self-guarded** (stat-card.tsx:282,288,355) — depend on a consumer `MotionProvider`/`MotionConfig` to reduce; StatFlash guards itself, StatCard should match.
- **`springs.bouncy` on the delta arrow** (stat-card.tsx:290) — celebration overshoot on a routine trend indicator; downgrade to `snappy`/`smooth`.
- **ProgressBar animates `width`** (stat-card.tsx:199) not transform (M5).
- Timing is otherwise intentional and varied (staggered `delay: 0.1/0.15/0.2/0.25`, distinct springs/tweens per element) — no M2 robotic-uniformity tell.

## Polish plan (ordered steps to reach the finish bar)
1. **Sparkline reduced-motion (P1):** add `useReducedMotion()` to `Sparkline`; when reduced, render the path with `strokeDashoffset: 0` and `animation: 'none'`. Closes the only un-escapable motion.
2. **Self-guard StatCard entrances (P2):** add `const prefersReduced = useReducedMotion()` in the body; gate the label/value/delta/secondary/progress/footer `initial`/`animate` so reduced-motion holds without a provider, matching StatFlash.
3. **De-bounce the delta (P2):** swap `springs.bouncy` → `springs.snappy` (or `smooth`) on the delta arrow span (:290) and drop the `scale: 1.4` zoom to a subtler value.
4. **Progress fill via transform (P2):** animate `scaleX` with `transform-origin:left` instead of `width` (:199-201), or document the width-animation exception.
5. **API cleanup (P2/P3):** collapse `label`/`title` to one canonical prop (`@deprecate` `title`); add `aria-busy` to the loading card and consider `aria-live` on the value.
6. **(Optional) slot escape hatch (P3):** accept `children`/a footer slot for consumers who outgrow the flat-prop API, keeping props as the default ergonomics.

## Clean (rubric dims that pass)
- **V1 accent rail — killed.** v0.43 removed the `accent` left-rail (doc:78); no `border-l-*`+color anywhere. This is the headline win.
- **V2 double edge — clean.** Surface comes from Card's elevation-led variants (border-transparent + shadow); no border+shadow stacking.
- **V3 gradient text / metric — clean.** Value is solid `text-surface-fg`/`text-accent-11` + `tabular-nums` (:351-362). No `bg-clip-text`.
- **V4 framework palette — clean.** All colors are semantic tokens (`accent-*`, `success-11`, `error-11`, `surface-*`). No indigo/violet/slate.
- **V5 emoji — clean.** Icons are tabler/lucide via the Icon API; no emoji in source/story/doc. (Stories use literal `$`/`P` glyphs as demo icons — legitimate.)
- **V6 blob/glass/glow — clean.** No backdrop-blur, no glow shadows. `accentStyle="tint"` is a subtle `from-accent-2 to-surface-raised` wash, explicit + token-bound + documented (:403-405, doc:60) — a choice, not a tell.
- **V7 rounded-everything — clean.** Uses `rounded-surface`/`rounded-control`/`rounded-pill` tokens, no `rounded-2xl/3xl`.
- **F5 not re-rolling base — clean (exemplar).** Composes `<Card>`+`<CardContent>`; surface/padding/elevation live in Card (:243,:406,:419,:429,:452).
- **G1 surface — clean.** Surface delegated to Card; no `bg-surface-1` on a card.
- **G3/G4 variant vocabulary — clean.** `variant: default|elevated|outline|flat` matches Card; no `primary`/`small`/`filled`.
- **E1–E8 verbal — clean.** Doc/JSDoc/stories prose is direct; no em-dash tic abuse (en-dashes used for ranges), no AI vocabulary, no hedging. (Minor: the JSDoc closer "feel free to combine props creatively!" at :63 is mild filler but not a flagged E-tell.)
- **Tests + stories + docs — present and accurate.** `describeConformance` + 20 behavior tests; ~25 stories incl. edge cases (flat/single-point/overflow/loading); doc prop table matches CVA/source; CHANGELOG migration documented. J docs-parity clean.
- **H state coverage — mostly clean.** default/hover (Card interactive)/focus/pressed/keyboard/loading/clickable/link all handled + tested; only `aria-busy`/`aria-live` on loading missing (flagged P3).
- **I types — clean.** Proper `forwardRef`+`displayName`, exported `StatCardProps`, no `any`, stringly-typed via literal unions, `icon: IconInput` (the unified narrowed type), `Omit<…,'color'>` to avoid collision.
