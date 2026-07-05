# composed/priority-indicator — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:4 P2:4 P3:2

Small component, but it ships two of the classic tells: an infinite decorative pulse with **no reduced-motion guard** (its own sibling `Badge` does this correctly), and it **re-rolls the chip surface** three times instead of composing `Badge` — the exact F5 drift StatCard fixed by composing Card. It also carries a dead CVA axis, off-taxonomy variant naming, and a doc that contradicts the source on LOW's color.

## Findings

### [P0][M3] Infinite URGENT pulse has no reduced-motion guard
- **Category:** motion / a11y
- **Evidence:** priority-indicator.tsx:96-98 — `animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}` (compact) and again :116-118 (full). No `useReducedMotion()` / `useMotion()` anywhere in the file.
- **Why:** A perpetually moving element with no `prefers-reduced-motion` opt-out is a WCAG 2.2.2 (Pause/Stop/Hide) + vestibular-safety violation, and it is the single most AI-reflex motion pattern (attention-grab pulse). The sibling `Badge` gates its identical infinite dot pulse behind `useReducedMotion()` (badge.tsx:164, 257-258) — this component simply didn't.
- **Fix:** `const prefersReducedMotion = useReducedMotion()`; when true, render the static chip (drop the `motion.div` wrapper, or pass `animate={undefined}` / `transition={{ duration: 0 }}`). Mirror badge.tsx:257-258 exactly.

### [P1][F5] Re-rolls the chip surface instead of composing `Badge`
- **Category:** composability / drift
- **Evidence:** The pill/chip is hand-built 3×: priority-indicator.tsx:82-91 (compact), :118-125 (full urgent), :127-134 (full non-urgent) — each is `inline-flex items-center justify-center rounded-control p-ds-0x <bgColor>` + `<Icon .../>`. `Badge` already provides color semantics, `startIcon`, sizing, `rounded-pill`, and reduced-motion-gated pulse (badge.tsx).
- **Why:** This is the drift StatCard eliminated by composing `<Card>`. Re-rolling surface means color/radius/spacing decisions live in two places and drift (see G2/G3/J below — they already have). A priority flag IS a badge.
- **Fix:** Render `<Badge color={…} startIcon={config.icon} variant="soft">{config.label}</Badge>` for full, and a `circle`/icon-only Badge for compact. Map priority→`BadgeColor` (`error`/`warning`/`slate`). Lose ~50 lines and inherit Badge's a11y + motion handling for free.

### [P1][G3] Off-taxonomy variant axis (`display: compact | full`) — and it's a dead CVA axis
- **Category:** vocabulary
- **Evidence:** priority-indicator.tsx:52-60 — `variants: { display: { compact: '', full: '' } }`. Both branches emit **empty strings**; the axis contributes zero classes and exists only to satisfy `VariantProps`. Canonical axes are `variant` / `size` / `color` / `shape` (rubric G3).
- **Why:** `display` is not a canonical axis name, and the CVA does literally nothing — all real branching happens via `if (display === 'compact')` in the body. A reader/tooling sees a variant axis that has no styling effect (the test even skips the `variants` conformance axis because of this — test:11-12).
- **Fix:** If keeping the prop, name it per taxonomy (e.g. `size="sm"` for icon-only, or a boolean `iconOnly`); drive real classes through CVA or drop the CVA entirely since it only holds the base string.

### [P1][J] Doc contradicts source: LOW color
- **Category:** docs / drift
- **Evidence:** priority-indicator.md:27 — "Color semantics: LOW=success". Source LOW uses `text-category-slate-11` / `bg-category-slate-3` (priority-indicator.tsx:24-25), i.e. **slate/neutral, not success**. Source wins (CLAUDE.md rule).
- **Why:** Documented behavior is wrong; a consumer expecting a green LOW gets grey.
- **Fix:** Update doc to "LOW=slate/neutral, MEDIUM=warning, HIGH=error, URGENT=error (bolder icon)". If success was intended, change the config instead — but slate is the better neutral read for "low".

### [P1][H] Compact mode's only accessible name is `title`; pulse wrapper not `aria-hidden`
- **Category:** a11y
- **Evidence:** priority-indicator.tsx:84-90 — compact chip relies solely on `title={config.label}`; the `<Icon>` carries no label and there is no visible text. Screen readers do not reliably announce `title` on a non-interactive `<div>`. Also the URGENT `motion.div` wrappers (:96, :116) add no `aria-hidden` and no `role`.
- **Why:** Compact priority is effectively invisible to assistive tech (title tooltips are mouse-only + inconsistently voiced). The animated wrapper injects a decorative element with no semantics.
- **Fix:** Add `aria-label={config.label}` (and `role="img"`) to the compact chip, or a visually-hidden `<span>`. Keep the Icon `aria-hidden`. (Composing Badge with a `title`/`aria-label` also resolves this.)

### [P2][G2] `rounded-control` for a badge-shaped chip (family vocabulary mismatch)
- **Category:** drift / vocabulary
- **Evidence:** priority-indicator.tsx:84, 120, 129 — `rounded-control`. Badge, the component this visually is, uses `rounded-pill` (badge.tsx:48).
- **Why:** Two components with the same "small status chip" role use different radius tokens. Minor, but it's exactly the kind of per-component reflex that composing Badge would erase.
- **Fix:** Compose Badge (inherits `rounded-pill`) or align on one radius for status chips.

