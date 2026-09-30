# Ecosystem Deep Audit — Design Document

**Date:** 2026-04-06
**Scope:** Full shilp-sutra design system — tokens, primitives, 100+ components, build, docs
**Standards:** WCAG 2.2 AA, WAI-ARIA APG, React DX best practices, bundle/perf, SSR safety, documentation completeness

## Motivation

The design system has grown to 100+ components across 4 layers (ui, composed, shell, ai) with strong foundations — pre-publish gates, vitest-axe on every component, 95% CONTRIBUTING.md compliance. Previous audits (March 1, March 13, April 6) addressed specific gaps but checked narrower criteria each time.

This audit applies the full set of international standards to every layer of the system. The goal is not incremental improvement but verification that each component **exceeds** WCAG 2.2 AA, APG keyboard patterns, and modern React DX standards.

## Approach: Foundation-First, Then Component-by-Component

**Phase 1 -> Phase 2 -> Phase 3** — fix the foundation before auditing individual components, then sweep for cross-cutting gaps.

---

## Phase 1: Foundation Audit (Bottom-Up)

### 1a. Token System

| Check | Standard | Method |
|-------|----------|--------|
| Contrast ratios: `color-text-*` on `surface-*` | WCAG 1.4.3 (4.5:1 normal, 3:1 large), WCAG 1.4.11 (3:1 UI) | Extract computed values from primitives.css + semantic.css, calculate ratios |
| Dark mode parity | WCAG 1.4.3 | Every semantic token must have a `.dark` variant; dark contrasts must also pass |
| Naming consistency | Internal | No orphaned primitives, no semantic tokens referencing missing primitives |
| Completeness | Internal | Verify `color-text-on-*` exists for every accent/status background |

### 1b. Vendored Primitives

| Check | Standard | Method |
|-------|----------|--------|
| APG compliance | WAI-ARIA APG 1.2 | Compare vendored Radix behavior against current APG patterns per widget |
| Focus management | WCAG 2.4.3, 2.4.7 | Focus trap in dialogs, focus restoration on close, scroll lock |
| Known upstream bugs | N/A | Check Radix GitHub issues for bugs affecting vendored versions |

### 1c. Build Pipeline

| Check | Standard | Method |
|-------|----------|--------|
| `"use client"` correctness | Next.js RSC | Every annotated file needs it; every client-only file has it |
| SSR smoke test coverage | SSR safety | Verify render-body crashes are caught (known gap) |
| Tree-shaking | Bundle perf | Verify unused components are eliminated in consumer builds |
| Export map completeness | Node.js subpath exports | Every `package.json` exports entry resolves; no missing subpaths |
| Chunk boundaries | Bundle perf | Vendor splits intentional, no accidental cross-chunk deps |

### 1d. Tailwind Preset

| Check | Standard | Method |
|-------|----------|--------|
| Token-to-utility mapping | Internal | Every semantic token has a Tailwind utility class |
| No hardcoded values | Internal | No raw hex/rgb in component source files |
| CJS/ESM dual export | Node.js | Works in both Next.js (require) and Vite (import) consumers |

---

## Phase 2: Component-by-Component Deep Audit

Every component in `ui/` -> `composed/` -> `shell/` -> `ai/` scored against 6 dimensions.

### 2a. WCAG 2.2 AA Compliance

- **1.4.3 Contrast (Minimum):** All states (default, hover, focus, disabled, error) meet 4.5:1 text / 3:1 large text
- **1.4.11 Non-text Contrast:** UI component boundaries and states meet 3:1
- **2.5.8 Target Size (Minimum):** Interactive elements >= 24x24px
- **2.4.7 Focus Visible:** Every focusable element has visible focus indicator at 3:1 contrast
- **1.3.1 Info and Relationships:** Form errors announced via `aria-describedby` / `aria-invalid`
- **2.3.3 Animation from Interactions:** Animations respect `prefers-reduced-motion`
- **1.4.10 Reflow:** No horizontal scroll at 320px width / 400% zoom

### 2b. APG Keyboard Patterns

- Keyboard interaction matches WAI-ARIA APG for the component's role
- No keyboard traps (WCAG 2.1.2)
- No pointer-only interactions (WCAG 2.1.1)
- Roving tabindex where APG specifies (radio groups, tabs, toolbars)

### 2c. API/DX Quality

- CONTRIBUTING.md 8-item checklist (forwardRef, displayName, className, props spread, CVA, exported types, test, story)
- Compound pattern where appropriate (>8 props or 2+ independent sections)
- Prop naming consistency (`variant`, `size`, `color` — not mixed naming)
- TypeScript generics where appropriate (Select, Combobox, DataTable)

### 2d. Test Quality

- Meaningful behavioral assertions (not just "renders without crashing")
- Keyboard interaction tested (Tab, Enter, Escape, Arrows)
- Error/edge states tested (empty, overflow, disabled, loading)
- `toHaveNoViolations()` in interactive states, not just default render

### 2e. Bundle & SSR

- `@server-safe` annotation correct
- No side effects at import time
- No unnecessary heavy dependency pulls

### 2f. Documentation

- Storybook story with `tags: ['autodocs']`
- All props visible in docs
- Key variants/states demonstrated

### Scoring

Each component x 6 dimensions -> **Pass / Needs Fix / Critical**

Output: sortable matrix, prioritized by severity.

---

## Phase 3: Cross-Cutting Sweep

### 3a. Documentation Completeness

- `llms.txt` / `llms-full.txt` accuracy against actual exports
- Storybook coverage: components without stories or missing interactive controls
- Storybook MDX guides (getting started, pattern recipes)
- JSDoc on exported type interfaces

### 3b. Test Suite Health

- False-pass detection (vacuous assertions, wrong element queries)
- Coverage gap matrix (which components lack keyboard / error state / a11y-in-state tests)
- Test isolation (state leaks, order dependencies)

### 3c. Bundle Analysis

- Total + per-chunk size breakdown
- Heaviest components: tree-shakeable?
- Duplicate dependencies across chunks
- Font payload assessment

### 3d. Consumer Integration

- Next.js App Router SSR end-to-end
- Vite consumer Tailwind preset resolution
- Subpath export completeness

### 3e. Security and Hygiene

- No unsanitized innerHTML usage
- No hardcoded secrets/URLs
- Vendored dependency vulnerability check

---

## Output Deliverables

1. **Foundation report** — token contrast matrix, primitives gap list, build issues
2. **Component scorecard** — every component x 6 dimensions, graded
3. **Cross-cutting findings** — system-wide issues by severity
4. **Fix plan** — prioritized: Critical -> Systemic -> Per-component
