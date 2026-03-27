# IconContext

- Import: @devalok/shilp-sutra/ui (barrel export)
- Server-safe: No
- Category: ui

## Exports
    IconContext — React.Context<IconContextValue>
    IconProvider — Provider component (props: size?, stroke?, children)
    useIconContext() — Hook returning { size?, stroke? }
    IconSize — Type: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
    IconStroke — Type: "light" | "regular" | "bold"

## IconProvider Props
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
    stroke: "light" | "regular" | "bold"
    children: ReactNode (REQUIRED)

## Example
```jsx
import { IconProvider, useIconContext } from '@devalok/shilp-sutra/ui'

<IconProvider size="sm" stroke="bold">
  <MyCustomIconComponent />
</IconProvider>

// Inside MyCustomIconComponent:
const { size, stroke } = useIconContext()
```

## Gotchas
- Used internally by IconGroup and Button to propagate icon sizing to children
- If no provider is present, `useIconContext()` returns `{}` (empty object) — consumers should fall back to defaults
- Value is memoized — safe for frequent re-renders

## Changes
### v0.29.0
- **Added** Initial release — React context for propagating icon size and stroke weight
