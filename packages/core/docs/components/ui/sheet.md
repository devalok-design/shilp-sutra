# Sheet

- Import: @devalok/shilp-sutra/ui/sheet
- Server-safe: No
- Category: ui

## Props
### SheetContent
    side: "top" | "bottom" | "left" | "right"

## Compound Components
    Sheet (root)
      SheetTrigger
      SheetContent (side prop)
        SheetHeader
          SheetTitle
          SheetDescription
        [body content]
        SheetFooter
      SheetClose

## Example
```jsx
<Sheet>
  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
    </SheetHeader>
    <div>Content</div>
  </SheetContent>
</Sheet>
```

## Defaults
    side="right"

## Composability
- Same primitives as Dialog — open/onOpenChange/defaultOpen, trigger asChild, portal rendering, focus trap.
- `side` controls both the enter-from edge and the layout: top/bottom sides full-width, left/right sides ~75% of viewport (capped at sm breakpoint).
- Use Sheet for side-anchored drawers (settings panels, mobile navigation); use Dialog for centered modals.
- On mobile (`isMobile` from use-mobile), consider Sheet as the mobile-friendly equivalent of a Dialog/Popover — more thumb-reachable on tall screens.

## Gotchas
- Uses Framer Motion for slide enter/exit animations (v0.18.0)
- SheetTitle is required for accessibility (same rule as Dialog)

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `SheetContentProps` type export

### v0.3.0
- **Fixed** SheetHeader/Footer now support ref forwarding

### v0.1.0
- **Added** Initial release
