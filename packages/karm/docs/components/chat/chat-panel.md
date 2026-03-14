# ChatPanel

- Import: @devalok/shilp-sutra-karm/chat
- Server-safe: No
- Category: chat

## Props
    isOpen: boolean (REQUIRED)
    onOpenChange: (open: boolean) => void (REQUIRED)
    messages: ChatMessage[] (REQUIRED)
    conversations: Conversation[] (REQUIRED)
    agents: Agent[] (default: DEFAULT_AGENTS — Devadoot, Prahari, Sutradhar, Sahayak, Vidwan, Sanchalak, Dwar-Palak)
    selectedAgentId: string (default: "devadoot")
    activeConversationId: string | null
    isStreaming: boolean (default: false)
    streamingText: string (default: "")
    isLoadingMessages: boolean (default: false)
    isLoadingConversations: boolean (default: false)
    onSendMessage: (message: string) => void (REQUIRED)
    onCancelStream: () => void
    onSelectAgent: (agentId: string) => void
    onStartNewChat: () => void
    onSelectConversation: (id: string) => void
    onArchiveConversation: (id: string) => void
    onDeleteConversation: (id: string) => void
    className: string

## Related Types
    Agent: { id: string; name: string; desc: string }
    ChatMessage: { id: string; role: "USER" | "ASSISTANT" | "SYSTEM"; content: string }
    Conversation: { id: string; title: string | null; updatedAt: string }

## Defaults
    agents=DEFAULT_AGENTS, selectedAgentId="devadoot", isStreaming=false, streamingText="", isLoadingMessages=false, isLoadingConversations=false

## Example
```jsx
<ChatPanel
  isOpen={chatOpen}
  onOpenChange={setChatOpen}
  messages={messages}
  conversations={conversations}
  selectedAgentId="devadoot"
  onSendMessage={(msg) => sendMessage(msg)}
  onSelectConversation={(id) => loadConversation(id)}
/>
```

## Gotchas
- Renders inside a Sheet (right side panel), capped at 480px max-width
- Toggles between MessageList (chat view) and ConversationList (history view) internally
- The Agent type is exported from this module — use it for custom agent arrays
- ChatMessage and Conversation types are re-exported from message-list and conversation-list respectively
- Extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> — children are not accepted

## Changes
### v0.18.0
- **Added** Initial release
