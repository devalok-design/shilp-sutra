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

## Composability
- **Two rendering modes:**
  - **Data-driven:** Pass `items: TreeNode[]` with nested `children`. Good for server-fetched or programmatic trees.
  - **Declarative:** Use `<TreeItem>` children directly. Good for hardcoded nav, readable JSX.
  - Don't mix — pick one per TreeView instance.
- **useTree hook** lets you drive TreeView state externally (e.g. sync with URL, persist expanded state, drive from Redux). Pass `defaultExpanded`/`defaultSelected` initially OR manage state via the hook's return value.
- **TreeItem composability:** Each TreeItem has `icon`, `label`, `secondaryLabel`, and `actions` slots — rich rows without custom render props. `actions` reveals on row hover (same pattern as Message.Actions).
- **multiSelect + checkboxes:** Set both to turn TreeView into a file-picker style tree with checkboxes instead of single-select highlighting.
- **Keyboard navigation:** Full `role="tree"` spec — Arrow Up/Down to move, Right to expand/descend, Left to collapse/ascend, Enter to select. Pre-wired; no manual key handling needed.

## Gotchas
- Supports both data-driven (items prop) and declarative (children) modes
- Don't mix data-driven and declarative in the same TreeView — pick one
- For a simple flat checkbox list, use RadioGroup/Checkbox + Stack — TreeView is overkill for non-hierarchical data

## Changes
### v0.4.2
- **Added** TreeItem now accepts `className` prop

### v0.3.0
- **Added** Per-component export: `./ui/tree-view`

### v0.1.0
- **Added** Initial release
