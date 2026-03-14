# MessageList

- Import: @devalok/shilp-sutra-karm/chat
- Server-safe: No
- Category: chat

## Props
    messages: ChatMessage[] (REQUIRED)
    isStreaming: boolean (default: false)
    streamingText: string (default: "")
    isLoadingMessages: boolean (default: false)
    emptyTitle: string (default: "Karm AI")
    emptyDescription: string (default: "Ask me about tasks, projects, attendance, or anything else.")
    className: string

## Related Types
    ChatMessage: { id: string; role: "USER" | "ASSISTANT" | "SYSTEM"; content: string }

## Defaults
    isStreaming=false, streamingText="", isLoadingMessages=false, emptyTitle="Karm AI", emptyDescription="Ask me about tasks, projects, attendance, or anything else."

## Example
```jsx
<MessageList
  messages={messages}
  isStreaming={isStreaming}
  streamingText={currentStreamText}
  isLoadingMessages={loading}
/>
```

## Gotchas
- Auto-scrolls to bottom when messages or streamingText change
- Three message roles render differently: USER (right-aligned, accent bubble), ASSISTANT (left-aligned, markdown-rendered), SYSTEM (centered, error-styled)
- When isStreaming=true and streamingText is non-empty, renders a StreamingText component below the message list
- When isStreaming=true and streamingText is empty, shows animated bouncing dots
- ASSISTANT messages are rendered with ReactMarkdown — supports markdown formatting
- Shows a loading spinner when isLoadingMessages=true
- Shows an empty state with robot icon when no messages and not streaming
- Uses framer-motion AnimatePresence for enter/exit animations

## Changes
### v0.18.0
- **Added** Initial release
