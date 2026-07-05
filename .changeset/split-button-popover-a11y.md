---
"@devalok/shilp-sutra": patch
---

SplitButton: the dropdown is now keyboard-accessible. It previously rendered a hand-rolled floating panel (`role="menu"`, positioned with `@floating-ui/dom`) that had no focus management, no arrow/Escape handling, and no focus return — keyboard and screen-reader users couldn't operate it (a broken ARIA contract). It now composes the DS **Popover** primitive: focus moves into the panel on open, Escape and outside-click dismiss, focus returns to the trigger, and on mobile it opens as a bottom sheet. The `dropdownContent` / `open` / `onOpenChange` / `placement` API is unchanged (the trigger now reports `aria-haspopup="dialog"`). Full menu semantics with arrow-key item navigation (via DropdownMenu) are planned for 0.45.0.
