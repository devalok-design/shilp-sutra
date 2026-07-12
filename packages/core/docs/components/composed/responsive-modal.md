# ResponsiveModal

- Import: @devalok/shilp-sutra/composed/responsive-modal
- Server-safe: No
- Category: composed

## Props

### ResponsiveModal (root)
    open: boolean (controlled open state)
    defaultOpen: boolean (uncontrolled initial state)
    onOpenChange: (open: boolean) => void
    dismissable: boolean (default: true — when false, Escape / outside-click / drag cannot close; only an explicit Close or onOpenChange does)

### ResponsiveModalContent
    snapPoints: number[] (mobile only; ascending viewport-height fractions like [0.4, 0.9] the sheet rests at. Omit for a content-height sheet. Ignored on desktop)
    defaultSnapPoint: number (mobile only; index into snapPoints the sheet opens at. Defaults to the last/tallest)

## Defaults
    dismissable=true

## Example
```jsx
<ResponsiveModal>
  <ResponsiveModalTrigger asChild><Button>Edit profile</Button></ResponsiveModalTrigger>
  <ResponsiveModalContent snapPoints={[0.5, 0.9]}>
    <ResponsiveModalBackground className="bg-linear-to-br from-accent-3 to-accent-6 opacity-40" />
    <ResponsiveModalHeader>
      <ResponsiveModalTitle>Edit profile</ResponsiveModalTitle>
      <ResponsiveModalDescription>Changes save when you apply.</ResponsiveModalDescription>
    </ResponsiveModalHeader>
    <ResponsiveModalBody>{/* form fields — scrolls internally */}</ResponsiveModalBody>
    <ResponsiveModalFooter>
      <ResponsiveModalClose asChild><Button variant="soft">Cancel</Button></ResponsiveModalClose>
      <Button>Apply</Button>
    </ResponsiveModalFooter>
  </ResponsiveModalContent>
</ResponsiveModal>
```

## Composability
- **Part:** ResponsiveModal (required) — root; owns open/close state and the desktop/mobile switch
- **Part:** ResponsiveModalTrigger — opens the modal; use `asChild` to wrap your own button
- **Part:** ResponsiveModalContent — the switching panel: centered Dialog at md+, bottom sheet below
- **Part:** ResponsiveModalBackground (slot: behind) — optional full-bleed layer painted at `-z-10`, clipped to the panel radius
- **Part:** ResponsiveModalHeader (slot: top) — pinned; stays put while the body scrolls
- **Part:** ResponsiveModalTitle (required) — labels the dialog for accessibility
- **Part:** ResponsiveModalDescription — optional subtitle
- **Part:** ResponsiveModalBody — internal scroll region (min-h-0 flex-1 overflow-y-auto), capped 85dvh desktop / 90dvh mobile
- **Part:** ResponsiveModalFooter (slot: bottom) — pinned action row; stacks on mobile, right-aligned inline on desktop
- **Part:** ResponsiveModalClose — manual close (Content already renders a built-in close button when dismissable)
- **Composes:** dialog (alternative-to) — use Dialog directly when you always want a centered modal
- **Composes:** sheet (alternative-to) — use Sheet directly when you always want an edge panel
- **Context:** ResponsiveModal — provides open / isMobile / dismissable / onClose to its parts via context

## Gotchas
- Built on the same dialog primitive as Dialog and Sheet — focus trap, Escape, scroll lock, and portal are handled. Not server-safe (uses hooks); import in a client component.
- Put a `ResponsiveModalTitle` inside every modal — it sets the ARIA label. Omitting it triggers an accessibility warning.
- The built-in close button sits at `z-10` above `ResponsiveModalBackground` (`-z-10`); keep Header/Body/Footer in normal flow (no `relative z-*` wrapper) or a positioned wrapper will paint over the close button and eat the tap.
- `snapPoints` and `defaultSnapPoint` are mobile-only — they are ignored at md+ (always a centered Dialog).
- Height caps live on the panel (85dvh desktop / 90dvh mobile); do not add your own `max-h` to `ResponsiveModalBody` — it already scrolls.
- Prefer this over `DialogContent responsive` when the mobile form should be a partial bottom sheet; `responsive` collapses to a full-screen takeover that leaves dead space under short content.

## Changes
### v0.49.0
- Added — new component. Dialog (md+) / bottom-sheet (mobile) responsive modal with pinned header/footer, internal scroll body, optional full-bleed background slot, drag-to-dismiss, and optional mobile snap points.
