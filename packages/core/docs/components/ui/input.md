# Input

- Import: @devalok/shilp-sutra/ui/input
- Server-safe: No
- Category: ui

## Props
    size: "sm" | "md" | "lg"
    state: InputState
    startIcon: ReactNode
    endIcon: ReactNode
    (plus all standard HTML input attributes except native "size")

## Types
    InputState = 'default' | 'error' | 'warning' | 'success'

## Defaults
    size: "md"

## Example
```jsx
<Input type="email" placeholder="you@example.com" state="error" startIcon={<IconMail />} />
```

## Gotchas
- HTML native "size" attribute is excluded — use CSS width instead
- state="error" sets aria-invalid automatically
- Inside FormField: auto-inherits state, aria-describedby, aria-required from context (explicit props override)
- Resting border is border-subtle (soft); focus ring is ring-1 at 50% opacity (v0.12.0)
- All sizes (sm, md, lg) use text-ds-md (14px) font — size only affects height and padding (v0.15.0)

## Changes
### v0.15.0
- **Changed** `lg` size font changed from `text-ds-lg` (18px) to `text-ds-md` (14px) — all input sizes now use 14px for consistency
- **Changed** `md` size font standardized to `text-ds-md` (14px) from mixed values

### v0.12.0
- **Changed** Softer resting border (`border-border-subtle` instead of `border-border`), subtler focus ring (`ring-1 ring-focus/50` instead of `ring-2 ring-focus`)
- **Changed** Reverted split `pl-*/pr-*` size variants back to `px-*`; icon padding uses `pl-ds-07`/`pr-ds-07`

### v0.8.0
- **Fixed** Now consumes FormField context automatically (`aria-describedby`, `aria-invalid`, `aria-required`)

### v0.4.2
- **Added** `inputVariants` export

### v0.1.0
- **Added** Initial release
