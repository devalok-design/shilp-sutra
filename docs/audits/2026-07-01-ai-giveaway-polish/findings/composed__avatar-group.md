# composed/avatar-group — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:6 P2:5 P3:2

## Findings

### [P0][H] Hover-expand transform bypasses reduced-motion entirely
- **Category:** motion / a11y
- **Evidence:** avatar-group.tsx:146-147 — `const spotlightClasses = 'transition-[transform,opacity] duration-300 ease-out hover:z-50 hover:scale-105 group-hover:[&:not(:hover)]:opacity-85'` and avatar-group.tsx:137-144 `getExpandTransform` returns raw inline `transform: translateX(..)` applied at avatar-group.tsx:181/197/263/278.
- **Why:** The signature motion (whole-group spread on hover/focus) is driven by hardcoded CSS `transition` + inline `style.transform`, NOT framer-motion, so the repo's MotionConfig/`useReducedMotion` cannot disable it and there is no `motion-reduce:` guard. Vestibular-disorder users get unblockable movement on every focus/hover. Sibling components (skeleton, stat-flash, spinner, charts) all carry reduced-motion handling — this one is the outlier.
- **Fix:** Drive the spread via framer `motion` (animate `x`) so MotionConfig governs it, or gate the transition/transform behind `motion-reduce:transition-none` and skip the translate when `useReducedMotion()` is true.

### [P1][M2] Off-system 300ms timing + `ease-out` instead of motion tokens
- **Category:** motion
- **Evidence:** avatar-group.tsx:147 `duration-300 ease-out`; also :261 `duration-300 ease-out` and :276 `duration-300 ease-out`.
- **Why:** The motion system defines `durations` (fast01…slow02) and named easings (`ease-productive-standard`); 300ms is not a token value and `ease-out` is the framework default, not a DS easing. Card uses `duration-fast-02 ease-productive-standard`. This is uniform/robotic timing detached from the scale.
- **Fix:** Replace with token-bound classes (e.g. `duration-moderate-02 ease-productive-standard`) or framer `tweens.layout`.

### [P1][F5] Re-rolls the overflow "+N" avatar surface instead of composing Avatar
- **Category:** composability / drift
- **Evidence:** avatar-group.tsx:255-281 — the `+N` chip is a hand-built `button`/`div` with `avatarSizeVariants({ size })`, `bg-accent-2`, `text-accent-11`, `font-semibold`, manual `textSizeClass`, `rounded-pill border-2` from a local CVA (avatar-group.tsx:30-46) that duplicates `avatarVariants` from `../ui/avatar`.
- **Why:** A second size/shape CVA (`avatarSizeVariants`) shadows the canonical `avatarVariants`. If avatar sizing changes, the `+N` chip drifts. StatCard's lesson was: compose the base, don't re-roll its surface.
- **Fix:** Render the overflow chip as `<Avatar size={size}>` with an `<AvatarFallback>`-style child, or at minimum import and reuse `avatarVariants` instead of the local clone.

### [P1][F1] `renderAvatar` callback prop where a slot/compound belongs
- **Category:** composability
- **Evidence:** avatar-group.tsx:66 `renderAvatar?: (user, index) => React.ReactNode`; consumed at :168-186.
- **Why:** Full custom rendering goes through a render-prop callback rather than a composable child (e.g. `<AvatarGroup.Item>` slot or `children`). The Card bar favors slots over bespoke injection props. The callback also re-implements the positioning wrapper, duplicating the non-callback branch.
- **Fix:** Expose a compound `AvatarGroup.Item` (or accept `children`) and let the wrapper positioning be a shared internal, so consumers compose rather than supply a renderer.

### [P1][F6] `onOverflowClick` is a one-off callback; no controlled/expanded model
- **Category:** composability / types
- **Evidence:** avatar-group.tsx:64 `onOverflowClick?: () => void`; the overflow toggles between `button` and `div` purely on its presence (:251).
- **Why:** Naming is `on*Click` (DOM-ish) for what is really "reveal remaining members"; there's no `defaultExpanded`/`expanded`/`onExpandedChange` and the hover-spread state (`isHovered`, :127) is fully internal with no controlled escape hatch. Consumers can't drive expansion programmatically.
- **Fix:** Keep `onOverflowClick` but consider an `expanded`/`onExpandedChange` controlled pair for the spread, or document the spread as purely presentational.

