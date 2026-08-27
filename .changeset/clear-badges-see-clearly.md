---
"@devalok/shilp-sutra": patch
---

fix colour-contrast failures in alerts, badges, field placeholders and the chat surfaces

**Alert's dismiss button was effectively invisible on solid variants.** It was `text-surface-fg-subtle` regardless of variant, so on a saturated step 9 fill it measured 1.07:1 on info, 1.04:1 on error and **1.01:1 on success**, which is no contrast at all. It now inherits the alert's own foreground on solid, exactly as the title and body already do, and measures 4.66 to 7.76 across the five intents.

**Badge category labels failed AA in dark mode.** The seven category colours painted their solid label with a hardcoded `text-white`, but category step 9 *lightens* in dark mode, the opposite of the intent ramps. Light passed at 4.59 to 5.10; dark landed at 3.28 to 3.70 on 10px text. Adds `--color-category-fg`, which resolves to `--neutral-0` in light and `--neutral-1` in dark, so it inverts with the theme. Measured 4.59 to 4.97 in light and 5.55 to 6.24 in dark across all seven.

**Input, Textarea, Select and Combobox placeholders missed AA in light.** `surface-fg-subtle` is compliant on the page canvas, but these controls sit on a tinted field fill, where the same token measures 4.14:1. Placeholders are body sized, so the bar is 4.5. All four now use `surface-fg-muted` (6.63:1) — Combobox included, which the first pass missed. The token itself is unchanged, because it is correct on the page canvas and has around 290 other usages.

**Seven chat surfaces used opacity to quieten text, which quietens contrast with it.** `Message` timestamps, edited and system markers, `DateSeparator`, `SystemMessage`, and the `MessageInput` / `RichChatInput` disclaimers all set `text-surface-fg-subtle/50` (or `/60`). Composited against the surface that is **2.011:1** in light, 2.369:1 at `/60`, and 2.422:1 in dark — under half the 4.5 bar, in both themes. `MessageInput`'s placeholder was the same, at 2.011:1.

Opacity was doing a job a token already does. All seven drop the modifier and keep `surface-fg-subtle`, the quietest compliant token, so the visual hierarchy is unchanged while the measurement moves to 5.061:1 light and 6.521:1 dark. The placeholder joins the other field controls on `surface-fg-muted`.

DataTable's filter and search placeholders also use `surface-fg-subtle`, and were checked rather than assumed: they render `bg-transparent` over the page or a panel — both white in light — where the token measures 5.061:1 and passes. They are left alone.

The first three were found by porting the design system into Figma and resolving each component's real foreground-on-background pair through the variable chain, rather than by reading tokens in isolation. The rest were found by re-checking that claim: **Combobox had been listed as fixed and was not**, and grepping for what survived turned up the opacity family, which no rule catches because the token is compliant and the modifier is what breaks it.
