# ColorInput

- Import: @devalok/shilp-sutra/ui/color-input
- Server-safe: No
- Category: ui
- Dependency: react-colorful (bundled, 2.8KB gzipped)

## Props
    value: string (hex color, e.g. "#d33163")
    onChange: (value: string) => void
    presets: { hex: string; label: string }[] | string[] | false (default: 10 named colors. Pass false to hide.)
    variant: "default" | "inline" (default: "default")
    showPicker: boolean (default: true — set false for swatches-only mode)
    defaultFormat: "hex" | "rgb" | "hsl" (default: "hex")
    align: "start" | "center" | "end" (popover alignment, default: "start")
    disabled: boolean
    className: string

## Defaults
    value="#000000", variant="default", showPicker=true, defaultFormat="hex", align="start", disabled=false

## Variants

**default** — Gradient swatch on left edge fading into surface background, hex text on right. Popover opens on click.

**inline** — Entire trigger IS the selected color. Hex text overlaid with contrast-aware color (white on dark, dark on light). Great for color tags, labels, and compact UIs.

## Popover Contents

1. Interactive gradient picker (saturation/brightness square + hue slider)
2. Format switcher (HEX / RGB / HSL) with animated sliding pill
3. Format-specific input fields (all editable, auto-converting)
4. Preset color swatches (10 named defaults, customizable)
5. Reset/Undo footer (appears when color has changed)

## Example
```jsx
<ColorInput
  value={color}
  onChange={setColor}
/>

// Inline variant
<ColorInput
  value={color}
  onChange={setColor}
  variant="inline"
/>

// Custom presets
<ColorInput
  value={color}
  onChange={setColor}
  presets={[
    { hex: '#C53637', label: 'Danger' },
    { hex: '#308639', label: 'Success' },
  ]}
/>

// Swatches only (no picker)
<ColorInput value={color} onChange={setColor} showPicker={false} />
```

## Composability
- **Built on Popover internally** — trigger opens a portal-rendered picker panel. z-popover (1400) stacking.
- **variant="default" vs "inline":** Default variant is an input-style trigger with gradient swatch + hex label (fits in forms). Inline variant IS the selected color — the entire trigger takes the color as its background with contrast-aware text. Use inline for color-tags in chat, lists, or tight toolbar UIs.
- **Controlled or uncontrolled:** Works both ways — pass `value` + `onChange` for controlled, or omit and let internal state track.
- **Presets are compositional:** Pass `{ hex, label }[]` for named brand colors (accessible, keyboard-navigable). Pass `false` to hide the preset strip entirely (picker-only mode).
- **react-colorful** is bundled (2.8KB gzipped) — zero additional setup. Picker itself is pointer-based; keyboard users edit via the HEX/RGB/HSL format inputs below.
- **FormField:** Not auto-consumed (no `state` prop). Wrap in FormField for label + helper text; style error visuals via className.

## Gotchas
- Value must be a 6-character hex string (e.g. "#d33163")
- Presets accept both `string[]` (backward-compatible) and `{ hex, label }[]` (recommended for accessibility)
- The interactive picker (react-colorful) is pointer-based — keyboard users can edit colors via the HEX/RGB/HSL format inputs
- Multiple ColorInput instances on the same page work correctly (unique layoutId per instance)
- Undo tracks discrete changes (preset clicks, field edits), not continuous picker drag — dragging pushes one undo entry

## Changes

### v0.28.0
- **Changed** Full redesign: replaced native `<input type="color">` with react-colorful interactive picker in a Popover
- **Added** `variant` prop: `"default"` (gradient trigger) and `"inline"` (color-as-background trigger)
- **Added** Multi-format input fields (HEX / RGB / HSL) with animated format switcher
- **Added** `showPicker`, `defaultFormat`, `align` props
- **Added** Reset/Undo functionality with footer UI
- **Added** Framer Motion animations throughout (triggers, format swap, presets)
- **Added** Internal state management — works both controlled and uncontrolled
- **Changed** `presets` prop now accepts `{ hex, label }[]` or `false` in addition to `string[]`
- **Fixed** Accessibility: label/input association, ARIA labels, input clamping

### v0.15.0
- **Changed** `md` size font standardized to `text-ds-md` (14px) from mixed values

### v0.8.0
- **Fixed** Added `aria-label` to hex color input

### v0.1.0
- **Added** Initial release
