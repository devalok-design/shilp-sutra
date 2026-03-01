# Shilp-Sutra Design System Audit - Design Document

**Date:** 2026-03-01
**Goal:** Identify and fix pain points + build a comprehensive baseline audit
**Output:** Structured report first, then systematic fixes by priority
**Approach:** Parallel deep-dive with cross-domain synthesis

---

## Scope

Comprehensive audit of all 103 components across 4 modules (ui, shared, layout, karm), the three-tier token system, Storybook documentation, and overall architecture.

## Phase 1: Parallel Domain Audits (8 Agents)

Each agent produces findings with severity: **Critical** / **Major** / **Minor** / **Note**

### Agent 1 - Token & Theming
- Primitive token completeness (color scales, spacing, sizing)
- Semantic token mapping correctness (light to dark)
- WCAG contrast ratio validation for all text/background pairings
- Unused or orphaned tokens
- Missing token categories (focus rings, disabled states, etc.)
- Tailwind preset alignment with token definitions
- Typography scale consistency and usage

### Agent 2 - Component API & Patterns
- Prop naming consistency across all 103 components
- TypeScript type quality (unions vs enums, optional vs required, generics)
- Composition patterns (forwardRef, asChild, displayName)
- Event handler conventions (onChange, onValueChange, etc.)
- Default values and fallback behavior
- 'use client' directive correctness

### Agent 3 - Visual & UX
- Component state completeness (hover, focus, active, disabled, loading, error, empty)
- Spacing and alignment consistency
- Color usage adherence to token system (hardcoded values)
- Animation/transition consistency
- Responsive behavior
- Icon sizing and alignment

### Agent 4 - Accessibility
- ARIA attribute correctness (roles, labels, descriptions)
- Keyboard navigation patterns (Tab, Escape, Arrow keys)
- Focus management and focus trap behavior
- Screen reader announcements (live regions, status messages)
- Color-only information conveyance
- Touch target sizes
- Radix UI primitive usage correctness

### Agent 5 - Code Quality, DX & Performance
- Dead code and unused exports
- Bundle size concerns (heavy deps, tree-shaking effectiveness)
- Import cycle detection
- ESLint/Prettier configuration gaps
- Build configuration optimization
- Dependency audit (outdated, vulnerable, unnecessary)
- cn() utility usage patterns
- Bundle analysis

### Agent 6 - Architecture & Scalability
- Module boundary clarity (ui vs shared vs layout vs karm)
- Cross-module dependency leaks
- Export structure correctness
- Naming conventions across files/folders
- Component granularity assessment
- Extensibility patterns
- Error boundary patterns

### Agent 7 - Component Completeness Gap Analysis
- Missing common UI patterns (file upload, stepper, pagination, etc.)
- Domain patterns in karm that should be promoted to ui/shared
- Unused Radix primitives that could be wrapped
- Feature coverage vs common design system benchmarks

### Agent 8 - Documentation & Developer Experience
- Storybook story quality (variant coverage, state demos, edge cases)
- Prop documentation (TypeScript self-documentation, JSDoc)
- Usage guidelines and do/don't examples
- Component discoverability
- README completeness for new consumers
- Onboarding friction assessment

## Phase 2: Cross-Domain Synthesis

After all agents complete:
- Identify cross-cutting issues (token problem causing both a11y and visual issues)
- Map root causes - multiple findings sharing underlying causes
- Create fix dependency graph (fixing X unblocks Y and Z)
- Highlight patterns of systemic issues

## Phase 3: Final Report

Output to `docs/audit/`:
- `audit-report.md` - Executive summary + all findings by severity
- Findings organized by category with specific file:line references
- Recommended fix order (prioritized by impact and dependency)
- Quick wins vs structural changes
- Cross-domain issue map

## Severity Definitions

| Severity | Description |
|----------|-------------|
| Critical | Accessibility violations, broken functionality, security issues |
| Major | Significant inconsistencies, poor DX, missing states, contrast failures |
| Minor | Style inconsistencies, naming nitpicks, missing edge cases |
| Note | Suggestions, best practice recommendations, future improvements |
