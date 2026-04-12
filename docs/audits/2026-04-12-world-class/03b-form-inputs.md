# Form Input Components Audit -- Phase 3, Group B

**Phase:** 3b
**Auditor:** Claude
**Date:** 2026-04-12
**Components:** Input, Textarea, SearchInput, NumberInput, ColorInput, ColorSwatch, InputOTP, Select, Combobox, Autocomplete, Checkbox, Radio, Switch, Slider

## Overall Rating: Adequate (Select and Switch excellent, critical sizing gaps elsewhere)

Select is the most complete variant matrix (3x4x4=48 combinations). Switch has excellent motion and accessibility. The critical gap is that Combobox, Autocomplete, NumberInput, and Slider lack `size` props, making it impossible to build visually consistent form rows.

---

## Per-Component Summary

| Component | API | Variants | Visual | Dark | A11y | Responsive | Motion | Tests | Key Finding |
|-----------|-----|----------|--------|------|------|------------|--------|-------|-------------|
| **Input** | A- | B+ | A | A | A- | B | C | A- | Uses `border-surface-border` (lighter than siblings) |
| **Textarea** | B+ | B | A- | A | A- | B+ | B | B+ | Missing ring-offset-2 on focus |
| **SearchInput** | A- | B | A | A | A | B | A | A- | No validation state pass-through |
| **NumberInput** | B- | **D** | B | A | B+ | C | B- | B+ | No size/variant/state system at all |
| **ColorInput** | A | A- | A | A | B | B- | A | B+ | Popover lacks role="dialog" |
| **ColorSwatch** | A | A | A | A | A- | A | C | — | No copy animation |
| **InputOTP** | B+ | C | B+ | A | B | B- | C+ | B | No size variants |
| **Select** | **A** | **A** | A | A | A | B+ | A- | A | Best in group |
| **Combobox** | A | **C+** | A | A | A- | B | A- | A | **No size prop** |
| **Autocomplete** | B | **D+** | B+ | A | A- | B- | A- | A- | **No size prop**, absolute positioning |
| **Checkbox** | A | B+ | A | A | A | A- | A | B+ | No color axis |
| **Radio** | A- | B | A- | A | A | A- | B+ | A- | No color axis |
| **Switch** | **A** | A- | A | A | A | A | **A** | A | Excellent |
| **Slider** | B | **D+** | B+ | A | A- | B | C | B | No size/color/marks/tooltip |

---

## Critical Cross-Check: Size Consistency

**Height at `size="md"` (h-ds-md = 40px):**

| Component | Height at md | Has size prop? |
|-----------|-------------|---------------|
| Input | 40px | Yes (xs/sm/md/lg) |
| Select | 40px | Yes (xs/sm/md/lg) |
| Combobox | 40px (hardcoded) | **NO** |
| Autocomplete | 40px (hardcoded) | **NO** |
| NumberInput | ~36px | **NO** |
| InputOTP | 36px (fixed) | **NO** |

**Placing a `size="sm"` Input (32px) next to a Combobox (40px) in the same form row produces a visual mismatch.** This is the single most impactful cross-check failure.

## Critical Cross-Check: Border Treatment

| Component | Default Border | Focus Ring |
|-----------|---------------|------------|
| Input | `border-surface-border` (lighter) | `ring-offset-2` |
| Textarea | `border-surface-border-strong` | **No ring-offset** |
| Select | `border-surface-border-strong` | `ring-offset-2` |
| Combobox | `border-surface-border-strong` | `ring-offset-2` |
| Autocomplete | `border-surface-border-strong` | `ring-offset-[var()]` |

**Input uses a lighter border than all siblings.** One-line fix.

---

## Findings (Priority Order)

| # | Finding | Component | Priority | Effort |
|---|---------|-----------|----------|--------|
| 1 | **Combobox/Autocomplete missing `size` prop** | Combobox, Autocomplete | **P0** | M |
| 2 | **NumberInput missing `size` + `state` props** | NumberInput | **P0** | M |
| 3 | **Slider missing `size` + `color` axes** | Slider | **P0** | L |
| 4 | Input uses `border-surface-border` while siblings use `border-surface-border-strong` | Input | P1 | S |
| 5 | Textarea missing `ring-offset-2` on focus | Textarea | P1 | S |
| 6 | InputOTP missing size variants | InputOTP | P1 | M |
| 7 | ColorInput popover missing `role="dialog"` | ColorInput | P1 | S |
| 8 | Autocomplete uses absolute positioning (clips in overflow:hidden) | Autocomplete | P1 | M |
| 9 | Checkbox/Radio missing color axis | Checkbox, Radio | P2 | S |
| 10 | Input missing framer-motion parity with Textarea | Input | P3 | S |

## Top 3 Actions

1. **P0 — Add `size` prop to Combobox and Autocomplete** (M effort): Must match Input/Select xs/sm/md/lg scale for form row consistency.
2. **P0 — Rework NumberInput with size + state system** (M effort): Currently the weakest variant coverage in the entire DS.
3. **P0 — Add size + color to Slider** (L effort): Previous audit specifically flagged this as remaining work.
