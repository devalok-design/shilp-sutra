---
"@devalok/shilp-sutra": minor
---

**BREAKING (breaking-minor) — unified validation state across all form controls.**

Every form control now takes one prop, `state`, of one type — `FieldState = "default" | "error" | "warning" | "success"` (exported from `@devalok/shilp-sutra/ui`). Previously the same concept was spelled three different ways: `state` (Input/Textarea/NumberInput), `color` (Select), and an `error: boolean` (Checkbox/Switch). Radio and Combobox had no explicit prop at all. Precedence is consistent everywhere: an explicit `state` prop wins over `FormField` context.

**Migrate:**
- `<Checkbox error />` → `<Checkbox state="error" />`
- `<Switch error />` → `<Switch state="error" />` (Switch's `color` prop is unchanged — it's the ON-track tint, not validation)
- `<SelectTrigger color="error" />` → `<SelectTrigger state="error" />` (also `color="success" | "warning"` → `state=`)
- `selectTriggerVariants({ color })` → `selectTriggerVariants({ state })` (the CVA axis was renamed)

**Also in this change (additive, non-breaking):**
- Checkbox/Switch/Radio gain `warning` + `success` tints (previously error-only).
- Radio (`RadioGroup`) and Combobox gain an explicit `state` prop; both now also inherit validation state from `FormField` context (Select does too now — previously manual-only). Combobox renders a validation border for the first time.
- New shared type `FieldState` + internal `resolveFieldState()` helper (`ui/lib/field-state`) — single precedence rule, replaces the per-component copies.
- `InputState` and `NumberInputState` remain as `@deprecated` aliases of `FieldState`; no type-import breakage.
