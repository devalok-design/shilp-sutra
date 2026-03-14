# RichTextEditor

- Import: @devalok/shilp-sutra/composed/rich-text-editor
- Server-safe: No
- Category: composed

Exports: RichTextEditor, RichTextViewer

## Props

### RichTextEditor
    content: string (HTML string)
    placeholder: string (default: "Start writing...")
    onChange: (html: string) => void
    className: string
    editable: boolean (default: true)
    onImageUpload?: (file: File) => Promise<string> — return URL. If omitted, images paste as base64
    onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }> — enables file attachments
    mentions?: MentionItem[] — static list for @mention autocomplete
    onMentionSearch?: (query: string) => Promise<MentionItem[]> — async search, takes precedence over static mentions
    onMentionSelect?: (item: MentionItem) => void — called when a mention is selected

MentionItem: { id: string; label: string; avatar?: string }

### RichTextViewer
    content: string (REQUIRED, HTML string)
    className: string

## Defaults
    RichTextEditor: placeholder="Start writing...", editable=true

## Example
```jsx
<RichTextEditor content={html} onChange={setHtml} placeholder="Write your message..." />

<RichTextEditor
  content={html}
  onChange={setHtml}
  mentions={[{ id: '1', label: 'Aarav' }]}
  onImageUpload={async (file) => uploadAndReturnUrl(file)}
  onFileUpload={async (file) => ({ url: uploadUrl, name: file.name, size: file.size })}
/>

<RichTextViewer content={savedHtml} />
```

## Gotchas
- Tiptap is bundled — no need to install `@tiptap/*` packages separately
- Emoji picker requires `@emoji-mart/react` + `@emoji-mart/data` peers
- Images without `onImageUpload` are stored as base64 in HTML — large images bloat content
- Mention rendering in viewer always works (no mention props needed, just the HTML)
- Features: bold, italic, underline, strikethrough, highlight, headings, blockquote, lists, task lists, code, links, images, file attachments, mentions, emoji, text alignment, horizontal rule

## Changes
### v0.18.0
- **Fixed** Use ref to track internal changes, prevent update loop

### v0.9.0
- **Changed** All `@tiptap/*` packages moved from peerDependencies to bundled build-time dependencies — consumers no longer need to install tiptap separately

### v0.8.0
- **Fixed** Emoji picker now renders above the editor (not clipped by overflow)
- **Fixed** Link/image URL injection prevented via protocol validation
- **Fixed** Escape key in emoji picker no longer closes parent dialogs
- **Fixed** Tiptap peer deps tightened to `>=2.27.2 <3.0.0`

### v0.7.0
- **Added** Initial release — full-featured tiptap-based rich text editing with toolbar, mentions, emoji, image, alignment

### v0.3.0
- **Fixed** Added content sync effect so editor updates when `content` prop changes externally
