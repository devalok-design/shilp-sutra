# Karm V2 Feature Request — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all 22 items from the Karm V2 feature request: 12 new components, 5 component modifications, and 5 documentation updates.

**Architecture:** New ui/ components for small primitives (ColorSwatch, StatusDot, ProgressRing). New composed/ components for pattern abstractions (MultiSelectPopover, FilterBar, InlineEdit, etc.). Modifications to existing CVA definitions for xs size. Karm package modifications for KanbanBoard and ChatPanel.

**Tech Stack:** React 18, TypeScript 5.7, CVA, Tailwind 3.4, Framer Motion, Vitest + RTL, Storybook

---

## Conventions

**Adding a new component** requires:
1. Create `packages/core/src/{ui,composed}/component-name.tsx`
2. Export from `packages/core/src/{ui,composed}/index.ts`
3. Add export path to `packages/core/package.json` exports map
4. Write test: `packages/core/src/{ui,composed}/component-name.test.tsx`
5. Write story: `packages/core/src/{ui,composed}/component-name.stories.tsx`

**`collectEntries()` in `vite.config.ts`** auto-discovers files in `src/ui/` and `src/composed/` — no vite config changes needed for new files.

**Package.json exports pattern:**
```json
"./ui/component-name": {
  "import": "./dist/ui/component-name.js",
  "default": "./dist/ui/component-name.js",
  "types": "./dist/ui/component-name.d.ts"
}
```

**Test pattern** (Vitest + RTL):
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
```

**Story pattern** (Storybook):
```tsx
import type { Meta, StoryObj } from '@storybook/react'
const meta: Meta<typeof Component> = { title: 'UI/Core/Name', component: Component, tags: ['autodocs'] }
export default meta
type Story = StoryObj<typeof Component>
```

**Size token reference:**
| Token | Value | Tailwind |
|-------|-------|----------|
| `--size-xs` | 24px | `h-ds-xs` |
| `--size-xs-plus` | 28px | `h-ds-xs-plus` |
| `--size-sm` | 32px | `h-ds-sm` |
| `--size-sm-plus` | 36px | `h-ds-sm-plus` |
| `--size-md` | 40px | `h-ds-md` |
| `--size-lg` | 48px | `h-ds-lg` |

**Font size reference:**
| Token | Value | Tailwind |
|-------|-------|----------|
| `--font-size-xs` | 10px | `text-ds-xs` |
| `--font-size-sm` | 12px | `text-ds-sm` |
| `--font-size-md` | 14px | `text-ds-md` |

---

## Task 1: `size="xs"` on Input, SelectTrigger, SearchInput, Button, Textarea

**Files:**
- Modify: `packages/core/src/ui/input.tsx` (line 26-30, CVA variants)
- Modify: `packages/core/src/ui/select.tsx` (line 43-47, CVA variants)
- Modify: `packages/core/src/ui/search-input.tsx` (line 10-16, sizeClasses)
- Modify: `packages/core/src/ui/button.tsx` (CVA size variants)
- Modify: `packages/core/src/ui/textarea.tsx` (CVA size variants)
- Test: `packages/core/src/ui/input.test.tsx`
- Test: `packages/core/src/ui/button.test.tsx`

The xs size maps to `h-ds-xs-plus` (28px) + `text-ds-sm` (12px) — NOT `h-ds-xs` (24px, too small for interactive controls) and NOT `text-ds-xs` (10px, too small to read).

**Step 1: Write failing tests**

Add to `input.test.tsx`:
```tsx
it('renders xs size with correct height class', () => {
  render(<Input size="xs" placeholder="Dense" />)
  expect(screen.getByPlaceholderText('Dense')).toHaveClass('h-ds-xs-plus')
})
```

Add to `button.test.tsx`:
```tsx
it('renders xs size', () => {
  render(<Button size="xs">Compact</Button>)
  expect(screen.getByRole('button')).toHaveClass('h-ds-xs-plus')
})

