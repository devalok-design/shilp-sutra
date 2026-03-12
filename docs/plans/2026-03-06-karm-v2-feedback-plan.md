# Karm V2 Feedback — v0.6.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all 12 feedback items from the Karm V2 migration, delivering API fixes, new components, and documentation improvements as shilp-sutra v0.6.0.

**Architecture:** Incremental changes to existing CVA-based components (StatusBadge, Alert, PageHeader), new composed components (SimpleTooltip, ScheduleView), icon prop migration in shell components, and CalendarGrid events support. All changes are additive except the icon prop migration (breaking).

**Tech Stack:** React 18, TypeScript 5.7, CVA, Radix primitives, Vitest + RTL + vitest-axe, Tailwind 3.4, Storybook 8, date-fns.

---

## Task 1: StatusBadge — Add `color` prop

**Files:**
- Modify: `packages/core/src/composed/status-badge.tsx`
- Modify: `packages/core/src/composed/status-badge.stories.tsx`
- Modify: `packages/core/src/composed/__tests__/status-badge.test.tsx`

**Step 1: Write failing tests**

Add to `packages/core/src/composed/__tests__/status-badge.test.tsx`:

```tsx
it('renders with color prop and custom label', () => {
  const { getByText } = render(
    <StatusBadge color="success" label="Present" />,
  )
  expect(getByText('Present')).toBeInTheDocument()
})

it('renders with color prop without status', () => {
  const { container } = render(
    <StatusBadge color="warning" label="On Hold" />,
  )
  expect(container.querySelector('span')).toBeInTheDocument()
})

it('color prop overrides status color', () => {
  const { getByText } = render(
    <StatusBadge status="active" color="error" label="Flagged" />,
  )
  expect(getByText('Flagged')).toBeInTheDocument()
})

it('should have no a11y violations with color prop', async () => {
  const { container } = render(
    <StatusBadge color="info" label="In Review" />,
  )
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/status-badge.test.tsx`
Expected: FAIL — `color` prop doesn't exist yet

**Step 3: Implement**

In `status-badge.tsx`:
- Add `color` to CVA variants: `color: { success, warning, error, info, neutral }` with same token mappings
- Add a `colorDotMap` similar to `dotColorMap`
- Update `StatusBadgeProps`: make `status` optional, add `color` prop
- In render logic: if `color` is set, use `color` variant classes; else fall back to `status` mapping
- Update `displayLabel` fallback: if no `label` and no `status`, default to empty string

**Step 4: Run tests to verify they pass**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/status-badge.test.tsx`
Expected: PASS

**Step 5: Update stories**

Add new stories in `status-badge.stories.tsx`:
- "Custom Color" story with `color="success" label="Present"`
- "All Colors" story showing each color option
- "Color Override" story showing `status="active" color="error"`

**Step 6: Commit**

```bash
git add packages/core/src/composed/status-badge.tsx packages/core/src/composed/status-badge.stories.tsx packages/core/src/composed/__tests__/status-badge.test.tsx
git commit -m "feat(composed): StatusBadge add color prop for custom status colors"
```

---

## Task 2: Alert — Add `variant` axis

**Files:**
- Modify: `packages/core/src/ui/alert.tsx`
- Modify: `packages/core/src/ui/__tests__/alert-a11y.test.tsx`
- Create: `packages/core/src/ui/__tests__/alert.test.tsx`

**Step 1: Write failing tests**

Create `packages/core/src/ui/__tests__/alert.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { Alert } from '../alert'

