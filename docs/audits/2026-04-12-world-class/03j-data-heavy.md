# Data-Heavy & Charts Audit -- Phase 3, Groups J+K

**Phase:** 3j + 3k
**Auditor:** Claude
**Date:** 2026-04-12

## Group J — Data-Heavy: Overall Rating: A- (DataTable excellent, TreeView strong a11y)
## Group K — Charts: Overall Rating: B (Good token integration, weak a11y and tests)

---

## Group J Key Findings

| Component | Overall | Key Finding |
|-----------|---------|-------------|
| **DataTable** | A- | Feature-rich (sort, filter, paginate, select, expand, virtual, mobile card). Missing aria-busy on loading |
| **Table** | B+ | Clean primitive. No row border separators by default. No variant axis |
| **FilterBar** | B+ | Clean context-propagated size. Fixed widths may clip long labels |
| **TreeView** | B+ | Excellent a11y (full ARIA tree pattern + keyboard). Hardcoded pixel indentation |

## Group K Key Findings

| Component | Overall | Key Finding |
|-----------|---------|-------------|
| **All Charts** | B | Good D3+React architecture. Token colors via chart-1..8. Mouse-only tooltips (no keyboard a11y). No screen reader data fallback. Shallow tests |
| **ChartContainer** | A- | Smart ResizeObserver render-function pattern |
| **GaugeChart** | B+ | Uses `role="meter"` with full ARIA — best a11y in chart group |
| **Sparkline** | B+ | 3 variants (line/bar/area). Path draw animation |

---

## P1 Findings

| # | Component | Finding | Priority | Effort |
|---|-----------|---------|----------|--------|
| 1 | All Charts | **Keyboard tooltip access missing** — tooltips are mouse-only. Screen reader/keyboard users can't discover values | **P1** | M |
| 2 | All Charts | **No data fallback for screen readers** — `role="img"` + label is bare minimum. Need `<desc>` or hidden data table | **P1** | M |
| 3 | DataTable | **No `aria-busy` on loading state** | **P1** | S |
| 4 | TreeView | **Hardcoded pixel indentation** — `paddingLeft: depth * 20 + 8` should use DS tokens | **P1** | S |

## P2 Findings

| # | Component | Finding | Priority | Effort |
|---|-----------|---------|----------|--------|
| 5 | BarChart | Inconsistent multi-series API (parallel arrays vs Series object) | P2 | M |
| 6 | All Charts | Tests are shallow — no tooltip, multi-series, stacked, empty data, reduced motion tests | P2 | L |
| 7 | Table | No row border separators by default | P2 | S |
| 8 | DataTable | No tests for inline editing or mobile card view | P2 | M |
| 9 | `_internal/scales.ts` | Dead code — exported utilities never imported by any chart | P2 | S |
| 10 | Charts | Fixed height, no responsive height or aspect-ratio option | P2 | M |
| 11 | PieChart | Label contrast issue on light-colored slices | P2 | S |

## Cross-Checks

**Selection pattern:** DataTable uses TanStack Table selection (controlled/uncontrolled). TreeView uses custom `useTree` hook with `Set<string>`. Patterns consistent within each but not unified.

**Sort indicator:** DataTable uses Framer Motion AnimatePresence for icon swap with rotation. Correct `aria-sort` on `<th>`. Well-polished.

**Charts use token colors:** Yes. All charts use `chart-1` through `chart-8` semantic tokens via `resolveColor()`. Grid/axes/tooltips use semantic surface tokens. Well-integrated.

**Charts responsive:** Width adapts via ResizeObserver but height is fixed. No tick culling for narrow viewports. Axis labels may overlap.

**Charts accessible:** Minimal. `role="img"` + `aria-label` present. No keyboard tooltip, no data table fallback, no `<desc>` element. GaugeChart is the exception with proper `role="meter"`.

---

## Summary Table

| Component | API | Variants | Visual | Dark | A11y | Responsive | Motion | Tests | Overall |
|-----------|-----|----------|--------|------|------|------------|--------|-------|---------|
| DataTable | A- | B | B+ | A- | A- | A- | B+ | A | **A-** |
| Table | A | C+ | B+ | A | A | B | N/A | A- | **B+** |
| FilterBar | A- | B+ | B+ | A- | B+ | B- | B+ | B+ | **B+** |
| TreeView | A | C+ | B | A- | **A** | C | B | A | **B+** |
| Charts (all) | A- | B- | B+ | A- | **B** | B- | B+ | B- | **B** |

## Top 3 Actions

1. **P1 — Chart keyboard tooltip access** (M effort): Add focus-based tooltip via tabindex'd hit areas. Critical a11y gap.
2. **P1 — Chart screen reader data fallback** (M effort): Add `<desc>` with data summary or hidden data table.
3. **P1 — TreeView token indentation** (S effort): Replace hardcoded `depth * 20 + 8` with DS spacing tokens.
