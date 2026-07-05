# composed/confirm-dialog — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:4 P3:1

ConfirmDialog is a thin convenience wrapper over the AlertDialog primitive. Visually it is clean — no rails, gradients, emoji, blobs, or framework-palette tells, because it inherits all surface/motion from `AlertDialogContent`. It composes the base primitive correctly (F5 clean), which is the big thing StatCard taught. The gaps are all in the wrapper's own API surface: a hardcoded "Processing..." loading string with no `aria-busy`/spinner, the Cancel button reaching for `outline` instead of `soft`, a fully-bespoke prop API with no slot escape hatch, a forced-controlled `open` (no `defaultOpen`), and a missing per-component doc.

## Findings

### [P1][G5] Cancel button defaults to `variant="outline"` instead of `soft`
- **Category:** vocabulary / drift
- **Evidence:** confirm-dialog.tsx:63 — `<Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>`
- **Why:** CLAUDE.md design preference: non-primary actions default to `soft`, with `outline` reserved for colored/raised bg or icon-dense toolbars. The dialog footer sits on a plain overlay surface — none of the outline exceptions apply.
- **Fix:** `variant="soft" color="neutral"` for Cancel. Soft reads warmer and gives a cleaner hierarchy next to the solid confirm.

### [P1][H] Loading state sets no `aria-busy` and gives no async-status to AT
- **Category:** a11y / state-coverage
- **Evidence:** confirm-dialog.tsx:62-76 — buttons get `disabled={loading}` but neither the content nor the confirm button carries `aria-busy`; the text swap `{loading ? 'Processing...' : confirmText}` is not announced via `aria-live`.
- **Why:** Rubric H requires loading → `aria-busy`, async → `aria-live`. A screen-reader user clicking confirm gets silence while the promise resolves; the only signal is a silent label swap.
- **Fix:** add `aria-busy={loading}` on `AlertDialogContent` (or the confirm Button), and render the loading text inside an `aria-live="polite"` region or rely on a Spinner with `aria-label`.

### [P1][M4] Loading uses a hardcoded text swap, no spinner / feedback motion
- **Category:** motion / state-coverage / verbal-tell
- **Evidence:** confirm-dialog.tsx:75 — `{loading ? 'Processing...' : confirmText}`
- **Why:** The DS ships a `Spinner` and Button has a `loading` prop with built-in spinner + `aria-busy` motion. Re-rolling the loading affordance as a literal string ("Processing...") is the AI-default convenience pattern, drops the system's intentional feedback motion (M4), and hardcodes English copy.
- **Fix:** use Button's own `loading` prop (`<Button loading={loading} …>{confirmText}</Button>`) so you inherit the spinner, `aria-busy`, and disabled handling — delete the manual `disabled={loading}` + text swap.

### [P1][F6] Forced-controlled `open`; no `defaultOpen` / uncontrolled mode
- **Category:** composability
- **Evidence:** confirm-dialog.tsx:18-20 — `open: boolean` + `onOpenChange` both required; the underlying `AlertDialog` (alert-dialog.tsx:17-33) fully supports uncontrolled `defaultOpen`, but the wrapper hides it.
- **Why:** Rubric F6 — supports controlled but not uncontrolled. The base primitive offers both; the wrapper narrows it to controlled-only with no reason, forcing every consumer to wire `useState`.
- **Fix:** make `open`/`onOpenChange` optional and pass through `defaultOpen`, or document that this wrapper is intentionally controlled-only (it is a reasonable choice for a confirm flow, but should be deliberate, not accidental).

### [P2][F1/F4] Fully bespoke prop API with no slot escape hatch
- **Category:** composability
- **Evidence:** confirm-dialog.tsx:16-35 — `title: string`, `description: string`, `confirmText`, `cancelText`, `onConfirm` are all bespoke string/handler props; there is no `children`/slot to inject custom footer content, a checkbox ("don't ask again"), or a rich description.
- **Why:** Card-bar pattern is slots over corner-props (F1). A confirm wrapper that only accepts plain strings can't render a list of affected items, a warning callout, or an extra action without forking the component.
- **Fix:** keep the string convenience props but accept optional `children` (rendered in place of `description`) and/or a `footer`/`extraActions` slot. At minimum allow `description?: React.ReactNode`.

### [P2][I] `extends ComponentPropsWithoutRef<'div'>` but spreads onto AlertDialogContent
- **Category:** types
- **Evidence:** confirm-dialog.tsx:16 — `extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'>`; line 56 spreads `{...props}` onto `<AlertDialogContent>` whose element is the Radix Content (a `motion.div`), not a bare `div`. `ref` is typed `HTMLDivElement` (line 37) but forwarded to `AlertDialogContent` whose ref is `ElementRef<typeof AlertDialogPrimitive.Content>`.
- **Why:** Type surface advertises raw div attributes the wrapper doesn't actually own; `AlertDialogContent` also accepts a `responsive` prop that this type does not expose, so a useful prop is unreachable through the wrapper.
- **Fix:** extend `Omit<AlertDialogContentProps, 'children'>` (and keep `Omit<…, 'color'>`) so the type matches what `{...props}` actually lands on, exposing `responsive` for free and fixing the ref element type.

