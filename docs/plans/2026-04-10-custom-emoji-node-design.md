# Custom Emoji Node Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace plain-text Unicode emoji insertion with a custom TipTap `emoji` inline node that renders using the selected emoji set's spritesheet images, ensuring visual consistency across picker, autocomplete, and editor.

**Architecture:** A new TipTap `Node` (inline, atom) stores `{ id, native, set }`. It renders via `ReactNodeViewRenderer` as a spritesheet-backed `<span>` in the editor. All 4 emoji insertion points (picker in RichChatInput, picker in RichTextEditor, `:shortcode:` autocomplete, standalone EmojiPicker) are updated to insert this node instead of raw Unicode. The emoji suggestion dropdown also renders spritesheet images instead of native glyphs.

**Tech Stack:** TipTap/ProseMirror custom node, React, emoji-mart data (spritesheet x/y coordinates), Tailwind CSS

---

## Context for Implementer

### Spritesheet Rendering Formula

emoji-mart's spritesheet URL pattern (version-locked):
```
https://cdn.jsdelivr.net/npm/emoji-datasource-${set}@15.0.1/img/${set}/sheets-256/64.png
```

CSS background positioning (from emoji-mart source line 1256):
```css
background-image: url(${spritesheetSrc});
background-size: ${100 * sheet.cols}% ${100 * sheet.rows}%;
background-position: ${100 / (sheet.cols - 1) * x}% ${100 / (sheet.rows - 1) * y}%;
```

Where `sheet = { cols: 61, rows: 61 }` and `x`/`y` come from the set-specific data file (e.g. `@emoji-mart/data/sets/15/apple.json`).

### Emoji Data Structure (set-specific)

```json
{
  "id": "grinning",
  "name": "Grinning Face",
  "skins": [{ "unified": "1f600", "native": "😀", "x": 32, "y": 21 }]
}
```

### Key Files

- **Reference node pattern:** `packages/core/src/composed/extensions/file-attachment.tsx` — existing custom TipTap node using `ReactNodeViewRenderer`
- **Emoji data loaders:** `packages/core/src/composed/emoji-picker.tsx` — `emojiDataLoaders` map, `EmojiSet` type
- **Emoji type declarations:** `packages/core/src/composed/extensions/emoji-mart.d.ts`
- **Emoji autocomplete:** `packages/core/src/composed/extensions/emoji-suggestion.tsx`
- **RichChatInput emoji insertion:** `packages/core/src/composed/rich-chat-input.tsx:853-856`
- **RichTextEditor emoji insertion:** `packages/core/src/composed/rich-text-editor.tsx:607-612`
- **RichTextEditor extension registration:** `packages/core/src/composed/rich-text-editor.tsx:470-519`
- **RichChatInput extension registration:** `packages/core/src/composed/rich-chat-input.tsx:450-520`

---

## Task 1: Create the `EmojiNode` TipTap Extension

**Files:**
- Create: `packages/core/src/composed/extensions/emoji-node.tsx`

**Step 1: Create the emoji node extension**

This is an **inline atom node** (not block like FileAttachment). It stores the emoji ID, native character (for plain text fallback and clipboard), and set name.

```tsx
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'

// Spritesheet URL pattern from emoji-mart (version-locked)
const SPRITESHEET_URL = (set: string) =>
  `https://cdn.jsdelivr.net/npm/emoji-datasource-${set}@15.0.1/img/${set}/sheets-256/64.png`

// Sheet dimensions for emoji-mart v15 data
const SHEET_COLS = 61
const SHEET_ROWS = 61

export interface EmojiNodeAttrs {
  id: string
  native: string
  set: string
  x: number
  y: number
}

function EmojiNodeView({ node }: NodeViewProps) {
  const { native, set, x, y } = node.attrs as EmojiNodeAttrs

  if (set === 'native') {
    return (
      <NodeViewWrapper as="span" className="inline align-baseline">
        <span>{native}</span>
      </NodeViewWrapper>
    )
  }

  const bgSize = `${100 * SHEET_COLS}% ${100 * SHEET_ROWS}%`
  const bgPos = `${(100 / (SHEET_COLS - 1)) * x}% ${(100 / (SHEET_ROWS - 1)) * y}%`

  return (
    <NodeViewWrapper as="span" className="inline align-baseline">
      <span
        role="img"
        aria-label={native}
        className="inline-block h-[1.2em] w-[1.2em] align-text-bottom"
        style={{
          backgroundImage: `url(${SPRITESHEET_URL(set)})`,
          backgroundSize: bgSize,
          backgroundPosition: bgPos,
        }}
      />
    </NodeViewWrapper>
  )
}

