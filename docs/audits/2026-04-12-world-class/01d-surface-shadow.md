# Surface & Shadow System Audit -- Phase 1d

**Phase:** 1d
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: World-Class

The surface and shadow system is among the best-implemented token architectures in the open-source React design system space. The two-layer primitive/semantic architecture, the multi-layer tinted shadow technique, the parameterized dark mode multiplier, and the semantic naming are all at or above industry standard. The gaps are minor: one unused effect token, dead disabled tokens, and missing forced-colors support.

---

## Findings

### 1. Surface Hierarchy

**Rating:** World-Class

**Current State:**
Five-level semantic hierarchy backed by OKLCH primitives:

| Token | Light L | Dark L | Role |
|-------|---------|--------|------|
| `surface-sunken` | 0.945 | 0.07 | Shell chrome, recessed wells |
| `surface-base` | 0.97 | 0.11 | Page background |
| `surface-raised` | 0.99 | 0.17 | Cards, widgets, panels |
| `surface-overlay` | 0.99 | 0.13 | Dialogs, popovers, sheets |
| `surface-inverted` | 0.32 | 0.88 | Tooltips, inverted badges |

Plus state tokens: raised-hover (neutral-3), raised-active (neutral-4), disabled (neutral-2).

The `surface-0` primitive uses hue 360 (brand pink) at low chroma to create a warm, recessed feel — a sophisticated detail most DS skip.

Hierarchy enforced by pre-publish audit gate (`pre-publish-audit.mjs`).

**World-Class Standard:**
- Material Design 3: "tonal elevation" with 5 surfaces
- Linear: Grey page / white card pattern (identical to this)
- Stripe: Off-white bg / pure-white cards (same pattern)

**Gap Analysis:** None. Already at industry-leading quality.

**Effort:** N/A
**Priority:** N/A

---

### 2. Shadow Realism

**Rating:** World-Class

**Current State:**
Multi-layer composition using Josh Comeau's doubling progression:

- **shadow-xs:** 4 layers (ring + contact + near + ambient)
- **shadow-sm:** 5 layers
- **shadow-md:** 5 layers
- **shadow-lg:** 6 layers

Shadow color: `oklch(0.15 0.015 260)` — cool blue tint at subliminal chroma. Intentionally cool-toned while surfaces are warm-toned (H:350/360): elevation shadows recede (atmospheric blue), effect shadows attract (warm accent).

All offsets purely vertical (top-down light source at 0 degrees). Negative spread on outer layers contains blur bleed. Opacity parameterized via `calc(N * var(--shadow-strength))`.

**World-Class Standard:**
- Josh Comeau's technique: 3-5 layers, doubling blur, decreasing opacity, negative spread
- Stripe: Tinted multi-layer shadows
- Linear: 2-3 layers at low levels, more at high

**Gap Analysis:** Hits every mark. Among the best shadow implementations in open-source DS.

**Effort:** N/A
**Priority:** N/A

---

### 3. Dark Mode Shadows

**Rating:** Strong

**Current State:**
`--shadow-strength: 2.5` in dark mode (1 in light). All opacities scale via `calc()`. Effect shadows use gentler multipliers (1.33-1.75x).

Dark overlay surface diverges to `oklch(0.13)` — lighter than base (0.11) but darker than raised (0.17), providing tonal elevation differentiation.

**World-Class Standard:**
- Material Design 3: Essentially abandons shadows in dark mode, replacing with surface tint elevation
- Open Props: ~2-3x multiplier
- Industry consensus: 2-3x range is correct

**Gap Analysis:**
2.5x is within standard range. Minor concern: at 6 layers on shadow-lg, cumulative footprint may feel heavy on very dark surfaces. The blue tint at 2.5x opacity may become slightly visible rather than subliminal.

**Recommendation:** A/B test 2.0x vs 2.5x in Storybook dark mode. If current is fine, keep it.

**Effort:** S (visual review only)
**Priority:** P3

---

### 4. Elevation-to-z-Index Mapping

**Rating:** World-Class

**Current State:**
Complete documented mapping, verified against all component implementations:

| z-index | Value | Surface | Shadow | Verified Components |
|---------|-------|---------|--------|-------------------|
| z-base | 0 | surface-base | none | Page content |
| z-raised | 10 | surface-raised | shadow-raised | Card, widgets |
| z-dropdown | 1000 | surface-overlay | shadow-floating | Select, combobox |
| z-sticky | 1100 | surface-sunken | shadow-raised | Sticky headers |
| z-overlay | 1200 | surface-overlay | shadow-overlay | Sheet backdrop |
| z-modal | 1300 | surface-overlay | shadow-overlay | Dialog, alert-dialog, sheet |
| z-popover | 1400 | surface-overlay | shadow-floating | Popover, dropdown-menu |
| z-toast | 1500 | surface-overlay | shadow-floating | Toast |
| z-tooltip | 1600 | surface-inverted | shadow-floating | Tooltip |

Radix popper content gets `z-index: var(--z-popover) !important` via global rule, preventing stacking bugs. 100-increment gaps leave room for consumer customization.

**Gap Analysis:** None. Best-in-class enforcement.

**Effort:** N/A
**Priority:** N/A

---

### 5. Effect Shadows (Glow, Brand, Status)

**Rating:** Strong

**Current State:**
Brand/status glow shadows (2 layers each): shadow-brand (pink), shadow-success (green), shadow-error (red), shadow-warning (amber with higher lightness for visibility).

Focus/selection: shadow-glow (ring + blur), shadow-ring (2px ring), shadow-ring-sm (1px ring).

Structural: shadow-inset, shadow-raised-inner, shadow-pressed, shadow-kbd.

**Critical finding:** `shadow-glow` is defined but has **zero component usages**. Design doc says it should be used for "Selected item" states but no component implements this.

**Also:** Brand/status effect shadows use hardcoded OKLCH values rather than referencing semantic accent/status tokens. If a consumer rebrands the accent color, shadow-brand/glow/ring still show pink.

**World-Class Standard:**
- Radix Themes / Linear: Colored glow effects sparingly on CTAs, selections, focused inputs
- Stripe: Brand-colored shadows on primary buttons

**Recommendation:**
1. Add `shadow-glow` usage to at least one component (selected tab, active sidebar item) or remove it
2. Consider parameterizing effect shadow colors via `--shadow-brand-color: var(--color-accent-9)`

**Effort:** S (glow usage), M (parameterized colors)
**Priority:** P2 / P3

---

### 6. Disabled Surfaces

**Rating:** Gap

**Current State:**
`--color-surface-disabled` (neutral-2) and `--color-surface-fg-disabled` (neutral-8) exist but are **used by zero components**. All 41 component files use `disabled:opacity-action-disabled` (38% opacity) instead.

No dark mode override for disabled surface tokens. No `@media (forced-colors: active)` styles anywhere (design doc mentions this as requirement but never implemented).

**World-Class Standard:**
- Material Design 3: Dedicated disabled surface color (12% opacity) + content at 38%
- Radix Themes: Dedicated disabled colors maintaining contrast
- Best practice: Both disabled bg AND reduced opacity, ensuring contrast

**Gap Analysis:**
Opacity-only reduces ALL child elements uniformly, which can push subtle elements below visibility. Dead tokens are either planned-but-unimplemented or superseded but never cleaned up.

`surface-fg-disabled` (neutral-8, 0.62L) against surface-base (0.97L) gives 3.35:1 — fails normal text contrast (4.5:1 required). WCAG exempts disabled controls, but worth noting.

**Recommendation:**
1. Decide: use or remove dead tokens. If opacity-only is the pattern, clean up dead code.
2. Add `@media (forced-colors: active)` to shadow-dependent components.

**Effort:** S (remove dead tokens), L (forced-colors support)
**Priority:** P2 / P3

---

## Summary Table

| # | Audit Item | Rating | Priority | Effort |
|---|-----------|--------|----------|--------|
| 1 | Surface Hierarchy | **World-Class** | N/A | N/A |
| 2 | Shadow Realism | **World-Class** | N/A | N/A |
| 3 | Dark Mode Shadows | **Strong** | P3 | S |
| 4 | Elevation-to-z-Index | **World-Class** | N/A | N/A |
| 5 | Effect Shadows | **Strong** | P2 | S-M |
| 6 | Disabled Surfaces | **Gap** | P2 | S-L |