### [P1][G3] Domain-coded `indicator`/`ring` values are off the canonical color axis
- **Category:** vocabulary / drift
- **Evidence:** avatar-group.tsx:52 `indicator?: 'lead' | 'admin' | React.ReactNode`; :24-28 `groupRingMap` keys `lead | admin | client`; ring type imported as `AvatarRing` (avatar.tsx:40 `'none' | 'lead' | 'admin' | 'client'`).
- **Why:** `lead`/`admin`/`client` are app-domain (Karm) role names baked into a design-system primitive's API, not the canonical `color` taxonomy (accent/neutral/success/warning/error/info). A DS component shouldn't encode a consumer's org roles. (This is inherited from Avatar, but AvatarGroup re-declares its own `indicator` union and `groupRingMap`.)
- **Fix:** Re-express as semantic `color`/`tone` values and let the consumer map roles to them; or accept arbitrary ring color via token.

### [P1][I] `groupRingMap` typed `Record<string, string>` defeats the union
- **Category:** types
- **Evidence:** avatar-group.tsx:24 `const groupRingMap: Record<string, string> = {`; lookups at :179/:195 `groupRingMap[user.ring]`.
- **Why:** `ring` is the typed union `AvatarRing`, but the map is `Record<string,string>`, so a typo or unmapped value silently yields `undefined` with no compile error. Same loose `Record<string,string>` pattern at :103 `textSizeMap` and :113 `indicatorDotSizeMap`.
- **Fix:** Type as `Record<Exclude<AvatarRing,'none'>, string>` / `Record<AvatarSize, string>` so the maps are exhaustive and checked.

### [P2][J] No per-component doc; doc/source contradiction on indicator color
- **Category:** docs
- **Evidence:** No `packages/core/docs/components/**/avatar-group.md` exists (Glob empty). Story `WithLeadIndicator` (avatar-group.stories.tsx:415) says "small **yellow** dot"; `WithRings` (:247) says "admin (warning)" — but source paints both `lead` and `admin` indicators `bg-accent-9` (avatar-group.tsx:222-223), i.e. neither is yellow/warning.
- **Why:** Docs parity gate: the prose describes a warning/yellow dot the code never renders; the `'admin'` branch is dead (both ternary arms produce `bg-accent-9`).
- **Fix:** Either give `admin` its own `bg-warning-9` (matching the story + ring semantics) or fix the story copy; add the missing component doc with an accurate prop table.