it('renders icon-xs size', () => {
  render(<Button size="icon-xs">X</Button>)
  const btn = screen.getByRole('button')
  expect(btn).toHaveClass('h-ds-xs-plus')
  expect(btn).toHaveClass('w-ds-xs-plus')
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm test -- --run input.test button.test`
Expected: FAIL — `xs` is not a valid size variant

**Step 3: Add xs to Input CVA**

In `input.tsx`, add to the `size` variants object (after line 27):
```tsx
xs: 'h-ds-xs-plus text-ds-sm px-ds-02',
```

Icon sizing for xs: same as sm (`[&>svg]:h-ico-sm [&>svg]:w-ico-sm`). Update the icon size conditional around line 106 to treat xs same as sm (the existing `size === 'lg'` check already covers this — xs/sm/md all use ico-sm).

**Step 4: Add xs to SelectTrigger CVA**

In `select.tsx`, add to the `size` variants object (after line 43):
```tsx
xs: 'h-ds-xs-plus text-ds-sm px-ds-02',
```

**Step 5: Add xs to SearchInput sizeClasses**

In `search-input.tsx`, update the `SearchInputSize` type and `sizeClasses`:
```tsx
type SearchInputSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClasses: Record<SearchInputSize, string> = {
  xs: 'h-ds-xs-plus text-ds-sm pl-ds-07 pr-ds-06',
  sm: 'h-ds-sm text-ds-sm pl-ds-08 pr-ds-07',
  md: 'h-ds-md text-ds-md pl-[2.5rem] pr-[2.25rem]',
  lg: 'h-ds-lg text-ds-md pl-[3rem] pr-[2.5rem]',
}
```

Also scale down the search icon for xs: add a conditional for the leading `IconSearch` element so xs uses `h-ico-sm w-ico-sm` (already 16px, fine as-is — no change needed).

**Step 6: Add xs to Button CVA**

In `button.tsx`, add to the `size` variants:
```tsx
xs: 'h-ds-xs-plus rounded-ds-sm px-ds-03 text-ds-sm',
'icon-xs': 'h-ds-xs-plus w-ds-xs-plus rounded-ds-sm',
```

Update icon sizing map and spinner sizing map to include xs and icon-xs entries (same as sm: ico-sm and spinner-sm).

**Step 7: Add xs to Textarea CVA**

In `textarea.tsx`, add to the `size` variants:
```tsx
xs: 'min-h-[48px] text-ds-sm px-ds-02 py-ds-02',
```

**Step 8: Run tests to verify they pass**

Run: `cd packages/core && pnpm test -- --run input.test button.test`
Expected: PASS

**Step 9: Run full test suite + typecheck**

Run: `cd packages/core && pnpm typecheck && pnpm test -- --run`
Expected: All pass

**Step 10: Commit**

```
feat(ui): add size="xs" dense variant to Input, Select, SearchInput, Button, Textarea

28px height + 12px text for compact filter bars and dense UI contexts.
Maps to h-ds-xs-plus (--size-xs-plus: 28px) + text-ds-sm (--font-size-sm: 12px).
```

---

## Task 2: ColorSwatch Component

**Files:**
- Create: `packages/core/src/ui/color-swatch.tsx`
- Create: `packages/core/src/ui/color-swatch.test.tsx`
- Create: `packages/core/src/ui/color-swatch.stories.tsx`
- Modify: `packages/core/src/ui/index.ts` (add export)
- Modify: `packages/core/package.json` (add export path)

**Step 1: Write failing test**

```tsx
// color-swatch.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ColorSwatch } from './color-swatch'

describe('ColorSwatch', () => {
  it('renders with given color', () => {
    render(<ColorSwatch color="#FF5733" data-testid="swatch" />)
    const el = screen.getByTestId('swatch')
    expect(el).toHaveStyle({ backgroundColor: '#FF5733' })
  })

  it('defaults to circle shape', () => {
    render(<ColorSwatch color="#000" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('rounded-full')
  })

  it('renders square shape', () => {
    render(<ColorSwatch color="#000" shape="square" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).not.toHaveClass('rounded-full')
  })

  it('renders ring border when ring prop is set', () => {
    render(<ColorSwatch color="#FFF" ring data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('shadow-ring-sm')
  })

  it('applies size classes', () => {
    render(<ColorSwatch color="#000" size="lg" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('h-6')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm test -- --run color-swatch.test`

**Step 3: Implement ColorSwatch**

```tsx
// color-swatch.tsx
import * as React from 'react'
import { cn } from './lib/utils'

const sizeMap = {
  sm: 'h-3 w-3',      // 12px
  md: 'h-4 w-4',      // 16px
  lg: 'h-6 w-6',      // 24px
} as const

const shapeMap = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-ds-sm',
} as const

export interface ColorSwatchProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Any valid CSS color string (hex, rgb, oklch, etc.) */
  color: string
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** @default 'circle' */
  shape?: 'circle' | 'square' | 'rounded'
  /** Show subtle ring border — useful for light colors that blend into background */
  ring?: boolean
}

const ColorSwatch = React.forwardRef<HTMLSpanElement, ColorSwatchProps>(
  ({ color, size = 'md', shape = 'circle', ring = false, className, style, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-block shrink-0',
        sizeMap[size],
        shapeMap[shape],
        ring && 'shadow-ring-sm',
        className,
      )}
      style={{ backgroundColor: color, ...style }}
      role="presentation"
      {...props}
    />
  ),
)
ColorSwatch.displayName = 'ColorSwatch'

export { ColorSwatch }
```

**Step 4: Run test to verify it passes**

**Step 5: Add barrel export + package.json export**

In `ui/index.ts` add:
```tsx
export { ColorSwatch, type ColorSwatchProps } from './color-swatch'
```

In `package.json` exports, add (alphabetical order, after `./ui/code`):
```json
"./ui/color-swatch": {
  "import": "./dist/ui/color-swatch.js",
  "default": "./dist/ui/color-swatch.js",
  "types": "./dist/ui/color-swatch.d.ts"
},
```

**Step 6: Write story**

```tsx
// color-swatch.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ColorSwatch } from './color-swatch'

const meta: Meta<typeof ColorSwatch> = {
  title: 'UI/Core/ColorSwatch',
  component: ColorSwatch,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ColorSwatch>

export const Default: Story = { args: { color: '#6366F1' } }
export const WithRing: Story = { args: { color: '#FAFAFA', ring: true } }
export const Square: Story = { args: { color: '#F59E0B', shape: 'square', size: 'lg' } }
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-03">
      <ColorSwatch color="#EF4444" size="sm" />
      <ColorSwatch color="#EF4444" size="md" />
      <ColorSwatch color="#EF4444" size="lg" />
    </div>
  ),
}
```

**Step 7: Typecheck + full test**

Run: `cd packages/core && pnpm typecheck && pnpm test -- --run`

**Step 8: Commit**

```
feat(ui): add ColorSwatch component for dynamic runtime color display
```

---

## Task 3: StatusDot Component

**Files:**
- Create: `packages/core/src/ui/status-dot.tsx`
- Create: `packages/core/src/ui/status-dot.test.tsx`
- Create: `packages/core/src/ui/status-dot.stories.tsx`
- Modify: `packages/core/src/ui/index.ts`
- Modify: `packages/core/package.json`

**Step 1: Write failing test**

```tsx
// status-dot.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusDot } from './status-dot'

describe('StatusDot', () => {
  it('renders with healthy status', () => {
    render(<StatusDot status="healthy" data-testid="dot" />)
    expect(screen.getByTestId('dot')).toBeInTheDocument()
  })

  it('renders label text when provided', () => {
    render(<StatusDot status="warning" label="Degraded" />)
    expect(screen.getByText('Degraded')).toBeInTheDocument()
  })

  it('has pulse animation for healthy status by default', () => {
    render(<StatusDot status="healthy" data-testid="dot" />)
    expect(screen.getByTestId('dot').querySelector('[data-pulse]')).toBeInTheDocument()
  })

  it('does not pulse for non-healthy statuses by default', () => {
    render(<StatusDot status="critical" data-testid="dot" />)
    expect(screen.getByTestId('dot').querySelector('[data-pulse]')).not.toBeInTheDocument()
  })

  it('pulses when pulse prop is explicitly set', () => {
    render(<StatusDot status="critical" pulse data-testid="dot" />)
    expect(screen.getByTestId('dot').querySelector('[data-pulse]')).toBeInTheDocument()
  })

  it('supports all status values', () => {
    const statuses = ['healthy', 'warning', 'critical', 'neutral', 'inactive'] as const
    statuses.forEach(s => {
      const { unmount } = render(<StatusDot status={s} data-testid="dot" />)
      expect(screen.getByTestId('dot')).toBeInTheDocument()
      unmount()
    })
  })
})
```

**Step 2: Implement StatusDot**

```tsx
// status-dot.tsx
import * as React from 'react'
import { cn } from './lib/utils'

type Status = 'healthy' | 'warning' | 'critical' | 'neutral' | 'inactive'

const dotColorMap: Record<Status, string> = {
  healthy: 'bg-success-9',
  warning: 'bg-warning-9',
  critical: 'bg-error-9',
  neutral: 'bg-neutral-8',
  inactive: 'bg-neutral-6',
}

const textColorMap: Record<Status, string> = {
  healthy: 'text-success-11',
  warning: 'text-warning-11',
  critical: 'text-error-11',
  neutral: 'text-surface-fg-muted',
  inactive: 'text-surface-fg-subtle',
}

const pulseColorMap: Record<Status, string> = {
  healthy: 'bg-success-9/40',
  warning: 'bg-warning-9/40',
  critical: 'bg-error-9/40',
  neutral: 'bg-neutral-8/40',
  inactive: 'bg-neutral-6/40',
}

const sizeMap = {
  sm: { dot: 'h-1.5 w-1.5', pulse: 'h-1.5 w-1.5', text: 'text-ds-xs' },
  md: { dot: 'h-2 w-2', pulse: 'h-2 w-2', text: 'text-ds-sm' },
  lg: { dot: 'h-2.5 w-2.5', pulse: 'h-2.5 w-2.5', text: 'text-ds-sm' },
} as const

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: Status
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Pulse animation. Default: true for 'healthy', false for others */
  pulse?: boolean
  /** Inline label text after the dot */
  label?: string
  labelClassName?: string
}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ status, size = 'md', pulse, label, labelClassName, className, ...props }, ref) => {
    const shouldPulse = pulse ?? status === 'healthy'
    const s = sizeMap[size]

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center gap-ds-02', className)}
        {...props}
      >
        <span className="relative inline-flex">
          {shouldPulse && (
            <span
              data-pulse
              className={cn('absolute inline-flex rounded-full animate-ping', s.pulse, pulseColorMap[status])}
            />
          )}
          <span className={cn('relative inline-flex rounded-full', s.dot, dotColorMap[status])} />
        </span>
        {label && (
          <span className={cn(s.text, textColorMap[status], 'font-sans', labelClassName)}>
            {label}
          </span>
        )}
      </span>
    )
  },
)
StatusDot.displayName = 'StatusDot'

