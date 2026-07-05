# ui/avatar — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:4 P3:2

## Findings

### [P1][M3] Online status dot pulses forever with no reduced-motion guard
- **Category:** motion
- **Evidence:** avatar.tsx:211-217 — `<motion.span … animate={{ opacity: [1, 0.75, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} … />`
- **Why:** An infinite looping opacity animation shipped as a default with zero `prefers-reduced-motion` handling — vestibular-accessibility violation and a constant-motion AI tell. The repo ships a `withReducedMotion` helper (`lib/motion.ts:58`) and a MotionConfig system; neither is used here.
- **Fix:** Gate the pulse behind `useReducedMotion()` (framer) — render the static dot when reduced motion is preferred, or drop the repeat entirely. The doc even advertises "Online status dot pulses with a CSS animation" (avatar.md:50) as a feature, so make it reduced-motion-aware rather than removing.

### [P1][M1] Badge entrance uses overshoot spring (`bouncy`) by default
- **Category:** motion
- **Evidence:** avatar.tsx:230-234 — numeric badge `initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springs.bouncy}` (bouncy = `stiffness:400, damping:15` → visible overshoot)
- **Why:** Bounce-by-default on a mundane notification count is exactly the M1 reflex. `springs.bouncy` is documented for "celebration feedback"; a count badge is not a celebration. Also no reduced-motion guard.
- **Fix:** Use `springs.snappy` (the micro-interaction preset) and respect reduced motion. Reserve `bouncy` for genuine celebration (e.g. an explicit `flash`-style opt-in).

### [P1][M3] AvatarImage scale-in entrance on every mount, no reduced-motion
- **Category:** motion
- **Evidence:** avatar.tsx:258-262 — `<motion.span initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={springs.smooth}>` wrapping every image
- **Why:** Every avatar image zooms in on mount unconditionally — in a roster/list of 30 avatars this is a wall of simultaneous scale animations, and there is no reduced-motion path. A fade is defensible; the scale is decorative motion by reflex.
- **Fix:** Drop the `scale` (keep opacity fade), or gate behind reduced-motion. Consider only animating on actual image *load* rather than mount.

### [P1][G3] `ring` axis carries domain role names (`lead`/`admin`/`client`) inside a core UI primitive
- **Category:** vocabulary
- **Evidence:** avatar.tsx:40 `export type AvatarRing = 'none' | 'lead' | 'admin' | 'client'`; :70-74 `ringColorMap = { lead: 'ring-accent-7', admin: 'ring-warning-7', client: 'ring-info-7' }`
- **Why:** A `ui/` primitive should not encode app-domain semantics (lead/admin/client are Karm/CRM roles). This is vocabulary drift — the canonical color axis is `accent/neutral/success/warning/error/info`. The role→color mapping is an opinion that belongs in the consumer or a `composed/` wrapper. It also forces every consumer with different roles to fight the names.
- **Fix:** Rename the axis to the semantic color taxonomy (`ring?: 'accent' | 'warning' | 'info' | ...`) or generalize to `ringColor`. If role semantics are wanted, expose them in a `composed/` component that maps role→color, leaving the primitive generic.

### [P1][G2] Re-rolled raw px / hex-free arbitrary values instead of DS tokens
- **Category:** drift
- **Evidence:** avatar.tsx:62 `sm: 'h-[8px] w-[8px]'`, :64 `lg: 'h-[12px] w-[12px]'` (dot sizes); :225 dot badge `h-[8px] w-[8px] … -right-0.5 -top-0.5`; :234 number badge `min-w-[16px] … px-1 text-[10px] … leading-[16px] … -right-1 -top-1`
- **Why:** The dot-size map is half on tokens (`h-ds-02b`, `h-ds-03`, `h-ds-04`) and half on arbitrary px (`h-[8px]`, `h-[12px]`) — inconsistent cadence, and the badge offsets/typography (`text-[10px]`, `leading-[16px]`, `min-w-[16px]`, `-right-0.5`) are all raw. G2 flags re-rolled tokens; this is the largest concentration in the file.
- **Fix:** Map every dot size to a `--spacing-ds-*` step (define `ds-02c` etc. if a gap exists rather than reaching for `[8px]`). Use `text-ds-2xs`/a token for the badge label, and a token-based inset for the offsets.

