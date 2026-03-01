# Comprehensive Design System Review — 2026-03-01

## Overall Health Score: 6.8/10

| Dimension | Score | Status |
|-----------|-------|--------|
| Component Inventory & Exports | 9.0 | Excellent |
| Storybook Stories | 8.2 | Very Good |
| Token/Theming System | 7.8 | Good |
| TypeScript & API Consistency | 7.5 | Good |
| CSS/Styling Patterns | 8.8 | Excellent |
| Accessibility | 6.5 | Needs Work |
| Documentation | 6.3 | Fair |
| Testing | 0.0 | **CRITICAL** |
| Dependencies | 7.0 | Good |
| Lint/Format Config | 8.0 | Good |
| CI/CD | 6.0 | Minimal |

---

## CRITICAL FINDINGS (Must Fix)

### 1. Zero Test Coverage
- **No test files exist** — no `.test.ts`, `.test.tsx`, `.spec.ts` anywhere
- No test runner configured (Vitest/Jest)
- `@testing-library/jest-dom` installed but unused
- 95 Storybook stories have **zero play() functions** — purely visual documentation
- No visual regression testing (no Chromatic/Percy)

### 2. Accessibility Gaps
- **`prefers-reduced-motion` not respected** — ripple, shake, slide animations play regardless
- **Toast missing `role="status"` / `aria-live`** — screen readers miss notifications
- **Form inputs missing `aria-invalid`, `aria-describedby`** — error states invisible to AT
- **Calendar date cells**: `<div role="button">` without aria-label or keyboard navigation
- **Pink-500 on white: 3.8:1 contrast** — fails WCAG AA (needs 4.5:1)

### 3. No CHANGELOG / Migration Guides
- No versioning history for consumers
- Breaking change (AdminDashboard compound component refactor) undocumented
- No CONTRIBUTING.md

### 4. CI/CD Only Deploys Storybook
- No lint step, no type check, no library build validation, no security audit in pipeline

---

## HIGH PRIORITY FINDINGS

### 5. Token Gaps in Tailwind Preset
13 spacing tokens and 9 sizing tokens defined in CSS but **not exposed to Tailwind**, forcing developers to use verbose arbitrary value syntax:
```tsx
// Current (verbose)
className="gap-[var(--spacing-03)] h-[var(--size-md)]"
// Could be (with preset exposure)
className="gap-sp-03 h-size-md"
```
Also missing: border width tokens, icon size tokens, focus tokens.

### 6. Duplicate DashboardSkeleton
Two separate implementations exported:
- `src/shared/page-skeletons.tsx` (shared module)
- `src/karm/admin/dashboard/dashboard-skeleton.tsx` (karm/admin module)

Both reach consumers — confusing.

### 7. Admin Components Have Zero Stories (22 components)
- break-admin, break-balance, breaks, edit-break, edit-break-balance, delete-break
- leave-request, leave-requests, break-request
- attendance-overview, associate-detail, correction-list
- calendar, render-date, dashboard-skeleton, dashboard-header
- **AdminDashboard compound component** (recently refactored) — no documentation of new API

### 8. Form Accessibility Missing Across the Board
- `src/ui/input.tsx` — has `state` prop (error/warning/success) but no `aria-invalid` mapping
- `src/ui/label.tsx` — no `aria-required` enforcement
- All karm admin forms — no `aria-describedby` linking inputs to error messages
- No `aria-errormessage` attribute anywhere

---

## MEDIUM PRIORITY FINDINGS

### 9. TypeScript Quality Issues
- 4 `any` type casts: `attendance-overview.tsx` (2), `render-date.tsx` (1), `edit-break-balance.tsx` (1)
- 7 components missing `displayName` (AvatarStack, DataTable, Skeleton, StatCard, etc.)
- Some component prop types not exported (AvatarStackProps, DataTableProps)
- React import style inconsistent (`import * as React` vs `import { useState }`)

### 10. Callback Naming Inconsistency
| Pattern | Used By |
|---------|---------|
| `onChange` | Button, NumberInput, SearchInput, Input |
| `onValueChange` | RadioGroup, Select |
| `onCheckedChange` | Checkbox, Switch, Toggle |
| `onSelect` | CommandPalette, AdminDashboard |
| `onOpenChange` | Dialog, Popover |

