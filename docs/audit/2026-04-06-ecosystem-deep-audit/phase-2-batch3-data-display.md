# Phase 2 / Batch 3 -- Data Display Components Audit

**Date:** 2026-04-06
**Auditor:** Claude Opus 4.6 (automated)
**Scope:** 27 data-display UI components in `packages/core/src/ui/`

---

## Summary Table

| # | Component | WCAG | APG KB | API/DX | Tests | Bundle/SSR | Docs | Overall |
|---|-----------|------|--------|--------|-------|------------|------|---------|
| 1 | Badge | P | P | P | P | P | P | **P** |
| 2 | BadgeGroup | P | P | P | P | P | P | **P** |
| 3 | BadgeIndicator | P | P | P | P | P | P | **P** |
| 4 | Avatar | P | P | P | P | P | P | **P** |
| 5 | Card | P | P | P | P | P | P | **P** |
| 6 | Table | P | P | P | P | P | P | **P** |
| 7 | DataTable | F | F | P | P | P | P | **F** |
| 8 | DataTableToolbar | P | P | P | P | P | P | **P** |
| 9 | StatCard | P | P | P | P | P | P | **P** |
| 10 | StatusDot | F | P | P | P | P | P | **F** |
| 11 | Code | P | P | P | P | P | P | **P** |
| 12 | Skeleton | P | P | P | P | P | P | **P** |
| 13 | Progress | P | P | P | P | P | P | **P** |
| 14 | ProgressRing | F | P | P | P | P | P | **F** |
| 15 | Spinner | P | P | P | P | P | P | **P** |
| 16 | Chip | P | P | P | P | P | P | **P** |
| 17 | ColorSwatch | P | P | P | P | P | P | **P** |
| 18 | DevalokGrain | P | P | F | P | P | P | **F** |
| 19 | ChartContainer | F | F | P | P | P | P | **F** |
| 20 | AreaChart | F | F | P | P | P | P | **F** |
| 21 | BarChart | F | F | P | P | P | P | **F** |
| 22 | LineChart | F | F | P | P | P | P | **F** |
| 23 | PieChart | F | F | P | P | P | P | **F** |
| 24 | RadarChart | F | F | P | P | P | P | **F** |
| 25 | GaugeChart | P | P | P | P | P | P | **P** |
| 26 | Sparkline | P | P | P | P | P | P | **P** |
| 27 | TreeView | P | P | P | P | P | P | **P** |

**Totals:** 16 Pass, 11 Fix needed, 0 Critical

---

## Per-Component Detail

### 1. Badge (`badge.tsx`)

**WCAG:** P -- Semantic HTML (`<span>`, `<button>`, or `<div role="button">` depending on interactivity). Dismiss button has `aria-label="Remove {text}"`. Focus ring via `focus-visible:ring-2`. Dot is `aria-hidden="true"`. Color contrast uses step-11 text on step-3 backgrounds and `*-fg` on step-9, which meet AA.

**Reduced motion:** F (minor) -- The dot pulse animation (`animate: { scale: [1, 2.5], opacity: [0.35, 0] }` with `repeat: Infinity`) does NOT check `prefers-reduced-motion` or `useReducedMotion`. BadgeIndicator correctly uses `useReducedMotion()` but the dot in Badge itself does not. This is a looping animation that should be suppressed. However, the badge dot is decorative (`aria-hidden`) and tiny, so severity is low.

**APG Keyboard:** P -- Interactive badges render as `<button>` or `div[role="button"]` with `tabIndex={0}`. Keyboard handler for Enter/Space on the `div[role="button"]` case. Dismiss button is a nested `<button>` that stops propagation correctly. When both `onClick` and `onDismiss` are provided, the outer is a `div[role="button"]` to avoid nested `<button>` -- good pattern.

**API/DX:** P -- `forwardRef`, `displayName`, `cn()`, CVA with exported `badgeVariants`, props spread, exported `BadgeProps` type. Compound component pattern via `Badge.Indicator` and `Badge.Group`.

