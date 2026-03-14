# AlertDialog

- Import: @devalok/shilp-sutra/ui/alert-dialog
- Server-safe: No
- Category: ui

## Props
    open: boolean (controlled)
    onOpenChange: (open: boolean) => void
    defaultOpen: boolean

## Compound Components
    AlertDialog (root)
      AlertDialogTrigger
      AlertDialogContent
        AlertDialogHeader
          AlertDialogTitle
          AlertDialogDescription
        AlertDialogFooter
          AlertDialogCancel
          AlertDialogAction

## Defaults
    none

## Example
```jsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button color="error">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Gotchas
- AlertDialogAction does NOT have color="error" styling — add it yourself via className or wrap a Button

## Changes
### v0.19.1
- **Fixed** AlertDialog not centered after Framer Motion animation completes — same `transform: none` fix as Dialog.

### v0.18.0
- **Changed** Overlay animations migrated to Framer Motion (physics-based springs)
- **Added** `AlertDialogContentProps`, `AlertDialogActionProps`, `AlertDialogCancelProps` type exports
- **Fixed** Context provider value wrapped in `useMemo` for performance

### v0.4.2
- **Fixed** AlertDialogHeader/Footer now wrapped in `React.forwardRef` (matches Dialog/Sheet pattern)

### v0.1.0
- **Added** Initial release