No standard convention established.

### 11. Z-Index Violations
- `src/karm/admin/break/leave-request.tsx` — uses `z-[999999]` (2 occurrences) instead of `z-tooltip`
- `edit-break.tsx` — uses `z-[4]` instead of `z-dropdown`
- Semantic z-index scale exists but not enforced

### 12. Minimal Stories for Complex Components
These have 1-2 stories when they need 5+:
- NavigationMenu, Menubar, DataTable, RichTextEditor
- Collapsible, AspectRatio, HoverCard
- NumberInput, SearchInput, InputOTP

### 13. `--color-danger` vs `--color-error` Duplication
Both defined in semantic.css with same values. Should pick one convention.

### 14. ESLint a11y Rules Downgraded to Warn
All `jsx-a11y` rules set to `warn` instead of `error` — reduces enforcement for a design system that should be accessible by default.

### 15. No Import Sorting Rules
No `eslint-plugin-import` configured — imports are manually ordered.

---

## LOW PRIORITY / NICE-TO-HAVE

### 16. Unexported Utilities
- `src/shared/lib/string-utils.ts` (getInitials) — not exported from shared/index.ts
- `src/karm/admin/icons.tsx` — internal icon mappings not documented as internal-only
- `src/hooks/` (use-mobile, use-toast) — not exported from public API

### 17. CVA Adoption Gap in karm/
- `CustomButton.tsx` has hardcoded state variant maps instead of CVA
- karm/ module has 0 CVA usage vs ui/ with 7 CVA components

### 18. Inline Styles (301 occurrences, 56 files)
- 85% justified (dynamic ripple positions, sidebar state, editor heights)
- 15% (~45) could be tokenized (dashboard skeleton calc values, etc.)

### 19. Sidebar Uses Hardcoded `duration-200` Instead of Semantic Token
Should be `duration-[var(--duration-moderate)]`.

### 20. No Storybook MDX Documentation Pages
- No introduction/overview page
- No design token documentation page
- No component status/maturity matrix

### 21. Heavy Dependencies for Single Components
- TipTap (~500KB) for RichTextEditor only
- @tanstack/react-table for DataTable only
- @dnd-kit for KanbanBoard only
- (All properly externalized, but consumers must install)

---

## WHAT'S WORKING WELL

### Architecture
- Clean 3-tier token system: primitives.css → semantic.css → Tailwind preset
- Module boundaries enforced: ui → shared → layout → karm
- Radix UI properly vendored in `src/primitives/`
- 98% export completeness (138/141 components)

### Styling
- **99.8% Tailwind** — zero CSS Modules, zero styled-components
- `cn()` (clsx + twMerge) used consistently everywhere
- Zero hardcoded hex colors in components
- Zero `@apply` directives in CSS files

### Dark Mode
- 100% of color tokens have dark variants
- Shadow opacity properly adjusted for dark mode
- Storybook dark mode toggle integrated

### TypeScript
- **Zero `@ts-ignore` or `@ts-expect-error`** comments
- Strict mode enabled globally
- CVA VariantProps properly used in all variant components
- className merging follows `cn(base, conditionals, className)` everywhere

### Storybook
- 95 story files covering 72% of components
- Proper TypeScript typing (Meta + StoryObj)
- Good composite stories (AllVariants, AllStates patterns)
- Dark mode, a11y addon, React docgen all configured
- Next.js mocks properly set up

### Build
- 11 entry points with proper tree-shaking
- CSS code splitting enabled
- All heavy deps externalized
- ES module output

---

## RECOMMENDED ACTION PLAN

### Phase 1: Critical Infrastructure (Week 1)
1. Set up Vitest with proper config
2. Add `prefers-reduced-motion` media query to tokens/global CSS
3. Add `role="status" aria-live="polite"` to Toast component
4. Create CI pipeline: lint → typecheck → build → deploy
5. Create CHANGELOG.md

### Phase 2: Accessibility Fixes (Week 2)
6. Add `aria-invalid` + `aria-describedby` to Input component
7. Add aria-labels to calendar date cells + keyboard navigation
8. Fix pink-500 contrast (use pink-700 for foreground text)
9. Convert `role="button"` divs to `<button>` elements
10. Elevate ESLint a11y rules from warn to error

