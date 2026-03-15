# Dashboard Components & Scratchpad Refactor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 4 new karm components (WeekHeatmap, TaskActionRow, ProjectHealthCard, Scratchpad composable system), enhance 2 core components (ActivityFeed time grouping, Banner multi-action wrapping), and upgrade SidebarScratchpad to feature parity with the full widget.

**Architecture:** Compound component + context pattern for composable components (matching board-context.tsx). Props-driven for ProjectHealthCard. All components use the DS token system, framer-motion animations, and follow forwardRef + displayName conventions. TDD throughout.

**Tech Stack:** React 18, TypeScript 5.7 (strict), framer-motion 12, @dnd-kit/core + @dnd-kit/sortable (already in karm), Vitest + RTL + vitest-axe, CVA, Tailwind 3.4

**Design Doc:** `docs/plans/2026-03-15-dashboard-components-design.md`

---

## Task 1: ActivityFeed — Time Grouping Enhancement

**Files:**
- Modify: `packages/core/src/composed/activity-feed.tsx`
- Modify: `packages/core/src/composed/__tests__/activity-feed.test.tsx`
- Modify: `packages/core/src/composed/activity-feed.stories.tsx`
- Modify: `packages/core/docs/components/composed/activity-feed.md`

**Step 1: Write the failing tests**

Add to `packages/core/src/composed/__tests__/activity-feed.test.tsx`:

```tsx
describe('groupBy="time"', () => {
  const now = new Date('2026-03-15T14:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })
  afterEach(() => vi.useRealTimers())

  const groupedItems: ActivityItem[] = [
    { id: '1', action: 'Today action', timestamp: new Date('2026-03-15T10:00:00Z'), actor: { name: 'A' } },
    { id: '2', action: 'Yesterday action', timestamp: new Date('2026-03-14T10:00:00Z'), actor: { name: 'B' } },
    { id: '3', action: 'This week action', timestamp: new Date('2026-03-11T10:00:00Z'), actor: { name: 'C' } },
    { id: '4', action: 'Older action', timestamp: new Date('2026-03-01T10:00:00Z'), actor: { name: 'D' } },
  ]

  it('renders group headers when groupBy="time"', () => {
    render(<ActivityFeed items={groupedItems} groupBy="time" />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
    expect(screen.getByText('Earlier this week')).toBeInTheDocument()
    expect(screen.getByText('Older')).toBeInTheDocument()
  })

  it('skips empty groups', () => {
    const todayOnly = [groupedItems[0]]
    render(<ActivityFeed items={todayOnly} groupBy="time" />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.queryByText('Yesterday')).not.toBeInTheDocument()
    expect(screen.queryByText('Earlier this week')).not.toBeInTheDocument()
    expect(screen.queryByText('Older')).not.toBeInTheDocument()
  })

  it('supports custom group labels', () => {
    render(
      <ActivityFeed
        items={groupedItems}
        groupBy="time"
        groupLabels={{ today: 'Aaj', yesterday: 'Kal', thisWeek: 'Is hafte', older: 'Purane' }}
      />,
    )
    expect(screen.getByText('Aaj')).toBeInTheDocument()
    expect(screen.getByText('Kal')).toBeInTheDocument()
  })

  it('does not render group headers when groupBy="none"', () => {
    render(<ActivityFeed items={groupedItems} groupBy="none" />)
    expect(screen.queryByText('Today')).not.toBeInTheDocument()
  })

  it('applies maxInitialItems before grouping', () => {
    render(<ActivityFeed items={groupedItems} groupBy="time" maxInitialItems={2} />)
    // Only first 2 items visible, grouped
    expect(screen.getByText('Today action')).toBeInTheDocument()
    expect(screen.getByText('Yesterday action')).toBeInTheDocument()
    expect(screen.queryByText('This week action')).not.toBeInTheDocument()
    expect(screen.getByText(/Show all/)).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/activity-feed.test.tsx`
Expected: FAIL — `groupBy` prop not recognized, no group headers rendered

**Step 3: Implement grouping logic**

In `packages/core/src/composed/activity-feed.tsx`:

1. Add `GroupLabels` type and new props to `ActivityFeedProps`:
```tsx
export interface GroupLabels {
  today?: string
  yesterday?: string
  thisWeek?: string
  older?: string
}

export interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  // ... existing props unchanged ...
  groupBy?: 'time' | 'none'
  groupLabels?: GroupLabels
}
```

2. Add pure grouping function (before the component):
```tsx
const DEFAULT_LABELS: Required<GroupLabels> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'Earlier this week',
  older: 'Older',
}

function groupItemsByTime(
  items: ActivityItem[],
  labels: GroupLabels = {},
): { label: string; items: ActivityItem[] }[] {
  const merged = { ...DEFAULT_LABELS, ...labels }
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)) // Monday

  const buckets: Record<string, ActivityItem[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  }

  for (const item of items) {
    const ts = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp)
    if (ts >= startOfToday) buckets.today.push(item)
    else if (ts >= startOfYesterday) buckets.yesterday.push(item)
    else if (ts >= startOfWeek) buckets.thisWeek.push(item)
    else buckets.older.push(item)
  }

  return (['today', 'yesterday', 'thisWeek', 'older'] as const)
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({ label: merged[key], items: buckets[key] }))
}
```

3. In the component render, after the `truncated`/`displayItems` logic, add group rendering when `groupBy="time"`:
```tsx
// Inside the component, replace the flat item map with:
const groups = groupBy === 'time' ? groupItemsByTime(displayItems, groupLabels) : null

// In JSX, replace the items.map section:
{groups
  ? groups.map((group, gi) => (
      <div key={group.label}>
        <div
          className={cn(
            'border-b border-surface-border pb-ds-02 uppercase tracking-ds-wide text-ds-xs text-surface-fg-subtle',
            gi > 0 && 'mt-ds-04',
            'mb-ds-02',
          )}
        >
          {group.label}
        </div>
        {group.items.map((item) => (
          <ActivityEntry key={item.id} item={item} compact={compact} />
        ))}
      </div>
    ))
  : displayItems.map((item) => (
      <ActivityEntry key={item.id} item={item} compact={compact} />
    ))}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/activity-feed.test.tsx`
Expected: ALL PASS

**Step 5: Add stories**

Add to `packages/core/src/composed/activity-feed.stories.tsx`:

```tsx
const GROUPED_ITEMS: ActivityItem[] = [
  { id: 'g1', actor: { name: 'Ananya Joshi' }, action: 'completed review', timestamp: new Date(), color: 'success' },
  { id: 'g2', actor: { name: 'Ravi Kumar' }, action: 'updated task', timestamp: new Date(), color: 'info' },
  { id: 'g3', actor: { name: 'Priya Sharma' }, action: 'added comment', timestamp: new Date(Date.now() - 86400000), color: 'default' },
  { id: 'g4', actor: { name: 'Vikram Singh' }, action: 'moved to Done', timestamp: new Date(Date.now() - 86400000), color: 'success' },
  { id: 'g5', actor: { name: 'Meera Patel' }, action: 'created task', timestamp: new Date(Date.now() - 3 * 86400000), color: 'info' },
  { id: 'g6', actor: { name: 'Arjun Nair' }, action: 'uploaded file', timestamp: new Date(Date.now() - 10 * 86400000), color: 'warning' },
]

export const GroupedByTime: Story = {
  args: {
    items: GROUPED_ITEMS,
    groupBy: 'time',
  },
}

export const GroupedByTimeCompact: Story = {
  args: {
    items: GROUPED_ITEMS,
    groupBy: 'time',
    compact: true,
  },
}

export const GroupedWithCustomLabels: Story = {
  args: {
    items: GROUPED_ITEMS,
    groupBy: 'time',
    groupLabels: { today: 'Aaj', yesterday: 'Kal', thisWeek: 'Is hafte', older: 'Purane' },
  },
}
```

**Step 6: Update component docs**

Update `packages/core/docs/components/composed/activity-feed.md` — add `groupBy` and `groupLabels` to props table, add a Changes entry for the new version.

**Step 7: Run full test suite for core composed**

Run: `cd packages/core && pnpm vitest run src/composed/`
Expected: ALL PASS

**Step 8: Commit**

```bash
git add packages/core/src/composed/activity-feed.tsx packages/core/src/composed/__tests__/activity-feed.test.tsx packages/core/src/composed/activity-feed.stories.tsx packages/core/docs/components/composed/activity-feed.md
git commit -m "feat(core): add groupBy='time' to ActivityFeed with customizable labels"
```

---

## Task 2: Banner — Multi-Action Mobile Wrapping

**Files:**
- Modify: `packages/core/src/ui/banner.tsx`
- Modify: `packages/core/src/ui/__tests__/banner-a11y.test.tsx`
- Modify: `packages/core/src/ui/banner.stories.tsx`
- Modify: `packages/core/docs/components/ui/banner.md`

**Step 1: Write the failing tests**

Add to `packages/core/src/ui/__tests__/banner-a11y.test.tsx`:

