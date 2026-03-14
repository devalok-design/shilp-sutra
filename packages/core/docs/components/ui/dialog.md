# Dialog

- Import: @devalok/shilp-sutra/ui/dialog
- Server-safe: No
- Category: ui

## Compound Components
    Dialog (root)
      DialogTrigger
      DialogContent
        DialogHeader
          DialogTitle
          DialogDescription
        [body content]
        DialogFooter
      DialogClose

## Defaults
    none

## Example
```jsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>Make changes to your profile.</DialogDescription>
    </DialogHeader>
    <div>Form fields here</div>
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Gotchas
- DialogTitle is required for accessibility — screen readers announce it when the dialog opens

## Changes
### v0.18.0
- **Changed** Overlay animations migrated to Framer Motion (physics-based springs)
- **Added** `DialogContentProps`, `DialogTitleProps` type exports
- **Fixed** Context provider value wrapped in `useMemo` for performance

### v0.3.0
- **Fixed** DialogHeader/Footer now support ref forwarding

### v0.1.0
- **Added** Initial release