### Phase 3: Testing Foundation (Week 2-3)
11. Write unit tests for 20 critical UI components
12. Add play() functions to 15 interactive Storybook stories
13. Set up visual regression testing (Chromatic)
14. Add axe-core automated a11y testing

### Phase 4: Token & API Polish (Week 3)
15. Expose spacing/sizing tokens to Tailwind preset
16. Resolve DashboardSkeleton duplication
17. Resolve `--color-danger` vs `--color-error`
18. Standardize callback naming convention
19. Fix z-index violations (leave-request.tsx, edit-break.tsx)
20. Add displayName to 7 missing components

### Phase 5: Documentation (Week 4)
21. Create AdminDashboard compound component stories
22. Write stories for remaining 22 admin components
23. Create Storybook MDX: intro page, token docs, component status
24. Create CONTRIBUTING.md and migration guide
25. Enhance minimal stories (NavigationMenu, Menubar, DataTable, etc.)

---

## DETAILED FINDINGS BY DIMENSION

### A. Component Inventory & Exports (9.0/10)

| Module | Files | Exported | Coverage |
|--------|-------|----------|----------|
| UI | 51 | 51 | 100% |
| Shared | 13 | 13 | 100%* |
| Layout | 6 | 6 | 100% |
| Karm/Board | 4 | 4 | 100% |
| Karm/Tasks | 7 | 7 | 100% |
| Karm/Chat | 5 | 5 | 100% |
| Karm/Dashboard | 2 | 2 | 100% |
| Karm/Client | 3 | 3 | 100% |
| Karm/Custom-Buttons | 6 | 6 | 100% |
| Karm/Admin | 21 | 21 | 100%** |
| **Total** | **141** | **138** | **98%** |

*string-utils.ts not exported
**icons.tsx intentionally internal

### B. Storybook Stories (8.2/10)

| Module | Components | With Stories | Coverage |
|--------|-----------|-------------|----------|
| UI | 46 | 41 | 89% |
| Shared | 14 | 14 | 100% |
| Layout | 6 | 6 | 100% |
| Karm (non-admin) | 34 | 34 | 100% |
| Karm/Admin | 22 | 0 | **0%** |
| **Total** | **132** | **95** | **72%** |

Story quality breakdown:
- 24 stories: Excellent (8+ variants, edge cases, composites)
- 45 stories: Good (3-7 variants)
- 18 stories: Minimal (1-2 variants, needs enhancement)

### C. Token System (7.8/10)

- 78 primitive color tokens (12 scales, 9-11 shades each)
- 247 semantic tokens (colors, spacing, sizing, radius, timing, easing, shadows, z-index)
- 100% dark mode coverage for all color tokens
- Zero hardcoded values in components
- **Gap**: Spacing (13), sizing (9), border width (3), icon size (4) tokens not in Tailwind preset

### D. TypeScript & API (7.5/10)

| Pattern | Consistency |
|---------|------------|
| forwardRef | 43/51 UI components |
| className | 100% accept and merge |
| Spread props | 100% |
| CVA variants | Consistent in ui/, absent in karm/ |
| displayName | 44/51 (7 missing) |
| Zero @ts-ignore | 100% clean |
| any casts | 4 total |

### E. CSS/Styling (8.8/10)

- 99.8% Tailwind with cn() utility
- Zero CSS Modules, zero styled-components
- 13 CVA components with consistent patterns
- 301 inline styles (85% justified for dynamic values)
- 3 z-index violations out of hundreds of usages

### F. Accessibility (6.5/10)

| Category | Score |
|----------|-------|
| ARIA Attributes | 7/10 |
| Keyboard Navigation | 8/10 |
| Focus Management | 9/10 |
| Semantic HTML | 8/10 |
| Screen Reader | 5/10 |
| Color Contrast | 6/10 |
| Reduced Motion | 0/10 |

### G. Documentation, Testing & Deps (5.5/10)

- Documentation: 6.3/10 (README exists, no CHANGELOG/CONTRIBUTING/migration guides)
- Testing: 0/10 (zero test files, framework installed but unconfigured)
- Dependencies: 7/10 (clean, properly externalized, TipTap heavy)
- Lint/Format: 8/10 (good setup, a11y rules too lenient, no import sorting)
- CI/CD: 6/10 (Storybook deploy only, no quality gates)
