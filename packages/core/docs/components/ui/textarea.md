# Textarea

- Import: @devalok/shilp-sutra/ui/textarea
- Server-safe: No
- Category: ui

## Props
    size: "sm" | "md" | "lg"
    state: "default" | "error" | "warning" | "success"
    (plus standard textarea attributes except native "size")

## Defaults
    size: "md"

## Example
```jsx
<Textarea size="lg" state="error" placeholder="Describe the issue..." />
```

## Gotchas
- state="error" sets aria-invalid automatically; all sizes are vertically resizable
- Inside FormField: auto-inherits state, aria-describedby, aria-required from context (explicit props override)

## Changes
### v0.15.0
- **Changed** `lg` size font changed from `text-ds-lg` (18px) to `text-ds-md` (14px) — all input sizes now use 14px for consistency
- **Changed** `md` size font standardized to `text-ds-md` (14px)

### v0.8.0
- **Fixed** Now consumes FormField context automatically (`aria-describedby`, `aria-invalid`, `aria-required`)

### v0.4.2
- **Added** `textareaVariants` export

### v0.1.1
- **Fixed** Added `aria-invalid` for error state (matching Input pattern)

### v0.1.0
- **Added** Initial release
