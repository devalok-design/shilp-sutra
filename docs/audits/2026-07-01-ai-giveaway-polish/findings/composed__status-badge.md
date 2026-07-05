# composed/status-badge — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:6 P2:4 P3:2

StatusBadge is functionally correct and visually free of the loud AI tells (no accent rail, no gradient text, no framework palette, no emoji). But it badly misses the Card bar on **composition**: a fully-finished `ui/Badge` primitive exists — with `useReducedMotion`, a focus-visible ring, `asChild`, a single-source-of-truth `colorMap`, and dot-pulse motion — and StatusBadge re-rolls all of it (pill shell, color map, dot map, size padding) instead of composing it. The doc even *claims* it's "Built on ui/Badge," which is false. It also ships an interactive control with **no focus-visible ring** and **no reduced-motion guard**, both of which its own base primitive already solved.

## Findings

### [P1][F5] Re-rolls ui/Badge instead of composing it
- **Category:** composability
- **Evidence:** status-badge.tsx:15-47 — `const statusBadgeVariants = cva('inline-flex items-center gap-ds-02b rounded-pill …', { variants: { color: { success: 'bg-success-3 text-success-11', … } } })`; compare badge.tsx:16-45 `colorMap` + `getColorClasses` (identical `bg-*-3 / text-*-11` semantics).
- **Why:** This is the exact drift StatCard fixed by composing `<Card>`. StatusBadge duplicates the pill shell, the semantic color→class map, the dot color map, and the size/padding table — four sources of truth that will drift from Badge (Badge already moved neutral to `bg-surface-raised-hover`; StatusBadge still uses `bg-surface-raised`).
- **Fix:** Render `<Badge variant="soft" color={mappedColor} startIcon={dot? …} onClick={onClick} …>`. Keep StatusBadge as the thin domain layer that owns only the `status → color` mapping table; delegate shell, dot, icon, focus, motion, and `asChild` to Badge.

### [P1][docs] Doc claims "Built on ui/Badge" — it is not
- **Category:** docs
- **Evidence:** docs/components/composed/status-badge.md:32 — "Built on ui/Badge but with opinionated status → color mapping". Source imports no Badge (status-badge.tsx:1-13 imports only Icon/IconProvider/normalizeIcon/motion).
- **Why:** Docs parity violation — source is authoritative and does not compose Badge. Misleads consumers and hides the F5 drift.
- **Fix:** Either make the claim true (F5 fix) or correct the doc to "standalone pill" until it does.

### [P1][M3] No reduced-motion guard on the morph animation
- **Category:** motion
- **Evidence:** status-badge.tsx:116-119 & 155-158 — `initial={{ opacity: 0.6, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={…} transition={statusMorphTransition}` with no `useReducedMotion`. Base Badge does guard: badge.tsx:164 `const prefersReducedMotion = useReducedMotion()` and badge.tsx:257-258 gates the pulse on it.
- **Why:** Rubric H/M3 — every animation must respect `prefers-reduced-motion`. A status pill that scale-pops on every mount/change ignores the user's OS setting.
- **Fix:** `const prefersReducedMotion = useReducedMotion()`; when true, drop scale and set `transition={{ duration: 0 }}` (or use `withReducedMotion` from lib/motion).

### [P1][a11y/H] Interactive badge has no focus-visible ring
- **Category:** a11y
- **Evidence:** status-badge.tsx:97 — `const clickableClasses = isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : undefined`. No `focus-visible:*`. Base Badge supplies one: badge.tsx:229 `focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-1`.
- **Why:** A `<button>` with only hover feedback and no visible focus state fails keyboard-a11y baseline and disappears in forced-colors. This is a broken guarantee for an interactive control.
- **Fix:** Add the same focus-visible ring vocabulary as Badge (composing Badge would inherit it for free).

### [P1][M4] Feedback motion is opacity-only; no press feedback
- **Category:** motion
- **Evidence:** status-badge.tsx:97 — interactive state is `hover:opacity-80` only. Badge gives press feedback: badge.tsx:229 `active:scale-[0.95] active:brightness-[0.92]`.
- **Why:** Card bar wants intentional hover + press micro-feedback. `hover:opacity-80` is the generic "make it look interactive" reflex, not the motion system.
- **Fix:** Adopt Badge's hover/active brightness+scale feedback (again, free via composition).

