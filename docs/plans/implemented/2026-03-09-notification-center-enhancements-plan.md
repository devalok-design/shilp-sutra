# NotificationCenter Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 5 new props (footerSlot, emptyState, headerActions, popoverClassName, onDismiss) and remove hardcoded Karm routes from NotificationCenter.

**Architecture:** Flat optional props on existing NotificationCenterProps. NotificationItem row changes from `<button>` to `<div role="button">` to support nested dismiss button. All changes backwards compatible except route fallback (intentional correctness fix).

**Tech Stack:** React 18, TypeScript, Tailwind, Vitest + RTL, @tabler/icons-react

**Design doc:** `docs/plans/2026-03-09-notification-center-enhancements-design.md`

---

### Task 1: Remove hardcoded route fallback + add test

**Files:**
- Modify: `packages/core/src/shell/notification-center.tsx:117-148`
- Create: `packages/core/src/shell/notification-center.test.tsx`

**Step 1: Create test file with mocks and first test**

The test file needs the same Popover/Tooltip mocks as `top-bar.test.tsx`. Create `notification-center.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

// Mock popover to render inline (avoid Radix portal issues)
vi.mock('../ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <span>{children}</span>,
  PopoverContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="popover-content" className={className}>{children}</div>
  ),
}))

vi.mock('../ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <span>{children}</span>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span role="tooltip">{children}</span>
  ),
}))

import { NotificationCenter } from './notification-center'
import type { Notification } from './notification-center'

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'n1',
  title: 'Test notification',
  body: 'Test body',
  tier: 'INFO',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
})

describe('NotificationCenter', () => {
  describe('route fallback', () => {
    it('does not navigate when getNotificationRoute is not provided', async () => {
      const user = userEvent.setup()
      const onNavigate = vi.fn()
      render(
        <NotificationCenter
          notifications={[makeNotification({ entityType: 'TASK', projectId: 'p1' })]}
          onNavigate={onNavigate}
        />,
      )
      await user.click(screen.getByText('Test notification'))
      expect(onNavigate).not.toHaveBeenCalled()
    })

    it('navigates when getNotificationRoute returns a path', async () => {
      const user = userEvent.setup()
      const onNavigate = vi.fn()
      render(
        <NotificationCenter
          notifications={[makeNotification()]}
          onNavigate={onNavigate}
          getNotificationRoute={() => '/custom-route'}
        />,
      )
      await user.click(screen.getByText('Test notification'))
      expect(onNavigate).toHaveBeenCalledWith('/custom-route')
    })
  })
})
```

**Step 2: Run test — expect FAIL**

Run: `cd packages/core && pnpm vitest run src/shell/notification-center.test.tsx`
Expected: FAIL — the first test fails because the current fallback returns `/projects/p1/board` for TASK entities.

**Step 3: Remove `defaultGetEntityRoute` and fix fallback**

In `notification-center.tsx`:
- Delete `defaultGetEntityRoute` function (lines 121-148)
- Delete the comment block above it (lines 117-119)
- Change line 267 from:
  ```ts
  const getRoute = getNotificationRoute ?? defaultGetEntityRoute
  ```
  to:
  ```ts
  const getRoute = getNotificationRoute ?? (() => null)
  ```

**Step 4: Run test — expect PASS**

Run: `cd packages/core && pnpm vitest run src/shell/notification-center.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/notification-center.tsx packages/core/src/shell/notification-center.test.tsx
git commit -m "fix(shell): remove hardcoded Karm routes from NotificationCenter fallback"
```

---

### Task 2: Add `footerSlot` prop

**Files:**
- Modify: `packages/core/src/shell/notification-center.tsx`
- Modify: `packages/core/src/shell/notification-center.test.tsx`

**Step 1: Write failing test**

Add to `notification-center.test.tsx`:

```tsx
describe('footerSlot', () => {
  it('renders footer content when footerSlot is provided', () => {
    render(
      <NotificationCenter
        notifications={[]}
        footerSlot={<a href="/notifications">View all</a>}
      />,
    )
    expect(screen.getByText('View all')).toBeInTheDocument()
  })

  it('does not render footer when footerSlot is not provided', () => {
    render(<NotificationCenter notifications={[]} />)
    expect(screen.queryByText('View all')).not.toBeInTheDocument()
  })
})
```

**Step 2: Run test — expect FAIL**

Run: `cd packages/core && pnpm vitest run src/shell/notification-center.test.tsx`
Expected: FAIL — `footerSlot` prop doesn't exist yet.

**Step 3: Implement footerSlot**

In `NotificationCenterProps`, add:
```ts
/** Content rendered in a sticky footer below the scroll area. */
footerSlot?: React.ReactNode
```

