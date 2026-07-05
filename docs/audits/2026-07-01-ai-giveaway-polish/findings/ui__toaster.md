# ui/toaster — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

> Scope note: `Toaster` (`toaster.tsx`) is a thin mount-once wrapper around Sonner. The actual surface a consumer SEES when they mount `<Toaster/>` is rendered by `ToastContent` / `UploadToastContent` in the tightly-coupled `toast.tsx` (Toaster sets `unstyled: true` and the toast components paint everything). The dominant tells therefore live in `toast.tsx`. I audited both, since the visible default of mounting Toaster is the toast surface.

## Findings

### [P1][V1] Colored left accent rail on every typed toast
- **Category:** visual-tell
- **Evidence:** `packages/core/src/ui/toast.tsx:191-196` — `{config.accentClass && (<div className={cn('w-1 shrink-0 rounded-l-overlay-sm', config.accentClass)} />)}`; config classes `bg-success-9` / `bg-error-9` / `bg-warning-9` / `bg-info-9` / `bg-accent-9` at `toast.tsx:56-91`. Upload toast has an unconditional rail at `toast.tsx:533` (`<div className={cn('w-1 shrink-0 rounded-l-overlay-sm', accentClass)} />`).
- **Why:** A colored left stripe on a rounded/shadowed surface is the single most recognizable AI tell — the exact pattern we deliberately killed on Card and StatCard in v0.44.0 (`StatCard` even has a CHANGELOG note "Replaces the removed `accent` left-rail prop"). The toast is a rounded `bg-surface-overlay shadow-floating` card; a `w-1` colored bar pinned to its left edge is V1 verbatim. The doc (`docs/components/ui/toaster.md:51-52`, `toast.md:12-16`) documents it as intentional, but "documented" doesn't make it not-a-tell — Card's old rail was documented too. The rubric carve-out ("full `color` border for semantic cards is fine") permits a *full* semantic edge, not a left-only decorative stripe.
- **Fix:** Drop the rail. Carry type semantics through the status icon (already present + colored via `iconClass`) + an optional full `border border-{color}-7` on the overlay if more weight is needed, matching how Card's `color` axis paints a full edge. If a left marker is truly wanted, gate it behind an explicit opt-in prop so it's a choice, not the default.

### [P1][V2] Double edge risk on the overlay surface (shadow + would-be border)
- **Category:** visual-tell
- **Evidence:** `toast.tsx:184` — `'... rounded-overlay-sm bg-surface-overlay shadow-floating'`. The surface is elevation-led (shadow ring). The accent rail in V1 then re-introduces a colored edge on one side.
- **Why:** Card's make-kit rule #6 is "shadow ring is the edge — no border+shadow double-edge." The toast currently has shadow elevation AND a colored left edge segment, which reads as the same double-edge inconsistency Card eliminated. Fixing V1 resolves most of this; flagging so the replacement (if a colored edge is chosen) is a *full* edge replacing — not added to — the shadow, per the Card variant model.
- **Fix:** Pick one. Keep `shadow-floating` as the edge (elevation-led, like Card `default`), and express type via icon/foreground only; or go border-led with a full semantic border and drop the floating shadow.

### [P1][F5] Toast surface re-rolls the Card surface vocabulary instead of composing it
- **Category:** composability
- **Evidence:** `toast.tsx:184` & `toast.tsx:525` hand-roll `rounded-overlay-sm bg-surface-overlay shadow-floating` plus padding `p-ds-04` inline, rather than composing `<Card>` (or a shared overlay-surface primitive). Card centralizes "surface + padding + elevation + edge" exactly so siblings don't drift (this is the drift StatCard fixed by composing Card at `stat-card.tsx:243,419,452`).
- **Why:** Two independent toast surfaces (`ToastContent`, `UploadToastContent`) each re-declare the surface string. If the overlay radius/shadow/edge vocabulary changes, these drift silently — the failure mode the rubric F5 names. (Toasts legitimately use the overlay radius/shadow rather than `rounded-surface`/`shadow-raised`, so this is composing a shared *overlay* surface, not literally `<Card variant>`.)
- **Fix:** Extract the overlay surface (radius + bg + shadow + the eventual edge decision) into one shared class/primitive and have both toast bodies + the close-button styling consume it. At minimum DRY the duplicated string between `ToastContent` and `UploadToastContent`.

### [P2][M1] Bouncy spring (overshoot) is the default for icon entrances
- **Category:** motion
- **Evidence:** `toast.tsx:220` (`transition={springs.bouncy}` on the typed status icon), `toast.tsx:547,558` (upload result icons), and `springs.bouncy = { stiffness: 400, damping: 15 }` at `lib/motion.ts:27` (damping 15 = pronounced overshoot).
- **Why:** Rubric M1 — overshoot should be reserved for moments that *mean* something (celebration), not every icon mount. A success check bouncing is arguably justified; an *error* icon bouncing in (`toast.tsx:373` uses `tweens.fade` for the upload error, but `ToastContent` error icon at :220 uses `springs.bouncy`) is the wrong affect — an error shouldn't feel playful. The toast container itself uses `springs.smooth` (good); the icon is where the bounce lives.
- **Fix:** Differentiate by type: `springs.bouncy` only for `success` (and maybe `info`); use `springs.snappy` or `tweens.fade` for `error`/`warning` so the motion affect matches the semantic.