**Tests:** P -- 16 tests across `badge.test.tsx` (13) and `badge-a11y.test.tsx` (7). Tests cover all variants, dot, dismiss, onClick, selected, disabled, truncate, circle, custom className. A11y tests use `toHaveNoViolations()` for all color variants and interactive states.

**Bundle/SSR:** P -- `'use client'` directive. Uses framer-motion (client-only). No `@server-safe` annotation (correct -- not server-safe due to framer-motion).

**Docs:** P -- Story exists (`badge.stories.tsx`) with BadgeIndicator and BadgeGroup coverage.

---

### 2. BadgeGroup (`badge-group.tsx`)

**WCAG:** P -- Renders as `<div>` with flex layout. Overflow badge is an `<Badge variant="outline">` which is accessible. No special ARIA needed for a container.

**APG Keyboard:** P -- N/A, container only. Overflow badge is clickable when `onOverflowClick` is provided.

**API/DX:** P -- `displayName` set. Props: `max`, `gap`, `size`, `onOverflowClick`, `className`, `children`. Uses `cn()`. Not `forwardRef` but as a simple container that's acceptable.

**Tests:** P -- Covered in `badge.test.tsx` BadgeGroup describe block (3 tests: all children, overflow).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Included in badge stories.

---

### 3. BadgeIndicator (`badge-indicator.tsx`)

**WCAG:** P -- Uses `useReducedMotion()` to replace scale animations with opacity-only transitions. Indicator dot or count badge is properly positioned.

**APG Keyboard:** P -- N/A, decorative overlay.

**API/DX:** P -- `displayName` set. Good props interface with `count`, `max`, `dot`, `color`, `invisible`, `showZero`, `placement`.

**Tests:** P -- Covered in `badge.test.tsx` BadgeIndicator describe block (5 tests: count, max overflow, invisible, zero, showZero).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Included in badge stories.

---

### 4. Avatar (`avatar.tsx`)

**WCAG:** P -- Status dot has `role="img"` with `aria-label` (e.g., "Online", "Offline"). Badge number has `role="status"` with `aria-label` (e.g., "5 notifications"). Badge dot is `aria-hidden="true"` (decorative). Fallback uses deterministic color from seed for consistency. Loading skeleton is just a visual placeholder.

**APG Keyboard:** P -- N/A, display-only component.

**API/DX:** P -- `forwardRef`, `displayName` (inherits from Radix), `cn()`, CVA with `avatarVariants`, exported types. Shape/size context for fallback inheritance. Deterministic fallback colors via `djb2` hash.

**Tests:** P -- Tests in `avatar-improvements.test.tsx` (deterministic colors, colorSeed), `avatar-a11y.test.tsx`, `avatar-status-a11y.test.tsx`. Good coverage of fallback, status, shapes.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`avatar.stories.tsx`).

---

### 5. Card (`card.tsx`)

**WCAG:** P -- Accent strip is `aria-hidden="true"`. Semantic `<div>` structure. Interactive mode uses `motion.div` with hover/tap but no `role="button"` -- this is OK because cards typically wrap a link or have interactive children rather than being buttons themselves.

**APG Keyboard:** P -- N/A for the card itself. Interactive mode provides visual hover only.

**API/DX:** P -- `forwardRef`, `displayName` on all sub-components (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter). CVA with exported `cardVariants`. `cn()`. Size context shared via React context. Accent feature with color/position/width.

**Tests:** P -- `card.test.tsx` (17 tests: accent positions, colors, sizes, className). `card-a11y.test.tsx` (2 tests: full content, interactive). Good coverage.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`card.stories.tsx`).

---

### 6. Table (`table.tsx`)

**WCAG:** P -- Native `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th scope="col">`, `<td>`, `<caption>` elements. Proper `scope="col"` on TableHead. Proper semantic HTML throughout.

