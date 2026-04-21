# Popover

- Import: @devalok/shilp-sutra/ui/popover
- Server-safe: No
- Category: ui

## Compound Components
    Popover (root)
      PopoverTrigger
      PopoverContent
      PopoverAnchor (optional anchor point)

## Example
```jsx
<Popover>
  <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
  <PopoverContent>Content here</PopoverContent>
</Popover>
```

## Composability
- Built on Radix Popover — accepts `open`, `onOpenChange`, `defaultOpen`, `modal`.
- **Trigger:** `<PopoverTrigger asChild>` wraps any focusable element.
- **PopoverAnchor:** Optional — decouples the visual anchor from the interactive trigger. Useful when the trigger is small (e.g. an icon button) but you want the popover to position relative to a larger surrounding element.
- **Positioning:** PopoverContent accepts `side` (top / right / bottom / left), `align` (start / center / end), `sideOffset`, and `collisionPadding` — all forwarded to Floating UI via Radix.
- **Portal rendering:** Content portals to body; z-index is `z-popover` (1400) — above Dialog (`z-dialog`) so nested popovers-in-dialogs work correctly.
- **Not for tooltips** — use Tooltip for transient hover-label content; Popover is for interactive content (forms, menus, pickers).

## Gotchas
- Uses Framer Motion for enter/exit animations (v0.18.0)
- If content needs to be modal (backdrop, focus trap), pass `modal={true}` to the root Popover

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `PopoverContentProps` type export

### v0.1.0
- **Added** Initial release
