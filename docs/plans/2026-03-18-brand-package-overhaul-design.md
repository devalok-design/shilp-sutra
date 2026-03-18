# Brand Package Overhaul — Asset Standardization

**Date:** 2026-03-18
**Package:** `@devalok/shilp-sutra-brand`
**Status:** Approved

## Problem

The brand package has inconsistent, oversized, and mislabeled assets:

- Devalok logo PNGs are 10K–12.5K pixels (34 MB for 18 files). Package total: ~39 MB.
- Devalok favicon PNGs are mislabeled — filename says 32, actual dimension is 134.
- Brand-colored SVGs embed raster data (4.7 MB each vs 130 KB for black/white).
- Karm `favicon-brand-512.png` is actually 500x500.
- White favicon PNGs have 1px height mismatches.
- Inconsistent favicon sets between brands (Devalok: 16/32/96/180/512, Karm: 96/180/192/512).

## Decisions

### Devalok Logos (6 raster-complex types)

Types: monogram, monogram-wordmark, monogram-shell, monogram-shell-wordmark, monogram-coin-wordmark, shloka.

- **Drop all SVGs** for these 6 types (brand-colored SVGs embed bitmaps, defeating the purpose).
- **Keep PNGs**, resize to 3 sizes: **512, 1024, 2048** (longest edge, aspect ratio preserved).
- **Generate WebP** at each size alongside PNG.
- Logos are not legible below 512px — no smaller sizes needed.
- Total: 6 types × 3 colors × 3 sizes × 2 formats = **108 files**.

### Devalok SVG Logos (kept as-is)

- `wordmark` (3 colors) — pure vector, ~5 KB each
- `dass` (3 colors) — pure vector, ~10 KB each
- `chakra` — inline SVG component, no file

### Favicons (both brands)

Adopt modern minimal set. Brand-color only (no black/white variants).

Per brand (5 files each):
1. `favicon.ico` — 32×32
2. `favicon.svg` — scalable, brand color
3. `apple-touch-icon.png` — 180×180
4. `icon-192.png` — 192×192
5. `icon-512.png` — 512×512

### Naming Convention

Logos: `{type}-{color}-{longest-edge}.{png|webp}`
Examples: `monogram-brand-2048.png`, `shloka-white-1024.webp`

Favicons: platform-standard names (no color/size suffix since brand-only).

### Folder Structure

```
src/assets/
  devalok/
    logos/
      monogram-brand-512.png
      monogram-brand-512.webp
      monogram-brand-1024.png
      monogram-brand-1024.webp
      monogram-brand-2048.png
      monogram-brand-2048.webp
      monogram-black-512.png
      ...
    favicons/
      favicon.ico
      favicon.svg
      apple-touch-icon.png
      icon-192.png
      icon-512.png
  karm/
    favicons/
      favicon.ico
      favicon.svg
      apple-touch-icon.png
      icon-192.png
      icon-512.png
  manifests/
    karm.webmanifest
```

### Component Changes

- **DevalokLogo**: Update imports to new `{type}-{color}-{size}.png` paths. Size prop selects nearest pre-rendered asset (xs–lg → 512, xl → 1024). CSS handles display sizing.
- **devalok-favicon.ts**: Simplify API — brand-only, return modern minimal set. Breaking change.
- **karm-favicon.ts**: Same simplification. Breaking change.
- **Size scale**: Consider adding `2xl`/`3xl` sizes for larger display contexts.

### Build & Validation

- **`resize-logos.mjs`**: One-time script using `sharp` to resize master PNGs → 512/1024 + WebP at all sizes.
- **`validate-assets.mjs`**: Pre-publish gate that checks all PNGs match their filename dimensions.
- **`copy-assets.mjs`**: Updated for new folder structure.

### Expected Package Size

~39 MB → **~3–5 MB** estimated (2048px PNGs are ~200–300 KB each).
