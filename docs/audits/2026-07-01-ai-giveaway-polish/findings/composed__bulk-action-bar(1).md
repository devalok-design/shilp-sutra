# composed/bulk-action-bar — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:5 P3:2

Visually clean — no accent rail, no gradient, no emoji, all spacing/radius/shadow/color via tokens, correct overlay surface. The gap from the Card bar is almost entirely **composability** (it's a config-object API, not a slotted compound) and a few **state-coverage / a11y** edges in the roving-focus + nested-button machinery. Tests and a story exist; no per-component doc.

## Findings

### [P1][F1] Actions are a bespoke config array, not composable slots
- **Category:** composability
- **Evidence:** bulk-action-bar.tsx:19-29 — `interface BulkActionBarAction { label; icon?; onClick; color?: 'accent'|'error'; disabled?; requiresConfirmation?; confirmMessage? }`; consumed at :199 `actions.map(...)`
- **Why:** The whole interactive surface is injected through a serialized object array instead of children. A consumer can't drop in a `<Select>`, a divider, a custom button variant, a tooltip-wrapped action, or anything the `BulkActionBarAction` shape doesn't anticipate. This is the exact "bespoke prop where a slot belongs" pattern the Card bar moved away from (`CardAction` slot vs. old corner props). The action `color` is also limited to `'accent' | 'error'` — no `success`/`warning`/`neutral`, no `variant` control — so the array can never express what `<Button>` already supports.
- **Fix:** Offer a compound/slot API: `<BulkActionBar.Root show count onClear>`, `<BulkActionBar.Count>`, `<BulkActionBar.Actions>{children}`, `<BulkActionBar.SelectAll>`. Let consumers pass real `<Button>`/`<IconButton>` children. Keep the `actions` array as a convenience shorthand if desired, but the primitive should accept children.

### [P1][F2] No `asChild` / no real Button composition for confirmation affordance
- **Category:** composability
- **Evidence:** bulk-action-bar.tsx:86-107 — `ActionButton` wraps `<Button>` in a `motion.div` and forces `variant="ghost"`, `tabIndex={-1}` on the inner button; confirm UI at :64-81 hardcodes `variant="solid" color="error"` + `variant="ghost"`.
- **Why:** Consumers cannot polymorph an action into a link (`<a>`/router Link) — a bulk action that navigates (e.g. "Export → download URL") is impossible. The component re-rolls the button variant decisions instead of letting them flow through. There's no path to render an action `asChild`.
- **Fix:** When moving to a slot API, let action children be any element (Button supports `asChild`). For the shorthand array, add `href?` / `as?` or accept a `render` escape hatch.

### [P1][H] Roving tabindex lives on a wrapper `<div>`, real button is `tabIndex={-1}` — focus reaches a non-actionable element
- **Category:** a11y / state-coverage
- **Evidence:** bulk-action-bar.tsx:47 `ActionButton = React.forwardRef<HTMLDivElement, ...>`; :93 `tabIndex={tabIndex}` on the `motion.div`; :102 `tabIndex={-1}` on the inner `<Button>`. Focus is moved with `actionRefs.current[next]?.focus()` (:150) onto the wrapper div.
- **Why:** Arrow-key navigation focuses the **wrapper div**, not the button. The wrapper has no `role`, no label, no key handler to activate — pressing Enter/Space on the focused div does nothing (the `<button>` underneath has `tabIndex=-1` and never receives the key). So keyboard users can move the focus ring across actions but cannot invoke them by keyboard. The roving-tabindex toolbar pattern requires the tabbable element to BE the actionable control.
- **Fix:** Put the roving `tabIndex` on the real `<Button>` (forward a ref to the button, not a div), or have the wrapper forward Enter/Space to the inner button's click. Verify with a keyboard-activation test (currently no test covers arrow-then-Enter).

### [P1][H] `requiresConfirmation` flow has no `aria-live` / focus management
- **Category:** a11y / state-coverage
- **Evidence:** bulk-action-bar.tsx:50-83 — on confirm, the button is swapped for `"Are you sure?" + Confirm + Cancel`; the confirm region has no `role="alertdialog"`/`aria-live`, and focus is not moved to the Confirm button.
- **Why:** A screen-reader user clicks "Delete", the button silently morphs into a confirm prompt, focus stays where it was (or is lost — the original button unmounted), and nothing is announced. The destructive confirmation — the whole point of the feature — is invisible to AT.
- **Fix:** Wrap the confirm cluster in `role="group"` with an `aria-live="assertive"` message, and move focus to the Confirm button on open (and back to a stable element on cancel).

### [P2][M2] Every motion uses the same `springs.snappy` — no enter/exit or distance differentiation
- **Category:** motion
- **Evidence:** bulk-action-bar.tsx:56,91 (`transition={springs.snappy}` on each ActionButton), :177 (bar `transition={springs.snappy}` for a 100px slide). All identical.
- **Why:** The bar travels 100px (a large entrance) on the same spring as a per-button opacity/scale micro-flip. Rubric M2 — uniform timing reads robotic. Card differentiates (`springs.snappy` for hover-lift vs `springs.smooth` for larger value reveal in StatCard).
- **Fix:** Use `springs.smooth` for the bar's 100px entrance/exit and keep `snappy` for the per-action micro-feedback.

### [P2][M5] Bar pins position with `left-1/2 -translate-x-1/2` then animates `y` — fine — but the per-action `AnimatePresence mode="popLayout"` animates layout on a row whose items change
- **Category:** motion
- **Evidence:** bulk-action-bar.tsx:198 `<AnimatePresence mode="popLayout">` around `actions.map`; ActionButton confirm/normal swap (:50 vs :86) unmounts/mounts on every confirm toggle.
- **Why:** `popLayout` triggers layout animation of sibling actions whenever one enters confirm mode (it grows to "Are you sure? Confirm Cancel"). With no `layout` transition tuned and reduced-motion not locally guarded, the neighbors jump. Borderline — it IS using popLayout intentionally — but the confirm-swap is an unmount/remount, not a stable element, so exit/enter fire on a state toggle, not a list change.
- **Fix:** Keep the ActionButton mounted across confirm/normal (conditional inner content, stable outer node) so `popLayout` only animates genuine add/remove of actions.

### [P2][M3] No local reduced-motion guard; relies entirely on a consumer-provided `MotionConfig`
- **Category:** motion
- **Evidence:** bulk-action-bar.tsx — no `useReducedMotion`; entrance `y:100` (:174), `whileTap`-style scale flips. Compare: stat-flash.tsx / spinner.tsx read reduced motion.
- **Why:** If no `MotionProvider`/`MotionConfig` wraps the app, the 100px slide and scale pops run at full amplitude for users who asked for reduced motion. Card's hover-lift has the same systemic dependency, so this is a shared-system gap, not unique slop — but flagging per rubric M3.
- **Fix:** Either document that `MotionProvider` is required, or read `useReducedMotion()` and swap the 100px slide for a plain fade when reduced.

### [P2][H] No empty / zero-action coverage shown; `count={0}` path undefined-by-design
- **Category:** state-coverage
- **Evidence:** bulk-action-bar.tsx:143 `if (count === 0) return` (keyboard nav guard) but the bar still renders the `<Badge>{count} selected</Badge>` and clear button even with an empty `actions` array; no story/test for `actions={[]}` or `count={0}` while `show`.
- **Why:** Rubric H wants empty state handled + shown. An empty actions array renders an action row containing nothing between Badge and clear-X — visually a dead gap. Untested.
- **Fix:** Hide the actions `<div>` when `actions.length === 0`; add a story/test.

### [P2][F6/types] `show` is controlled-only and `BulkActionBarProps` is a flat 7-prop object that does not extend `HTMLAttributes`
- **Category:** composability / types
- **Evidence:** bulk-action-bar.tsx:31-41 — `interface BulkActionBarProps { show; count; onClearSelection; actions; totalCount?; onSelectAll?; className? }`. No `forwardRef`, no `...HTMLAttributes` spread (only `className` is plumbed); function component (:114), `BulkActionBar.displayName` set on a plain function.
- **Why:** Consumers can't pass `id`, `data-*`, `aria-*` overrides, `style`, or a `ref` to the toolbar — the test even has to `skip: ['className','ref','attrs']` in conformance (bulk-action-bar.test.tsx:27), which documents the gap rather than fixing it. The roster of bespoke props is the F3 "flat config object" smell.
- **Fix:** `forwardRef`, extend `Omit<React.HTMLAttributes<HTMLDivElement>, ...>`, spread remaining props onto the toolbar. (Aligns it with Card/StatCard which both extend HTMLAttributes.)

### [P3][J] No per-component doc; story coverage is thin
- **Category:** docs / state-coverage
- **Evidence:** No `packages/core/docs/components/**/bulk-action-bar.md` (glob empty). Stories (bulk-action-bar.stories.tsx) cover only Default + WithErrorAction — no Select-all, no confirmation, no disabled action, no many-actions overflow, no RTL/forced-colors story.
- **Why:** Rubric J — public component should have a doc + stories demonstrating the state matrix. Confirmation and Select-all are the differentiated features and neither is shown in a story.
- **Fix:** Add stories for confirmation, select-all, disabled, and a long action list; add/point to a doc with the prop table.

### [P3][G3] Action `color` axis is `'accent' | 'error'` only — off the canonical color taxonomy
- **Category:** vocabulary / drift
- **Evidence:** bulk-action-bar.tsx:23 `color?: 'accent' | 'error'`; mapped at :98 `color={action.color === 'error' ? 'error' : 'accent'}`.
- **Why:** Canonical color axis is `accent/neutral/success/warning/error/info`. This truncates it to two, so a "success/approve" bulk action can't be tinted. Minor because the set is deliberate for the pattern, but it's narrower than the system vocabulary without justification.
- **Fix:** Widen to the Button color union (or document why only two are allowed).

## Composability gaps
- Config-object API (`actions: BulkActionBarAction[]`) instead of slotted children — the central gap (F1). No way to inject arbitrary controls (dividers, selects, tooltips).
- No `asChild` on actions → bulk actions can't be links/router navigations (F2).
- Not `forwardRef` and doesn't spread `HTMLAttributes` — only `className` is honored; `ref`/`attrs` explicitly skipped in conformance (F6/types).
- Confirmation UI and Select-all are baked-in fixed layout rather than composable slots.
- Action `color` truncated to 2 of 6 canonical colors; no per-action `variant`.

## Motion gaps
- Uniform `springs.snappy` for both the 100px bar entrance and per-button micro-flips (M2) — large travel should use `springs.smooth`.
- `AnimatePresence mode="popLayout"` operates over ActionButtons that unmount/remount on the confirm toggle, so layout/exit animations fire on a state change, not a list change (M5-adjacent jank).
- No local `useReducedMotion` guard; full reliance on a consumer `MotionConfig` (M3).
- No hover/press feedback distinct from the shared spring; clear-X and Select-all have only Button's built-in feedback (acceptable, but undifferentiated).

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the keyboard trap (P1, H):** move roving `tabIndex` onto the real `<Button>` (forward ref to the button), or forward Enter/Space from the wrapper. Add an arrow-then-Enter activation test.
2. **Make the confirmation accessible (P1, H):** `role="group"` + `aria-live` on the confirm cluster, move focus to Confirm on open, restore on cancel.
3. **forwardRef + HTMLAttributes spread (P1, F6):** so `ref`/`id`/`data-*`/`aria-*` work; remove the conformance skips for `ref`/`attrs`.
4. **Introduce a slot/compound API (P1, F1/F2):** accept `<Button>`/`<IconButton>` children; keep the `actions` array as a shorthand. Widen action `color` to the canonical union and allow `asChild`.
5. **Differentiate motion (P2, M2/M5):** `springs.smooth` for the bar slide, `snappy` for action micro-feedback; keep ActionButton mounted across confirm to stabilize `popLayout`.
6. **Empty-state + reduced-motion (P2):** hide the actions row when empty; add local reduced-motion fallback or document the `MotionProvider` requirement.
7. **Docs + stories (P3, J):** add confirmation / select-all / disabled / long-list / RTL / forced-colors stories and a prop-table doc.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No `border-l-*`/`border-t-*` color stripe.
- **V2 double edge:** bar uses `shadow-floating` with no border — single edge. Clean.
- **V3 gradient text / V4 framework palette:** none; uses semantic `accent`/`error` tokens, no raw indigo/violet/slate.
- **V5 emoji:** none — uses `@tabler/icons-react` via the Icon API (`IconX`, `IconArchive`, etc.).
- **V6 blob/glass/glow, V7 rounded-everything (`rounded-surface`), V8 pill spam (one `<Badge>`):** clean.
- **G1 surface:** `bg-surface-overlay` on a fixed floating toolbar is correct per the layering rule (overlays/floating toolbars = surface-1/overlay tier). Not a card-on-surface-1 violation.
- **G2 tokens:** spacing (`gap-ds-04`, `px-ds-05`, `py-ds-03`, `bottom-ds-06`), radius (`rounded-surface`), shadow (`shadow-floating`), z (`z-sticky`) all tokenized. No dead TW4 syntax.
- **E1–E8 verbal:** copy is minimal and direct ("{n} selected", "Select all", "Are you sure?", "Confirm", "Cancel", "Clear selection") — no AI vocabulary, no em-dash tic, no hedging.
- **Escape-to-clear** keyboard handler (:137) is a nice intentional touch.
- **a11y baseline:** `role="toolbar"` + `aria-label`, axe-clean test passes, clear button has `aria-label`. (The deeper roving-focus + confirm gaps above are beyond what axe catches.)
