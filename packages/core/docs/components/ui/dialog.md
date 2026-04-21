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

## Composability
- Built on Radix Dialog primitives — every standard Radix prop passes through (`open`, `onOpenChange`, `defaultOpen`, `modal`).
- **Trigger composition:** `<DialogTrigger asChild>` renders the wrapped element as the trigger — typical pattern is `<DialogTrigger asChild><Button>...</Button></DialogTrigger>`. Without `asChild`, a default button is injected.
- **Portal rendering:** DialogContent portals to `document.body`. CSS containers (`overflow: hidden`, `transform`, stacking contexts) on ancestors of the trigger don't clip it. Container-scoped test queries miss portalled content — use `screen` or the portal root.
- **Focus management:** Radix traps focus inside Content while open and restores it to the trigger on close. First focusable element inside receives focus automatically.
- **Imperative close** from deep children: use `<DialogClose asChild>` around your own button, or `useDialogContext` — no prop drilling.
- **z-index:** DialogContent uses `z-dialog` (configured in Tailwind theme). Nested overlays (Popover inside Dialog) stack on top because Popover uses `z-popover` (1400) higher than `z-dialog`.

## Gotchas
- DialogTitle is required for accessibility — screen readers announce it when the dialog opens
- If your layout suppresses the title visually, use `<VisuallyHidden>` around DialogTitle — don't omit it
- Focus returns to the trigger on close — if the trigger is conditionally unmounted, focus lands on body; handle manually if that matters

## Changes
### v0.19.1
- **Fixed** Dialog not centered after Framer Motion animation completes — `transform: none` inline style overrode Tailwind `translate-x/y` classes. Centering now handled via Framer Motion `x`/`y` properties.

### v0.18.0
- **Changed** Overlay animations migrated to Framer Motion (physics-based springs)
- **Added** `DialogContentProps`, `DialogTitleProps` type exports
- **Fixed** Context provider value wrapped in `useMemo` for performance

### v0.3.0
- **Fixed** DialogHeader/Footer now support ref forwarding

### v0.1.0
- **Added** Initial release
