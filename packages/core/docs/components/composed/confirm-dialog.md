# ConfirmDialog

- Import: @devalok/shilp-sutra/composed/confirm-dialog
- Server-safe: No
- Category: composed

## Props
    open: boolean (REQUIRED, controlled)
    onOpenChange: (open: boolean) => void (REQUIRED)
    title: string (REQUIRED)
    description: string (REQUIRED)
    confirmText: string (default: "Confirm")
    cancelText: string (default: "Cancel")
    color: "default" | "error" (controls confirm button color)
    loading: boolean (default: false, disables buttons and replaces confirm button text with 'Processing...')
    onConfirm: () => void | Promise<void> (REQUIRED)

## Defaults
    confirmText="Confirm", cancelText="Cancel", color="default", loading=false

## Example
```jsx
const [open, setOpen] = useState(false)
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete project?"
  description="This action cannot be undone."
  color="error"
  confirmText="Delete"
  loading={isDeleting}
  onConfirm={async () => { await deleteProject(); setOpen(false) }}
/>
```

## Composability
- **Built on AlertDialog** — non-dismissible (no click-outside, Cancel-first focus), portal-rendered.
- **Controlled-only.** Parent owns `open` + `onOpenChange`.
- **onConfirm can be async.** `loading=true` replaces confirm text with "Processing..." and disables both buttons. Typical: setLoading(true) → await action() → setLoading(false) + setOpen(false).
- **Stays open after confirm** — close via onOpenChange. Keeps the modal up on errors or for chained confirmations.

## Gotchas
- Dialog stays open after confirm — consumer must close it via `onOpenChange`
- Built on AlertDialog internally
- Fully controlled — `open` and `onOpenChange` are required

## Changes
### v0.18.0
- **Fixed** Converted to `forwardRef` pattern

### v0.1.0
- **Added** Initial release
