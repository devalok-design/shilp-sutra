# Alert

- Import: @devalok/shilp-sutra/ui/alert
- Server-safe: No
- Category: ui

## Props
    variant: "subtle" | "solid" | "outline" | "filled" (deprecated alias for "solid")
    color: "info" | "success" | "warning" | "error" | "neutral"
    size: "sm" | "md" | "lg"
    title: string (optional)
    onDismiss: () => void (optional, shows X button when provided)
    children: ReactNode (body text)

## Defaults
    variant="subtle", color="info", size="md"

## Example
```jsx
<Alert color="error" title="Save failed" onDismiss={() => setError(null)}>
  Your changes could not be saved.
</Alert>
```

## Composability
- **Flat, not compound** — unlike Dialog/Card, there's no `<AlertTitle>` / `<AlertDescription>`. Use the `title` prop for the heading and `children` for the body text. This simplifies the API and prevents composition traps (missing title, out-of-order header parts).
- **Auto-icon by color:** Icon is selected automatically from color (info→circle, success→check, warning→triangle, error→alert). Pass a custom `icon` prop to override.
- **Role=alert:** Announces assertively to screen readers. Don't stack multiple Alerts in a row — the last one wins.
- **Dismissal pattern:** Pass `onDismiss` for user-dismissable alerts; the library tracks the exit animation before calling back. For persistent alerts (system state), omit `onDismiss`.
- **Not for transient messages** — use Toast for transient/time-limited notifications and Banner for page-level announcements. Alert is inline, in-flow, block-level.

## Gotchas
- NOT a compound component — use title prop, NOT <AlertTitle>
- DO NOT use variant="destructive" — use color="error"
- Renders role="alert" automatically
- Icon is auto-selected by color (info=circle, success=check, warning=triangle, error=alert)

## Changes
### v0.31.0
- **Added** `size` prop: `sm | md | lg`. Default `md` (non-breaking).

### v0.18.0
- **Changed** Exit animation migrated to Framer Motion
- **Fixed** `onDismiss` JSDoc documenting it fires after exit animation completes
- **Changed** OKLCH color token migration

### v0.3.1
- **Fixed** AlertProps uses `Omit<HTMLAttributes, 'color'>` to resolve TypeScript conflict with CVA `color` variant

### v0.3.0
- **Changed** (BREAKING) `variant` prop renamed to `color` for semantic intent

### v0.1.0
- **Added** Initial release