```tsx
it('renders with actions prop (plural alias)', async () => {
  const { container } = render(
    <Banner color="error" actions={<><button>View tasks</button><button>View reviews</button></>}>
      3 overdue tasks
    </Banner>,
  )
  expect(screen.getByText('View tasks')).toBeInTheDocument()
  expect(screen.getByText('View reviews')).toBeInTheDocument()
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

it('prefers actions over action when both provided', () => {
  render(
    <Banner color="info" action={<button>Old</button>} actions={<button>New</button>}>
      Test
    </Banner>,
  )
  expect(screen.getByText('New')).toBeInTheDocument()
  expect(screen.queryByText('Old')).not.toBeInTheDocument()
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/banner-a11y.test.tsx`
Expected: FAIL — `actions` prop not recognized

**Step 3: Implement changes**

In `packages/core/src/ui/banner.tsx`:

1. Update `BannerProps`:
```tsx
interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof bannerVariants> {
  /** @deprecated Use `actions` instead */
  action?: React.ReactNode
  actions?: React.ReactNode
  onDismiss?: () => void
}
```

2. In the component body, resolve the prop:
```tsx
const resolvedActions = actions ?? action
```

3. Update the root layout `className` — add `flex-wrap`:
```tsx
className={cn(
  bannerVariants({ color }),
  'flex flex-wrap items-center gap-ds-04 px-ds-06 py-ds-04 text-ds-md font-medium border-b overflow-hidden',
  className,
)}
```

4. Add `min-w-0` to the children wrapper:
```tsx
<div className="min-w-0 flex-1">{children}</div>
```

5. Wrap the actions in a flex container with gap:
```tsx
{resolvedActions && (
  <div className="flex shrink-0 items-center gap-ds-02">{resolvedActions}</div>
)}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/banner-a11y.test.tsx`
Expected: ALL PASS

**Step 5: Add stories**

Add to `packages/core/src/ui/banner.stories.tsx`:

```tsx
export const MultipleActions: Story = {
  args: {
    color: 'error',
    children: '3 overdue tasks · 1 review waiting',
    actions: (
      <>
        <Button variant="ghost" size="sm">View tasks</Button>
        <Button variant="ghost" size="sm">View reviews</Button>
      </>
    ),
  },
}
```

**Step 6: Update component docs**

Update `packages/core/docs/components/ui/banner.md` — add `actions` prop, deprecation note for `action`, Changes entry.

**Step 7: Commit**

```bash
git add packages/core/src/ui/banner.tsx packages/core/src/ui/__tests__/banner-a11y.test.tsx packages/core/src/ui/banner.stories.tsx packages/core/docs/components/ui/banner.md
git commit -m "feat(core): add actions prop to Banner with mobile flex-wrap"
```

---

## Task 3: Scratchpad — Context & Root

**Files:**
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-context.tsx`
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-root.tsx`
- Create: `packages/karm/src/dashboard/__tests__/scratchpad-context.test.tsx`

**Step 1: Write the failing tests**

Create `packages/karm/src/dashboard/__tests__/scratchpad-context.test.tsx`:

```tsx
import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ScratchpadProvider, useScratchpad } from '../scratchpad/scratchpad-context'
import type { ScratchpadItem } from '../scratchpad/scratchpad-context'

const items: ScratchpadItem[] = [
  { id: '1', text: 'Task one', done: false },
  { id: '2', text: 'Task two', done: true },
]

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ScratchpadProvider items={items} onToggle={vi.fn()}>
      {children}
    </ScratchpadProvider>
  )
}

describe('useScratchpad', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useScratchpad())).toThrow('useScratchpad must be used within ScratchpadProvider')
  })

  it('provides items from context', () => {
    const { result } = renderHook(() => useScratchpad(), { wrapper })
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].text).toBe('Task one')
  })

  it('provides visibleItems respecting filter', () => {
    const { result } = renderHook(() => useScratchpad(), { wrapper })
    // Default: showCompleted=true, so all visible
    expect(result.current.visibleItems).toHaveLength(2)
  })

  it('exposes callback presence flags', () => {
    const { result } = renderHook(() => useScratchpad(), { wrapper })
    expect(result.current.canAdd).toBe(false) // no onAdd provided
    expect(result.current.canDelete).toBe(false)
    expect(result.current.canEdit).toBe(false)
    expect(result.current.canReorder).toBe(false)
    expect(result.current.canPromote).toBe(false)
  })

  it('exposes callbacks when provided', () => {
    const onAdd = vi.fn()
    const onPromote = vi.fn()
    function wrapperFull({ children }: { children: React.ReactNode }) {
      return (
        <ScratchpadProvider items={items} onToggle={vi.fn()} onAdd={onAdd} onPromote={onPromote}>
          {children}
        </ScratchpadProvider>
      )
    }
    const { result } = renderHook(() => useScratchpad(), { wrapper: wrapperFull })
    expect(result.current.canAdd).toBe(true)
    expect(result.current.canPromote).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-context.test.tsx`
Expected: FAIL — module not found

**Step 3: Implement context**

Create `packages/karm/src/dashboard/scratchpad/scratchpad-context.tsx`:

```tsx
'use client'

import * as React from 'react'
import { createContext, useContext, useState, useMemo } from 'react'

export interface ScratchpadItem {
  id: string
  text: string
  done: boolean
}

export interface ScratchpadContextValue {
  items: ScratchpadItem[]
  visibleItems: ScratchpadItem[]
  maxItems: number
  showCompleted: boolean
  setShowCompleted: (show: boolean) => void
  onToggle: (id: string, done: boolean) => void
  onAdd?: (text: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, text: string) => void
  onReorder?: (items: ScratchpadItem[]) => void
  onPromote?: (id: string) => void
  canAdd: boolean
  canDelete: boolean
  canEdit: boolean
  canReorder: boolean
  canPromote: boolean
}

const ScratchpadContext = createContext<ScratchpadContextValue | null>(null)

export interface ScratchpadProviderProps {
  items: ScratchpadItem[]
  maxItems?: number
  onToggle: (id: string, done: boolean) => void
  onAdd?: (text: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, text: string) => void
  onReorder?: (items: ScratchpadItem[]) => void
  onPromote?: (id: string) => void
  children: React.ReactNode
}

function ScratchpadProvider({
  items,
  maxItems = Infinity,
  onToggle,
  onAdd,
  onDelete,
  onEdit,
  onReorder,
  onPromote,
  children,
}: ScratchpadProviderProps) {
  const [showCompleted, setShowCompleted] = useState(true)

  const visibleItems = useMemo(
    () => (showCompleted ? items : items.filter((i) => !i.done)),
    [items, showCompleted],
  )

  const value = useMemo<ScratchpadContextValue>(
    () => ({
      items,
      visibleItems,
      maxItems,
      showCompleted,
      setShowCompleted,
      onToggle,
      onAdd,
      onDelete,
      onEdit,
      onReorder,
      onPromote,
      canAdd: !!onAdd,
      canDelete: !!onDelete,
      canEdit: !!onEdit,
      canReorder: !!onReorder,
      canPromote: !!onPromote,
    }),
    [items, visibleItems, maxItems, showCompleted, onToggle, onAdd, onDelete, onEdit, onReorder, onPromote],
  )

  return <ScratchpadContext.Provider value={value}>{children}</ScratchpadContext.Provider>
}

function useScratchpad(): ScratchpadContextValue {
  const ctx = useContext(ScratchpadContext)
  if (!ctx) throw new Error('useScratchpad must be used within ScratchpadProvider')
  return ctx
}

export { ScratchpadProvider, useScratchpad }
```

Create `packages/karm/src/dashboard/scratchpad/scratchpad-root.tsx`:

```tsx
'use client'

import * as React from 'react'
import { ScratchpadProvider } from './scratchpad-context'
import type { ScratchpadProviderProps } from './scratchpad-context'

export type ScratchpadRootProps = ScratchpadProviderProps

const ScratchpadRoot = React.forwardRef<HTMLDivElement, ScratchpadRootProps & React.HTMLAttributes<HTMLDivElement>>(
  function ScratchpadRoot({ items, maxItems, onToggle, onAdd, onDelete, onEdit, onReorder, onPromote, children, ...props }, ref) {
    return (
      <ScratchpadProvider
        items={items}
        maxItems={maxItems}
        onToggle={onToggle}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        onReorder={onReorder}
        onPromote={onPromote}
      >
        <div ref={ref} {...props}>
          {children}
        </div>
      </ScratchpadProvider>
    )
  },
)

ScratchpadRoot.displayName = 'Scratchpad.Root'

export { ScratchpadRoot }
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-context.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add packages/karm/src/dashboard/scratchpad/
git commit -m "feat(karm): add Scratchpad context provider and Root component"
```

---

## Task 4: Scratchpad — ProgressRing, FilterToggle, EmptyState, Collapse

