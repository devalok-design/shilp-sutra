# Checkbox

- Import: @devalok/shilp-sutra/ui/checkbox
- Server-safe: No
- Category: ui

## Props
    checked: boolean | "indeterminate"
    onCheckedChange: (checked: boolean | "indeterminate") => void
    size: "sm" | "md" | "lg"
    state: "default" | "error" | "warning" | "success" (validation border/bg tint; error sets aria-invalid. Inherited from FormField when omitted)
    indeterminate: boolean (overrides checked, shows dash icon)
    disabled: boolean

## Defaults
    size="md"

## Example
```jsx
<Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />

{/* With label */}
<label htmlFor="terms" className="flex items-center gap-ds-02">
  <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
  I agree to the terms
</label>
```

## Composability
- **FormField integration:** Unlike Input/Textarea, Checkbox does NOT auto-consume FormField state — the `error` prop must be set explicitly. (Form-library convention differs for checkboxes since they often don't share the same visual grouping.)
- **Labels:** Checkbox doesn't carry its own label — pair it with `<Label htmlFor="x" />` + `<Checkbox id="x" />`, or wrap both in a `<label>` element. Screen readers rely on that association.
- **Controlled vs uncontrolled:** Pass `checked` + `onCheckedChange` for controlled, `defaultChecked` for uncontrolled. Don't mix.

## Gotchas
- indeterminate overrides checked visually
- Checkbox does NOT auto-consume FormField error state — pass `error` explicitly if using inside a FormField
- WCAG 2.5.8 minimum target size met at md (24px); sm (20px) may fail if not paired with enough label hit area

## Changes
### v0.49.0
- **BREAKING** Removed the `error: boolean` prop; use `state` (`FieldState = "default" | "error" | "warning" | "success"`). Migrate `<Checkbox error />` → `<Checkbox state="error" />`. Gains `warning`/`success` tints and now inherits state from `FormField`.

### v0.22.0
- **Changed** Check indicator animation from scale-bounce to path-draw (stroke draws progressively). Indeterminate dash also draws in.
- **Fixed** Uncontrolled checkbox never showed checkmark — `checked` from props was `undefined`, so `isActive` was always `false`. Now tracks internal state.
- **Added** Hover state on unchecked checkbox (subtle background highlight).

### v0.18.0
- **Changed** Bouncy check indicator animation migrated to Framer Motion
- **Fixed** Icon sizing uses design tokens consistently

### v0.1.0
- **Added** Initial release
