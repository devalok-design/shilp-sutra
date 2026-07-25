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
- **Composes the DS Popover internally** and shares the `color` type + a `variant`/`size` subset with Button (currently `solid`/`soft`/`outline` × the Button colors; no `ghost`/`link`/`lg`). Note: the half styling is implemented locally, not inherited from `Button` — a few Button niceties (e.g. `solid`'s `hover:shadow-brand`) don't apply. Popover placement via `top-end` default suits most top-of-page toolbars.
- **Dropdown content is consumer-provided** — pass any JSX via `dropdownContent` (typically a DropdownMenu, list of actions, a custom panel, or a small form). Don't try to shove a full-featured menu into the chevron; keep it focused on 2–5 alternatives.
- **ButtonGroup:** SplitButton does NOT consume `ButtonGroup` context — set its `variant`/`color`/`size` explicitly to match a surrounding group.
- **Controlled dropdown:** Pass `open` + `onOpenChange` for controlled state; omit for uncontrolled. Useful when the dropdown must close programmatically after a selection.

## Gotchas
- Always provide `dropdownLabel` (aria-label on the chevron trigger) — defaults to "More options" but context-specific labels are better
- `triggerSide="left"` flips the chevron to the left — rare, but useful for RTL layouts or when the primary action is the secondary emphasis

## Changes

### v0.44.2
- **Fixed** The dropdown is now keyboard-accessible. It previously used a hand-rolled floating panel (`role="menu"`) with no focus management, arrow keys, or Escape — keyboard users couldn't reach or dismiss it. It now composes the DS **Popover** primitive: focus moves in on open, Escape and outside-click close, focus returns to the trigger, and on mobile it opens as a bottom sheet.

### v0.33.0
- **Added** Initial release