export const EmojiNode = Node.create({
  name: 'emojiNode',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      id: { default: null },
      native: { default: null },
      set: { default: 'native' },
      x: { default: 0 },
      y: { default: 0 },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-emoji-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    // For getHTML(): render a <span> with data attributes + native char as text content
    const attrs = mergeAttributes(
      {
        'data-emoji-id': HTMLAttributes.id,
        'data-emoji-set': HTMLAttributes.set,
        'role': 'img',
        'aria-label': HTMLAttributes.native,
      },
      {},
    )
    return ['span', attrs, HTMLAttributes.native ?? '']
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmojiNodeView)
  },
})
```

**Key design decisions:**
- `inline: true` + `group: 'inline'` — emoji flow with text, not as blocks
- `atom: true` — cannot place cursor inside the emoji
- `selectable: false` — arrow keys skip over it naturally
- `renderHTML` outputs `<span data-emoji-id="grinning" data-emoji-set="apple" role="img" aria-label="😀">😀</span>` — the native char is text content for clipboard/plain-text fallback
- `parseHTML` matches `span[data-emoji-id]` so pasted emoji HTML round-trips

**Step 2: Commit**

```
feat(emoji-node): create inline TipTap node with spritesheet rendering
```

---

## Task 2: Create the Emoji Data Lookup Utility

**Files:**
- Create: `packages/core/src/composed/extensions/emoji-data.ts`

Both the emoji picker insertion and the `:shortcode:` autocomplete need to look up an emoji by ID and get its `{ id, native, x, y }` for the current set. This utility loads the set-specific data once and provides a lookup function.

**Step 1: Create the emoji data module**

```ts
import { emojiDataLoaders } from '../emoji-picker'

interface EmojiSkin {
  unified: string
  native: string
  x?: number
  y?: number
}

interface EmojiEntry {
  id: string
  name: string
  keywords?: string[]
  skins: EmojiSkin[]
}

interface EmojiDataset {
  emojis: Record<string, EmojiEntry>
  sheet?: { cols: number; rows: number }
}

export interface ResolvedEmoji {
  id: string
  native: string
  x: number
  y: number
}

let cachedSet: string | null = null
let cachedData: EmojiDataset | null = null

export async function loadEmojiData(set: string): Promise<EmojiDataset> {
  if (cachedSet === set && cachedData) return cachedData
  const loader = emojiDataLoaders[set] ?? emojiDataLoaders.native
  const mod = await loader()
  cachedData = (mod.default ?? mod) as EmojiDataset
  cachedSet = set
  return cachedData
}

export function lookupEmoji(data: EmojiDataset, id: string): ResolvedEmoji | null {
  const entry = data.emojis[id]
  if (!entry) return null
  const skin = entry.skins[0]
  if (!skin) return null
  return {
    id: entry.id,
    native: skin.native,
    x: skin.x ?? 0,
    y: skin.y ?? 0,
  }
}

/** Search emoji by query (for autocomplete). Returns up to `limit` matches. */
export function searchEmoji(
  data: EmojiDataset,
  query: string,
  limit = 8,
): ResolvedEmoji[] {
  if (!query) {
    return Object.values(data.emojis)
      .slice(0, limit)
      .map((e) => ({
        id: e.id,
        name: e.name,
        native: e.skins[0]?.native ?? '',
        x: e.skins[0]?.x ?? 0,
        y: e.skins[0]?.y ?? 0,
      }))
  }
  const q = query.toLowerCase()
  const results: ResolvedEmoji[] = []
  for (const e of Object.values(data.emojis)) {
    if (results.length >= limit) break
    if (
      e.id.includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.keywords?.some((k) => k.includes(q))
    ) {
      results.push({
        id: e.id,
        native: e.skins[0]?.native ?? '',
        x: e.skins[0]?.x ?? 0,
        y: e.skins[0]?.y ?? 0,
      })
    }
  }
  return results
}
```

**Step 2: Commit**

```
feat(emoji-data): add shared emoji lookup + search utility for set-aware rendering
```

---

## Task 3: Update Emoji Suggestion Extension

**Files:**
- Modify: `packages/core/src/composed/extensions/emoji-suggestion.tsx`

The autocomplete needs two changes:
1. Use `searchEmoji()` from the new utility (instead of its own data loading)
2. Render spritesheet images in the dropdown (instead of `item.native`)
3. Insert an `emojiNode` instead of a plain Unicode character

The extension needs to know which `set` is active. We'll pass it via TipTap extension storage.

**Step 1: Rewrite emoji-suggestion.tsx**

```tsx
import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import { PluginKey } from 'prosemirror-state'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { cn } from '../../ui/lib/utils'
import { type ResolvedEmoji, loadEmojiData, searchEmoji } from './emoji-data'

