# NotificationCenter Enhancements — Design

**Date:** 2026-03-09
**Origin:** Karm team enhancement request
**Approach:** Flat props on NotificationCenterProps (Approach A)

## Summary

Six enhancements to make NotificationCenter fully generic and reusable across projects. All new props are optional — zero breaking changes except removing the hardcoded Karm route fallback (correctness fix).

## New Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `footerSlot` | `ReactNode` | — | Content in sticky footer below scroll area |
| `emptyState` | `ReactNode` | — | Replaces default empty state |
| `headerActions` | `ReactNode` | — | Extra actions after "Mark all read" button |
| `popoverClassName` | `string` | — | Override PopoverContent dimensions |
| `onDismiss` | `(id: string) => void` | — | Per-notification dismiss; renders X button when provided |

## Changes

### 1. Footer slot

Renders after the scrollable area, before `</PopoverContent>`:

```tsx
{footerSlot && (
  <div className="border-t border-border px-ds-05 py-ds-03">
    {footerSlot}
  </div>
)}
```

Outside the scroll container — always visible. Consumer provides content, component provides padding and top border (mirrors header's bottom border).

### 2. Remove hardcoded route resolver

Delete `defaultGetEntityRoute`. Fallback becomes `() => null`:

```ts
const getRoute = getNotificationRoute ?? (() => null)
```

Karm already passes `getNotificationRoute` explicitly, so this is a no-op for them. Any consumer not providing the prop gets no-navigation behavior instead of broken Karm-specific links.

### 3. Empty state customization

When `notifications.length === 0`:
- If `emptyState` prop provided → render it directly (consumer controls styling)
- If not provided → render current default (IconInbox + "No notifications yet" + "You're all caught up!")

### 4. Header actions slot

Wrap the right side of the header in a flex container:

```tsx
<div className="flex items-center gap-ds-03">
  {unreadCount > 0 && onMarkAllRead && (
    <button ...>Mark all read</button>
  )}
  {headerActions}
</div>
```

`headerActions` renders regardless of unread count (e.g., a settings gear should always be visible).

### 5. Per-notification dismiss (onDismiss)

**Row element change:** `<button>` → `<div role="button" tabIndex={0}>` with Enter/Space keyboard handling. This avoids nested interactive element a11y violations.

When `onDismiss` is provided, render an X button on hover (absolute positioned):

```tsx
<div className="group relative" role="button" tabIndex={0} ...>
  {/* existing content */}
  {onDismiss && (
    <button
      type="button"
      aria-label={`Dismiss notification: ${notification.title}`}
      onClick={(e) => { e.stopPropagation(); onDismiss(notification.id) }}
      className="absolute right-ds-03 top-ds-03 hidden rounded-ds-sm p-ds-01
        text-text-placeholder hover:bg-layer-03 hover:text-text-secondary
        group-hover:flex"
    >
      <IconX className="h-ico-xs w-ico-xs" />
    </button>
  )}
</div>
```

When not provided, no X renders — identical to current behavior. Whole row remains clickable for navigation (X uses `stopPropagation`).

### 6. Popover className

Merge consumer className into PopoverContent:

```tsx
<PopoverContent
  className={cn(
    "w-[380px] rounded-ds-xl border border-border bg-layer-01 p-0 shadow-03",
    popoverClassName,
  )}
```

## Testing Plan

- Existing tests pass unchanged (backwards compat)
- New tests for each prop:
  - `footerSlot` renders when provided, absent when not
  - `emptyState` replaces default when provided
  - `headerActions` renders in header
  - `popoverClassName` merges into popover
  - `onDismiss` renders X button, click calls handler with id, does not trigger navigation
  - No `getNotificationRoute` → no navigation (route fallback returns null)
- A11y: row keyboard navigation (Enter/Space), dismiss button label, no nested interactive violations

## Stories

- `WithFooter` — footer slot with "View all notifications" link
- `CustomEmptyState` — unread-only empty state
- `WithHeaderActions` — settings gear icon in header
- `WithDismiss` — dismiss X on hover
- `CustomWidth` — popoverClassName overriding width