### [P2][M3] Icon/container entrance springs have no reduced-motion guard
- **Category:** motion
- **Evidence:** The timer bar correctly uses `motion-safe:animate-timer-bar` (`toast.tsx:114`), but the framer-motion entrances (`toast.tsx:179-189` container `layout="position"` + spring; `:204-223` icon `initial/animate` springs; upload rows `:344-351` `layout` + `springs.snappy`) have no `prefers-reduced-motion` handling. The lib ships `withReducedMotion()` (`lib/motion.ts:58`) but it's unused here; there's no `useReducedMotion()`/`MotionConfig` gate.
- **Why:** Rubric M3 / H. Animated overlays that ignore reduced-motion are a baseline a11y gap. CSS animations are guarded; the JS ones aren't — inconsistent.
- **Fix:** Wrap toast motion in a reduced-motion check (`useReducedMotion()` → swap to `tweens.fade`/instant, or rely on a `MotionConfig reducedMotion="user"` at the Toaster root). The `withReducedMotion` helper exists for exactly this.

### [P2][M5] Animating layout / `height` on upload rows
- **Category:** motion
- **Evidence:** `toast.tsx:344-351` — `<motion.div layout ... exit={{ opacity: 0, x: -20, height: 0 }} transition={springs.snappy}>` on each upload file row.
- **Why:** Rubric M5 — animating `height` (a layout property) instead of transform/opacity triggers layout passes per frame. `layout` + animated `height: 0` on exit is the flagged pattern. Acceptable for a collapsing list row but worth noting against the bar.
- **Fix:** Prefer collapsing via `layout` alone (framer measures and transforms) without also animating `height` in the exit object, or accept it as a deliberate row-collapse and document it.

### [P2][G2] Hardcoded pixel values instead of tokens
- **Category:** drift
- **Evidence:** `toast.tsx:109` `h-[2px]` (timer bar height — arbitrary px), `toast.tsx:209` `mt-0.5`, `:239` `mt-0.5`, `:583` `mt-0.5` (raw `0.5` not a `ds-*` step), `toast.tsx:211` `h-4 w-4` / `:383` `h-3.5 w-3.5` / `:450,461` `h-3.5 w-3.5` (raw sizing on icons/spinners), `:432,590` `max-w-[60px]` / `max-h-[140px]` (arbitrary px), `:416` `w-16` / `:410`→`w-20` etc.
- **Why:** Rubric G2 — bypasses the `--spacing-ds-*` cadence. The codebase standard is `gap-ds-*`/`mt-ds-*`; `mt-0.5` and `h-[2px]`/`max-w-[60px]` are off-scale one-offs. Minor but it's drift from the token system Card adheres to.
- **Fix:** Map to the nearest `ds-*` spacing/size token (e.g. `mt-ds-01`, a tokenized timer-bar height). Where a true 2px hairline is intentional, add a token rather than an arbitrary value.

