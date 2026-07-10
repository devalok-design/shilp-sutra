# EmojiPicker

- Import: @devalok/shilp-sutra/composed/emoji-picker
- Server-safe: No
- Category: composed

## Exports
EmojiPicker, EmojiPickerPopover

## Props

### EmojiPicker
    onSelect: (emoji: EmojiData) => void
    emojibaseUrl: string (base URL for the emoji dataset; default = frimousse's jsdelivr CDN)
    className: string

### EmojiPickerPopover (extends EmojiPicker props)
    children: ReactNode (trigger element)
    align: "start" | "center" | "end"

### EmojiData
    id: string
    native: string (the emoji character)
    shortcodes: string

## Defaults
    align="start"

## Example
```jsx
<EmojiPickerPopover onSelect={(emoji) => insertEmoji(emoji.native)}>
  <Button variant="ghost" size="icon-sm">😀</Button>
</EmojiPickerPopover>

<EmojiPicker onSelect={handleEmoji} />
```

## Composability
- **Two exports:** `EmojiPicker` (inline grid, no trigger) and `EmojiPickerPopover` (trigger + popover wrapper). Use EmojiPickerPopover 95% of the time — trigger-on-click is the standard UX.
- **Built on frimousse**, bundled and lazy-loaded (own `emoji` chunk, incl. the dataset). Needs no consumer peer install and no React-19 peer workaround. Don't pre-import unless you need it eagerly.
- **Native emoji only.** Each platform renders its own glyphs. Theme follows the surrounding `.dark` class via DS tokens automatically — no theme prop.
- **Built-in footer:** a live preview of the hovered/active emoji (frimousse `ActiveEmoji`) plus a skin-tone selector (`SkinToneSelector`) — no props needed.
- **Dataset source / CSP:** frimousse fetches the emoji dataset from jsdelivr at runtime. To remove the CDN dependency (strict CSP, offline, air-gapped), copy `node_modules/emojibase-data` into your app's `public/emojibase` and pass `emojibaseUrl="/emojibase"`.
- **Trigger composition:** EmojiPickerPopover's `children` is the trigger — wrap any Button/IconButton. Typical pairing is an icon-only IconButton with a 😀 label.
- **TipTap integration:** Use `createEmojiSuggestion()` (from `./extensions/emoji-suggestion`) to open a `:shortcode:` suggestion list. Works with RichChatInput and RichTextEditor.

## Gotchas
- Client-only (fetches its emoji dataset on first open) — not server-safe.
- EmojiPickerPopover auto-closes after selection.
- The `set` / `theme` / `previewPosition` / `skinTonePosition` props are deprecated no-ops kept for source compatibility; the picker is native-only.

## Changes

### v-next
- **Breaking** picker migrated from `@emoji-mart/react` to `frimousse` — native emoji only. Art-style sets (apple/google/twitter/facebook) removed; `set`/`theme`/`previewPosition`/`skinTonePosition` are now no-ops.
- **Breaking** `emojiDataLoaders` export removed; `EmojiNodeAttrs` narrowed to `{ id, native }`; `createEmojiSuggestion()` takes no argument; `EmojiSuggestionItem` no longer has `x`/`y`.
- **Changed** frimousse + `@emoji-mart/data` are now bundled (lazy `emoji` chunk) — the emoji feature needs zero consumer peer installs.
- **Added** built-in footer: active-emoji preview + skin-tone selector. New `emojibaseUrl` prop to self-host the dataset (remove the runtime CDN dependency).

### v0.33.0
- **Added** `EmojiNode` TipTap extension and `createEmojiSuggestion()` factory.
- **Breaking** `EmojiSuggestion` named export removed — use `createEmojiSuggestion()` factory.
