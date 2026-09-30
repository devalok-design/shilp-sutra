# Karm Enhancement Requests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship DataTable server-side features, ScratchpadWidget, ActivityFeed, DailyBrief enhancements, and small prop additions (F1/F5/F6) so Karm can migrate 14+ tables and adopt new dashboard components.

**Architecture:** Enhance existing DataTable (ui/data-table.tsx) with server-side props using TanStack's manual modes. New composed component ActivityFeed in core. New ScratchpadWidget + SidebarScratchpad + enhanced DailyBrief in karm/dashboard. Small prop additions to sidebar, bottom-navbar, empty-state.

**Tech Stack:** React 18, TypeScript, TanStack Table v8, Tailwind 3.4, CVA, Vitest + RTL + vitest-axe

---

## Task 1: F6 — EmptyState `iconSize` prop

**Files:**
- Modify: `packages/core/src/composed/empty-state.tsx`
- Test: `packages/core/src/composed/__tests__/empty-state.test.tsx`

**Step 1: Write the failing test**

In `empty-state.test.tsx`, add:

```tsx
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { EmptyState } from '../empty-state'
import { IconInbox } from '@tabler/icons-react'

describe('EmptyState iconSize', () => {
  it('renders sm icon size when ComponentType icon provided', () => {
    const { container } = render(
      <EmptyState icon={IconInbox} title="Empty" iconSize="sm" />
    )
    const svg = container.querySelector('svg')
    expect(svg?.className).toContain('h-ico-sm')
    expect(svg?.className).toContain('w-ico-sm')
  })

  it('renders lg icon size', () => {
    const { container } = render(
      <EmptyState icon={IconInbox} title="Empty" iconSize="lg" />
    )
    const svg = container.querySelector('svg')
    expect(svg?.className).toContain('h-ico-xl')
    expect(svg?.className).toContain('w-ico-xl')
  })

  it('defaults to md icon size', () => {
    const { container } = render(
      <EmptyState icon={IconInbox} title="Empty" />
    )
    const svg = container.querySelector('svg')
    expect(svg?.className).toContain('h-ico-lg')
    expect(svg?.className).toContain('w-ico-lg')
  })

  it('has no a11y violations with iconSize', async () => {
    const { container } = render(
      <EmptyState icon={IconInbox} title="Empty" iconSize="lg" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/empty-state.test.tsx`
Expected: FAIL — `iconSize` prop not recognized

**Step 3: Implement**

In `empty-state.tsx`, update the props interface (~line 4-10):

```tsx
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
  iconSize?: 'sm' | 'md' | 'lg'
}
```

Update the icon size class logic (~line 37). Replace the existing `iconSizeClass` line:

```tsx
const iconSizeMap = { sm: 'h-ico-sm w-ico-sm', md: 'h-ico-lg w-ico-lg', lg: 'h-ico-xl w-ico-xl' }
const resolvedSize = iconSize ?? (compact ? 'sm' : 'md')
const iconSizeClass = iconSizeMap[resolvedSize]
```

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/empty-state.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/composed/empty-state.tsx packages/core/src/composed/__tests__/empty-state.test.tsx
git commit -m "feat(empty-state): add iconSize prop (sm/md/lg)"
```

---

## Task 2: F5 — BottomNavbar badge

**Files:**
- Modify: `packages/core/src/shell/bottom-navbar.tsx`
- Test: `packages/core/src/shell/__tests__/bottom-navbar.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { BottomNavbar } from '../bottom-navbar'

const icon = <svg data-testid="icon" />