**Files:**
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-progress-ring.tsx`
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-filter-toggle.tsx`
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-empty-state.tsx`
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-collapse.tsx`
- Create: `packages/karm/src/dashboard/__tests__/scratchpad-parts.test.tsx`

**Step 1: Write failing tests**

Create `packages/karm/src/dashboard/__tests__/scratchpad-parts.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ScratchpadProvider } from '../scratchpad/scratchpad-context'
import { ScratchpadProgressRing } from '../scratchpad/scratchpad-progress-ring'
import { ScratchpadFilterToggle } from '../scratchpad/scratchpad-filter-toggle'
import { ScratchpadEmptyState } from '../scratchpad/scratchpad-empty-state'
import { ScratchpadCollapse } from '../scratchpad/scratchpad-collapse'
import type { ScratchpadItem } from '../scratchpad/scratchpad-context'

const items: ScratchpadItem[] = [
  { id: '1', text: 'A', done: false },
  { id: '2', text: 'B', done: true },
]

function Wrapper({ children, itemsOverride }: { children: React.ReactNode; itemsOverride?: ScratchpadItem[] }) {
  return (
    <ScratchpadProvider items={itemsOverride ?? items} onToggle={vi.fn()} maxItems={5}>
      {children}
    </ScratchpadProvider>
  )
}

describe('ScratchpadProgressRing', () => {
  it('renders count from context', () => {
    render(<ScratchpadProgressRing />, { wrapper: Wrapper })
    expect(screen.getByTestId('progress-count')).toHaveTextContent('2/5')
  })

  it('renders sm size', () => {
    const { container } = render(<ScratchpadProgressRing size="sm" />, { wrapper: Wrapper })
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '16')
  })
})

describe('ScratchpadFilterToggle', () => {
  it('toggles filter state on click', async () => {
    const user = userEvent.setup()
    render(<ScratchpadFilterToggle />, { wrapper: Wrapper })
    const btn = screen.getByRole('button', { name: /hide completed/i })
    await user.click(btn)
    expect(screen.getByRole('button', { name: /show completed/i })).toBeInTheDocument()
  })
})

describe('ScratchpadEmptyState', () => {
  it('renders when items are empty', () => {
    render(
      <Wrapper itemsOverride={[]}>
        <ScratchpadEmptyState />
      </Wrapper>,
    )
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
  })

  it('does not render when items exist', () => {
    render(<ScratchpadEmptyState />, { wrapper: Wrapper })
    expect(screen.queryByText(/nothing here yet/i)).not.toBeInTheDocument()
  })
})

describe('ScratchpadCollapse', () => {
  it('collapses and expands on header click', async () => {
    const user = userEvent.setup()
    render(
      <Wrapper>
        <ScratchpadCollapse title="Scratchpad">
          <div>Content</div>
        </ScratchpadCollapse>
      </Wrapper>,
    )
    expect(screen.getByText('Content')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /scratchpad/i }))
    // Content should be in a collapsed grid container
    const btn = screen.getByRole('button', { name: /scratchpad/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-parts.test.tsx`
Expected: FAIL — modules not found

**Step 3: Implement the four sub-components**

Create `packages/karm/src/dashboard/scratchpad/scratchpad-progress-ring.tsx`:

```tsx
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { useScratchpad } from './scratchpad-context'

const SIZES = {
  sm: { size: 16, stroke: 1.5, fontSize: '6px' },
  md: { size: 20, stroke: 2, fontSize: '8px' },
} as const

export interface ScratchpadProgressRingProps {
  size?: 'sm' | 'md'
  className?: string
}

function ScratchpadProgressRing({ size = 'md', className }: ScratchpadProgressRingProps) {
  const { items, maxItems } = useScratchpad()
  const config = SIZES[size]
  const radius = (config.size - config.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const count = items.length
  const max = maxItems === Infinity ? items.length : maxItems
  const allDone = items.length > 0 && items.every((i) => i.done)
  const progress = max > 0 ? count / max : 0
  const offset = circumference * (1 - progress)

  return (
    <motion.div
      className={cn('relative flex items-center justify-center', className)}
      animate={allDone ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <svg
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
        className="-rotate-90"
      >
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={config.stroke}
          className="stroke-surface-2"
        />
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-300', allDone ? 'stroke-success-9' : 'stroke-accent-9')}
        />
      </svg>
      <span
        className="absolute font-medium text-surface-fg-muted"
        style={{ fontSize: config.fontSize }}
        data-testid="progress-count"
      >
        {count}/{max}
      </span>
    </motion.div>
  )
}

ScratchpadProgressRing.displayName = 'Scratchpad.ProgressRing'

export { ScratchpadProgressRing }
```

Create `packages/karm/src/dashboard/scratchpad/scratchpad-filter-toggle.tsx`:

```tsx
'use client'

import * as React from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { useScratchpad } from './scratchpad-context'

export interface ScratchpadFilterToggleProps {
  className?: string
}

function ScratchpadFilterToggle({ className }: ScratchpadFilterToggleProps) {
  const { showCompleted, setShowCompleted } = useScratchpad()
  const Icon = showCompleted ? IconEye : IconEyeOff
  const label = showCompleted ? 'Hide completed' : 'Show completed'

  return (
    <button
      type="button"
      onClick={() => setShowCompleted(!showCompleted)}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-ico-md w-ico-md items-center justify-center rounded-ds-sm text-surface-fg-subtle transition-colors hover:bg-surface-2 hover:text-surface-fg-muted',
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

ScratchpadFilterToggle.displayName = 'Scratchpad.FilterToggle'

export { ScratchpadFilterToggle }
```

Create `packages/karm/src/dashboard/scratchpad/scratchpad-empty-state.tsx`:

```tsx
'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { useScratchpad } from './scratchpad-context'

export interface ScratchpadEmptyStateProps {
  text?: string
  icon?: React.ComponentType<{ className?: string }>
  compact?: boolean
  className?: string
}

function ScratchpadEmptyState({
  text = 'Nothing here yet. Add a task!',
  icon: Icon,
  compact = false,
  className,
}: ScratchpadEmptyStateProps) {
  const { visibleItems } = useScratchpad()

  if (visibleItems.length > 0) return null

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-ds-03 text-center',
        compact ? 'py-ds-04' : 'py-ds-06',
        className,
      )}
    >
      {Icon && <Icon className={cn('text-surface-fg-subtle', compact ? 'h-ico-md w-ico-md' : 'h-ico-lg w-ico-lg')} />}
      <span className={cn('text-surface-fg-subtle', compact ? 'text-ds-sm' : 'text-ds-md')}>{text}</span>
    </div>
  )
}

ScratchpadEmptyState.displayName = 'Scratchpad.EmptyState'

export { ScratchpadEmptyState }
```

Create `packages/karm/src/dashboard/scratchpad/scratchpad-collapse.tsx`:

```tsx
'use client'

import * as React from 'react'
import { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { useScratchpad } from './scratchpad-context'

export interface ScratchpadCollapseProps {
  title?: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

function ScratchpadCollapse({ title = 'Scratchpad', defaultOpen = true, children, className }: ScratchpadCollapseProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { items } = useScratchpad()
  const pendingCount = items.filter((i) => !i.done).length

  return (
    <div className={cn('flex flex-col', className)}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-label={title}
        className="flex w-full items-center gap-ds-02 px-ds-03 py-ds-02 text-left text-ds-sm font-semibold text-surface-fg-muted transition-colors hover:bg-surface-2"
      >
        <IconChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', !open && '-rotate-180')}
        />
        <span className="flex-1">{title}</span>
        {pendingCount > 0 && (
          <span className="rounded-full bg-surface-2 px-1.5 text-ds-xs text-surface-fg-muted">{pendingCount}</span>
        )}
      </button>
      <div
        className={cn('grid transition-[grid-template-rows] duration-200', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

ScratchpadCollapse.displayName = 'Scratchpad.Collapse'

export { ScratchpadCollapse }
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-parts.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add packages/karm/src/dashboard/scratchpad/
git commit -m "feat(karm): add Scratchpad ProgressRing, FilterToggle, EmptyState, Collapse"
```

---

## Task 5: Scratchpad — Header, AddInput, Item (with inline edit, promote, drag)

**Files:**
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-header.tsx`
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-add-input.tsx`
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-item.tsx`
- Create: `packages/karm/src/dashboard/__tests__/scratchpad-item.test.tsx`

**Step 1: Write failing tests for Item**

Create `packages/karm/src/dashboard/__tests__/scratchpad-item.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ScratchpadProvider } from '../scratchpad/scratchpad-context'
import { ScratchpadItem as ScratchpadItemComponent } from '../scratchpad/scratchpad-item'
import type { ScratchpadItem } from '../scratchpad/scratchpad-context'

const item: ScratchpadItem = { id: '1', text: 'Test task', done: false }

const onToggle = vi.fn()
const onDelete = vi.fn()
const onEdit = vi.fn()
const onPromote = vi.fn()

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ScratchpadProvider
      items={[item]}
      onToggle={onToggle}
      onDelete={onDelete}
      onEdit={onEdit}
      onPromote={onPromote}
    >
      {children}
    </ScratchpadProvider>
  )
}

