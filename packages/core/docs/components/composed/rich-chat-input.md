# RichChatInput

- Import: @devalok/shilp-sutra/composed/rich-chat-input
- Server-safe: No
- Category: composed

Compact rich text chat input for unified human+AI workspaces. Built on TipTap.

## Props

### RichChatInputProps
    onSubmit: (message: RichChatInputMessage) => void (REQUIRED)
    placeholder: string (default: "Type a message...")
    disabled: boolean (default: false)
    content: string — initial HTML (not reactive; use for message editing)
    variant: 'compact' | 'expanded' | 'minimal' | 'inline' (default: 'compact')
    enterBehavior: 'send' | 'newline' (default: 'send')
    maxLength: number — enables character counter
    charCountDisplay: 'always' | 'focus' | 'near-limit' | 'hidden' (default: 'near-limit')
    mentions: MentionItem[] — static list for @mention autocomplete
    onMentionSearch: (query: string) => Promise<MentionItem[]> — async search
    onMentionSelect: (item: MentionItem) => void
    onFileUpload: (file: File) => Promise<{ url: string; name: string; size: number }>
    onImageUpload: (file: File) => Promise<string>
    slashCommands: SlashCommandGroup[] — enables / command palette
    onVoiceRecord: (audio: Blob, duration: number) => void
    onTranscribe: (blob: Blob, duration: number) => Promise<string | null> — transcribe after recording; return null to attach as a voice note
    maxDuration: number — max voice-recording seconds
    replyTo: { id: string; author: string; preview: string; onDismiss: () => void } — reply banner above the input
    onTyping: (isTyping: boolean) => void — typing indicator callback
    onEmpty: (isEmpty: boolean) => void
    isStreaming: boolean (default: false) — shows stop button instead of send
    onCancel: () => void — called when stop button is clicked
    leadingSlot: ReactNode — rendered above the editor
    trailingSlot: ReactNode — rendered below the toolbar
    disclaimer: string — small text below the input
    toolbar: boolean | ChatToolbarItem[] | ReactNode (default: true) — true = default toolbar, array = whitelist, ReactNode = custom, false = hidden
    actionButton: ReactNode | false — custom left-side button (replaces the default attach button; false hides it)
    emojiSet: 'native' | 'apple' | 'google' | 'twitter' | 'facebook' (default: 'native')
    onSchedule: (message: RichChatInputMessage, scheduledAt: Date) => void — if set, a schedule button appears next to send
    sendOptions: Array<{ label: string; icon?: ComponentType<{ className?: string }>; onSelect: () => void }> — split-send dropdown options

RichChatInputMessage: { html: string; plainText: string; attachments?: Array<{ url: string; name: string; size: number; type: string }>; voiceNote?: { blob: Blob; duration: number } }

ChatToolbarItem: 'bold' | 'italic' | 'underline' | 'strike' | 'highlight' | 'code' | 'bulletList' | 'orderedList' | 'blockquote' | 'link' | 'mention' | 'emoji' | 'slash'

MentionItem: { id: string; label: string; avatar?: string }

SlashCommand: { id: string; label: string; description?: string; icon?: ComponentType; action: (editor: Editor) => void }

SlashCommandGroup: { label: string; commands: SlashCommand[] }

## Variants
- `compact` (default) — 2-3 lines, inline toolbar
- `expanded` — 5+ lines, always-visible toolbar, suited for AI prompts
- `minimal` — single line, toolbar appears on focus
- `inline` — 40px min-height, no toolbar; for tight inline composers

## Example
```jsx
<RichChatInput
  onSubmit={(message) => sendMessage(message.html)}
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

## Composability
- **Chat-specific TipTap editor** — purpose-built for AI + human messaging. Built on RichTextEditor primitives but pre-configured for the chat UX (auto-resize, Enter-to-send, inline toolbar).
- **Variant drives the UX envelope:**
  - `compact` — 2-3 line inline (chat bubble composer)
  - `expanded` — 5+ lines with always-visible toolbar (AI prompt input)
  - `minimal` — single line, toolbar on focus (reply composer, quick comment)
- **Toolbar is opt-in per feature:** Icons only appear when their corresponding handler/prop is set. `onFileUpload` → attach button appears. `slashCommands` → slash button appears. `mentions` or `onMentionSearch` → @ button appears.
- **Composes with Message from ui/chat:** RichChatInput is the composer; Message is the read-only render of the message after send. Use them together for a complete chat UX (RichChatInput at the bottom, MessageList above).
- **TipTap is bundled** — no need to install `@tiptap/*` directly.
- **For general rich text editing** (not chat — long-form docs, notes), use RichTextEditor instead.
- **isStreaming + onCancel** — when the receiving side is streaming a response, show a stop button in place of send. Standard AI chat pattern.

## Gotchas
- Tiptap is bundled — no need to install `@tiptap/*` packages separately
- Enter sends by default; use `enterBehavior="newline"` for long-form composition (Cmd/Ctrl+Enter always sends)
- `maxLength` enables both a character limit and the visual counter in the toolbar
- File/image upload buttons only appear when the corresponding handler is provided
- Slash command button only appears when `slashCommands` is provided
- Mention button only appears when `mentions` or `onMentionSearch` is provided

## Changes
### v0.33.0
- **Added** Custom EmojiNode with spritesheet rendering — `emojiSet` prop
- **Added** `onSchedule` prop — schedule send with smart presets + DateTimePicker, SplitButton UX
- **Added** `actionButton` prop — composable left-side button (replaces default attach, or pass false to hide)
- **Added** Animated mic ↔ send button transitions (AnimatePresence)
- **Changed** Voice recording buttons from outline to soft variant
- **Fixed** ToolbarButton width for custom-width buttons (e.g. "Refine" with text label)

### v0.32.0
- Initial release
