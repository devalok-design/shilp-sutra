# composed/global-loading — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

## Findings

### [P1][V6] Default colored glow on the completion bar
- **Category:** visual-tell
- **Evidence:** global-loading.tsx:48-52 — `style={ !isLoading && !animationComplete ? { boxShadow: '0 0 8px var(--color-accent-9)' } : undefined }`
- **Why:** A glowing colored `box-shadow` on the bar during the finish phase is the classic AI "glow" tell (V6). It ships by default — no prop gates it, not documented as intentional. A flat, tokened progress bar reads more designed than an NProgress with a neon halo.
- **Fix:** Drop the glow, or if a finish emphasis is wanted, express it through opacity/height and a named shadow token — never a hardcoded `0 0 8px color` inline.

### [P1][G2] Re-rolled shadow — hardcoded px inline, not a token
- **Category:** drift
- **Evidence:** global-loading.tsx:50 — `boxShadow: '0 0 8px var(--color-accent-9)'`
- **Why:** Even setting aside the glow, this is a raw `8px` shadow inlined instead of a `shadow-*` token from our system. G2 forbids hardcoded shadows. It bypasses the surface/shadow vocabulary entirely and can't respond to theme/forced-colors.
- **Fix:** Remove it (see V6). If retained, it must be a named `@utility` shadow token, applied via className, not an inline style literal.

### [P2][M5] Animates the layout prop `width`
- **Category:** motion
- **Evidence:** global-loading.tsx:43 — `transition-[width,opacity] duration-slow-01` with `w-4/5` / `w-0` / `w-full` toggled by state
- **Why:** M5 — animating `width` triggers layout on every frame rather than compositor-only transform. NProgress-style bars conventionally do this, so it's a soft flag, but a `scaleX` transform from a `transform-origin: left` gives the same visual with no layout thrash.
- **Fix:** Consider `scale-x-*` / `transform` with `origin-left` instead of `w-*`. Keep opacity as-is. Lower priority since it's a 1px fixed bar (cheap layout), but it's still off the transform/opacity rule.

### [P2][J] Doc claims auto-unmount / renders-nothing — both false
- **Category:** docs
- **Evidence:** global-loading.md:22 `Auto-unmounts when isLoading=false`; md:26 `Renders nothing when isLoading is false`. Source always renders the fixed `<div>` (global-loading.tsx:30-62) — it never unmounts and never returns null; when idle the inner bar is `w-0 opacity-0` but the outer wrapper stays mounted.
- **Why:** Docs-parity bug. A consumer reading this will not conditionally render (correct) but will believe nothing is in the DOM — the wrapper (a fixed, full-width, `pointer-events-none` div) is always present. Misleads on stacking/z-index reasoning.
- **Fix:** Rewrite: "Always mounted; the bar collapses to zero width and fades out when `isLoading` is false. `pointer-events-none` so it never blocks the page. `aria-hidden` when idle."

### [P2][J] No co-located test file
- **Category:** docs
- **Evidence:** `packages/core/src/composed/` contains `global-loading.tsx` + `global-loading.stories.tsx` only — no `global-loading.test.tsx`.
- **Why:** The state machine here (isLoading → animationComplete via `onTransitionEnd` + a 200ms timeout, cleanup on unmount) is exactly the kind of stateful/effect logic that regresses silently. Card/StatCard (the bar) ship tests. This has none.
- **Fix:** Add a test: asserts `role="progressbar"`/`aria-hidden` toggles with `isLoading`, that the timeout ref is cleared on unmount, and the width-class transitions (loading → complete → collapsed).

### [P2][G2] Story uses hardcoded hex + inline styles instead of tokens/components
- **Category:** vocabulary
- **Evidence:** global-loading.stories.tsx:52-58 — `background: loading ? '#888' : '#D33163'`, `color: '#fff'`, `borderRadius: 8`, raw `<button>` with inline styles.
- **Why:** `#D33163` is the brand pink hardcoded (not `--color-accent-9`), `#888`/`#fff` are raw greys. Story source is doc surface an AI reader scrapes; hardcoded hex + a bare styled `<button>` instead of our `Button` reads as vibe-coded and drifts from tokens.
- **Fix:** Use `<Button>` from the DS for the trigger and DS CSS vars (`var(--color-accent-9)` etc.) rather than hex literals.

