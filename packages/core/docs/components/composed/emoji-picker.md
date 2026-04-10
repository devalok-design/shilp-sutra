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
