# MarkdownViewer

- Import: @devalok/shilp-sutra/composed/markdown-viewer
- Server-safe: No
- Category: composed

## Props
    content: string (markdown source)
    compact: boolean (tighter spacing for inline use)
    allowHtml: boolean (allow raw HTML in markdown)
    linkTarget: string (target attribute for links)

## Defaults
    compact={false}, allowHtml={false}, linkTarget="_blank"

## Example
```jsx
<MarkdownViewer content={message.body} />
<MarkdownViewer content={comment} compact />
<MarkdownViewer content={trustedHtml} allowHtml />
```

## Composability
<!-- composability-stub -->
- TODO: document how this component composes with others (context cascade, slot API, portal behavior, common pairings, when to use vs alternatives).

## Gotchas
- Code blocks with a language fence are syntax-highlighted via `react-syntax-highlighter` (lazy-loaded) — the first render shows a plain `<pre>` fallback
- GFM (tables, strikethrough, task lists) is supported via `remark-gfm`
- Raw HTML is stripped by default — only enable `allowHtml` for trusted content
- Links open in a new tab by default (`target="_blank"` with `rel="noopener noreferrer"`)