Destructure `footerSlot` in the component.

After the closing `</div>` of the scroll area (after the `{isLoading && ...}` block), before `</PopoverContent>`, add:

```tsx
{footerSlot && (
  <div className="border-t border-border px-ds-05 py-ds-03">
    {footerSlot}
  </div>
)}
```

**Step 4: Run test — expect PASS**

Run: `cd packages/core && pnpm vitest run src/shell/notification-center.test.tsx`

**Step 5: Commit**

```bash
git add packages/core/src/shell/notification-center.tsx packages/core/src/shell/notification-center.test.tsx
git commit -m "feat(shell): add footerSlot prop to NotificationCenter"
```

---

### Task 3: Add `emptyState` prop

**Files:**
- Modify: `packages/core/src/shell/notification-center.tsx`
- Modify: `packages/core/src/shell/notification-center.test.tsx`

**Step 1: Write failing test**

```tsx
describe('emptyState', () => {
  it('renders custom empty state when provided and notifications are empty', () => {
    render(
      <NotificationCenter
        notifications={[]}
        emptyState={<p>No unread notifications</p>}
      />,
    )
    expect(screen.getByText('No unread notifications')).toBeInTheDocument()
    expect(screen.queryByText('No notifications yet')).not.toBeInTheDocument()
  })

  it('renders default empty state when emptyState is not provided', () => {
    render(<NotificationCenter notifications={[]} />)
    expect(screen.getByText('No notifications yet')).toBeInTheDocument()
  })
})
```

**Step 2: Run test — expect FAIL**

**Step 3: Implement emptyState**

Add to `NotificationCenterProps`:
```ts
/** Replaces the default empty state when no notifications exist. */
emptyState?: React.ReactNode
```

Destructure `emptyState`. In the `notifications.length === 0` branch, change:

```tsx
{notifications.length === 0 ? (
  emptyState || (
    <div className="flex flex-col items-center justify-center px-ds-05 py-ds-09">
      {/* ...existing default markup unchanged... */}
    </div>
  )
) : (
```

**Step 4: Run test — expect PASS**

**Step 5: Commit**

```bash
git add packages/core/src/shell/notification-center.tsx packages/core/src/shell/notification-center.test.tsx
git commit -m "feat(shell): add emptyState prop to NotificationCenter"
```

---

### Task 4: Add `headerActions` prop

**Files:**
- Modify: `packages/core/src/shell/notification-center.tsx`
- Modify: `packages/core/src/shell/notification-center.test.tsx`

**Step 1: Write failing test**

```tsx
describe('headerActions', () => {
  it('renders header actions alongside mark-all-read', () => {
    render(
      <NotificationCenter
        notifications={[makeNotification()]}
        onMarkAllRead={vi.fn()}
        headerActions={<button>Settings</button>}
      />,
    )
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Mark all read')).toBeInTheDocument()
  })

  it('renders header actions even when no unread notifications', () => {
    render(
      <NotificationCenter
        notifications={[makeNotification({ isRead: true })]}
        headerActions={<button>Settings</button>}
      />,
    )
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
```

**Step 2: Run test — expect FAIL**

**Step 3: Implement headerActions**

Add to `NotificationCenterProps`:
```ts
/** Extra actions rendered after the "Mark all read" button in the header. */
headerActions?: React.ReactNode
```

Destructure `headerActions`. Wrap the right side of the header — replace the current `{unreadCount > 0 && onMarkAllRead && (...)}` with:

```tsx
<div className="flex items-center gap-ds-03">
  {unreadCount > 0 && onMarkAllRead && (
    <button
      type="button"
      onClick={onMarkAllRead}
      className="flex items-center gap-ds-02 text-ds-sm text-text-placeholder transition-colors hover:text-interactive"
    >
      <IconChecks className="h-ico-sm w-ico-sm" />
      Mark all read
    </button>
  )}
  {headerActions}
</div>
```

**Step 4: Run test — expect PASS**

**Step 5: Commit**

```bash
git add packages/core/src/shell/notification-center.tsx packages/core/src/shell/notification-center.test.tsx
git commit -m "feat(shell): add headerActions prop to NotificationCenter"
```

---

### Task 5: Add `popoverClassName` prop

**Files:**
- Modify: `packages/core/src/shell/notification-center.tsx`
- Modify: `packages/core/src/shell/notification-center.test.tsx`

**Step 1: Write failing test**

```tsx
describe('popoverClassName', () => {
  it('merges custom className into popover content', () => {
    render(
      <NotificationCenter
        notifications={[]}
        popoverClassName="w-[500px] max-h-[600px]"
      />,
    )
    const popover = screen.getByTestId('popover-content')
    expect(popover).toHaveClass('w-[500px]')
    expect(popover).toHaveClass('max-h-[600px]')
  })
})
```