**APG Keyboard:** P -- Native table keyboard navigation. `data-[state=selected]` for selected row indication.

**API/DX:** P -- `forwardRef` and `displayName` on all 8 sub-components. `cn()`. Exported types for `TableProps`, `TableRowProps`, `TableCellProps`.

**Tests:** P -- `table-a11y.test.tsx` (1 test with `toHaveNoViolations()`).

**Bundle/SSR:** P -- `@server-safe` annotation. No `'use client'` directive. Pure HTML elements, no hooks. Correctly server-safe.

**Docs:** P -- Story exists (`table.stories.tsx`).

---

### 7. DataTable (`data-table.tsx`)

**WCAG:** F -- **Missing `aria-sort` on sortable column headers.** The sort button inside `<th>` has `aria-label="Sort by {name}"` but the `<th>` itself does not carry `aria-sort="ascending|descending|none"`. This is a WCAG 1.3.1 violation for sortable tables. The sort state is only communicated visually via arrow icons.

Select-all checkbox has `aria-label="Select all rows"`. Per-row checkbox has `aria-label="Select row"`. Expand button has `aria-label="Collapse row" / "Expand row"`. Filter inputs have `aria-label`. Column edit input has `aria-label="Edit cell value"`. Loading skeleton shown appropriately.

**APG Keyboard:** F -- **No `aria-sort` attribute.** Sort is triggered via button click (good), but the table header doesn't communicate current sort state to screen readers. The Expand/Collapse button is keyboard-accessible.

**API/DX:** P -- Not `forwardRef` (complex component, acceptable). `displayName` set. Extensive props interface with 25+ feature flags. Delegates to TanStack Table for state management. Well-structured internal functions.

**Tests:** P -- `data-table-integration.test.tsx` has comprehensive tests: a11y violations check, header/row rendering, toolbar controls, global search, row selection, sorting, pagination, server-side pagination. `data-table-toolbar.test.tsx` covers density cycling, column visibility, export.

**Bundle/SSR:** P -- `'use client'`. Uses @tanstack/react-table and @tanstack/react-virtual (client-only). Not server-safe (correct).

**Docs:** P -- Stories exist (`data-table.stories.tsx`, `data-table-toolbar.stories.tsx`).

**Fixes needed:**
1. Add `aria-sort` to `<TableHead>` for sorted columns: `aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}`

---

### 8. DataTableToolbar (`data-table-toolbar.tsx`)

**WCAG:** P -- All buttons have `aria-label`. Search input has `aria-label="Search all columns"`. Column visibility has `aria-label="Toggle column visibility"`. Density button has descriptive `aria-label`. Export button has `aria-label="Export table as CSV"`.

**APG Keyboard:** P -- All controls are standard buttons and a text input. Dropdown menu for column visibility uses Radix DropdownMenu.

**API/DX:** P -- `displayName` set. Generic `<TData>` type parameter. Not `forwardRef` (toolbar wrapper, acceptable). Clean props interface.

**Tests:** P -- `data-table-toolbar.test.tsx` (6 tests). Tests density cycling, export show/hide, global filter show/hide, column visibility button.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`data-table-toolbar.stories.tsx`).

---

### 9. StatCard (`stat-card.tsx`)

**WCAG:** P -- Clickable mode: `role="button"`, `tabIndex={0}`, keyboard handler for Enter/Space. Auto-generates `aria-label="View {label}"` for clickable cards. Link mode: uses `<Link>` with `aria-label`. Progress bar has `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label="{label} progress"`. Icon is `aria-hidden="true"`.

**APG Keyboard:** P -- Keyboard handler for Enter and Space on clickable variant. Link variant is natively keyboard-accessible.

**API/DX:** P -- `forwardRef`, `displayName`, `cn()`. Rich props interface (label, title alias, value, prefix, suffix, delta, icon, loading, comparisonLabel, secondaryLabel, progress, accent, sparkline, onClick, href, footer). Link context integration.

