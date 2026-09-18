# RichTextEditor Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Evolve the minimal RichTextEditor into a full-featured rich content editor with images, file attachments, links, mentions, emoji, and extended formatting.

**Architecture:** Extend the existing Tiptap-based RichTextEditor with new extensions, a redesigned toolbar, and custom nodes for file attachments and mentions. The editor remains a single composed component with optional callback props for upload/mention functionality. RichTextViewer gets matching prose styles.

**Tech Stack:** Tiptap 2.x extensions, @emoji-mart/react + @emoji-mart/data, @tabler/icons-react, React 18

**Design doc:** `docs/plans/2026-03-09-rich-text-editor-enhancements-design.md`

---

### Task 1: Install new Tiptap dependencies

**Files:**
- Modify: `packages/core/package.json`

**Step 1: Install dev + peer dependencies**

```bash
cd packages/core
pnpm add -D @tiptap/extension-image @tiptap/extension-link @tiptap/extension-underline @tiptap/extension-highlight @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-text-align @tiptap/extension-mention @tiptap/suggestion @emoji-mart/react @emoji-mart/data
```

**Step 2: Add to peerDependencies in package.json**

Add these to peerDependencies (alongside existing tiptap peers):
```json
"@tiptap/extension-image": "^2.0.0",
"@tiptap/extension-link": "^2.0.0",
"@tiptap/extension-underline": "^2.0.0",
"@tiptap/extension-highlight": "^2.0.0",
"@tiptap/extension-task-list": "^2.0.0",
"@tiptap/extension-task-item": "^2.0.0",
"@tiptap/extension-text-align": "^2.0.0",
"@tiptap/extension-mention": "^2.0.0",
"@tiptap/suggestion": "^2.0.0",
"@emoji-mart/react": "^1.0.0",
"@emoji-mart/data": "^1.0.0"
```

**Step 3: Commit**

```bash
git add packages/core/package.json pnpm-lock.yaml
git commit -m "chore: add Tiptap extension and emoji-mart dependencies"
```

---

### Task 2: Add basic formatting extensions + redesigned toolbar

**Files:**
- Modify: `packages/core/src/composed/rich-text-editor.tsx`

This is the largest task — it adds 6 extensions and redesigns the toolbar. No custom nodes yet.

**Step 1: Add extensions to editor**

Add these imports at the top:
```tsx
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'
```

Add to the `extensions` array in `useEditor`:
```tsx
Underline,
Highlight.configure({ multicolor: false }),
TaskList,
TaskItem.configure({ nested: true }),
TextAlign.configure({ types: ['heading', 'paragraph'] }),
```

**Step 2: Add new icon imports**

Add to the @tabler/icons-react import:
```tsx
IconUnderline,
IconHighlight,
IconBlockquote,
IconListCheck,
IconLink,
IconPhoto,
IconPaperclip,
IconLineDashed,
IconAlignLeft,
IconAlignCenter,
IconAlignRight,
IconMoodSmile,
```

**Step 3: Redesign Toolbar**

Replace the entire `Toolbar` function with the new grouped layout:

```tsx
function ToolbarDivider() {
  return <div className="mx-ds-02 h-[16px] w-px bg-border" />
}

function Toolbar({ editor, onImageClick, onFileClick, onEmojiClick }: {
  editor: Editor
  onImageClick?: () => void
  onFileClick?: () => void
  onEmojiClick?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-ds-01 border-b border-border px-ds-04 py-ds-02b">
      {/* Inline formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
        <IconBold className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
        <IconItalic className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
        <IconUnderline className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
        <IconStrikethrough className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
        <IconHighlight className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
        <IconH2 className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
        <IconH3 className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
        <IconBlockquote className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
        <IconList className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered list">
        <IconListNumbers className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task list">
        <IconListCheck className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code block">
        <IconCode className="h-ico-sm w-ico-sm" stroke={2.5} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Media & Links */}
      {onImageClick && (
        <ToolbarButton onClick={onImageClick} title="Insert image">
          <IconPhoto className="h-ico-sm w-ico-sm" stroke={2} />
        </ToolbarButton>
      )}
      {onFileClick && (
        <ToolbarButton onClick={onFileClick} title="Attach file">
          <IconPaperclip className="h-ico-sm w-ico-sm" stroke={2} />
        </ToolbarButton>
      )}
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <IconLineDashed className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align left">
        <IconAlignLeft className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align center">
        <IconAlignCenter className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align right">
        <IconAlignRight className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Emoji */}
      {onEmojiClick && (
        <ToolbarButton onClick={onEmojiClick} title="Emoji">
          <IconMoodSmile className="h-ico-sm w-ico-sm" stroke={2} />
        </ToolbarButton>
      )}

      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <IconArrowBackUp className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <IconArrowForwardUp className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
    </div>
  )
}
```

