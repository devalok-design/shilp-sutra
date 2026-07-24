# Finish-Bar Rebuilds — Detailed Plan (4 components)

From the 2026-07-24 finish-bar audit. Order by urgency: bottom-navbar (a11y P0)
→ priority-indicator (small, 2×P0) → autocomplete (composition) → schedule-view
(largest). Each is a **scoped structural** rebuild, not a visual redo — the
common thread is *compose the DS primitive instead of re-rolling it*.

Shared rules for all four: preserve public API where possible; any rename ships
a `@deprecated` alias + changeset (never a hard break); role radius tokens only;
reduced-motion self-guarded; RTL logical properties; add/restore tests
(RTL + vitest-axe); update the doc to match source.

---

## 1. shell/bottom-navbar — 2/5 → target 4/5 (a11y P0)

**Problem:** the "More" overflow menu is a hand-rolled `role="dialog"` (raw
`<div onClick>` backdrop, manual Escape, manual focus `useEffect`) with **no
focus trap, no scroll lock, no return-focus, no `aria-modal`, no
`aria-haspopup`/`aria-controls`**. Sub-44px close button. Dead `user` prop
(accepted + documented, never read). Re-rolls Badge. No test file. Magic numbers.

**Rebuild:**
1. **Re-found the More menu on the DS `Sheet side="bottom"`.** Deletes the raw
   backdrop, manual focus effect, manual Escape, and the `jsx-a11y` disable;
   inherits focus-trap + scroll-lock + return-focus + `aria-modal`. Wire the
   trigger with `aria-haspopup="dialog"` + `aria-controls` (Sheet gives the id).
2. **Compose `Badge`/`Dot`** for `NavBadge` (kills the re-roll + raw values).
3. **Close control → `IconButton`** (≥44px `touch-target`).
4. Detokenize magic numbers: derive sheet offset from bar height (not
   `bottom-[72px]`), `h-[3px]`/`max-w-[70px]`/badge `text-[10px]` → tokens.
5. Label truncation + logical properties (RTL); overflow grid responsive to
   item count (not hard `grid-cols-4`).
6. Backdrop fades with the sheet (Sheet handles); reduced-motion-gate NavBadge
   `zoom-in-75`.
7. **Restore tests**: RTL + vitest-axe — `aria-current`, badge render/cap,
   More open/close + focus return, axe.

**API change (breaking → staged):** the dead `user`/`BottomNavbarUser` prop.
Recommend **deprecate + no-op** (JSDoc `@deprecated`, keep accepting it, delete
the misleading `NoUser`/`AssociateRole` stories) rather than hard-remove.
→ **DECISION 1.**

**Improvements (adoption):** optional Material-3 **pill-behind-icon** indicator
variant + **label-visibility mode** (always / selected-only) for narrow
viewports. Additive. → **DECISION 2** (include now vs defer).

**Effort:** M. **Risk:** low (Sheet is battle-tested). **Breaking:** only the
`user` prop (staged).

---

## 2. composed/priority-indicator — 2/5 → target 4/5 (2×P0, ~50 lines)

**Problem:** infinite URGENT pulse with **no reduced-motion guard** (WCAG
2.2.2); compact chip's only name is `title=` on a `<div>` (SR-unreliable);
re-rolls the chip 3× instead of composing Badge; dead CVA `display` axis (both
branches emit `''`); HIGH and URGENT are visually identical when static; doc
says "LOW=success" (source: slate) and "Server-safe: Yes" (has `'use client'`);
unknown `priority` string crashes at runtime.

**Rebuild (body rewrite, API preserved):**
1. **Recompose as `<Badge variant="soft" color=… startIcon={config.icon}>`** —
   inherits `rounded-pill`, color semantics, accessible labeling, and Badge's
   already-reduced-motion-gated pulse. Compact = icon-only Badge with
   `aria-label={config.label}` + `role="img"`, Icon `aria-hidden`.
2. **URGENT static differentiation** — solid `bg-error-9`/`text-error-fg` (or a
   border) so severity reads without motion. → **DECISION 3** (solid vs border).
3. Drop the dead CVA `display` axis; replace with a boolean **`iconOnly`** (or
   keep `display` as a deprecated alias). → **DECISION 4.**
4. Add a `label`/`children` escape hatch for i18n.
5. Defensive fallback for unknown `priority` (no runtime throw).
6. Fix the doc (LOW=slate, not server-safe) + refresh changelog.
7. Tests: reduced-motion (static render), compact accessible-name, unknown-priority fallback.

**Effort:** S. **Risk:** low. **Breaking:** none if `display` kept as alias.

---

## 3. ui/autocomplete — 2/5 → target 4/5 (composition re-parent)

**Problem:** re-rolls the `<input>` and has **drifted from `Input`**
(`ring-offset` mismatch, `focus-visible` vs Input's `focus-within`, no
hover/read-only, hardcoded height); **controlled-only** (no `defaultValue`); no
`size`/`state` axes; reads FormField `isError` but **never paints it**; no
loading state; option labels untruncated; stagger on a keystroke-frequency
dropdown; dead no-op cleanup effect; AI-filler JSDoc.

**Rebuild (re-parent onto Input — behavior layer kept wholesale):**
1. **Render the field through `<Input role="combobox" state={isError?'error':undefined} size={size} … />`** instead of a hand-rolled input. One move fixes
   cohesion drift, paints the error border, inherits `size`/`state`/read-only/
   hover, standardizes the disabled guard.
