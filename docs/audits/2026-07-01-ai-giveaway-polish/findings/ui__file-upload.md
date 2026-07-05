# ui/file-upload — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:6 P3:2

FileUpload is functional, accessible at the input level, and free of the loudest AI tells (no accent rail, no gradient text, no indigo palette, no emoji). But it falls well short of the Card bar: it re-rolls its own surface and button chrome instead of composing `Card`/`Button`, it animates a layout prop (`width`) on the progress bar, it ships a default decorative shake on errors, the drop-zone surface is wrong per the layering rule, the dashed-border + `bg-surface-raised-hover` is a double-edge-ish reflex, and several states (focus-visible ring, RTL, forced-colors, reduced-motion fallback) are unaddressed. The compact mode also hand-builds a button that drifts from the Button vocabulary (`primary/secondary`-style ad-hoc styling, no `variant`/`size` axes).

## Findings

### [P1][F5] Drop zone + compact button re-roll surface/chrome instead of composing base primitives
- **Category:** composability
- **Evidence:** file-upload.tsx:313-321 — `'flex flex-col items-center justify-center gap-ds-03 rounded-surface', 'border-2 border-dashed p-ds-08', 'border-surface-border-strong bg-surface-raised-hover'`; and the compact path file-upload.tsx:244-252 hand-builds a button: `'inline-flex items-center gap-ds-02 rounded-control px-ds-03 py-ds-02', 'border border-surface-border-strong', 'bg-surface-raised-hover text-surface-fg-muted', 'hover:bg-accent-2'`
- **Why:** This is exactly the drift StatCard fixed by composing `<Card>`. The compact button re-rolls Button's job (it should be `<Button variant="soft"|"outline" size="sm" startIcon={...}>`), and the drop zone re-rolls a surface/radius/padding vocabulary instead of leaning on tokens via a shared primitive. Two sources of truth for "what a button looks like."
- **Fix:** Compact mode should render `<Button variant="outline" size="sm" startIcon={uploading ? <Spinner/> : <Icon icon={IconPaperclip}/>}>`. Keep the drop zone bespoke (it legitimately isn't a Card), but pull its radius/border/padding through the same tokens Button/Card use and document why it's not composing Card.

### [P1][G1] Drop zone uses `bg-surface-raised-hover` as its resting surface — wrong layer + a hover token used as a base
- **Category:** drift
- **Evidence:** file-upload.tsx:317 `'border-surface-border-strong bg-surface-raised-hover'` (resting state); compact button file-upload.tsx:248 `'bg-surface-raised-hover text-surface-fg-muted'`; progress track file-upload.tsx:371 `bg-surface-raised-hover`
- **Why:** `surface-raised-hover` is the *hover* step of the raised surface (surface-3 semantics), being used as the *default* fill. A drop zone is an input control that sits on the page; per the MANDATORY layering rule input controls live on surface-1, and a control's resting fill should not be a hover-state token. Using the hover step at rest means there's nowhere to go on actual hover (the component has no hover transition at all — see M4).
- **Fix:** Use `bg-surface-1` (or `bg-surface-input`/the standard input fill used by Input/Textarea) at rest and reserve `surface-raised-hover` for the hover state. Cross-check `scripts/pre-publish-audit.mjs` SURFACE1_ALLOWLIST.

### [P1][M5] Progress bar animates `width` (a layout prop), and it escapes reduced-motion
- **Category:** motion
- **Evidence:** file-upload.tsx:373-377 `<motion.div className="h-full rounded-pill bg-accent-9" animate={{ width: \`${progress}%\` }} transition={springs.smooth} />`
- **Why:** Animating `width` triggers layout/paint each frame (M5) instead of compositor-only transform. It also slips past `MotionConfig reducedMotion` — that only neutralizes transform/scale/rotate/opacity, not arbitrary non-transform props like `width`, so a reduced-motion user still gets a moving bar. StatCard's `ProgressBar` makes the same mistake (`transition-[width]`), so this is a family-wide gap, but FileUpload's is an explicit Framer `animate` on `width`.
- **Fix:** Animate `scaleX` on a full-width track child (`transform: scaleX(progress/100)`, `transform-origin: left`) so it's compositor-only and respects MotionConfig; or gate the width transition behind `useReducedMotion()`.

### [P1][M1] Error message ships a decorative shake keyframe by default
- **Category:** motion
- **Evidence:** file-upload.tsx:409-411 `animate={{ opacity: 1, x: [0, -4, 4, -4, 4, 0] }} ... transition={{ ... x: { type: 'tween', duration: durations.slow01, ease: 'easeOut' } }}`; and the source comment at :402 `{/* Error message with shake animation */}`
- **Why:** A 5-keyframe horizontal shake on every validation error is the "make it feel alive" reflex — overshoot/motion that doesn't carry meaning beyond what the red text + `role="alert"` already convey. It's bounce-by-default energy (M1 family). It does get reduced by MotionConfig (it's a transform), but it ships on by default with no opt-out.
- **Fix:** Drop the shake; let the alert fade/slide in once (`opacity` + small `y`). If a shake is wanted for hard errors, gate it behind an explicit prop, not the default.

### [P1][G3] Compact mode has no canonical variant/size/color axes — it's a one-off button
- **Category:** vocabulary
- **Evidence:** file-upload.tsx:67-68 `/** Compact mode (inline button instead of drop zone) */ compact?: boolean`; styling hardcoded at file-upload.tsx:244-252 with no `variant`/`size`/`color` prop surface.
- **Why:** Two visually distinct components (drop zone vs inline button) are toggled by a boolean, and the button leg has zero alignment with the canonical Button axes. There's no way to get a `soft` compact button, a `sm` vs `md`, etc. — vocabulary drift from the rest of the system.
- **Fix:** Either compose `<Button>` in compact mode (inherits the axes for free — preferred), or expose `variant`/`size` that map to the canonical taxonomy.

### [P2][M4] No hover or press feedback on the drop zone or compact button
- **Category:** motion
- **Evidence:** Drop zone file-upload.tsx:302-325 — `animate` only reacts to `isDragActive` scale; no `whileHover`/`whileTap` and no `hover:`/`active:` classes. Compact button file-upload.tsx:244-252 has `hover:bg-accent-2` but no press feedback and no `transition` on the bg beyond `transition-colors`.
- **Why:** The drop zone is a primary interactive target with no pointer-hover affordance at all (only fires on drag). The Card bar gives interactive surfaces a hover lift / press. Missing feedback motion (M4).
- **Fix:** Add `whileHover`/`whileTap` (or `hover:bg-surface-raised-hover` + `active:scale-[0.99]`) to the drop zone consistent with `interactive` Card; add `active:` feedback to the compact button.

### [P2][H] No visible focus-visible ring on the drop zone (keyboard focus target)
- **Category:** a11y
- **Evidence:** file-upload.tsx:302-321 — the `role="button" tabIndex={0}` drop zone has no `focus-visible:` class and no `focus-ring`/`outline` utility; the only border change is `data-drag-active`/`isDragActive`.
- **Why:** It's keyboard-focusable and Enter/Space-activatable (file-upload.tsx:307-312) but a keyboard user gets no visible focus indicator beyond the UA default on a `div[role=button]` (often none/weak). Fails focus-visible coverage in the state matrix and is likely invisible in forced-colors.
- **Fix:** Add the DS `focus-ring` / `focus-visible:` utility to the drop zone (and confirm the compact `<button>` keeps a visible ring — it currently relies on UA default).

### [P2][H] No forced-colors / RTL / reduced-motion coverage in stories or tests
- **Category:** state-coverage
- **Evidence:** file-upload.stories.tsx (whole file) — stories cover Default/Compact/WithProgress/WithError/ImageOnly/Multiple/Disabled/CustomLabels but none for forced-colors, RTL, reduced-motion, or the `progress===100` success/checkmark state (file-upload.tsx:339-348). Tests (file-upload.test.tsx) likewise omit the success state and reduced-motion.
- **Why:** The success checkmark branch and the reduced-motion behavior of the width-animated bar are unverified; forced-colors (dashed border + accent fills) and RTL are unaddressed. State-matrix gaps.
- **Fix:** Add a Success story (`progress: 100`), a forced-colors story/snapshot, and assert the width animation respects reduced motion once M5 is fixed.

### [P2][H] `disabled` not propagated to the dropped-files path / drag visuals stay interactive-looking
- **Category:** state-coverage
- **Evidence:** file-upload.tsx:320 `disabled && 'opacity-action-disabled cursor-not-allowed'` is applied, but the drop zone keeps `tabIndex={0}` when disabled (file-upload.tsx:304) and remains focusable; only `onClick` is nulled (file-upload.tsx:306).
- **Why:** A disabled control should be removed from the tab order (or `aria-disabled` + skip activation, which it does for click/keydown but not focus). Half-disabled state.
- **Fix:** When `disabled`, set `tabIndex={-1}` (or `-1` on the role=button) so it leaves the tab order, matching the `aria-disabled` already set.

### [P2][V2] Drop zone pairs a 2px dashed border with a filled surface — borderline double-edge reflex
- **Category:** visual-tell
- **Evidence:** file-upload.tsx:315-317 `'border-2 border-dashed p-ds-08', 'border-surface-border-strong bg-surface-raised-hover'`
- **Why:** A dashed drop-zone border is a legitimate affordance (not a true V2 shadow+border double-edge), so this is soft. But `border-2` (raw width, heavier than the DS `border` token used elsewhere) plus a tinted fill leans toward the "outlined card with its own fill" look. Worth confirming `border-2` is intentional vs the DS border vocabulary.
- **Fix:** Keep dashed (it reads as "drop here"), but use the DS border token/width rather than raw `border-2`, and pair with a flat surface-1 fill (ties into G1).

### [P3][J] No per-component doc; story title is `Patterns/FileUpload` not `UI/`
- **Category:** docs
- **Evidence:** No `packages/core/docs/components/**/file-upload.md` found (Glob empty). file-upload.stories.tsx:6 `title: 'Patterns/FileUpload'`.
- **Why:** Audit unit is declared `layer: ui` but the story files it under `Patterns/`, and there's no standalone doc with a prop table. Minor parity/discoverability gap (props are documented via the JSDoc + autodocs, so not a hard miss).
- **Fix:** Confirm intended layer; if it's `ui`, align the story title. Add/confirm a prop-table doc if the family has them.

### [P3][verbal] JSDoc closing line is filler ("feel free to combine props creatively!")
- **Category:** verbal-tell
- **Evidence:** file-upload.tsx:49 `// These are just a few ways — feel free to combine props creatively!` (also present in card.tsx:110, stat-card.tsx:63 — a copied house tic, and it uses an em-dash connector → brushes E1).
- **Why:** Empty engagement-bait closer (E5) + em-dash tic (E1). It's in the exemplars too, so it's a house pattern rather than this component's fault — flagging for the synthesis sweep, not as a unique defect.
- **Fix:** Drop the line system-wide or replace with a concrete pointer ("See the Card composition recipe for layouts").

## Composability gaps
- **F5 (re-roll):** Compact mode hand-builds a button; should compose `<Button>`. Drop zone re-rolls surface/radius/padding tokens rather than going through a shared primitive.
- **F1 (slot vs prop):** `label`/`sublabel` are string props. Fine for the common case, but there's no slot/`children` escape hatch for rich drop-zone content (e.g. a custom illustration, a list of accepted types as chips) — a consumer must restyle from scratch. Consider a `children` render path or `renderContent` for the body while keeping string props as the default.
- **F6 (controlled/uncontrolled):** `uploading`/`progress`/`error` are fully controlled (good, documented), but there's no internal/uncontrolled progress for the common "fire-and-forget" case. Acceptable given the documented integration model — note, not a defect.
- **No `asChild`** on the compact trigger — minor; composing Button would solve it.

## Motion gaps
- **M5:** progress bar animates `width` (layout prop) and escapes `MotionConfig reducedMotion` — biggest motion issue.
- **M1:** default 5-keyframe error shake (decorative-by-default overshoot energy).
- **M4:** no hover/press feedback on the drop zone (only drag scale); compact button has hover bg but no press.
- **M3 (partial):** component has no self-contained reduced-motion guard; relies entirely on the consumer wrapping in `MotionProvider`/`MotionConfig`. For transform/opacity that's fine (matches the house pattern), but the `width` animation needs an explicit guard since MotionConfig won't catch it.
- Drag-active uses `scale: 1.02` via `springs.snappy` — fine, transform-based, reduced-motion-safe.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the progress bar (M5):** swap `animate={{ width }}` for `scaleX` on a full-width child (`transform-origin:left`), so it's compositor-only and honored by reduced-motion. Apply the same fix to StatCard's ProgressBar for family consistency.
2. **Compose Button in compact mode (F5/G3):** replace the hand-built `<button>` with `<Button variant="outline" size="sm" startIcon={...}>`; drop the bespoke classes. Gains the canonical axes for free.
3. **Correct the drop-zone surface (G1/V2):** resting fill → surface-1 (or the shared input fill), reserve `surface-raised-hover` for hover; use the DS border token instead of raw `border-2`.
4. **Add focus-visible ring + press feedback (H/M4):** DS `focus-ring` on the drop zone; `whileHover`/`whileTap` or `hover:`/`active:` classes; fix disabled `tabIndex`.
5. **Remove the default error shake (M1):** fade/slide the alert in once; gate any shake behind an explicit prop.
6. **Close state coverage (H):** stories/tests for success (progress 100), forced-colors, RTL, reduced-motion; verify disabled leaves tab order.
7. **Docs (J):** reconcile `Patterns/` vs `ui/` title; trim the JSDoc filler closer.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No left/top colored stripe.
- **V3 gradient text:** none.
- **V4 framework palette:** uses semantic tokens (`accent-2/7/9`, `error-11`, `success-11`, `surface-*`) — no raw indigo/violet/slate.
- **V5 emoji-as-icon:** none; uses lucide/tabler via the `Icon` API (`IconUpload`, `IconCheck`, `IconPaperclip`).
- **V6 blob/glass/glow:** none.
- **V7 rounded-everything:** uses `rounded-surface`/`rounded-control`/`rounded-pill` tokens, no `rounded-2xl/3xl` reflex.
- **V8 pill spam / V10 decorative numbering / V12 eyebrow / V14 all-caps:** none.
- **G2 tokens:** spacing/radius/color/opacity all go through DS tokens (`gap-ds-03`, `px-ds-03`, `opacity-action-disabled`) — only `border-2` and the `width` animation are raw-ish.
- **A11y baseline:** hidden `<input type="file">` with `aria-label`, `accept`, `multiple`, `disabled` forwarded; error in `role="alert" aria-live="polite"`; progress bar has full `aria-valuenow/min/max`; drop zone is a keyboard-activatable `role="button"`; axe-clean test present (file-upload.test.tsx:178-184).
- **I types:** clean — `forwardRef<HTMLDivElement>`, `displayName` set, no `any`/`React.FC`, `onFiles: (files: File[]) => void` is properly typed, `Omit<…,'onError'>` is sensible.
- **Verbal (body copy):** error/label strings are plain and direct; no E3 vocabulary, no E2 contrastive negation (the only verbal nit is the shared JSDoc closer, P3).
