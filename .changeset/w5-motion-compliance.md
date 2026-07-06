---
"@devalok/shilp-sutra": patch
---

Motion compliance pass (anti-convergence v1.1 motion rules / locked decision B "settle, don't bounce").

- **Reduced-motion guards (2):** the avatar online-status dot and the deadline-indicator overdue/critical state animate a continuous opacity pulse (`repeat: Infinity`). These are non-transform loops that framer's global `MotionConfig reducedMotion="user"` cannot stop, so they now self-guard with `useReducedMotion()` — reduced-motion users get the static variant (colour still signals status/urgency). No change for everyone else.
- **Spring-overshoot retunes (6):** resting-state indicators that popped with `springs.bouncy` (ζ≈0.53, visible overshoot) now settle — radio dot and filter count → `springs.snappy`; count badge, avatar badge, and stat-card delta → `springs.smooth` (matching the delta's sibling, which was already smooth); multi-select selection check → `springs.snappy`.

Deliberate-moment pops (toast completion icons, upload-success check, devadoot celebration) and gesture-following springs (segmented-control slider, attachment-strip layout) keep `bouncy` — the rule's allowed exceptions. Non-breaking (no API change).