2. **Uncontrolled mode**: `defaultValue?: AutocompleteOption | null`.
3. Forward **`size`/`state`** through the composed Input.
4. **`touch-target`** on input + min-height on option rows (44px).
5. **Matched-substring highlighting** — bold the query span in each option
   (cheap, the most recognizable "good autocomplete" cue). → include.
6. **`renderOption` slot** for icons/secondary text. → **DECISION 5** (include now vs defer).
7. **`isLoading` + `loadingText`** async contract (spinner endSection). → **DECISION 6** (include now vs defer).
8. Drop `staggerChildren` (or gate to first-open); delete dead cleanup effect + AI-filler JSDoc.
9. Fix doc (FormField consumption); `truncate` + `title` on options.
10. Tests: add `describeConformance`, ArrowUp/Home/End, disabled-blocks-keyboard, uncontrolled.
- **Deferred:** virtualization (niche; the known-list use case doesn't need it — document the limit).

**Effort:** M. **Risk:** medium (re-parenting the field — visual regressions possible; Storybook + Chromatic check). **Breaking:** none (additive; controlled path unchanged).

---

## 4. composed/schedule-view — 3/5 → target 4/5 (largest, targeted structural)

**Problem:** **~140 individually-tabbable slot buttons** in week view (no
`grid`/`gridcell`, no roving tabindex, no arrow nav); sub-24px targets;
**overlapping events stack directly on top of each other** (illegible); dead
`border-card-strong` (fixed DS-wide in #182 — verify here); `bg-surface-raised`
where the panel tier should be `surface-2`; **now-line never ticks** (mount-time
`Date`, no interval); no overlapping layout; not RTL-safe; magic numbers
(`h-[480px]`, `w-[60px]`, negative-px now-dot); no `renderEvent`/header slot; no
selected-event or real empty state.

**Rebuild (targeted structural):**
1. **Grid a11y**: re-architect to `role="grid"` / `row` / `gridcell` with
   **roving tabindex + arrow/Home/End** nav. When `onSlotClick` is absent,
   render slots as **non-interactive `aria-hidden` grid lines** (kills the ~140
   phantom tab stops). Enforce min interactive height (≥24px WCAG 2.5.8).
2. **Overlapping-event column layout**: an overlap-resolution pass over
   `dayEvents` → partition width across concurrent events (side-by-side columns)
   instead of full-width `absolute` stacking.
3. **Compose `<Card>`** for the shell (surface/radius/border from one place);
   fixes the `surface-raised`→`surface-2` tier + the (now-fixed) border.
4. **Live now-line**: `setInterval` re-render (1 min) + initial
   `scrollIntoView` on the now-line. Guard interval cleanup.
5. **RTL**: physical → logical properties throughout
   (`border-r`→`border-e`, `text-right`→`text-end`, `left/right-ds-01`→`inset-*`,
   transform-based now-dot centering instead of `-left-[5px]`/`-top-[4px]`).
6. Detokenize `h-[480px]`/`w-[60px]`/negatives; make height a prop (or intrinsic
   + scroll) so it doesn't trip `check-arbitrary-sizing`.
7. **`renderEvent` render prop** + optional header/toolbar slot.
8. Selected-event state + a real empty-state affordance; `active:scale` press feedback.
9. Tests: vitest-axe, `onSlotClick`, keyboard-nav.
- **Deferred:** month view, drag-to-create/resize (documented out of scope).

**Scope fork → DECISION 7:** full pass (all of 1–8 in one PR) vs **MVP-structural**
(1 grid-a11y + 2 overlap + 3 Card + 4 now-tick this PR; RTL/renderEvent/selected
in a follow-up). Recommend **MVP-structural** — the two P0/P1 structural items
(grid a11y + overlap) are the finish-bar blockers; the rest is additive polish.

**Effort:** L. **Risk:** medium (grid re-architecture + event-layout math).
**Breaking:** none (additive; display-grid API preserved).

---

## Sequencing & delivery
- One PR per component (each with changeset + tests + Storybook). Land in
  urgency order. bottom-navbar first (real a11y defect in production mobile nav).
- Each verified locally: typecheck + full test + build + `pnpm verify` before push.
- Group the eventual release once all four (or a chosen subset) land.

## Decisions (RESOLVED 2026-07-24)
1. **bottom-navbar `user`:** implement **general, composable role-gating** (not just admin). Per-item `roles?: string[]` (visible when the user's role matches; no roles = always visible) **plus** a `canView?: (user) => boolean` predicate escape hatch for arbitrary logic. `user` becomes real (additive, non-breaking). Delete the misleading stories, add role-gating stories.
2. **bottom-navbar M3 indicator + label-visibility:** INCLUDE now. Plus general "make it best-in-class" polish (truncation, responsive overflow grid, logical/RTL, motion) since it's high-traffic.
3. **priority URGENT:** solid `error-9`/`error-fg` static treatment. (rec accepted)
4. **priority `display`:** replace with `iconOnly` boolean; keep `display` as a deprecated alias. (rec accepted)
5. **autocomplete `renderOption`:** INCLUDE now.
6. **autocomplete `isLoading`/async:** INCLUDE now.
7. **schedule-view:** FULL pass in one PR (grid a11y + overlap columns + Card + live now-line + RTL + renderEvent/header + selected-event + empty state + detokenize).