**Tests:** P -- `stat-card.test.tsx` (15 tests: rendering, delta directions, loading skeleton, clickable mode, keyboard events, progress bar ARIA, secondary label, footer). `stat-card-a11y.test.tsx` (5 tests). Thorough.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`stat-card.stories.tsx`).

---

### 10. StatusDot (`status-dot.tsx`)

**WCAG:** F -- `role="status"` and `aria-label` are correctly applied (either custom or auto-generated like "Status: healthy"). However, **the pulse animation (`animate-ping`) does NOT respect `prefers-reduced-motion`.** The CSS class `animate-ping` is applied without a `motion-reduce:animate-none` counterpart. This is a WCAG 2.3.3 violation -- looping animations must be suppressible.

**APG Keyboard:** P -- N/A, display-only.

**API/DX:** P -- `forwardRef`, `displayName`, `cn()`. Good props: status, size, variant (filled/ring), pulse, label, labelClassName.

**Tests:** P -- `status-dot.test.tsx` (7 tests: healthy, label, pulse default, no-pulse non-healthy, explicit pulse, all statuses, color classes, forwardRef). No a11y test with `toHaveNoViolations()` specifically for StatusDot but the component is simple.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`status-dot.stories.tsx`).

**Fixes needed:**
1. Add `motion-reduce:animate-none` to the pulse span: `cn('absolute inline-flex rounded-full animate-ping motion-reduce:animate-none', ...)`

---

### 11. Code (`code.tsx`)

**WCAG:** P -- Semantic `<code>` for inline, `<pre><code>` for block. No special ARIA needed.

**APG Keyboard:** P -- N/A, display-only.

**API/DX:** P -- `forwardRef`, `displayName`, `cn()`. Simple variant prop (inline/block). Exported `CodeProps`.

**Tests:** P -- `code.test.tsx` (10 tests: inline, block, monospace, ref forwarding, className merge, HTML attributes). Two a11y tests with `toHaveNoViolations()`. `code-a11y.test.tsx` exists too.

**Bundle/SSR:** P -- `@server-safe` annotation. No `'use client'`. Pure HTML elements. Correctly server-safe.

**Docs:** P -- Story exists (`code.stories.tsx`).

---

### 12. Skeleton (`skeleton.tsx`)

**WCAG:** P -- `aria-hidden="true"` on individual skeletons (correct -- decorative placeholders). `SkeletonGroup` has `role="status"`, `aria-label`, `aria-busy="true"`, and `<span className="sr-only">` text. Both `pulse` and `shimmer` animations include `motion-reduce:animate-none`. Animation "none" variant for testing.

**APG Keyboard:** P -- N/A, decorative placeholders.

**API/DX:** P -- `forwardRef` and `displayName` on all 8 sub-components (Skeleton, SkeletonAvatar, SkeletonText, SkeletonButton, SkeletonInput, SkeletonChart, SkeletonImage, SkeletonGroup). CVA with exported `skeletonVariants`. Comprehensive sub-components for common patterns.

**Tests:** P -- `skeleton.test.tsx` (19 tests covering Skeleton variants, SkeletonText lines/width, SkeletonAvatar sizes, SkeletonGroup a11y). `skeleton-a11y.test.tsx` (8 additional tests). `toHaveNoViolations()` present.

**Bundle/SSR:** P -- `@server-safe` annotation. No `'use client'`. Pure HTML. Correctly server-safe.

**Docs:** P -- Story exists (`skeleton.stories.tsx`).

---

### 13. Progress (`progress.tsx`)

**WCAG:** P -- Built on Radix `@primitives/react-progress` which provides `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` automatically. Indeterminate mode (`value={null}`) shows animated bar. Indeterminate animation has `motion-reduce:animate-none`. `autoColor` feature shifts color by value threshold.