**Step 4: Add prose styles for new elements**

Add to the editor `attributes.class` string (and the viewer's matching string):
```tsx
// Blockquote
'[&_blockquote]:border-l-[3px] [&_blockquote]:border-interactive/30 [&_blockquote]:pl-ds-04 [&_blockquote]:italic [&_blockquote]:text-text-placeholder',
// Highlight
'[&_mark]:rounded-sm [&_mark]:bg-warning/20 [&_mark]:px-[2px]',
// Task list
'[&_ul[data-type="taskList"]]:ml-0 [&_ul[data-type="taskList"]]:list-none [&_li[data-type="taskItem"]]:flex [&_li[data-type="taskItem"]]:items-start [&_li[data-type="taskItem"]]:gap-ds-02',
// Horizontal rule
'[&_hr]:my-ds-04 [&_hr]:border-border',
```

**Step 5: Run typecheck**

Run: `pnpm typecheck`

**Step 6: Commit**

```bash
git add packages/core/src/composed/rich-text-editor.tsx
git commit -m "feat(composed): add underline, highlight, task list, text align, blockquote to RichTextEditor"
```

---

### Task 3: Add Link extension with inline edit popover

**Files:**
- Modify: `packages/core/src/composed/rich-text-editor.tsx`

**Step 1: Add link extension**

```tsx
import Link from '@tiptap/extension-link'
```

Add to extensions array:
```tsx
Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    rel: 'noopener noreferrer',
    target: '_blank',
  },
}),
```

**Step 2: Add link toolbar button**

The link button should toggle a URL input. Add a `LinkButton` component that wraps the toolbar button with a small popover for entering/editing a URL:

```tsx
function LinkButton({ editor }: { editor: Editor }) {
  const [showInput, setShowInput] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleToggle = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const previousUrl = editor.getAttributes('link').href || ''
    setUrl(previousUrl)
    setShowInput(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      editor.chain().focus().setLink({ href: url.trim() }).run()
    }
    setShowInput(false)
    setUrl('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowInput(false)
      setUrl('')
      editor.commands.focus()
    }
  }

  return (
    <div className="relative">
      <ToolbarButton onClick={handleToggle} isActive={editor.isActive('link')} title="Link">
        <IconLink className="h-ico-sm w-ico-sm" stroke={2} />
      </ToolbarButton>
      {showInput && (
        <form
          onSubmit={handleSubmit}
          className="absolute left-0 top-full z-dropdown mt-ds-01 flex items-center gap-ds-02 rounded-ds-md border border-border bg-layer-01 p-ds-02 shadow-02"
        >
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://..."
            className="h-ds-sm w-[240px] rounded-ds-sm border border-border bg-layer-01 px-ds-03 text-ds-sm text-text-primary focus:border-interactive focus:outline-none"
          />
          <button type="submit" className="h-ds-sm rounded-ds-sm bg-interactive px-ds-03 text-ds-sm text-text-on-color hover:bg-interactive/90">
            Apply
          </button>
        </form>
      )}
    </div>
  )
}
```

Replace the link `ToolbarButton` in the toolbar with `<LinkButton editor={editor} />`.

**Step 3: Add link prose styles**

```tsx
'[&_a]:text-interactive [&_a]:underline [&_a]:decoration-interactive/40 hover:[&_a]:decoration-interactive',
```

**Step 4: Commit**

```bash
git add packages/core/src/composed/rich-text-editor.tsx
git commit -m "feat(composed): add Link extension with inline URL edit popover"
```

---

### Task 4: Add Image extension with paste/drop/upload

**Files:**
- Modify: `packages/core/src/composed/rich-text-editor.tsx`

**Step 1: Add image extension**

```tsx
import Image from '@tiptap/extension-image'
```

Add to extensions array:
```tsx
Image.configure({
  allowBase64: true,
  HTMLAttributes: {
    class: 'max-w-full rounded-ds-md',
  },
}),
```

**Step 2: Add new props to RichTextEditorProps**

```tsx
export interface RichTextEditorProps {
  content?: string
  placeholder?: string
  onChange?: (html: string) => void
  className?: string
  editable?: boolean
  /** Called when an image is pasted/dropped. Return a URL. If not provided, images inline as base64. */
  onImageUpload?: (file: File) => Promise<string>
  /** Called when a non-image file is dropped/pasted. If not provided, non-image files are ignored. */
  onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
  /** Static list of mentionable items */
  mentions?: MentionItem[]
  /** Async mention search. Takes precedence over static list. */
  onMentionSearch?: (query: string) => Promise<MentionItem[]>
  /** Called when a mention is selected */
  onMentionSelect?: (item: MentionItem) => void
}

export interface MentionItem {
  id: string
  label: string
  avatar?: string
}
```

**Step 3: Handle image paste/drop**

Add to `editorProps` in `useEditor`:
```tsx
handleDrop: (view, event, _slice, moved) => {
  if (moved || !event.dataTransfer?.files.length) return false
  const file = event.dataTransfer.files[0]
  if (!file?.type.startsWith('image/')) return false
  handleImageFile(file, view, event.clientX, event.clientY)
  return true
},
handlePaste: (_view, event) => {
  const file = event.clipboardData?.files[0]
  if (!file?.type.startsWith('image/')) return false
  handleImageInsert(file)
  return true
},
```

Add the image handling functions inside the component:
```tsx
const handleImageInsert = React.useCallback(async (file: File) => {
  if (!editor) return
  if (onImageUpload) {
    const url = await onImageUpload(file)
    editor.chain().focus().setImage({ src: url }).run()
  } else {
    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run()
    }
    reader.readAsDataURL(file)
  }
}, [editor, onImageUpload])
```

**Step 4: Add toolbar image button logic**

Create a hidden file input ref and wire it:
```tsx
const imageInputRef = React.useRef<HTMLInputElement>(null)

// In the JSX, before the editor wrapper:
<input
  ref={imageInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) handleImageInsert(file)
    e.target.value = ''
  }}
/>
```

Pass `onImageClick={() => imageInputRef.current?.click()}` to the Toolbar.

**Step 5: Add image prose styles**

```tsx
'[&_img]:max-w-full [&_img]:rounded-ds-md [&_img]:my-ds-03',
```

**Step 6: Commit**

```bash
git add packages/core/src/composed/rich-text-editor.tsx
git commit -m "feat(composed): add Image extension with paste, drop, and upload support"
```

---

### Task 5: Create FileAttachment custom node

**Files:**
- Create: `packages/core/src/composed/extensions/file-attachment.tsx`
- Modify: `packages/core/src/composed/rich-text-editor.tsx`

**Step 1: Create the custom Tiptap node**

```tsx
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { IconFile, IconDownload } from '@tabler/icons-react'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileAttachmentView({ node }: { node: { attrs: { url: string; name: string; size: number } } }) {
  return (
    <NodeViewWrapper className="my-ds-02">
      <a
        href={node.attrs.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-ds-03 rounded-ds-md border border-border bg-layer-02 px-ds-04 py-ds-03 text-ds-sm text-text-primary transition-colors hover:border-border-strong hover:bg-layer-03"
        contentEditable={false}
      >
        <IconFile className="h-ico-sm w-ico-sm shrink-0 text-text-placeholder" />
        <span className="truncate">{node.attrs.name}</span>
        <span className="shrink-0 text-text-placeholder">({formatFileSize(node.attrs.size)})</span>
        <IconDownload className="h-ico-sm w-ico-sm shrink-0 text-text-placeholder" />
      </a>
    </NodeViewWrapper>
  )
}

export const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      name: { default: 'Untitled' },
      size: { default: 0 },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-file-attachment]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-file-attachment': '' }, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView)
  },
})
```

**Step 2: Wire into the editor**

Import and add to extensions. Add file handling similar to image:

```tsx
const handleFileInsert = React.useCallback(async (file: File) => {
  if (!editor || !onFileUpload) return
  const result = await onFileUpload(file)
  editor.chain().focus().insertContent({
    type: 'fileAttachment',
    attrs: { url: result.url, name: result.name, size: result.size },
  }).run()
}, [editor, onFileUpload])
```

Add a hidden file input for the toolbar attach button (any file type).

Update the `handleDrop` to check for non-image files and call `handleFileInsert`.

**Step 3: Commit**

```bash
git add packages/core/src/composed/extensions/file-attachment.tsx packages/core/src/composed/rich-text-editor.tsx
git commit -m "feat(composed): add FileAttachment custom node for non-image file uploads"
```

---

### Task 6: Add Mention extension with autocomplete dropdown

**Files:**
- Create: `packages/core/src/composed/extensions/mention-suggestion.tsx`
- Modify: `packages/core/src/composed/rich-text-editor.tsx`

**Step 1: Create mention suggestion component**

The suggestion renderer shows a dropdown when user types `@`:

```tsx
import { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'

export interface MentionItem {
  id: string
  label: string
  avatar?: string
}

interface MentionListProps {
  items: MentionItem[]
  command: (item: MentionItem) => void
}

const MentionList = React.forwardRef<{ onKeyDown: (props: SuggestionKeyDownProps) => boolean }, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    React.useEffect(() => setSelectedIndex(0), [items])

    React.useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          if (items[selectedIndex]) command(items[selectedIndex])
          return true
        }
        return false
      },
    }))

    if (!items.length) return null

    return (
      <div className="z-dropdown overflow-hidden rounded-ds-md border border-border bg-layer-01 shadow-02">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => command(item)}
            className={cn(
              'flex w-full items-center gap-ds-03 px-ds-04 py-ds-02b text-left text-ds-sm',
              index === selectedIndex ? 'bg-layer-02 text-text-primary' : 'text-text-secondary hover:bg-layer-02',
            )}
          >
            {item.avatar ? (
              <img src={item.avatar} alt="" className="h-ico-md w-ico-md rounded-ds-full" />
            ) : (
              <span className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-full bg-interactive/10 text-[10px] font-semibold text-interactive">
                {item.label.charAt(0).toUpperCase()}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    )
  },
)
```

Also export a `createSuggestionRenderer` function that returns the Tiptap suggestion `render()` object using `createRoot` for the dropdown DOM management.

**Step 2: Configure Mention extension**

```tsx
import Mention from '@tiptap/extension-mention'

// In extensions array:
...(mentions || onMentionSearch ? [
  Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion: {
      items: async ({ query }: { query: string }) => {
        if (onMentionSearch) return await onMentionSearch(query)
        if (mentions) return mentions.filter(m => m.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
        return []
      },
      render: createSuggestionRenderer(),
    },
  }),
] : []),
```

**Step 3: Add mention prose styles**

```tsx
'[&_.mention]:rounded-ds-sm [&_.mention]:bg-interactive/10 [&_.mention]:px-ds-02 [&_.mention]:py-[1px] [&_.mention]:font-medium [&_.mention]:text-interactive',
```

**Step 4: Commit**

```bash
git add packages/core/src/composed/extensions/mention-suggestion.tsx packages/core/src/composed/rich-text-editor.tsx
git commit -m "feat(composed): add Mention extension with autocomplete dropdown"
```

---

### Task 7: Add Emoji support (emoji-mart + inline shortcode)

**Files:**
- Create: `packages/core/src/composed/extensions/emoji-suggestion.tsx`
- Modify: `packages/core/src/composed/rich-text-editor.tsx`

**Step 1: Create emoji shortcode suggestion**

Similar to mentions, but triggered by `:` character. Uses emoji-mart data for the lookup:

```tsx
import data from '@emoji-mart/data'

// Build shortcode → emoji map from emoji-mart data
// Filter emoji list by shortcode matching the query after ':'
// Render suggestion dropdown with emoji character + shortcode name
// On select, insert the native Unicode emoji character
```

**Step 2: Add emoji-mart picker popover**

In the editor component, add an emoji picker popover triggered by the toolbar button:

```tsx
import Picker from '@emoji-mart/react'
import emojiData from '@emoji-mart/data'

// State:
const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
const emojiButtonRef = React.useRef<HTMLDivElement>(null)

// In JSX (near the toolbar):
{showEmojiPicker && (
  <div className="absolute right-0 top-full z-dropdown" ref={emojiPickerRef}>
    <Picker
      data={emojiData}
      onEmojiSelect={(emoji: { native: string }) => {
        editor.chain().focus().insertContent(emoji.native).run()
        setShowEmojiPicker(false)
      }}
      theme="light"
      previewPosition="none"
      skinTonePosition="none"
    />
  </div>
)}
```

Pass `onEmojiClick={() => setShowEmojiPicker(prev => !prev)}` to the Toolbar.

**Step 3: Add click-outside to close picker**

Use a simple `useEffect` with `mousedown` listener to close when clicking outside.

**Step 4: Commit**

```bash
git add packages/core/src/composed/extensions/emoji-suggestion.tsx packages/core/src/composed/rich-text-editor.tsx
git commit -m "feat(composed): add emoji picker and :shortcode: inline suggestions"
```

---

### Task 8: Update RichTextViewer

**Files:**
- Modify: `packages/core/src/composed/rich-text-editor.tsx`

**Step 1: Add all new extensions to the viewer**

The viewer needs the same extensions (except Placeholder) for proper rendering. Add to the viewer's `useEditor`:

```tsx
extensions: [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  Underline,
  Highlight,
  TaskList,
  TaskItem,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Link.configure({ openOnClick: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
  Image.configure({ allowBase64: true, HTMLAttributes: { class: 'max-w-full rounded-ds-md' } }),
  FileAttachment,
  ...(hasMentionContent ? [Mention] : []),
],
```

Note: Link in the viewer has `openOnClick: true` (unlike the editor where it's `false`).

**Step 2: Add all new prose styles**

Copy the same prose class additions (blockquote, highlight, task list, link, image, mention, hr) to the viewer's `attributes.class` string.

**Step 3: Commit**

```bash
git add packages/core/src/composed/rich-text-editor.tsx
git commit -m "feat(composed): update RichTextViewer with all new content type styles"
```

---

### Task 9: Update exports

**Files:**
- Modify: `packages/core/src/composed/index.ts`

**Step 1: Export the MentionItem type**

Update the RichTextEditor export line:
```tsx
export { RichTextEditor, RichTextViewer } from './rich-text-editor'
export type { RichTextEditorProps, RichTextViewerProps, MentionItem } from './rich-text-editor'
```

**Step 2: Commit**

```bash
git add packages/core/src/composed/index.ts
git commit -m "feat(composed): export MentionItem type from rich-text-editor"
```

---

### Task 10: Update stories

**Files:**
- Modify: `packages/core/src/composed/rich-text-editor.stories.tsx`

Add new stories demonstrating:
- **WithAllFormatting** — content with underline, highlight, blockquote, task list, alignment, HR
- **WithImage** — image in content
- **WithFileAttachment** — file attachment node in content
- **WithMentions** — editor with static mentions list
- **WithEmojiPicker** — editor with emoji
- **WithImageUpload** — editor with onImageUpload callback (action logger)
- **FullFeatured** — all features enabled (mentions, upload, emoji)
- **ViewerFullContent** — viewer rendering all content types

**Commit:**
```bash
git add packages/core/src/composed/rich-text-editor.stories.tsx
git commit -m "docs(composed): add stories for all new RichTextEditor features"
```

---

### Task 11: Update llms.txt and llms-full.txt

**Files:**
- Modify: `packages/core/llms.txt`
- Modify: `packages/core/llms-full.txt`

Update the RichTextEditor section with all new props and features. Update the RichTextViewer section to note it renders all new content types.

**Commit:**
```bash
git add packages/core/llms.txt packages/core/llms-full.txt
git commit -m "docs: update llms.txt with RichTextEditor enhancement details"
```

---

### Task 12: Full verification

**Step 1:** `pnpm typecheck`
**Step 2:** `pnpm lint`
**Step 3:** `pnpm test`
**Step 4:** `pnpm build`

Fix any issues, commit if needed.
