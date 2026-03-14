# Stack

- Import: @devalok/shilp-sutra/ui/stack
- Server-safe: Yes
- Category: ui

## Props
    direction: "vertical" | "horizontal" | "row" | "column"
    gap: SpacingToken | number — tokens: "ds-01".."ds-13", or numbers 0-13
    align: "start" | "center" | "end" | "stretch" | "baseline"
    justify: "start" | "center" | "end" | "between" | "around" | "evenly"
    wrap: boolean
    as: ElementType (default: "div")

## Defaults
    direction: "vertical"

## Example
```jsx
<Stack direction="horizontal" gap="ds-04" align="center">
  <Avatar size="sm" />
  <Text variant="body-md">User Name</Text>
</Stack>
```

## Gotchas
- "row" and "column" are aliases for "horizontal" and "vertical"
- gap accepts both token strings and numeric values

## Changes
### v0.2.0
- **Added** `direction` prop now accepts `"row"` / `"column"` as aliases for `"horizontal"` / `"vertical"`
- **Added** `gap` prop now accepts numeric values (e.g., `gap={4}` -> `gap-ds-04`) in addition to token strings

### v0.1.1
- **Fixed** Replaced dynamic `gap-${N}` with static lookup map (Tailwind JIT safety)

### v0.1.0
- **Added** Initial release