### [P3][I] `any` in the toast-type config and `forwardRef` ref-spread gap
- **Category:** types
- **Evidence:** `toast.tsx:53` — `icon: React.ForwardRefExoticComponent<any> | null` (an `any` in an internal-but-exported module). Separately, `toaster.tsx:60-91` forwards a ref and accepts `className` but does **not** spread remaining `HTMLAttributes` onto the wrapper `div` — `ToasterProps` is a closed prop set, so `id`, `data-*`, `style`, `aria-*` on `<Toaster>` are silently dropped.
- **Why:** Rubric I. `any` defeats the icon-type safety the rest of the system enforces (`IconInput`). The closed props bag is defensible for a singleton mount component, but is a small composability nick vs. the Card bar (Card extends `HTMLAttributes` and spreads `...props`).
- **Fix:** Type the icon as `React.ComponentType<{ className?: string }> | null` (or the lib's `IconInput`-aligned type). Optionally extend `ToasterProps` from `Omit<React.HTMLAttributes<HTMLDivElement>, ...>` and spread the rest onto the wrapper `div`.

### [P3][J] Doc reinforces the accent rail as a feature
- **Category:** docs
- **Evidence:** `docs/components/ui/toaster.md:52` "colored left accent bar per type"; `docs/components/ui/toast.md:12-16` "green accent / red accent / yellow accent…"; `make-kit/components/toast.md` (same language, not re-read here).
- **Why:** Docs parity — once V1 is fixed, these three docs (+ llms.txt/llms-full.txt) must stop describing the rail, or they drift from source. Listed P3 because it's downstream of the V1 fix.
- **Fix:** When the rail is removed/gated, update toaster.md, toast.md, make-kit/components/toast.md, and the llms files in the same change.

## Composability gaps
- **F5 (primary):** `ToastContent` and `UploadToastContent` each re-roll the overlay surface string (`rounded-overlay-sm bg-surface-overlay shadow-floating`) instead of composing one shared overlay-surface primitive — the same drift StatCard eliminated by composing `<Card>`. DRY these two into one source of truth.
- **Toaster props are a closed bag** (`toaster.tsx:39-58`): no rest-prop spread, so `id`/`data-*`/`style`/`aria-*` on `<Toaster>` are dropped. Minor (it's a singleton), but below the Card bar where `...props` flows through.
- **`toast.custom` is the only true escape hatch** for content; the typed toasts are fixed-layout (title/description/action/cancel) with no slot for arbitrary leading content beyond the type icon. Acceptable for a notification primitive — not flagged as a gap, just noted.
- No `asChild` need here (not a polymorphic element host) — F2 N/A.

## Motion gaps
- **No reduced-motion guard on the JS/framer entrances** (M3) — CSS timer bar is guarded (`motion-safe:`), the spring entrances are not. Inconsistent; wrap in `useReducedMotion`/`MotionConfig`.
- **Bouncy overshoot is type-agnostic** (M1) — error/warning icons bounce in with the same celebratory spring as success. Affect should track semantics.
- **Animating `height` on upload-row exit** (M5) — layout-prop animation; prefer transform/opacity + `layout`.
- Container enter uses `springs.smooth` + `layout="position"` (good — intentional, not robotic) and timer-bar pauses on hover/focus (good feedback motion). These pass.

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the accent rail (V1/V2).** Remove the left `w-1` colored bar from `ToastContent` (`toast.tsx:191-196`) and `UploadToastContent` (`:533`). Express type via the already-colored status icon; if more weight is needed, add a full `border-{color}-7` on the overlay (full edge, not a stripe), mirroring Card's `color` axis. Keep `shadow-floating` as the single edge.
2. **DRY the overlay surface (F5).** Extract `rounded-overlay-sm bg-surface-overlay shadow-floating` (+ padding + the new edge decision) into one shared class/component consumed by both toast bodies.
3. **Reduced-motion (M3).** Add `MotionConfig reducedMotion="user"` at the Toaster root (or `useReducedMotion()` in the toast bodies) so spring entrances collapse to fade/instant for users who ask.
4. **Differentiate motion by type (M1).** `springs.bouncy` for success only; `springs.snappy`/`tweens.fade` for error/warning.
5. **Tokenize the off-scale values (G2).** `h-[2px]`, `mt-0.5`, `max-w-[60px]`, `max-h-[140px]` → nearest `ds-*` tokens (add a hairline token if 2px must stay).
6. **Tighten types (I).** Replace `ForwardRefExoticComponent<any>` with a proper icon type; consider spreading rest HTML props on the Toaster wrapper.
7. **Update docs (J).** Once the rail is gone, scrub "left accent bar / colored accent" from toaster.md, toast.md, make-kit, and the llms files.

## Clean (rubric dims that pass)
- **Surface layering (G1):** `bg-surface-overlay` is correct — toasts are overlays, which belong to the surface-1 family per the MANDATORY layering rule. No surface drift.
- **No gradient text / framework palette / blob-glass (V3/V4/V6):** colors come from semantic step tokens (`success-9/11`, `error`, `accent`, `surface-*`), not raw Tailwind `indigo/violet/slate`. No `bg-clip-text`, no `backdrop-blur` glassmorphism, no glow shadows.
- **No emoji-as-icons (V5):** real Tabler icons via the `Icon` API throughout.
- **No rounded-everything (V7):** single overlay radius vocabulary (`rounded-overlay-sm`); `rounded-pill` only where appropriate. No `rounded-2xl/3xl`.
- **a11y baseline (H):** `role="alert"`+`aria-live="assertive"` for errors, `role="status"`+`aria-live="polite"` otherwise, `aria-atomic`, sr-only upload announcement, real `<button>`s with `aria-label`, `focus-visible:ring` on actions, `touch-target` on icon buttons. axe-clean tests present (`toast.test.tsx:161-176`).
- **Timer-bar reduced-motion (partial M3 pass):** the CSS timer animation is `motion-safe:`-gated and pauses on hover/focus — correct feedback motion.
- **Verbal tells (E):** JSDoc/docs are direct and prescriptive; no em-dash tic abuse, no AI-vocabulary, no hedging. (The doc's `—` usage is sparse and non-stylistic.)
- **Tests + stories present (J):** stories cover positions + close button; tests cover rendering, a11y, actions, upload, timer bar, formatting. Good coverage for a Sonner-wrapped primitive.
- **`toaster.tsx` itself is lean:** `forwardRef` + `displayName` set, `z-toast` layer correct, registry warns once (dev-only, non-fatal) when no Toaster is mounted — a thoughtful guard, not a tell.
