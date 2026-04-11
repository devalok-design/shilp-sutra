# Phase 2e: Linting & Type Safety Audit

**Phase:** 2e
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Strong (with one Gap in module boundaries)

TypeScript strict mode with only 11 `as any` in production source (all at library boundaries). 91.7% prop type export coverage enforced by custom CI script. ESLint covers a11y + hooks + TS. Main gaps: missing import ordering, type-aware linting, and one unenforced module boundary.

---

## Findings

### 1. TypeScript Strictness
**Rating:** Strong
`strict: true` enabled. 0 `@ts-ignore` in production source. 11 `as any` (all defensible: Tabler icons, D3 scales, TipTap commands). Missing `noUncheckedIndexedAccess` (Mantine enables it).
**Priority:** P2 | **Effort:** M

### 2. Exported Types
**Rating:** World-Class
89/97 component files export Props. All 8 gaps are internal sub-components or context providers. Custom `check-props-exports.mjs` CI script enforces barrel re-exports. Discriminated unions used correctly (Combobox, StatusBadge).

### 3. ESLint Config
**Rating:** Adequate
Has: typescript-eslint recommended, react-hooks, jsx-a11y (5 rules downgraded to warn). Missing: import ordering plugin, type-aware linting (`recommendedTypeChecked`), Prettier in CI, `eslint-plugin-react`. `no-explicit-any` is warn not error (could tighten — only 11 instances).
**Priority:** P1 (import ordering) / P2 (type-aware) | **Effort:** S-M

### 4. Module Boundaries
**Rating:** Gap
`composed/ -> shell/` boundary documented in CONTRIBUTING.md but NOT enforced in ESLint. No violations exist today but guardrail is absent. Stale `karm/` boundary rules reference removed package.
**Priority:** P1 | **Effort:** S

### 5. Generic Constraints
**Rating:** Strong
`DataTable<TData, TValue>` properly generic through context chain. Combobox discriminated union. Container polymorphic. No misuse of `any` where generics needed.

---

## Summary Table

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | TypeScript strictness | **Strong** | P2 | M |
| 2 | Exported types | **World-Class** | N/A | N/A |
| 3 | ESLint config | **Adequate** | P1-P2 | S-M |
| 4 | Module boundaries | **Gap** | P1 | S |
| 5 | Generic constraints | **Strong** | N/A | N/A |