describe('ScratchpadItem', () => {
  beforeEach(() => vi.clearAllMocks())

  it('has no a11y violations', async () => {
    const { container } = render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders checkbox and text', () => {
    render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    expect(screen.getByLabelText(`Toggle ${item.text}`)).toBeInTheDocument()
    expect(screen.getByText(item.text)).toBeInTheDocument()
  })

  it('calls onToggle when checkbox clicked', async () => {
    const user = userEvent.setup()
    render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    await user.click(screen.getByLabelText(`Toggle ${item.text}`))
    expect(onToggle).toHaveBeenCalledWith('1', true)
  })

  it('enters edit mode on double click', async () => {
    const user = userEvent.setup()
    render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    await user.dblClick(screen.getByText(item.text))
    expect(screen.getByDisplayValue(item.text)).toBeInTheDocument()
  })

  it('calls onEdit on Enter in edit mode', async () => {
    const user = userEvent.setup()
    render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    await user.dblClick(screen.getByText(item.text))
    const input = screen.getByDisplayValue(item.text)
    await user.clear(input)
    await user.type(input, 'Updated task{Enter}')
    expect(onEdit).toHaveBeenCalledWith('1', 'Updated task')
  })

  it('cancels edit on Escape', async () => {
    const user = userEvent.setup()
    render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    await user.dblClick(screen.getByText(item.text))
    fireEvent.keyDown(screen.getByDisplayValue(item.text), { key: 'Escape' })
    expect(screen.getByText(item.text)).toBeInTheDocument()
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('shows delete button with aria-label', () => {
    render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    expect(screen.getByLabelText(`Delete ${item.text}`)).toBeInTheDocument()
  })

  it('shows promote button with aria-label', () => {
    render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    expect(screen.getByLabelText(`Promote ${item.text} to task`)).toBeInTheDocument()
  })

  it('calls onPromote when promote button clicked', async () => {
    const user = userEvent.setup()
    render(<ScratchpadItemComponent item={item} />, { wrapper: Wrapper })
    await user.click(screen.getByLabelText(`Promote ${item.text} to task`))
    expect(onPromote).toHaveBeenCalledWith('1')
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-item.test.tsx`
Expected: FAIL — module not found

**Step 3: Implement Header, AddInput, and Item**

Create `packages/karm/src/dashboard/scratchpad/scratchpad-header.tsx`:

```tsx
'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'

export interface ScratchpadHeaderProps {
  title?: string
  compact?: boolean
  children?: React.ReactNode
  className?: string
}

function ScratchpadHeader({ title = 'My Scratchpad', compact = false, children, className }: ScratchpadHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', compact ? 'px-ds-03 py-ds-02' : 'px-ds-05b py-ds-05', className)}>
      <span className={cn('font-semibold text-surface-fg', compact ? 'text-ds-sm' : 'text-ds-base')}>{title}</span>
      {children && <div className="flex items-center gap-ds-02">{children}</div>}
    </div>
  )
}

ScratchpadHeader.displayName = 'Scratchpad.Header'

export { ScratchpadHeader }
```

Create `packages/karm/src/dashboard/scratchpad/scratchpad-add-input.tsx`:

```tsx
'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/ui/lib/utils'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { useScratchpad } from './scratchpad-context'

export interface ScratchpadAddInputProps {
  compact?: boolean
  className?: string
}

function ScratchpadAddInput({ compact = false, className }: ScratchpadAddInputProps) {
  const { items, maxItems, canAdd, onAdd } = useScratchpad()
  const [isAdding, setIsAdding] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus()
  }, [isAdding])

  if (!canAdd || !onAdd) return null
  if (items.length >= maxItems) return null

  function handleSubmit() {
    const trimmed = text.trim()
    if (trimmed) {
      onAdd!(trimmed)
      setText('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setText('')
    }
  }

  return (
    <div className={cn(compact ? 'px-ds-03 pb-ds-02' : 'mt-ds-02b', className)}>
      {isAdding ? (
        <div className="flex items-center gap-ds-03">
          <Input
            ref={inputRef}
            size="sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!text.trim()) {
                setIsAdding(false)
                setText('')
              }
            }}
            placeholder="What needs doing?"
            className="flex-1"
          />
          <Button size="sm" onClick={handleSubmit} onMouseDown={(e) => e.preventDefault()}>
            Add
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={cn(
            'w-full rounded-ds-md text-left text-surface-fg-subtle transition-colors hover:bg-surface-2',
            compact ? 'px-ds-02 py-0.5 text-ds-sm' : 'px-ds-02 py-ds-02 text-ds-md',
          )}
        >
          + Add a task...
        </button>
      )}
    </div>
  )
}

ScratchpadAddInput.displayName = 'Scratchpad.AddInput'

export { ScratchpadAddInput }
```

Create `packages/karm/src/dashboard/scratchpad/scratchpad-item.tsx`:

```tsx
'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IconX, IconArrowUp, IconGripVertical } from '@tabler/icons-react'
import { springs } from '@/ui/lib/motion'
import { cn } from '@/ui/lib/utils'
import { Checkbox } from '@/ui/checkbox'
import { Input } from '@/ui/input'
import { useScratchpad } from './scratchpad-context'
import type { ScratchpadItem as ScratchpadItemType } from './scratchpad-context'

export interface ScratchpadItemProps {
  item: ScratchpadItemType
  compact?: boolean
  dragHandleProps?: Record<string, unknown>
  className?: string
}

function ScratchpadItemComponent({
  item,
  compact = false,
  dragHandleProps,
  className,
}: ScratchpadItemProps) {
  const { onToggle, onDelete, onEdit, onPromote, canDelete, canEdit, canPromote, canReorder } = useScratchpad()
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(item.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  function handleEditSubmit() {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== item.text && onEdit) {
      onEdit(item.id, trimmed)
    }
    setEditing(false)
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEditSubmit()
    } else if (e.key === 'Escape') {
      setEditing(false)
      setEditText(item.text)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={springs.snappy}
      className={cn(
        'group flex items-center rounded-ds-md transition-colors hover:bg-surface-2',
        compact ? 'gap-ds-02 px-ds-02 py-0.5' : 'gap-ds-03 px-ds-02 py-ds-02',
        className,
      )}
    >
      {/* Drag handle */}
      {canReorder && dragHandleProps && (
        <button
          type="button"
          className="flex cursor-grab items-center text-surface-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 active:cursor-grabbing"
          {...dragHandleProps}
          aria-label="Drag to reorder"
        >
          <IconGripVertical className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Checkbox */}
      <Checkbox
        checked={item.done}
        onCheckedChange={(checked) => onToggle(item.id, checked === true)}
        aria-label={`Toggle ${item.text}`}
        className={compact ? 'h-3.5 w-3.5' : undefined}
      />

      {/* Text or edit input */}
      {editing && canEdit ? (
        <Input
          ref={inputRef}
          size="sm"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditSubmit}
          className="flex-1"
        />
      ) : (
        <span
          className={cn(
            'flex-1 transition-all duration-200 ease-in-out',
            compact ? 'text-ds-sm' : 'text-ds-md',
            item.done && 'text-surface-fg-subtle line-through',
            canEdit && 'cursor-text',
          )}
          onDoubleClick={() => {
            if (canEdit) {
              setEditText(item.text)
              setEditing(true)
            }
          }}
        >
          {item.text}
        </span>
      )}

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {/* Promote */}
        {canPromote && onPromote && (
          <button
            type="button"
            onClick={() => onPromote(item.id)}
            aria-label={`Promote ${item.text} to task`}
            className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-sm text-accent-11 transition-colors hover:bg-surface-3 hover:text-accent-12"
          >
            <IconArrowUp className="h-3 w-3" />
          </button>
        )}

        {/* Delete */}
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.text}`}
            className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-sm text-surface-fg-subtle transition-colors hover:bg-surface-3"
          >
            <IconX className="h-3 w-3" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

ScratchpadItemComponent.displayName = 'Scratchpad.Item'

export { ScratchpadItemComponent as ScratchpadItem }
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-item.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add packages/karm/src/dashboard/scratchpad/
git commit -m "feat(karm): add Scratchpad Header, AddInput, Item with inline edit and promote"
```

---

## Task 6: Scratchpad — List (with drag-to-reorder) & Barrel Export

**Files:**
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad-list.tsx`
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad.tsx` (barrel + compound export)
- Create: `packages/karm/src/dashboard/scratchpad/index.ts`
- Create: `packages/karm/src/dashboard/__tests__/scratchpad-list.test.tsx`

**Step 1: Write failing tests**

Create `packages/karm/src/dashboard/__tests__/scratchpad-list.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { DndContext } from '@dnd-kit/core'
import { ScratchpadProvider } from '../scratchpad/scratchpad-context'
import { ScratchpadList } from '../scratchpad/scratchpad-list'
import type { ScratchpadItem } from '../scratchpad/scratchpad-context'

const items: ScratchpadItem[] = [
  { id: '1', text: 'First', done: false },
  { id: '2', text: 'Second', done: true },
  { id: '3', text: 'Third', done: false },
]

function Wrapper({ children, onReorder }: { children: React.ReactNode; onReorder?: (items: ScratchpadItem[]) => void }) {
  return (
    <ScratchpadProvider items={items} onToggle={vi.fn()} onDelete={vi.fn()} onReorder={onReorder}>
      {children}
    </ScratchpadProvider>
  )
}

describe('ScratchpadList', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <Wrapper>
        <ScratchpadList />
      </Wrapper>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders all visible items', () => {
    render(
      <Wrapper>
        <ScratchpadList />
      </Wrapper>,
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('renders drag handles when onReorder provided', () => {
    render(
      <Wrapper onReorder={vi.fn()}>
        <ScratchpadList />
      </Wrapper>,
    )
    expect(screen.getAllByLabelText('Drag to reorder')).toHaveLength(3)
  })

  it('does not render drag handles without onReorder', () => {
    render(
      <Wrapper>
        <ScratchpadList />
      </Wrapper>,
    )
    expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-list.test.tsx`
Expected: FAIL — module not found

**Step 3: Implement List and barrel**

Create `packages/karm/src/dashboard/scratchpad/scratchpad-list.tsx`:

```tsx
'use client'

import * as React from 'react'
import { useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/ui/lib/utils'
import { useScratchpad } from './scratchpad-context'
import { ScratchpadItem } from './scratchpad-item'
import type { ScratchpadItem as ScratchpadItemType } from './scratchpad-context'

function SortableItem({ item, compact }: { item: ScratchpadItemType; compact: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ScratchpadItem item={item} compact={compact} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

export interface ScratchpadListProps {
  compact?: boolean
  className?: string
}

function ScratchpadList({ compact = false, className }: ScratchpadListProps) {
  const { visibleItems, items, canReorder, onReorder } = useScratchpad()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id || !onReorder) return

      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = [...items]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)
      onReorder(reordered)
    },
    [items, onReorder],
  )

  const itemIds = visibleItems.map((i) => i.id)

  const list = (
    <div className={cn('flex flex-col', compact ? 'gap-0.5' : 'gap-ds-02b', className)}>
      <AnimatePresence initial={false}>
        {canReorder
          ? visibleItems.map((item) => <SortableItem key={item.id} item={item} compact={compact} />)
          : visibleItems.map((item) => <ScratchpadItem key={item.id} item={item} compact={compact} />)}
      </AnimatePresence>
    </div>
  )

  if (!canReorder) return list

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {list}
      </SortableContext>
    </DndContext>
  )
}

ScratchpadList.displayName = 'Scratchpad.List'

export { ScratchpadList }
```

Create `packages/karm/src/dashboard/scratchpad/scratchpad.tsx`:

```tsx
import { ScratchpadRoot } from './scratchpad-root'
import { ScratchpadHeader } from './scratchpad-header'
import { ScratchpadList } from './scratchpad-list'
import { ScratchpadItem } from './scratchpad-item'
import { ScratchpadAddInput } from './scratchpad-add-input'
import { ScratchpadEmptyState } from './scratchpad-empty-state'
import { ScratchpadProgressRing } from './scratchpad-progress-ring'
import { ScratchpadFilterToggle } from './scratchpad-filter-toggle'
import { ScratchpadCollapse } from './scratchpad-collapse'

const Scratchpad = {
  Root: ScratchpadRoot,
  Header: ScratchpadHeader,
  List: ScratchpadList,
  Item: ScratchpadItem,
  AddInput: ScratchpadAddInput,
  EmptyState: ScratchpadEmptyState,
  ProgressRing: ScratchpadProgressRing,
  FilterToggle: ScratchpadFilterToggle,
  Collapse: ScratchpadCollapse,
} as const

export { Scratchpad }
```

Create `packages/karm/src/dashboard/scratchpad/index.ts`:

```tsx
export { Scratchpad } from './scratchpad'
export { ScratchpadRoot, type ScratchpadRootProps } from './scratchpad-root'
export { ScratchpadHeader, type ScratchpadHeaderProps } from './scratchpad-header'
export { ScratchpadList, type ScratchpadListProps } from './scratchpad-list'
export { ScratchpadItem, type ScratchpadItemProps } from './scratchpad-item'
export { ScratchpadAddInput, type ScratchpadAddInputProps } from './scratchpad-add-input'
export { ScratchpadEmptyState, type ScratchpadEmptyStateProps } from './scratchpad-empty-state'
export { ScratchpadProgressRing, type ScratchpadProgressRingProps } from './scratchpad-progress-ring'
export { ScratchpadFilterToggle, type ScratchpadFilterToggleProps } from './scratchpad-filter-toggle'
export { ScratchpadCollapse, type ScratchpadCollapseProps } from './scratchpad-collapse'
export { ScratchpadProvider, useScratchpad, type ScratchpadItem as ScratchpadItemType, type ScratchpadContextValue, type ScratchpadProviderProps } from './scratchpad-context'
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-list.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add packages/karm/src/dashboard/scratchpad/
git commit -m "feat(karm): add Scratchpad List with dnd-kit reorder and compound barrel export"
```

---

## Task 7: Scratchpad — Refactor ScratchpadWidget & SidebarScratchpad to use composable parts

**Files:**
- Modify: `packages/karm/src/dashboard/scratchpad-widget.tsx`
- Modify: `packages/karm/src/dashboard/sidebar-scratchpad.tsx`
- Modify: `packages/karm/src/dashboard/index.ts`
- Modify: `packages/karm/src/dashboard/__tests__/scratchpad-widget.test.tsx`
- Modify: `packages/karm/src/dashboard/__tests__/sidebar-scratchpad.test.tsx`

**Step 1: Run existing tests to confirm baseline passes**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-widget.test.tsx src/dashboard/__tests__/sidebar-scratchpad.test.tsx`
Expected: ALL PASS (baseline)

**Step 2: Refactor ScratchpadWidget**

Rewrite `packages/karm/src/dashboard/scratchpad-widget.tsx` to compose from `Scratchpad.*` primitives. The external API (props) stays identical. Internally it becomes:

```tsx
'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Scratchpad } from './scratchpad/scratchpad'
import type { ScratchpadItemType } from './scratchpad/scratchpad-context'

export type { ScratchpadItemType as ScratchpadItem }

export interface ScratchpadWidgetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  items: ScratchpadItemType[]
  maxItems?: number
  onToggle: (id: string, done: boolean) => void
  onAdd: (text: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string, text: string) => void
  onReorder?: (items: ScratchpadItemType[]) => void
  onPromote?: (id: string) => void
  title?: string
  resetLabel?: string
  emptyText?: string
  emptyIcon?: React.ComponentType<{ className?: string }>
  loading?: boolean
}

const ScratchpadWidget = React.forwardRef<HTMLDivElement, ScratchpadWidgetProps>(
  function ScratchpadWidget(
    {
      items,
      maxItems = 5,
      onToggle,
      onAdd,
      onDelete,
      onEdit,
      onReorder,
      onPromote,
      title = 'My Scratchpad',
      resetLabel,
      emptyText,
      emptyIcon,
      loading = false,
      className,
      ...props
    },
    ref,
  ) {
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex flex-col gap-ds-04 rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01 p-ds-05b',
            className,
          )}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
            <div className="h-5 w-5 animate-pulse rounded-full bg-surface-2" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-ds-03">
              <div className="h-ico-md w-ico-md shrink-0 animate-pulse rounded-ds-sm bg-surface-2" />
              <div className="h-4 animate-pulse rounded bg-surface-2" style={{ width: `${50 + i * 12}%` }} />
            </div>
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01',
          className,
        )}
        {...props}
      >
        <Scratchpad.Root
          items={items}
          maxItems={maxItems}
          onToggle={onToggle}
          onAdd={onAdd}
          onDelete={onDelete}
          onEdit={onEdit}
          onReorder={onReorder}
          onPromote={onPromote}
        >
          <Scratchpad.Header title={title}>
            <Scratchpad.FilterToggle />
            <Scratchpad.ProgressRing />
          </Scratchpad.Header>
          <div className="flex flex-col border-t border-surface-border-strong px-ds-05b pb-ds-04 pt-ds-04">
            <Scratchpad.EmptyState text={emptyText} icon={emptyIcon} />
            <Scratchpad.List />
            <Scratchpad.AddInput />
            {resetLabel && <span className="mt-ds-03 text-ds-xs text-surface-fg-subtle">{resetLabel}</span>}
          </div>
        </Scratchpad.Root>
      </div>
    )
  },
)

