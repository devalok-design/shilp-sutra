# ui/alert-dialog — audit

**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:3 P3:1

AlertDialog is a competent Radix wrapper with correct surface tokens, real focus management, AnimatePresence enter/exit, and a controlled/uncontrolled root. It carries **no hard AI visual tells** (no accent rail, no gradient text, no emoji, no framework palette). Its gap from the Card bar is structural: `AlertDialogAction` and `AlertDialogCancel` **re-roll the entire Button CVA by hand** instead of composing `<Button>`, which is the exact drift `Dialog` avoids and the exact thing the StatCard/Card finish bar punishes. It also uses the banned `React.FC` and defaults Cancel to an `outline` look against the design preference.

## Findings

### [P1][F5] Action/Cancel re-roll the Button CVA instead of composing `<Button>`
- **Category:** composability / drift
- **Evidence:** alert-dialog.tsx:178-205 — Action: `'inline-flex h-ds-md items-center justify-center rounded-control px-ds-05 text-ds-md font-semibold transition-colors bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-10 shadow-raised focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 ...'`; Cancel hand-rolls an outline-neutral button (`bg-transparent ... border border-surface-border-strong hover:bg-surface-raised ...`).
- **Why:** This is a second, parallel copy of Button's `solid/accent` and `outline/neutral` styling. Button's own solid/accent is `bg-accent-9 text-accent-fg hover:bg-accent-10 shadow-raised hover:shadow-brand` (button.tsx:60) — already diverged (no `hover:shadow-brand`, an extra `active:bg-accent-10`). The sibling `Dialog` composes real `<Button>` via `asChild` (dialog.tsx:50-51) and has no such drift. Any future Button polish (sizes, focus ring, hover-shadow, disabled saturate) silently skips these two buttons.
- **Fix:** Make Action/Cancel thin `Slot`-based wrappers that default to rendering a `<Button>` (Action = `variant="solid"`, Cancel = `variant="soft" color="neutral"`), the way Dialog uses `<AlertDialogCancel asChild><Button …/></AlertDialogCancel>`. Either render `<Button>` internally or document `asChild` as the supported path and strip the hand-rolled class string. Single source of truth = Button.

### [P1][I] `AlertDialog` root typed as `React.FC`
- **Category:** types
- **Evidence:** alert-dialog.tsx:17 — `const AlertDialog: React.FC<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>> = ({ … }) => {`
- **Why:** Rubric I bans `React.FC` (implicit `children`, awkward generics, no static defaultProps story). `Dialog` ships the identical anti-pattern (dialog.tsx:66) so this is a family-wide tell, but it's still a tell.
- **Fix:** Drop `React.FC`; type as a plain function: `function AlertDialog(props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) { … }` with an explicit `children` in the props type.

