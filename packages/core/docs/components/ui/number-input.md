# NumberInput

- Import: @devalok/shilp-sutra/ui/number-input
- Server-safe: No
- Category: ui

## Props
    value: number (default: 0)
    onValueChange: (value: number) => void
    min: number
    max: number
    step: number (default: 1)
    disabled: boolean

## Defaults
    value: 0
    step: 1
    min: Number.MIN_SAFE_INTEGER
    max: Number.MAX_SAFE_INTEGER

## Example
```jsx
<NumberInput value={qty} onValueChange={setQty} min={1} max={99} />
```

## Gotchas
- Controlled only — buttons won't work without onValueChange

## Changes
### v0.18.0
- **Fixed** Replaced `parseInt` with `Number()`, handle empty input

### v0.15.0
- **Changed** `md` size font standardized to `text-ds-md` (14px)

### v0.8.0
- **Fixed** FormField context consumption, `aria-label` fallback, `parseInt` radix parameter

### v0.3.0
- **Changed** (BREAKING) `onChange` renamed to `onValueChange`
- **Changed** Now extends HTMLAttributes — accepts all standard HTML props

### v0.1.0
- **Added** Initial release