ScratchpadWidget.displayName = 'ScratchpadWidget'

export { ScratchpadWidget }
```

**Step 3: Refactor SidebarScratchpad**

Rewrite `packages/karm/src/dashboard/sidebar-scratchpad.tsx`:

```tsx
'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Scratchpad } from './scratchpad/scratchpad'
import type { ScratchpadItemType } from './scratchpad/scratchpad-context'

export interface SidebarScratchpadProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ScratchpadItemType[]
  onToggle: (id: string, done: boolean) => void
  onAdd?: (text: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, text: string) => void
  onReorder?: (items: ScratchpadItemType[]) => void
  onPromote?: (id: string) => void
  defaultOpen?: boolean
  maxItems?: number
}

const SidebarScratchpad = React.forwardRef<HTMLDivElement, SidebarScratchpadProps>(
  function SidebarScratchpad(
    { items, onToggle, onAdd, onDelete, onEdit, onReorder, onPromote, defaultOpen = true, maxItems, className, ...props },
    ref,
  ) {
    return (
      <div ref={ref} className={cn('flex flex-col', className)} {...props}>
        <Scratchpad.Root
          items={items}
          maxItems={maxItems}
          onToggle={onToggle}
          onAdd={onAdd}
          onDelete={onDelete}
          onEdit={onEdit}
          onReorder={onReorder}
          onPromote={onPromote}
        >
          <Scratchpad.Collapse title="Scratchpad" defaultOpen={defaultOpen}>
            <div className="flex flex-col gap-0.5 px-ds-03 pb-ds-02">
              <Scratchpad.EmptyState compact />
              <Scratchpad.List compact />
              <Scratchpad.AddInput compact />
            </div>
          </Scratchpad.Collapse>
        </Scratchpad.Root>
      </div>
    )
  },
)

