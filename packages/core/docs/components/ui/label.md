# Label

- Import: @devalok/shilp-sutra/ui/label
- Server-safe: No
- Category: ui

## Props
    required: boolean (shows red asterisk)
    htmlFor: string
    (plus standard Radix Label props)

## Example
```jsx
<Label htmlFor="email" required>Email Address</Label>
```

## Gotchas
- Use with FormField for automatic aria wiring

## Changes
### v0.2.0
- **Fixed** Children rendering verified and covered by tests — issue was caused by `@primitives` type leak, not a runtime bug

### v0.1.0
- **Added** Initial release
