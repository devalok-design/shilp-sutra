# StatusBadge

- Import: @devalok/shilp-sutra/composed/status-badge
- Server-safe: No
- Category: composed

Note: StatusBadge was server-safe prior to v0.18.0 but is NO LONGER server-safe due to Framer Motion dependency.

## Props
    status: "active" | "pending" | "approved" | "rejected" | "completed" | "blocked" | "in-progress" | "review" | "cancelled" | "draft"
    color: "success" | "warning" | "error" | "info" | "neutral" (overrides status styling when set)
    size: "sm" | "md"
    label: string (auto-derived from status/color if omitted)
    hideDot: boolean (default: false)
    onClick: () => void (makes badge clickable — renders as button with chevron)
    icon: ReactNode (custom trailing icon — replaces default chevron when clickable)

## Defaults
    size="md", hideDot=false
    When neither status nor color is passed, defaults to status='pending' styling

## Example
```jsx
<StatusBadge status="active" />
<StatusBadge status="in-progress" />
<StatusBadge status="review" label="Needs Review" />
<StatusBadge color="warning" label="In Review" size="sm" />
<StatusBadge status="active" onClick={() => openStatusPicker()} />
```

## Composability
- **Semantic pill for workflow status.** Built on ui/Badge but with opinionated status → color mapping (active=success, pending=warning, rejected=error, etc.).
- **status vs color discriminated union:** Pass either `status` (auto-mapped color) or `color` (explicit). Don't pass both — `color` wins if you do.
- **Interactive mode:** Passing `onClick` renders as a `<button>` with a trailing chevron — common pattern for opening a status picker dropdown. Pair with a Popover or DropdownMenu for the status selector.
- **Pairs with DataTable, Card headers, activity feeds** — anywhere an inline status pill fits. Use `size="sm"` for dense rows.
- **StatusBadge vs ui/Badge vs StatusDot:**
  - StatusBadge = workflow status pill with built-in status semantics
  - ui/Badge = generic badge with full color/variant/shape control
  - StatusDot = tiny presence indicator (no label pill)

## Gotchas
- When `color` is set, it takes priority over `status` for styling
- Props use a discriminated union — pass either `status` or `color`, not both
- As of v0.18.0, StatusBadge is NOT server-safe (Framer Motion dependency)
- When `onClick` is provided, badge renders as a `<button>` with a trailing chevron icon
- Pass `icon` to replace the default chevron with a custom trailing icon

## Changes
### v0.29.0
- **Added** `in-progress` status (accent/blue styling)
- **Added** `review` status (info styling)
- **Added** `onClick` prop — renders as a `<button>` with trailing chevron and hover opacity
- **Added** `icon` prop — custom trailing icon (replaces the default chevron when clickable)

### v0.18.0
- **Changed** No longer server-safe due to Framer Motion dependency

### v0.8.0
- **Changed** Props now use discriminated union — pass either `status` or `color`, not both

### v0.2.0
- **Added** Identified as server-safe component (later reverted in v0.18.0)

### v0.1.0
- **Added** Initial release