**Note:** Tests document a known gap: Progress **requires** an `aria-label` from the consumer (Radix doesn't add one by default). The test in `progress-a11y.test.tsx` explicitly documents this: "should FAIL without an accessible name."

**APG Keyboard:** P -- N/A, display-only.

**API/DX:** P -- `forwardRef`, `displayName` (inherits Radix), `cn()`, CVA with exported `progressTrackVariants` and `progressIndicatorVariants`. Props: size, color, showLabel, autoColor, indicatorClassName. Exported `ProgressProps`.

**Tests:** P -- `progress-a11y.test.tsx` (4 tests including the known gap documentation). Tests pass correctly.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`progress.stories.tsx`).

---

### 14. ProgressRing (`progress-ring.tsx`)

**WCAG:** F -- Has `role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax`, `aria-label`. **However, the animated spring transition on the ring fill and the counter animation via `useMotionValue`/`animate` do NOT check `prefers-reduced-motion`.** The component does not import or use `useReducedMotion` from framer-motion. While this is a cosmetic animation (the final state is correct), it does produce motion that could be disorienting.

MultiProgressRing uses `role="group"` with `aria-label="Progress rings"` but individual rings within it do not have `role="progressbar"` or aria-value attributes -- this is a semantic gap.

**APG Keyboard:** P -- N/A, display-only.

**API/DX:** P -- `forwardRef`, `displayName` on both ProgressRing and MultiProgressRing. Good props interfaces. Color map and size config.

**Tests:** P -- `progress-ring.test.tsx` (9 tests: SVG role, aria-valuenow, aria-valuemax, showValue text, custom label, percentage clamping, MultiProgressRing group role, circle count).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`progress-ring.stories.tsx`).

**Fixes needed:**
1. Import `useReducedMotion` and skip spring animation when reduced motion is preferred (use `initial={false}` with direct style instead)
2. MultiProgressRing individual rings should ideally have `role="progressbar"` with aria-value attributes, or the parent should describe them

---

### 15. Spinner (`spinner.tsx`)

**WCAG:** P -- `role="status"` on the outer `<span>`. `<span className="sr-only">` with state-dependent text: "Loading...", "Complete", "Error". Uses `useReducedMotion()` throughout -- when reduced motion is preferred, static circles/paths are rendered instead of animated ones (opacity-only transitions at most). All three states (spinning, success, error) have appropriate visual and accessible text.

**APG Keyboard:** P -- N/A, display-only.

**API/DX:** P -- `forwardRef`, `displayName`. Clean SVG implementation. Delay prop prevents flicker. `onComplete` callback. Bare vs filled variants.

**Tests:** P -- `spinner.test.tsx` (9 tests: role, sr text, SVG, sizes, success/error states, delay, track circle). `spinner-a11y.test.tsx` (6 tests with `toHaveNoViolations()`).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`spinner.stories.tsx`).

---

### 16. Chip (`chip.tsx`)

**WCAG:** P -- Deprecated wrapper around Badge. Delegates all rendering and accessibility to Badge component.

**APG Keyboard:** P -- Inherits from Badge.

**API/DX:** P -- `forwardRef`, `displayName`. Marked `@deprecated` with migration guidance.

**Tests:** P -- `chip.test.tsx` (7 tests), `chip-a11y.test.tsx` (7 tests including documented nested-interactive violation when both onClick and onDismiss are set).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`chip.stories.tsx`).

---

### 17. ColorSwatch (`color-swatch.tsx`)

**WCAG:** P -- Copyable mode renders as `<button>` with `aria-label="Copy color {color}"`. Copied notification has `role="status"`. Non-copyable mode uses `role="presentation"` (correct -- purely decorative color display). Ring option helps distinguish light colors from background.

**APG Keyboard:** P -- Copyable mode is a native `<button>`, keyboard-accessible.

**API/DX:** P -- `forwardRef`, `displayName`, `cn()`. Props: color, size, shape, ring, copyable, checkerboard. Clean clipboard API integration.

**Tests:** P -- `color-swatch.test.tsx` (7 tests: color, shape, ring, sizes, className, ref). No explicit a11y test with `toHaveNoViolations()` but the component is simple.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`color-swatch.stories.tsx`).

