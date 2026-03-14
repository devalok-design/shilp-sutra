# EmptyState

- Import: @devalok/shilp-sutra/composed/empty-state
- Server-safe: No
- Category: composed

Note: EmptyState was server-safe prior to v0.18.0 but is NO LONGER server-safe due to Framer Motion dependency.

## Props
    title: string (REQUIRED)
    description: string
    icon: ReactNode | ComponentType<{ className?: string }> (default: Devalok chakra icon)
    action: ReactNode (e.g. a Button)
    compact: boolean (smaller layout)
    iconSize: 'sm' | 'md' | 'lg' (default 'md', compact defaults to 'sm') — sm=h-ico-sm, md=h-ico-lg, lg=h-ico-xl

## Defaults
    iconSize="md" (compact defaults to "sm")

## Example
```jsx
<EmptyState
  title="No tasks found"
  description="Create your first task to get started."
  action={<Button>Create Task</Button>}
  iconSize="lg"
/>
```

## Gotchas
- `icon` accepts both JSX elements (`<IconFolder />`) and component references (`IconFolder`). Component references are auto-instantiated with correct sizing classes.
- `iconSize` controls icon dimensions regardless of icon type. When `compact=true` and no `iconSize`, defaults to `'sm'`.
- As of v0.18.0, EmptyState is NOT server-safe (Framer Motion dependency). Use per-component import in client components.

## Changes
### v0.18.0
- **Changed** No longer server-safe due to Framer Motion dependency

### v0.16.0
- **Added** `iconSize?: 'sm' | 'md' | 'lg'` — control icon dimensions

### v0.13.0
- **Changed** `icon` prop now accepts `React.ComponentType<{ className?: string }>` in addition to `ReactNode` — component references are auto-instantiated

### v0.5.0
- **Changed** `icon` prop changed from `TablerIcon` (component ref) to `React.ReactNode` — use `icon={<MyIcon />}` instead of `icon={MyIcon}`
- **Changed** Default icon is now the Devalok swadhisthana chakra (inline SVG)

### v0.2.0
- **Added** Identified as server-safe component (later reverted in v0.18.0)

### v0.1.0
- **Added** Initial release
