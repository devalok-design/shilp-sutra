# RichChatInput Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a compact, Linear-style rich text chat input with TipTap for unified human+AI workspaces — mentions, emoji, file paste/drop, slash commands, typing indicator, character counter, 3 variants.

**Architecture:** New `RichChatInput` composed component that reuses TipTap extensions from `RichTextEditor` (mentions, emoji, file-attachment) but with chat-optimized layout. New `SlashCommand` TipTap extension. Compact inline toolbar for desktop, floating bubble toolbar for mobile. Shares the existing TipTap chunk (546KB) — no new bundle cost for consumers already using RTE.

**Tech Stack:** TipTap (React), @tiptap/extension-character-count, existing mention/emoji/file extensions, framer-motion (toolbar animations), Tailwind CSS

---

## Task 1: SlashCommand TipTap Extension

**Files:**
- Create: `packages/core/src/composed/extensions/slash-command.tsx`

Create a TipTap suggestion-based extension triggered by `/` at the start of a line. Follows the same pattern as `mention-suggestion.tsx` and `emoji-suggestion.tsx`.

The extension:
- Triggers on `/` at start of line (char: '/', allowSpaces: false, startOfLine: true)
- Renders a suggestion popover (max 8 items, keyboard navigable)
- Items have: icon, label, description
- Selecting an item calls `item.action(editor)` then removes the `/` trigger text
- Popover styled with existing tokens (bg-surface-overlay, border-surface-border-strong, shadow-floating, rounded-ds-lg)

Read `packages/core/src/composed/extensions/mention-suggestion.tsx` for the exact pattern — `createRoot`/`Root` for the suggestion renderer, `React.forwardRef` with `useImperativeHandle` for keyboard handling.

The types:
```tsx
export interface SlashCommand {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action: (editor: Editor) => void
}

export interface SlashCommandGroup {
  label: string
  commands: SlashCommand[]
}
```

Commit: `feat: add SlashCommand TipTap extension for chat input`

---

## Task 2: RichChatInput Component — Core

**Files:**
- Create: `packages/core/src/composed/rich-chat-input.tsx`

This is the main component. Build incrementally — this task creates the core editor with Enter-to-send, no toolbar yet.

**Step 1:** Create the component with TipTap editor setup.

Read `packages/core/src/composed/rich-text-editor.tsx` lines 1-65 to understand the extension setup pattern. The chat input uses a subset of extensions:

```tsx
const extensions = [
  StarterKit.configure({
    heading: false,        // No headings in chat
    horizontalRule: false,  // No HR in chat
    codeBlock: false,       // Use inline code only
    blockquote: false,      // Not needed in chat
  }),
  Placeholder.configure({ placeholder }),
  Underline,
  Highlight.configure({ multicolor: false }),
  Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-accent-11 underline' } }),
  Image,
  CharacterCount.configure({ limit: maxLength }),
  Mention.configure({ ... }),  // reuse from RTE
  EmojiSuggestion,              // reuse from RTE
  FileAttachment,               // reuse from RTE
  // SlashCommand conditionally added when slashCommands prop exists
]
```

**Step 2:** Implement the 3 variants via className/height:

```tsx
const variantConfig = {
  compact: { minRows: 2, defaultMaxRows: 8, showToolbar: true },
  expanded: { minRows: 5, defaultMaxRows: 15, showToolbar: true },
  minimal: { minRows: 1, defaultMaxRows: 4, showToolbar: false },  // toolbar on focus
}
```

**Step 3:** Implement Enter-to-send:

TipTap intercepts Enter by default (new paragraph). Add a custom extension or keyboard shortcut:
```tsx
// Custom extension to handle Enter behavior
const EnterToSend = Extension.create({
  name: 'enterToSend',
  addKeyboardShortcuts() {
    return {
      'Enter': ({ editor }) => {
        if (enterBehavior === 'send') {
          handleSubmit()
          return true  // prevent default
        }
        return false  // let TipTap handle (newline)
      },
      'Shift-Enter': ({ editor }) => {
        if (enterBehavior === 'send') {
          // Insert newline when Enter sends
          editor.commands.enter()
          return true
        }
        return false
      },
      'Mod-Enter': () => {
        handleSubmit()  // Always sends
        return true
      },
    }
  },
})
```

**Step 4:** Implement onSubmit — extract HTML and plain text:
```tsx
const handleSubmit = useCallback(() => {
  if (!editor || editor.isEmpty) return
  const html = editor.getHTML()
  const plainText = editor.getText()
  onSubmit(html, plainText)
  editor.commands.clearContent()
}, [editor, onSubmit])
```

