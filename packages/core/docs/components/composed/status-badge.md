# StatusBadge

- Import: @devalok/shilp-sutra/composed/status-badge
- Server-safe: No
- Category: composed

Note: StatusBadge was server-safe prior to v0.18.0 but is NO LONGER server-safe due to Framer Motion dependency.

## Props
    status: "active" | "pending" | "approved" | "rejected" | "completed" | "blocked" | "cancelled" | "draft"
    color: "success" | "warning" | "error" | "info" | "neutral" (overrides status styling when set)
    size: "sm" | "md"
    label: string (auto-derived from status/color if omitted)
    hideDot: boolean (default: false)

## Defaults
    size="md", hideDot=false
    When neither status nor color is passed, defaults to status='pending' styling

## Example
```jsx
<StatusBadge status="active" />
<StatusBadge color="warning" label="In Review" size="sm" />
```

## Gotchas
- When `color` is set, it takes priority over `status` for styling
- Props use a discriminated union — pass either `status` or `color`, not both
- As of v0.18.0, StatusBadge is NOT server-safe (Framer Motion dependency)

## Changes
### v0.18.0
- **Changed** No longer server-safe due to Framer Motion dependency

### v0.8.0
- **Changed** Props now use discriminated union — pass either `status` or `color`, not both

### v0.2.0
- **Added** Identified as server-safe component (later reverted in v0.18.0)

### v0.1.0
- **Added** Initial release