---

### 18. DevalokGrain (`devalok-grain.tsx`)

**WCAG:** P -- `aria-hidden="true"` on the root. Purely decorative texture overlay. Uses `useReducedMotion()` -- animated entrance is skipped when reduced motion is preferred.

**APG Keyboard:** P -- N/A, purely decorative.

**API/DX:** F -- **Not `forwardRef` and does not accept `className` or `ref`.** It's a function component (not `React.forwardRef`). While it's a decorative overlay, consistency with the rest of the design system expects `forwardRef`. The component also does not accept `className` prop (only intensity/surface/sheen/tint/animated/hoverIntensify).

**Tests:** P -- No dedicated test file found. However, the component is purely decorative and simple. The lack of tests is marginal.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`devalok-grain.stories.tsx`).

**Fixes needed:**
1. Consider adding `forwardRef` and `className` prop for consistency (low priority -- decorative component)

---

### 19. ChartContainer (`chart-container.tsx`)

**WCAG:** F -- The `<svg>` has `role="img"` and `aria-label="Chart"`, but this is a **generic fallback label** that provides no meaningful context. The label "Chart" is not descriptive -- consumers cannot override the label unless they pass `aria-label` on the outer div (which wouldn't reach the SVG). **The SVG's aria-label should be configurable via a prop.**

**APG Keyboard:** F -- Charts rendered within ChartContainer are mouse-only (tooltip hover zones). No keyboard navigation for data points. This is typical for SVG charts but worth noting.

**API/DX:** P -- `forwardRef`, `displayName`. Render-prop pattern for dimensions. ResizeObserver for responsive width.

**Tests:** P -- `chart-container.test.tsx` (5 tests: render, a11y, ref, className, props).

**Bundle/SSR:** P -- `'use client'`. Uses ResizeObserver (client-only).

**Docs:** P -- Covered in chart stories.

**Fixes needed:**
1. Add an `ariaLabel` prop that passes through to the SVG's `aria-label` instead of hardcoding "Chart"

---

### 20. AreaChart (`area-chart.tsx`)

**WCAG:** F -- Inherits ChartContainer's generic `aria-label="Chart"`. No accessible table fallback for the data. Tooltip zones are mouse-only (`onMouseMove`/`onMouseLeave`). Uses `useReducedMotion` for entrance animation (good).

**APG Keyboard:** F -- No keyboard navigation for data points or tooltip information. Data is only accessible via mouse hover. Screen reader users get "Chart" with no data.

**API/DX:** P -- `forwardRef`, `displayName`. Rich props: stacked, curved, gradient, fillOpacity, showGrid/Tooltip/Legend. Uses d3-shape for path generation.

**Tests:** P -- `area-chart.test.tsx` (5 tests: render, a11y, ref, className, props).

**Bundle/SSR:** P -- `'use client'`. d3-shape is SSR-safe but ResizeObserver in ChartContainer is not.

**Docs:** P -- Story exists (`area-chart.stories.tsx`).

**Fixes needed:**
1. Add configurable `aria-label` that describes the chart data
2. Consider an accessible table fallback (hidden visually, available to screen readers)

---

### 21. BarChart (`bar-chart.tsx`)

**WCAG:** F -- Same issues as AreaChart. Generic "Chart" aria-label from ChartContainer. No accessible data fallback. Mouse-only tooltips.

**APG Keyboard:** F -- No keyboard interaction for bars or tooltip info.

**API/DX:** P -- `forwardRef`, `displayName`. Supports vertical/horizontal, stacked/grouped, multi-series. d3 scales.

**Tests:** P -- `bar-chart.test.tsx` (5 tests).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`bar-chart.stories.tsx`).

**Fixes needed:** Same as AreaChart.

---

### 22. LineChart (`line-chart.tsx`)

**WCAG:** F -- Same issues as AreaChart. Generic "Chart" aria-label. Mouse-only tooltips.

