# Select

Single-choice picker from a short fixed list. Use instead of `<select>`.

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from '@devalok/shilp-sutra/ui/select'
```

## When to use

- Fixed list under ~15 items, no search needed (status, priority, role).
- Need typeahead / search across many options? Use `<Combobox>`.
- Free-text with suggestions? Use `<Autocomplete>`.
- Multi-select? Use `<MultiSelect>` or `<Combobox multiple>`.
- Yes/no toggle? Use `<Switch>` or `<RadioGroup>` with 2 options.

## Compound shape

```
Select (root — value, onValueChange, defaultValue)
  SelectTrigger              ← variant / color / size go HERE
    SelectValue (placeholder)
  SelectContent
    SelectGroup (optional)
      SelectLabel            ← non-interactive section header
      SelectItem (value)     ← REQUIRED value, unique
    SelectSeparator
```

## SelectTrigger props

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'default'\|'outline'\|'ghost'` | Default `default`. |
| `color` | `'default'\|'error'\|'success'\|'warning'` | Default `default`. `error` sets `aria-invalid`. |
| `size` | `'xs'\|'sm'\|'md'\|'lg'` | Default `md`. |

Styling lives on the **Trigger**, not on `Select` root. Setting `<Select size="lg">` does nothing — TypeScript won't catch it.

## Root state props (Radix passthrough)

| Prop | Type | Notes |
|---|---|---|
| `value` | `string` | Controlled value. |
| `onValueChange` | `(value: string) => void` | Fires on select. |
| `defaultValue` | `string` | Uncontrolled. |
| `open` | `boolean` | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | |

## Examples

**Standard:**
```tsx
<Select onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="todo">To do</SelectItem>
    <SelectItem value="doing">In progress</SelectItem>
    <SelectItem value="done">Done</SelectItem>
  </SelectContent>
</Select>
```

**With grouped items and a separator:**
```tsx
<Select value={assignee} onValueChange={setAssignee}>
  <SelectTrigger size="sm">
    <SelectValue placeholder="Assignee" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Team</SelectLabel>
      <SelectItem value="alice">Alice</SelectItem>
      <SelectItem value="bob">Bob</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>External</SelectLabel>
      <SelectItem value="contractor-1">Contractor 1</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

**Inside a FormField (manual error wiring):**
```tsx
<FormField state={errors.role ? 'error' : 'helper'}>
  <Label htmlFor="role">Role</Label>
  <Select value={role} onValueChange={setRole}>
    <SelectTrigger id="role" state={errors.role ? 'error' : 'default'}>
      <SelectValue placeholder="Choose a role" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="admin">Admin</SelectItem>
      <SelectItem value="member">Member</SelectItem>
      <SelectItem value="viewer">Viewer</SelectItem>
    </SelectContent>
  </Select>
  {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
</FormField>
```

Select doesn't auto-consume FormField context (unlike Input / Textarea). Set `color="error"` on `SelectTrigger` manually.

**Ghost variant in a toolbar:**
```tsx
<Select value={sort} onValueChange={setSort} defaultValue="recent">
  <SelectTrigger variant="ghost" size="sm">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="recent">Most recent</SelectItem>
    <SelectItem value="oldest">Oldest</SelectItem>
    <SelectItem value="az">A → Z</SelectItem>
  </SelectContent>
</Select>
```

## Composability

- **Radix Select** underneath — `value` / `onValueChange` / `defaultValue` / `open` / `onOpenChange` standard state.
- **Portal + z-popover (1400):** SelectContent portals to body, stacks above Dialog / Sheet / other overlays.
- **SelectItem requires a unique `value`** — duplicates produce undefined selection behavior.
- **FormField integration is manual** — wire `color="error"` on SelectTrigger from your validation state.

See `foundations/surfaces.md` for the overlay surface, `foundations/color.md` for state colors.

## Rules

- Put `variant` / `color` / `size` on `SelectTrigger`, NOT on `Select` root.
- Every `SelectItem` needs a unique `value` prop.
- For lists over ~15 items or when users will scan for a term, switch to `<Combobox>` — Select has no typeahead.
- Set `color="error"` on `SelectTrigger` for validation failures — Select doesn't auto-consume FormField state.
- Don't use Select for multi-value capture — use `<MultiSelect>` or `<Combobox multiple>`.
- Always render `<SelectValue placeholder="..." />` — without it, the trigger renders empty before any selection.
- Group related items with `<SelectGroup>` + `<SelectLabel>` — flat lists over 8 items get hard to scan.
- Don't customize the dropdown surface — overlays use `surface-1` per `foundations/surfaces.md`.
