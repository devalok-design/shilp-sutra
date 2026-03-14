# ActivityTab

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## Props
    activities: AuditLogEntry[] (REQUIRED)
    ...HTMLAttributes<HTMLDivElement>

## AuditLogEntry Shape
    id: string
    timestamp: string
    actorType: 'USER' | 'CLIENT' | 'SYSTEM' | 'AGENT'
    actorId: string | null
    action: string
    entityType: string
    entityId: string
    projectId: string | null
    metadata: Record<string, unknown> | null

## Supported Actions
    task.created, task.updated, task.moved, task.assigned, task.unassigned,
    task.commented, task.file_uploaded, task.review_requested, task.review_completed,
    task.visibility_changed, task.priority_changed, task.labels_changed, task.due_date_changed

## Example
```jsx
<ActivityTab activities={auditLogEntries} />
```

## Gotchas
- Renders a vertical timeline with colored dots and icons per action type.
- Unknown actions fall back to a generic icon and use entry.action as the description.
- Actor name is derived from metadata.actorName, falling back to "System", "AI Agent", or "Someone".
- Empty state uses EmptyState component: "No activity yet".
- Forwards ref to outer div.

## Changes
### v0.18.0
- **Added** Initial release
