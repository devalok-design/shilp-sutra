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

## Composability
- **Low-level context primitive** — rarely used directly. Most consumers want IconGroup (which wraps IconProvider + layout) or just nest Icons inside Button/Input/Badge (which provide their own IconProvider).
- **When to reach for IconProvider manually:** Building a custom container that hosts many Icons (a dashboard tile row, a custom toolbar, a nav rail) and you want consistent icon sizing without repeating props. IconProvider is the escape hatch for that.
- **Consumer contract:** `useIconContext()` returns `{}` (empty) when no provider is present — your consumer code MUST handle that (fall back to a default size/stroke). Don't assume a provider exists.
- **Memoization:** The provider memoizes its value, so consumers don't re-render unless size or stroke actually change. Safe to use in tight loops / frequently-re-rendering trees.
- **Composes down:** IconProvider nests — inner providers override outer ones. A `<Button size="lg"><IconProvider size="xs">...</IconProvider></Button>` overrides the button's icon sizing.

## Gotchas
- Used internally by IconGroup and Button to propagate icon sizing to children
- If no provider is present, `useIconContext()` returns `{}` (empty object) — consumers should fall back to defaults
- Value is memoized — safe for frequent re-renders

## Changes
### v0.29.0
- **Added** Initial release — React context for propagating icon size and stroke weight
