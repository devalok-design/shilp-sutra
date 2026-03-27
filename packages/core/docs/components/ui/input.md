# Input

- Import: @devalok/shilp-sutra/ui/input
- Server-safe: No
- Category: ui

## Props
    size: "xs" | "sm" | "md" | "lg"
    state: InputState
    startSection: ReactNode (icon or content in the leading slot)
    endSection: ReactNode (icon or content in the trailing slot)
    startSectionClickable: boolean (enables pointer events on start section)
    endSectionClickable: boolean (enables pointer events on end section)
    startSectionType: 'icon' | 'label' (section display type — auto-inferred from content)
    endSectionType: 'icon' | 'label' (section display type — auto-inferred from content)
    wrapperClassName: string (classes for the wrapper div — border, bg, ring)
    startIcon: ReactNode (@deprecated — use startSection)
    endIcon: ReactNode (@deprecated — use endSection)
    (plus all standard HTML input attributes except native "size")

## Types
    InputState = 'default' | 'error' | 'warning' | 'success'

## Defaults
    size: "md"

## Example
```jsx
<Input type="email" placeholder="you@example.com" state="error" startSection={<Icon icon={IconMail} />} />
<Input size="xs" placeholder="Quick search" startSection={<Icon icon={IconSearch} />} />
<Input startSection="https://" startSectionType="label" placeholder="example.com" />
<Input endSection=".00" endSectionType="label" startSection={<Icon icon={IconCurrencyDollar} />} placeholder="0" />
```

## Gotchas
- HTML native "size" attribute is excluded — use CSS width instead
- state="error" sets aria-invalid automatically
- Inside FormField: auto-inherits state, aria-describedby, aria-required from context (explicit props override)
- `className` targets the `<input>` element; use `wrapperClassName` for border/bg/ring overrides
- Focus ring is on the wrapper container (focus-within), not the input itself
- Icons in startSection/endSection are auto-sized via IconProvider per input size
- Sections are `pointer-events-none` by default — set `startSectionClickable`/`endSectionClickable` for interactive sections
- Section type is auto-inferred: strings default to `'label'` (tinted bg + border), React elements default to `'icon'` (fixed-width centered). Override with `startSectionType`/`endSectionType`.

## Changes
### v0.29.0
- **Changed** v2 rewrite: container-first architecture with wrapper div holding focus ring
- **Added** `xs` size (28px height)
- **Added** `startSection` / `endSection` props replacing `startIcon` / `endIcon` (deprecated but still work)
- **Added** `startSectionClickable` / `endSectionClickable` props for interactive sections
- **Added** `wrapperClassName` prop for styling the wrapper div (border, bg, ring)
- **Changed** Focus ring now on wrapper via `focus-within` (container-level ring, not input-level)
- **Changed** Icons auto-sized via `IconProvider` context per input size
- **Deprecated** `startIcon` / `endIcon` — use `startSection` / `endSection`
- **Added** `startSectionType` / `endSectionType` props — `'icon'` (fixed-width centered cell) or `'label'` (tinted background with border separator). Auto-inferred from content type (strings → label, React elements → icon).
- **Changed** Sections use flexbox layout for consistent alignment
- **Deprecated** `inputVariants` export — use `inputWrapperVariants` (semantics changed to target wrapper)

### v0.15.0
- **Changed** `lg` size font changed from `text-ds-lg` (18px) to `text-ds-md` (14px) — all input sizes now use 14px for consistency
- **Changed** `md` size font standardized to `text-ds-md` (14px) from mixed values

### v0.12.0
- **Changed** Softer resting border (`border-border-subtle` instead of `border-border`), subtler focus ring (`ring-1 ring-focus/50` instead of `ring-2 ring-focus`)
- **Changed** Reverted split `pl-*/pr-*` size variants back to `px-*`; icon padding uses `pl-ds-07`/`pr-ds-07`

### v0.8.0
- **Fixed** Now consumes FormField context automatically (`aria-describedby`, `aria-invalid`, `aria-required`)

### v0.4.2
- **Added** `inputVariants` export

### v0.1.0
- **Added** Initial release