describe('Alert variants', () => {
  it('renders subtle variant by default (existing behavior)', () => {
    const { container } = render(<Alert color="info">Test</Alert>)
    const el = container.querySelector('[role="alert"]')
    expect(el?.className).toContain('bg-info-surface')
  })

  it('renders filled variant with solid background', () => {
    const { container } = render(
      <Alert color="error" variant="filled">Critical</Alert>,
    )
    const el = container.querySelector('[role="alert"]')
    expect(el?.className).toContain('bg-error')
    expect(el?.className).toContain('text-text-on-color')
  })

  it('renders outline variant with border', () => {
    const { container } = render(
      <Alert color="warning" variant="outline">Check input</Alert>,
    )
    const el = container.querySelector('[role="alert"]')
    expect(el?.className).toContain('border-warning-border')
    expect(el?.className).toContain('bg-transparent')
  })

  it('should have no a11y violations with filled variant', async () => {
    const { container } = render(
      <Alert color="error" variant="filled" title="Error">Failed</Alert>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no a11y violations with outline variant', async () => {
    const { container } = render(
      <Alert color="warning" variant="outline" title="Warning">Check</Alert>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/alert.test.tsx`
Expected: FAIL — `variant` prop doesn't exist

**Step 3: Implement**

In `alert.tsx`, update the CVA definition:

```tsx
const alertVariants = cva(
  'relative flex gap-ds-04 rounded-ds-lg border p-ds-05',
  {
    variants: {
      variant: {
        subtle: '',   // color-specific styles handled in compoundVariants
        filled: 'text-text-on-color [&>svg]:text-text-on-color border-transparent',
        outline: 'bg-transparent',
      },
      color: {
        info: '',
        success: '',
        warning: '',
        error: '',
        neutral: '',
      },
    },
    compoundVariants: [
      // Subtle (existing behavior)
      { variant: 'subtle', color: 'info', className: 'bg-info-surface border-info-border text-info-text' },
      { variant: 'subtle', color: 'success', className: 'bg-success-surface border-success-border text-success-text' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-surface border-warning-border text-warning-text' },
      { variant: 'subtle', color: 'error', className: 'bg-error-surface border-error-border text-error-text' },
      { variant: 'subtle', color: 'neutral', className: 'bg-layer-02 border-border text-text-primary [&>svg]:text-text-secondary' },
      // Filled
      { variant: 'filled', color: 'info', className: 'bg-info' },
      { variant: 'filled', color: 'success', className: 'bg-success' },
      { variant: 'filled', color: 'warning', className: 'bg-warning' },
      { variant: 'filled', color: 'error', className: 'bg-error' },
      { variant: 'filled', color: 'neutral', className: 'bg-layer-03 text-text-primary [&>svg]:text-text-secondary border-transparent' },
      // Outline
      { variant: 'outline', color: 'info', className: 'border-info-border text-info-text' },
      { variant: 'outline', color: 'success', className: 'border-success-border text-success-text' },
      { variant: 'outline', color: 'warning', className: 'border-warning-border text-warning-text' },
      { variant: 'outline', color: 'error', className: 'border-error-border text-error-text' },
      { variant: 'outline', color: 'neutral', className: 'border-border text-text-primary [&>svg]:text-text-secondary' },
    ],
    defaultVariants: { variant: 'subtle', color: 'info' },
  },
)
```

Update `AlertProps` to include `variant`. Update render to pass `variant` to `alertVariants({ variant, color })`.

**Step 4: Run all alert tests**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/alert`
Expected: ALL PASS (new tests + existing a11y tests)

**Step 5: Update stories**

Add "Filled" and "Outline" stories showing all 5 colors in each variant.

**Step 6: Commit**

```bash
git add packages/core/src/ui/alert.tsx packages/core/src/ui/__tests__/alert.test.tsx packages/core/src/ui/__tests__/alert-a11y.test.tsx
git commit -m "feat(ui): Alert add variant axis (subtle/filled/outline)"
```

---

## Task 3: PageHeader — Optional `title`

**Files:**
- Modify: `packages/core/src/composed/page-header.tsx`
- Modify: `packages/core/src/composed/__tests__/page-header.test.tsx`

**Step 1: Write failing tests**

Add to `packages/core/src/composed/__tests__/page-header.test.tsx`:

```tsx
it('auto-derives title from last breadcrumb when title is omitted', () => {
  const { getByRole } = render(
    <PageHeader
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard' },
      ]}
    />,
  )
  expect(getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard')
})

it('explicit title takes precedence over breadcrumbs', () => {
  const { getByRole } = render(
    <PageHeader
      title="Custom Title"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard' },
      ]}
    />,
  )
  expect(getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title')
})

it('should have no a11y violations with auto-derived title', async () => {
  const { container } = render(
    <PageHeader
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Settings' },
      ]}
    />,
  )
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/page-header.test.tsx`
Expected: FAIL — `title` is required

**Step 3: Implement**

In `page-header.tsx`:
- Change `title: string` to `title?: string` in `PageHeaderProps`
- In the component body, derive title: `const resolvedTitle = title ?? breadcrumbs?.[breadcrumbs.length - 1]?.label ?? ''`
- Use `resolvedTitle` in the `<h1>` tag
- Only render the `<h1>` if `resolvedTitle` is non-empty

**Step 4: Run tests**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/page-header.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add packages/core/src/composed/page-header.tsx packages/core/src/composed/__tests__/page-header.test.tsx
git commit -m "feat(composed): PageHeader make title optional, auto-derive from breadcrumbs"
```

---

## Task 4: SimpleTooltip — New composed component

**Files:**
- Create: `packages/core/src/composed/simple-tooltip.tsx`
- Create: `packages/core/src/composed/__tests__/simple-tooltip.test.tsx`
- Create: `packages/core/src/composed/simple-tooltip.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json` (add export)

**Step 1: Write failing tests**

Create `packages/core/src/composed/__tests__/simple-tooltip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { SimpleTooltip } from '../simple-tooltip'

describe('SimpleTooltip', () => {
  it('renders trigger children', () => {
    render(
      <SimpleTooltip content="Help text">
        <button>Hover me</button>
      </SimpleTooltip>,
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup()
    render(
      <SimpleTooltip content="Help text">
        <button>Hover me</button>
      </SimpleTooltip>,
    )
    await user.hover(screen.getByRole('button'))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Help text')
  })

  it('should have no a11y violations', async () => {
    const { container } = render(
      <SimpleTooltip content="Help text">
        <button>Hover me</button>
      </SimpleTooltip>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/simple-tooltip.test.tsx`
Expected: FAIL — module not found

**Step 3: Implement**

Create `packages/core/src/composed/simple-tooltip.tsx`:

```tsx
'use client'

import * as React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

export interface SimpleTooltipProps {
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  children: React.ReactNode
}

const SimpleTooltip = React.forwardRef<HTMLDivElement, SimpleTooltipProps>(
  ({ content, side = 'top', align = 'center', delayDuration = 300, children }, ref) => (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent ref={ref} side={side} align={align}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
)
SimpleTooltip.displayName = 'SimpleTooltip'

export { SimpleTooltip }
```

**Step 4: Add to barrel export**

In `packages/core/src/composed/index.ts`, add:

```tsx
export { SimpleTooltip } from './simple-tooltip'
export type { SimpleTooltipProps } from './simple-tooltip'
```

In `packages/core/package.json`, add to `exports`:

```json
"./composed/simple-tooltip": { "import": "./dist/composed/simple-tooltip.js", "types": "./dist/composed/simple-tooltip.d.ts" }
```

**Step 5: Run tests**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/simple-tooltip.test.tsx`
Expected: PASS

**Step 6: Add stories**

Create `packages/core/src/composed/simple-tooltip.stories.tsx` with:
- Default story (button with tooltip)
- Side variants (top/right/bottom/left)
- Rich content (ReactNode in content prop)

**Step 7: Commit**

```bash
git add packages/core/src/composed/simple-tooltip.tsx packages/core/src/composed/simple-tooltip.stories.tsx packages/core/src/composed/__tests__/simple-tooltip.test.tsx packages/core/src/composed/index.ts packages/core/package.json
git commit -m "feat(composed): add SimpleTooltip convenience wrapper"
```

---

## Task 5: Icon prop migration — `ReactNode` everywhere

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx`
- Modify: `packages/core/src/shell/bottom-navbar.tsx`
- Modify: `packages/core/src/shell/app-command-palette.tsx`
- Modify: `packages/core/src/composed/command-palette.tsx`
- Modify: `packages/core/src/shell/sidebar.stories.tsx`
- Modify: `packages/core/src/shell/bottom-navbar.stories.tsx`
- Modify: `packages/core/src/shell/app-command-palette.stories.tsx`
- Modify: `packages/core/src/composed/command-palette.stories.tsx`

**Step 1: Update sidebar types and rendering**

In `sidebar.tsx`:
- Change `NavItem.icon` from `React.ComponentType<{ className?: string }>` to `React.ReactNode`
- In `NavLink`, change `<item.icon className="..." />` to:
  ```tsx
  <span className="[&>svg]:h-ico-md [&>svg]:w-ico-md shrink-0" aria-hidden="true">
    {item.icon}
  </span>
  ```

**Step 2: Update bottom-navbar types and rendering**

In `bottom-navbar.tsx`:
- Change `BottomNavItem.icon` from `React.ComponentType<{ className?: string }>` to `React.ReactNode`
- In `BottomNavLink`, change `<item.icon className="..." />` to:
  ```tsx
  <span className="[&>svg]:h-ico-md [&>svg]:w-ico-md" aria-hidden="true">
    {item.icon}
  </span>
  ```
- In the "More" menu grid, same change for `<item.icon className="..." />`

**Step 3: Update app-command-palette types**

In `app-command-palette.tsx`:
- Change all `icon: IconName` references (the hardcoded nav items) to `icon: <IconName />`
- Update the `SearchResult` type if it has an icon prop
- Update rendering from `<item.icon />` to wrapping in a span

**Step 4: Update command-palette types**

In `command-palette.tsx`:
- Change `CommandItem.icon` from `TablerIcon` to `React.ReactNode`
- Update rendering accordingly

**Step 5: Update ALL story files**

In all story files for these components, change:
```tsx
// Before
{ title: 'Dashboard', icon: IconLayoutDashboard }

// After
{ title: 'Dashboard', icon: <IconLayoutDashboard /> }
```

**Step 6: Run all tests**

Run: `cd packages/core && pnpm vitest run`
Expected: ALL PASS (sidebar/bottom-navbar don't have unit tests, but full suite should pass)

**Step 7: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx packages/core/src/shell/bottom-navbar.tsx packages/core/src/shell/app-command-palette.tsx packages/core/src/composed/command-palette.tsx packages/core/src/shell/sidebar.stories.tsx packages/core/src/shell/bottom-navbar.stories.tsx packages/core/src/shell/app-command-palette.stories.tsx packages/core/src/composed/command-palette.stories.tsx
git commit -m "feat(shell)!: migrate icon props from ComponentType to ReactNode

BREAKING CHANGE: NavItem.icon, BottomNavItem.icon, CommandItem.icon now
expect ReactNode (<IconName />) instead of ComponentType (IconName)."
```

---

## Task 6: CalendarGrid — Add `events` prop

**Files:**
- Modify: `packages/core/src/composed/date-picker/calendar-grid.tsx`
- Create: `packages/core/src/composed/__tests__/calendar-grid.test.tsx`
- Modify: `packages/core/src/composed/date-picker.stories.tsx`
- Modify: `packages/core/src/composed/date-picker/index.ts` (export CalendarEvent type)

**Step 1: Write failing tests**

Create `packages/core/src/composed/__tests__/calendar-grid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CalendarGrid } from '../date-picker/calendar-grid'

describe('CalendarGrid events', () => {
  const baseProps = {
    currentMonth: new Date(2026, 2, 1), // March 2026
    onSelect: vi.fn(),
    onMonthChange: vi.fn(),
  }

  it('renders event dots on dates with events', () => {
    const { container } = render(
      <CalendarGrid
        {...baseProps}
        events={[
          { date: new Date(2026, 2, 10), label: '3 tasks due' },
        ]}
      />,
    )
    const dateBtn = container.querySelector('[data-date="2026-03-10"]')
    const dot = dateBtn?.parentElement?.querySelector('[data-event-dot]')
      ?? dateBtn?.querySelector('[data-event-dot]')
    // Event indicator should exist somewhere near the date
    const dots = container.querySelectorAll('[data-event-dot]')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('renders multiple dots for multiple events on same date (max 3)', () => {
    const { container } = render(
      <CalendarGrid
        {...baseProps}
        events={[
          { date: new Date(2026, 2, 10), color: 'red' },
          { date: new Date(2026, 2, 10), color: 'blue' },
          { date: new Date(2026, 2, 10), color: 'green' },
          { date: new Date(2026, 2, 10), color: 'orange' },
        ]}
      />,
    )
    // Should cap at 3 visible dots
    const cell = container.querySelector('[data-date="2026-03-10"]')?.closest('[data-calendar-cell]')
      ?? container.querySelector('[data-date="2026-03-10"]')?.parentElement
    const dots = cell?.querySelectorAll('[data-event-dot]') ?? []
    expect(dots.length).toBeLessThanOrEqual(3)
  })

  it('renders without events (backwards compatible)', () => {
    const { container } = render(<CalendarGrid {...baseProps} />)
    const dots = container.querySelectorAll('[data-event-dot]')
    expect(dots.length).toBe(0)
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/calendar-grid.test.tsx`
Expected: FAIL — `events` prop not recognized / no dots rendered

**Step 3: Implement**

In `calendar-grid.tsx`:

Add type:
```tsx
export interface CalendarEvent {
  date: Date
  color?: string
  label?: string
}
```

Add to `CalendarGridProps`:
```tsx
events?: CalendarEvent[]
```

In the render, group events by date string. For each day cell, after the date number, render event dots:

```tsx
// Inside the day button, after {format(d, 'd')}
{dayEvents.length > 0 && (
  <span className="flex gap-px justify-center mt-px">
    {dayEvents.slice(0, 3).map((evt, idx) => (
      <span
        key={idx}
        data-event-dot
        className="h-[4px] w-[4px] rounded-ds-full"
        style={{ backgroundColor: evt.color ?? 'var(--color-interactive)' }}
      />
    ))}
  </span>
)}
```

Update the button layout to use flex-col to stack date number and dots:
- Change button from inline content to `flex flex-col items-center justify-center`

Export `CalendarEvent` type from `date-picker/index.ts` and `composed/index.ts`.

**Step 4: Run tests**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/calendar-grid.test.tsx`
Expected: PASS

**Step 5: Update stories**

Add a "With Events" story to `date-picker.stories.tsx` showing CalendarGrid with event dots.

**Step 6: Commit**

```bash
git add packages/core/src/composed/date-picker/calendar-grid.tsx packages/core/src/composed/__tests__/calendar-grid.test.tsx packages/core/src/composed/date-picker/index.ts packages/core/src/composed/index.ts packages/core/src/composed/date-picker.stories.tsx
git commit -m "feat(composed): CalendarGrid add events prop for date indicators"
```

---

## Task 7: ScheduleView — New composed component

**Files:**
- Create: `packages/core/src/composed/schedule-view.tsx`
- Create: `packages/core/src/composed/__tests__/schedule-view.test.tsx`
- Create: `packages/core/src/composed/schedule-view.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Step 1: Write failing tests**

Create `packages/core/src/composed/__tests__/schedule-view.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ScheduleView } from '../schedule-view'

const baseEvents = [
  {
    id: '1',
    title: 'Sprint Planning',
    start: new Date(2026, 2, 10, 9, 0),
    end: new Date(2026, 2, 10, 10, 30),
    color: 'info' as const,
  },
  {
    id: '2',
    title: 'Lunch',
    start: new Date(2026, 2, 10, 12, 0),
    end: new Date(2026, 2, 10, 13, 0),
    color: 'neutral' as const,
  },
]

describe('ScheduleView', () => {
  it('renders day view with events', () => {
    render(
      <ScheduleView view="day" date={new Date(2026, 2, 10)} events={baseEvents} />,
    )
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
    expect(screen.getByText('Lunch')).toBeInTheDocument()
  })

  it('renders week view with day columns', () => {
    render(
      <ScheduleView view="week" date={new Date(2026, 2, 10)} events={baseEvents} />,
    )
    // Week view should show day headers
    expect(screen.getByText(/Mon/)).toBeInTheDocument()
    expect(screen.getByText(/Tue/)).toBeInTheDocument()
  })

  it('calls onEventClick when event is clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <ScheduleView
        view="day"
        date={new Date(2026, 2, 10)}
        events={baseEvents}
        onEventClick={onClick}
      />,
    )
    await user.click(screen.getByText('Sprint Planning'))
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))
  })

  it('renders time labels', () => {
    render(
      <ScheduleView view="day" date={new Date(2026, 2, 10)} events={[]} />,
    )
    expect(screen.getByText('9 AM')).toBeInTheDocument()
    expect(screen.getByText('12 PM')).toBeInTheDocument()
  })

  it('should have no a11y violations', async () => {
    const { container } = render(
      <ScheduleView view="day" date={new Date(2026, 2, 10)} events={baseEvents} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/schedule-view.test.tsx`
Expected: FAIL — module not found

**Step 3: Implement**

Create `packages/core/src/composed/schedule-view.tsx`:

Key implementation details:
- Types: `ScheduleEvent` (id, title, start, end, color), `ScheduleViewProps` (view, date, events, onEventClick, onSlotClick, startHour=8, endHour=18, slotDuration=30)
- Time column: map from `startHour` to `endHour`, render hour labels
- Day view: single column of time slots with events positioned absolutely
- Week view: 7 day columns, each with time slots
- Event positioning: calculate `top` and `height` based on time relative to startHour
- Color mapping: use semantic tokens (e.g., `color="info"` -> `bg-info-surface border-info-border text-info-text`)
- Current time indicator: horizontal line at current time position (only visible if today is in view)
- `onSlotClick`: fires with (start, end) when an empty slot is clicked
- Uses date-fns for date math (startOfWeek, addDays, format, etc.)

**Step 4: Add to barrel and package.json**

In `composed/index.ts`:
```tsx
export { ScheduleView } from './schedule-view'
export type { ScheduleViewProps, ScheduleEvent } from './schedule-view'
```

In `package.json` exports:
```json
"./composed/schedule-view": { "import": "./dist/composed/schedule-view.js", "types": "./dist/composed/schedule-view.d.ts" }
```

**Step 5: Run tests**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/schedule-view.test.tsx`
Expected: PASS

**Step 6: Add stories**

Create `packages/core/src/composed/schedule-view.stories.tsx`:
- "Day View" — single day with events
- "Week View" — full week with events scattered
- "Empty State" — no events, shows time grid
- "Custom Hours" — startHour=6, endHour=22

**Step 7: Commit**

```bash
git add packages/core/src/composed/schedule-view.tsx packages/core/src/composed/schedule-view.stories.tsx packages/core/src/composed/__tests__/schedule-view.test.tsx packages/core/src/composed/index.ts packages/core/package.json
git commit -m "feat(composed): add ScheduleView day/week timeline component"
```

---

## Task 8: Documentation — Storybook package labels

**Files:**
- Modify: `.storybook/preview.ts`
- Modify: representative story files to add `parameters.package` (pattern for all stories)

**Step 1: Add package label decorator to Storybook preview**

In `.storybook/preview.ts`, add a decorator that reads `parameters.package` and renders a badge at the top of docs:

```tsx
const preview: Preview = {
  parameters: {
    // ... existing params
  },
  decorators: [
    // ... existing decorators
  ],
}
```

Since Storybook's docs page customization is complex, a simpler approach: use the `tags` or `parameters` system to add a note. Add to each story's meta:

```tsx
parameters: {
  docs: {
    description: {
      component: '**Package:** `@devalok/shilp-sutra` · **Import:** `import { Button } from "@devalok/shilp-sutra/ui/button"`',
    },
  },
},
```

**Step 2: Update a representative set of story files**

Add the `parameters.docs.description.component` to:
- All `packages/karm/src/**/*.stories.tsx` — with `@devalok/shilp-sutra-karm` and correct import
- Key core stories (Button, Alert, DataTable, etc.)

This can be done incrementally. Start with the most confusing ones (karm components).

**Step 3: Commit**

```bash
git add .storybook/ packages/karm/src packages/core/src
git commit -m "docs(storybook): add package name and import path to story descriptions"
```

---

## Task 9: Documentation — Import path guide

**Files:**
- Create: `packages/core/src/ImportGuide.mdx`

**Step 1: Create import guide MDX page**

Create `packages/core/src/ImportGuide.mdx`:

```mdx
import { Meta } from '@storybook/blocks'

<Meta title="Guides/Import Paths" />

# Import Guide

## Barrel Imports

| Module | Import | Notes |
|--------|--------|-------|
| UI | `import { Button } from '@devalok/shilp-sutra'` | Main barrel |
| Composed | `import { PageHeader } from '@devalok/shilp-sutra/composed'` | |
| Shell | `import { AppSidebar } from '@devalok/shilp-sutra/shell'` | |
| Hooks | `import { useMobile } from '@devalok/shilp-sutra/hooks'` | |
| Tailwind | `import { shilpSutraPreset } from '@devalok/shilp-sutra/tailwind'` | |

## Barrel-Isolated Components (per-component import required)

These components are NOT in the main barrel to avoid pulling in heavy dependencies via Next.js webpack:

| Component | Import |
|-----------|--------|
| DataTable | `import { DataTable } from '@devalok/shilp-sutra/ui/data-table'` |
| DataTableToolbar | `import { DataTableToolbar } from '@devalok/shilp-sutra/ui/data-table-toolbar'` |
| Charts | `import { BarChart } from '@devalok/shilp-sutra/ui/charts'` |

## Per-Component Imports (Server Components)

For React Server Components, import individual components to avoid "use client" contamination:

| Component | Import |
|-----------|--------|
| Text | `import { Text } from '@devalok/shilp-sutra/ui/text'` |
| Skeleton | `import { Skeleton } from '@devalok/shilp-sutra/ui/skeleton'` |
| EmptyState | `import { EmptyState } from '@devalok/shilp-sutra/composed/empty-state'` |
| PageHeader | `import { PageHeader } from '@devalok/shilp-sutra/composed/page-header'` |

## Karm Package

| Module | Import |
|--------|--------|
| Board | `import { KanbanBoard } from '@devalok/shilp-sutra-karm/board'` |
| Tasks | `import { TaskDetailPanel } from '@devalok/shilp-sutra-karm/tasks'` |
| Chat | `import { ChatPanel } from '@devalok/shilp-sutra-karm/chat'` |
| Dashboard | `import { AttendanceCTA } from '@devalok/shilp-sutra-karm/dashboard'` |
| Client | `import { ClientPortalHeader } from '@devalok/shilp-sutra-karm/client'` |
| Admin | `import { AdminDashboard } from '@devalok/shilp-sutra-karm/admin'` |
```

**Step 2: Commit**

```bash
git add packages/core/src/ImportGuide.mdx
git commit -m "docs: add import path guide to Storybook"
```

---

## Task 10: Documentation — shadcn migration mapping

**Files:**
- Create: `packages/core/src/ShadcnMigration.mdx`

**Step 1: Create migration guide MDX page**

Create `packages/core/src/ShadcnMigration.mdx`:

```mdx
import { Meta } from '@storybook/blocks'

<Meta title="Guides/Coming from shadcn" />

# Coming from shadcn/ui?

Shilp Sutra uses a **two-axis variant system** (`variant` + `color`) instead of shadcn's single `variant` prop. Here's the mapping:

## Button

| shadcn/ui | shilp-sutra |
|-----------|-------------|
| `variant="default"` | `variant="solid"` |
| `variant="destructive"` | `variant="solid" color="error"` |
| `variant="outline"` | `variant="outline"` |
| `variant="secondary"` | `variant="subtle"` |
| `variant="ghost"` | `variant="ghost"` |
| `variant="link"` | `variant="link"` |

## Badge

| shadcn/ui | shilp-sutra |
|-----------|-------------|
| `variant="default"` | `variant="solid"` |
| `variant="destructive"` | `variant="solid" color="error"` |
| `variant="secondary"` | `variant="subtle"` |
| `variant="outline"` | `variant="outline"` |

## Alert

| shadcn/ui | shilp-sutra |
|-----------|-------------|
| `variant="default"` | `color="info"` (or `variant="subtle" color="info"`) |
| `variant="destructive"` | `color="error"` (or `variant="filled" color="error"`) |

## Key Differences

- **Two-axis system:** Most components accept `variant` (visual style) + `color` (semantic meaning) as separate props
- **Color palette:** `primary`, `success`, `warning`, `error`, `info`, `neutral` — not CSS color names
- **Icon props:** Pass JSX elements `icon={<IconName />}`, not component references
- **Tooltip:** Use `<SimpleTooltip content="text">` for the common case
```

**Step 2: Commit**

```bash
git add packages/core/src/ShadcnMigration.mdx
git commit -m "docs: add shadcn/ui migration guide to Storybook"
```

---

## Task 11: Documentation — v0.5.0 migration guide + EmptyState changelog

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Add v0.5.0 breaking changes to CHANGELOG**

Add a clear section to `CHANGELOG.md` under the v0.5.0 entry:

```markdown
### Breaking Changes (v0.5.0)

- **EmptyState** `icon` prop changed from `ComponentType` (component reference) to `ReactNode` (JSX element).
  ```tsx
  // Before (v0.4.x)
  <EmptyState icon={IconFolderOpen} title="No files" />

  // After (v0.5.0)
  <EmptyState icon={<IconFolderOpen />} title="No files" />
  ```

- **Barrel isolation:** `DataTable`, `DataTableToolbar`, and all Chart components removed from the main UI barrel export. Use per-component imports:
  ```tsx
  // Before (v0.4.x)
  import { DataTable } from '@devalok/shilp-sutra'

  // After (v0.5.0)
  import { DataTable } from '@devalok/shilp-sutra/ui/data-table'
  import { BarChart } from '@devalok/shilp-sutra/ui/charts'
  ```
```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add v0.5.0 breaking changes and migration notes to CHANGELOG"
```

---

## Task 12: Documentation — Karm package README

**Files:**
- Modify: `packages/karm/README.md`

**Step 1: Write README**

Update `packages/karm/README.md` with:
- What the package is
- When to use it (vs core)
- Install instructions
- Component inventory by module with import paths
- Peer dependency requirements (`@devalok/shilp-sutra >=0.1.0`)

**Step 2: Commit**

```bash
git add packages/karm/README.md
git commit -m "docs: add comprehensive README for @devalok/shilp-sutra-karm"
```

---

## Task 13: Build verification + version bump

**Files:**
- Modify: `packages/core/package.json` (version bump to 0.6.0)

**Step 1: Run full test suite**

Run: `cd packages/core && pnpm vitest run`
Expected: ALL PASS

**Step 2: Run typecheck**

Run: `pnpm -r run typecheck`
Expected: No errors

**Step 3: Run build**

Run: `pnpm -r run build`
Expected: Clean build, no errors

**Step 4: Verify Storybook**

Run: `pnpm storybook` (manual check)
Verify: New stories render, package labels visible, import guide accessible

**Step 5: Bump version**

In `packages/core/package.json`: change `"version"` from `"0.5.0"` to `"0.6.0"`

**Step 6: Update CHANGELOG**

Add v0.6.0 entry with all changes from this plan.

**Step 7: Commit**

```bash
git add packages/core/package.json CHANGELOG.md
git commit -m "chore: bump @devalok/shilp-sutra to v0.6.0"
```

---

## Task Dependencies

```
Task 1 (StatusBadge)     ─┐
Task 2 (Alert)           ─┤
Task 3 (PageHeader)      ─┤── independent, can run in parallel
Task 4 (SimpleTooltip)   ─┤
Task 5 (Icon migration)  ─┤
Task 6 (CalendarGrid)    ─┘
Task 7 (ScheduleView)    ── depends on Task 4 (uses SimpleTooltip for event hover)
Tasks 8-12 (Docs)        ── independent, can run in parallel after Tasks 1-7
Task 13 (Build + bump)   ── must run last
```
