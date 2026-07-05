---
"@devalok/shilp-sutra": patch
---

ColorInput: replace the default preset palette. The old presets were the raw Tailwind-500 set (`#6366F1` indigo, `#8B5CF6` violet, `#3B82F6` blue, …) — the "AI framework-default palette" tell, mislabeled "color-blind accessible." New presets are derived from the design system's own OKLCH brand scales (led by red, not indigo/violet), so they read as one intentional family. Story/doc examples updated off the raw Tailwind hexes.
