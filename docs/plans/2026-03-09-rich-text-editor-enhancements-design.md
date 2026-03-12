# RichTextEditor & Viewer Enhancements — Design

**Date:** 2026-03-09
**Goal:** Evolve the minimal RichTextEditor into a general-purpose rich content editor with image paste, file attachments, mentions, emoji, and full formatting.

## Current State

- Tiptap StarterKit + Placeholder only
- 9 toolbar buttons (bold, italic, strike, H2, H3, UL, OL, code block, undo/redo)
- No images, links, underline, mentions, emoji, or file support
- RichTextViewer renders HTML content read-only

## New Tiptap Extensions

| Extension | Package | Purpose |
|-----------|---------|---------|
| Image | `@tiptap/extension-image` | Paste/drop/upload images |
| Link | `@tiptap/extension-link` | Auto-link URLs, click to edit |
| Underline | `@tiptap/extension-underline` | Underline formatting |
| Highlight | `@tiptap/extension-highlight` | Text highlighting |
| TaskList + TaskItem | `@tiptap/extension-task-list` + `@tiptap/extension-task-item` | Checkbox lists |
| TextAlign | `@tiptap/extension-text-align` | Left/center/right/justify |
| HorizontalRule | Already in StarterKit | Just needs toolbar button |
| Mention | `@tiptap/extension-mention` | @mention autocomplete |
| Emoji suggestion | Custom plugin using `@tiptap/suggestion` | `:shortcode:` inline suggestions |
| FileAttachment | Custom node extension | Non-image file attachments |

Peer deps: `@emoji-mart/react`, `@emoji-mart/data`

## New Props

```ts
/** Called when an image is pasted/dropped. Return a URL. If not provided, images inline as base64. */
onImageUpload?: (file: File) => Promise<string>
/** Called when a non-image file is dropped/pasted. Return file metadata. If not provided, non-image files are ignored. */
onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
/** Static list of mentionable items for @ autocomplete */
mentions?: MentionItem[]
/** Async search for mentions. Takes precedence over static list when provided. */
onMentionSearch?: (query: string) => Promise<MentionItem[]>
/** Called when a mention is selected */
onMentionSelect?: (item: MentionItem) => void
```

```ts
interface MentionItem {
  id: string
  label: string
  avatar?: string
}
```

## Toolbar Layout

```
[B] [I] [U] [S] [Mark] | [H2] [H3] [Quote] | [UL] [OL] [Task] | [Link] [Image] [Attach] [HR] | [AlignL] [AlignC] [AlignR] | [Emoji] | [Undo] [Redo]
```

Flex-wrap on narrow widths. Groups separated by thin dividers.

## Feature Details

### Image Handling

- Paste/drop image → if `onImageUpload` provided, show loading placeholder, call callback, replace with URL. If not, inline as base64.
- Click to select, resize handles (drag corners)
- Toolbar image button opens native file picker (images only)

### File Attachments

- Drop/paste non-image file → call `onFileUpload`, insert styled file node
- File node: compact card `[📎 filename.pdf (2.3 MB)]` — clickable to download
- If `onFileUpload` not provided, non-image files silently ignored
- Toolbar paperclip button opens native file picker (any type)

### Link Handling

- Paste URL → auto-link
- Select text + link button → inline URL popover
- Click existing link → edit/unlink popover
- `rel="noopener noreferrer"` + `target="_blank"` by default

### Mention Autocomplete

- Type `@` → dropdown filtered by query
- Static `mentions` list or async `onMentionSearch` (async takes precedence, debounced)
- Dropdown shows avatar + label
- Renders as styled chip in editor
- HTML output: `<span data-mention-id="..." class="mention">@Label</span>`

### Emoji

- Toolbar button → `emoji-mart` picker popover
- Inline `:shortcode:` → suggestion dropdown (like Slack/Discord)
- Inserts native Unicode emoji characters

### Text Alignment

- Left (default), center, right, justify
- Applied per-block via toolbar buttons

### RichTextViewer Updates

Render all new content types: images (max-width constrained), links (styled, clickable), task lists (checkboxes, read-only), highlights, mentions (styled chips), file attachments (download links), text alignment, blockquotes. No new props — just prose CSS updates.

## Not Included

- Tables
- Collaborative editing
- Drag-and-drop block reordering
- Slash commands (/)