### [P2][H] No focus management / initial-focus assertion; loading state untested for a11y
- **Category:** state-coverage / a11y
- **Evidence:** confirm-dialog.test.tsx:1-74 — tests cover open/labels/confirm/cancel/loading-text/closed, but none assert focus lands somewhere sane on open, none run `axe`, and the loading test (line 61-68) only checks the text + disabled, not `aria-busy`.
- **Why:** Rubric H matrix — focus-visible, loading+aria-busy, and axe-clean are expected for an interactive overlay. The destructive variant especially should verify the confirm isn't the auto-focused element (avoid accidental-Enter destruction).
- **Fix:** add an `expect(axe).toHaveNoViolations()` test and a focus assertion; once Button `loading` is adopted, assert `aria-busy`.

### [P2][J] No per-component doc + thin JSDoc (no `@example`, no prop guidance)
- **Category:** docs
- **Evidence:** no file at `packages/core/docs/components/**/confirm-dialog.md` (Glob: no match). Source has only one-line `/** … */` per prop and no component-level JSDoc block with examples — contrast Card/StatCard's multi-`@example` headers.
- **Why:** Rubric J — per-component doc + accurate prop table is part of the finish bar; the exemplars carry rich JSDoc that feeds llms-full.txt and make-kit.
- **Fix:** add a component-level JSDoc block with 3-4 `@example`s (default, destructive, async-loading) and a doc page or make-kit entry.

### [P3][E1] Em-dash as stylistic connector in JSDoc
- **Category:** verbal-tell
- **Evidence:** confirm-dialog.tsx:33 — `Dialog stays open — consumer controls closing via onOpenChange.`
- **Why:** Rubric E1 — `—` as a stylistic connector is an AI-prose tic. (Minor; doc-only string.)
- **Fix:** rephrase: "Dialog stays open; the consumer controls closing via onOpenChange." or split into two sentences.

## Composability gaps
- No `children`/description slot — description is `string`-only, so no rich content (lists of affected items, callouts, "don't ask again" checkbox) without forking. (F1)
- No `footer` / `extraActions` slot — the two-button footer is fixed; a third action (e.g. "Save draft") is impossible. (F4)
- Forced controlled `open`; `defaultOpen` from the base primitive is hidden. (F6)
- `responsive` prop on `AlertDialogContent` is unreachable because the wrapper's prop type extends `'div'` instead of `AlertDialogContentProps`.
- Re-rolls the loading affordance (manual `disabled` + text swap) instead of composing Button's `loading` prop — same class of "re-roll instead of compose" that StatCard fixed for surface. (F5-adjacent)

## Motion gaps
- Entrance/exit, reduced-motion, and transform-based animation are all inherited correctly from `AlertDialogContent` (alert-dialog.tsx:79-117) — no gap there. M1/M2/M3/M5 clean.
- M4: confirm's loading transition is a bare text swap with no spinner/feedback motion. Adopting Button `loading` restores intentional micro-feedback.

## Polish plan (ordered steps to reach the finish bar)
1. Swap Cancel to `variant="soft" color="neutral"` (G5).
2. Replace the manual `disabled={loading}` + `{loading ? 'Processing...' : confirmText}` with Button's `loading` prop on the confirm button; drop the hardcoded string. This fixes M4 and the `aria-busy` gap (H) in one move.
3. Add `aria-busy={loading}` on `AlertDialogContent` for the whole-dialog busy signal.
4. Change the prop type to `Omit<AlertDialogContentProps, 'children' | 'color'>` so `{...props}` and `ref` are correctly typed and `responsive` is exposed (I).
5. Allow `description?: React.ReactNode` and add an optional `children`/footer slot for rich content + extra actions (F1/F4).
6. Decide controlled-vs-uncontrolled: either pass through `defaultOpen` or document controlled-only intent (F6).
7. Add a component-level JSDoc block with `@example`s + a doc/make-kit entry (J); fix the em-dash (E1).
8. Add an axe test + focus assertion; assert `aria-busy` once Button loading is adopted (H).

## Clean (rubric dims that pass)
- **V1–V15 visual tells:** none. No accent rail, double edge, gradient text, framework palette, emoji, blob/glass/glow, rounded-everything, or pill spam. All surface/radius/shadow inherited from `AlertDialogContent` via DS tokens.
- **F5 (compose the base primitive):** PASS — composes `AlertDialog`/`AlertDialogContent`/`Header`/`Footer`/`Title`/`Description`; does not re-roll the overlay surface, padding, or elevation. This is the headline win.
- **G1 surface:** PASS — overlay uses `bg-surface-overlay` (correct level for a modal) via the primitive.
- **G2 tokens:** PASS — no hardcoded px/hex/shadow in the wrapper; spacing/radius come from the primitive.
- **G3 variant axis:** `color` limited to `accent | error` is an intentional semantic narrowing for a confirm action (accent = normal, error = destructive) — a reasonable choice, not drift.
- **M1/M2/M3/M5 motion:** PASS — inherited intentional spring/fade entrance+exit, mobile slide-up, reduced-motion honored via MotionConfig at consumer; no layout-prop animation.
- **forwardRef + displayName:** present (confirm-dialog.tsx:37, 83).
- **Stories:** Default + Destructive exist with interaction `play` tests (publish gate met).
- **E2–E8 verbal:** clean apart from the single em-dash (E1).
