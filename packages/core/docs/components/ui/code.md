# Code

- Import: @devalok/shilp-sutra/ui/code
- Server-safe: Yes
- Category: ui

## Props
    variant: "inline" | "block"
    children: ReactNode

## Defaults
    variant="inline"

## Example
```jsx
<Code>onClick</Code>
<Code variant="block">{`const x = 1;\nconsole.log(x);`}</Code>
```

## Composability
- **Server-safe.** No context, no cascade.
- Inline variant composes inside Text, paragraphs, list items, table cells — wherever body text goes.
- Block variant is a `<pre><code>` pair with overflow-x scroll; pair with a dark background Card or MarkdownViewer for long snippets.
- Not a syntax-highlighted code viewer — for that, use RichTextEditor's code block or a dedicated library. Code here is typographic emphasis, not lexer-aware rendering.

## Gotchas
- "block" renders as `<pre><code>`, "inline" renders as `<code>`
- Block variant doesn't syntax-highlight — it's a styled pre tag, nothing more

## Changes
### v0.1.1
- **Fixed** `leading-[150%]` replaced with `leading-ds-relaxed` for token compliance

### v0.1.0
- **Added** Initial release