export { StatusDot }
```

**Step 3: Run tests, add exports, write story, typecheck**

Follow same pattern as Task 2 for barrel export, package.json export, and story.

Story should include: Default (healthy), AllStatuses grid, WithLabels, Sizes, PulsingCritical.

**Step 4: Commit**

```
feat(ui): add StatusDot component for health/presence indicators
```

---

## Task 4: Card Accent Border

**Files:**
- Modify: `packages/core/src/ui/card.tsx`
- Modify: `packages/core/src/ui/card.stories.tsx`

**Step 1: Add accent props to CardProps**

```tsx
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
  /** Position of accent border strip */
  accent?: 'left' | 'top' | 'right' | 'bottom'
  /** Color of accent border. Requires accent position to be set. */
  accentColor?: 'default' | 'secondary' | 'error' | 'success' | 'warning' | 'info'
}
```

**Step 2: Implement accent via data attributes + CSS**

Add accent color map:
```tsx
const accentColorMap: Record<string, string> = {
  default: 'var(--color-accent-9)',
  secondary: 'var(--color-secondary-9)',
  error: 'var(--color-error-9)',
  success: 'var(--color-success-9)',
  warning: 'var(--color-warning-9)',
  info: 'var(--color-info-9)',
}
```

In the Card component, add accent rendering logic. The accent is a `::before` pseudo-element. Since we can't use pseudo-elements directly in Tailwind without arbitrary selectors getting messy, use a real child `<span>` element positioned absolute:

```tsx
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, accent, accentColor = 'default', ...props }, ref) => {
    const classes = cn(
      cardVariants({ variant }),
      accent && 'relative overflow-hidden',
      interactive && 'hover:shadow-raised-hover hover:border-surface-border-strong cursor-pointer ...',
      className,
    )

    const accentEl = accent && (
      <span
        aria-hidden
        className={cn(
          'absolute pointer-events-none',
          accent === 'left' && 'left-0 top-0 bottom-0 w-[3px] rounded-l-ds-lg',
          accent === 'top' && 'top-0 left-0 right-0 h-[3px] rounded-t-ds-lg',
          accent === 'right' && 'right-0 top-0 bottom-0 w-[3px] rounded-r-ds-lg',
          accent === 'bottom' && 'bottom-0 left-0 right-0 h-[3px] rounded-b-ds-lg',
        )}
        style={{ backgroundColor: accentColorMap[accentColor] }}
      />
    )

    if (interactive) {
      return (
        <motion.div ref={ref} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={springs.snappy} className={classes} {...motionProps(props)}>
          {accentEl}
          {props.children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {accentEl}
        {props.children}
      </div>
    )
  },
)
```

Note: Card currently spreads `{...props}` which includes children. When accent is present, we need to explicitly render `{props.children}` alongside `{accentEl}`. Destructure `children` from props in both branches.

**Step 3: Write test**

Create `packages/core/src/ui/card.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders accent element when accent prop is set', () => {
    const { container } = render(<Card accent="left" accentColor="error">Content</Card>)
    const accent = container.querySelector('[aria-hidden="true"]')
    expect(accent).toBeInTheDocument()
    expect(accent).toHaveStyle({ backgroundColor: 'var(--color-error-9)' })
  })

  it('does not render accent when prop is not set', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('adds overflow-hidden when accent is set', () => {
    const { container } = render(<Card accent="top">Content</Card>)
    expect(container.firstChild).toHaveClass('overflow-hidden')
  })
})
```

**Step 4: Update stories, typecheck, test, commit**

```
feat(ui): add accent border variant to Card (left/top/right/bottom + semantic colors)
```

---

## Task 5: DataTable Column align + hideBelow

**Files:**
- Modify: `packages/core/src/ui/data-table.tsx`

**Step 1: Find header and cell render locations**

In `data-table.tsx`, find where `<th>` and `<td>` elements are rendered. Add alignment and responsive visibility classes by reading `column.columnDef.meta`.

**Step 2: Add TypeScript augmentation**

At the top of `data-table.tsx` (or in a types file), augment TanStack's `ColumnMeta`:
```tsx
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'center' | 'right'
    hideBelow?: 'sm' | 'md' | 'lg'
  }
}
```

**Step 3: Apply alignment classes**

In the header cell render: read `column.columnDef.meta?.align` and add:
- `'right'` → `'text-right tabular-nums'`
- `'center'` → `'text-center'`

In the body cell render: same logic.

**Step 4: Apply responsive visibility**

In both header and body cells: read `column.columnDef.meta?.hideBelow` and add:
- `'sm'` → `'hidden sm:table-cell'`
- `'md'` → `'hidden md:table-cell'`
- `'lg'` → `'hidden lg:table-cell'`

**Step 5: Test, typecheck, commit**

```
feat(ui): add column align and hideBelow to DataTable via column meta
```

---

## Task 6: MultiSelectPopover (generalize MemberPicker)

**Files:**
- Create: `packages/core/src/composed/multi-select-popover.tsx`
- Create: `packages/core/src/composed/multi-select-popover.test.tsx`
- Create: `packages/core/src/composed/multi-select-popover.stories.tsx`
- Modify: `packages/core/src/composed/member-picker.tsx` (thin wrapper)
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Step 1: Write failing test**

```tsx
// multi-select-popover.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MultiSelectPopover } from './multi-select-popover'

