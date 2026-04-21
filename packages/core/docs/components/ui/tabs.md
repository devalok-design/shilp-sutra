# Tabs

- Import: @devalok/shilp-sutra/ui/tabs
- Server-safe: No
- Category: ui

## Props
### Tabs (root)
    defaultValue: string
    value: string
    onValueChange: (value: string) => void

### TabsList
    variant: "line" | "contained"
    size: "sm" | "md" | "lg"
    orientation: "horizontal" | "vertical"

### TabsTrigger
    value: string (REQUIRED)
    variant: (inherits from TabsList)

### TabsContent
    value: string (REQUIRED)

## Compound Components
    Tabs (root)
      TabsList (variant)
        TabsTrigger (value)
      TabsContent (value)

## Defaults
    TabsList variant="line", size="md", orientation="horizontal"

## Example
```jsx
<Tabs defaultValue="overview">
  <TabsList variant="contained">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="activity">Activity content</TabsContent>
</Tabs>
```

## Composability
- TabsList propagates `variant`, `size`, and `orientation` to every TabsTrigger child via `TabsListContext`. TabsTrigger reads all three from context; explicit props on a trigger override the inherited value.
- `orientation="vertical"` on TabsList changes the TabsList layout (flex-col + left border) AND the `roving-tabindex` keyboard behavior (ArrowUp/Down navigate, not ArrowLeft/Right).
- Tabs (root) is just the Radix Tabs.Root — state props (value, defaultValue, onValueChange) live there; styling props live on TabsList.
- Tabs content is rendered inline (not portalled) — container-scoped queries work fine in tests.

## Gotchas
- variant/size/orientation go on TabsList, NOT on Tabs root or individual TabsTrigger
- Normally omit `variant` on TabsTrigger — it inherits from TabsList via context. You CAN set it per-trigger to override.

## Changes
### v0.31.0
- **Added** `size` prop on TabsList: `sm | md | lg`. Scales height and trigger padding.
- **Added** `color` prop on TabsList: `accent | neutral`. Affects line variant indicator.

### v0.18.0
- **Fixed** Wrapped TabsList context provider value in `useMemo` for performance

### v0.14.0
- **Changed** TabsTrigger: Added `gap-ds-02` (4px) between icon and label for better spacing

### v0.1.0
- **Added** Initial release
