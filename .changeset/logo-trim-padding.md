---
"@devalok/shilp-sutra-brand": minor
---

Trim baked padding from all logo assets (Devalok + Karm).

Every logo previously shipped with 20–66% transparent padding baked into the
canvas (e.g. the Devalok wordmark was 66% empty vertical space, shloka 54%).
This forced consumers to hand-crop or add negative margins for tight alignment.

- **Raster logos** (monogram, monogram-shell, monogram-shell-wordmark,
  monogram-coin-wordmark, monogram-wordmark, shloka — all colors, 512/1024,
  png+webp): trimmed to their content bounding box.
- **SVG logos** (wordmark, dass, chakra, Karm icon/wordmark/wordmark-icon):
  `viewBox` tightened to the glyph bounds. Paths are unchanged — no reshaping.

Logos now render edge-to-edge. `DevalokLogo`/`KarmLogo` size by height with
`w-auto`, so nothing distorts. **Consumers that relied on the baked padding for
spacing should add their own clear-space** (margin/padding) around the mark.
Favicons and app-icons are unchanged (they keep their safe-area).
