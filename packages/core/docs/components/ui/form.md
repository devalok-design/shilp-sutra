# FormField / FormHelperText / useFormField

- Import: @devalok/shilp-sutra/ui/form
- Server-safe: No
- Category: ui

## Props
### FormField
    state: "helper" | "error" | "warning" | "success" (default: "helper")
    helperTextId: string (auto-generated if omitted)
    required: boolean

### FormHelperText
    state: "helper" | "error" | "warning" | "success" (inherits from FormField context)

## Types
    FormHelperState = 'helper' | 'error' | 'warning' | 'success'

## Hook
    useFormField() => { state, helperTextId, required }

## Defaults
    state: "helper"

## Example
```jsx
<FormField state="error">
  <Label htmlFor="email">Email</Label>
  <Input id="email" state="error" />
  <FormHelperText>Please enter a valid email.</FormHelperText>
</FormField>
```

## Gotchas
- getFormFieldA11y() was REMOVED — use useFormField() hook instead
- FormHelperText auto-reads state and id from FormField context
- FormHelperText renders role="alert" when state="error"

## Changes
### v0.18.0
- **Fixed** Wrapped FormField context provider value in `useMemo` for performance

### v0.8.0
- **Fixed** Input/Textarea now consume FormField context automatically (`aria-describedby`, `aria-invalid`, `aria-required`)

### v0.3.0
- **Added** `useFormField()` hook for automatic aria-describedby wiring
- **Changed** (BREAKING) FormField auto-wires `aria-describedby` via context. `getFormFieldA11y()` removed

### v0.1.0
- **Added** Initial release