### [P1][G5] Cancel defaults to an `outline` look, not `soft`
- **Category:** vocabulary / drift
- **Evidence:** alert-dialog.tsx:200 — Cancel = `bg-transparent text-surface-fg-muted border border-surface-border-strong hover:bg-surface-raised …` (a bordered-transparent / outline button).
- **Why:** CLAUDE.md design preference (rubric G5): non-primary actions default to `variant="soft"`, not `outline`. Cancel sits on the surface-overlay panel (a surface, not a colored/raised bg and not an icon-dense toolbar), so none of the outline exceptions apply. The outline border next to the solid Action also reads as the "double-weight" outline look the studio moved away from.
- **Fix:** Default Cancel to soft-neutral (`bg-surface-raised-hover text-surface-fg-muted hover:bg-surface-raised-active`, matching Button's `soft/neutral`, button.tsx:71). Folds naturally into the F5 fix (compose `<Button variant="soft" color="neutral">`).

### [P1][F1] Destructive (error) action requires hand-passing `className` — no `color` slot
- **Category:** composability / state-coverage
- **Evidence:** alert-dialog.stories.tsx:102 — `<AlertDialogAction className="bg-error-9 text-accent-fg hover:bg-error-9">Delete`; doc gotcha llms-full.txt:450 — "AlertDialogAction does NOT have color='error' styling — add it yourself via className."
- **Why:** The single most common AlertDialog use is a *destructive* confirm, yet the component has no `color` axis for it — consumers paste raw `bg-error-9` strings (the story even sets a broken `hover:bg-error-9` no-op and the wrong `text-accent-fg`). That's exactly the re-roll the canonical `color` axis (G3) exists to prevent.
- **Fix:** Once Action composes Button, `color` comes for free (`<AlertDialogAction color="error">`). Document the destructive pattern with the real `color` prop, delete the raw-class story.

### [P2][M3] Slide/scale entrance has no component-level reduced-motion guard
- **Category:** motion
- **Evidence:** alert-dialog.tsx:96-103 — `initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x:'-50%', y:'-50%' }} … transition={springs.smooth}`. No `useReducedMotion()` (cf. button.tsx:6 which imports it; this file does not).
- **Why:** Reduced-motion is honored *only* if a consumer mounts `MotionProvider`/`MotionConfig` (motion-provider.tsx:39). With no provider, the full-height mobile slide and desktop scale-in play regardless of OS preference. Button guards itself directly; this overlay leans entirely on ambient config.
- **Fix:** Either read `useReducedMotion()` locally and collapse to an opacity-only fade when reduced (the `tweens.fade` overlay is already motion-safe), or document MotionProvider as a hard requirement. Prefer the local guard so the component is correct standalone.

### [P2][M5] Mobile entrance animates `y: '100%'` (percentage transform on a layout dimension)
- **Category:** motion
- **Evidence:** alert-dialog.tsx:97-99 — `initial={{ y: '100%' }} … exit={{ y: '100%' }}` on the full-bleed mobile sheet.
- **Why:** Borderline M5. It's a `transform: translateY` (GPU-friendly, not animating `top`/`height`), so not a hard violation — but `100%` is resolved against the element's own box, and on a full-screen `inset-0` panel that's a large composited layer sliding the full viewport height every open/close. Acceptable, flagging for awareness; Sheet/BottomSheet do the same so it's a family convention.
- **Fix:** None required. If perf shows up on low-end mobile, cap the slide distance (e.g. `y: 24` + fade) instead of full-height.

### [P2][J] No per-component doc page; story coverage thin on states
- **Category:** docs / state-coverage
- **Evidence:** no `packages/core/docs/components/**/alert-dialog.md` (Glob: no files). Stories (alert-dialog.stories.tsx) cover Default, MobileResponsive, Destructive only — no disabled-action, no loading/async-confirm, no long-content scroll, no RTL/forced-colors story.
- **Why:** Rubric J wants per-component doc + state coverage in stories. The async-confirm + disabled pattern is real (ConfirmDialog composes this and exposes `loading`), but AlertDialog's own stories never show a disabled or pending Action.
- **Fix:** Add a doc page (or confirm llms-full.txt is the intended single source) and a `Pending`/`DisabledAction` story so the disabled + `aria-disabled` path is demonstrated.

### [P3][G2] Action hardcodes `h-ds-md` / `px-ds-05` / `shadow-raised` rather than inheriting Button's size system
- **Category:** drift
- **Evidence:** alert-dialog.tsx:185 & 200 — both buttons pin `h-ds-md … px-ds-05 … shadow-raised`.
- **Why:** Locks the buttons to one size with no size axis; duplicates token choices that Button already owns per-size (button.tsx:46). Subsumed by the F5 fix (compose Button → inherit `size`).
- **Fix:** Resolved by composing Button.

## Composability gaps
- **Action/Cancel duplicate Button instead of composing it (F5).** Two hand-maintained button stylings that have already drifted from Button (missing `hover:shadow-brand`, extra `active:bg-accent-10`, wrong `text-accent-fg` in the error story). Dialog's `asChild` + `<Button>` pattern is the bar.
- **No `color` axis for the destructive case (F1).** The most common AlertDialog (delete confirm) forces raw `className` injection. Should be `<AlertDialogAction color="error">`.
- **Cancel defaults to outline, not soft (G5).** Off the studio default for non-primary actions.
- Header/Footer/Title/Description are correct slot wrappers (parity with Dialog) — no gap there.
- Controlled/uncontrolled root is correct (F6 clean): supports `open`, `defaultOpen`, `onOpenChange` with proper internal-state fallback (alert-dialog.tsx:23-33).

## Motion gaps
- **No component-level reduced-motion guard (M3).** Correct behavior depends on an ambient `MotionConfig`; standalone it animates regardless of OS preference. Button guards itself locally — this should too.
- Enter/exit differentiation is present and intentional (overlay = `tweens.fade`, panel = `springs.smooth` with opacity overridden to a fade) — M1/M2 clean, no bounce/overshoot on a confirmation surface (correct restraint).
- `y: '100%'` full-height mobile slide is a transform (not a layout prop) — M5 borderline-clean, noted.

## Polish plan (ordered steps to reach the finish bar)
1. **Compose Button.** Rewrite `AlertDialogAction` / `AlertDialogCancel` to render `<Button>` internally (or as documented `asChild` wrappers around the primitive), defaulting Action → `variant="solid" color="accent"` and Cancel → `variant="soft" color="neutral"`. Delete both hand-rolled class strings. Kills F5, G5, G2, P3 in one move and gives `color`/`size` for free.
2. **Expose the destructive path (F1).** With Button composed, support `<AlertDialogAction color="error">`; update the doc gotcha and replace the raw-`className` story.
3. **De-`React.FC` the root (I).** Plain typed function with explicit `children`.
4. **Local reduced-motion guard (M3).** `const reduced = useReducedMotion()`; when reduced, drop the panel to an opacity fade (reuse the overlay's `tweens.fade`).
5. **Docs + state stories (J).** Add a per-component doc page (or confirm llms-full.txt is canonical) and a `DisabledAction`/`Pending` story demonstrating `disabled` + `aria-busy`.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no border+shadow double edge (`shadow-overlay` carries its own ring, panel has no border), no gradient text, no framework palette (`accent-9`, `surface-overlay`, semantic tokens throughout), no emoji, no blob/glass, single radius (`rounded-overlay-lg`), no pill spam.
- **V9–V15 reflexes:** clean — no hardcoded fonts, no decorative numbering, no eyebrow kicker, no AI imagery.
- **E1–E8 verbal:** doc/story/JSDoc copy is direct and free of AI vocabulary, em-dash tics, and hedging.
- **G1 surface:** correct — overlay component legitimately uses `bg-surface-overlay` / `bg-overlay` (overlays are the documented surface-1 exception).
- **A11y / state-coverage core:** real `alertdialog` role via primitive, focus lands on Cancel (safe default), `focus-visible:ring-2` on both buttons, `disabled:pointer-events-none` + `disabled:opacity-action-disabled`, axe-clean test (alert-dialog.test.tsx:108).
- **F6 controlled/uncontrolled:** correct dual-mode root.
- **Types:** `AlertDialogContentProps`/`ActionProps`/`CancelProps` exported; refs forwarded with correct `ElementRef`; no `any`. (Only `React.FC` flagged.)
