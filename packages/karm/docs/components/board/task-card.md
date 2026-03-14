# TaskCard / TaskCardCompact / TaskCardOverlay / TaskCardCompactOverlay

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## TaskCard Props
    task: BoardTask (REQUIRED)
    ...HTMLAttributes<HTMLDivElement>

## TaskCardCompact Props
    task: BoardTask (REQUIRED)
    ...HTMLAttributes<HTMLDivElement>

## TaskCardOverlay Props
    task: BoardTask (REQUIRED)
    ...HTMLAttributes<HTMLDivElement>

## TaskCardCompactOverlay Props
    task: BoardTask (REQUIRED)
    ...HTMLAttributes<HTMLDivElement>

## Card Variants (CVA)
    state: "default" | "dragging" | "overlay" (default: "default")
    blocked: boolean (default: false) — adds left error border
    selected: boolean (default: false) — adds accent ring
    dimmed: boolean (default: false) — reduces opacity

> **Note:** These are INTERNAL visual states derived from board context (selectedTaskIds, focusedTaskId, highlightMyTasks, drag state, task.isBlocked). Consumers only pass `task: BoardTask` and standard HTML attributes — the component resolves variant values internally.

## Compact Card Variants (CVA)
    selected: boolean (default: false)
    dimmed: boolean (default: false)

> **Note:** Same as above — these are INTERNAL visual states. Consumers only pass `task: BoardTask` and standard HTML attributes.

## Example
```jsx
{/* Used automatically by BoardColumn based on viewMode */}
<TaskCard task={task} />
<TaskCardCompact task={task} />

{/* Overlay variants used inside DragOverlay */}
<TaskCardOverlay task={task} />
<TaskCardCompactOverlay task={task} />
```

## Visual Elements
- Default card: taskId, priority icon, drag handle, title (2-line clamp), due date, subtask count, visibility/blocked badges, avatar stack (owner with glow + up to 3 assignees)
- Compact card: single row with priority icon, taskId, title (1-line clamp), subtask count, lead avatar

## Gotchas
- Must be rendered inside a BoardProvider context (reads selectedTaskIds, focusedTaskId, currentUserId, highlightMyTasks, onClickTask).
- TaskCard and TaskCardCompact use @dnd-kit useSortable hooks internally for drag-and-drop.
- TaskCardOverlay and TaskCardCompactOverlay have NO sortable hooks — they are for DragOverlay only.
- Selection checkbox appears on hover or when any tasks are selected.
- highlightMyTasks dims cards where the current user is not owner or assignee.
- All four variants forward ref.

## Changes
### v0.18.0
- **Added** Initial release