**APG Keyboard:** F -- No keyboard interaction.

**API/DX:** P -- `forwardRef`, `displayName`. Supports curved interpolation, dots, multi-series. d3-shape line generator.

**Tests:** P -- `line-chart.test.tsx` (5 tests).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`line-chart.stories.tsx`).

**Fixes needed:** Same as AreaChart.

---

### 23. PieChart (`pie-chart.tsx`)

**WCAG:** F -- SVG has `role="img"` and `aria-label="Pie chart"`. This is slightly better than "Chart" but still generic. No accessible data representation. Mouse-only interactions (hover for tooltip, hover for slice offset).

**APG Keyboard:** F -- Slices are not keyboard-navigable. No focus management.

**API/DX:** P -- `forwardRef`, `displayName`. Supports pie/donut, centerLabel, showLabels, padAngle, cornerRadius. d3 pie/arc generators.

**Tests:** P -- `pie-chart.test.tsx` (5 tests).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`pie-chart.stories.tsx`).

**Fixes needed:**
1. Add configurable `aria-label`
2. Consider accessible data table fallback

---

### 24. RadarChart (`radar-chart.tsx`)

**WCAG:** F -- SVG has `role="img"` and `aria-label="Radar chart"`. Generic. Mouse-only tooltip hover areas. No accessible data representation.

**APG Keyboard:** F -- No keyboard interaction.

**API/DX:** P -- `forwardRef`, `displayName`. Supports multi-series, configurable levels, dot display. d3 radial line generator.

**Tests:** P -- `radar-chart.test.tsx` (5 tests).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`radar-chart.stories.tsx`).

**Fixes needed:** Same pattern -- configurable aria-label, accessible data fallback.

---

### 25. GaugeChart (`gauge-chart.tsx`)

