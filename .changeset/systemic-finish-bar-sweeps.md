---
"@devalok/shilp-sutra": patch
---

Two DS-wide fixes from the finish-bar audit:

- **Reduced motion respected without a provider.** `useMotion()` now falls back to the OS `prefers-reduced-motion` setting when no `<MotionProvider>` is mounted (previously the context default hardcoded `reducedMotion: false`, so components ignored the preference unless a provider wrapped them). Every shilp-sutra component that gates animation on `useMotion().reducedMotion` now honors reduced motion out of the box; a provider remains an explicit override.

- **`border-card-strong` is now a real utility.** It was referenced by ~11 components (kbd caps, code blocks, skeleton/panel outlines, chips) but never defined — the border fell back to `currentColor`. Added `@utility border-card-strong` mapping to the dark-mode-aware `--color-surface-border`, restoring the intended hairline.
