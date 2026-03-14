# NotificationCenter

- Import: @devalok/shilp-sutra/shell/notification-center
- Server-safe: No
- Category: shell

## Props
    notifications: Notification[]
    unreadCount: number (derived from notifications if not provided)
    open: boolean (controlled mode)
    onOpenChange: (open: boolean) => void
    isLoading: boolean
    hasMore: boolean
    onFetchMore: () => void
    onMarkRead: (id: string) => void
    onMarkAllRead: () => void
    onNavigate: (path: string) => void — called when a notification with a route is clicked
    getNotificationRoute: (notification: Notification) => string | null — returns route for a notification; defaults to () => null
    footerSlot: ReactNode — content rendered in a sticky footer below the scroll area
    emptyState: ReactNode — replaces default empty state UI
    headerActions: ReactNode — extra action buttons after "Mark all read"
    popoverClassName: string — override default popover dimensions
    onDismiss: (id: string) => void — when provided, each notification shows a dismiss button

Notification: { id: string, title: string, body?: string | null, tier: 'INFO' | 'IMPORTANT' | 'CRITICAL', isRead: boolean, createdAt: string, entityType?: string | null, entityId?: string | null, projectId?: string | null, project?: { title: string } | null, actions?: NotificationAction[] }
NotificationAction: { label: string, variant?: 'primary' | 'default' | 'danger', onClick: (id: string) => void }

## Defaults
    getNotificationRoute defaults to () => null (no hardcoded routes)

## Example
```jsx
<NotificationCenter
  notifications={notifications}
  onMarkRead={markAsRead}
  onMarkAllRead={markAllAsRead}
  onNavigate={(path) => router.push(path)}
  getNotificationRoute={(n) => n.entityType === 'task' ? `/tasks/${n.entityId}` : null}
  onDismiss={(id) => dismissNotification(id)}
  footerSlot={<Link href="/notifications">View all notifications</Link>}
  emptyState={<p>You're all caught up!</p>}
  headerActions={<Button variant="ghost" size="sm">Settings</Button>}
  popoverClassName="w-[480px]"
/>
```

## Gotchas
- Typically rendered inside TopBar's `notificationSlot` prop
- `getNotificationRoute` must be provided for clickable notifications — no hardcoded routes
- Tier dot doubles as read/unread marker (opacity-based)
- `onDismiss` enables per-notification dismiss buttons when provided

## Changes
### v0.13.0
- **Added** `NotificationAction` type and `actions` prop on `Notification` — inline action buttons per notification row
- **Fixed** Tier dot now doubles as read/unread marker (opacity-based) — removed separate unread indicator dot

### v0.1.1
- **Changed** Decoupled from Next.js via LinkProvider
- **Fixed** Added `aria-label` to bell button

### v0.1.0
- **Added** Initial release
