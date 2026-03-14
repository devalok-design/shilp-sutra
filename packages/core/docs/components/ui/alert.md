# Alert

- Import: @devalok/shilp-sutra/ui/alert
- Server-safe: No
- Category: ui

## Props
    variant: "subtle" | "filled" | "outline"
    color: "info" | "success" | "warning" | "error" | "neutral"
    title: string (optional)
    onDismiss: () => void (optional, shows X button when provided)
    children: ReactNode (body text)

## Defaults
    variant="subtle", color="info"

## Example
```jsx
<Alert color="error" title="Save failed" onDismiss={() => setError(null)}>
  Your changes could not be saved.
</Alert>
```

## Gotchas
- NOT a compound component — use title prop, NOT <AlertTitle>
- DO NOT use variant="destructive" — use color="error"
- Renders role="alert" automatically
- Icon is auto-selected by color (info=circle, success=check, warning=triangle, error=alert)

## Changes
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
