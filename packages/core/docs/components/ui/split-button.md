# SplitButton

A compound button that combines a primary action with a dropdown trigger, rendered as a single visual unit `[Action | ▼]`.

## Import

```ts
import { SplitButton } from '@devalok/shilp-sutra'
```

## Usage

```tsx
<SplitButton onClick={handleSave} dropdownContent={<SaveOptions />}>
  Save
</SplitButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | — | Primary action content (left side) |
| onClick | (e) => void | — | Primary click handler |
| dropdownContent | ReactNode | — | Content rendered inside floating dropdown |
| variant | 'solid' \| 'soft' \| 'outline' | 'solid' | Visual style |
| color | 'accent' \| 'error' \| 'success' \| 'warning' \| 'neutral' | 'accent' | Color scheme |
| size | 'xs' \| 'sm' \| 'md' \| 'icon-xs' \| 'icon-sm' \| 'icon-md' | 'md' | Size |
| triggerSide | 'left' \| 'right' | 'right' | Which side the dropdown chevron sits on |
| triggerWidth | number \| string | auto | Custom width for the trigger half |
| placement | Placement | 'top-end' | Floating UI placement for dropdown |
| disabled | boolean | false | Disable both halves |
| open | boolean | — | Controlled open state |
| onOpenChange | (open: boolean) => void | — | Open state callback |
| dropdownLabel | string | 'More options' | aria-label for trigger |
| dropdownIcon | ReactNode | chevron-down | Custom trigger icon |

## Composability
- **Two-in-one button:** visually unified `[Action | ▼]` with the left half being the primary click and the right half opening a dropdown. Use for actions that have a most-common choice plus alternatives (Save vs. Save-As-Draft, Send vs. Schedule).
- **Built on Button + Popover internally** — inherits Button's variant/color/size vocabulary and Popover's placement prop (`top-end` default works for most top-of-page toolbars).
- **Dropdown content is consumer-provided** — pass any JSX via `dropdownContent` (typically a DropdownMenu, list of actions, a custom panel, or a small form). Don't try to shove a full-featured menu into the chevron; keep it focused on 2–5 alternatives.
- **ButtonGroup compatibility:** Put SplitButton inside a `<ButtonGroup>` — it inherits variant/color/size from the group context just like Button does. Position-aware corners work too.
- **Controlled dropdown:** Pass `open` + `onOpenChange` for controlled state; omit for uncontrolled. Useful when the dropdown must close programmatically after a selection.

## Gotchas
- Always provide `dropdownLabel` (aria-label on the chevron trigger) — defaults to "More options" but context-specific labels are better
- `triggerSide="left"` flips the chevron to the left — rare, but useful for RTL layouts or when the primary action is the secondary emphasis

## Changes

### v0.33.0
- **Added** Initial release
