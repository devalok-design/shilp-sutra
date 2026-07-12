---
"@devalok/shilp-sutra": minor
---

**ScheduleView cleanup.**

- **BREAKING (breaking-minor):** the `ScheduleEvent.color` value `"primary"` was renamed `"accent"` to match the DS colour vocabulary used everywhere else. Migrate `{ color: 'primary' }` → `{ color: 'accent' }` (it was also the default, so untyped events are unaffected).
- **a11y:** the time-slot cells and event blocks now show a focus-visible ring (they had hover states but no keyboard-focus indicator).
- The hand-rolled current-time indicator dot now uses the shared `<Dot color="error" pulse>` (drops a bespoke scale-bounce animation).