### [P2][G3] HIGH and URGENT are visually identical except the perpetual pulse
- **Category:** vocabulary / state-coverage
- **Evidence:** priority-indicator.tsx:35-46 — HIGH and URGENT both use `text-error-11` + `bg-error-3`; only `icon` differs (IconArrowUp vs IconAlertTriangle) and URGENT adds the pulse.
- **Why:** The sole *static* differentiator between the two top severities is the icon glyph; the pulse is the primary distinguisher, so with reduced-motion on (once M3 is fixed) HIGH and URGENT become near-indistinguishable at a glance.
- **Fix:** Give URGENT a stronger static treatment (e.g. solid `bg-error-9`/`text-error-fg`, or a border) so severity reads without motion.

### [P2][M4] No feedback/entrance motion; the only motion is a decorative loop
- **Category:** motion
- **Evidence:** Whole file — no entrance transition, no hover/press (component is non-interactive, which is fine), and the *only* animation is the infinite URGENT scale loop.
- **Why:** Against the Card bar, motion should mean something (entrance/exit/feedback). A looping pulse is decoration, not communication. If URGENT wants attention, a one-shot entrance emphasis is more intentional than an endless loop.
- **Fix:** Replace the infinite loop with a subtle one-shot entrance (or a very slow, reduced-motion-gated attention pulse only if UX truly needs it). Consider `springs`/`tweens` presets from lib/motion for consistency instead of an inline `easeInOut` tween.

### [P2][structural] Chip markup duplicated 3× (compact / full-urgent / full-non-urgent)
- **Category:** structural-tell / maintainability
- **Evidence:** priority-indicator.tsx:82-134 — three near-identical chip blocks; the full-mode urgent vs non-urgent branch differs only by wrapping in `motion.div`.
- **Why:** Triplicated surface is why the color/radius drift above happened. A single chip element (static vs motion chosen by one flag) removes the divergence.
- **Fix:** Extract one chip render; pick `motion.div` vs `div` by `isUrgent && !prefersReducedMotion`. Better: compose Badge and delete the duplication.

### [P3][M2] Inline hardcoded easing instead of motion-system presets
- **Category:** motion
- **Evidence:** priority-indicator.tsx:98, 118 — `ease: 'easeInOut', duration: 2` inline, not from `lib/motion` (`springs`/`tweens`/`durations`).
- **Why:** Sibling components pull timing from the shared scale; this one invents a 2s duration and generic easing.
- **Fix:** Use a `durations`/`tweens` preset (once M3/M4 rework the animation).

### [P3][docs] Doc "Changes" version stamps (v0.1.0/v0.2.0) look stale vs current 0.44.x
- **Category:** docs
- **Evidence:** priority-indicator.md:34-39 — changelog stops at v0.2.0.
- **Why:** Minor; suggests the doc hasn't been revisited as the package moved to 0.44.x. Not load-bearing.
- **Fix:** Leave unless the API changes during polish; if you fix M3/F5/G3 above, add a Changes entry.

## Composability gaps
- **F5 (primary):** Does not compose `Badge` despite being a badge — re-rolls chip surface, color mapping, radius, and pulse. Should delegate to `<Badge>` the way StatCard delegates to `<Card>`.
- **F1/F3:** No content slots and no `children` (children are `Omit`ted, :65) — reasonable for a fixed-shape indicator, but combined with F5 it means the component is a closed re-implementation rather than a thin config over Badge.
- **F6:** N/A — no controlled/uncontrolled state (purely presentational).
- **Dead CVA axis (G3):** `display` variant produces no classes; if it composed Badge it would map to Badge's `size`/`circle` instead.

## Motion gaps
- **M3 (P0):** Infinite URGENT pulse with no `prefers-reduced-motion` guard — the fix pattern already exists in badge.tsx:164/257-258 and via the `useMotion()` context used throughout `ai/*`.
- **M4/M2:** Only motion is a decorative infinite loop; no intentional entrance/feedback; timing is inline-hardcoded (2s, easeInOut) rather than from the duration scale.
- No `aria-hidden` on the animating wrapper.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix M3 first (P0):** add `useReducedMotion()`; when reduced, render the static chip with no `motion.div`. Mirror Badge.
2. **Compose Badge (F5):** replace the three hand-rolled chips with `<Badge>` — map priority→`BadgeColor` + `startIcon` + `variant="soft"`; use icon-only/`circle` Badge for compact. This alone resolves G2 (radius), the H a11y gap (Badge handles labeling), and the structural duplication.
3. **Kill the dead CVA axis (G3):** drop `display` from CVA or rename to a canonical axis; drive icon-only via a real prop.
4. **Differentiate URGENT statically (G3):** stronger static treatment so it reads without the pulse; then reconsider whether the loop is needed at all (M4 — prefer one-shot entrance).
5. **Reconcile the doc (J):** correct LOW color; refresh Changes.
6. Add a reduced-motion story + a compact-a11y (accessible name) assertion to lock the fixes.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double-edge:** none (chips are bg-only, no border+shadow). **V3 gradient text:** none. **V4 framework palette:** uses semantic + `category-*` tokens, not raw indigo/violet. **V5 emoji:** none (real Tabler icons). **V6 blob/glass/glow:** none. **V7 rounded-everything / V8 pill spam:** single chip, no badge spam.
- **Verbal (E1–E8):** source/doc are terse and clean — no em-dash tic in copy, no AI vocabulary, no meta-hedging.
- **Types (I):** `forwardRef` + `displayName` present; ref typed `HTMLDivElement`; `Priority` union exported; no `any`, no `React.FC`, no `color?: string`.
- **G1 surface:** N/A (inline chip, not a surface-level card).
- **Tests/stories exist:** conformance + behavior tests, 12 stories covering all priorities × both displays.