SidebarScratchpad.displayName = 'SidebarScratchpad'

export { SidebarScratchpad }
```

**Step 4: Update dashboard barrel exports**

Update `packages/karm/src/dashboard/index.ts` to also export the composable parts:

```tsx
export { ScratchpadWidget, type ScratchpadItem, type ScratchpadWidgetProps } from './scratchpad-widget'
export { SidebarScratchpad, type SidebarScratchpadProps } from './sidebar-scratchpad'
export { Scratchpad } from './scratchpad'
export type {
  ScratchpadRootProps,
  ScratchpadHeaderProps,
  ScratchpadListProps,
  ScratchpadItemProps,
  ScratchpadAddInputProps,
  ScratchpadEmptyStateProps,
  ScratchpadProgressRingProps,
  ScratchpadFilterToggleProps,
  ScratchpadCollapseProps,
} from './scratchpad'
// ... keep existing exports (AttendanceCTA, DailyBrief)
```

**Step 5: Update existing tests**

The existing `scratchpad-widget.test.tsx` and `sidebar-scratchpad.test.tsx` should still pass with the refactored components since the external API is unchanged. Run them:

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-widget.test.tsx src/dashboard/__tests__/sidebar-scratchpad.test.tsx`
Expected: ALL PASS

If any tests fail due to implementation differences (e.g., different DOM structure), update them to test the same behavior via accessible queries (roles, labels, text) rather than class names.

**Step 6: Update sidebar test for new features**

Add tests to `sidebar-scratchpad.test.tsx` for new capabilities:

```tsx
it('renders add input when onAdd provided', () => {
  render(<SidebarScratchpad items={items} onToggle={vi.fn()} onAdd={vi.fn()} />)
  expect(screen.getByText('+ Add a task...')).toBeInTheDocument()
})

it('renders delete buttons when onDelete provided', () => {
  render(<SidebarScratchpad items={items} onToggle={vi.fn()} onDelete={vi.fn()} />)
  expect(screen.getByLabelText(`Delete ${items[0].text}`)).toBeInTheDocument()
})
```

**Step 7: Run full dashboard test suite**

Run: `cd packages/karm && pnpm vitest run src/dashboard/`
Expected: ALL PASS

**Step 8: Commit**

```bash
git add packages/karm/src/dashboard/
git commit -m "refactor(karm): rewrite ScratchpadWidget and SidebarScratchpad to use composable primitives"
```

---

## Task 8: Scratchpad — Stories for composable usage

**Files:**
- Modify: `packages/karm/src/dashboard/scratchpad-widget.stories.tsx`
- Modify: `packages/karm/src/dashboard/sidebar-scratchpad.stories.tsx`
- Create: `packages/karm/src/dashboard/scratchpad/scratchpad.stories.tsx`

**Step 1: Create composable Scratchpad stories**

Create `packages/karm/src/dashboard/scratchpad/scratchpad.stories.tsx` showing the compound API:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { IconClipboardList } from '@tabler/icons-react'
import { Scratchpad } from './scratchpad'

const ITEMS = [
  { id: '1', text: 'Review PR #42', done: false },
  { id: '2', text: 'Update docs', done: true },
  { id: '3', text: 'Fix login bug', done: false },
]

const meta: Meta = {
  title: 'Karm/Dashboard/Scratchpad (Composable)',
  decorators: [(Story) => <div style={{ maxWidth: 380 }}><Story /></div>],
}

export default meta

export const FullCard: StoryObj = {
  render: () => (
    <div className="rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01">
      <Scratchpad.Root
        items={ITEMS}
        maxItems={5}
        onToggle={fn()}
        onAdd={fn()}
        onDelete={fn()}
        onEdit={fn()}
        onReorder={fn()}
        onPromote={fn()}
      >
        <Scratchpad.Header title="My Scratchpad">
          <Scratchpad.FilterToggle />
          <Scratchpad.ProgressRing />
        </Scratchpad.Header>
        <div className="flex flex-col border-t border-surface-border-strong px-ds-05b pb-ds-04 pt-ds-04">
          <Scratchpad.EmptyState icon={IconClipboardList} />
          <Scratchpad.List />
          <Scratchpad.AddInput />
        </div>
      </Scratchpad.Root>
    </div>
  ),
}

export const SidebarCompact: StoryObj = {
  decorators: [(Story) => <div style={{ maxWidth: 260, border: '1px solid var(--surface-border)' }}><Story /></div>],
  render: () => (
    <Scratchpad.Root items={ITEMS} onToggle={fn()} onAdd={fn()} onDelete={fn()} onEdit={fn()} onPromote={fn()}>
      <Scratchpad.Collapse title="Scratchpad">
        <div className="flex flex-col gap-0.5 px-ds-03 pb-ds-02">
          <Scratchpad.EmptyState compact />
          <Scratchpad.List compact />
          <Scratchpad.AddInput compact />
        </div>
      </Scratchpad.Collapse>
    </Scratchpad.Root>
  ),
}

export const WithDragReorder: StoryObj = {
  render: () => (
    <div className="rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01">
      <Scratchpad.Root items={ITEMS} maxItems={5} onToggle={fn()} onAdd={fn()} onDelete={fn()} onReorder={fn()}>
        <Scratchpad.Header title="Drag to reorder">
          <Scratchpad.ProgressRing />
        </Scratchpad.Header>
        <div className="flex flex-col border-t border-surface-border-strong px-ds-05b pb-ds-04 pt-ds-04">
          <Scratchpad.List />
          <Scratchpad.AddInput />
        </div>
      </Scratchpad.Root>
    </div>
  ),
}

export const MinimalReadOnly: StoryObj = {
  render: () => (
    <Scratchpad.Root items={ITEMS} onToggle={fn()}>
      <Scratchpad.Header title="Read-only" />
      <Scratchpad.List />
    </Scratchpad.Root>
  ),
}
```

**Step 2: Update existing stories to show new features**

Add to `scratchpad-widget.stories.tsx`:

```tsx
export const WithAllFeatures: Story = {
  args: {
    ...Default.args,
    onEdit: fn(),
    onReorder: fn(),
    onPromote: fn(),
  },
}
```

Add to `sidebar-scratchpad.stories.tsx`:

```tsx
export const WithFullFeatures: Story = {
  args: {
    ...Default.args,
    onAdd: fn(),
    onDelete: fn(),
    onEdit: fn(),
    onPromote: fn(),
  },
}
```

**Step 3: Commit**

```bash
git add packages/karm/src/dashboard/
git commit -m "feat(karm): add Scratchpad composable stories and update prebuilt stories"
```

---

## Task 9: WeekHeatmap — Context, Root, DayStrip, Day

**Files:**
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap-context.tsx`
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap-root.tsx`
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap-day.tsx`
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap-day-strip.tsx`
- Create: `packages/karm/src/dashboard/__tests__/week-heatmap.test.tsx`

**Step 1: Write failing tests**

Create `packages/karm/src/dashboard/__tests__/week-heatmap.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { WeekHeatmapProvider, useWeekHeatmap } from '../week-heatmap/week-heatmap-context'
import { WeekHeatmapDayStrip } from '../week-heatmap/week-heatmap-day-strip'
import type { WeekDay } from '../week-heatmap/week-heatmap-context'

