# HoverCard

- Import: @devalok/shilp-sutra/ui/hover-card
- Server-safe: No
- Category: ui

## Compound Components
    HoverCard (root)
      HoverCardTrigger
      HoverCardContent

## Example
```jsx
<HoverCard>
  <HoverCardTrigger asChild><span>Hover me</span></HoverCardTrigger>
  <HoverCardContent>Preview content</HoverCardContent>
</HoverCard>
```

## Composability
- Radix HoverCard — accepts `open`, `onOpenChange`, `defaultOpen`, `openDelay` (ms before show), `closeDelay` (ms before hide).
- **Distinction from Tooltip:** HoverCardContent can contain interactive elements (links, buttons, form fields). Tooltip is for inert text labels. If you need a rich hover preview — user card, link preview, product card — use HoverCard.
- **Distinction from Popover:** Popover opens on click/focus; HoverCard opens on hover/focus. Use HoverCard when the intent is a passive preview, Popover when the user must explicitly invoke the panel.
- **Trigger:** `<HoverCardTrigger asChild>` wraps any element. Works on `<span>`, `<a>`, `<button>` — the trigger doesn't need to be interactive itself (unlike Popover where click matters).
- **Accessibility:** Hover-only interactions are invisible on touch. Pair with a focus-visible state or use Popover instead for critical content.
- **Portal + z-index:** z-popover (1400), same as DropdownMenu/Popover.

## Gotchas
- Overlay component — uses Framer Motion for enter/exit animations (v0.18.0)
- Don't nest another HoverCard inside one — both open on the same hover and conflict

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `HoverCardContentProps` type export

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes content rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
