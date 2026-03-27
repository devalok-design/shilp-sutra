# Input Section Types — Design

## Problem

Text prefixes/suffixes (like `$`, `https://`, `.com`) in Input look broken. They render in a fixed-width icon box with no visual separation from the input text, making them look like editable content. Stripe solves this with tinted backgrounds and vertical separators.

## Design

### New Props

```typescript
interface InputProps {
  // ...existing...
  startSectionType?: 'icon' | 'label'   // default: 'icon'
  endSectionType?: 'icon' | 'label'     // default: 'icon'
}
```

### Auto-inference

When `startSection` or `endSection` is a **string**, automatically treat it as `"label"` type. No explicit `sectionType` needed for the common case:

```tsx
<Input startSection="$" />                    // auto label
<Input startSection="https://" />             // auto label
<Input endSection=".com" />                   // auto label
<Input startSection={<Icon icon={IconSearch} />} />  // auto icon (ReactElement)
```

### Label Section Visual Treatment

- **Background**: `bg-surface-raised` (distinct from input's `bg-surface-raised-hover`)
- **Separator**: `border-r` (start) or `border-l` (end) using `border-surface-border`
- **Typography**: `text-surface-fg-muted text-ds-sm` — smaller, muted, reads as non-editable
- **Width**: auto (content-sized), `shrink-0`, `px-ds-03` padding
- **Interaction**: `select-none`, non-editable appearance
- **Separator persists on focus** — always visible, the label is permanently distinct

### Icon Section (unchanged)

- Centered in a square cell (`w-[38px]` etc.)
- Muted color, no separator, no background
- Full backward compatibility

### Layout Migration

Switch from absolute positioning to **flexbox**. Sections become flex children of the wrapper:

```
Wrapper (flex):
┌──────────────────────────────────────────────────┐
│ [label-section][sep] [  input (flex-1)  ] [sep][label-section] │
└──────────────────────────────────────────────────┘
```

This eliminates the fragile `paddingMap` / `sectionWidthMap` system for label sections. Icon sections keep their fixed width for backward compat.

### Border Radius

Label sections at the edges inherit the wrapper's border-radius on their outer corner:
- Start label: `rounded-l-[inherit]` (matches wrapper's left radius)
- End label: `rounded-r-[inherit]` (matches wrapper's right radius)

### Size Scaling

Label sections scale typography with input size:
- `xs/sm`: `text-ds-sm`, `px-ds-02`
- `md`: `text-ds-sm`, `px-ds-03`
- `lg`: `text-ds-md`, `px-ds-03`

### Backward Compatibility

- `startSection={<Icon />}` → icon behavior (unchanged)
- `startSection="$"` → auto label (new, zero-config)
- `startIcon` (deprecated) → icon behavior (unchanged)
- `sectionWidthMap` still used for icon sections
- No breaking changes

## Files to Modify

1. `packages/core/src/ui/input.tsx` — flexbox layout, section type logic, label rendering
2. `packages/core/src/ui/input.stories.tsx` — label section stories
3. `packages/core/src/ui/input.test.tsx` — label section tests
4. `packages/core/docs/components/ui/input.md` — v0.29.0 entry
5. `packages/core/llms.txt` — update Input entry
