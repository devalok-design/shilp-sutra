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
- **Read-only markdown renderer.** For editing, use RichTextEditor (TipTap-based). MarkdownViewer is strictly for display.
- **Built on react-markdown + remark-gfm** — GFM tables, strikethrough, task lists supported out of the box.
- **Syntax highlighting is lazy:** Code blocks with a language fence (```ts, ```python) lazy-load react-syntax-highlighter. First render shows a plain `<pre>` fallback. Don't pre-import.
- **Security posture:** Raw HTML is stripped by default — `allowHtml={true}` must be explicit, and ONLY for trusted content (XSS vector otherwise).
- **Links open external by default** (`target="_blank"` + `rel="noopener noreferrer"`). Override via `linkTarget`.
- **compact mode** for inline use (comments, message bubbles). Default spacing is for article-body content.
- **Pairs with Chat's Message.Body** — render markdown from user messages safely. Always keep `allowHtml={false}` for user-generated content.

## Gotchas
- Code blocks with a language fence are syntax-highlighted via `react-syntax-highlighter` (lazy-loaded) — the first render shows a plain `<pre>` fallback
- GFM (tables, strikethrough, task lists) is supported via `remark-gfm`
- Raw HTML is stripped by default — only enable `allowHtml` for trusted content
- Links open in a new tab by default (`target="_blank"` with `rel="noopener noreferrer"`)
