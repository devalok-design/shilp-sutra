# IconButton

- Import: @devalok/shilp-sutra/ui/icon-button
- Server-safe: No
- Category: ui

## Props
    icon: ReactElement (REQUIRED — use <Icon icon={...} />)
    aria-label: string (REQUIRED — WCAG AA mandatory)
    shape: "square" | "circle"
    size: "sm" | "md" | "lg"
    variant: same as Button (solid, soft, outline, ghost, link)
    color: same as Button (accent, error, success, warning, neutral)
    loading: boolean
    disabled: boolean

## Defaults
    shape: "square"
    size: "md"

## Example
```jsx
<IconButton icon={<Icon icon={IconEdit} />} variant="ghost" aria-label="Edit item" />
<IconButton icon={<Icon icon={IconX} />} shape="circle" variant="ghost" size="sm" aria-label="Close" />
<IconButton icon={<Icon icon={IconTrash} />} variant="solid" color="error" aria-label="Delete" />
```

## Composability
- **Built on Button internally** — inherits ALL Button features: variant, color, loading, onClickAsync, processing, ButtonGroup context consumption, asChild. Use IconButton when your button is icon-only; use Button for label-plus-icon.
- **aria-label is TypeScript-enforced** — the library makes it impossible to forget. This is the key accessibility constraint for icon-only buttons.
- **IconProvider cascade:** The `icon` prop expects `<Icon icon={...} />` — Icon auto-sizes based on IconButton's `size` via IconProvider context (no need to pass size to the nested Icon).
- **Inside ButtonGroup:** Inherits variant/color/size/weight from ButtonGroup context just like Button does. Useful for icon-only toolbars.
- **IconGroup vs ButtonGroup of IconButtons:** IconGroup is for static icon clusters (not interactive, or for decorative displays). ButtonGroup of IconButtons is for interactive toolbars where each icon is a button.

## Gotchas
- aria-label is enforced by TypeScript — you MUST provide it
- Prefer IconButton over Button with size="icon-*" for icon-only buttons
- `icon` prop should use `<Icon icon={...} />` wrapper (auto-sized via Button's IconProvider)

## Changes
### v0.29.0
- **Changed** `icon` prop now expects `<Icon icon={...} />` wrapper (auto-sized via Button's IconProvider context)
- **Changed** Inherits all new Button v2 colors: `accent`, `error`, `success`, `warning`, `neutral` (was `default`/`error` only)
- **Changed** Inherits Button v2 variants including new `soft` variant

### v0.1.0
- **Added** Initial release
