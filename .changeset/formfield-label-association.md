---
"@devalok/shilp-sutra": patch
---

Fix FormField/Label auto-association for every field control. Previously only `Input` adopted the `inputId` that `FormField` generates and `Label` points its `htmlFor` at, so `Textarea`, `Select`, `NumberInput`, `Combobox`, `Autocomplete`, and `ColorInput` rendered a `<label for>` targeting a non-existent element — leaving the control with no accessible name in the documented `<FormField><Label/><Control/></FormField>` pattern (WCAG 4.1.2 / 3.3.2).

Each control now adopts `id = props.id ?? fieldCtx.inputId` on its labelable element (explicit `id` still wins), and `Combobox`/`ColorInput` let the visible `<Label>` provide the accessible name when inside a `FormField` instead of overriding it with the placeholder. `SearchInput` inherits the fix via `Input`. No public prop changes.
