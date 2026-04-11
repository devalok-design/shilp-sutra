# Phase 2a: Tailwind Preset Audit

**Phase:** 2a
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Strong

The preset is solid production-quality work. CSS variable indirection is well-architected, `extend` is correctly used everywhere, dark mode is complete. The main gap is 64 typography-semantic tokens with zero utility coverage, forcing consumers into arbitrary-value syntax or component-only usage.

---

## Findings

### 1. Namespace Strategy

**Rating:** Strong

**Current State:**
`ds-` prefix applied to: letterSpacing, lineHeight, fontSize, borderWidth (partial), borderRadius, spacing, width, height, minHeight, minWidth. NOT applied to: fontFamily, fontWeight, colors, shadows, durations, easings, zIndex, maxWidth, animations, keyframes.

fontWeight uses bare names (`light`, `regular`, `medium`, `semibold`, `bold`) colliding with TW defaults (same values, so currently harmless but fragile). Colors use semantic names without `ds-` (acceptable — domain-specific enough). `disabled` and `backdrop` color names are dangerously generic.

**Recommendation:**
1. Rename fontWeight to `ds-light`, `ds-regular`, etc. (or accept collision)
2. Rename `borderWidth.focus` to `ds-focus`
3. `disabled` color is redundant with `surface-disabled`

**Effort:** S | **Priority:** P2

---

### 2. Token Coverage

**Rating:** Adequate

**Current State:**
259 CSS vars in semantic.css, 247 mapped in preset. 14 orphaned vars (all legitimately internal). 2 phantom Radix runtime vars (legitimate).

**CRITICAL GAP:** 64 typography-semantic tokens (`--typo-heading-*`, `--typo-body-*`, `--typo-label-*`, etc.) have ZERO Tailwind utilities. Consumers wanting `heading-xl` style without `<Text>` component must hand-write 4 arbitrary-value classes.

**World-Class Standard:** Every semantic token should have a utility. Carbon and Polaris Tailwind plugins both expose composite type utilities.

**Recommendation:** Add typography composite utilities via plugin (`text-heading-xl`, `text-body-md`, etc.).

**Effort:** M | **Priority:** P1 — single largest ergonomic gap

---

### 3. Naming Consistency

**Rating:** Adequate

**Current State:**
Mixed patterns: `ds-NN` for spacing, `ds-{size}` for fontSize/radius, `ds-{adjective}` for letterSpacing/lineHeight, semantic names (no prefix) for colors/shadows/zIndex. `ico-` prefix for icon sizes. `ds-02b` half-step naming non-obvious. `ds-default` radius naming unusual (most use `ds-base`).

**Recommendation:** Rename `ico-` to `ds-ico-`. Document `-b` convention. Consider `ds-base` for radius. All polish items.

**Effort:** S | **Priority:** P3

---

### 4. Composability

**Rating:** Strong

**Current State:**
Uses `theme.extend` (additive, never destructive). ESM + CJS via `./tailwind` export. Single-file preset (not modular). Consumers override via CSS vars.

**Gap Analysis:** No modular import paths (colors-only, typography-only). In practice doesn't matter much — unused theme keys don't bloat CSS output.

**Recommendation:** Document "override via CSS vars" pattern. Modular split only when multiple consumers need it.

**Effort:** S (docs) / L (modular split) | **Priority:** P3

---

### 5. Dark Mode Utilities

**Rating:** Strong

**Current State:** Handled entirely through CSS var swaps in `.dark` class selector. Every semantic token that needs dark adaptation has a `.dark` override. Complete coverage.

**Gap Analysis:** None for the preset. Minor token-level concern: `surface-disabled` barely distinguishable from base in dark mode.

**Effort:** N/A | **Priority:** N/A

---

### 6. Custom Utilities

**Rating:** Strong

**Current State:** 6 utility groups: `.tabular-nums`, `.touch-target` (44x44px WCAG), `.focus-ring`/`.focus-ring-inset`/`.focus-ring-sm`, `.p-safe` safe-area utilities. Base styles include iOS zoom prevention.

**Gap Analysis:** Missing `.antialiased` base style. Otherwise complete.

**Effort:** S | **Priority:** P3

---

### 7. Responsive Token Behavior

**Rating:** Adequate

**Current State:** Tokens are completely static. No responsive behavior. Heading typography doesn't scale on mobile.

**Recommendation:** Add optional fluid type tokens via `clamp()`. Keep static as default.

**Effort:** M | **Priority:** P2

---

### 8. Plugin Architecture

**Rating:** Adequate

**Current State:** Single monolithic plugin. No plugin options. No type exports for consumers. Base styles coupled to utilities.

**Recommendation:** Export token type definitions. Consider `createPreset(options)` pattern long-term.

**Effort:** L | **Priority:** P3

---

## Summary Table

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | Namespace strategy | Strong | P2 | S |
| 2 | Token coverage | Adequate | **P1** | M |
| 3 | Naming consistency | Adequate | P3 | S |
| 4 | Composability | Strong | P3 | S-L |
| 5 | Dark mode utilities | Strong | N/A | N/A |
| 6 | Custom utilities | Strong | P3 | S |
| 7 | Responsive tokens | Adequate | P2 | M |
| 8 | Plugin architecture | Adequate | P3 | L |

## Top 3 Actions

1. **P1 — Typography composite utilities:** Add `text-heading-xl`, `text-body-md`, etc. as plugin utilities.
2. **P2 — Namespace cleanup:** Fix fontWeight collision, rename borderWidth.focus.
3. **P2 — Fluid type scale:** Add optional `clamp()`-based tokens for headings.
