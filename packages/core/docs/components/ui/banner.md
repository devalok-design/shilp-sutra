# Banner

- Import: @devalok/shilp-sutra/ui/banner
- Server-safe: No
- Category: ui

## Props
    color: "info" | "success" | "warning" | "error" | "neutral"
    action: ReactNode (optional action slot, typically a ghost Button)
    onDismiss: () => void (optional, shows X button)
    children: ReactNode (message text)

## Defaults
    color="info"

## Example
```jsx
<Banner color="warning" onDismiss={() => dismiss()}>
  Scheduled maintenance on Sunday.
</Banner>
```

## Gotchas
- Banner is full-width (spans container). Alert is inline.
- Renders role="alert" automatically

## Changes
### v0.3.1
- **Fixed** BannerProps uses `Omit<HTMLAttributes, 'color'>` to resolve TypeScript conflict with CVA `color` variant

### v0.3.0
- **Changed** (BREAKING) `variant` prop renamed to `color` for semantic intent

### v0.1.0
- **Added** Initial release
