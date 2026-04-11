# Color System Audit -- Phase 1a

**Phase:** 1a
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Adequate (with P0 contrast issues)

The color architecture is excellent — OKLCH is the right choice, the 12-step functional scale is well-designed, the semantic layer is comprehensive, and the accent swappability is elegant. However, critical WCAG AA contrast failures exist in dark mode (all solid variant text) and light mode (success-fg on success-9), plus category color hue crowding reduces effective distinctness from 7 to ~5 colors.

---

## Findings

### 1. Color Space Choice (OKLCH)
**Rating:** World-Class
Ahead of Radix (HSL) and Carbon (HSB). On par with Linear. OKLCH has full browser support. No action needed.

### 2. Scale Structure (12-step)
**Rating:** Strong
Matches Radix's proven 12-step functional model. Lightness distribution is well-considered. Gap: no alpha variant scales for overlay use cases (Radix ships these).
**Priority:** P2 | **Effort:** M

### 3. Chroma Distribution
**Rating:** Strong
Bell curve peaking at steps 9-10. Per-hue peak chroma respects gamut limits. Dark mode 1.1x boost maintains vibrancy. One issue: `amber-bright-9` dark (`oklch(0.72 0.17 65)`) clips sRGB.
**Priority:** P2 | **Effort:** S

### 4. Semantic Mapping Completeness
**Rating:** Adequate
Missing vs leaders: link/link-hover/link-visited tokens (very common need), accent-contrast for text-on-accent-container, icon semantic tokens, surface-tint composable token, status step 6 (border subtle for status containers).
**Priority:** P1 (links) | **Effort:** S-M

### 5. Dark Mode Implementation
**Rating:** Strong
Correct lightness inversion, correct step 9/10 swap, correct chroma boost, proper color-scheme declarations. Per-hue dark tuning could improve specific hues but is low priority.
**Priority:** P3 | **Effort:** M

### 6. Status Colors
**Rating:** Adequate

**CRITICAL CONTRAST FAILURES:**

Light mode:
- success-fg on success-9: **4.44:1** (FAIL AA normal, needs 4.5:1)

Dark mode (ALL fail AA normal):
- accent-fg on accent-9: **3.91:1** (FAIL)
- error-fg on error-9: **3.85:1** (FAIL)
- success-fg on success-9: **3.29:1** (FAIL)
- warning-fg on warning-9: **2.58:1** (FAIL — even fails AA large!)
- info-fg on info-9: **3.44:1** (FAIL)

Root cause: Dark mode step 9 at L=0.63 (boosted chroma) is too bright for white text.

Colorblind safety: red (h:25) and green (h:145) share same lightness at step 9. Deuteranopia/protanopia users rely on hue/chroma which is exactly what's impaired.

**Priority:** P0 | **Effort:** M

### 7. Category Colors (Sapta Varna)
**Rating:** Adequate
3 hue-crowded pairs: teal/emerald (15 degrees), amber/orange (20 degrees), slate/indigo (15 degrees). Effectively reduces 7 distinct colors to ~5.
**Priority:** P1 | **Effort:** S

### 8. Chart Palette
**Rating:** Adequate
All 8 colors at uniform L=0.55 — indistinguishable in grayscale. Hue crowding mirrors category issues. Missing sequential and diverging palettes.
**Priority:** P2 | **Effort:** M

### 9. Accent Swappability
**Rating:** Strong
12-step indirection via CSS vars works. Gap: requires overriding 13 vars (verbose). No theme generator tool. No contrast validation for custom themes.
**Priority:** P2 | **Effort:** M

### 10. P3 Wide Gamut
**Rating:** Gap
No sRGB hex fallbacks for ~5% of browsers without OKLCH support. No P3 enhancement layer. amber-bright-9 dark clips sRGB.
**Priority:** P1 (amber clip, fallbacks) / P3 (P3 enhancement) | **Effort:** M

### 11. Contrast Ratios
**Rating:** Gap

Additional failures beyond status colors:
- surface-fg-subtle on surface-base: **3.35:1** light, **3.86:1** dark (both FAIL AA normal)
- All border tokens fail WCAG 1.4.11 non-text 3:1 (industry-wide compromise, but border-strong should hit 3:1)

**Priority:** P0 (dark solid variants), P1 (surface-fg-subtle audit, border-strong) | **Effort:** M-L

---

## Summary Table

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | Color space (OKLCH) | **World-Class** | N/A | N/A |
| 2 | Scale structure (12-step) | **Strong** | P2 | M |
| 3 | Chroma distribution | **Strong** | P2 | S |
| 4 | Semantic mapping | **Adequate** | P1 | S-M |
| 5 | Dark mode | **Strong** | P3 | M |
| 6 | Status colors | **Adequate** | **P0** | M |
| 7 | Category colors | **Adequate** | P1 | S |
| 8 | Chart palette | **Adequate** | P2 | M |
| 9 | Accent swappability | **Strong** | P2 | M |
| 10 | P3 wide gamut | **Gap** | P1 | M |
| 11 | Contrast ratios | **Gap** | **P0** | M-L |

## P0 Items (must fix)

1. **Dark mode solid variant contrast:** All 5 `*-fg` on `*-9` pairs fail AA. Lower dark step 9 from L=0.63 to ~0.52-0.55, or compute per-hue fg colors.
2. **Light mode success-fg on success-9:** 4.44:1, darken green-9 from L=0.55 to L=0.53.
3. **Dark mode warning-fg on warning-9:** 2.58:1 is critically bad. Amber-bright-9 dark at L=0.72 needs dark text, not white.
