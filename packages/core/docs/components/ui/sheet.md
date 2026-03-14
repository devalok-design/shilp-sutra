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

## Gotchas
- Uses Framer Motion for slide enter/exit animations (v0.18.0)

## Changes
### v0.18.0
- **Changed** Migrated to Framer Motion for enter/exit animations
- **Added** `SheetContentProps` type export

### v0.3.0
- **Fixed** SheetHeader/Footer now support ref forwarding

### v0.1.0
- **Added** Initial release