**WCAG:** P -- Uses `role="meter"` on the outer container with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`. The inner SVG is `aria-hidden="true"` (correct -- the meter role carries the semantic info). This is the **best-implemented chart** for accessibility.

**APG Keyboard:** P -- N/A, display-only meter.

**API/DX:** P -- `forwardRef`, `displayName`. Props: value, min, max, label, valueLabel (string or function), color, trackColor, thickness, startAngle, endAngle. Uses `useReducedMotion`.

**Tests:** P -- `gauge-chart.test.tsx` (5 tests: render, a11y, ref, className, props).

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`gauge-chart.stories.tsx`).

---

### 26. Sparkline (`sparkline.tsx`)

**WCAG:** P -- SVG has `role="img"` with variant-specific `aria-label` ("Sparkline chart", "Sparkline bar chart", "Sparkline area chart"). Uses `useReducedMotion` to skip path draw animation. Sparklines are supplementary data visualizations typically paired with text labels.

**APG Keyboard:** P -- N/A, small supplementary graphic.

**API/DX:** P -- `forwardRef`, `displayName`. Supports line/bar/area variants. Props spread to SVG. d3 scales and generators.

**Tests:** P -- `sparkline.test.tsx` (5 tests: render, a11y, ref, className, props). `toHaveNoViolations()`.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`sparkline.stories.tsx`).

---

### 27. TreeView (`tree-view/tree-view.tsx` + `tree-view/tree-item.tsx`)

**WCAG:** P -- Root has `role="tree"`. Items have `role="treeitem"` with `aria-expanded` (parent nodes only), `aria-selected`, `aria-level`, `aria-disabled`. Child containers have `role="group"`. `aria-multiselectable` on root when multiSelect is enabled. Focus ring via `focus-visible:ring-2`.

**APG Keyboard:** P -- Full APG tree pattern:
- **ArrowDown:** Move to next visible item
- **ArrowUp:** Move to previous visible item
- **ArrowRight:** Expand collapsed item, or move to first child if expanded
- **ArrowLeft:** Collapse expanded item, or move to parent if collapsed/leaf
- **Home:** Move to first item
- **End:** Move to last visible item
- **Enter/Space:** Select item

**API/DX:** P -- `forwardRef`, `displayName` on TreeView and TreeItem. Both data-driven (items prop) and declarative (children) modes. `useTree` hook for state management. Checkbox mode with indeterminate state. Actions slot, secondary label, icon.

**Tests:** P -- `tree-view-a11y.test.tsx` (11 tests: axe violations, ARIA roles, aria-expanded, keyboard navigation). `tree-view/tree-view.test.tsx` (26 tests: useTree hook, data-driven mode, declarative mode, TreeItem features). Comprehensive coverage of all keyboard interactions, selection, expansion, disabled state, aria-level.

**Bundle/SSR:** P -- `'use client'`.

**Docs:** P -- Story exists (`tree-view/tree-view.stories.tsx`).

---

## Cross-Cutting Issues

### 1. Charts Accessibility Pattern (WCAG F, APG F)

**Affects:** ChartContainer, AreaChart, BarChart, LineChart, PieChart, RadarChart (6 components)

**Issue:** All chart components except GaugeChart and Sparkline lack:
- Configurable `aria-label` (hardcoded generic labels like "Chart", "Pie chart")
- Accessible data table fallback for screen readers
- Keyboard navigation for data points/tooltips

**Recommendation:** Create a shared `<ChartAccessibleFallback>` component that renders a visually-hidden `<table>` from the chart data. Add an `ariaLabel` prop to ChartContainer that passes through to the SVG. GaugeChart's `role="meter"` pattern is the gold standard to follow where applicable.

### 2. Missing `prefers-reduced-motion` Respect

**Affects:** Badge (dot pulse), StatusDot (ping animation), ProgressRing (spring animation)

**Issue:** These components have looping or spring animations that don't check reduced motion preferences. The rest of the system is generally good about this (Skeleton, Spinner, BadgeIndicator, all charts use `useReducedMotion`).

**Recommendation:** 
- Badge dot: Add `useReducedMotion()` and skip the pulse `animate` when preferred
- StatusDot: Add `motion-reduce:animate-none` to the `animate-ping` class
- ProgressRing: Import `useReducedMotion` and use direct style instead of spring when preferred

### 3. DataTable Missing `aria-sort`

**Affects:** DataTable sortable columns

**Issue:** When columns are sorted, the `<th>` elements don't carry `aria-sort` attributes. Screen readers cannot determine the current sort state.

**Recommendation:** Add `aria-sort` to the `<TableHead>` when the column is sortable:
```tsx
aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
```

### 4. Server-Safe Annotations

Components correctly annotated as `@server-safe`: Table, Code, Skeleton. All other data-display components correctly use `'use client'` due to framer-motion, Radix primitives, or browser APIs (ResizeObserver, clipboard).

### 5. Consistent API Quality

All 27 components have `displayName`. 24/27 use `forwardRef` (exceptions: BadgeGroup, DataTable, DevalokGrain -- all acceptable given their nature). All use `cn()` for class merging. All interactive components have proper `type="button"` on buttons.

---

## Priority Fix List

### High Priority
1. **DataTable `aria-sort`** -- Add `aria-sort` attribute to sortable `<th>` elements
2. **StatusDot `motion-reduce`** -- Add `motion-reduce:animate-none` to ping animation

### Medium Priority
3. **Charts `aria-label`** -- Make ChartContainer's SVG aria-label configurable via prop
4. **ProgressRing reduced motion** -- Add `useReducedMotion` check for spring animations
5. **Badge dot reduced motion** -- Add `useReducedMotion` to skip pulse animation

### Low Priority
6. **Charts accessible fallback** -- Create shared hidden data table for screen reader access
7. **Charts keyboard navigation** -- Add focus management for data points (significant effort)
8. **DevalokGrain `forwardRef`** -- Add for API consistency
9. **MultiProgressRing per-ring ARIA** -- Add `role="progressbar"` and aria-value to individual rings
