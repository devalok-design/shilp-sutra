# ConversationTab

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## Props
    comments: Comment[] (REQUIRED)
    taskVisibility: 'INTERNAL' | 'EVERYONE' (REQUIRED)
    onPostComment: (content: string, authorType: 'INTERNAL' | 'CLIENT') => void (REQUIRED)
    clientMode: boolean (default: false)
    richText: boolean (default: true) — enable built-in RichTextEditor/Viewer
    renderEditor: (props: { content: string; onChange: (content: string) => void; placeholder: string }) => ReactNode
    renderViewer: (props: { content: string; className?: string }) => ReactNode
    ...HTMLAttributes<HTMLDivElement>

## Comment Shape
    id: string
    taskId: string
    authorType: 'INTERNAL' | 'CLIENT'
    authorId: string
    content: string
    createdAt: string
    updatedAt: string
    internalAuthor: { id: string; name: string; email?: string; image?: string | null } | null (optional)
    clientAuthor: { id: string; name: string; email: string } | null (optional)

## Defaults
    clientMode=false, richText=true

## Example
```jsx
<ConversationTab
  comments={task.comments}
  taskVisibility={task.visibility}
  onPostComment={(content, type) => postComment(content, type)}
/>
```

## Gotchas
- In clientMode, comments are posted with authorType='CLIENT'. In staff mode, authorType='INTERNAL'.
- When taskVisibility='EVERYONE' and not clientMode, a warning is shown: "Comments may be seen by external users."
- In clientMode, staff comments show a "Team" badge. In staff mode, client comments show a "Client" badge.
- Editor resolution priority: renderEditor prop > built-in RichTextEditor (when richText=true) > plain textarea fallback.
- Viewer resolution priority: renderViewer prop > built-in RichTextViewer (when richText=true) > plain text with HTML stripped.
- Auto-scrolls to bottom when new comments arrive.
- Empty state: "No comments yet".
- Forwards ref to outer div.

## Changes
### v0.19.0
- **Added** Decomposed into composable pieces: `MessageList`, `MessageBubble`, `MessageInput`, `VisibilityWarning` — importable from `@devalok/shilp-sutra-karm/tasks`
- ConversationTab remains as a pre-assembled default; use the pieces for custom layouts

### v0.18.0
- **Added** Initial release
