# Dialog

Centered modal overlay for focused tasks that interrupt the page flow.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@devalok/shilp-sutra/ui/dialog'
```

## When to use

- Confirmations (destructive actions, accept-terms).
- Short forms that need full attention (rename, share, invite).
- Critical announcements requiring acknowledgment.
- Side-anchored drawer (settings panel, mobile nav)? Use `<Sheet>`.
- Lightweight rich tooltip with no required interaction? Use `<HoverCard>`.
- Interactive panel anchored to a trigger (filter, picker)? Use `<Popover>`.

On mobile, Dialog auto-promotes to a full-screen sheet — don't rebuild this manually.

## Compound shape

```
Dialog (root — open, onOpenChange, defaultOpen, modal)
  DialogTrigger          ← uses asChild around a Button
  DialogContent          ← portalled, traps focus
    DialogHeader
      DialogTitle         ← REQUIRED for a11y
      DialogDescription
    [body content]
    DialogFooter
      DialogClose         ← uses asChild around a Button
```

## Root props (passthrough to Radix)

| Prop | Type | Notes |
|---|---|---|
| `open` | `boolean` | Controlled mode. |
| `onOpenChange` | `(open: boolean) => void` | Fires on every state change. |
| `defaultOpen` | `boolean` | Uncontrolled. |
| `modal` | `boolean` | Default `true`. Set `false` for non-blocking overlays (rare). |

Styling props live on `DialogContent`. Trigger / Close use `asChild` to merge with your Button.

## Examples

**Confirmation:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="soft" color="error">Delete project</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete this project?</DialogTitle>
      <DialogDescription>
        This permanently deletes all tasks, files, and history. Cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="soft">Cancel</Button>
      </DialogClose>
      <Button variant="solid" color="error" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Short form:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Rename workspace</DialogTitle>
    </DialogHeader>
    <Stack gap="ds-04">
      <FormField>
        <Label htmlFor="ws-name">Name</Label>
        <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
    </Stack>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="soft">Cancel</Button>
      </DialogClose>
      <Button onClickAsync={async () => { await api.rename(name); setOpen(false) }}>
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Visually-hidden title (a11y compliance without showing the heading):**
```tsx
<DialogContent>
  <VisuallyHidden>
    <DialogTitle>Image preview</DialogTitle>
  </VisuallyHidden>
  <img src={src} alt={alt} />
</DialogContent>
```

**Programmatic close from a deep child:**
```tsx
<DialogContent>
  <Stack>
    <FancyForm onSubmit={handleSubmit} />
    <DialogClose asChild>
      <Button variant="ghost">Done</Button>
    </DialogClose>
  </Stack>
</DialogContent>
```

**Nested Popover inside Dialog:**
```tsx
<Dialog>
  <DialogContent>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="soft">Pick a date</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar value={date} onChange={setDate} />
      </PopoverContent>
    </Popover>
  </DialogContent>
</Dialog>
```

Popover uses `z-popover` (1400) which is above `z-dialog` — nesting stacks correctly without z-index fights.

## Mobile behavior

On viewports below the `md` breakpoint, DialogContent auto-fullscreens with a top-anchored close button. Layouts that work on desktop in centered modal usually work on mobile in fullscreen as-is — but verify long forms scroll inside the dialog body, not the page.

## Composability

- **Portal rendering:** DialogContent portals to `document.body`. CSS `overflow: hidden`, `transform`, or stacking contexts on ancestors don't clip it.
- **Focus management:** Focus traps inside while open. First focusable element receives focus. Returns to trigger on close.
- **Imperative close:** Wrap your own button with `<DialogClose asChild>` — no prop drilling.
- **z-index:** `z-dialog`. Popovers, DropdownMenus, Tooltips inside stack above using `z-popover`.

See `foundations/surfaces.md` for the overlay surface tokens, `foundations/motion.md` for the spring entry animation.

## Rules

- Always render a `<DialogTitle>` — screen readers depend on it. If the design hides it visually, wrap it in `<VisuallyHidden>`.
- Use `<DialogTrigger asChild>` with a Button — don't use Dialog's default injected trigger.
- For destructive actions, place the destructive Button on the right with `color="error"`. Cancel (`<DialogClose>`) sits left with `variant="soft"`.
- Don't manipulate `open` from inside the content tree without going through `onOpenChange` or `<DialogClose>` — focus restoration breaks.
- Don't nest Dialogs. Use a single Dialog with stepped state, or close the first before opening the second.
- For side-anchored drawers, switch to `<Sheet>`. Don't recreate Sheet behavior with custom Dialog styling.
- If your Dialog is mostly read-only content (image preview, log viewer), still provide a `<DialogTitle>` for a11y, hidden if needed.
