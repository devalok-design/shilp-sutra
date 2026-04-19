# @devalok/shilp-sutra — Full Component Reference

> Exhaustive API reference for AI coding agents.
> For a concise cheatsheet, see llms.txt instead.
> All variant values and props verified from source CVA definitions.
>
> Package: @devalok/shilp-sutra
> Version: {{VERSION}}
>
> **If you are an AI agent reading this file top-to-bottom:** the Setup
> section below is authoritative. If any later per-component doc or a
> pre-0.37 history entry shows `tailwind.config.ts` / `presets: [shilpSutra]`
> / `@config`, that is HISTORICAL and does NOT apply on 0.37+.

---

## Setup (0.37.0+ — Tailwind 4 CSS-first)

**The only supported setup** is TW4 CSS-first. No JS preset, no `tailwind.config.ts` required from us.

```sh
pnpm add @devalok/shilp-sutra@next framer-motion
# Only if you render <Toaster />:
pnpm add sonner
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";

/* Your own extensions go in the same file */
@plugin "@tailwindcss/typography";
@source "./app/**/*.{ts,tsx}";
```

```ts
// next.config.ts
transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-brand'],
```

**Do NOT** import `@devalok/shilp-sutra/tailwind` in a `tailwind.config.ts`. That export is a deprecated no-op stub and logs a dev-mode `console.warn`. It is scheduled for removal in 0.38.

### Peer dependencies (0.37.0)

| Package | Role | Install when |
|---|---|---|
| `react`, `react-dom` | required peer | always |
| `tailwindcss ^4.0.0` | required peer | always |
| `framer-motion ^12.0.0` | required peer | always — module-scoped motion contexts must be single-copy |
| `sonner ^2.0.0` | optional peer | only if you render `<Toaster />` or call `toast()` |
| `@tabler/icons-react` | optional peer | if you use `Icon` / icon-bearing components |
| `@tanstack/react-table`, `@tanstack/react-virtual` | optional peer | if you use `DataTable` |
| `@tiptap/*` | optional peer | if you use `RichTextEditor` or `RichChatInput` |
| `react-pdf`, `react-zoom-pan-pinch` | optional peer | if you use `FilePreview` |
| `react-markdown`, `remark-gfm` | optional peer | if you use `MarkdownViewer` |
| `date-fns` | optional peer | if you use `DatePicker` / `ScheduleView` |
| `input-otp` | optional peer | if you use `InputOTP` |

### Token namespaces exposed by our `/css` import

| TW4 namespace | Generates utilities like | Our tokens |
|---|---|---|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `ring-*` | accent-1..12, secondary-1..12, surface-*, error-*, success-*, warning-*, info-*, category-*, link-* |
| `--spacing-ds-*` | `p-ds-03`, `m-ds-04`, `gap-ds-05`, `w-ds-md`, `h-ds-lg` | ds-namespaced to avoid collision with consumer numeric `p-4` etc. |
| `--text-ds-*` | `text-ds-md`, `text-ds-lg` | ds-namespaced; consumer `text-lg` still works |
| `--leading-ds-*` | `leading-ds-tight`, `leading-ds-normal` | ds-namespaced |
| `--tracking-*` | `tracking-tight`, `tracking-normal` | standard TW namespace |
| `--font-*`, `--font-weight-*` | `font-sans`, `font-semibold` | standard TW namespace |
| `--radius`, `--radius-ds-*` | `rounded` (bare), `rounded-ds-lg` | unprefixed + ds-namespaced |
| `--shadow-*` | `shadow-raised`, `shadow-overlay` | semantic names only; bare `shadow` is NOT generated (TW4 has no default scale and we don't define `--shadow`) |
| `--ease-*` | `ease-productive-standard` | semantic names |
| `--breakpoint-*` | `md:`, `lg:` | standard TW namespace |
| `--animate-*` | `animate-skeleton-shimmer`, `animate-processing-ants-*` | named animations |

### Utilities declared via `@utility` (not token-driven)

TW4 has no `--z-*` or `--duration-*` auto-namespace, so these are explicit:

- **Z-layer:** `z-base`, `z-raised`, `z-dropdown`, `z-sticky`, `z-overlay`, `z-modal`, `z-popover`, `z-toast`, `z-tooltip`
- **Named durations:** `duration-instant`, `duration-fast-01`, `duration-fast-02`, `duration-moderate-01`, `duration-moderate-01b`, `duration-moderate-02`, `duration-slow-01`, `duration-slow-02`
- **Typography composites:** `text-heading-{2xl|xl|lg|md|sm|xs}`, `text-body-{lg|md|sm|xs}`, `text-label-{lg|md|sm|xs}`, `text-label-plain-{lg|md|sm}`, `text-caption`, `text-overline`, `text-code`
- **Focus rings:** `focus-ring`, `focus-ring-inset`, `focus-ring-sm`
- **Touch target:** `touch-target` (44×44 WCAG hit area via `::before`)
- **Safe-area insets:** `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, `p-safe`
- **Number formatting:** `tabular-nums`

### Dark mode

`.dark` class-based. The `@custom-variant dark (&:where(.dark *))` declaration means `dark:` utilities apply to **descendants** of `.dark`, not the element itself. Put `.dark` on `<html>` (standard pattern for `next-themes`) or `<body>`.

### Dead in TW4 — do NOT generate these

| Dead pattern | Replacement |
|---|---|
| `w-[--var]` | `w-(--var)` |
| `theme(spacing.N)` inside arbitrary values | literal value |
| `bg-gradient-to-*` | `bg-linear-to-*` |
| bare `shadow` | `shadow-sm`, `shadow-raised`, etc. |
| `outline-none` | `outline-hidden` |
| `rounded-sm` | `rounded-xs` |
| `!prefix` | `suffix!` |

See `MIGRATION.md#v0370--tailwind-4-css-first-migration` (root of this package).

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
- Surface: --color-surface-{base,raised,sunken} + --color-surface-fg / fg-muted / fg-subtle / border / border-subtle
  - Border mapping: light mode border=step5, border-subtle=step3; dark mode border=step3, border-subtle=step2
  - Shell chrome (sidebar, topbar, bottom nav) uses surface-sunken with brand tint for recessed chrome
- Status: --color-{error,success,warning,info}-{3,7,9,11}
- Category: --color-category-{teal,amber,slate,indigo,cyan,orange,emerald}

Consumer rebranding: Override accent scale CSS vars or use generateScale(options) utility.

Tailwind utilities: accent-1..12, secondary-1..12, surface-base/raised/sunken, plus fg/border variants.

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
