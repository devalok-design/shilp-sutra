# Popover

Click-triggered floating panel for interactive content anchored to a trigger.

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from '@devalok/shilp-sutra/ui/popover'
```

## When to use

- Interactive panel anchored to a button: filter form, date picker, color picker, share popover.
- A list of actions? Use `<DropdownMenu>` — keyboard model differs (arrow nav vs. Tab nav).
- Inert hover label (tooltip)? Use `<Tooltip>`.
- Rich hover preview (user card, link preview)? Use `<HoverCard>`.
- Critical full-attention interaction? Use `<Dialog>`.

On mobile, Popover auto-promotes to a bottom drawer when it would overflow the viewport — don't rebuild this manually.

## Compound shape

```
Popover (root — open, onOpenChange, defaultOpen, modal)
  PopoverTrigger          ← asChild around your button
  PopoverAnchor           ← optional, decouples trigger from positioning origin
  PopoverContent          ← portalled, accepts side/align/sideOffset
```

## Root state props (Radix passthrough)

| Prop | Type | Notes |
|---|---|---|
| `open` | `boolean` | Controlled. |
| `onOpenChange` | `(open: boolean) => void` | |
| `defaultOpen` | `boolean` | Uncontrolled. |
| `modal` | `boolean` | Default `false`. Set `true` for backdrop + focus trap (rare — usually use Dialog). |

## PopoverContent positioning

| Prop | Type | Notes |
|---|---|---|
| `side` | `'top'\|'right'\|'bottom'\|'left'` | Preferred side. Floats to opposite side if it would overflow. |
| `align` | `'start'\|'center'\|'end'` | Alignment relative to trigger. |
| `sideOffset` | `number` (px) | Gap between trigger and content. |
| `collisionPadding` | `number \| { top, right, bottom, left }` | Distance from viewport edges before flipping. |

All Floating-UI positioning options pass through via Radix.

## Examples

**Filter form:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="soft" startIcon={IconFilter}>Filters</Button>
  </PopoverTrigger>
  <PopoverContent align="start">
    <Stack gap="ds-04">
      <FormField>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <Stack direction="horizontal" gap="ds-03" justify="end">
        <Button variant="ghost" size="sm" onClick={reset}>Clear</Button>
        <Button size="sm" onClick={apply}>Apply</Button>
      </Stack>
    </Stack>
  </PopoverContent>
</Popover>
```

**Date picker:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="soft" startIcon={IconCalendar}>
      {date ? formatDate(date) : 'Pick a date'}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar value={date} onChange={(d) => { setDate(d); setOpen(false) }} />
  </PopoverContent>
</Popover>
```

**Share popover with copy link:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="soft" startIcon={IconShare}>Share</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" align="end">
    <Stack gap="ds-03">
      <Text variant="label-sm">Share link</Text>
      <Stack direction="horizontal" gap="ds-02">
        <Input value={shareUrl} readOnly className="flex-1" />
        <IconButton
          icon={<Icon icon={copied ? IconCheck : IconCopy} />}
          variant="soft"
          aria-label="Copy link"
          onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true) }}
        />
      </Stack>
    </Stack>
  </PopoverContent>
</Popover>
```

**Decoupled anchor (trigger ≠ positioning origin):**
```tsx
<Popover>
  <PopoverAnchor>
    <Card>
      <CardHeader>
        <CardTitle>Project</CardTitle>
        <PopoverTrigger asChild>
          <IconButton icon={<Icon icon={IconInfo} />} variant="ghost" size="sm" aria-label="About" />
        </PopoverTrigger>
      </CardHeader>
    </Card>
  </PopoverAnchor>
  <PopoverContent side="top">
    Popover positions relative to the whole Card, not the small info button.
  </PopoverContent>
</Popover>
```

**Inside a Dialog (nested overlays work correctly):**
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Schedule meeting</DialogTitle>
    </DialogHeader>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="soft">Pick a time</Button>
      </PopoverTrigger>
      <PopoverContent>
        <TimePicker value={time} onChange={setTime} />
      </PopoverContent>
    </Popover>
  </DialogContent>
</Dialog>
```

Popover uses `z-popover` (1400), above `z-dialog`. Nesting works without z-index fights.

**Controlled with custom close behavior:**
```tsx
const [open, setOpen] = useState(false)

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent
    onInteractOutside={(e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        confirmClose().then((ok) => ok && setOpen(false))
      }
    }}
  >
    <UnsavedForm />
  </PopoverContent>
</Popover>
```

## Composability

- **Built on Radix Popover** — every standard Radix prop passes through.
- **Portal rendering:** PopoverContent portals to body. CSS `overflow: hidden` / `transform` on ancestors don't clip it.
- **z-popover (1400):** Above Dialog (`z-dialog`). Nested popovers inside dialogs stack correctly.
- **PopoverAnchor:** Decouples the visual anchor from the interactive trigger. Useful when the trigger is small (icon button) but the popover should position relative to a larger surrounding element.

See `foundations/surfaces.md` for overlay surface, `foundations/motion.md` for the spring open animation, `foundations/spacing.md` for internal popover padding.

## Rules

- Use Popover for interactive content (forms, pickers). Use DropdownMenu for action lists — different keyboard model.
- `<PopoverTrigger asChild>` around any focusable element — usually a Button or IconButton.
- Set `modal={true}` only when the popover blocks interaction with the rest of the page. Default `false` is correct for filters / pickers.
- Set explicit `side` + `align` for predictable positioning. Defaults bottom-center, but designs often want `align="end"` for right-anchored triggers.
- Don't use Popover for tooltips — Tooltip is for inert hover labels. Popover requires explicit click.
- Don't nest Popover inside Popover. Use a single Popover with stepped content, or close the first before opening the second.
- For complex form flows that need full attention, switch to Dialog. Popovers shouldn't host multi-step wizards.
- The internal padding inside `PopoverContent` is preset — don't add wrapper divs with extra padding. Use `<Stack gap>` to space content.