### [P2][F1] `badge` is a bespoke overload prop where a slot belongs
- **Category:** composability
- **Evidence:** avatar.tsx:166 `badge?: number | 'dot' | React.ReactNode`; :222-246 the three-way branch rendering number / dot / custom node into a fixed top-right corner
- **Why:** This is the Card accent-badge pattern the rubric calls out (F1): a union-typed prop injecting content into a fixed corner with branching render logic, instead of a composable `<AvatarBadge>` slot. `status` (bottom-right dot) is the same shape. The `number | 'dot' | ReactNode` union is also a stringly-typed overload — `'dot'` is a magic string sentinel mixed with data.
- **Fix:** Expose an `<AvatarBadge placement>` slot (mirror Card's `<CardAction>`); keep the `badge` prop as a thin convenience that renders the slot, or deprecate it. At minimum split the count-vs-dot semantics rather than overloading one prop with a sentinel string.

### [P2][H] No focus-visible / interactive state coverage; Avatar can't be made interactive
- **Category:** state-coverage
- **Evidence:** avatar.tsx whole file — no `interactive`, no `onClick`/`asChild`, no `:focus-visible` ring; stories (`avatar.stories.tsx`) have no hover/focus/clickable story; the "Group" use case implies clickable avatars but none are.
- **Why:** Avatars are very commonly clickable (open profile). Unlike StatCard (which got `onClick`/`href`/keyboard) and Card (`interactive`), Avatar offers no path to interactivity, so consumers hand-roll a wrapping button and lose the shape/ring/focus coordination. State matrix (H) interactive states are entirely absent.
- **Fix:** Either add `asChild` (F2) so the Avatar can become a button/link with a coordinated focus-visible ring on the shape, or document that wrapping is intended. At minimum a focus-visible story.

### [P2][F2] No `asChild` / polymorphism on a frequently-wrapped element
- **Category:** composability
- **Evidence:** avatar.tsx:172-208 — `Avatar` renders a fixed `<span>` outer wrapper + `AvatarPrimitive.Root`; no Slot/`asChild`.
- **Why:** Consumers routinely need the avatar to *be* a link/button (clickable profile chip). Without `asChild` they must wrap, which double-nests interactive elements and breaks the ring-offset assumption. F2 dimension.
- **Fix:** Thread `asChild` through to the outer wrapper via the vendored Slot primitive.

### [P2][H] Forced-colors / RTL / reduced-motion not demonstrated in stories or tests
- **Category:** state-coverage
- **Evidence:** avatar.test.tsx + avatar-improvements.test.tsx — axe checks present, but no forced-colors, no reduced-motion assertion (despite three default animations), no RTL (badge/status are hard-pinned `right-0`/`-right-1`, never mirrored)
- **Why:** Rubric H requires forced-colors + reduced-motion + RTL coverage. Status dot and badge are absolutely positioned to the right edge with no logical-property/RTL mirroring, so in RTL they overlap the wrong corner.
- **Fix:** Add reduced-motion test (assert no infinite pulse when `prefers-reduced-motion`), a forced-colors story, and use logical insets (`end-0` / `-inset-inline-end`) so badge/status mirror in RTL.

### [P3][G2] Badge label uses `font-bold` + `text-[10px]` rather than a type token
- **Category:** drift
- **Evidence:** avatar.tsx:234 `… text-[10px] font-bold leading-[16px] text-error-fg …`
- **Why:** `font-bold` (vs the file's own `font-semibold` elsewhere) and raw `text-[10px]/leading-[16px]` are off the type scale — minor cadence drift.
- **Fix:** Use `text-ds-2xs` (or the smallest defined token) and `font-semibold` for consistency with `AvatarFallback`.

### [P3][docs/J] Doc prop table lists `text-[9px]` for xs but source ships `text-ds-2xs`
- **Category:** docs
- **Evidence:** avatar.md:36 says xs → `text-[9px]`; avatar.tsx:84 `xs: 'text-ds-2xs'`. Source wins.
- **Why:** Stale doc — the J dimension (docs parity) requires the doc to match CVA/source. The whole `text-[9px]` cadence was apparently replaced by `text-ds-2xs` but the doc + changelog (avatar.md:54) still cite the old arbitrary value.
- **Fix:** Update avatar.md prop notes and the v0.22.3 changelog line to the current `text-ds-*` tokens.

## Composability gaps
- `badge` (number | 'dot' | ReactNode) is a bespoke corner-injection prop with a sentinel string, not a composable `<AvatarBadge>` slot (F1). `status` is the same shape on the opposite corner.
- No `asChild` / Slot — Avatar can't polymorph into the link/button it's so often wrapped in (F2). StatCard/Card both solved their interactive story; Avatar didn't.
- No interactive/clickable affordance at all (no `interactive`, `onClick`, focus-visible ring) despite being a canonically clickable element.
- `ring` axis encodes domain role names instead of the semantic color taxonomy — a vocabulary/composability leak; role→color belongs in a `composed/` wrapper, not the primitive.

## Motion gaps
- Infinite pulse on online status with no reduced-motion guard (M3) — the single biggest motion liability; ships on by default.
- Badge mount uses `springs.bouncy` overshoot for a plain count (M1) — bounce-by-default reflex.
- AvatarImage scale-in on every mount, no reduced-motion path (M3) — decorative scale; a fade alone would be enough.
- None of the three animations respect `prefers-reduced-motion`, even though `withReducedMotion`/`useReducedMotion` is available in-repo.
- Status pulse and image entrance use the same untiered hand-written transitions rather than going through the motion presets consistently (the pulse is a raw inline `{ duration: 2.5, repeat: Infinity }`, off the duration scale — M2 adjacency).

## Polish plan (ordered steps to reach the finish bar)
1. **Reduced-motion sweep (P1):** wrap all three animations (status pulse, badge pop, image entrance) with `useReducedMotion()`; render static when preferred. Move the pulse off the raw inline transition onto a tokened duration.
2. **Tame default motion (P1):** swap badge `springs.bouncy` → `springs.snappy`; drop the image `scale` keeping the opacity fade.
3. **Tokenize raw values (P1/G2):** replace `h-[8px]`/`h-[12px]` dot sizes, `min-w-[16px]`, `text-[10px]`, `leading-[16px]`, and `-right-0.5/-top-0.5/-right-1/-top-1` offsets with `--spacing-ds-*` / type tokens; make the dot-size map fully tokened.
4. **Fix the `ring` vocabulary (P1/G3):** rename the axis to the semantic color taxonomy (or `ringColor`); relocate the lead/admin/client role mapping to a `composed/` wrapper.
5. **Add a `<AvatarBadge>` slot (P2/F1):** mirror `<CardAction>`; keep `badge` as a thin convenience or deprecate the sentinel-string union.
6. **Add `asChild` + interactive/focus-visible coverage (P2/F2/H):** thread Slot; add a clickable story with a focus ring coordinated to the avatar shape.
7. **RTL + forced-colors (P2/H):** switch badge/status insets to logical properties so they mirror; add forced-colors + reduced-motion stories and a reduced-motion test.
8. **Docs parity (P3/J):** update avatar.md to the current `text-ds-*` tokens; correct the v0.22.3 changelog line.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. The `ring` is a full ring around the avatar (legitimate), not a left/top stripe on a card.
- **V2 double edge:** clean — no border+shadow combo.
- **V3 gradient text:** none.
- **V4 default framework palette:** clean — all colors are semantic tokens (`accent-7`, `success-9`, `category-teal-3`, etc.), no raw `indigo`/`violet`/`slate`.
- **V5 emoji-as-icon:** none in source/story/test.
- **V6 blob/glass/glow:** none.
- **V7 rounded-everything:** clean — uses the radius vocabulary (`rounded-pill` for circle, `rounded-control` for rounded, `rounded-none` for square), no `rounded-2xl`/`3xl`.
- **V8 pill-badge spam / V10-V15:** none.
- **Fallback gradient:** the deterministic fallback color map (`FALLBACK_COLORS`, avatar.tsx:93) is an explicitly legitimate avatar-fallback pattern per the rubric — not a tell. Solid `bg-*-3`/`text-*-11` pairs, deterministic via djb2 hash, well-tested.
- **E1–E8 verbal tells:** JSDoc/doc copy is direct and free of AI vocabulary, em-dash tic, contrastive negation, or hedging. (The "feel free to combine props creatively!" closers in the JSDoc are a mild house-style flourish, not a flagged tell.)
- **F5 base primitive:** correctly composes `@primitives/react-avatar` (vendored Radix) rather than re-rolling image/fallback logic.
- **A11y baseline:** status dot has `role="img"` + `aria-label`; badge has `role="status"` + label; axe-clean across status/ring/badge/loading. Good coverage for the non-interactive states it supports.
- **Types:** no `any`, proper `forwardRef` + `displayName` on all four parts, exported prop interfaces, `VariantProps`-derived axes. (Only the `badge` union is a soft type smell, flagged under F1 not types.)
- **I forwardRef/displayName:** clean.