Note: This works because the mock renders `className` on the div with `data-testid="popover-content"`.

**Step 2: Run test — expect FAIL**

**Step 3: Implement popoverClassName**

Add to `NotificationCenterProps`:
```ts
/** Additional className applied to the PopoverContent for dimension overrides. */
popoverClassName?: string
```

Destructure `popoverClassName`. Change PopoverContent:

```tsx
<PopoverContent
  className={cn(
    'w-[380px] rounded-ds-xl border border-border bg-layer-01 p-0 shadow-03',
    popoverClassName,
  )}
  sideOffset={8}
  align="end"
>
```

**Step 4: Run test — expect PASS**

**Step 5: Commit**

```bash
git add packages/core/src/shell/notification-center.tsx packages/core/src/shell/notification-center.test.tsx
git commit -m "feat(shell): add popoverClassName prop to NotificationCenter"
```

---

### Task 6: Add `onDismiss` prop (row refactor)

**Files:**
- Modify: `packages/core/src/shell/notification-center.tsx`
- Modify: `packages/core/src/shell/notification-center.test.tsx`

This is the largest task — it changes `NotificationItem` from `<button>` to `<div role="button">` and adds the dismiss X.

**Step 1: Write failing tests**

```tsx
describe('onDismiss', () => {
  it('renders dismiss button when onDismiss is provided', () => {
    render(
      <NotificationCenter
        notifications={[makeNotification()]}
        onDismiss={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/dismiss notification/i)).toBeInTheDocument()
  })

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(
      <NotificationCenter
        notifications={[makeNotification()]}
      />,
    )
    expect(screen.queryByLabelText(/dismiss notification/i)).not.toBeInTheDocument()
  })

  it('calls onDismiss with notification id when dismiss is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(
      <NotificationCenter
        notifications={[makeNotification({ id: 'n42' })]}
        onDismiss={onDismiss}
      />,
    )
    await user.click(screen.getByLabelText(/dismiss notification/i))
    expect(onDismiss).toHaveBeenCalledWith('n42')
  })

  it('does not trigger navigation when dismiss is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onDismiss = vi.fn()
    render(
      <NotificationCenter
        notifications={[makeNotification()]}
        onNavigate={onNavigate}
        onDismiss={onDismiss}
        getNotificationRoute={() => '/some-route'}
      />,
    )
    await user.click(screen.getByLabelText(/dismiss notification/i))
    expect(onDismiss).toHaveBeenCalled()
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('notification row still navigates when clicked (not on dismiss)', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <NotificationCenter
        notifications={[makeNotification()]}
        onNavigate={onNavigate}
        onDismiss={vi.fn()}
        getNotificationRoute={() => '/route'}
      />,
    )
    await user.click(screen.getByText('Test notification'))
    expect(onNavigate).toHaveBeenCalledWith('/route')
  })
})
```

**Step 2: Run test — expect FAIL**

**Step 3: Implement onDismiss + row refactor**

Add to `NotificationCenterProps`:
```ts
/** Called when the user dismisses a notification. Renders an X button per row when provided. */
onDismiss?: (id: string) => void
```

Add `IconX` to the imports from `@tabler/icons-react`.

Destructure `onDismiss` in component. Pass it to `NotificationItem`:
```tsx
<NotificationItem
  key={notification.id}
  notification={notification}
  onRead={handleMarkRead}
  onNavigate={handleNavigate}
  getRoute={getRoute}
  onDismiss={onDismiss}
/>
```

Refactor `NotificationItem`:

