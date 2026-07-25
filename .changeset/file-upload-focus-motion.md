---
"@devalok/shilp-sutra": patch
---

fix(file-upload): focus-visible ring + motion hygiene (audit)

No API change — a11y + motion fixes.

- **a11y (P0):** the keyboard-operable `role="button"` drop zone now has the DS
  `focus-ring` — a `div[role=button]` gets no usable UA focus outline, so keyboard
  users had no visible focus (WCAG 2.4.7).
- **a11y (P1):** the disabled drop zone is `tabIndex={-1}` (leaves the tab order) to
  match its `aria-disabled` — it was still focusable while disabled.
- **motion (P1):** the progress bar animates `scaleX` on a full-width child
  (`transform-origin: left`) instead of `width` — compositor-only and honored by
  `prefers-reduced-motion` (a `width` animation slips past `MotionConfig`).
- **motion (P1):** removed the default 5-keyframe error shake; the alert now fades/
  slides in calmly.
- **visual (P2):** the drop zone rests on `bg-surface-base` and tints on hover — the
  hover token was being used at rest; adds real hover feedback.

Follow-up (not in this change): compose the compact variant on `<Button>`.
