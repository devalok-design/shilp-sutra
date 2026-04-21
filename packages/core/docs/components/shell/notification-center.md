# NotificationCenter

- Import: @devalok/shilp-sutra/shell/notification-center
- Server-safe: No
- Category: shell

## Props
    notifications?: Notification[]
    unreadCount?: number (derived from notifications if not provided)
    open?: boolean (controlled mode)
    onOpenChange?: (open: boolean) => void
    isLoading?: boolean
    hasMore?: boolean
    onFetchMore?: () => void
    onMarkRead?: (id: string) => void
    onMarkAllRead?: () => void
    onNavigate?: (path: string) => void — called when a notification with a route is clicked
    getNotificationRoute?: (notification: Notification) => string | null — returns route for a notification; defaults to () => null
    footerSlot?: ReactNode — content rendered in a sticky footer below the scroll area
    emptyState?: ReactNode — replaces default empty state UI
    headerActions?: ReactNode — extra action buttons after "Mark all read"
    popoverClassName?: string — override default popover dimensions
    onDismiss?: (id: string) => void — when provided, each notification shows a dismiss button

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

## Composability
- **Bell + Popover + notification list** — renders the bell button with unread count badge and a popover list on click.
- **Typical placement:** Inside `<TopBar.Right>` — common pattern is `<TopBar.IconButton>` for utility actions PLUS `<NotificationCenter>` for the bell.
- **No hardcoded routes** — `getNotificationRoute` is the consumer's routing decision. Return the correct path per notification type (task → `/tasks/:id`, comment → `/threads/:id`, etc.) or null for non-routable notifications.
- **onNavigate** fires when a notification with a route is clicked — wire to your router's push/navigate call.
- **Pagination:** Pass `hasMore` + `onFetchMore` for infinite-scroll of older notifications.
- **emptySlot + footerSlot + headerActions** are content slots for customization — keep the bell+popover shell, swap the inside.
- **Pairs with NotificationPreferences** (separate page component) for letting users configure which notification tiers/channels they want to receive.
- **onDismiss** is optional — when provided, per-notification X buttons appear. Otherwise mark-as-read is the only dismissal mechanism.

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
