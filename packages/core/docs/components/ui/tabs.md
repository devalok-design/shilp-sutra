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
    TabsList variant: "line"

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

## Gotchas
- variant goes on TabsList, NOT on individual TabsTrigger (propagates via context)
- DO NOT put variant on TabsTrigger — it inherits from TabsList

## Changes
### v0.18.0
- **Fixed** Wrapped TabsList context provider value in `useMemo` for performance

### v0.14.0
- **Changed** TabsTrigger: Added `gap-ds-02` (4px) between icon and label for better spacing

### v0.1.0
- **Added** Initial release
