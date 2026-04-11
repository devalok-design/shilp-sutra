# Phase 1f: Remaining Token Categories Audit

**Phase:** 1f
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Strong

The remaining token categories are in strong shape. Border radius has excellent namespace discipline (zero Tailwind default leakage). Opacity tokens are world-class — `opacity-action-disabled` is used in 50+ components. Z-index has a well-designed 9-level semantic scale. The two areas needing attention are 3 `z-50` stacking violations and minor token-adoption gaps in Tabs and SegmentedControl sizing.

---

## Findings

### 1. Border Radius Scale

**Rating:** World-Class

**Current State:**
8 levels: none (0), sm (2px), default (4px), md (6px), lg (10px), xl (16px), 2xl (24px), full (9999px).

100% namespace compliance — grep for bare Tailwind radius classes returned zero results. Every component uses `rounded-ds-*`. Progressive sizing on Button: xs/sm get 6px, md gets 10px, lg gets 16px.

**World-Class Standard:** Material 3 uses 5 levels, Radix Themes uses 6. Having 8 levels provides appropriate flexibility.

**Gap Analysis:** None meaningful. One cosmetic fix: `color-swatch.tsx` uses bare `rounded-none`.

**Recommendation:** Fix one bare `rounded-none` in color-swatch.

**Effort:** S | **Priority:** P3

---

### 2. Z-Index Scale

**Rating:** Strong

**Current State:**
9 semantic levels from z-base (0) to z-tooltip (1600). 55+ adoption points across all component layers. Correct popover-over-modal stacking (1400 > 1300). Radix popper global override prevents stacking bugs.

**Violations found:**
- `z-50` in data-table-bulk-actions.tsx, bulk-action-bar.tsx, image-preview.tsx (should use z-sticky/z-modal)
- FoundationsShowcase.tsx missing z-popover (1400) from display

**World-Class Standard:** Carbon uses 5 layers, Material uses elevation system. Shilp-sutra's 9-level with 100-unit gaps is more granular and correct.

**Recommendation:** Fix 3 `z-50` violations + FoundationsShowcase display bug.

**Effort:** S | **Priority:** P1 (z-50 is a real stacking bug)

---

### 3. Component Sizing Consistency

**Rating:** Strong

**Current State:**
7 size tokens (xs 24px through xl 56px) + 4 icon tokens (16-32px). Every component defaults to `md`. Interactive controls (Button, Input, Select) consistently use token heights. Plus half-steps (xs-plus 28px, sm-plus 36px) used precisely where needed.

Inconsistencies: Badge, Checkbox, Radio use own smaller scales (correct — different sizing semantics). Tabs and SegmentedControl use raw Tailwind heights that happen to match tokens.

**Recommendation:** Migrate Tabs + SegmentedControl to token classes (values already match).

**Effort:** S | **Priority:** P2

---

### 4. Border Width Tokens

**Rating:** Adequate

**Current State:**
5 tokens defined (sm 1px, md 2px, lg 3px, focus-width 2px, focus-offset 2px). Width tokens are defined but unadopted — components use bare Tailwind `border` and `border-2`. Focus tokens are well-adopted via focus-ring utility.

**World-Class Standard:** Most systems don't tokenize border widths. This is fine as-is — tokens serve as theming escape hatch.

**Recommendation:** None needed.

**Effort:** N/A | **Priority:** N/A

---

### 5. Breakpoints

**Rating:** World-Class

**Current State:**
5 breakpoints matching Tailwind defaults: sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1536px. Correctly hardcoded in preset (CSS vars can't be used in @media).

**Gap Analysis:** None. Industry standard.

**Effort:** N/A | **Priority:** N/A

---

### 6. Opacity Tokens

**Rating:** World-Class

**Current State:**
5 action state opacities with mode-adaptive dark values. `opacity-action-disabled` used in 50+ components — genuinely impressive consistency. Dark mode correctly increases hover/selected/active (2x, 1.5x, 1.3x) while keeping disabled and focus constant. Matches Material Design 3 standard exactly.

**Gap Analysis:** None. World-class adoption and design.

**Effort:** N/A | **Priority:** N/A

---

## Summary Table

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | Border Radius | **World-Class** | P3 | S |
| 2 | Z-Index | **Strong** | P1 | S |
| 3 | Component Sizing | **Strong** | P2 | S |
| 4 | Border Width | **Adequate** | N/A | N/A |
| 5 | Breakpoints | **World-Class** | N/A | N/A |
| 6 | Opacity | **World-Class** | N/A | N/A |
