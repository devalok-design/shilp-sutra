---
"@devalok/eslint-plugin-shilp-sutra": minor
---

New rule `require-progress-label`: statically catches `<Progress>` usage with no accessible name (`aria-label`, `aria-labelledby`, or `label`), the same condition the component itself already warns about at runtime in dev. Added to the `recommended` (`warn`) and `strict` (`error`) presets, legacy and flat.