### [P2][H] Spread/scale/opacity hover has no entrance or focus-visible treatment
- **Category:** state-coverage / a11y
- **Evidence:** group container avatar-group.tsx:151-161 has `tabIndex={0}` and `role="group"` but no `focus-visible` ring; focus triggers `setIsHovered(true)` (:159) which moves avatars but provides no visible focus indicator on the group itself.
- **Why:** Keyboard users land on the group (it's focusable) with no visible focus ring — only the layout shifts. Focus indication is a baseline a11y state from the matrix (focus-visible).
- **Fix:** Add `focus-visible:ring-2 focus-visible:ring-accent-7 ...` (or `focus-ring` utility) to the container, and ensure forced-colors fallback.

### [P2][M5] Hover spread animates `transform` via CSS but the spotlight scales every sibling layout
- **Category:** motion
- **Evidence:** avatar-group.tsx:147 `hover:scale-105` + per-item inline `transform: translateX(px)`; the px shift is computed from `overlapPxMap` (:129-130) in raw pixels.
- **Why:** Transform/opacity is the right target (good), but the shift is hardcoded px not token-derived, and combined with `-ml-ds-0x` negative margins the layout math is split between margin (overlap) and transform (spread) — fragile and not motion-system governed. Borderline; the bigger issue is the reduced-motion P0 above.
- **Fix:** Centralize spread distances as motion/spacing tokens; prefer framer `x` so it shares the system's reduced-motion + easing.

### [P2][H] Tooltip-on-every-avatar has no overflow/empty guard
- **Category:** state-coverage
- **Evidence:** avatar-group.tsx:90 `const displayed = users.slice(0, max)`; no guard for `users.length === 0` or `max <= 0`.
- **Why:** Empty `users` renders an empty focusable group labeled "0 team members" (:154) with nothing inside; `max={0}` makes every user overflow into `+N` with no visible avatar. No empty-state handling.
- **Fix:** Short-circuit on empty `users` (render nothing or a placeholder); clamp `max` to `>= 1`.

### [P3][G2] Magic `text-[9px]` and raw px overlap escape the token scale
- **Category:** drift
- **Evidence:** avatar-group.tsx:105 `xs: 'text-[9px]'` (other sizes use `text-ds-*`); :129-130 `overlapPxMap` raw numbers `8,10,12,16,20`.
- **Why:** `text-[9px]` is an arbitrary value where every sibling size uses a `--text-ds-*` token; the px overlap map duplicates the `-ml-ds-0x` overlap classes in a second unit system.
- **Fix:** Add/use a `text-ds-2xs` token for xs (Avatar's fallback uses `text-ds-2xs` at avatar.tsx:84); derive overlap px from the spacing token used for the negative margin.

### [P3][V] Indicator stacked on top of Avatar's own status/badge could double-decorate
- **Category:** visual-tell (minor)
- **Evidence:** avatar-group.tsx:212-228 renders its own top-right indicator dot; Avatar already supports `status` (bottom-right) and `badge` (top-right, avatar.tsx:222-246).
- **Why:** Two overlapping top-right decoration systems (AvatarGroup `indicator` vs Avatar `badge`) can collide visually in `renderAvatar` usage. Not a hard tell, but a vocabulary overlap.
- **Fix:** Document that `indicator` is group-level and shouldn't combine with per-Avatar `badge`, or fold into one.

## Composability gaps
- `renderAvatar` render-prop instead of a `AvatarGroup.Item` slot / `children` (F1).
- Overflow `+N` chip re-rolls avatar surface via a duplicate `avatarSizeVariants` CVA instead of composing `<Avatar>` / reusing `avatarVariants` (F5).
- No `asChild` on the overflow button (consumers may want it to be a Link/DialogTrigger); it's hardcoded `<button>`/`<div>` (F2).
- Hover-spread state is internal-only; no controlled `expanded`/`onExpandedChange` (F6).
- Domain role values (`lead`/`admin`/`client`) baked into a DS primitive's API rather than semantic color/tone (G3).

## Motion gaps
- **P0:** Signature hover/focus spread uses raw CSS `transition`+inline `transform`, invisible to MotionConfig/reduced-motion; no `motion-reduce:` guard (M3).
- Off-token `duration-300 ease-out` in three places instead of `--duration-*` + DS easing (M2).
- Spread distances in raw px (`overlapPxMap`) not tokens; split between margin and transform (M5).
- Focus on the group moves avatars but shows no focus-visible ring (M4/a11y).

## Polish plan (ordered steps to reach the finish bar)
1. **P0 reduced-motion:** convert the hover/focus spread + spotlight scale to framer `motion` (`animate={{ x }}`) so MotionConfig governs it, or gate behind `useReducedMotion()` + `motion-reduce:` classes. No unblockable movement.
2. Replace `duration-300 ease-out` (×3) with token classes (`duration-moderate-02 ease-productive-standard`) or `tweens.layout`.
3. Compose the `+N` chip as `<Avatar>`/reuse `avatarVariants`; delete the duplicate `avatarSizeVariants` CVA.
4. Tighten map types: `Record<Exclude<AvatarRing,'none'>,string>` and `Record<AvatarSize,string>` for `groupRingMap`/`textSizeMap`/`indicatorDotSizeMap`.
5. Add `focus-visible` ring to the group container; add empty-`users` / `max<=0` guards.
6. Reconcile indicator color: give `admin` `bg-warning-9` (or fix the story copy); kill the dead ternary arm.
7. Add the missing `docs/components/**/avatar-group.md` with an accurate prop table; consider migrating role-coded values to semantic color and a slot-based API.

## Clean (rubric dims that pass)
- **V1 accent rail:** none — no left/top colored stripe on a card surface.
- **V3 gradient text / V6 blob-glass-glow:** none.
- **V4 framework palette:** colors are semantic tokens (`accent-*`, `warning-7`, `info-7`, `success-3`), no raw indigo/violet/slate as brand.
- **V5 emoji icons:** none (the `★` is a consumer-supplied test fixture, not a default).
- **V7 rounded-everything:** uses `rounded-pill` appropriately for avatars (circles), no `rounded-3xl` spam.
- **V9 fonts:** uses `font-semibold` + `text-ds-*` tokens, no hardcoded Inter/Geist.
- **G1 surface:** no surface-layer violation; `borderColor` is an explicit, documented opt-in for blending onto raised surfaces.
- **a11y basics:** `role="group"` + `aria-label`, overflow chip is a real `<button>` with `aria-label` when clickable and `role="img"` otherwise; tooltips name each user; `colorSeed` deterministic fallback.
- **Tests:** present and reasonable (`describeConformance` + indicator/border/ring/overflow coverage). Stories: present and extensive.
- **E* verbal tells:** story/JSDoc copy is clean — no em-dash tic abuse beyond DS house style, no AI-vocabulary, no hedging.
