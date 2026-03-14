# @devalok/shilp-sutra — Full Component Reference

> Exhaustive API reference for AI coding agents.
> For a concise cheatsheet, see llms.txt instead.
> All variant values and props verified from source CVA definitions.
>
> Package: @devalok/shilp-sutra
> Version: {{VERSION}}

---

## Architecture Notes

### The Two-Axis Variant System

Many components use TWO props where shadcn/ui uses one:
- `variant` controls SHAPE/SURFACE: solid, outline, ghost, subtle, filled, etc.
- `color` controls INTENT/SEMANTICS: default, error, success, warning, info, etc.

Components with two-axis system: Button, Badge, Alert, Chip, Banner, Progress, StatusBadge

### Server-Safe Components (no "use client")

These can be imported directly in Next.js Server Components:
- UI: Text, Skeleton, Stack, Container, Table (and sub-components), Code, VisuallyHidden
- Composed: ContentCard, PageHeader, LoadingSkeleton, PageSkeletons, PriorityIndicator
- NOTE (v0.18.0): Spinner, EmptyState, StatusBadge are NO LONGER server-safe (Framer Motion dependency)

Use per-component imports for server components:
  import { Text } from '@devalok/shilp-sutra/ui/text'
  import { PageHeader } from '@devalok/shilp-sutra/composed/page-header'

DO NOT use barrel imports in Server Components — they include "use client" components.

### Token Architecture — OKLCH 12-Step System

Color tokens use OKLCH (perceptually uniform) with 12 functional steps per palette:

| Step | Purpose | Example usage |
|------|---------|---------------|
| 1 | App background | Page bg, body |
| 2 | Subtle background | Sidebar, card alt |
| 3 | Component bg | Input bg, badge bg |
| 4 | Component bg hover | Button hover state |
| 5 | Border subtle | Semantic `surface-border` in light mode |
| 6 | Border default | Semantic `surface-border-strong` in light mode |
| 7 | Border strong | Focus rings, emphasis borders |
| 8 | Border emphasis | High-contrast outlines |
| 9 | Solid / accent | Button bg, primary CTA |
| 10 | Solid hover | Button hover bg |
| 11 | Low-contrast text | Secondary accent text |
| 12 | High-contrast text | Headings on light bg |

Semantic layer:
- Accent (swappable): --color-accent-{1-12} + --color-accent-fg
- Secondary: --color-secondary-{1-12} + --color-secondary-fg
- Surface: --color-surface-{1-4} + --color-surface-fg / fg-muted / fg-subtle / border / border-strong
  - Border mapping: light mode border=step5, border-strong=step6; dark mode border=step3, border-strong=step4
  - Shell chrome (sidebar, topbar, bottom nav) uses surface-2 for elevation above surface-1 app background
- Status: --color-{error,success,warning,info}-{3,7,9,11}
- Category: --color-category-{teal,amber,slate,indigo,cyan,orange,emerald}

Consumer rebranding: Override accent scale CSS vars or use generateScale(options) utility.

Tailwind utilities: accent-1..12, secondary-1..12, surface-1..4, plus fg/border variants.

### Toast Setup Pattern

1. Mount <Toaster /> once at your root layout.
2. Import { toast } from '@devalok/shilp-sutra/ui/toast' and call toast.success(), toast.error(), etc.
3. Types: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'message'

### Form Accessibility Pattern

Use <FormField> + useFormField() hook:
  <FormField state="error">
    <Label htmlFor="email">Email</Label>
    <Input id="email" state="error" />
    <FormHelperText>Error message here.</FormHelperText>
  </FormField>

useFormField() returns { state, helperTextId, required } from context.
Wire manually: <Input aria-describedby={helperTextId} aria-invalid={state === 'error'} />

Note: getFormFieldA11y() was removed in favor of useFormField() hook.