### [P3][H] progressbar role without valuenow and no aria-live
- **Category:** a11y
- **Evidence:** global-loading.tsx:33-37 — `role="progressbar" aria-label="Page loading" aria-valuetext={isLoading ? 'Loading' : undefined}` (no `aria-valuenow`/`min`/`max`, no `aria-live`).
- **Why:** For an indeterminate bar, omitting `aria-valuenow` is technically allowed, but pairing it with `aria-hidden={!isLoading}` means SR users get no announcement when navigation starts/ends. Minor — a route-progress bar isn't the primary status channel — but it's an incomplete a11y story.
- **Fix:** Consider `aria-busy` on the app root instead, or an `aria-live="polite"` visually-hidden status text ("Loading page…" / "Loaded") so the transition is announced without leaving a permanent progressbar node.

### [P3][F2] No asChild / no way to relocate; hardcoded top placement
- **Category:** composability
- **Evidence:** global-loading.tsx:38 — `fixed inset-x-0 top-0 z-toast h-1` baked in; only override is `className`.
- **Why:** Placement (top), height (`h-1`), and z-layer are fully baked. `className` can override via specificity but there's no first-class prop for a bottom bar or a contained (non-fixed) variant. Minor — this is a deliberately narrow single-purpose primitive — but it's the least composable component in the family.
- **Fix:** Acceptable to leave as-is given scope; if extended later, a `position`/`placement` prop or documenting the `className` override contract would help.

## Composability gaps
- Single-purpose primitive with one required boolean prop (`isLoading`). No slots needed — nothing to compose. `F1/F3/F4/F5/F6` all N/A (no bespoke corner-props, <8 props, no variant axes, no controlled/uncontrolled surface).
- `F2`: no `asChild` and fully baked `fixed top-0` positioning; only `className` escape hatch. Low impact for this component's scope but it's the one composability nit.
- Does NOT re-roll a surface (F5 clean) — it's a bare progress line, not a card, so it correctly does not compose Card.

## Motion gaps
- **M5 (flagged):** animates `width` (layout prop) rather than a `scaleX` transform.
- **M3 clean:** transitions are plain CSS (`transition-[width,opacity]`), so the global `@media (prefers-reduced-motion: reduce)` reset in semantic.css:675 zeroes `transition-duration` for this component automatically. No framer-motion here, so no MotionConfig dependency.
- **M1 clean:** uses `ease-productive-standard` + `duration-slow-01` tokens — no bounce/overshoot.
- **M2 clean:** single intentional duration for a single-purpose bar; enter (grow to 80%) vs finish (to 100% + fade) are differentiated by state.
- **M4 clean:** the whole component IS feedback motion; entrance/finish/exit all handled.
- **Extra glow tell** noted under V6/G2 above (motion-adjacent visual).

## Polish plan (ordered steps to reach the finish bar)
1. Remove the hardcoded `boxShadow: '0 0 8px var(--color-accent-9)'` glow (V6 + G2) — the single biggest tell.
2. Fix the doc: correct the false "auto-unmounts / renders nothing" claims to "always mounted, collapses + fades" (J).
3. Add a co-located `global-loading.test.tsx` covering the state machine + timeout cleanup (J / state-coverage).
4. Rewrite the story trigger to use `<Button>` and DS color vars instead of `#D33163`/`#888`/`#fff` inline styles (G2 / vocabulary).
5. (Optional) Switch width animation to a `scaleX` transform with `origin-left` (M5).
6. (Optional) Add an `aria-live` visually-hidden status for SR announcement of navigation start/end (H).

## Clean (rubric dims that pass)
- **V1** no accent rail. **V2** no double edge (no border at all). **V3** no gradient text. **V4** uses `bg-accent-9` semantic token, not indigo/violet/slate. **V5** no emoji. **V7** `h-1` bar, no rounded-everything. **V8** no pill spam.
- **V9–V15** N/A (no typography/hero/imagery in this primitive; story `fontSize` inline is minor doc-surface, not the component).
- **S1–S4** N/A (single primitive, not a page/deck).
- **E1–E8** doc + JSDoc are terse and clean — no em-dash tic, no AI vocabulary, no hedging. ("NProgress-style" is a real reference, fine.)
- **G1** surface: N/A — it's a bare colored line, not a card; no surface-1 misuse. **G3/G4** no variant axes to drift. **G5** N/A (no soft/outline choice).
- **I** types: clean — `forwardRef` + `displayName`, `HTMLDivElement` ref, `ComponentPropsWithoutRef<'div'>`, single boolean prop, no `any`, no stringly-typed enum.
- **Motion tokens** `duration-slow-01` / `ease-productive-standard` / `z-toast` all resolve to real tokens (semantic.css). No re-rolled durations/z-index.
- **H** timeout is tracked in a ref and cleared on unmount (global-loading.tsx:18-20, 56) — no leak; a prior v0.18.0 fix per the doc changelog.
