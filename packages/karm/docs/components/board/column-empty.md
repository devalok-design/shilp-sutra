# ColumnEmpty

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## Props
    index: number (REQUIRED) — used to cycle through 4 illustration variants
    onAddTask: () => void
    isDropTarget: boolean (default: false)
    ...HTMLAttributes<HTMLDivElement>

## Defaults
    isDropTarget=false

## Illustrations
Cycles through 4 SVG illustrations by column index:
0: Clipboard, 1: Stacked Cards, 2: Checkmark Circle, 3: Inbox

## Example
```jsx
<ColumnEmpty index={0} onAddTask={() => addTask(columnId)} />
<ColumnEmpty index={1} isDropTarget />
```

## Gotchas
- When isDropTarget=true, shows "Drop tasks here" text instead of the default empty state with "Add a task" button.
- Illustrations use currentColor (inherits text-surface-fg-subtle).
- Forwards ref to outer div.

## Changes
### v0.18.0
- **Added** Initial release
