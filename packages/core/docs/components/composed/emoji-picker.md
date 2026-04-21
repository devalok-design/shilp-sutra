# EmojiPicker

- Import: @devalok/shilp-sutra/composed/emoji-picker
- Server-safe: No
- Category: composed

## Exports
EmojiPicker, EmojiPickerPopover

## Props

### EmojiPicker
    onSelect: (emoji: EmojiData) => void
    theme: "auto" | "light" | "dark"
    previewPosition: "top" | "bottom" | "none"
    skinTonePosition: "search" | "preview" | "none"
    className: string

### EmojiPickerPopover (extends EmojiPicker props)
    children: ReactNode (trigger element)
    align: "start" | "center" | "end"

### EmojiData
    id: string
    native: string (the emoji character)
    shortcodes: string

## Defaults
    theme="auto", previewPosition="none", skinTonePosition="search", align="start"

## Example
```jsx
<EmojiPickerPopover onSelect={(emoji) => insertEmoji(emoji.native)}>
  <Button variant="ghost" size="icon-sm">😀</Button>
</EmojiPickerPopover>

<EmojiPicker onSelect={handleEmoji} theme="dark" />
```

## Composability
- **Two exports:** `EmojiPicker` (inline grid, no trigger) and `EmojiPickerPopover` (trigger + popover wrapper). Use EmojiPickerPopover 95% of the time — trigger-on-click is the standard UX.
- **Wraps @emoji-mart/react**, lazy-loaded with a Skeleton placeholder while the ~200KB bundle fetches. Don't pre-import unless you need it eagerly.
- **Trigger composition:** EmojiPickerPopover's `children` is the trigger — wrap any Button/IconButton. Typical pairing is an icon-only IconButton with a 😀 label.
- **TipTap integration:** Use `createEmojiSuggestion(set?)` factory to create a TipTap suggestion plugin that opens the picker on typing `:emoji`. Works with RichChatInput and RichTextEditor.
- **Theme matching:** `theme="auto"` reads the `.dark` class on `<html>` — matches the DS dark mode toggle automatically. Override with explicit light/dark.
- **Emoji sets:** Pass `set="apple" | "google" | ...` for consistent cross-platform emoji art (defaults to native OS glyphs).

## Gotchas
- Wraps `@emoji-mart/react` which is lazy-loaded — shows a Skeleton placeholder while loading
- `theme="auto"` reads the `.dark` class on `<html>` to pick light/dark
- EmojiPickerPopover auto-closes after selection

## Changes

### v0.33.0
- **Added** `set` prop on EmojiPicker and EmojiPickerPopover — `EmojiSet` type: 'native' | 'apple' | 'google' | 'twitter' | 'facebook'
- **Added** `EmojiNode` TipTap extension — inline atom node with spritesheet rendering for consistent emoji art styles
- **Added** `createEmojiSuggestion(set?)` factory — replaces `EmojiSuggestion` named export
- **Added** `EmojiSet` type exported from barrel
- **Breaking** `EmojiSuggestion` named export removed — use `createEmojiSuggestion()` factory