**Step 5:** Implement the container layout:
```
┌─ Attachment Preview Strip (when files attached) ─┐
│ [img thumb] [file.pdf ×] [doc.docx ×]            │
├───────────────────────────────────────────────────┤
│ TipTap EditorContent (compact prose classes)      │
│                                                    │
├───────────────────────────────────────────────────┤
│ [Toolbar buttons...] .............. [234/4000] [➤] │
└───────────────────────────────────────────────────┘
```

Styling: `border border-surface-border rounded-ds-xl bg-surface-base` — matches existing MessageInput.

PROSE_CLASSES adjusted for chat density (smaller margins, no heading styles):
```tsx
const CHAT_PROSE = [
  'prose prose-sm max-w-none',
  'font-body text-ds-sm leading-relaxed text-surface-fg',
  '[&_p]:mb-ds-01 [&_p]:text-surface-fg',
  '[&_ul]:ml-ds-04 [&_ul]:list-disc [&_ol]:ml-ds-04 [&_ol]:list-decimal',
  '[&_li]:text-surface-fg',
  '[&_code]:rounded [&_code]:bg-surface-raised [&_code]:px-ds-02 [&_code]:py-[1px] [&_code]:text-ds-sm [&_code]:text-accent-11',
  '[&_strong]:font-semibold [&_strong]:text-surface-fg',
  '[&_mark]:rounded-sm [&_mark]:bg-warning-3 [&_mark]:px-[2px]',
  '[&_a]:text-accent-11 [&_a]:underline',
  '[&_.mention]:rounded-ds-sm [&_.mention]:bg-accent-2 [&_.mention]:px-ds-02 [&_.mention]:py-[1px] [&_.mention]:font-medium [&_.mention]:text-accent-11',
]
```

Commit: `feat: RichChatInput core — TipTap editor with Enter-to-send, 3 variants`

---

## Task 3: Inline Toolbar

**Files:**
- Modify: `packages/core/src/composed/rich-chat-input.tsx`

Add the inline toolbar below the editor. Reuse the `ToolbarButton` pattern from RichTextEditor.

Toolbar items (in order):
```
Bold | Italic | Underline | Strike | Highlight | Code | BulletList | OrderedList | @Mention | Emoji | Attach | /Slash | ---- | Counter | Send
```

Each button:
- 24px (`h-6 w-6`), `touch-target` for mobile
- `aria-label` and `title`
- Active state: `bg-surface-raised-hover text-accent-11`
- Disabled state when editor not focused or readonly
- `role="toolbar"` on container, `aria-label="Message formatting"`

Mention button: focuses editor and inserts `@` character (triggers suggestion)
Emoji button: focuses editor and inserts `:` character (triggers suggestion)
Attach button: opens file picker (hidden `<input type="file" multiple>`)
Slash button: focuses editor and inserts `/` at start of line (triggers suggestion)

Send button (right-aligned):
- `variant="ghost" size="icon-sm"` Button component
- Disabled when editor is empty
- Swaps to Stop button when `isStreaming`

Character counter (right-aligned, before send):
- Only renders when `maxLength` is set
- `text-ds-xs text-surface-fg-subtle`
- At 90%: `text-warning-11`
- At 100%: `text-error-11`

Commit: `feat: RichChatInput inline toolbar — formatting, insert, send`

---

## Task 4: File Handling — Drag-Drop, Paste, Attachment Strip

**Files:**
- Modify: `packages/core/src/composed/rich-chat-input.tsx`

**Step 1:** Implement file drop zone on the editor container:
- `onDragOver`, `onDragLeave`, `onDrop` handlers
- Visual drop indicator (dashed border, `border-accent-7`)
- On drop: call `onFileUpload` or `onImageUpload` based on MIME type
- Add to attachment state array

**Step 2:** Implement paste handling:
- TipTap's Image extension already handles image paste
- For file paste (non-image), intercept the paste event
- Add to attachment state array

**Step 3:** Implement attachment preview strip:
- Renders ABOVE the editor area
- Images: small thumbnail (48px square, rounded, object-cover) with `×` remove button
- Files: chip with icon + filename + size + `×` remove button
- Horizontal scroll if many attachments (`overflow-x-auto flex gap-ds-02`)
- Each attachment tracks: `{ id, file, url, name, size, type, uploading, progress }`

**Step 4:** Connect upload to onSubmit:
- When submitting, include attachments in the output (inject as TipTap FileAttachment nodes or pass alongside HTML)

Commit: `feat: RichChatInput file handling — drag-drop, paste, attachment strip`

---

## Task 5: Typing Indicator + Empty State

**Files:**
- Modify: `packages/core/src/composed/rich-chat-input.tsx`

