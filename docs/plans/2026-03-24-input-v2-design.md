# Input v2 — Design

**Date:** 2026-03-24
**Scope:** Rewrite Input with section-based icon handling, per-size scaling, container-level focus ring, interactive sections, and visual polish aligned with Button v2 and Badge v2.
**Packages:** `@devalok/shilp-sutra` (core)

---

## Research Basis

Synthesized from: Mantine Input (section-based icons, auto-padding, pointer-events control — the gold standard), Radix TextField (container focus ring, Slot pattern, click-to-focus), MUI TextField (flex adornments, InputAdornment), shadcn Input (aria-invalid styling, targeted transitions), Chakra Input (7 sizes, flushed variant).

---

## Design Principles

1. **Container-first.** The Input always renders inside a styled wrapper div. Focus ring, border, and background live on the wrapper — not the `<input>`. This means icons and the input are visually one unit.
2. **Section, not icon.** Renamed from `startIcon`/`endIcon` to `startSection`/`endSection`. Sections can hold icons, buttons, text ("$"), spinners — anything.
3. **Automatic padding.** When a section exists, the input padding adjusts automatically. No manual `pl-ds-07` hacks. Section width = input height (square by default).
4. **Pointer-events opt-in.** Sections are decorative by default (`pointer-events-none`). Pass `endSectionClickable` to make the section interactive.
5. **Aligned with the DS.** Uses Icon system, motion tokens, token-based sizes. Focus ring matches Button v2 (`ring-2 ring-accent-9 ring-offset-2`).

---

## The New Input API

```tsx
// Simple — same DX as before
<Input placeholder="Email" />

// With search icon
<Input startSection={<Icon icon={IconSearch} />} placeholder="Search..." />

// With clickable clear button
<Input
  endSection={value ? <Button variant="ghost" size="icon-xs" onClick={clear}><Icon icon={IconX} /></Button> : null}
  endSectionClickable
  placeholder="Search..."
/>

// With text prefix
<Input startSection={<span className="text-ds-sm text-surface-fg-muted">$</span>} placeholder="0.00" />

// With loading spinner
<Input endSection={<Spinner size="sm" />} placeholder="Searching..." />

// Error state (uses aria-invalid for CSS styling)
<Input state="error" placeholder="Invalid email" />

// All sizes
<Input size="xs" />  // 28px
<Input size="sm" />  // 32px
<Input size="md" />  // 40px (default)
<Input size="lg" />  // 48px
```

### Props

```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  state?: 'default' | 'error' | 'warning' | 'success'
  /** Leading section — icons, text, spinners. Decorative by default (pointer-events-none). */
  startSection?: React.ReactNode
  /** Trailing section — icons, buttons, spinners. Decorative by default. */
  endSection?: React.ReactNode
  /** Make start section interactive (pointer-events enabled). Default: false */
  startSectionClickable?: boolean
  /** Make end section interactive (pointer-events enabled). Default: false */
  endSectionClickable?: boolean

  // DEPRECATED — backward compat aliases
  /** @deprecated Use `startSection` instead */
  startIcon?: React.ReactNode
  /** @deprecated Use `endSection` instead */
  endIcon?: React.ReactNode
}
```

### Size System

| Size | Height | Horizontal padding | Font | Border radius | Section width | Icon size |
|------|--------|-------------------|------|---------------|---------------|-----------|
| `xs` | 28px (`h-ds-xs-plus`) | `px-ds-02` | `text-ds-sm` | `rounded-ds-md` | 26px | xs (14px) |
| `sm` | 32px (`h-ds-sm`) | `px-ds-03` | `text-ds-sm` | `rounded-ds-md` | 30px | sm (16px) |
| `md` | 40px (`h-ds-md`) | `px-ds-04` | `text-ds-md` | `rounded-ds-md` | 38px | md (18px) |
| `lg` | 48px (`h-ds-lg`) | `px-ds-05` | `text-ds-md` | `rounded-ds-lg` | 46px | lg (20px) |