```tsx
function NotificationItem({
  notification,
  onRead,
  onNavigate,
  getRoute,
  onDismiss,
}: {
  notification: Notification
  onRead: (id: string) => void
  onNavigate: (path: string) => void
  getRoute: (notification: Notification) => string | null
  onDismiss?: (id: string) => void
}) {
  const route = getRoute(notification)

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id)
    }
    if (route) {
      onNavigate(route)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative flex w-full items-start gap-ds-04 px-ds-05 py-ds-04 text-left transition-colors',
        'hover:bg-layer-02',
        !notification.isRead && 'bg-interactive/[0.03]',
      )}
    >
      {/* Tier indicator dot */}
      <div className="mt-ds-02b flex shrink-0">
        <span
          className={cn(
            'h-[8px] w-[8px] rounded-ds-full',
            TIER_COLORS[notification.tier] || TIER_COLORS.INFO,
            notification.isRead && 'opacity-[0.38]',
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-ds-md text-text-primary',
            !notification.isRead && 'font-semibold',
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-ds-01 line-clamp-2 text-ds-sm text-text-placeholder">
            {notification.body}
          </p>
        )}
        <div className="mt-ds-02 flex items-center gap-ds-03">
          <span className="text-ds-sm text-text-placeholder">
            {timeAgo(notification.createdAt)}
          </span>
          {notification.project && (
            <>
              <span className="text-text-placeholder">&middot;</span>
              <span className="truncate text-ds-sm text-text-placeholder">
                {notification.project.title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="mt-ds-02b shrink-0">
          <span className="block h-[8px] w-[8px] rounded-ds-full bg-interactive" />
        </div>
      )}

      {/* Dismiss button (hover only) */}
      {onDismiss && (
        <button
          type="button"
          aria-label={`Dismiss notification: ${notification.title}`}
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(notification.id)
          }}
          className="absolute right-ds-03 top-ds-03 hidden rounded-ds-sm p-ds-01 text-text-placeholder hover:bg-layer-03 hover:text-text-secondary group-hover:flex"
        >
          <IconX className="h-ico-xs w-ico-xs" />
        </button>
      )}
    </div>
  )
}
```

**Step 4: Run test — expect PASS**

Run: `cd packages/core && pnpm vitest run src/shell/notification-center.test.tsx`

**Step 5: Commit**

```bash
git add packages/core/src/shell/notification-center.tsx packages/core/src/shell/notification-center.test.tsx
git commit -m "feat(shell): add onDismiss prop with per-notification dismiss button"
```

---

### Task 7: Update stories

**Files:**
- Modify: `packages/core/src/shell/notification-center.stories.tsx`

**Step 1: Add new stories**

Add to the stories file after the existing stories:

```tsx
export const WithFooter: Story = {
  args: {
    notifications: mockNotifications,
    footerSlot: (
      <a href="/notifications" className="flex items-center justify-center text-ds-sm text-interactive hover:underline">
        View all notifications
      </a>
    ),
  },
}

export const CustomEmptyState: Story = {
  args: {
    notifications: [],
    emptyState: (
      <div className="flex flex-col items-center justify-center px-ds-05 py-ds-09">
        <p className="text-ds-md text-text-placeholder">No unread notifications</p>
        <a href="/notifications" className="mt-ds-02 text-ds-sm text-interactive hover:underline">
          View history
        </a>
      </div>
    ),
  },
}

export const WithHeaderActions: Story = {
  args: {
    notifications: mockNotifications,
    headerActions: (
      <button
        type="button"
        className="flex items-center justify-center rounded-ds-sm p-ds-01 text-text-placeholder hover:bg-layer-02 hover:text-text-secondary"
        aria-label="Notification settings"
      >
        ⚙
      </button>
    ),
  },
}

export const WithDismiss: Story = {
  name: 'Per-Notification Dismiss',
  args: {
    notifications: mockNotifications.map((n) => ({ ...n, isRead: false })),
  },
  argTypes: {
    onDismiss: { action: 'dismiss' },
  },
}

export const CustomWidth: Story = {
  name: 'Custom Popover Width',
  args: {
    notifications: mockNotifications,
    popoverClassName: 'w-[500px]',
  },
}
```

Also add `onDismiss` to the top-level `argTypes` in meta:
```ts
onDismiss: { action: 'dismiss' },
```

**Step 2: Run Storybook build to verify no errors**

Run: `cd packages/core && pnpm build`

**Step 3: Commit**

```bash
git add packages/core/src/shell/notification-center.stories.tsx
git commit -m "docs(shell): add stories for new NotificationCenter props"
```

---

### Task 8: Update llms.txt files

**Files:**
- Modify: `packages/core/llms.txt`
- Modify: `packages/core/llms-full.txt`

**Step 1: Update llms.txt**

Find the NotificationCenter section and add the new props to the prop summary.

**Step 2: Update llms-full.txt**

Find the NotificationCenter section and add detailed prop documentation for all 5 new props with usage examples.

**Step 3: Commit**

```bash
git add packages/core/llms.txt packages/core/llms-full.txt
git commit -m "docs: update llms.txt with new NotificationCenter props"
```

---

### Task 9: Run full test suite + typecheck + lint

**Step 1: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 2: Lint**

Run: `pnpm lint`
Expected: PASS

**Step 3: Full test suite**

Run: `pnpm test`
Expected: All existing tests pass + new notification-center tests pass

**Step 4: Build all packages**

Run: `pnpm build`
Expected: PASS — all three packages build cleanly

**Step 5: Final commit if any fixes needed**

Only if typecheck/lint/test surfaced issues.
