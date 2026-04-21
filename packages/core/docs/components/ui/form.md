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

## Composability
The FormField/useFormField pair is the central a11y wiring pattern. Components that consume it automatically become accessible inside a FormField without any explicit ARIA work on your end.

**FormField cascades through context to:**
- **Input, Textarea, NumberInput, InputOTP** — auto-receive `aria-describedby` (wired to FormHelperText's id), `aria-invalid` (when state="error"), and `aria-required` (when required=true).
- **FormHelperText** — auto-reads `state` and `helperTextId` from context; renders `role="alert"` on error so screen readers interrupt.
- **Label** — pair it with an Input via `htmlFor` / `id` in the normal way; FormField doesn't auto-wire labels (labels need the explicit association to satisfy screen readers reliably).

**Explicit props always override context.** Setting `state="error"` on an Input inside a FormField with `state="helper"` makes only that Input look errored.

**Nesting is NOT supported.** Don't nest FormField inside FormField — only the outermost context wins, and some a11y wiring silently breaks.

**Consuming context in your own components:**
```tsx
const field = useFormField()  // returns { state, helperTextId, required } or undefined
// Thread field?.state onto your control's state prop,
// and field?.helperTextId onto aria-describedby.
```

## Gotchas
- getFormFieldA11y() was REMOVED — use useFormField() hook instead
- FormHelperText auto-reads state and id from FormField context
- FormHelperText renders role="alert" when state="error"
- Don't nest FormField components — one FormField per field
- FormField does NOT auto-wire Label→Input association; use `<Label htmlFor="x" />` + `<Input id="x" />` explicitly

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