Section width = input height - 2px (border). This creates a square area where the icon naturally centers.

### Padding With Sections

When a section is present, the input's padding on that side is replaced by the section width:

```css
/* No section: standard padding */
padding-left: var(--input-px);

/* With start section: padding = section width */
[data-has-start-section] input {
  padding-left: var(--section-width);
}
```

This is implemented via conditional className in the component, not CSS data attributes (since we use Tailwind).

### Container Architecture

```html
<!-- Always renders the wrapper — even without sections -->
<div class="relative flex items-center w-full rounded-ds-md border border-surface-border bg-surface-raised-hover
            focus-within:ring-2 focus-within:ring-accent-9 focus-within:ring-offset-2 focus-within:border-surface-border
            transition-[color,box-shadow,border-color] duration-fast-02 ease-productive-standard
            hover:bg-surface-raised-active">

  <!-- Start section: absolutely positioned, square, centered -->
  <span class="absolute left-0 h-full flex items-center justify-center pointer-events-none"
        style="width: var(--section-width)">
    <Icon icon={IconSearch} />
  </span>

  <!-- The actual input: no border/ring/bg (wrapper handles it) -->
  <input class="w-full h-full bg-transparent outline-none"
         style="padding-left: var(--section-width, var(--input-px))" />

  <!-- End section -->
  <span class="absolute right-0 h-full flex items-center justify-center pointer-events-none"
        style="width: var(--section-width)">
    <Icon icon={IconX} />
  </span>
</div>
```

Key change from current: the `<input>` has NO border, background, or focus ring. The wrapper div handles ALL of that. This means:
- Focus ring wraps the entire unit (input + icons)
- Hover state covers the whole container
- Error/warning border colors apply to the whole container
- No visual disconnect between icon and input

### State Styling

On the wrapper div:

| State | Border | Focus ring |
|-------|--------|------------|
| default | `border-surface-border` | `ring-accent-9` |
| error | `border-error-7` | `ring-error-7` |
| warning | `border-warning-7` | `ring-warning-7` |
| success | `border-success-7` | `ring-success-7` |

### Improvements Over v1

| Feature | v1 | v2 |
|---------|-----|-----|
| Icon positioning | One size fits all `left-ds-03` | Per-size, centered in square section |
| Focus ring | On `<input>` only | On container (whole unit) |
| Icon sizing | 2 tiers (ico-sm / ico-md) | 4 tiers via Icon system |
| Clickable icons | Never (pointer-events-none) | Opt-in per section |
| Naming | `startIcon`/`endIcon` | `startSection`/`endSection` (any content) |
| Padding with icon | Hardcoded `pl-ds-07` | Auto from section width |
| Container | Only renders when icons present | Always renders (consistent focus ring) |
| Transitions | `transition-colors` only | `transition-[color,box-shadow,border-color]` |
| Error styling | Via className on input | Via wrapper + aria-invalid |

### DevalokGrain

Input is grain-ready — the wrapper has `relative overflow-hidden`. A consumer could add `<DevalokGrain>` for a textured input, though this is unlikely to be used in practice (inputs should feel clean/functional, not textured).

### Backward Compatibility

`startIcon` and `endIcon` props kept as deprecated aliases that map to `startSection`/`endSection`. Existing code continues to work:

```tsx
// Old (still works, shows console warning in dev)
<Input startIcon={<IconSearch />} />

// New
<Input startSection={<Icon icon={IconSearch} />} />
```

### SearchInput

`SearchInput` wraps Input. After Input v2, SearchInput becomes simpler — it just passes `startSection={<Icon icon={IconSearch} />}` and `endSection={clearButton}` with `endSectionClickable`. No need for its own icon positioning logic.

---

## What Does NOT Change

- FormField integration (`useFormField` hook)
- Textarea — separate component, different interaction model
- NumberInput — wraps Input, will benefit from v2 automatically
- Combobox, Select — they have their own input rendering