### [P1][types] `ref as any` twice; stringly-typed color maps
- **Category:** types
- **Evidence:** status-badge.tsx:112 `ref={ref as any}` and :152 `ref={ref as any}`; status-badge.tsx:49 `const dotColorMap: Record<string, string>` and :62 `colorDotMap: Record<string, string>`.
- **Why:** `any` in ref forwarding erases the polymorphic span/button ref type; `Record<string, string>` keys aren't constrained to the actual status/color unions, so a typo compiles.
- **Fix:** Type the ref union as `React.Ref<HTMLSpanElement | HTMLButtonElement>` (or `Ref<HTMLElement>`) and key the maps as `Record<StatusKey, string>` / `Record<ColorKey, string>`.

### [P2][motion/structural] AnimatePresence wraps a single always-mounted child
- **Category:** motion
- **Evidence:** status-badge.tsx:111-140 & 150-179 — `<AnimatePresence mode="wait"><Tag key={statusKey} … exit={…}>`. The `<AnimatePresence>` boundary is re-created on every render and always contains exactly one child, so the `exit` transition never plays on a status change (the old tree isn't retained across the remount).
- **Why:** Dead exit animation — the "smooth morph" comment (line 90) describes behavior that doesn't happen. It's motion machinery that adds a wrapper and complexity for no visible effect.
- **Fix:** Either hoist AnimatePresence to the consumer / drop it and use a keyed `motion.span` with `layout`+`initial/animate` for the color morph, or remove it and keep a plain enter transition.

### [P2][G4] Neutral/draft/cancelled fill drifts from Badge's neutral surface
- **Category:** drift
- **Evidence:** status-badge.tsx:28-29,36 — `cancelled`/`draft`/`neutral` use `bg-surface-raised`. Badge's neutral uses `bg-surface-raised-hover` (badge.tsx:17,23).
- **Why:** `bg-surface-raised` is the Card fill color (surface-2). A neutral StatusBadge placed on a Card is near-invisible (pill fill == card fill). The family's neutral vocabulary already moved to `surface-raised-hover` in Badge.
- **Fix:** Use `bg-surface-raised-hover` for neutral/draft/cancelled (or inherit via Badge composition).

### [P2][G2] Hardcoded arbitrary px for the md dot
- **Category:** drift
- **Evidence:** status-badge.tsx:131 & 170 — `size === 'sm' ? 'h-ds-02b w-ds-02b' : 'h-[8px] w-[8px]'`. The sm branch uses a token; the md branch uses raw `[8px]`.
- **Why:** G2 re-rolled token — inconsistent within the same ternary (one side token, one side arbitrary value).
- **Fix:** Use a DS spacing token for the 8px dot (e.g. `h-ds-03 w-ds-03` or the nearest cadence token) to match the sm branch.

### [P2][state-coverage] No focus / disabled / dark / RTL / forced-colors coverage in stories or tests
- **Category:** state-coverage
- **Evidence:** status-badge.stories.tsx (270 lines) — covers status/color/size/hideDot/clickable/icon, but no focus-visible, disabled, dark-mode, RTL, or forced-colors story. status-badge.test.tsx has no focus-ring or reduced-motion assertion.
- **Why:** Card bar requires the applicable state matrix demonstrated. The interactive (button) branch ships without any focus/disabled state (there is no `disabled` prop at all).
- **Fix:** Add a `disabled` prop (Badge has one), a focus story, and an interaction-test asserting the focus ring; add dark + forced-colors Chromatic stories.

### [P3][F2] No `asChild` / polymorphism
- **Category:** composability
- **Evidence:** status-badge.tsx:70-88 — props are `status|color|size|label|hideDot|onClick|icon`; no `asChild`. Badge exposes `asChild` (badge.tsx:123).
- **Why:** Consumers wanting the badge to *be* a link (status pill linking to a filter) can't polymorph it. Minor, but Badge already solves it.
- **Fix:** Inherit via composition, or add `asChild` + Slot.

### [P3][G3] `status` axis bakes semantic values into a non-canonical variant name
- **Category:** vocabulary
- **Evidence:** status-badge.tsx:19-30 — `status: { active, pending, approved, rejected, completed, blocked, 'in-progress', review, cancelled, draft }`, defaulting via `status ?? 'pending'` with `color` silently overriding.
- **Why:** Canonical axes are `variant`/`size`/`color`/`shape`. A domain "status" axis is defensible for this component's purpose, but the dual `status`+`color` where `color` silently wins (status-badge.md:33 "color wins") is a subtle vocabulary trap. Kept P3 because the discriminated union at the type level (`color?: never`) mostly prevents passing both.
- **Why-keep:** This is a domain component; the status taxonomy is the whole point. Flagging only the silent-override ergonomics, not the axis existence.
- **Fix:** Consider dropping the `color` escape hatch entirely (consumers wanting arbitrary color should use `ui/Badge`), so StatusBadge has exactly one axis (`status`). Documented as intentional either way.

## Composability gaps
- **Does not compose `ui/Badge`** — re-rolls the pill shell, semantic color map, dot color map, and size/padding table (4 duplicate sources of truth). This is the headline gap; StatCard→Card is the model to follow.
- **No `asChild`** — can't polymorph into a link/other element (Badge supports it).
- **No `disabled` prop** — the interactive branch can't express a disabled status pill; Badge has `disabled` + `opacity-action-disabled`.
- **`color` as a silent override of `status`** — two overlapping styling axes on one component; the base `ui/Badge` already owns free-form color.

## Motion gaps
- **No `useReducedMotion`** — scale/opacity pop runs unconditionally (Badge guards its pulse).
- **No press feedback** — only `hover:opacity-80`; no `active:` micro-feedback (Badge has scale+brightness).
- **AnimatePresence is inert** — wraps a single always-mounted, per-render-recreated child, so `exit` never plays; the "smooth morph" comment is aspirational.
- **Opacity-only hover** is the generic reflex rather than the motion-system tween (`tweens.colorShift` / `duration-fast-*`).

## Polish plan (ordered steps to reach the finish bar)
1. **Rebuild StatusBadge on top of `ui/Badge`** (F5). Keep only the `status → { color, dotColor, label }` mapping; pass `variant="soft"`, `color`, `size`, `onClick`, `startIcon` (dot), `endIcon` (chevron/icon), `asChild`, `disabled` through to Badge. This deletes `statusBadgeVariants`, `dotColorMap`, `colorDotMap`, the size/padding ternaries, both `ref as any`, the manual focus/hover, and the AnimatePresence — all inherited from Badge.
2. If not composing, at minimum: add `useReducedMotion` guard (M3), add Badge's focus-visible ring (a11y), add `active:` press feedback (M4), fix neutral fill to `bg-surface-raised-hover` (G4), tokenize the md dot (G2), and type the refs + maps (types).
3. Fix the doc's false "Built on ui/Badge" claim (docs) — make it true via step 1 or correct the text.
4. Add state-coverage stories/tests: focus-visible, disabled, dark, RTL, forced-colors; assert the focus ring in an interaction test.
5. Reconsider the `color` escape hatch (G3) — prefer a single `status` axis and point free-form color needs at `ui/Badge`.

## Clean (rubric dims that pass)
- **V1 accent rail** — none. Pill uses full soft-tint bg, no left/top stripe. Clean.
- **V2 double edge** — soft pills have bg + no border; no border+shadow combo. Clean.
- **V3 gradient text / V4 framework palette / V6 blob-glass-glow / V7 rounded-everything** — none; uses semantic `*-3/*-11` tokens and `rounded-pill` (correct for a tag). Clean.
- **V5 emoji as icons** — none in source/story/test (story uses `IconRocket` via the real Icon API). Clean.
- **G1 surface** — the badge itself is not a card; not a surface-1 misuse (the neutral fill issue is G4 vocabulary, not a hard surface violation).
- **E1–E8 verbal tells** — doc/JSDoc/comments are direct and jargon-free; no em-dash tic (en-dash/hyphen usage is fine), no AI vocabulary, no meta-hedging. Clean.
- **Base a11y for dot** — `aria-hidden="true"` correctly set on the decorative dot (status-badge.tsx:134,173). Clean.
- **Interactive semantics** — clickable renders real `<button type="button">`, not `<div onClick>` (status-badge.tsx:96,115). Correct element choice.
- **Tests + stories exist** — conformance + 18 behavior tests, 30+ stories. Coverage breadth is good (the gap is state-matrix depth, above).