**Step 1:** Typing indicator:
```tsx
const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

useEffect(() => {
  if (!editor || !onTyping) return
  
  const handleUpdate = () => {
    onTyping(true)
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000)
  }
  
  editor.on('update', handleUpdate)
  return () => {
    editor.off('update', handleUpdate)
    clearTimeout(typingTimeoutRef.current)
  }
}, [editor, onTyping])
```

**Step 2:** Empty state detection:
```tsx
useEffect(() => {
  if (!editor || !onEmpty) return
  
  const handleUpdate = () => {
    onEmpty(editor.isEmpty)
  }
  
  editor.on('update', handleUpdate)
  handleUpdate() // initial state
  return () => editor.off('update', handleUpdate)
}, [editor, onEmpty])
```

Commit: `feat: RichChatInput typing indicator + empty state detection`

---

## Task 6: Mobile Floating Toolbar

**Files:**
- Modify: `packages/core/src/composed/rich-chat-input.tsx`

On mobile (<768px), hide the inline toolbar formatting buttons. Instead, show a floating bubble toolbar when text is selected (Medium/Notion pattern).

**Step 1:** Use TipTap's `BubbleMenu` extension:
```tsx
import { BubbleMenu } from '@tiptap/react'

{isMobile && editor && (
  <BubbleMenu
    editor={editor}
    className="flex gap-ds-01 rounded-ds-lg border border-surface-border-strong bg-surface-overlay p-ds-02 shadow-floating"
  >
    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
      <Icon icon={IconBold} size="sm" />
    </ToolbarButton>
    {/* ... italic, underline, strike, highlight, code, link */}
  </BubbleMenu>
)}
```

**Step 2:** On mobile, the insert buttons (@, emoji, attach) move to a row at the bottom of the input (always visible), alongside the send button:
```
│ TipTap editor content                             │
├───────────────────────────────────────────────────┤
│ [@] [:)] [📎] [/] ........................ [Send ➤] │
```

Use `useIsMobile()` to toggle between desktop inline toolbar and mobile compact toolbar.

Commit: `feat: RichChatInput mobile floating toolbar + compact insert row`

---

## Task 7: Tests

**Files:**
- Create: `packages/core/src/composed/__tests__/rich-chat-input.test.tsx`

Tests:
1. Renders with placeholder text
2. `onSubmit` fires with HTML and plain text on Enter
3. `onSubmit` fires on Cmd+Enter regardless of `enterBehavior`
4. Shift+Enter inserts newline when `enterBehavior='send'`
5. Editor clears after submit
6. `disabled` prop disables the editor
7. `isStreaming` shows stop button
8. Character counter shows when `maxLength` set
9. Toolbar renders formatting buttons
10. `variant="minimal"` hides toolbar until focus
11. `onTyping` fires true then false after idle
12. `onEmpty` fires correctly
13. `axe: toHaveNoViolations()`

Note: TipTap editor in jsdom has limitations — content editing and selection may need mocks. Focus on prop behavior and DOM structure tests.

Commit: `test: RichChatInput — submit, variants, toolbar, typing, a11y`

---

## Task 8: Stories

**Files:**
- Create: `packages/core/src/composed/rich-chat-input.stories.tsx`

Stories:
1. **Default** — compact variant, basic usage
2. **Expanded** — expanded variant for AI prompts
3. **Minimal** — minimal variant for inline replies
4. **WithMentions** — mention search demo
5. **WithSlashCommands** — consumer-defined slash commands
6. **WithFileUpload** — file attach + drag-drop demo
7. **Streaming** — isStreaming mode with stop button
8. **WithCharacterLimit** — maxLength with counter
9. **AllVariants** — side-by-side comparison
10. **Mobile** — mobile viewport with floating toolbar

Play functions on Default story (click bold, type text, verify formatting).

Commit: `docs: RichChatInput stories — all variants, mentions, slash commands, files`

---

## Task 9: Exports + Docs

**Files:**
- Modify: `packages/core/src/composed/index.ts` — add RichChatInput export
- Modify: `packages/core/package.json` — add `./composed/rich-chat-input` subpath export
- Create: `packages/core/docs/components/composed/rich-chat-input.md`

Commit: `feat: export RichChatInput + add component docs`

---

## Execution Strategy

| Round | Tasks | Parallel? |
|-------|-------|-----------|
| 1 | Task 1 (SlashCommand extension) | Solo |
| 2 | Task 2 (Core component) | Solo (depends on Task 1) |
| 3 | Task 3 (Toolbar), Task 4 (Files), Task 5 (Typing) | Parallel (different sections of same file — but safer sequential) |
| 4 | Task 6 (Mobile toolbar) | Solo |
| 5 | Task 7 (Tests), Task 8 (Stories) | Parallel |
| 6 | Task 9 (Exports) | Solo |

**Estimated: 9 tasks, ~6 rounds.**
