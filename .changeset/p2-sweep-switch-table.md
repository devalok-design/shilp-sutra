---
"@devalok/shilp-sutra": patch
---

fix: P2 audit sweep — switch RTL + reduced-motion, table forced-colors selection

- **switch (P1):** the thumb now travels toward the inline-end — mirrored under
  `dir="rtl"` (it previously slid the wrong way in RTL). The thumb spring +
  press-scale are gated behind `useReducedMotion` (instant, no scale under
  `prefers-reduced-motion`).
- **table (P1):** the selected-row tint (`accent-3`) gets a `forced-colors:outline`
  fallback so selection survives Windows High-Contrast Mode (the tint collapses to
  Canvas with no cue otherwise).
