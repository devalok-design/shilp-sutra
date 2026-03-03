# Design System Standardization Audit — Shilp-sutra vs MUI

**Date:** 2026-03-02
**Status:** Approved
**Scope:** Full foundation + component gap analysis

## Executive Summary

Comprehensive audit of @devalok/shilp-sutra design system foundations compared against MUI (Material UI). Identifies gaps in typography, color, spacing, layout, transitions, and components. Shilp-sutra has strong semantic color depth, vendored Radix primitives, and CSS-first theming — but critical gaps exist in typography accessibility (px vs rem), missing foundational components (Typography, Autocomplete, Chip, Stepper), and absent layout primitives (Stack, Container, Grid).

---

## 1. Typography

| Aspect | MUI | Shilp-sutra | Gap |
|--------|-----|-------------|-----|
| Units | rem (respects browser font size) | px (ignores user preferences) | CRITICAL |
| Font family | Roboto + system fallback | Google Sans + Ranade accent + mono | OK (branded) |
| Named variants | 13 semantic: h1-h6, subtitle1-2, body1-2, button, caption, overline | 30+ opaque: T1-T7, B1-B8, L1-L6, P1-P7 | OVER-COMPLEX |
| Variant naming | Semantic (h1, body1, caption) | Opaque codes (T5, B2, P3) | POOR DX |
| Weight tokens | 4 named: light/regular/medium/bold | Inline in classes, no named tokens | MISSING |
| Responsive type | responsiveFontSizes() utility | 1 mobile override for T5 only | MISSING |
| Typography component | `<Typography variant="h1">` | None — raw CSS classes only | MISSING |

## 2. Color Palette

| Aspect | MUI | Shilp-sutra | Gap |
|--------|-----|-------------|-----|
| Primitive scale | grey 50-900 | 7 families × 10 shades | STRONGER |
| Semantic model | 6 intentions × 4 tokens | Rich: interactive, accent, text, icon, border, field, layer, tag, status | STRONGER |
| Auto-computation | augmentColor() | Manual mapping | Missing utility |
| Contrast utilities | getContrastText(), contrastThreshold | None | MISSING |
| Action states | Explicit hover/selected/disabled/focus + opacity | Per-component only | MISSING |
| Dark mode | Auto-inverted | Manual `.dark` class override | OK (more control) |

## 3. Spacing

| Aspect | MUI | Shilp-sutra | Gap |
|--------|-----|-------------|-----|
| Base unit | 8px multiplier | Named tokens 01-13 | Different approach |
| Scale | Linear: factor × 8px | Non-linear: 2-160px with 02b/05b oddities | NAMING issue |
| Consistency | Predictable | Irregular half-steps (02b, 05b) | MEDIUM |

## 4. Breakpoints

| Aspect | MUI | Shilp-sutra | Gap |
|--------|-----|-------------|-----|
| Values | xs:0, sm:600, md:900, lg:1200, xl:1536 | Tailwind defaults | Different (OK) |
| Custom tokens | Explicit in theme | No custom tokens | NO TOKENS |
| Utilities | up(), down(), between(), only() | Tailwind responsive prefixes | OK for Tailwind |

## 5. Shadows

5 levels + brand shadow — simpler than MUI's 25 but sufficient. Named semantics are better. No gap.

## 6. Z-Index

Comparable scale. Shilp-sutra's `raised: 10` is a nice addition.

## 7. Transitions

| Aspect | MUI | Shilp-sutra | Gap |
|--------|-----|-------------|-----|
| Duration scale | 7 named | 6 named | OK |
| Enter/exit asymmetry | Explicit tokens | No distinction | MISSING |
| Easing curves | 4 | 5 (includes bounce) | BETTER |
| Transition components | Fade, Slide, Collapse, Grow, Zoom | None | MISSING |
| Reduced motion | Per-component | Global override | BETTER |

## 8. Border Radius

8-value scale — richer than MUI's single global value. No gap.

## 9. Missing Foundational Systems

| System | Priority |
|--------|----------|
| Typography component | HIGH |
| Action state tokens | HIGH |
| Density system | MEDIUM |
| Layout primitives (Stack, Container, Grid) | MEDIUM |
| Transition animation components | HIGH |
| Breakpoint CSS tokens | LOW |

## 10. Missing Components (vs MUI)

| Component | Priority |
|-----------|----------|
| Autocomplete (combobox) | HIGH |
| Chip (interactive tag) | HIGH |
| Stepper (multi-step workflow) | HIGH |
| Typography (text rendering) | HIGH |
| Transition components (Fade, Slide, Collapse, Grow) | HIGH |
| List (structured) | MEDIUM |
| Rating | MEDIUM |
| Stack | MEDIUM |
| Container | MEDIUM |
| Grid | MEDIUM |
| FAB | LOW |
| Speed Dial | LOW |
| Image List | LOW |
| Backdrop | LOW |
| Paper | LOW |
| Transfer List | LOW |

## 11. Internal Consistency Issues

| Issue | Severity |
|-------|----------|
| px typography — breaks browser font scaling | CRITICAL |
| Opaque type names (T5, B2, P3) | HIGH |
| Redundant type classes (B1 vs P2 vs B5) | HIGH |
| No Typography component | HIGH |
| 02b/05b spacing naming | MEDIUM |
| Missing action state tokens | MEDIUM |
| No transition components | MEDIUM |
| No layout primitives | MEDIUM |
| Inconsistent icon sizing (16/20/24/32 vs expected 16/24/32) | LOW |

## 12. Shilp-sutra Strengths Over MUI

- CSS custom properties first — RSC-compatible, no JS runtime for theming
- Semantic color depth — icon, field, layer, tag, border categories
- Vendored Radix — zero @radix-ui runtime deps
- CVA variants — type-safe, Tailwind-native
- Dark mode completeness — full manual mapping
- Brand shadow — design-forward
- Global reduced motion — single override
- Named z-index — readable semantic names
- Domain components — kanban, chat, admin
