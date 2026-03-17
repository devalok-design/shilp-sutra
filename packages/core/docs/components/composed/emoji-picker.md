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
