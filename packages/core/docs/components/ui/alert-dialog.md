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

## Composability
- Built on Radix AlertDialog — like Dialog but **non-dismissible** by clicking outside or pressing Escape. The user must choose Cancel or Action.
- Same portal + trigger + asChild pattern as Dialog.
- `AlertDialogAction` and `AlertDialogCancel` are semantically distinct from generic buttons: they auto-close the dialog on click. Use them even if you wrap them around a styled Button via `asChild` so the close behavior stays wired.
- **Focus management:** Initial focus lands on `AlertDialogCancel` (the safe default) — destructive confirmation is always one tab away.
- Use AlertDialog for destructive / irreversible actions; use Dialog for everything else.

## Gotchas
- AlertDialogAction does NOT have color="error" styling — add it yourself via className or wrap a Button with `asChild`
- Do NOT add a close-on-outside-click handler — the non-dismissible behavior is the whole point
- AlertDialogCancel receives initial focus; don't flip the convention

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
