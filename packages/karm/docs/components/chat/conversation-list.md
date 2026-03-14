# ConversationList

- Import: @devalok/shilp-sutra-karm/chat
- Server-safe: No
- Category: chat

## Props
    conversations: Conversation[] (REQUIRED)
    activeConversationId: string | null
    isLoading: boolean (default: false)
    onSelect: (id: string) => void (REQUIRED)
    onNewChat: () => void (REQUIRED)
    onArchive: (id: string) => void
    onDelete: (id: string) => void
    className: string

## Related Types
    Conversation: { id: string; title: string | null; updatedAt: string }

## Defaults
    isLoading=false

## Example
```jsx
<ConversationList
  conversations={conversations}
  activeConversationId={currentConvoId}
  onSelect={(id) => loadConversation(id)}
  onNewChat={() => startNewChat()}
  onArchive={(id) => archiveConversation(id)}
  onDelete={(id) => deleteConversation(id)}
/>
```

## Gotchas
- Extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> — the native onSelect is replaced
- Archive and delete buttons appear on hover for each conversation row
- If onArchive or onDelete are not provided, the corresponding action buttons are hidden
- Conversations with null title display as "Untitled conversation"
- updatedAt is formatted using formatRelativeTime (e.g., "2 hours ago")
- The active conversation is highlighted with bg-surface-2
- Shows a loading spinner when isLoading=true
- Shows "No conversations yet" empty state when the array is empty

## Changes
### v0.18.0
- **Added** Initial release