const items = [
  { id: '1', label: 'Alice' },
  { id: '2', label: 'Bob' },
  { id: '3', label: 'Charlie' },
]

describe('MultiSelectPopover', () => {
  it('renders trigger children', () => {
    render(
      <MultiSelectPopover items={items} value={[]} onValueChange={() => {}}>
        <button>Select</button>
      </MultiSelectPopover>
    )
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('opens popover on trigger click and shows items', async () => {
    const user = userEvent.setup()
    render(
      <MultiSelectPopover items={items} value={[]} onValueChange={() => {}}>
        <button>Select</button>
      </MultiSelectPopover>
    )
    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('calls onValueChange when item is toggled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <MultiSelectPopover items={items} value={[]} onValueChange={onChange}>
        <button>Select</button>
      </MultiSelectPopover>
    )
    await user.click(screen.getByRole('button', { name: 'Select' }))
    await user.click(screen.getByText('Alice'))
    expect(onChange).toHaveBeenCalledWith(['1'])
  })

  it('filters items by search', async () => {
    const user = userEvent.setup()
    render(
      <MultiSelectPopover items={items} value={[]} onValueChange={() => {}}>
        <button>Select</button>
      </MultiSelectPopover>
    )
    await user.click(screen.getByRole('button', { name: 'Select' }))
    await user.type(screen.getByRole('textbox'), 'Ali')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('shows empty message when no items match', async () => {
    const user = userEvent.setup()
    render(
      <MultiSelectPopover items={items} value={[]} onValueChange={() => {}} emptyMessage="No results">
        <button>Select</button>
      </MultiSelectPopover>
    )
    await user.click(screen.getByRole('button', { name: 'Select' }))
    await user.type(screen.getByRole('textbox'), 'zzz')
    expect(screen.getByText('No results')).toBeInTheDocument()
  })
})
```

**Step 2: Implement MultiSelectPopover**

Build from the existing MemberPicker pattern but generalized:
- `Popover` + `PopoverContent` + `PopoverTrigger`
- Internal search input (plain `<input>` with IconSearch, same as MemberPicker)
- Scrollable item list with checkmark indicators
- Toggle logic: if id in value, remove it; else add it
- Groups: render with sticky section headers using `<Text variant="label-sm">`
- Optional `renderItem` for custom item rendering
- Async `onSearch`: when provided, call debounced, show Spinner during fetch, replace items with results

**Step 3: Refactor MemberPicker as thin wrapper**

```tsx
// member-picker.tsx — keep backward compat
import { MultiSelectPopover, type MultiSelectItem } from './multi-select-popover'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { getInitials } from './lib/string-utils'

export interface MemberPickerMember {
  id: string
  name: string
  avatar?: string
}

export interface MemberPickerProps {
  members: MemberPickerMember[]
  selectedIds: string[]
  onSelect: (memberId: string) => void
  multiple?: boolean
  placeholder?: string
  children: React.ReactNode
}

export function MemberPicker({ members, selectedIds, onSelect, multiple = false, placeholder, children }: MemberPickerProps) {
  const items: MultiSelectItem[] = members.map(m => ({ id: m.id, label: m.name, image: m.avatar }))

  function handleChange(ids: string[]) {
    // Find which id was toggled (added or removed)
    const added = ids.find(id => !selectedIds.includes(id))
    const removed = selectedIds.find(id => !ids.includes(id))
    onSelect(added ?? removed ?? '')
  }

  return (
    <MultiSelectPopover
      items={items}
      value={selectedIds}
      onValueChange={handleChange}
      searchPlaceholder={placeholder}
      renderItem={(item) => (
        <div className="flex items-center gap-ds-03">
          <Avatar className="h-ico-md w-ico-md">
            {item.image && <AvatarImage src={item.image} alt={item.label} />}
            <AvatarFallback className="bg-surface-raised-hover text-ds-xs font-semibold text-surface-fg">
              {getInitials(item.label)}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate text-ds-md font-body text-surface-fg">{item.label}</span>
        </div>
      )}
    >
      {children}
    </MultiSelectPopover>
  )
}
```

**Step 4: Run tests, exports, story, typecheck, commit**

```
feat(composed): add MultiSelectPopover — generic multi-select with search, groups, async

Refactors MemberPicker as thin wrapper for backward compat.
```

---

## Task 7: FilterBar Compound Component

**Files:**
- Create: `packages/core/src/composed/filter-bar.tsx`
- Create: `packages/core/src/composed/filter-bar.test.tsx`
- Create: `packages/core/src/composed/filter-bar.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Implementation notes:**

FilterBar is a compound component with React context for size propagation.

```tsx
// filter-bar.tsx core structure:
const FilterBarContext = React.createContext<{ size: 'xs' | 'sm' | 'md' }>({ size: 'sm' })

function FilterBar({ searchValue, onSearchChange, searchPlaceholder, onClearAll, size = 'sm', children, className }: FilterBarProps) {
  const hasActiveFilters = /* derived from children or explicit prop */
  return (
    <FilterBarContext.Provider value={{ size }}>
      <div className={cn('flex flex-wrap items-center gap-ds-03', className)}>
        {onSearchChange && (
          <SearchInput
            size={size}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={searchValue ? () => onSearchChange('') : undefined}
            placeholder={searchPlaceholder}
            className="w-48"
          />
        )}
        {children}
        {onClearAll && (
          <Button variant="ghost" size={size} onClick={onClearAll}>
            Clear all
          </Button>
        )}
      </div>
    </FilterBarContext.Provider>
  )
}

function FilterSelect({ label, value, onValueChange, options, allLabel = 'All' }: FilterSelectProps) {
  const { size } = React.useContext(FilterBarContext)
  const isFiltered = value !== '' && value !== 'all'
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger size={size} className={cn('w-40', isFiltered && 'border-accent-7')}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
```

FilterMultiSelect wraps MultiSelectPopover with a Badge count on the trigger.

**Tests:** Renders search, shows filter selects, clear all button appears when filters active.

**Commit:**
```
feat(composed): add FilterBar compound component (SearchInput + FilterSelect + FilterMultiSelect)
```

---

## Task 8: InlineEdit Component

**Files:**
- Create: `packages/core/src/composed/inline-edit.tsx`
- Create: `packages/core/src/composed/inline-edit.test.tsx`
- Create: `packages/core/src/composed/inline-edit.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Key implementation:**
- State machine: `idle` → `editing` → `saving` → `idle`
- Idle: render `<Text>` with `cursor-pointer`, `hover:decoration-dashed hover:underline hover:decoration-surface-fg-subtle` affordance
- Click or keyboard Enter: switch to `<Input>` (or `<Textarea>` if `multiline`), auto-focus, select all text
- Enter (single-line) / Cmd+Enter (multiline): commit — trim, compare to original, call `onSave` if changed
- Escape: revert to original, switch to idle
- Blur: same as commit
- If `onSave` returns Promise: set `saving=true`, show `<Spinner>` inside input, disable

**Tests:** Renders text in idle mode, switches to input on click, saves on Enter, cancels on Escape, reverts to original on Escape, calls onSave with trimmed value, shows spinner when saving (async).

**Commit:**
```
feat(composed): add InlineEdit — click-to-edit text component
```

---

## Task 9: MasterDetail Layout

**Files:**
- Create: `packages/core/src/composed/master-detail.tsx`
- Create: `packages/core/src/composed/master-detail.test.tsx`
- Create: `packages/core/src/composed/master-detail.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Implementation:**
- Desktop: CSS grid `grid-cols-[var(--master-w)_1fr]`
- Mobile detection: media query via `useMediaQuery` (from hooks, or implement inline with `window.matchMedia`)
- Mobile: show List when `selected` is null, show Detail when selected. Animated with `AnimatePresence` + `motion.div`
- Back button: auto-rendered in detail view on mobile, calls `onBack`
- `MasterDetail.ListItem`: `<button>` with `data-active` attribute, hover/active states

**Tests:** Renders list children, renders detail children, applies active class to selected list item.

**Commit:**
```
feat(composed): add MasterDetail responsive layout component
```

---

## Task 10: MarkdownViewer

**Files:**
- Create: `packages/core/src/composed/markdown-viewer.tsx`
- Create: `packages/core/src/composed/markdown-viewer.test.tsx`
- Create: `packages/core/src/composed/markdown-viewer.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Dependencies:** `react-markdown`, `remark-gfm` — add to core devDependencies (they get bundled).

**Implementation:**
- Wrap `<ReactMarkdown>` with custom component mappings
- All elements use design system tokens (see design doc for full token mapping table)
- `compact` prop reduces heading sizes and spacing
- `allowHtml={false}` default (XSS-safe)
- Code blocks: lazy-load `react-syntax-highlighter/dist/esm/styles/prism` for syntax highlighting. Fallback: plain `<pre><code>` with `bg-surface-sunken`.

**Tests:** Renders paragraph, renders heading, renders code block, renders link with target, renders list, XSS-safe by default.

**Commit:**
```
feat(composed): add MarkdownViewer with design system tokens
```

---

## Task 11: FormSection Component

**Files:**
- Create: `packages/core/src/composed/form-section.tsx`
- Create: `packages/core/src/composed/form-section.test.tsx`
- Create: `packages/core/src/composed/form-section.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Implementation:**
- Simple: `Text variant="heading-sm"` + optional `Text variant="body-sm"` description + `Separator` + children
- When `collapsible`: wrap title row in `Collapsible` + `CollapsibleTrigger`, children in `CollapsibleContent`
- Chevron rotation animation on collapse/expand

**Tests:** Renders title, renders description, renders children, collapses/expands when collapsible.

**Commit:**
```
feat(composed): add FormSection for structured form layouts
```

---

## Task 12: BulkActionBar (Standalone)

**Files:**
- Create: `packages/core/src/composed/bulk-action-bar.tsx`
- Create: `packages/core/src/composed/bulk-action-bar.test.tsx`
- Create: `packages/core/src/composed/bulk-action-bar.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Implementation:**
- Portal-rendered (`createPortal` to `document.body`)
- Fixed bottom bar: `fixed bottom-ds-06 left-1/2 -translate-x-1/2 z-50`
- `AnimatePresence` + `motion.div` slide-up for enter/exit
- Shows: count Badge, action buttons with icons, dismiss IconButton
- Uses `bg-surface-overlay shadow-floating rounded-ds-lg border border-surface-border`

**Tests:** Not visible when show=false, renders count and actions when show=true, calls action onClick, calls onClearSelection on dismiss.

**Commit:**
```
feat(composed): add standalone BulkActionBar for multi-select contexts
```

---

## Task 13: DeadlineIndicator

**Files:**
- Create: `packages/core/src/composed/deadline-indicator.tsx`
- Create: `packages/core/src/composed/deadline-indicator.test.tsx`
- Create: `packages/core/src/composed/deadline-indicator.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Implementation:**
- Compute `minutesRemaining = (deadline - now) / 60000`
- Color: `> warningThreshold` → success, `> criticalThreshold` → warning, `> 0` → error, `≤ 0` → error bold
- Text: use `date-fns/formatDistanceToNow` for relative format
- Optional `IconClock` prefix when `showIcon`
- Renders as `<span>` with semantic color classes

**Tests:** Shows green text for far deadline, yellow for warning range, red for critical, "Overdue" for past deadline.

**Commit:**
```
feat(composed): add DeadlineIndicator for SLA/due date displays
```

---

## Task 14: EmojiPicker

**Files:**
- Create: `packages/core/src/composed/emoji-picker.tsx`
- Create: `packages/core/src/composed/emoji-picker.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Dependencies:** `@emoji-mart/react`, `@emoji-mart/data` — add to core devDependencies (bundled as lazy chunk).

**Implementation:**
- `React.lazy(() => import('@emoji-mart/react'))` inside a `Suspense` with `<Skeleton>` fallback
- SSR guard: `typeof window === 'undefined'` → return null
- Theme: `'auto'` reads `document.documentElement.classList.contains('dark')`
- `EmojiPickerPopover`: wraps in `Popover`

**Tests:** Minimal — verify SSR-safe (no crash in JSDOM), verify popover trigger renders. Full emoji-mart testing is deferred to Storybook visual tests.

**Commit:**
```
feat(composed): add EmojiPicker with lazy-loaded emoji-mart integration
```

---

## Task 15: ProgressRing

**Files:**
- Create: `packages/core/src/ui/progress-ring.tsx`
- Create: `packages/core/src/ui/progress-ring.test.tsx`
- Create: `packages/core/src/ui/progress-ring.stories.tsx`
- Modify: `packages/core/src/ui/index.ts`
- Modify: `packages/core/package.json`

**Implementation:**
- SVG `<circle>` with `stroke-dasharray` = circumference, `stroke-dashoffset` = circumference × (1 - value/max)
- Track circle: `stroke="var(--color-surface-sunken)"` (background ring)
- Value circle: color mapped from `color` prop to semantic token
- Animated via Framer Motion's `motion.circle` with `animate={{ strokeDashoffset }}` and `springs.smooth`
- Size maps: sm=32px, md=48px, lg=64px (viewBox scales, stroke-width proportional)
- `showValue`: render `<text>` in center with percentage
- Multi-ring (`MultiProgressRing`): concentric circles with decreasing radii

**Tests:** Renders SVG, applies correct dashoffset for given value, renders label text when showValue.

**Commit:**
```
feat(ui): add ProgressRing circular progress indicator (single + multi-ring)
```

---

## Task 16: ResponsiveOverlay

**Files:**
- Create: `packages/core/src/composed/responsive-overlay.tsx`
- Create: `packages/core/src/composed/responsive-overlay.test.tsx`
- Create: `packages/core/src/composed/responsive-overlay.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Implementation:**
- Uses `useMediaQuery` or `useIsMobile` to detect viewport
- Desktop: renders `Dialog` + `DialogContent` + `DialogHeader` + `DialogTitle`
- Mobile: renders `Sheet` (side="bottom") + `SheetContent` + `SheetHeader` + `SheetTitle`
- Shared children passed through
- `open` / `onOpenChange` forwarded to whichever overlay renders

**Tests:** Renders dialog content (JSDOM defaults to desktop viewport).

**Commit:**
```
feat(composed): add ResponsiveOverlay (Dialog on desktop, Sheet on mobile)
```

---

## Task 17: FilePreview

**Files:**
- Create: `packages/core/src/composed/file-preview.tsx`
- Create: `packages/core/src/composed/file-preview.stories.tsx`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/package.json`

**Dependencies:** `react-zoom-pan-pinch`, `react-pdf` — add to core devDependencies (lazy-loaded chunks).

**Implementation:**
- Auto-detect type from `mimeType` or URL extension: image/*, application/pdf, video/*, audio/*, embed patterns (figma.com, loom.com, youtube.com)
- Each sub-renderer is lazy-loaded:
  - `ImagePreview`: `react-zoom-pan-pinch` `TransformWrapper` + `TransformComponent`
  - `PdfPreview`: `react-pdf` `Document` + `Page` with prev/next buttons
  - `VideoPreview`: native `<video controls>`
  - `AudioPreview`: native `<audio controls>`
  - `EmbedPreview`: responsive `<iframe>` with loading Skeleton
- All wrapped in `Suspense` with `<Skeleton>` fallback
- Error boundary fallback: "Could not load preview" + download link

**Tests:** Minimal — verify render without crash for each type (mocked lazy imports in test). Full testing via Storybook.

**Commit:**
```
feat(composed): add FilePreview for images, PDFs, video, audio, and embeds
```

---

## Task 18: KanbanBoard Completed Column Toggle

**Files:**
- Modify: `packages/karm/src/board/kanban-board.tsx` (BoardProviderProps)
- Modify: `packages/karm/src/board/board-column.tsx` (toggle button in header)
- Modify: `packages/karm/src/board/board-context.tsx` (new props in context)

**Step 1: Add props to BoardProviderProps**

```tsx
completedColumnId?: string
showCompleted?: boolean
onToggleCompleted?: (show: boolean) => void
```

**Step 2: In BoardColumn rendering**

When `columnId === completedColumnId`:
- Render toggle button in column header (IconEye / IconEyeOff)
- When `showCompleted === false`: collapse column to just header + count badge
- Animate with `AnimatePresence` on task cards

**Step 3: Test, typecheck, commit**

```
feat(karm/board): add completed column toggle (completedColumnId + showCompleted props)
```

---

## Task 19: KanbanBoard Mobile View

**Files:**
- Modify: `packages/karm/src/board/kanban-board.tsx`
- Create: `packages/karm/src/board/board-list-view.tsx` (mobile list renderer)

**Step 1: Add props**

```tsx
mobileView?: 'scroll' | 'list'       // default 'scroll'
mobileBreakpoint?: 'sm' | 'md'       // default 'md'
```

**Step 2: Implement list view**

New `BoardListView` component: flat list grouped by column, column headers as sticky section dividers, each task renders as `TaskCardCompact`. Uses `useMediaQuery` to detect breakpoint.

**Step 3: In KanbanBoard, conditional render**

```tsx
const isMobile = useMediaQuery(`(max-width: ${breakpoints[mobileBreakpoint]})`)
if (isMobile && mobileView === 'list') return <BoardListView ... />
// else: existing board render
```

**Step 4: Test, typecheck, commit**

```
feat(karm/board): add mobile list view mode (mobileView="list")
```

---

## Task 20: ChatPanel Agent Selector Enhancement

**Files:**
- Modify: `packages/karm/src/chat/chat-panel.tsx` (Agent interface + selector UI)

**Step 1: Extend Agent interface**

```tsx
export interface Agent {
  id: string
  name: string
  desc: string
  icon?: React.ReactNode
  capabilities?: string[]
  status?: 'online' | 'offline' | 'busy'
}
```

All new fields are optional — backward compatible.

**Step 2: Upgrade selector from DropdownMenu to Popover**

Replace the existing agent DropdownMenu with a Popover that shows:
- Agent icon (or `<Avatar>` with first letter if no icon)
- Name + desc
- Capability `<Chip size="xs">` tags
- `<StatusDot>` for status

**Step 3: Test, typecheck, commit**

```
feat(karm/chat): enhance agent selector with icon, capabilities, and status
```

---

## Task 21: Documentation Updates

**Files:**
- Modify: `packages/core/llms.txt`
- Modify: `packages/core/llms-full.txt`

**Updates needed:**

1. **StatCard onClick/href** — Add to llms-full.txt StatCard section: document `onClick`, `href`, `accent` props with examples.

2. **DataTable density** — Add to llms-full.txt DataTable section:
   ```
   density?: 'compact' | 'standard' | 'comfortable'
   compact: 4px cell padding (py-ds-02)
   standard: 16px cell padding (py-ds-05)
   comfortable: 32px cell padding (py-ds-07)
   Default: 'standard'
   ```

3. **DataTable selectableFilter** — Add usage example:
   ```tsx
   selectableFilter={(row) => row.status === 'PENDING'}
   // Only PENDING rows get checkboxes; other rows are non-selectable
   ```

4. **DataTable align + hideBelow** (new) — Document `meta: { align, hideBelow }`.

5. **Category color tokens** — Add to llms.txt under token system:
   ```
   Category colors: teal | amber | slate | indigo | cyan | orange | emerald
   Utilities: bg-category-{color}-{3|7|9|11}, text-category-{color}-{3|7|9|11}, border-category-{color}-{3|7|9|11}
   Use for: badges, tags, labels, board column accents, category indicators
   ```

6. **Focus ring utilities** — Add to llms.txt:
   ```
   .focus-ring — double-ring (2px surface + 2px accent), use on interactive custom elements
   .focus-ring-inset — inset ring, use on buttons over solid backgrounds
   .focus-ring-sm — 1px subtle ring, use on inputs and small controls
   ```

7. **All new components** — Add quick-reference entries to llms.txt and full API docs to llms-full.txt for: ColorSwatch, StatusDot, ProgressRing, MultiSelectPopover, FilterBar, InlineEdit, MasterDetail, MarkdownViewer, FormSection, BulkActionBar, DeadlineIndicator, EmojiPicker, FilePreview, ResponsiveOverlay.

8. **xs size variant** — Document in llms.txt and llms-full.txt for Input, Select, SearchInput, Button, Textarea.

**Commit:**
```
docs: update llms.txt and llms-full.txt with all new components and features
```

---

## Task 22: Final — Typecheck, Test, Build, Verify

**Step 1:** Run full pipeline:
```bash
cd packages/core && pnpm typecheck && pnpm lint && pnpm test -- --run && pnpm build
```

**Step 2:** Run karm pipeline:
```bash
cd packages/karm && pnpm typecheck && pnpm build
```

**Step 3:** Verify no surface-1 violations:
```bash
node scripts/pre-publish-audit.mjs
```

**Step 4:** Commit any fixes, then prepare for publish (separate `/publish-release` session).