const DAYS: WeekDay[] = [
  { date: '2026-03-09', completed: 3, total: 3 },
  { date: '2026-03-10', completed: 2, total: 4 },
  { date: '2026-03-11', completed: 1, total: 3 },
  { date: '2026-03-12', completed: 0, total: 2 },
  { date: '2026-03-13', completed: 0, total: 0 },
  { date: '2026-03-14', completed: 0, total: 0 },
  { date: '2026-03-15', completed: 0, total: 0 },
]

function Wrapper({ children }: { children: React.ReactNode }) {
  return <WeekHeatmapProvider days={DAYS}>{children}</WeekHeatmapProvider>
}

describe('WeekHeatmapDayStrip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-12T14:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('has no a11y violations', async () => {
    const { container } = render(<WeekHeatmapDayStrip />, { wrapper: Wrapper })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders 7 day cells', () => {
    render(<WeekHeatmapDayStrip />, { wrapper: Wrapper })
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
  })

  it('renders completion counts', () => {
    render(<WeekHeatmapDayStrip />, { wrapper: Wrapper })
    expect(screen.getByText('3/3')).toBeInTheDocument()
    expect(screen.getByText('2/4')).toBeInTheDocument()
  })

  it('fires onDayClick', async () => {
    const onClick = vi.fn()
    render(
      <WeekHeatmapProvider days={DAYS} onDayClick={onClick}>
        <WeekHeatmapDayStrip />
      </WeekHeatmapProvider>,
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('3/3'))
    expect(onClick).toHaveBeenCalledWith('2026-03-09')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<WeekHeatmapDayStrip />, { wrapper: Wrapper })
    const grid = screen.getByRole('grid')
    grid.focus()
    // Tab into the grid focuses first cell
    await user.tab()
    const firstCell = screen.getAllByRole('gridcell')[0]
    expect(firstCell).toHaveFocus()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/week-heatmap.test.tsx`
Expected: FAIL — modules not found

**Step 3: Implement context + day components**

Create the context, root, day, and day-strip files following the same pattern as the Scratchpad context. The context provides `days`, `onDayClick`, `overdue`, and a helper `getDayStatus(date)` that returns `'complete' | 'partial' | 'none' | 'today' | 'future' | 'empty'`.

The DayStrip renders a 7-column CSS grid with `role="grid"`, each day cell as `role="gridcell"` with roving tabindex. Each day cell uses the token colors specified in the design doc. Tooltip uses the existing DS `Tooltip` component.

**Step 4: Run tests**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/week-heatmap.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add packages/karm/src/dashboard/week-heatmap/
git commit -m "feat(karm): add WeekHeatmap context, DayStrip with keyboard nav and tooltips"
```

---

## Task 10: WeekHeatmap — Summary, ProgressBar, Streak, Barrel + Stories

**Files:**
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap-summary.tsx`
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap-progress-bar.tsx`
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap-streak.tsx`
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap.tsx` (barrel + props shorthand)
- Create: `packages/karm/src/dashboard/week-heatmap/index.ts`
- Create: `packages/karm/src/dashboard/week-heatmap/week-heatmap.stories.tsx`
- Modify: `packages/karm/src/dashboard/index.ts`

**Step 1: Implement Summary, ProgressBar, Streak, barrel**

- **Summary**: Reads context, renders "N completed · N remaining · N overdue" with color tokens from design doc
- **ProgressBar**: Uses existing DS `Progress` component with `color="success"` and computed percentage
- **Streak**: Counts consecutive 100%-complete past days, renders "N-day streak" when > 1
- **Barrel**: `WeekHeatmap.Root`, `.DayStrip`, `.Summary`, `.ProgressBar`, `.Streak` + props shorthand

**Step 2: Write tests for summary and streak**

Add to `week-heatmap.test.tsx`:

```tsx
describe('WeekHeatmapSummary', () => {
  it('renders completed and remaining counts', () => {
    render(<WeekHeatmapSummary />, { wrapper: Wrapper })
    expect(screen.getByText(/6 completed/)).toBeInTheDocument()
    expect(screen.getByText(/6 remaining/)).toBeInTheDocument()
  })
})

describe('WeekHeatmapStreak', () => {
  it('renders streak when consecutive complete days exist', () => {
    // Days[0] is 3/3 complete — that's a 1-day streak, so nothing shows
    // Need 2+ consecutive complete days for streak to render
    const streakDays = DAYS.map((d, i) =>
      i <= 1 ? { ...d, completed: d.total || 1, total: d.total || 1 } : d,
    )
    render(
      <WeekHeatmapProvider days={streakDays}>
        <WeekHeatmapStreak />
      </WeekHeatmapProvider>,
    )
    expect(screen.getByText(/2-day streak/)).toBeInTheDocument()
  })
})
```

**Step 3: Add stories**

Create `week-heatmap.stories.tsx` with: Default, AllComplete, MostlyEmpty, WithOverdue, Composable.

**Step 4: Update dashboard barrel**

Add WeekHeatmap exports to `packages/karm/src/dashboard/index.ts`.

**Step 5: Run tests and commit**

Run: `cd packages/karm && pnpm vitest run src/dashboard/`
Expected: ALL PASS

```bash
git add packages/karm/src/dashboard/
git commit -m "feat(karm): complete WeekHeatmap with Summary, ProgressBar, Streak, and stories"
```

---

## Task 11: TaskActionRow — Context, Root, core sub-components

**Files:**
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-context.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-root.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-checkbox.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-priority.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-title.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-due-date.tsx`
- Create: `packages/karm/src/tasks/__tests__/task-action-row.test.tsx`

**Step 1: Write failing tests**

Create `packages/karm/src/tasks/__tests__/task-action-row.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { TaskActionRowRoot } from '../task-action-row/task-action-row-root'
import { TaskActionRowCheckbox } from '../task-action-row/task-action-row-checkbox'
import { TaskActionRowPriority } from '../task-action-row/task-action-row-priority'
import { TaskActionRowTitle } from '../task-action-row/task-action-row-title'
import { TaskActionRowDueDate } from '../task-action-row/task-action-row-due-date'

const task = {
  id: 'task-1',
  title: 'Fix login bug',
  priority: 'HIGH' as const,
  dueDate: '2026-03-18',
  projectName: 'Project X',
  projectId: 'proj-1',
  isOverdue: false,
  labels: ['frontend', 'urgent'],
}

describe('TaskActionRow', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <TaskActionRowRoot task={task}>
        <TaskActionRowCheckbox onComplete={vi.fn()} />
        <TaskActionRowPriority />
        <TaskActionRowTitle truncate />
        <TaskActionRowDueDate />
      </TaskActionRowRoot>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders task title', () => {
    render(
      <TaskActionRowRoot task={task}>
        <TaskActionRowTitle />
      </TaskActionRowRoot>,
    )
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('fires onClick on row click', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <TaskActionRowRoot task={task} onClick={onClick}>
        <TaskActionRowTitle />
      </TaskActionRowRoot>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('fires onComplete on checkbox click', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(
      <TaskActionRowRoot task={task}>
        <TaskActionRowCheckbox onComplete={onComplete} />
        <TaskActionRowTitle />
      </TaskActionRowRoot>,
    )
    await user.click(screen.getByRole('checkbox'))
    expect(onComplete).toHaveBeenCalledWith('task-1')
  })

  it('shows priority indicator', () => {
    render(
      <TaskActionRowRoot task={task}>
        <TaskActionRowPriority />
      </TaskActionRowRoot>,
    )
    // PriorityIndicator renders with display="compact" — check for accessible content
    expect(screen.getByText(/high/i)).toBeInTheDocument()
  })

  it('renders due date', () => {
    render(
      <TaskActionRowRoot task={task}>
        <TaskActionRowDueDate />
      </TaskActionRowRoot>,
    )
    expect(screen.getByText('Mar 18')).toBeInTheDocument()
  })

  it('supports keyboard activation with Enter', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <TaskActionRowRoot task={task} onClick={onClick}>
        <TaskActionRowTitle />
      </TaskActionRowRoot>,
    )
    const row = screen.getByRole('button')
    row.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalled()
  })
})
```

**Step 2: Run tests to verify they fail, implement components, run again**

Follow the same TDD pattern: context provides task data, Root is a `role="button"` div with keyboard handling, sub-components consume context.

**Step 3: Commit**

```bash
git add packages/karm/src/tasks/task-action-row/
git commit -m "feat(karm): add TaskActionRow context, Root, Checkbox, Priority, Title, DueDate"
```

---

## Task 12: TaskActionRow — Labels, ProjectBadge, StatusBadge, Navigate, Barrel + Stories

**Files:**
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-labels.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-project-badge.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-status-badge.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row-navigate.tsx`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row.tsx` (barrel + props shorthand)
- Create: `packages/karm/src/tasks/task-action-row/index.ts`
- Create: `packages/karm/src/tasks/task-action-row/task-action-row.stories.tsx`
- Modify: `packages/karm/src/tasks/index.ts`
- Modify: `packages/karm/src/index.ts`

**Step 1: Implement remaining sub-components**

- **Labels**: Renders `task.labels` as `Badge size="xs" variant="subtle"`, `max` prop truncates with "+N" badge
- **ProjectBadge**: `Badge variant="subtle" color="default" size="xs"` with `onClick` that `e.stopPropagation()`
- **StatusBadge**: Uses core `StatusBadge` component with `task.stage`
- **Navigate**: `IconButton size="sm" variant="ghost"` with `IconChevronRight`, `e.stopPropagation()`
- **Barrel**: `TaskActionRow.Root`, `.Checkbox`, `.Priority`, `.Title`, `.Labels`, `.ProjectBadge`, `.StatusBadge`, `.DueDate`, `.Navigate` + props shorthand

**Step 2: Add tests for Labels and Navigate**

Add to `task-action-row.test.tsx`:

```tsx
it('renders labels with max truncation', () => {
  render(
    <TaskActionRowRoot task={task}>
      <TaskActionRowLabels max={1} />
    </TaskActionRowRoot>,
  )
  expect(screen.getByText('frontend')).toBeInTheDocument()
  expect(screen.getByText('+1')).toBeInTheDocument()
})

