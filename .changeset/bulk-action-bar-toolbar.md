---
"@devalok/shilp-sutra": minor
---

fix(bulk-action-bar): ARIA toolbar keyboard model + a11y + composability (audit)

Non-breaking (additive props). Fixes the P0 keyboard trap + P1/P2 gaps.

- **a11y (P0):** roving `tabIndex` now sits on the real `<Button>`s, not a wrapper
  `<div>`, so keyboard users can **activate** actions (Enter/Space), not just move
  the ring past them. Single tab stop with Arrow/Home/End roving across ALL controls
  (Select-all, actions, Clear) per the ARIA Toolbar model. Locked by a new
  arrow-then-Enter regression test.
- **a11y (P1):** inline confirmation is `role="group"` + `aria-live="assertive"`;
  focus moves to Confirm on open and restores to the action on Cancel/Escape.
- **RTL (P1):** logical positioning (`start-1/2`) + Arrow Left/Right mirrored under
  `dir="rtl"`.
- **api (P1):** `forwardRef` + spreads `HTMLAttributes`; action `color` widened to
  the full Button union (`accent | error | success | warning | info | neutral`) —
  was 2 of 6. New additive `loading` per-action pending spinner.
- **motion (P2):** `springs.smooth` for the slide + `useReducedMotion` guard
  (opacity-only under `prefers-reduced-motion`).
- **docs:** prop table corrected to match source (`icon = IconInput`, full color
  union, `totalCount`/`onSelectAll`/`loading`/confirm props).
