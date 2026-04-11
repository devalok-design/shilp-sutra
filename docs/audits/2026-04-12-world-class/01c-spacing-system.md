# Spacing System Audit -- Phase 1c

**Phase:** 1c
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Adequate (trending toward Strong)

The foundation is solid -- correct base unit, right philosophy, good Tailwind integration, and a typed Stack component that enforces DS tokens. The two actionable gaps are component consistency (Button and Badge use Tailwind defaults instead of DS tokens) and missing semantic layout spacing layer.

---

## Findings

### 1. Base Unit and Multiplier Consistency

**Rating:** Strong

**Current State:**
16 spacing tokens in `packages/core/src/tokens/semantic.css` (lines 228-243):

| Token | Value | Multiple of 4px |
|---|---|---|
| `--spacing-01` | 2px | 0.5x |
| `--spacing-02` | 4px | 1x |
| `--spacing-02b` | 6px | 1.5x |
| `--spacing-03` | 8px | 2x |
| `--spacing-04` | 12px | 3x |
| `--spacing-05` | 16px | 4x |
| `--spacing-05b` | 20px | 5x |
| `--spacing-06` | 24px | 6x |
| `--spacing-06b` | 28px | 7x |
| `--spacing-07` | 32px | 8x |
| `--spacing-08` | 40px | 10x |
| `--spacing-09` | 48px | 12x |
| `--spacing-10` | 64px | 16x |
| `--spacing-11` | 80px | 20x |
| `--spacing-12` | 96px | 24x |
| `--spacing-13` | 160px | 40x |

4px base with 2px micro-step. Every value is a multiple of 2px. Non-linear progression (tight increments below 32px, coarser above) mirrors actual UI usage.

**World-Class Standard:**
- IBM Carbon: Same approach (2, 4, 8, 12, 16, 24, 32, 40, 48px)
- Material Design 3: 4dp increments
- Tailwind: Linear 4px-based scale
- Primer: 4px base

**Gap Analysis:** None. Correct choice, matches industry consensus.

**Recommendation:** Document the multiplier rationale.

**Effort:** S
**Priority:** P3

---

### 2. `-b` Variant Naming

**Rating:** Gap

**Current State:**
Three tokens with `-b` suffix: `--spacing-02b` (6px), `--spacing-05b` (20px), `--spacing-06b` (28px).

**Critical finding:** FoundationsShowcase.tsx (lines 280-293) **omits all three** from display — they are invisible in Storybook documentation.

Usage: ds-02b in card.tsx, dialog.tsx; ds-05b in page-skeletons.tsx, bottom-navbar.tsx; ds-06b minimal usage.

**World-Class Standard:**
- Carbon: No half-step suffixes, clean 01-13
- Tailwind: Uses decimal numbering (1.5, 2.5, 3.5) — half-steps are first-class
- Primer: No intermediate values

**Gap Analysis:**
`-b` suffix feels ad-hoc. `ds-05b` is not intuitive for 20px. Values are valid (all on 2px grid) but naming hurts DX.

**Recommendation:**
- **Immediately:** Fix FoundationsShowcase to include `-b` tokens (documentation bug)
- **Short term:** Add cleaner aliases
- **Major version:** Renumber entire scale

**Effort:** S (aliases + docs fix) / L (breaking rename)
**Priority:** P1 (docs fix), P2 (rename)

---

### 3. Naming Convention

**Rating:** Adequate

**Current State:**
Ordinal numbering: `--spacing-01` through `--spacing-13`, mapped to Tailwind as `ds-01` through `ds-13`. No semantic aliases.

**World-Class Standard:**
- Carbon: Ordinal (same approach)
- Tailwind: Pure numeric
- Polaris: Semantic at component level (`--p-space-card-padding`)

**Gap Analysis:**
Ordinal is industry standard. Semantic naming would help at the layout level but not at the base scale level.

**Recommendation:** Keep ordinal for base scale. Add semantic layout layer (see item 6). Add quick-reference comment table in CSS.

**Effort:** S
**Priority:** P3

---

### 4. Scale Coverage (96px to 160px Jump)

**Rating:** Adequate

**Current State:**
Largest gap: 96px to 160px (1.67x ratio, 64px jump). Missing: 112px, 128px, 144px.

**World-Class Standard:**
- Carbon: Same gap (scale ends at 160px with same jump from 96)
- Tailwind: Dense coverage up to 384px
- Primer: Tops out at 48px

**Gap Analysis:**
Above 96px is page-level layout territory — grid systems and container queries dominate. The only potentially missing value is 56px (between 48px and 64px).

**Recommendation:** Monitor during development. Add `--spacing-09b: 56px` only when needed. Do NOT add 112/128/144.

