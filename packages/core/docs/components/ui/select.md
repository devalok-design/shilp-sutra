# Select

- Import: @devalok/shilp-sutra/ui/select
- Server-safe: No
- Category: ui

## Props
### SelectTrigger
    variant: "default" | "outline" | "ghost"
    color: "default" | "error" | "success" | "warning" (sets aria-invalid when error)
    size: "xs" | "sm" | "md" | "lg"

## Compound Components
    Select (root — value, onValueChange, defaultValue)
      SelectTrigger (variant/color/size go HERE, not on Select root)
        SelectValue (placeholder)
      SelectContent
        SelectGroup (optional grouping)
          SelectLabel (group header)
          SelectItem (value: string, REQUIRED)
        SelectSeparator

## Defaults
    SelectTrigger variant="default", color="default", size="md"

## Example
```jsx
<Select onValueChange={setValue}>
  <SelectTrigger size="lg">
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>
```

## Composability
- **Radix Select** underneath — `value`/`onValueChange`/`defaultValue`/`open`/`onOpenChange` standard state.
- **Styling props live on SelectTrigger, not Select root.** The Select root owns value/state; the Trigger owns appearance (variant/color/size). Setting `<Select size="lg">` silently does nothing — TypeScript won't catch it.
- **SelectItem requires `value`** — unique within the Select. Labels are the children of SelectItem.
- **SelectGroup + SelectLabel:** Organize options into sections with a non-interactive section heading.
- **FormField integration:** Set `color="error"` on SelectTrigger for error visuals. Not auto-consumed from FormField (same as Checkbox/Radio — form-library convention for select controls).
- **Portal + z-popover (1400):** content portals to body, stacks above Dialog/Sheet/other overlays.
- **Select vs Combobox vs Autocomplete:** Select = short fixed list, click-to-open, no typeahead. Combobox = searchable, forced selection. Autocomplete = searchable, free text. Pick by list size and search need.

## Gotchas
- Size goes on SelectTrigger, NOT on Select root
- `<Select size="lg">` is silently ignored (no TypeScript error)

## Changes
### v0.31.0
- **Added** `variant` prop on SelectTrigger: `default | outline | ghost`
- **Added** `color` prop on SelectTrigger: `default | error | success | warning`. Sets `aria-invalid` when error.

### v0.15.0
- **Changed** `lg` size font changed from `text-ds-lg` (18px) to `text-ds-md` (14px) — all input sizes now use 14px for consistency

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes content rendering behind Sheet/Dialog overlays

### v0.1.0
- **Added** Initial release
