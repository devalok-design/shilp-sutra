# StreamingText

- Import: @devalok/shilp-sutra-karm/chat
- Server-safe: No
- Category: chat

## Props
    text: string (REQUIRED)
    isComplete: boolean (default: false)
    className: string

## Defaults
    isComplete=false

## Example
```jsx
<StreamingText text={partialResponse} isComplete={!isStreaming} />
```

## Gotchas
- Shows a pulsing cursor block after the text while isComplete=false
- When isComplete=true, the cursor disappears and the full text is announced to screen readers via aria-live="polite"
- While streaming (isComplete=false), the sr-only announcement span outputs an empty string — aria-live='polite' is always present on the inner span but announces nothing until isComplete=true. The outer container always carries aria-live='off'.
- Text is rendered with ReactMarkdown — supports markdown formatting
- Extends React.HTMLAttributes<HTMLDivElement>

## Changes
### v0.18.0
- **Added** Initial release
