# Badge

- Import: @devalok/shilp-sutra/ui/badge
- Server-safe: No
- Category: ui

## Props
    variant: "subtle" | "solid" | "outline" | "secondary" (alias->subtle) | "destructive" (alias->solid+error)
    color: "default" | "info" | "success" | "error" | "warning" | "brand" | "accent" | "teal" | "amber" | "slate" | "indigo" | "cyan" | "orange" | "emerald"
    size: "xs" | "sm" | "md" | "lg"
    dot: boolean (shows leading dot indicator)
    onDismiss: () => void (shows X button when provided)
    children: ReactNode

## Defaults
    variant="subtle", color="default", size="md"

## Example
```jsx
<Badge variant="solid" color="success">Active</Badge>
<Badge color="teal" onDismiss={() => removeFilter('teal')}>Teal team</Badge>
```

## Gotchas
- DO NOT use variant="destructive" — use variant="solid" color="error"
- Badge is display-only; for interactive tags use Chip

## Changes
### v0.18.0
- **Changed** Pulse-ring animation migrated to Framer Motion
- **Fixed** Accent color variants — `text-accent-9` changed to `text-accent-11`, `border-accent-9` changed to `border-accent-7`
- **Changed** OKLCH color token migration

### v0.8.0
- **Fixed** `text-[10px]` changed to `text-ds-xs` for token consistency

### v0.4.2
- **Fixed** `Omit<HTMLAttributes, 'color'>` resolves TS2320 conflict with CVA color prop

### v0.3.1
- **Fixed** Dismiss button added 24px touch target

### v0.3.0
- **Changed** (BREAKING) Single `variant` axis split into `variant` (subtle/solid/outline) + `color` (default/info/success/error/...)
- **Fixed** Solid variant phantom token `text-on-interactive` changed to `text-on-color`

### v0.1.0
- **Added** Initial release
