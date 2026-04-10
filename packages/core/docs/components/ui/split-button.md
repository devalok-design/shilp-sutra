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

## Changes

### v0.33.0
- **Added** Initial release
