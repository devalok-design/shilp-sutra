# RichChatInput

- Import: @devalok/shilp-sutra/composed/rich-chat-input
- Server-safe: No
- Category: composed

Compact rich text chat input for unified human+AI workspaces. Built on TipTap.

## Props

### RichChatInputProps
    onSubmit: (html: string, plainText: string) => void (REQUIRED)
    placeholder: string (default: "Type a message...")
    disabled: boolean (default: false)
    variant: 'compact' | 'expanded' | 'minimal' (default: 'compact')
    maxRows: number
    enterBehavior: 'send' | 'newline' (default: 'send')
    maxLength: number — enables character counter
    mentions: MentionItem[] — static list for @mention autocomplete
    onMentionSearch: (query: string) => Promise<MentionItem[]> — async search
    onMentionSelect: (item: MentionItem) => void
    onFileUpload: (file: File) => Promise<{ url: string; name: string; size: number }>
    onImageUpload: (file: File) => Promise<string>
    slashCommands: SlashCommandGroup[] — enables / command palette
    onTyping: (isTyping: boolean) => void — typing indicator callback
    onEmpty: (isEmpty: boolean) => void
    isStreaming: boolean (default: false) — shows stop button instead of send
    onCancel: () => void — called when stop button is clicked
    leadingSlot: ReactNode — rendered above the editor
    trailingSlot: ReactNode — rendered below the toolbar
    disclaimer: string — small text below the input
    toolbar: boolean | ChatToolbarItem[] (default: true)

ChatToolbarItem: 'bold' | 'italic' | 'underline' | 'strike' | 'highlight' | 'code' | 'bulletList' | 'orderedList' | 'mention' | 'emoji' | 'attach' | 'slash'

MentionItem: { id: string; label: string; avatar?: string }

SlashCommand: { id: string; label: string; description?: string; icon?: ComponentType; action: (editor: Editor) => void }

SlashCommandGroup: { label: string; commands: SlashCommand[] }

## Variants
- `compact` (default) — 2-3 lines, inline toolbar
- `expanded` — 5+ lines, always-visible toolbar, suited for AI prompts
- `minimal` — single line, toolbar appears on focus

## Example
```jsx
<RichChatInput
  onSubmit={(html, text) => sendMessage(html)}
  mentions={teamMembers}
  onFileUpload={uploadFile}
  slashCommands={[{ label: 'Actions', commands: [...] }]}
/>

<RichChatInput
  variant="expanded"
  onSubmit={handleSubmit}
  maxLength={2000}
  disclaimer="AI-generated content may be inaccurate."
/>

<RichChatInput
  variant="minimal"
  enterBehavior="newline"
  onSubmit={handleReply}
/>
```

## Gotchas
- Tiptap is bundled — no need to install `@tiptap/*` packages separately
- Enter sends by default; use `enterBehavior="newline"` for long-form composition (Cmd/Ctrl+Enter always sends)
- `maxLength` enables both a character limit and the visual counter in the toolbar
- File/image upload buttons only appear when the corresponding handler is provided
- Slash command button only appears when `slashCommands` is provided
- Mention button only appears when `mentions` or `onMentionSearch` is provided

## Changes
### v0.32.0
- Initial release
