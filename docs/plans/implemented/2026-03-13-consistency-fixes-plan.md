# Consistency Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring all 158 components to full CONTRIBUTING.md checklist compliance (props spread, className+cn, forwardRef, Props export, tests with vitest-axe, stories with autodocs).

**Architecture:** 5 waves of mechanical fixes, each wave parallelizable by package area. Wave 1 (props spread + className) is the highest-impact fix. Each wave should be committed separately.

**Tech Stack:** React 18, TypeScript, CVA, vitest + vitest-axe, Storybook 8

---

## Reference Patterns

Every fix follows these exact patterns from the exemplar components (Button, Badge, AvatarGroup, StatusBadge, ProjectCard):

### Props spread pattern
```tsx
// Destructure className and custom props, rest into ...props
const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, customProp, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-classes', className)} {...props}>
        {children}
      </div>
    )
  },
)
```

### className + cn() pattern
```tsx
// Props interface adds className via HTML attributes extend
export interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  customProp?: string
}
// In JSX: className={cn('base-classes', className)}
```

### forwardRef conversion pattern
```tsx
// BEFORE (plain function):
function MyComponent({ children }: MyComponentProps) {
  return <div>{children}</div>
}

// AFTER (forwardRef):
const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, children, ...props }, ref) => {
    return <div ref={ref} className={cn('...', className)} {...props}>{children}</div>
  },
)
MyComponent.displayName = 'MyComponent'
```

### Props export pattern
```tsx
export interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // component-specific props
}
```

### Test pattern (with vitest-axe)
```tsx
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { MyComponent } from '../my-component'

describe('MyComponent', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<MyComponent>Content</MyComponent>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders content', () => {
    render(<MyComponent>Hello</MyComponent>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<MyComponent ref={ref}>Test</MyComponent>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges custom className', () => {
    const { container } = render(<MyComponent className="custom">Test</MyComponent>)
    expect(container.firstElementChild).toHaveClass('custom')
  })
})
```

### Story pattern
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from '../my-component'

