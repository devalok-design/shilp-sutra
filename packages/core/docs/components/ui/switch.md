# Switch

- Import: @devalok/shilp-sutra/ui/switch
- Server-safe: No
- Category: ui

## Props
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    state: "default" | "error" | "warning" | "success" (validation border/checked-track tint; error sets aria-invalid. Inherited from FormField when omitted. Distinct from `color`, the ON-track tint)
    disabled: boolean
    size: "sm" | "md" | "lg"
    color: "accent" | "success" | "warning"
    thumbIcon: ReactNode (icon rendered inside the thumb)

## Defaults
    size="md", color="accent"

## Example
```jsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
<Switch size="lg" color="success" thumbIcon={<IconCheck size={14} />} />
```

## Composability
- Radix Switch primitive — `checked` / `onCheckedChange` / `defaultChecked` standard control model.
- **FormField:** Switch does NOT auto-consume FormField state (same as Checkbox/Radio — form-library convention for toggles). Pass `error` explicitly when needed.
- **thumbIcon slot:** Any ReactNode renders inside the thumb circle — commonly used for check/X glyphs that animate with the thumb position.
- **Label pairing:** Manual — pair with `<Label htmlFor="x" />` + `<Switch id="x" />`, or wrap both in a `<label>` for click-to-toggle.
- Pair with FormHelperText (outside FormField wiring) for custom validation messages.

## Gotchas
- Use error prop for validation states (matches Checkbox API)
- `error` overrides `color` — when error is true, checked state always uses error-9
- Switch does NOT auto-consume FormField — pass `error` explicitly inside a FormField

## Changes
### v0.49.0
- **BREAKING** Removed the `error: boolean` prop; use `state` (`FieldState = "default" | "error" | "warning" | "success"`). Migrate `<Switch error />` → `<Switch state="error" />`. Gains `warning`/`success` and inherits from `FormField`. (`color` is unchanged — it's the ON-track tint, not validation.)

### v0.29.0
- **Added** `size` prop: `"sm"` (18px track) | `"md"` (24px, default) | `"lg"` (28px track)
- **Added** `color` prop: `"accent"` (default) | `"success"` | `"warning"` for checked-state color
- **Added** `thumbIcon` prop — renders any ReactNode inside the thumb circle (e.g., check icon)

### v0.18.0
- **Changed** Migrated to Framer Motion spring thumb animation
- **Fixed** Added visible border on unchecked state (`border-surface-border-strong`) — was borderless, making unchecked state hard to see

### v0.4.2
- **Fixed** `React.ComponentRef` changed to `React.ElementRef` for consistency

### v0.3.0
- **Added** `SwitchProps` type export
- **Added** `error` prop (matches Checkbox API)

### v0.1.0
- **Added** Initial release
