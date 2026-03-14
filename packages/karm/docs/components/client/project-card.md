# ProjectCard

- Import: @devalok/shilp-sutra-karm/client
- Server-safe: No
- Category: client

## Props
    name: string (REQUIRED)
    description: string | null
    status: "active" | "completed" | "paused" (REQUIRED)
    taskCount: number (default: 0)
    completedTasks: number (default: 0)
    className: string

## Defaults
    taskCount=0, completedTasks=0

## Example
```jsx
<ProjectCard
  name="Website Redesign"
  description="Complete overhaul of the marketing site"
  status="active"
  taskCount={24}
  completedTasks={18}
/>
```

## Gotchas
- Status maps to Badge colors: active=success, completed=info, paused=warning
- Progress bar shows completedTasks/taskCount as a percentage (rounded)
- If taskCount is 0, progress is 0% regardless of completedTasks
- Description is clamped to 2 lines with line-clamp-2
- Has cursor-pointer and hover shadow — attach onClick via spread props for navigation
- Extends React.HTMLAttributes<HTMLDivElement>

## Changes
### v0.18.0
- **Added** Initial release