const meta: Meta<typeof MyComponent> = {
  title: 'Category/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof MyComponent>

export const Default: Story = {
  args: { children: 'Default' },
}
```

---

## Wave 1: Props spread + className + cn() (mechanical, highest impact)

This wave fixes the #1 and #3 systemic gaps. For each file: read it, add `className` to the props interface if missing, destructure `className` and `...props`, apply `cn()` merging on the root element, spread `{...props}` on the root element.

### Task 1A: core/ui — props spread + className (13 files)

**Files to modify:**
- `packages/core/src/ui/autocomplete.tsx` — add ...props spread
- `packages/core/src/ui/color-input.tsx` — add ...props spread
- `packages/core/src/ui/segmented-control.tsx` — add ...props spread
- `packages/core/src/ui/tree-view.tsx` — add ...props spread
- `packages/core/src/ui/aspect-ratio.tsx` — add className+cn + ...props
- `packages/core/src/ui/toaster.tsx` — add className+cn + ...props
- `packages/core/src/ui/data-table-toolbar.tsx` — add ...props spread
- `packages/core/src/ui/charts/area-chart.tsx` — add ...props spread
- `packages/core/src/ui/charts/bar-chart.tsx` — add ...props spread
- `packages/core/src/ui/charts/line-chart.tsx` — add ...props spread
- `packages/core/src/ui/charts/pie-chart.tsx` — add ...props spread
- `packages/core/src/ui/charts/radar-chart.tsx` — add ...props spread
- `packages/core/src/ui/charts/gauge-chart.tsx` — add ...props spread
- `packages/core/src/ui/charts/sparkline.tsx` — add ...props spread
- `packages/core/src/ui/charts/chart-container.tsx` — add ...props spread

**Steps:**
1. Read each file
2. Add `className` to destructured props if missing
3. Add `...props` (or `...rest`) to destructured props
4. Wrap root element's className with `cn(existingClasses, className)` if not already
5. Add `{...props}` to root element JSX
6. If props interface doesn't extend HTML attributes, add the extend
7. Run `pnpm typecheck` to verify no type errors
8. Commit: `fix(ui): add props spread and className to 15 core/ui components`

### Task 1B: core/composed — props spread + className (22 files)

**Files to modify:**
- `packages/core/src/composed/command-palette.tsx` — add ...props
- `packages/core/src/composed/error-display.tsx` — add className+cn + ...props (ErrorDisplay component, not ErrorBoundary)
- `packages/core/src/composed/global-loading.tsx` — add className+cn + ...props
- `packages/core/src/composed/loading-skeleton.tsx` — add ...props to CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton
- `packages/core/src/composed/member-picker.tsx` — add className on root + ...props
- `packages/core/src/composed/page-skeletons.tsx` — add className+cn + ...props to DashboardSkeleton, ProjectListSkeleton, TaskDetailSkeleton
- `packages/core/src/composed/rich-text-editor.tsx` — add ...props to RichTextEditor and RichTextViewer
- `packages/core/src/composed/simple-tooltip.tsx` — add className + ...props
- `packages/core/src/composed/confirm-dialog.tsx` — add className + ...props
- `packages/core/src/composed/date-picker/calendar-grid.tsx` — add className+cn + ...props
- `packages/core/src/composed/date-picker/month-picker.tsx` — add className+cn + ...props
- `packages/core/src/composed/date-picker/year-picker.tsx` — add className+cn + ...props
- `packages/core/src/composed/date-picker/date-picker.tsx` — add ...props
- `packages/core/src/composed/date-picker/date-time-picker.tsx` — add ...props
- `packages/core/src/composed/date-picker/date-range-picker.tsx` — add ...props
- `packages/core/src/composed/date-picker/time-picker.tsx` — add ...props
- `packages/core/src/composed/date-picker/presets.tsx` — add ...props

**Steps:** Same as 1A.
**Commit:** `fix(composed): add props spread and className to 22 composed components`

### Task 1C: core/shell — props spread + className (2 files)

**Files to modify:**
- `packages/core/src/shell/notification-preferences.tsx` — add ...props spread
- `packages/core/src/shell/app-command-palette.tsx` — add className+cn + ...props

**Commit:** `fix(shell): add props spread and className to shell components`

### Task 1D: karm — props spread + className (46 files)

**Files to modify (ALL karm components except ClientPortalHeader & ProjectCard which already pass):**

admin/break:
- `packages/karm/src/admin/break/break-admin.tsx`
- `packages/karm/src/admin/break/break-admin-skeleton.tsx` (also needs className)
- `packages/karm/src/admin/break/break-balance.tsx` (also needs className)
- `packages/karm/src/admin/break/breaks.tsx` (also needs className)
- `packages/karm/src/admin/break/delete-break.tsx` (also needs className)
- `packages/karm/src/admin/break/edit-break.tsx`
- `packages/karm/src/admin/break/edit-break-balance.tsx` (also needs className)
- `packages/karm/src/admin/break/header.tsx` (also needs className)
- `packages/karm/src/admin/break/leave-request.tsx`

admin/dashboard:
- `packages/karm/src/admin/dashboard/admin-dashboard.tsx`
- `packages/karm/src/admin/dashboard/associate-detail.tsx`
- `packages/karm/src/admin/dashboard/attendance-overview.tsx`
- `packages/karm/src/admin/dashboard/break-request.tsx`
- `packages/karm/src/admin/dashboard/calendar.tsx`
- `packages/karm/src/admin/dashboard/correction-list.tsx`
- `packages/karm/src/admin/dashboard/dashboard-header.tsx`
- `packages/karm/src/admin/dashboard/dashboard-skeleton.tsx` (also needs className)
- `packages/karm/src/admin/dashboard/leave-requests.tsx`
- `packages/karm/src/admin/dashboard/render-date.tsx`

admin/adjustments:
- `packages/karm/src/admin/adjustments/approved-adjustments.tsx` (also needs className)

board:
- `packages/karm/src/board/board-column.tsx`
- `packages/karm/src/board/board-toolbar.tsx` (also needs className)
- `packages/karm/src/board/bulk-action-bar.tsx` (also needs className)
- `packages/karm/src/board/column-empty.tsx`
- `packages/karm/src/board/column-header.tsx` (also needs className)
- `packages/karm/src/board/kanban-board.tsx`
- `packages/karm/src/board/task-card.tsx`
- `packages/karm/src/board/task-context-menu.tsx` (also needs className)

chat:
- `packages/karm/src/chat/chat-input.tsx` (also needs className)
- `packages/karm/src/chat/chat-panel.tsx` (also needs className)
- `packages/karm/src/chat/conversation-list.tsx`
- `packages/karm/src/chat/message-list.tsx` (also needs className)
- `packages/karm/src/chat/streaming-text.tsx` (also needs className)

dashboard:
- `packages/karm/src/dashboard/attendance-cta.tsx` (also needs className)
- `packages/karm/src/dashboard/daily-brief.tsx`
- `packages/karm/src/dashboard/scratchpad-widget.tsx`
- `packages/karm/src/dashboard/sidebar-scratchpad.tsx`

page-skeletons:
- `packages/karm/src/page-skeletons.tsx`

tasks:
- `packages/karm/src/tasks/activity-tab.tsx`
- `packages/karm/src/tasks/conversation-tab.tsx`
- `packages/karm/src/tasks/files-tab.tsx`
- `packages/karm/src/tasks/review-tab.tsx`
- `packages/karm/src/tasks/subtasks-tab.tsx`
- `packages/karm/src/tasks/task-detail-panel.tsx`
- `packages/karm/src/tasks/task-properties.tsx`

**Steps:** Same as 1A. For karm components that are `forwardRef` already, add `...props` to the existing destructuring. For plain functions, add `...props` as a parameter.
**Commit:** `fix(karm): add props spread and className to 46 karm components`

### Wave 1 Verification
```bash
pnpm typecheck && pnpm test && pnpm build
```

---

## Wave 2: forwardRef conversion (20 components)

Convert plain function components to React.forwardRef. Each needs: forwardRef wrapper, ref parameter, ref= on root element, displayName (if missing).

### Task 2A: core/ui charts + misc (10 files)

**Files:**
- `packages/core/src/ui/charts/area-chart.tsx`
- `packages/core/src/ui/charts/bar-chart.tsx`
- `packages/core/src/ui/charts/line-chart.tsx`
- `packages/core/src/ui/charts/pie-chart.tsx`
- `packages/core/src/ui/charts/radar-chart.tsx`
- `packages/core/src/ui/charts/gauge-chart.tsx`
- `packages/core/src/ui/charts/sparkline.tsx`
- `packages/core/src/ui/charts/chart-container.tsx`
- `packages/core/src/ui/aspect-ratio.tsx`
- `packages/core/src/ui/toaster.tsx`

**Pattern:** Chart components render a `<div>` wrapper containing a Recharts component. Forward ref to the outer `<div>`.
```tsx
// BEFORE:
function AreaChart({ className, ...chartProps }: AreaChartProps) {
  return <div className={cn('...', className)}>...</div>
}

// AFTER:
const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('...', className)} {...props}>...</div>
  },
)
AreaChart.displayName = 'AreaChart'
```

**Commit:** `fix(ui): convert 10 core/ui components to forwardRef`

### Task 2B: core/composed + shell (3 files)

**Files:**
- `packages/core/src/composed/simple-tooltip.tsx`
- `packages/core/src/shell/notification-preferences.tsx`
- `packages/core/src/shell/app-command-palette.tsx`

**Commit:** `fix(composed,shell): convert 3 components to forwardRef`

### Task 2C: karm/board (5 files)

**Files:**
- `packages/karm/src/board/board-toolbar.tsx`
- `packages/karm/src/board/bulk-action-bar.tsx`
- `packages/karm/src/board/column-empty.tsx`
- `packages/karm/src/board/column-header.tsx`
- `packages/karm/src/board/task-context-menu.tsx`

**Commit:** `fix(karm): convert 5 board components to forwardRef`

### Wave 2 Verification
```bash
pnpm typecheck && pnpm test && pnpm build
```

---

## Wave 3: Props export (24 components)

Add exported Props type interfaces for components that don't have them. For Radix wrappers, create a DS-level type alias.

### Task 3A: core/ui Radix wrappers (14 files)

**Files:**
- `packages/core/src/ui/alert-dialog.tsx` — export AlertDialogProps
- `packages/core/src/ui/breadcrumb.tsx` — export BreadcrumbProps (for the root)
- `packages/core/src/ui/context-menu.tsx` — export ContextMenuProps
- `packages/core/src/ui/dialog.tsx` — export DialogProps
- `packages/core/src/ui/dropdown-menu.tsx` — export DropdownMenuProps
- `packages/core/src/ui/input-otp.tsx` — export InputOTPProps
- `packages/core/src/ui/menubar.tsx` — export MenubarProps
- `packages/core/src/ui/navigation-menu.tsx` — export NavigationMenuProps
- `packages/core/src/ui/popover.tsx` — export PopoverProps
- `packages/core/src/ui/sidebar.tsx` — export SidebarProps
- `packages/core/src/ui/table.tsx` — export TableProps
- `packages/core/src/ui/toaster.tsx` — export ToasterProps
- `packages/core/src/ui/tooltip.tsx` — export TooltipProps
- `packages/core/src/ui/aspect-ratio.tsx` — export AspectRatioProps

**Pattern for Radix wrappers:**
```tsx
export type DialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
```

**Commit:** `fix(ui): export Props types for 14 Radix wrapper components`

### Task 3B: core/composed + shell (4 files)

**Files:**
- `packages/core/src/composed/page-skeletons.tsx` — export DashboardSkeletonProps, ProjectListSkeletonProps, TaskDetailSkeletonProps
- `packages/core/src/shell/link-context.tsx` — export LinkProviderProps

**Commit:** `fix(composed,shell): export Props types for 4 components`

### Task 3C: karm (5 files)

**Files:**
- `packages/karm/src/admin/break/break-admin-skeleton.tsx` — export BreakAdminSkeletonProps
- `packages/karm/src/admin/dashboard/dashboard-skeleton.tsx` — export DashboardSkeletonProps
- `packages/karm/src/board/board-toolbar.tsx` — export BoardToolbarProps
- `packages/karm/src/board/bulk-action-bar.tsx` — export BulkActionBarProps
- `packages/karm/src/page-skeletons.tsx` — export DevsabhaSkeletonProps, BandwidthSkeletonProps

**Commit:** `fix(karm): export Props types for 5 karm components`

### Wave 3 Verification
```bash
pnpm typecheck && pnpm build
```

---

## Wave 4: Tests with vitest-axe (55 new test files + 2 axe additions)

Write tests for every untested component. Each test file must include at minimum: 1 axe a11y test, 1 render test, 1 className merge test (if component accepts className). For components with complex props, include domain-specific tests.

**Important testing notes:**
- Import `axe` from `vitest-axe` (not `jest-axe`)
- Import `expect` from `vitest` (extended by vitest-axe setup)
- Mock `ResizeObserver` for chart/select/slider components
- Mock `window.matchMedia` for responsive components
- Some karm components need mock data (tasks, users, etc.) — create minimal mock objects

### Task 4A: core/ui tests (16 files)

**New test files to create:**
- `packages/core/src/ui/__tests__/aspect-ratio.test.tsx`
- `packages/core/src/ui/__tests__/toaster.test.tsx`
- `packages/core/src/ui/__tests__/collapsible.test.tsx`
- `packages/core/src/ui/__tests__/visually-hidden.test.tsx`
- `packages/core/src/ui/__tests__/data-table-toolbar.test.tsx`
- `packages/core/src/ui/__tests__/sidebar.test.tsx`
- `packages/core/src/ui/__tests__/tree-view.test.tsx`
- `packages/core/src/ui/charts/__tests__/area-chart.test.tsx`
- `packages/core/src/ui/charts/__tests__/bar-chart.test.tsx`
- `packages/core/src/ui/charts/__tests__/line-chart.test.tsx`
- `packages/core/src/ui/charts/__tests__/pie-chart.test.tsx`
- `packages/core/src/ui/charts/__tests__/radar-chart.test.tsx`
- `packages/core/src/ui/charts/__tests__/gauge-chart.test.tsx`
- `packages/core/src/ui/charts/__tests__/sparkline.test.tsx`
- `packages/core/src/ui/charts/__tests__/chart-container.test.tsx`

**Existing tests to add axe to:**
- `packages/core/src/ui/__tests__/alert-dialog.test.tsx` (add axe import + test)
- `packages/core/src/ui/__tests__/context-menu.test.tsx` (add axe import + test)
- `packages/core/src/ui/__tests__/form.test.tsx` (add axe import + test)
- `packages/core/src/ui/__tests__/menubar.test.tsx` (add axe import + test)
- `packages/core/src/ui/__tests__/navigation-menu.test.tsx` (add axe import + test)

**Commit:** `test(ui): add tests with vitest-axe for 16 core/ui components`

### Task 4B: core/composed tests (17 files)

**New test files to create:**
- `packages/core/src/composed/__tests__/loading-skeleton.test.tsx` (CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton)
- `packages/core/src/composed/__tests__/page-skeletons.test.tsx`
- `packages/core/src/composed/__tests__/rich-text-editor.test.tsx`
- `packages/core/src/composed/__tests__/upload-progress.test.tsx`
- `packages/core/src/composed/__tests__/date-picker.test.tsx`
- `packages/core/src/composed/__tests__/date-time-picker.test.tsx`
- `packages/core/src/composed/__tests__/date-range-picker.test.tsx`
- `packages/core/src/composed/__tests__/time-picker.test.tsx`
- `packages/core/src/composed/__tests__/month-picker.test.tsx`
- `packages/core/src/composed/__tests__/year-picker.test.tsx`

**Existing tests to verify/add axe to:**
- `packages/core/src/composed/__tests__/confirm-dialog.test.tsx` (add axe)
- `packages/core/src/composed/__tests__/calendar-grid.test.tsx` (add axe)

**Commit:** `test(composed): add tests with vitest-axe for composed components`

### Task 4C: core/shell tests (4 files)

**New test files:**
- `packages/core/src/shell/__tests__/app-command-palette.test.tsx`
- `packages/core/src/shell/__tests__/notification-preferences.test.tsx`
- `packages/core/src/shell/__tests__/link-context.test.tsx`

**Existing tests to add axe:**
- `packages/core/src/shell/__tests__/top-bar.test.tsx` (add axe import + test)
- `packages/core/src/shell/__tests__/notification-center.test.tsx` (add axe import + test)

**Commit:** `test(shell): add tests with vitest-axe for shell components`

### Task 4D: karm tests (25 files)

**New test files to create:**

admin/break:
- `packages/karm/src/admin/break/__tests__/break-admin-skeleton.test.tsx`
- `packages/karm/src/admin/break/__tests__/breaks.test.tsx`
- `packages/karm/src/admin/break/__tests__/delete-break.test.tsx`
- `packages/karm/src/admin/break/__tests__/edit-break-balance.test.tsx`
- `packages/karm/src/admin/break/__tests__/header.test.tsx`

admin/dashboard:
- `packages/karm/src/admin/dashboard/__tests__/associate-detail.test.tsx`
- `packages/karm/src/admin/dashboard/__tests__/leave-requests.test.tsx`
- `packages/karm/src/admin/dashboard/__tests__/render-date.test.tsx`

client:
- `packages/karm/src/client/__tests__/accent-provider.test.tsx`

page-skeletons:
- `packages/karm/src/__tests__/page-skeletons.test.tsx`

tasks:
- `packages/karm/src/tasks/__tests__/activity-tab.test.tsx`
- `packages/karm/src/tasks/__tests__/conversation-tab.test.tsx`
- `packages/karm/src/tasks/__tests__/files-tab.test.tsx`
- `packages/karm/src/tasks/__tests__/review-tab.test.tsx`
- `packages/karm/src/tasks/__tests__/subtasks-tab.test.tsx`

**Commit:** `test(karm): add tests with vitest-axe for 25 karm components`

### Wave 4 Verification
```bash
pnpm test
```

---

## Wave 5: Missing stories (7 files)

### Task 5A: All missing stories

**New story files:**
- `packages/core/stories/shell/link-context.stories.tsx`
- `packages/karm/stories/board/bulk-action-bar.stories.tsx`
- `packages/karm/stories/board/column-empty.stories.tsx`
- `packages/karm/stories/board/column-header.stories.tsx`
- `packages/karm/stories/board/task-context-menu.stories.tsx`
- `packages/karm/stories/page-skeletons.stories.tsx`
- `packages/karm/stories/client/accent-provider.stories.tsx`

**Each must have:** `tags: ['autodocs']` in meta, Default story, 2-3 variant stories.

**Commit:** `docs(stories): add missing Storybook stories for 7 components`

### Wave 5 Verification
```bash
pnpm build  # Storybook build verification
```

---

## Final Verification

After all 5 waves:
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Run a quick spot-check on 5 random components to confirm all 8 checklist items pass.

---

## Execution Summary

| Wave | Description | Components | Parallel Tasks |
|------|-------------|-----------|---------------|
| 1 | Props spread + className | ~85 | 4 (by package) |
| 2 | forwardRef | 20 | 3 (by package) |
| 3 | Props export | 24 | 3 (by package) |
| 4 | Tests + axe | ~60 | 4 (by package) |
| 5 | Stories | 7 | 1 |

Total: ~158 component touches across 5 waves.