it('renders navigate button with aria-label', () => {
  render(
    <TaskActionRowRoot task={task}>
      <TaskActionRowNavigate href="/projects/proj-1/board?task=task-1" />
    </TaskActionRowRoot>,
  )
  expect(screen.getByLabelText('Open task in project board')).toBeInTheDocument()
})
```

**Step 3: Create stories**

Create `task-action-row.stories.tsx` with: FullDashboard, MinimalNotification, ClientPortalReadOnly, PropsShorthand, OverdueTask, WithLabels.

**Step 4: Update barrel exports**

Add TaskActionRow exports to `packages/karm/src/tasks/index.ts` and `packages/karm/src/index.ts`.

**Step 5: Run tests and commit**

Run: `cd packages/karm && pnpm vitest run src/tasks/__tests__/task-action-row.test.tsx`
Expected: ALL PASS

```bash
git add packages/karm/src/tasks/task-action-row/ packages/karm/src/tasks/index.ts packages/karm/src/index.ts
git commit -m "feat(karm): complete TaskActionRow with Labels, ProjectBadge, Navigate, and stories"
```

---

## Task 13: ProjectHealthCard (with sparkline)

**Files:**
- Create: `packages/karm/src/dashboard/project-health-card.tsx`
- Create: `packages/karm/src/dashboard/__tests__/project-health-card.test.tsx`
- Create: `packages/karm/src/dashboard/project-health-card.stories.tsx`
- Modify: `packages/karm/src/dashboard/index.ts`

**Step 1: Write failing tests**

Create `packages/karm/src/dashboard/__tests__/project-health-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ProjectHealthCard } from '../project-health-card'

const project = {
  id: 'proj-1',
  name: 'Project X',
  completed: 18,
  total: 24,
  overdue: 3,
  urgent: 2,
  contextLine: 'Sprint ends Mar 19',
  trend: [0.6, 0.7, 0.65, 0.75, 0.8, 0.85, 0.75],
}

describe('ProjectHealthCard', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<ProjectHealthCard project={project} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders project name', () => {
    render(<ProjectHealthCard project={project} />)
    expect(screen.getByText('Project X')).toBeInTheDocument()
  })

  it('renders urgent badge when urgent > 0', () => {
    render(<ProjectHealthCard project={project} />)
    expect(screen.getByText('2 urgent')).toBeInTheDocument()
  })

  it('renders overdue badge when no urgent but overdue > 0', () => {
    render(<ProjectHealthCard project={{ ...project, urgent: 0 }} />)
    expect(screen.getByText('3 overdue')).toBeInTheDocument()
  })

  it('renders "on track" when no urgent/overdue', () => {
    render(<ProjectHealthCard project={{ ...project, urgent: 0, overdue: 0 }} />)
    expect(screen.getByText('on track')).toBeInTheDocument()
  })

  it('renders progress count', () => {
    render(<ProjectHealthCard project={project} />)
    expect(screen.getByText('18/24 tasks')).toBeInTheDocument()
  })

  it('renders context line', () => {
    render(<ProjectHealthCard project={project} />)
    expect(screen.getByText(/Sprint ends Mar 19/)).toBeInTheDocument()
  })

  it('renders sparkline SVG when trend provided', () => {
    const { container } = render(<ProjectHealthCard project={project} />)
    expect(container.querySelector('svg.sparkline')).toBeInTheDocument()
  })

  it('does not render sparkline when no trend', () => {
    const { container } = render(<ProjectHealthCard project={{ ...project, trend: undefined }} />)
    expect(container.querySelector('svg.sparkline')).not.toBeInTheDocument()
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<ProjectHealthCard project={project} onClick={onClick} />)
    await user.click(screen.getByText('Project X'))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders loading skeleton', () => {
    const { container } = render(<ProjectHealthCard project={project} loading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
```

**Step 2: Run to verify they fail, then implement**

Implement `project-health-card.tsx` as a single-file props-driven component. The sparkline is an inline SVG with monotone cubic interpolation (catmull-rom). Use a `generateSparklinePath(points, width, height)` helper that:

1. Normalizes Y values to the data range (min→max, with min visual range)
2. Generates a catmull-rom spline path through the 7 points
3. Returns the `d` attribute for the `<path>`

The gradient fill path closes at the bottom of the viewbox.

**Step 3: Run tests**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/project-health-card.test.tsx`
Expected: ALL PASS

**Step 4: Create stories**

Create `project-health-card.stories.tsx` with: Default, OnTrack, Urgent, OverdueOnly, WithTrend, WithoutTrend, Loading, Grid (multiple cards in a CSS grid).

**Step 5: Update barrel exports and commit**

```bash
git add packages/karm/src/dashboard/project-health-card* packages/karm/src/dashboard/index.ts
git commit -m "feat(karm): add ProjectHealthCard with sparkline, loading state, and stories"
```

---

## Task 14: Component Documentation

**Files:**
- Create: `packages/karm/docs/components/dashboard/week-heatmap.md`
- Create: `packages/karm/docs/components/dashboard/project-health-card.md`
- Create: `packages/karm/docs/components/tasks/task-action-row.md`
- Modify: `packages/karm/docs/components/dashboard/scratchpad-widget.md`
- Modify: `packages/karm/docs/components/dashboard/sidebar-scratchpad.md`
- Modify: `packages/core/docs/components/composed/activity-feed.md`
- Modify: `packages/core/docs/components/ui/banner.md`

**Step 1: Write docs for new components**

Follow the existing doc format from `scratchpad-widget.md`:
- Metadata (import path, server-safe, category)
- Props table with types and defaults
- Related types
- Example JSX
- Gotchas
- Changes (version history)

**Step 2: Update docs for enhanced components**

- ActivityFeed: Add `groupBy`, `groupLabels` props
- Banner: Add `actions` prop, deprecation note for `action`
- ScratchpadWidget: Add `onEdit`, `onReorder`, `onPromote` props
- SidebarScratchpad: Document new feature-rich API

**Step 3: Commit**

```bash
git add packages/karm/docs/ packages/core/docs/
git commit -m "docs(karm,core): add component docs for all new and enhanced dashboard components"
```

---

## Task 15: Full Integration Test Pass & Typecheck

**Step 1: Run full karm test suite**

Run: `cd packages/karm && pnpm vitest run`
Expected: ALL PASS

**Step 2: Run full core test suite**

Run: `cd packages/core && pnpm vitest run`
Expected: ALL PASS

**Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS with no errors

**Step 4: Lint**

Run: `pnpm lint`
Expected: PASS (fix any issues)

**Step 5: Build**

Run: `pnpm build`
Expected: ALL packages build successfully

**Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix(karm): resolve typecheck and lint issues from dashboard components"
```

---

## Summary

| Task | Component | Type | Est. Complexity |
|------|-----------|------|-----------------|
| 1 | ActivityFeed groupBy | Core enhancement | Small |
| 2 | Banner actions | Core enhancement | Small |
| 3 | Scratchpad Context + Root | Karm new | Medium |
| 4 | Scratchpad ProgressRing, Filter, Empty, Collapse | Karm new | Medium |
| 5 | Scratchpad Header, AddInput, Item | Karm new | Large |
| 6 | Scratchpad List (dnd) + Barrel | Karm new | Large |
| 7 | Scratchpad Widget/Sidebar refactor | Karm refactor | Medium |
| 8 | Scratchpad Stories | Karm stories | Small |
| 9 | WeekHeatmap core | Karm new | Large |
| 10 | WeekHeatmap remaining + stories | Karm new | Medium |
| 11 | TaskActionRow core | Karm new | Large |
| 12 | TaskActionRow remaining + stories | Karm new | Medium |
| 13 | ProjectHealthCard + sparkline | Karm new | Medium |
| 14 | Component documentation | Docs | Small |
| 15 | Integration test + typecheck + build | Verification | Small |