// Spritesheet rendering constants (same as emoji-node.tsx)
const SPRITESHEET_URL = (set: string) =>
  `https://cdn.jsdelivr.net/npm/emoji-datasource-${set}@15.0.1/img/${set}/sheets-256/64.png`
const SHEET_COLS = 61
const SHEET_ROWS = 61

function EmojiImage({ emoji, set, size = '1.2em' }: { emoji: ResolvedEmoji; set: string; size?: string }) {
  if (set === 'native') {
    return <span style={{ fontSize: size }}>{emoji.native}</span>
  }
  return (
    <span
      role="img"
      aria-label={emoji.native}
      className="inline-block"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${SPRITESHEET_URL(set)})`,
        backgroundSize: `${100 * SHEET_COLS}% ${100 * SHEET_ROWS}%`,
        backgroundPosition: `${(100 / (SHEET_COLS - 1)) * emoji.x}% ${(100 / (SHEET_ROWS - 1)) * emoji.y}%`,
      }}
    />
  )
}

// Re-export for use in stories/tests
export type { ResolvedEmoji as EmojiSuggestionItem }

interface EmojiListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

interface EmojiListProps {
  items: ResolvedEmoji[]
  set: string
  command: (item: ResolvedEmoji) => void
}

const EmojiList = React.forwardRef<EmojiListRef, EmojiListProps>(
  ({ items, set, command }, ref) => {
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
      <div role="listbox" aria-label="Emoji suggestions" className="z-popover max-h-[200px] overflow-x-hidden overflow-y-auto rounded-ds-md border border-surface-border-strong bg-surface-overlay shadow-raised-hover">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            onClick={() => command(item)}
            className={cn(
              'flex w-full items-center gap-ds-03 px-ds-04 py-ds-02b text-left text-ds-sm',
              index === selectedIndex ? 'bg-surface-raised text-surface-fg' : 'text-surface-fg-muted hover:bg-surface-raised',
            )}
          >
            <EmojiImage emoji={item} set={set} size="1.25em" />
            <span className="truncate">:{item.id}:</span>
          </button>
        ))}
      </div>
    )
  },
)
EmojiList.displayName = 'EmojiList'

function createEmojiSuggestionRenderer(set: string) {
  return () => {
    let root: Root | null = null
    let container: HTMLDivElement | null = null
    let componentRef: EmojiListRef | null = null

    return {
      onStart: (props: SuggestionProps<ResolvedEmoji>) => {
        container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.zIndex = '1400'
        const rect = props.clientRect?.()
        if (rect) {
          container.style.left = `${rect.left}px`
          container.style.top = `${rect.bottom + 4}px`
        }
        document.body.appendChild(container)
        root = createRoot(container)
        root.render(
          <EmojiList
            ref={(r) => { componentRef = r }}
            items={props.items as ResolvedEmoji[]}
            set={set}
            command={(item) => props.command(item)}
          />,
        )
      },
      onUpdate: (props: SuggestionProps<ResolvedEmoji>) => {
        if (!root || !container) return
        const rect = props.clientRect?.()
        if (rect) {
          container.style.left = `${rect.left}px`
          container.style.top = `${rect.bottom + 4}px`
        }
        root.render(
          <EmojiList
            ref={(r) => { componentRef = r }}
            items={props.items as ResolvedEmoji[]}
            set={set}
            command={(item) => props.command(item)}
          />,
        )
      },
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === 'Escape') {
          if (container) {
            root?.unmount()
            container.remove()
            container = null
            root = null
          }
          return true
        }
        return componentRef?.onKeyDown(props) ?? false
      },
      onExit: () => {
        if (container) {
          root?.unmount()
          container.remove()
          container = null
          root = null
        }
      },
    }
  }
}

/** Factory: call with the emoji set to get a configured extension. */
export function createEmojiSuggestion(set = 'native') {
  return Extension.create({
    name: 'emojiSuggestion',

    addProseMirrorPlugins() {
      return [
        Suggestion({
          pluginKey: new PluginKey('emojiSuggestion'),
          editor: this.editor,
          char: ':',
          items: async ({ query }) => {
            const data = await loadEmojiData(set)
            return searchEmoji(data, query, 8)
          },
          command: ({ editor, range, props: item }) => {
            const emoji = item as ResolvedEmoji
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({
                type: 'emojiNode',
                attrs: { id: emoji.id, native: emoji.native, set, x: emoji.x, y: emoji.y },
              })
              .run()
          },
          render: createEmojiSuggestionRenderer(set),
        }),
      ]
    },
  })
}

// Backwards-compatible default export (native set)
export const EmojiSuggestion = createEmojiSuggestion('native')
```

**Key changes from original:**
- `EmojiSuggestion` is now a factory: `createEmojiSuggestion(set)` — returns a configured extension
- Dropdown renders `EmojiImage` (spritesheet) instead of `item.native`
- `command` inserts `{ type: 'emojiNode', attrs: {...} }` instead of raw Unicode
- Data loading uses shared `loadEmojiData()` / `searchEmoji()`
- Default export `EmojiSuggestion` preserved for backwards compat (uses 'native')

**Step 2: Commit**

```
feat(emoji-suggestion): render spritesheet images, insert emojiNode instead of Unicode
```

---

## Task 4: Update RichChatInput to Use EmojiNode

**Files:**
- Modify: `packages/core/src/composed/rich-chat-input.tsx`

Three changes:
1. Register `EmojiNode` in the extensions array
2. Use `createEmojiSuggestion(emojiSet)` instead of `EmojiSuggestion`
3. Emoji picker `onSelect` inserts an `emojiNode` instead of raw Unicode

**Step 1: Add imports**

At the top of the file, add:
```ts
import { EmojiNode } from './extensions/emoji-node'
import { createEmojiSuggestion } from './extensions/emoji-suggestion'
import { loadEmojiData, lookupEmoji } from './extensions/emoji-data'
```

Remove the old import:
```ts
// Remove this line:
import { EmojiSuggestion } from './extensions/emoji-suggestion'
```

**Step 2: Update extensions array (~line 467)**

Replace:
```ts
EmojiSuggestion,
```

With:
```ts
EmojiNode,
createEmojiSuggestion(emojiSet),
```

Note: `emojiSet` must be added to the `useMemo` deps array.

**Step 3: Update emoji picker onSelect (~line 853)**

Replace:
```ts
onSelect={(native) => {
  editor.chain().focus().insertContent(native).run()
  setShowEmojiPicker(false)
}}
```

With:
```ts
onSelect={async (native) => {
  const data = await loadEmojiData(emojiSet)
  // Find emoji entry by native character
  const entry = Object.values(data.emojis).find(
    (e: any) => e.skins[0]?.native === native,
  ) as any
  if (entry) {
    const skin = entry.skins[0]
    editor.chain().focus().insertContent({
      type: 'emojiNode',
      attrs: { id: entry.id, native: skin.native, set: emojiSet, x: skin.x ?? 0, y: skin.y ?? 0 },
    }).run()
  } else {
    // Fallback: insert as plain text if lookup fails
    editor.chain().focus().insertContent(native).run()
  }
  setShowEmojiPicker(false)
}}
```

**Step 4: Commit**

```
feat(rich-chat-input): use emojiNode for picker and autocomplete insertion
```

---

## Task 5: Update RichTextEditor to Use EmojiNode

**Files:**
- Modify: `packages/core/src/composed/rich-text-editor.tsx`

Same pattern as RichChatInput. The RichTextEditor needs a new `emojiSet` prop.

**Step 1: Add `emojiSet` prop to RichTextEditorProps**

Find the props interface and add:
```ts
/** Emoji art style. @default 'native' */
emojiSet?: EmojiSet
```

Import `EmojiSet` from `./emoji-picker`.

**Step 2: Add imports**

```ts
import { EmojiNode } from './extensions/emoji-node'
import { createEmojiSuggestion } from './extensions/emoji-suggestion'
import { loadEmojiData } from './extensions/emoji-data'
import type { EmojiSet } from './emoji-picker'
```

Remove the old `EmojiSuggestion` import.

**Step 3: Update extensions array (~line 470-519)**

Replace:
```ts
EmojiSuggestion,
```

With:
```ts
EmojiNode,
createEmojiSuggestion(emojiSet),
```

Add `emojiSet` to the `useMemo` deps.

**Step 4: Update EmojiPickerLazy onSelect (~line 607)**

Same pattern as RichChatInput — look up the emoji by native character and insert as `emojiNode`. The `EmojiPickerLazy` component also needs the `set` prop passed through.

**Step 5: Commit**

```
feat(rich-text-editor): use emojiNode for picker and autocomplete insertion
```

---

## Task 6: Update Standalone EmojiPicker onSelect

**Files:**
- Modify: `packages/core/src/composed/emoji-picker.tsx`

The standalone `EmojiPicker` fires `onSelect` with `EmojiData { id, native, shortcodes }`. The consumer is responsible for inserting into their editor. We should add `x`, `y`, and `set` to `EmojiData` so consumers have everything they need to create an `emojiNode`.

**Step 1: Extend EmojiData type**

```ts
export interface EmojiData {
  id: string
  native: string
  shortcodes?: string
  set?: string
  x?: number
  y?: number
}
```

This is non-breaking — the new fields are optional.

**Step 2: Commit**

```
feat(emoji-picker): include set, x, y in EmojiData for spritesheet rendering
```

---

## Task 7: Export EmojiNode and Update Barrels

**Files:**
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/src/composed/extensions/emoji-mart.d.ts` (if needed)

**Step 1: Add exports to composed barrel**

```ts
export { EmojiNode, type EmojiNodeAttrs } from './extensions/emoji-node'
export { createEmojiSuggestion } from './extensions/emoji-suggestion'
```

**Step 2: Commit**

```
feat: export EmojiNode and createEmojiSuggestion from composed barrel
```

---

## Task 8: Update Stories

**Files:**
- Modify: `packages/core/src/composed/emoji-picker.stories.tsx` — verify set stories still work
- Modify: `packages/core/src/composed/rich-chat-input.stories.tsx` — verify emoji insertion renders as spritesheet

No new stories needed — existing ones should just work since the node renders visually. Manual verification in Storybook:

1. Open RichChatInput Default story → type `:grin` → autocomplete should show native emoji
2. Open RichChatInput with `emojiSet="apple"` → type `:grin` → dropdown should show Apple spritesheet images
3. Pick an emoji from the picker → should render as spritesheet image in editor
4. Pick from autocomplete → should render as spritesheet image in editor

**Step 1: Commit any story adjustments**

```
test(stories): verify emoji node rendering in RichChatInput stories
```

---

## Task 9: Typecheck, Lint, Test

**Step 1: Run typecheck**

```bash
pnpm typecheck
```

Fix any type errors.

**Step 2: Run lint**

```bash
pnpm lint
```

Fix any lint errors.

**Step 3: Run tests**

```bash
pnpm test
```

Fix any test failures. The existing RichTextEditor and RichChatInput tests should still pass — the emoji node renders as a `<span>` which shouldn't break accessibility or rendering tests.

**Step 4: Commit fixes**

```
fix: resolve typecheck/lint/test issues from emoji node migration
```

---

## Execution Order

```
Task 1 (EmojiNode extension) — no deps
Task 2 (emoji-data utility) — no deps
Task 3 (emoji-suggestion rewrite) — depends on Task 1 + 2
Task 4 (RichChatInput) — depends on Task 1 + 2 + 3
Task 5 (RichTextEditor) — depends on Task 1 + 2 + 3
Task 6 (EmojiPicker type) — independent
Task 7 (barrel exports) — depends on Task 1 + 3
Task 8 (stories) — depends on Task 4 + 5
Task 9 (typecheck/lint/test) — depends on all
```

Tasks 1+2 can run in parallel. Tasks 4+5+6 can run in parallel. Task 9 is the final gate.
