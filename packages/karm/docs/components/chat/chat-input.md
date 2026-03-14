# ChatInput

- Import: @devalok/shilp-sutra-karm/chat
- Server-safe: No
- Category: chat

## Props
    onSubmit: (message: string) => void (REQUIRED)
    onCancel: () => void
    isStreaming: boolean (default: false)
    placeholder: string (default: "Ask Karm AI...")
    disclaimer: string (default: "AI responses may be inaccurate. Verify important information.")
    className: string

## Defaults
    isStreaming=false, placeholder="Ask Karm AI...", disclaimer="AI responses may be inaccurate. Verify important information."

## Example
```jsx
<ChatInput
  onSubmit={(msg) => sendMessage(msg)}
  onCancel={() => cancelStream()}
  isStreaming={isStreaming}
/>
```

## Gotchas
- Enter sends the message; Shift+Enter inserts a newline
- When isStreaming=true, the send button becomes a red stop button that calls onCancel
- The textarea auto-resizes up to 160px max height
- Trims whitespace before submitting — empty/whitespace-only messages are blocked
- Extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> — the native onSubmit is replaced
- Set disclaimer="" (empty string) to hide the disclaimer text

## Changes
### v0.18.0
- **Added** Initial release
