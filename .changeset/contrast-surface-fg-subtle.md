---
"@devalok/shilp-sutra": patch
---

Fix `--color-surface-fg-subtle` failing WCAG AA in the light theme, and add a gate so a contrast claim has to be computed rather than asserted.

The token measured **4.472:1** on the light `surface-base` against AA's required 4.5 for normal text — a 0.028 miss. It is used for secondary text in 87 component files (descriptions, placeholders, captions, metadata), so every one of those was non-compliant to any audit tool a consumer runs. Dark theme was already fine at 5.816:1 and is unchanged.

`--neutral-9` (light) goes `oklch(0.54 …)` from `0.55`, giving **4.664:1**. The two are visually near-indistinguishable — the fix costs nothing to look at and moves the token from failing to passing.

The intermediate `0.545` also clears, at 4.567, and was rejected: 0.067 of headroom means a later tweak to `surface-base` would silently push it back under. That is not hypothetical — the token already carried the comment `/* darkened for WCAG AA 4.5:1 */`, so a previous adjustment had been made with exactly this intent and landed short. The value looked right, the comment claimed it was right, and nothing verified it. It reached npm and was found by an external accessibility audit of rendered output.

So the durable part of this change is the new gate. `scripts/audit-contrast.mjs` computes OKLCH → sRGB → WCAG relative luminance straight from `primitives.css` and fails the release if a listed body-text pairing drops under AA. It runs in `pre-publish-audit`, and is verified in both directions: it reports the exact `4.472 / −0.028` on the old value and passes on the new one. Four pairings are covered today (`surface-fg-subtle` and `surface-fg-muted`, each on `surface-base`, in both themes).