describe('BottomNavbar badge', () => {
  it('renders badge count on nav item', () => {
    render(
      <BottomNavbar
        currentPath="/"
        primaryItems={[
          { title: 'Home', href: '/', icon, badge: 5 },
        ]}
      />
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders 99+ for large badge counts', () => {
    render(
      <BottomNavbar
        currentPath="/"
        primaryItems={[
          { title: 'Alerts', href: '/alerts', icon, badge: 150 },
        ]}
      />
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not render badge when 0 or undefined', () => {
    render(
      <BottomNavbar
        currentPath="/"
        primaryItems={[
          { title: 'Home', href: '/', icon, badge: 0 },
          { title: 'Tasks', href: '/tasks', icon },
        ]}
      />
    )
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('has no a11y violations with badges', async () => {
    const { container } = render(
      <BottomNavbar
        currentPath="/"
        primaryItems={[
          { title: 'Alerts', href: '/alerts', icon, badge: 3 },
        ]}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/shell/__tests__/bottom-navbar.test.tsx`
Expected: FAIL — `badge` not in BottomNavItem

**Step 3: Implement**

In `bottom-navbar.tsx`, update the interface (~line 19-25):

```tsx
export interface BottomNavItem {
  title: string
  href: string
  icon: React.ReactNode
  exact?: boolean
  badge?: number
}
```

In the `BottomNavLink` component, add badge rendering after the icon div (~line 66-86). Wrap the icon in a `relative` container and add the badge:

```tsx
<div className="relative">
  <div className="[&>svg]:h-ico-md [&>svg]:w-ico-md" aria-hidden="true">
    {item.icon}
  </div>
  {item.badge != null && item.badge > 0 && (
    <span
      className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-0.5 text-[10px] font-semibold leading-none text-on-error animate-in zoom-in-75"
      aria-label={`${item.badge > 99 ? '99+' : item.badge} notifications`}
    >
      {item.badge > 99 ? '99+' : item.badge}
    </span>
  )}
</div>
```

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/shell/__tests__/bottom-navbar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/bottom-navbar.tsx packages/core/src/shell/__tests__/bottom-navbar.test.tsx
git commit -m "feat(bottom-navbar): add badge prop to BottomNavItem"
```

---

## Task 3: F1 — AppSidebar `preFooterClassName`

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx`
- Test: `packages/core/src/shell/__tests__/sidebar.test.tsx`

**Step 1: Write the failing test**

```tsx
describe('AppSidebar preFooterClassName', () => {
  it('applies preFooterClassName to preFooterSlot wrapper', () => {
    render(
      <AppSidebar
        currentPath="/"
        preFooterSlot={<div data-testid="pre-footer">Content</div>}
        preFooterClassName="overflow-y-auto max-h-[200px]"
      />
    )
    const preFooter = screen.getByTestId('pre-footer').parentElement
    expect(preFooter?.className).toContain('overflow-y-auto')
    expect(preFooter?.className).toContain('max-h-[200px]')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/shell/__tests__/sidebar.test.tsx`
Expected: FAIL — `preFooterClassName` not in props

**Step 3: Implement**

In `sidebar.tsx`, add to `AppSidebarProps` (~line 120):

```tsx
preFooterSlot?: React.ReactNode
preFooterClassName?: string
```

Update the preFooterSlot rendering (~line 419-425):

```tsx
{preFooterSlot && (
  <>
    <SidebarSeparator />
    <div className={preFooterClassName}>
      {preFooterSlot}
    </div>
  </>
)}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/shell/__tests__/sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx packages/core/src/shell/__tests__/sidebar.test.tsx
git commit -m "feat(sidebar): add preFooterClassName prop for scrollable preFooterSlot"
```

---

## Task 4: D1 — DataTable server-side sorting

**Files:**
- Modify: `packages/core/src/ui/data-table.tsx`
- Test: `packages/core/src/ui/__tests__/data-table-integration.test.tsx`

**Step 1: Write the failing test**

```tsx
describe('DataTable server-side sorting', () => {
  it('calls onSort when sortable header clicked with onSort prop', async () => {
    const onSort = vi.fn()
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        sortable
        onSort={onSort}
      />
    )
    const nameHeader = screen.getByRole('button', { name: /name/i })
    await user.click(nameHeader)
    expect(onSort).toHaveBeenCalledWith('name', 'asc')
    await user.click(nameHeader)
    expect(onSort).toHaveBeenCalledWith('name', 'desc')
    await user.click(nameHeader)
    expect(onSort).toHaveBeenCalledWith('name', false)
  })

  it('does not reorder rows when onSort is provided (manual mode)', async () => {
    const onSort = vi.fn()
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        sortable
        onSort={onSort}
      />
    )
    await user.click(screen.getByRole('button', { name: /name/i }))
    // Rows should remain in original order (server handles reordering)
    const rows = screen.getAllByRole('row').slice(1) // skip header
    expect(rows[0]).toHaveTextContent('Alice')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: FAIL — onSort prop not used

**Step 3: Implement**

In `data-table.tsx`, add to `DataTableProps` (~line 108-159):

```tsx
onSort?: (key: string, direction: 'asc' | 'desc' | false) => void
```

In the `useReactTable` config (~line 329-357), modify sorting setup:

```tsx
...(sortable && {
  onSortingChange: (updater) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater
    setSorting(newSorting)
    if (onSort) {
      if (newSorting.length === 0) {
        onSort(sorting[0]?.id ?? '', false)
      } else {
        onSort(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
      }
    }
  },
  ...(onSort ? { manualSorting: true } : { getSortedRowModel: getSortedRowModel() }),
}),
```

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/data-table.tsx packages/core/src/ui/__tests__/data-table-integration.test.tsx
git commit -m "feat(data-table): add onSort callback for server-side sorting"
```

---

## Task 5: D1 — DataTable `emptyState` ReactNode slot

**Files:**
- Modify: `packages/core/src/ui/data-table.tsx`
- Test: `packages/core/src/ui/__tests__/data-table-integration.test.tsx`

**Step 1: Write the failing test**

```tsx
describe('DataTable emptyState', () => {
  it('renders ReactNode emptyState when data is empty', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyState={<div data-testid="custom-empty">No items found</div>}
      />
    )
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('falls back to noResultsText when emptyState not provided', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        noResultsText="Nothing here"
      />
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: FAIL — emptyState prop not used

**Step 3: Implement**

Add to `DataTableProps`:

```tsx
emptyState?: React.ReactNode
```

In the empty state rendering section (~line 497-509), replace:

```tsx
{table.getRowModel().rows.length === 0 && (
  <TableRow>
    <TableCell colSpan={allColumns.length} className="text-center py-ds-10 text-text-placeholder">
      {emptyState || noResultsText || 'No results.'}
    </TableCell>
  </TableRow>
)}
```

When `emptyState` is a ReactNode, render it directly inside the cell without the default text styling.

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/data-table.tsx packages/core/src/ui/__tests__/data-table-integration.test.tsx
git commit -m "feat(data-table): add emptyState ReactNode slot"
```

---

## Task 6: D1 — DataTable `loading` state

**Files:**
- Modify: `packages/core/src/ui/data-table.tsx`
- Test: `packages/core/src/ui/__tests__/data-table-integration.test.tsx`

**Step 1: Write the failing test**

```tsx
describe('DataTable loading', () => {
  it('renders skeleton rows when loading=true', () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} loading />
    )
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('does not render data rows when loading', () => {
    render(<DataTable columns={columns} data={data} loading />)
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('renders correct number of skeleton rows matching pageSize', () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} loading pageSize={3} />
    )
    const skeletonRows = container.querySelectorAll('tbody tr')
    expect(skeletonRows.length).toBe(3)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: FAIL — loading prop not recognized

**Step 3: Implement**

Add to `DataTableProps`:

```tsx
loading?: boolean
```

Import `Skeleton` from `./skeleton`. Before the table body render, add a loading branch:

```tsx
const renderLoadingBody = () => {
  const rowCount = pageSize || 5
  const colCount = allColumns.length
  return (
    <TableBody>
      {Array.from({ length: rowCount }, (_, i) => (
        <TableRow key={`skeleton-${i}`} className={densityPaddingMap[density]}>
          {Array.from({ length: colCount }, (_, j) => (
            <TableCell key={`skeleton-${i}-${j}`}>
              <Skeleton className="h-4 w-full" animation="pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
```

In the main render, switch between loading body and data body:

```tsx
{loading ? renderLoadingBody() : renderTableBody()}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/data-table.tsx packages/core/src/ui/__tests__/data-table-integration.test.tsx
git commit -m "feat(data-table): add loading prop with skeleton shimmer rows"
```

---

## Task 7: D1 — DataTable controlled selection + selectableFilter

**Files:**
- Modify: `packages/core/src/ui/data-table.tsx`
- Test: `packages/core/src/ui/__tests__/data-table-integration.test.tsx`

**Step 1: Write the failing test**

```tsx
describe('DataTable controlled selection', () => {
  it('reflects externally controlled selectedIds', () => {
    const selectedIds = new Set(['1'])
    render(
      <DataTable
        columns={columns}
        data={data.map((d, i) => ({ ...d, id: String(i) }))}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={vi.fn()}
        getRowId={(row) => row.id}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is header, second is row 0 (id='0'), third is row 1 (id='1')
    expect(checkboxes[2]).toBeChecked() // id='1'
    expect(checkboxes[1]).not.toBeChecked() // id='0'
  })
})

describe('DataTable selectableFilter', () => {
  it('disables checkbox for rows failing selectableFilter', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        selectableFilter={(row) => row.role === 'admin'}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    // Only admin rows should have enabled checkboxes
    const disabledCheckboxes = checkboxes.filter(
      (cb) => cb.hasAttribute('disabled') || cb.getAttribute('aria-disabled') === 'true'
    )
    expect(disabledCheckboxes.length).toBeGreaterThan(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: FAIL

**Step 3: Implement**

Add to `DataTableProps`:

```tsx
selectedIds?: Set<string>
selectableFilter?: (row: TData) => boolean
getRowId?: (row: TData) => string
```

In the useReactTable config:

```tsx
// Controlled selection: sync internal state from selectedIds prop
...(selectable && {
  enableRowSelection: selectableFilter
    ? (row) => selectableFilter(row.original)
    : true,
  onRowSelectionChange: (updater) => {
    const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
    setRowSelection(newSelection)
  },
  ...(getRowId && { getRowId: (row) => getRowId(row.original) }),
}),
```

Add a `useEffect` to sync `selectedIds` → internal `rowSelection`:

```tsx
React.useEffect(() => {
  if (selectedIds) {
    const newSelection: RowSelectionState = {}
    selectedIds.forEach((id) => { newSelection[id] = true })
    setRowSelection(newSelection)
  }
}, [selectedIds])
```

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/data-table.tsx packages/core/src/ui/__tests__/data-table-integration.test.tsx
git commit -m "feat(data-table): add controlled selectedIds + selectableFilter"
```

---

## Task 8: D1 — DataTable server-side pagination

**Files:**
- Modify: `packages/core/src/ui/data-table.tsx`
- Test: `packages/core/src/ui/__tests__/data-table-integration.test.tsx`

**Step 1: Write the failing test**

```tsx
describe('DataTable server-side pagination', () => {
  it('renders page info from server pagination prop', () => {
    render(
      <DataTable
        columns={columns}
        data={data.slice(0, 2)}
        pagination={{ page: 1, pageSize: 2, total: 10, onPageChange: vi.fn() }}
      />
    )
    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument()
  })

  it('calls onPageChange when next is clicked', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data.slice(0, 2)}
        pagination={{ page: 1, pageSize: 2, total: 10, onPageChange }}
      />
    )
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables previous on first page', () => {
    render(
      <DataTable
        columns={columns}
        data={data.slice(0, 2)}
        pagination={{ page: 1, pageSize: 2, total: 10, onPageChange: vi.fn() }}
      />
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: FAIL

**Step 3: Implement**

Add to `DataTableProps`:

```tsx
pagination?: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}
```

When `pagination` prop is provided, configure TanStack for manual pagination:

```tsx
...(pagination ? {
  manualPagination: true,
  pageCount: Math.ceil(pagination.total / pagination.pageSize),
  state: {
    ...state,
    pagination: { pageIndex: pagination.page - 1, pageSize: pagination.pageSize },
  },
  onPaginationChange: (updater) => {
    const next = typeof updater === 'function'
      ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.pageSize })
      : updater
    pagination.onPageChange(next.pageIndex + 1)
  },
} : paginated ? {
  getPaginationRowModel: getPaginationRowModel(),
  onPaginationChange: setPagination,
} : {}),
```

Update the pagination controls section to work with both modes. The existing prev/next UI should work since TanStack abstracts the page model.

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/data-table.tsx packages/core/src/ui/__tests__/data-table-integration.test.tsx
git commit -m "feat(data-table): add server-side pagination via pagination prop"
```

---

## Task 9: D1 — DataTable singleExpand, stickyHeader, onRowClick

**Files:**
- Modify: `packages/core/src/ui/data-table.tsx`
- Test: `packages/core/src/ui/__tests__/data-table-integration.test.tsx`

**Step 1: Write the failing tests**

```tsx
describe('DataTable singleExpand', () => {
  it('collapses previous row when new row expanded', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        expandable
        singleExpand
        renderExpanded={(row) => <div data-testid={`detail-${row.name}`}>Detail</div>}
      />
    )
    const expandButtons = screen.getAllByRole('button', { name: /expand/i })
    await user.click(expandButtons[0])
    expect(screen.getByTestId('detail-Alice')).toBeInTheDocument()
    await user.click(expandButtons[1])
    expect(screen.queryByTestId('detail-Alice')).not.toBeInTheDocument()
    expect(screen.getByTestId('detail-Bob')).toBeInTheDocument()
  })
})

describe('DataTable stickyHeader', () => {
  it('applies sticky class to table header', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} stickyHeader />
    )
    const thead = container.querySelector('thead')
    expect(thead?.className).toContain('sticky')
  })
})

describe('DataTable onRowClick', () => {
  it('calls onRowClick when row is clicked', async () => {
    const onRowClick = vi.fn()
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        onRowClick={onRowClick}
      />
    )
    const rows = screen.getAllByRole('row').slice(1)
    await user.click(rows[0])
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })
})
```

**Step 2: Run test to verify they fail**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: FAIL

**Step 3: Implement**

Add to `DataTableProps`:

```tsx
singleExpand?: boolean
stickyHeader?: boolean
onRowClick?: (row: TData) => void
```

**singleExpand**: In the `onExpandedChange` handler, when `singleExpand` is true:

```tsx
onExpandedChange: (updater) => {
  if (singleExpand) {
    setExpanded((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (typeof next === 'object') {
        // Keep only the most recently toggled row
        const keys = Object.keys(next).filter((k) => next[k])
        const prevKeys = typeof prev === 'object' ? Object.keys(prev).filter((k) => prev[k]) : []
        const newKey = keys.find((k) => !prevKeys.includes(k))
        return newKey ? { [newKey]: true } : {}
      }
      return next
    })
  } else {
    setExpanded(typeof updater === 'function' ? updater(expanded) : updater)
  }
},
```

**stickyHeader**: Add className to `<TableHeader>`:

```tsx
<TableHeader className={cn(stickyHeader && 'sticky top-0 z-10 bg-surface')}>
```

**onRowClick**: In `renderDataRow`, add to `<TableRow>`:

```tsx
<TableRow
  {...(onRowClick && {
    onClick: (e: React.MouseEvent) => {
      // Don't fire on interactive element clicks
      const target = e.target as HTMLElement
      if (target.closest('button, a, input, select, textarea, [role="checkbox"]')) return
      onRowClick(row.original)
    },
    className: cn(rowClassName, 'cursor-pointer'),
  })}
>
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/data-table.tsx packages/core/src/ui/__tests__/data-table-integration.test.tsx
git commit -m "feat(data-table): add singleExpand, stickyHeader, onRowClick"
```

---

## Task 10: D1 — DataTable bulk action bar

**Files:**
- Modify: `packages/core/src/ui/data-table.tsx`
- Test: `packages/core/src/ui/__tests__/data-table-integration.test.tsx`

**Step 1: Write the failing test**

```tsx
describe('DataTable bulkActions', () => {
  it('renders bulk action bar when rows are selected', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Delete', onClick: onDelete, color: 'error' },
        ]}
      />
    )
    // Select first row
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // first data row
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument()
  })

  it('hides bulk action bar when no rows selected', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Delete', onClick: vi.fn() },
        ]}
      />
    )
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('calls bulk action onClick with selected rows', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Delete', onClick: onDelete },
        ]}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])
    await user.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith([data[0]])
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: FAIL

**Step 3: Implement**

Add types and prop:

```tsx
export interface BulkAction<TData> {
  label: string
  onClick: (selectedRows: TData[]) => void
  color?: 'default' | 'error'
  disabled?: boolean
}

// In DataTableProps:
bulkActions?: BulkAction<TData>[]
```

Add bulk action bar render at the bottom of the component, after the table:

```tsx
{bulkActions && bulkActions.length > 0 && selectedRowCount > 0 && (
  <div className="fixed bottom-ds-06 left-1/2 z-50 flex -translate-x-1/2 items-center gap-ds-04 rounded-ds-xl border border-border bg-surface px-ds-05 py-ds-04 shadow-lg animate-in slide-in-from-bottom-2">
    <span className="text-ds-sm font-medium text-text-secondary">
      {selectedRowCount} selected
    </span>
    <div className="h-4 w-px bg-border" />
    {bulkActions.map((action) => (
      <Button
        key={action.label}
        size="sm"
        variant={action.color === 'error' ? 'destructive' : 'outline'}
        disabled={action.disabled}
        onClick={() => action.onClick(
          table.getFilteredSelectedRowModel().rows.map((r) => r.original)
        )}
      >
        {action.label}
      </Button>
    ))}
    <Button
      size="sm"
      variant="ghost"
      onClick={() => table.resetRowSelection()}
      aria-label="Clear selection"
    >
      <IconX className="h-ico-sm w-ico-sm" />
    </Button>
  </div>
)}
```

Compute `selectedRowCount`:

```tsx
const selectedRowCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length
```

**Step 4: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/data-table-integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/data-table.tsx packages/core/src/ui/__tests__/data-table-integration.test.tsx
git commit -m "feat(data-table): add bulkActions floating bar"
```

---

## Task 11: F3 — ActivityFeed composed component

**Files:**
- Create: `packages/core/src/composed/activity-feed.tsx`
- Create: `packages/core/src/composed/__tests__/activity-feed.test.tsx`
- Modify: `packages/core/src/composed/index.ts` (add export)

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ActivityFeed } from '../activity-feed'

const items = [
  { id: '1', actor: { name: 'Alice' }, action: 'completed task', timestamp: new Date('2026-03-12T10:00:00'), color: 'success' as const },
  { id: '2', actor: { name: 'Bob', image: '/bob.png' }, action: 'assigned task', timestamp: new Date('2026-03-12T09:00:00'), color: 'info' as const },
  { id: '3', action: 'System backup completed', timestamp: new Date('2026-03-12T08:00:00') },
]

describe('ActivityFeed', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<ActivityFeed items={items} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders all activity items', () => {
    render(<ActivityFeed items={items} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('completed task')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('System backup completed')).toBeInTheDocument()
  })

  it('renders actor avatar when image provided', () => {
    render(<ActivityFeed items={items} />)
    const img = screen.getByAltText('Bob')
    expect(img).toHaveAttribute('src', '/bob.png')
  })

  it('renders emptyState when no items', () => {
    render(<ActivityFeed items={[]} emptyState={<p>No activity</p>} />)
    expect(screen.getByText('No activity')).toBeInTheDocument()
  })

  it('shows Load more button when hasMore', async () => {
    const onLoadMore = vi.fn()
    const user = userEvent.setup()
    render(<ActivityFeed items={items} hasMore onLoadMore={onLoadMore} />)
    await user.click(screen.getByText(/load more/i))
    expect(onLoadMore).toHaveBeenCalled()
  })

  it('truncates to maxInitialItems with Show all toggle', async () => {
    const user = userEvent.setup()
    render(<ActivityFeed items={items} maxInitialItems={2} />)
    expect(screen.queryByText('System backup completed')).not.toBeInTheDocument()
    await user.click(screen.getByText(/show all/i))
    expect(screen.getByText('System backup completed')).toBeInTheDocument()
  })

  it('renders loading skeleton when loading', () => {
    const { container } = render(<ActivityFeed items={[]} loading />)
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThan(0)
  })

  it('renders compact mode with smaller gaps', () => {
    const { container } = render(<ActivityFeed items={items} compact />)
    // In compact mode, the feed container should use gap-1
    expect(container.firstChild).toHaveClass('gap-1')
  })

  it('renders expandable detail on click', async () => {
    const user = userEvent.setup()
    const itemsWithDetail = [
      { ...items[0], detail: <div data-testid="detail-1">Task details here</div> },
    ]
    render(<ActivityFeed items={itemsWithDetail} />)
    await user.click(screen.getByText('completed task'))
    expect(screen.getByTestId('detail-1')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/activity-feed.test.tsx`
Expected: FAIL — module not found

**Step 3: Implement**

Create `packages/core/src/composed/activity-feed.tsx`:

```tsx
'use client'

import * as React from 'react'
import { useState } from 'react'
import { cn } from '../ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'

// ============================================================
// Types
// ============================================================

export interface ActivityItem {
  id: string
  actor?: { name: string; image?: string }
  action: string | React.ReactNode
  timestamp: Date | string
  icon?: React.ReactNode
  color?: 'default' | 'success' | 'warning' | 'error' | 'info'
  detail?: React.ReactNode
}

export interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ActivityItem[]
  onLoadMore?: () => void
  loading?: boolean
  hasMore?: boolean
  emptyState?: React.ReactNode
  compact?: boolean
  maxInitialItems?: number
}

// ============================================================
// Helpers
// ============================================================

const DOT_COLOR_MAP: Record<string, string> = {
  default: 'bg-text-placeholder',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-interactive',
}

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString()
}

// ============================================================
// Component
// ============================================================

const ActivityFeed = React.forwardRef<HTMLDivElement, ActivityFeedProps>(
  function ActivityFeed(
    {
      items,
      onLoadMore,
      loading = false,
      hasMore = false,
      emptyState,
      compact = false,
      maxInitialItems,
      className,
      ...props
    },
    ref,
  ) {
    const [showAll, setShowAll] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    if (loading) {
      return (
        <div ref={ref} className={cn('flex flex-col', compact ? 'gap-1' : 'gap-3', className)} {...props}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-ds-04">
              <div className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-layer-02" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" animation="pulse" />
                <Skeleton className="h-3 w-16" animation="pulse" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (items.length === 0) {
      return emptyState ? <>{emptyState}</> : null
    }

    const truncated = maxInitialItems && !showAll
    const visibleItems = truncated ? items.slice(0, maxInitialItems) : items

    return (
      <div ref={ref} className={cn('relative flex flex-col', compact ? 'gap-1' : 'gap-3', className)} {...props}>
        {/* Timeline line */}
        <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

        {visibleItems.map((item) => (
          <div key={item.id} className="relative flex items-start gap-ds-04 pl-ds-05">
            {/* Dot */}
            <div
              className={cn(
                'absolute left-0 top-1.5 h-2 w-2 shrink-0 rounded-full ring-2 ring-surface',
                DOT_COLOR_MAP[item.color ?? 'default'],
              )}
              aria-hidden="true"
            />

            {/* Avatar (non-compact only) */}
            {!compact && item.actor?.image && (
              <Avatar className="h-4 w-4 shrink-0">
                <AvatarImage src={item.actor.image} alt={item.actor.name} />
                <AvatarFallback className="text-[8px]">
                  {item.actor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  'flex items-baseline justify-between gap-ds-03',
                  item.detail && 'cursor-pointer',
                )}
                onClick={item.detail ? () => setExpandedId(expandedId === item.id ? null : item.id) : undefined}
              >
                <p className={cn('text-text-secondary', compact ? 'text-ds-xs' : 'text-ds-sm')}>
                  {item.actor && (
                    <span className="font-medium text-text-primary">{item.actor.name} </span>
                  )}
                  {item.action}
                </p>
                <time className={cn('shrink-0 text-text-placeholder whitespace-nowrap', compact ? 'text-ds-xs' : 'text-ds-xs')}>
                  {formatRelativeTime(item.timestamp)}
                </time>
              </div>

              {/* Expandable detail */}
              {item.detail && expandedId === item.id && (
                <div className="mt-ds-02 animate-in fade-in slide-in-from-top-1">
                  {item.detail}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Show all toggle */}
        {truncated && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-ds-05 self-start"
            onClick={() => setShowAll(true)}
          >
            Show all ({items.length})
          </Button>
        )}

        {/* Load more */}
        {hasMore && onLoadMore && (
          <Button
            variant="ghost"
            size="sm"
            className="self-center"
            onClick={onLoadMore}
          >
            Load more
          </Button>
        )}
      </div>
    )
  },
)

ActivityFeed.displayName = 'ActivityFeed'

export { ActivityFeed }
```

**Step 4: Add export to barrel**

In `packages/core/src/composed/index.ts`, add:

```tsx
export { ActivityFeed, type ActivityItem, type ActivityFeedProps } from './activity-feed'
```

**Step 5: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/composed/__tests__/activity-feed.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/core/src/composed/activity-feed.tsx packages/core/src/composed/__tests__/activity-feed.test.tsx packages/core/src/composed/index.ts
git commit -m "feat(composed): add ActivityFeed timeline component"
```

---

## Task 12: K9 — ScratchpadWidget

**Files:**
- Create: `packages/karm/src/dashboard/scratchpad-widget.tsx`
- Create: `packages/karm/src/dashboard/__tests__/scratchpad-widget.test.tsx`
- Modify: `packages/karm/src/dashboard/index.ts` (add export)

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ScratchpadWidget } from '../scratchpad-widget'

const items = [
  { id: '1', text: 'Review PR', done: false },
  { id: '2', text: 'Update docs', done: true },
  { id: '3', text: 'Fix bug', done: false },
]

describe('ScratchpadWidget', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <ScratchpadWidget items={items} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders all items', () => {
    render(<ScratchpadWidget items={items} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Review PR')).toBeInTheDocument()
    expect(screen.getByText('Update docs')).toBeInTheDocument()
    expect(screen.getByText('Fix bug')).toBeInTheDocument()
  })

  it('shows progress badge with count', () => {
    render(
      <ScratchpadWidget items={items} maxItems={5} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} />
    )
    // 1 done out of 3, displayed as fraction of maxItems
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(
      <ScratchpadWidget items={items} onToggle={onToggle} onAdd={vi.fn()} onDelete={vi.fn()} />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    expect(onToggle).toHaveBeenCalledWith('1', true)
  })

  it('calls onAdd when text entered and submitted', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(
      <ScratchpadWidget items={items} onToggle={vi.fn()} onAdd={onAdd} onDelete={vi.fn()} />
    )
    await user.click(screen.getByText(/add a task/i))
    const input = screen.getByPlaceholderText(/what needs doing/i)
    await user.type(input, 'New task{Enter}')
    expect(onAdd).toHaveBeenCalledWith('New task')
  })

  it('cancels add on Escape', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(
      <ScratchpadWidget items={items} onToggle={vi.fn()} onAdd={onAdd} onDelete={vi.fn()} />
    )
    await user.click(screen.getByText(/add a task/i))
    const input = screen.getByPlaceholderText(/what needs doing/i)
    await user.type(input, 'Cancelled{Escape}')
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.queryByPlaceholderText(/what needs doing/i)).not.toBeInTheDocument()
  })

  it('hides add button when maxItems reached', () => {
    const fullItems = [
      { id: '1', text: 'A', done: false },
      { id: '2', text: 'B', done: false },
    ]
    render(
      <ScratchpadWidget items={fullItems} maxItems={2} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} />
    )
    expect(screen.queryByText(/add a task/i)).not.toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    render(
      <ScratchpadWidget items={[]} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} emptyText="Jot down reminders" />
    )
    expect(screen.getByText('Jot down reminders')).toBeInTheDocument()
  })

  it('renders loading skeleton', () => {
    const { container } = render(
      <ScratchpadWidget items={[]} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} loading />
    )
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThan(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-widget.test.tsx`
Expected: FAIL — module not found

**Step 3: Implement**

Create `packages/karm/src/dashboard/scratchpad-widget.tsx`. Key implementation details:

- `'use client'` directive
- Card with `variant="outline"` (import from `@/ui/card`)
- Header: title + SVG circular progress ring (arc length = items.length/maxItems * circumference)
- Items: `Checkbox` + `<span>` with conditional `line-through` class + animated strikethrough pseudo-element + delete `IconX` button (opacity-0 group-hover:opacity-100)
- Add row: ghost "+ Add a task..." button → toggles `isAdding` state → renders Input with autofocus, Enter to submit, Escape to cancel, blur to cancel
- Empty state: centered muted text with optional icon
- Loading: 3 skeleton rows with checkbox-sized circle + text skeleton
- `onReorder`: grip handle `IconGripVertical` on left, `onPointerDown` + `onPointerMove` + `onPointerUp` for drag reorder (swap items array)
- Completed items get `text-text-placeholder line-through` with a CSS transition on `text-decoration-line`
- All-done confetti: when all items are done and items.length > 0, show a brief CSS animation on the progress ring (scale pulse + color change)
- `resetLabel` rendered as muted footer text below items list

**Step 4: Add export to barrel**

In `packages/karm/src/dashboard/index.ts`, add:

```tsx
export { ScratchpadWidget, type ScratchpadItem, type ScratchpadWidgetProps } from './scratchpad-widget'
```

**Step 5: Run test to verify it passes**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/scratchpad-widget.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/karm/src/dashboard/scratchpad-widget.tsx packages/karm/src/dashboard/__tests__/scratchpad-widget.test.tsx packages/karm/src/dashboard/index.ts
git commit -m "feat(karm/dashboard): add ScratchpadWidget with progress ring and drag-to-reorder"
```

---

## Task 13: K9 — SidebarScratchpad

**Files:**
- Create: `packages/karm/src/dashboard/sidebar-scratchpad.tsx`
- Create: `packages/karm/src/dashboard/__tests__/sidebar-scratchpad.test.tsx`
- Modify: `packages/karm/src/dashboard/index.ts` (add export)

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { SidebarScratchpad } from '../sidebar-scratchpad'

const items = [
  { id: '1', text: 'Review PR', done: false },
  { id: '2', text: 'Update docs', done: true },
]

describe('SidebarScratchpad', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <SidebarScratchpad items={items} onToggle={vi.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders items in expanded state by default', () => {
    render(<SidebarScratchpad items={items} onToggle={vi.fn()} />)
    expect(screen.getByText('Review PR')).toBeInTheDocument()
  })

  it('collapses and hides items when header clicked', async () => {
    const user = userEvent.setup()
    render(<SidebarScratchpad items={items} onToggle={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /scratchpad/i }))
    expect(screen.queryByText('Review PR')).not.toBeInTheDocument()
  })

  it('shows badge count when provided', () => {
    render(<SidebarScratchpad items={items} onToggle={vi.fn()} badgeCount={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<SidebarScratchpad items={items} onToggle={onToggle} />)
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    expect(onToggle).toHaveBeenCalledWith('1', true)
  })

  it('starts collapsed when defaultOpen=false', () => {
    render(<SidebarScratchpad items={items} onToggle={vi.fn()} defaultOpen={false} />)
    expect(screen.queryByText('Review PR')).not.toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/sidebar-scratchpad.test.tsx`
Expected: FAIL

**Step 3: Implement**

Create `packages/karm/src/dashboard/sidebar-scratchpad.tsx`:

- `'use client'` directive
- Collapsible container: button header with "Scratchpad" label + chevron (rotates 180deg on open) + optional badge pill
- `useState(defaultOpen ?? true)` for collapse state
- Items: smaller checkboxes (`h-3.5 w-3.5`), `text-xs`, tighter gaps (`gap-0.5`)
- Smooth height animation via `grid-template-rows: 0fr/1fr` transition pattern
- Completed items: `text-text-placeholder line-through`
- Reuses `ScratchpadItem` type from `./scratchpad-widget`

**Step 4: Add export to barrel**

In `packages/karm/src/dashboard/index.ts`:

```tsx
export { SidebarScratchpad, type SidebarScratchpadProps } from './sidebar-scratchpad'
```

**Step 5: Run test to verify it passes**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/sidebar-scratchpad.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/karm/src/dashboard/sidebar-scratchpad.tsx packages/karm/src/dashboard/__tests__/sidebar-scratchpad.test.tsx packages/karm/src/dashboard/index.ts
git commit -m "feat(karm/dashboard): add SidebarScratchpad compact collapsible widget"
```

---

## Task 14: F2 — DailyBrief enhancements

**Files:**
- Modify: `packages/karm/src/dashboard/daily-brief.tsx`
- Modify: `packages/karm/src/dashboard/__tests__/daily-brief.test.tsx`

**Step 1: Write the failing tests**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { DailyBrief } from '../daily-brief'

const briefData = {
  brief: ['**Task A** is due today', 'Meeting with Bob at 2pm'],
  generatedAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(), // 23 min ago
}

describe('DailyBrief enhancements', () => {
  it('renders relative timestamp', () => {
    render(<DailyBrief data={briefData} />)
    expect(screen.getByText(/23m ago/)).toBeInTheDocument()
  })

  it('calls onRefresh when refresh button clicked', async () => {
    const onRefresh = vi.fn()
    const user = userEvent.setup()
    render(<DailyBrief data={briefData} onRefresh={onRefresh} />)
    await user.click(screen.getByRole('button', { name: /refresh/i }))
    expect(onRefresh).toHaveBeenCalled()
  })

  it('shows unavailable state', () => {
    render(<DailyBrief data={null} unavailable />)
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument()
  })

  it('supports defaultCollapsed', () => {
    render(<DailyBrief data={briefData} defaultCollapsed />)
    expect(screen.queryByText(/task a/i)).not.toBeInTheDocument()
  })

  it('supports custom title', () => {
    render(<DailyBrief data={briefData} title="Evening Summary" />)
    expect(screen.getByText('Evening Summary')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/daily-brief.test.tsx`
Expected: FAIL

**Step 3: Implement**

Update `DailyBriefProps`:

```tsx
export interface DailyBriefProps {
  data: BriefData | null
  loading?: boolean
  onRefresh?: () => void
  unavailable?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  title?: string
  className?: string
}
```

Add to the component:
- `useState(defaultCollapsed ?? false)` instead of `useState(false)` for collapsed state
- Use `title ?? 'Morning Brief'` for the header text
- Add refresh button next to the collapse chevron (only when `onRefresh` provided):
  ```tsx
  {onRefresh && (
    <button onClick={(e) => { e.stopPropagation(); onRefresh() }} aria-label="Refresh brief">
      <IconRefresh className={cn('h-ico-sm w-ico-sm text-text-placeholder', loading && 'animate-spin')} />
    </button>
  )}
  ```
- Add relative timestamp in footer: `formatRelativeTime(data.generatedAt)`
- Add unavailable state before the collapsed check:
  ```tsx
  if (unavailable) {
    return (
      <div className={cn('...card classes...', className)}>
        <div className="flex items-center gap-ds-03 px-ds-05b py-ds-05">
          <IconSparkles className="h-ico-sm w-ico-sm text-text-placeholder" />
          <span className="text-ds-sm text-text-placeholder">AI brief unavailable</span>
        </div>
      </div>
    )
  }
  ```

**Step 4: Update barrel export** (already exports DailyBrief — just ensure new types are re-exported)

**Step 5: Run test to verify it passes**

Run: `cd packages/karm && pnpm vitest run src/dashboard/__tests__/daily-brief.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/karm/src/dashboard/daily-brief.tsx packages/karm/src/dashboard/__tests__/daily-brief.test.tsx
git commit -m "feat(karm/daily-brief): add onRefresh, unavailable, defaultCollapsed, title, relative timestamp"
```

---

## Task 15: Run full test suite + typecheck

**Step 1: Run core tests**

```bash
cd packages/core && pnpm vitest run
```

Expected: All tests pass including new ones

**Step 2: Run karm tests**

```bash
cd packages/karm && pnpm vitest run
```

Expected: All tests pass

**Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: No type errors

**Step 4: Build**

```bash
pnpm build
```

Expected: All packages build successfully

**Step 5: Commit any fixes**

If any tests/types/build fail, fix and commit:

```bash
git commit -m "fix: resolve test/type/build issues from enhancement batch"
```

---

## Task 16: Add Storybook stories for new components

**Files:**
- Create: `packages/core/src/composed/activity-feed.stories.tsx`
- Create: `packages/karm/src/dashboard/scratchpad-widget.stories.tsx`
- Create: `packages/karm/src/dashboard/sidebar-scratchpad.stories.tsx`

Write stories for each new component with multiple variants (default, compact, loading, empty, etc.). Follow existing story patterns in the repo.

**Commit:**

```bash
git commit -m "docs: add Storybook stories for ActivityFeed, ScratchpadWidget, SidebarScratchpad"
```

---

## Task 17: Update package exports in package.json

**Files:**
- Modify: `packages/core/package.json` (add `./composed/activity-feed` export if not auto-collected)

Verify all new exports resolve correctly. The core `collectEntries()` in `vite.config.ts` should auto-pick up the new composed component. Verify karm's dashboard barrel already captures the new exports.

**Commit:**

```bash
git commit -m "chore: verify package exports for new components"
```
