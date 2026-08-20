---
"@devalok/shilp-sutra": patch
---

fix three colour-contrast failures found by resolving real component pairs against their actual backgrounds

**Alert's dismiss button was effectively invisible on solid variants.** It was `text-surface-fg-subtle` regardless of variant, so on a saturated step 9 fill it measured 1.07:1 on info, 1.04:1 on error and **1.01:1 on success**, which is no contrast at all. It now inherits the alert's own foreground on solid, exactly as the title and body already do, and measures 4.66 to 7.76 across the five intents.

**Badge category labels failed AA in dark mode.** The seven category colours painted their solid label with a hardcoded `text-white`, but category step 9 *lightens* in dark mode, the opposite of the intent ramps. Light passed at 4.59 to 5.10; dark landed at 3.28 to 3.70 on 10px text. Adds `--color-category-fg`, which resolves to `--neutral-0` in light and `--neutral-1` in dark, so it inverts with the theme. Measured 4.59 to 4.97 in light and 5.55 to 6.24 in dark across all seven.

**Input, Textarea, Select and Combobox placeholders missed AA in light.** `surface-fg-subtle` is compliant on `surface-base` at 4.664:1, but these controls sit on `surface-raised-hover`, where the same token measures 4.14:1. Placeholders are body sized, so the bar is 4.5. The four field controls now use `surface-fg-muted` (6.63:1). The token itself is unchanged, because it is correct on the page canvas and has around 290 other usages.

All three were found by porting the design system into Figma and resolving each component's real foreground-on-background pair through the variable chain, rather than by reading tokens in isolation.
