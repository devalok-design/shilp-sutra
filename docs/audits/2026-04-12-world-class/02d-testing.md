# Testing Infrastructure Audit -- Phase 2d

**Phase:** 2d
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Strong (with World-Class a11y testing)

229 test files, ~2,165 test cases, ~24,000 lines of test code. World-class accessibility testing (42 dedicated a11y files, 62% of tests use axe). Modern patterns (semantic queries, userEvent, zero snapshots). Main gaps: no coverage thresholds, no real-browser E2E for complex components, Chromatic may not be active.

---

## Key Metrics

| Metric | Value |
|---|---|
| Test files | 229 |
| Test cases | ~2,165 |
| Files using `axe()` | 143 (62%) |
| Files using `userEvent` | 64 (28%) |
| Keyboard test files | 41 |
| Semantic query files | 103 |
| Snapshot tests | 0 (correct choice) |
| Dedicated a11y files | 42 |

---

## Findings

### 1. Coverage Depth
**Rating:** Strong
Near 1:1 test-to-source ratio. But no coverage config in core vitest, no thresholds enforced, no CI coverage reporting.
**Priority:** P2 | **Effort:** M

### 2. Test Patterns
**Rating:** Strong
103 files use semantic queries (getByRole). 64 use userEvent (recommended). Well-crafted render helpers. No setTimeout hacks. Zero snapshots (correct). Minor: split between co-located and `__tests__/` not documented.
**Priority:** P2 | **Effort:** S

### 3. Accessibility Testing
**Rating:** World-Class
42 dedicated a11y test files. 143 files invoke axe (62%). Tests cover open/closed states for interactive components. TreeView verifies full ARIA roles + keyboard nav. `fileParallelism: false` for axe singleton awareness. **Exceeds most open-source DS.**

### 4. Keyboard Testing
**Rating:** Strong
41 files test keyboard. TreeView has full arrow-key nav. Dialog/Sheet test Escape. Select tests Enter/Space. Gap: no Tab focus-trap verification for modals. No keyboard-only flows for Slider, ToggleGroup, RadioGroup.
**Priority:** P2 | **Effort:** M

### 5. Snapshot Testing
**Rating:** Adequate (by design)
Zero snapshots — correct for Tailwind/CVA where class strings change often. Uses assertion-based class checking instead. Right architecture when combined with Chromatic.

### 6. Mock Quality
**Rating:** Strong
Well-organized test-setup.ts with guarded mocks: ResizeObserver, matchMedia, pointerCapture, scrollIntoView. Each explained with comments. Minimal no-op stubs (correct for jsdom).

### 7. E2E Testing
**Rating:** Adequate
No dedicated E2E suite. Partially compensated by Storybook browser tests (Playwright via @vitest/browser) and SSR smoke test. No "open Dialog, fill form, submit, verify Toast" type flows.
**Priority:** P1 | **Effort:** L

### 8. Visual Regression
**Rating:** Adequate
Chromatic configured in CI but needs CHROMATIC_PROJECT_TOKEN secret (may not be active). Even if running, no hard gate — human review only.
**Priority:** P1 | **Effort:** M

### 9. Performance Testing
**Rating:** Gap
No render benchmarks, no vitest.bench.ts, no render-time measurement. Only bundle size budget (5MB) exists.
**Priority:** P2 | **Effort:** M

---

## Summary Table

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | Coverage depth | **Strong** | P2 | M |
| 2 | Test patterns | **Strong** | P2 | S |
| 3 | A11y testing | **World-Class** | — | — |
| 4 | Keyboard testing | **Strong** | P2 | M |
| 5 | Snapshots | **Adequate** | P3 | S |
| 6 | Mock quality | **Strong** | P3 | S |
| 7 | E2E testing | **Adequate** | P1 | L |
| 8 | Visual regression | **Adequate** | P1 | M |
| 9 | Performance testing | **Gap** | P2 | M |

## Top 3 Actions

1. **P1 — Verify Chromatic is active + add PR status check:** If secret is missing, visual regression is aspirational only.
2. **P1 — Add Storybook play functions for complex components:** DataTable, CommandPalette, DatePicker need real-browser interaction tests.
3. **P2 — Add coverage thresholds to vitest.config.ts:** Prevent regression. Add CI coverage reporting.
