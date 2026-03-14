# TreeView / TreeItem

- Import: @devalok/shilp-sutra/ui/tree-view
- Server-safe: No
- Category: ui

## Props
### TreeView
    items: TreeNode[] (data-driven mode) — { id, label, icon?, disabled?, children? }
    defaultExpanded: string[]
    defaultSelected: string[]
    multiSelect: boolean
    checkboxes: boolean
    onSelect: (ids: string[]) => void
    onExpand: (ids: string[]) => void
    children: ReactNode (declarative mode)

### TreeItem
    itemId: string (REQUIRED)
    label: ReactNode
    secondaryLabel: ReactNode
    icon: ReactNode
    actions: ReactNode
    disabled: boolean
    depth: number
    children: ReactNode (nested TreeItems)

## Hook
    useTree({ defaultExpanded, defaultSelected, multiSelect, onSelect, onExpand })

## Example (data-driven)
```jsx
<TreeView
  items={[
    { id: '1', label: 'Folder', children: [
      { id: '1.1', label: 'File A' },
      { id: '1.2', label: 'File B' },
    ]},
  ]}
  defaultExpanded={['1']}
  onSelect={(ids) => console.log(ids)}
/>
```

## Example (declarative)
```jsx
<TreeView>
  <TreeItem itemId="1" label="Folder">
    <TreeItem itemId="1.1" label="File A" />
  </TreeItem>
</TreeView>
```

## Gotchas
- Supports both data-driven (items prop) and declarative (children) modes

## Changes
### v0.4.2
- **Added** TreeItem now accepts `className` prop

### v0.3.0
- **Added** Per-component export: `./ui/tree-view`

### v0.1.0
- **Added** Initial release