**Effort:** S
**Priority:** P3

---

### 5. Component Consistency (Token Adoption)

**Rating:** Gap

**Current State:**
Quantitative analysis across all component .tsx files:

| Pattern | Occurrences | Files |
|---|---|---|
| DS token spacing (`p-ds-`, `gap-ds-`, etc.) | ~1,652 | 213 |
| Tailwind default spacing (`p-4`, `gap-3`, etc.) | ~146 | 57 |
| Arbitrary bracket values (`p-[`, `gap-[`) | ~40 | ~20 |

**Adoption: ~89% DS tokens, ~8% Tailwind defaults, ~3% arbitrary.**

**Worst offenders (foundational components):**
- **`button.tsx`**: Uses `gap-1`, `gap-1.5`, `gap-2`, `gap-2.5`, `-ml-0.5`, `-mr-1`, etc. throughout all variants
- **`badge.tsx`**: Uses `px-1.5`, `px-2`, `px-2.5`, `px-3`, `gap-1`, `gap-1.5` throughout
- **`toast.tsx`**, **`split-button.tsx`**, **`badge-group.tsx`**, **`icon-group.tsx`**, **`sidebar.tsx`**: Tailwind defaults
- **AI blocks**: Consistently use `gap-3`, `gap-2`, `mt-2`, `mb-1`

Root cause: Small gap values (4-12px) exist in DS (`ds-02` through `ds-04`) but `gap-1.5` is more intuitive than `gap-ds-02b`. This is a naming problem (see item 2).

Arbitrary values (`py-[3px]`, `py-[5px]`) are legitimate sub-pixel adjustments (not on 4px grid) and should stay.

**World-Class Standard:**
- Carbon: Near 100% token usage, lint-enforced
- Primer: Stylelint enforces Primer tokens in CI
- Best practice: Lint enforcement, no raw px in components

**Gap Analysis:**
89% sounds good but violations are in foundational components. A developer looking at Button source sees `gap-1.5` and concludes Tailwind defaults are fine.

**Recommendation:**
1. **High:** Migrate button.tsx and badge.tsx to DS tokens
2. **Medium:** Migrate remaining components
3. **Add ESLint rule** flagging non-DS spacing in component files

**Effort:** M (~2 days for full migration + ESLint rule)
**Priority:** P0 — foundational components must set the right example

**Affected Components:** button, badge, toast, split-button, badge-group, icon-group, sidebar, AI blocks (41 files total)

---

### 6. Layout Spacing

**Rating:** Gap

**Current State:**
No dedicated layout spacing tokens. `Container` uses `px-ds-05` (16px) as default horizontal padding — no responsive adjustment. Same tokens used for component internals and page layout, making it impossible to globally adjust "how tight the page feels."

**World-Class Standard:**
- Carbon: Separates "spacing" (internals) from "layout" (grid margins, gutters, section spacing)
- Material Design 3: "Canonical layouts" with window-size-class-adjusted spacing
- Polaris: Explicit layout tokens (`--p-space-card-padding`, `--p-space-section-spacing`), responsive
- Primer: PageLayout component with predefined spacing options

**Gap Analysis:**
Most significant architectural gap. Problems:
- Mobile app shell wants 12px margins, desktop wants 24px — must use different tokens manually
- "Compact mode" can't reduce section gaps without affecting button padding
- Container doesn't respond to viewport size

**Recommendation:**
Add semantic layout spacing layer:
```css
:root {
  --spacing-page-x: var(--spacing-05);       /* 16px */
  --spacing-section-gap: var(--spacing-08);   /* 40px */
  --spacing-card-gap: var(--spacing-05);      /* 16px */
}
@media (min-width: 768px) {
  :root {
    --spacing-page-x: var(--spacing-06);      /* 24px */
    --spacing-section-gap: var(--spacing-10);  /* 64px */
  }
}
@media (min-width: 1280px) {
  :root {
    --spacing-page-x: var(--spacing-08);      /* 40px */
  }
}
```
Update Container to use `--spacing-page-x`. Purely additive change.

**Effort:** M (~4-6h)
**Priority:** P1 — should happen before 1.0

---

## Summary Table

| # | Audit Item | Rating | Priority | Effort |
|---|---|---|---|---|
| 1 | Base unit (4px) | **Strong** | P3 | S |
| 2 | `-b` variant naming | **Gap** | P1 (docs) / P2 (rename) | S / L |
| 3 | Naming convention | **Adequate** | P3 | S |
| 4 | Scale coverage | **Adequate** | P3 | S |
| 5 | Component consistency | **Gap** | **P0** | M |
| 6 | Layout spacing | **Gap** | P1 | M |
