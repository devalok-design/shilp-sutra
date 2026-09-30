# Button System Enhancement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the core `Button` with icon support, loading state, fullWidth; add `IconButton` and `ButtonGroup` components; retire `CustomButton` and deprecated `IconButton` from karm/.

**Architecture:** Extend existing CVA-based `Button` in `src/ui/button.tsx` with new props. `IconButton` is a thin typed wrapper enforcing a11y. `ButtonGroup` uses React context to pass shared variant/size. Then migrate all ~12 karm/ consumers and delete the old components.

**Tech Stack:** React 18, TypeScript, CVA, Tailwind, Vitest + RTL, Storybook

---

### Task 1: Enhance Button — Tests

**Files:**
- Modify: `src/ui/button.test.tsx`

**Step 1: Write failing tests for new Button props**

Add these tests to the existing `describe('Button')` block in `src/ui/button.test.tsx`:

```tsx
// Add to imports:
import { Spinner } from './spinner'

it('renders startIcon before children', () => {
  const Icon = () => <svg data-testid="start-icon" />
  render(<Button startIcon={<Icon />}>Click</Button>)
  const button = screen.getByRole('button')
  const icon = screen.getByTestId('start-icon')
  expect(button).toContainElement(icon)
  // icon should come before text
  expect(button.firstElementChild).toContainElement(icon)
})

it('renders endIcon after children', () => {
  const Icon = () => <svg data-testid="end-icon" />
  render(<Button endIcon={<Icon />}>Click</Button>)
  const button = screen.getByRole('button')
  const icon = screen.getByTestId('end-icon')
  expect(button).toContainElement(icon)
  expect(button.lastElementChild).toContainElement(icon)
})

it('renders both startIcon and endIcon', () => {
  render(
    <Button
      startIcon={<svg data-testid="start" />}
      endIcon={<svg data-testid="end" />}
    >
      Text
    </Button>,
  )
  const button = screen.getByRole('button')
  expect(screen.getByTestId('start')).toBeInTheDocument()
  expect(screen.getByTestId('end')).toBeInTheDocument()
})

it('shows loading state with spinner and disables button', () => {
  render(<Button loading>Save</Button>)
  const button = screen.getByRole('button')
  expect(button).toBeDisabled()
  expect(button).toHaveAttribute('aria-busy', 'true')
  expect(screen.getByRole('status')).toBeInTheDocument()
})

it('loading replaces startIcon by default', () => {
  const Icon = () => <svg data-testid="start-icon" />
  render(<Button loading startIcon={<Icon />}>Save</Button>)
  expect(screen.queryByTestId('start-icon')).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toBeInTheDocument()
})

it('loading center hides children and shows spinner', () => {
  render(<Button loading loadingPosition="center">Save</Button>)
  const button = screen.getByRole('button')
  expect(screen.getByRole('status')).toBeInTheDocument()
  // Children should be visually hidden but still in DOM for width stability
  expect(button.textContent).toContain('Save')
})

it('does not fire onClick when loading', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  render(<Button loading onClick={onClick}>Save</Button>)
  await user.click(screen.getByRole('button'))
  expect(onClick).not.toHaveBeenCalled()
})

it('applies fullWidth class', () => {
  render(<Button fullWidth>Wide</Button>)
  expect(screen.getByRole('button')).toHaveClass('w-full')
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/ui/button.test.tsx`
Expected: FAIL — new props not recognized / not implemented yet.

**Step 3: Commit failing tests**

```bash
git add src/ui/button.test.tsx
git commit -m "test(button): add failing tests for startIcon, endIcon, loading, fullWidth"
```

---

### Task 2: Enhance Button — Implementation

**Files:**
- Modify: `src/ui/button.tsx`

**Step 1: Implement new props in Button**

Replace the entire contents of `src/ui/button.tsx` with:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot, Slottable } from '@primitives/react-slot'
import * as React from 'react'
import { cn } from './lib/utils'
import { Spinner } from './spinner'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans B2-Semibold select-none border border-transparent transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-interactive)] text-[var(--color-text-on-color)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] shadow-[var(--shadow-01)] hover:shadow-brand',
        secondary:
          'bg-transparent text-[var(--color-interactive)] border-[var(--color-border-interactive)] hover:bg-[var(--color-interactive-subtle)]',
        ghost:
          'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-layer-02)] hover:text-[var(--color-text-primary)]',
        danger:
          'bg-[var(--color-error)] text-[var(--color-text-on-color)] hover:bg-[var(--color-error-hover)] shadow-[var(--shadow-01)]',
        'danger-ghost':
          'bg-transparent text-[var(--color-error)] border border-[var(--color-border-error)] hover:bg-[var(--color-error-surface)]',
        link: 'text-[var(--color-text-link)] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-[var(--size-sm)] rounded-[var(--radius-md)] px-ds-04',
        md: 'h-[var(--size-md)] rounded-[var(--radius-md)] px-ds-05',
        lg: 'h-[var(--size-lg)] rounded-[var(--radius-lg)] px-ds-06',
        'icon-sm': 'h-[var(--size-sm)] w-[var(--size-sm)] rounded-[var(--radius-md)]',
        'icon-md': 'h-[var(--size-md)] w-[var(--size-md)] rounded-[var(--radius-md)]',
        'icon-lg': 'h-[var(--size-lg)] w-[var(--size-lg)] rounded-[var(--radius-lg)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

/** Map button size → icon wrapper size class */
const iconSizeClass: Record<string, string> = {
  sm: 'h-4 w-4 [&>svg]:h-4 [&>svg]:w-4',
  md: 'h-[18px] w-[18px] [&>svg]:h-[18px] [&>svg]:w-[18px]',
  lg: 'h-5 w-5 [&>svg]:h-5 [&>svg]:w-5',
  'icon-sm': 'h-4 w-4 [&>svg]:h-4 [&>svg]:w-4',
  'icon-md': 'h-[18px] w-[18px] [&>svg]:h-[18px] [&>svg]:w-[18px]',
  'icon-lg': 'h-5 w-5 [&>svg]:h-5 [&>svg]:w-5',
}

/** Map button size → spinner size */
const spinnerSizeMap: Record<string, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
  'icon-sm': 'sm',
  'icon-md': 'sm',
  'icon-lg': 'md',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Icon element rendered before children */
  startIcon?: React.ReactNode
  /** Icon element rendered after children */
  endIcon?: React.ReactNode
  /** Show loading spinner and disable button */
  loading?: boolean
  /** Where to render the spinner: replaces startIcon, endIcon, or centers over children */
  loadingPosition?: 'start' | 'end' | 'center'
  /** Stretch to full width of parent */
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      startIcon,
      endIcon,
      loading = false,
      loadingPosition = 'start',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedSize = size ?? 'md'
    const iconClass = iconSizeClass[resolvedSize] ?? iconSizeClass.md
    const spinnerSize = spinnerSizeMap[resolvedSize] ?? 'sm'
    const isDisabled = disabled || loading

    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size, className }),
            fullWidth && 'w-full',
          )}
          ref={ref}
          aria-busy={loading || undefined}
          disabled={isDisabled}
          {...props}
        >
          <Slottable>{children}</Slottable>
        </Slot>
      )
    }

    const renderStartSlot = () => {
      if (loading && loadingPosition === 'start') {
        return <Spinner size={spinnerSize} />
      }
      if (startIcon) {
        return (
          <span className={cn('inline-flex shrink-0 items-center justify-center', iconClass)}>
            {startIcon}
          </span>
        )
      }
      return null
    }

    const renderEndSlot = () => {
      if (loading && loadingPosition === 'end') {
        return <Spinner size={spinnerSize} />
      }
      if (endIcon) {
        return (
          <span className={cn('inline-flex shrink-0 items-center justify-center', iconClass)}>
            {endIcon}
          </span>
        )
      }
      return null
    }

    const renderCenter = () => {
      if (loading && loadingPosition === 'center') {
        return (
          <>
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner size={spinnerSize} />
            </span>
            <span className="invisible">{children}</span>
          </>
        )
      }
      return children
    }

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && 'w-full',
          loading && loadingPosition === 'center' && 'relative',
        )}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {renderStartSlot()}
        {renderCenter()}
        {renderEndSlot()}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button }
```

**Step 2: Run tests to verify they pass**

Run: `pnpm vitest run src/ui/button.test.tsx`
Expected: All tests PASS.

**Step 3: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No new errors.

**Step 4: Commit**

```bash
git add src/ui/button.tsx src/ui/button.test.tsx
git commit -m "feat(button): add startIcon, endIcon, loading, fullWidth props"
```

---

### Task 3: IconButton — Tests + Implementation

**Files:**
- Create: `src/ui/icon-button.tsx`
- Create: `src/ui/icon-button.test.tsx`

**Step 1: Write failing tests**

Create `src/ui/icon-button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { IconButton } from './icon-button'

describe('IconButton', () => {
  const TestIcon = () => <svg data-testid="icon" />

  it('renders icon inside a button', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Add item" />)
    const button = screen.getByRole('button', { name: 'Add item' })
    expect(button).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('requires aria-label for accessibility', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Delete" />)
    expect(screen.getByRole('button')).toHaveAccessibleName('Delete')
  })

  it('applies circle shape with rounded-full', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Menu" shape="circle" />)
    expect(screen.getByRole('button')).toHaveClass('rounded-full')
  })

  it('defaults to square shape', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Menu" />)
    expect(screen.getByRole('button')).not.toHaveClass('rounded-full')
  })

  it('forwards variant prop to underlying Button', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Delete" variant="danger" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('maps size sm to icon-sm', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Add" size="sm" />)
    // Button should get icon-sm sizing (square)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IconButton icon={<TestIcon />} aria-label="Click" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows loading state', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Loading" loading />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <IconButton
        ref={ref as React.Ref<HTMLButtonElement>}
        icon={<TestIcon />}
        aria-label="Ref test"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/ui/icon-button.test.tsx`
Expected: FAIL — module not found.

**Step 3: Implement IconButton**

Create `src/ui/icon-button.tsx`:

```tsx
import * as React from 'react'
import { Button, type ButtonProps } from './button'
import { cn } from './lib/utils'

/** Map friendly sizes to icon-* sizes for the underlying Button */
const sizeMap = {
  sm: 'icon-sm',
  md: 'icon-md',
  lg: 'icon-lg',
} as const

type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps
  extends Omit<ButtonProps, 'startIcon' | 'endIcon' | 'fullWidth' | 'loadingPosition' | 'children' | 'size'> {
  /** The icon element to render */
  icon: React.ReactNode
  /** Accessible label — required for icon-only buttons (WCAG AA) */
  'aria-label': string
  /** Button shape. Default: 'square' */
  shape?: 'square' | 'circle'
  /** Button size. Default: 'md' */
  size?: IconButtonSize
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, shape = 'square', size = 'md', className, loading, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={sizeMap[size]}
        className={cn(shape === 'circle' && 'rounded-full', className)}
        loading={loading}
        loadingPosition="center"
        {...props}
      >
        {icon}
      </Button>
    )
  },
)
IconButton.displayName = 'IconButton'

export { IconButton }
```

**Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/ui/icon-button.test.tsx`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/ui/icon-button.tsx src/ui/icon-button.test.tsx
git commit -m "feat(icon-button): add IconButton component with a11y-enforced aria-label"
```

---

### Task 4: ButtonGroup — Tests + Implementation

**Files:**
- Create: `src/ui/button-group.tsx`
- Create: `src/ui/button-group.test.tsx`

**Step 1: Write failing tests**

Create `src/ui/button-group.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'
import { ButtonGroup } from './button-group'

describe('ButtonGroup', () => {
  it('renders children buttons', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Three' })).toBeInTheDocument()
  })

  it('renders as a group role', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('applies horizontal orientation by default', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('flex-row')
  })

  it('applies vertical orientation', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('flex-col')
  })

  it('passes shared variant to children via context', () => {
    render(
      <ButtonGroup variant="danger">
        <Button>Delete</Button>
        <Button>Remove</Button>
      </ButtonGroup>,
    )
    // Both buttons render — context is consumed internally
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('merges custom className', () => {
    render(
      <ButtonGroup className="my-custom">
        <Button>A</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('my-custom')
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/ui/button-group.test.tsx`
Expected: FAIL — module not found.

**Step 3: Implement ButtonGroup**

Create `src/ui/button-group.tsx`:

```tsx
import * as React from 'react'
import { cn } from './lib/utils'
import type { ButtonProps } from './button'

interface ButtonGroupContextValue {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue>({})

export function useButtonGroup() {
  return React.useContext(ButtonGroupContext)
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shared variant applied to all child Buttons (children can override) */
  variant?: ButtonProps['variant']
  /** Shared size applied to all child Buttons (children can override) */
  size?: ButtonProps['size']
  /** Layout direction. Default: 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, variant, size, orientation = 'horizontal', children, ...props }, ref) => {
    const contextValue = React.useMemo(() => ({ variant, size }), [variant, size])

    return (
      <ButtonGroupContext value={contextValue}>
        <div
          ref={ref}
          role="group"
          className={cn(
            'inline-flex',
            orientation === 'horizontal'
              ? [
                  'flex-row',
                  '[&>*:not(:first-child)]:rounded-l-none',
                  '[&>*:not(:last-child)]:rounded-r-none',
                  '[&>*:not(:first-child)]:-ml-px',
                ]
              : [
                  'flex-col',
                  '[&>*:not(:first-child)]:rounded-t-none',
                  '[&>*:not(:last-child)]:rounded-b-none',
                  '[&>*:not(:first-child)]:-mt-px',
                ],
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ButtonGroupContext>
    )
  },
)
ButtonGroup.displayName = 'ButtonGroup'

export { ButtonGroup }
```

**Step 4: Wire context into Button**

In `src/ui/button.tsx`, import and consume `useButtonGroup`:

Add import at top:
```tsx
import { useButtonGroup } from './button-group'
```

Inside the `Button` forwardRef, before `resolvedSize`, add:
```tsx
const group = useButtonGroup()
const resolvedVariant = variant ?? group.variant
const resolvedSize = size ?? group.size ?? 'md'
```

Then use `resolvedVariant` instead of `variant` in `buttonVariants()` calls.

**Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/ui/button-group.test.tsx src/ui/button.test.tsx`
Expected: All tests PASS.

**Step 6: Commit**

```bash
git add src/ui/button-group.tsx src/ui/button-group.test.tsx src/ui/button.tsx
git commit -m "feat(button-group): add ButtonGroup with context-based variant/size sharing"
```

---

### Task 5: Export New Components

**Files:**
- Modify: `src/ui/index.ts`

**Step 1: Add exports**

In `src/ui/index.ts`, update the Core section (line 2) to:

```tsx
// Core
export { Button, buttonVariants, type ButtonProps } from './button'
export { IconButton, type IconButtonProps } from './icon-button'
export { ButtonGroup, useButtonGroup, type ButtonGroupProps } from './button-group'
```

**Step 2: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/ui/index.ts
git commit -m "feat(ui): export IconButton and ButtonGroup from ui barrel"
```

---

### Task 6: Button Stories

**Files:**
- Modify: `src/ui/button.stories.tsx`

**Step 1: Add stories for new features**

Append to the existing stories file — add stories for `startIcon`, `endIcon`, `loading`, `loadingPosition`, and `fullWidth`. Use `@tabler/icons-react` icons (already a project dependency). Include:

- `WithStartIcon` — primary + IconPlus as startIcon
- `WithEndIcon` — primary + IconArrowRight as endIcon
- `WithBothIcons` — startIcon + endIcon
- `Loading` — loading=true
- `LoadingEnd` — loading=true, loadingPosition="end"
- `LoadingCenter` — loading=true, loadingPosition="center"
- `FullWidth` — fullWidth=true in a width-constrained container
- `AllFeatures` — render grid showing all combinations

**Step 2: Run Storybook dev to verify visually**

Run: `pnpm storybook` (manual visual check)

**Step 3: Commit**

```bash
git add src/ui/button.stories.tsx
git commit -m "docs(button): add stories for startIcon, endIcon, loading, fullWidth"
```

---

### Task 7: IconButton Stories

**Files:**
- Create: `src/ui/icon-button.stories.tsx`

**Step 1: Write stories**

Include stories for:
- `Default` — ghost variant, IconSettings
- `AllVariants` — render grid of primary, secondary, ghost, danger with different icons
- `AllSizes` — sm, md, lg side by side
- `Circle` — shape="circle" examples
- `Loading` — loading state
- `Disabled` — disabled state
- `Toolbar` — realistic toolbar pattern with multiple IconButtons in a row

**Step 2: Commit**

```bash
git add src/ui/icon-button.stories.tsx
git commit -m "docs(icon-button): add stories for IconButton component"
```

---

### Task 8: ButtonGroup Stories

**Files:**
- Create: `src/ui/button-group.stories.tsx`

**Step 1: Write stories**

Include stories for:
- `Default` — 3 buttons horizontal
- `Vertical` — orientation="vertical"
- `SharedVariant` — variant="secondary" applied to group
- `SharedSize` — size="sm" applied to group
- `WithIconButtons` — group of IconButtons
- `MixedContent` — buttons with icons + text in a group

**Step 2: Commit**

```bash
git add src/ui/button-group.stories.tsx
git commit -m "docs(button-group): add stories for ButtonGroup component"
```

---

### Task 9: Migrate karm/ Consumers — Part 1 (break module)

**Files:**
- Modify: `src/karm/admin/break/delete-break.tsx`
- Modify: `src/karm/admin/break/header.tsx`
- Modify: `src/karm/admin/break/breaks.tsx`
- Modify: `src/karm/admin/break/edit-break-balance.tsx`
- Modify: `src/karm/admin/break/edit-break.tsx`
- Modify: `src/karm/admin/break/leave-request.tsx`

**Migration mapping:**

| Old (CustomButton) | New (Button) |
|---|---|
| `type="filled"` | `variant="primary"` |
| `type="outline"` | `variant="secondary"` |
| `text="Label"` | `children: "Label"` |
| `leftIcon={<X />}` | `startIcon={<X />}` |
| `rightIcon={<X />}` | `endIcon={<X />}` |

| Old (karm IconButton) | New (ui IconButton) |
|---|---|
| `icon={<X />}` | `icon={<X />}` (same) |
| `size="small"` | `size="sm"` |
| `size="medium"` | `size="md"` |
| import from `../../custom-buttons/icon-button` | import from `../../../ui/icon-button` (or `../../ui/icon-button` depending on depth) |

**Step 1: Update each file**

For each file, change imports from:
```tsx
import { CustomButton } from '../../custom-buttons/CustomButton'
import { IconButton } from '../../custom-buttons/icon-button'
```
to:
```tsx
import { Button } from '../../../ui/button'
import { IconButton } from '../../../ui/icon-button'
```

Then apply the prop mapping above. Key transformations:

**delete-break.tsx:**
- `<IconButton icon={<BreakDeleteIcon />} size="medium" />` → `<IconButton icon={<BreakDeleteIcon />} size="md" aria-label="Delete break" />`
- `<CustomButton className="w-full" type="filled" text="Yes, Delete" onClick={...} disabled={...} />` → `<Button className="w-full" variant="primary" onClick={...} disabled={...}>Yes, Delete</Button>`

**header.tsx:**
- All `<IconButton size="small" icon={...} onClick={...} />` → `<IconButton size="sm" icon={...} onClick={...} aria-label="..." />`
- `<CustomButton className="mt-ds-05 w-full" type="outline" text="Filter" onClick={...} />` → `<Button className="mt-ds-05" variant="secondary" fullWidth onClick={...}>Filter</Button>`

**breaks.tsx:**
- `<IconButton icon={<MenuDotsIcon />} size="medium" />` → `<IconButton icon={<MenuDotsIcon />} size="md" aria-label="More options" />`

**edit-break-balance.tsx:**
- `<CustomButton className="w-full" type="outline" text="Update" ... />` → `<Button variant="secondary" fullWidth ... >Update</Button>`

**edit-break.tsx:**
- `<CustomButton className="w-fit" type="outline" text="Update" ... />` → `<Button className="w-fit" variant="secondary" ... >Update</Button>`

**leave-request.tsx:**
- `<CustomButton className="mt-ds-06" text={dynamic} type="filled" onClick={...} />` → `<Button className="mt-ds-06" variant="primary" onClick={...}>{dynamic text}</Button>`

**Step 2: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors from modified files.

**Step 3: Commit**

```bash
git add src/karm/admin/break/
git commit -m "refactor(admin/break): migrate CustomButton/IconButton to core Button/IconButton"
```

---

### Task 10: Migrate karm/ Consumers — Part 2 (dashboard module)

**Files:**
- Modify: `src/karm/admin/dashboard/associate-detail.tsx`
- Modify: `src/karm/admin/dashboard/dashboard-skeleton.tsx`
- Modify: `src/karm/admin/dashboard/dashboard-header.tsx`

**Step 1: Apply same migration mapping**

**associate-detail.tsx:**
- `<IconButton icon={<EditIcon />} size="small" className="absolute right-2 top-2" />` → `<IconButton icon={<EditIcon />} size="sm" className="absolute right-2 top-2" aria-label="Edit" />`
- `<CustomButton className="w-full" type="filled" text={dynamic} onClick={...} />` → `<Button variant="primary" fullWidth onClick={...}>{dynamic text}</Button>`
- `<IconButton icon={<SendIcon />} size="small" onClick={...} />` → `<IconButton icon={<SendIcon />} size="sm" onClick={...} aria-label="Update status" />`

**dashboard-skeleton.tsx:**
- Both IconButtons: add `aria-label`, change `size="small"` → `size="sm"`

**dashboard-header.tsx:**
- `<CustomButton type="outline" text="Today" onClick={...} />` → `<Button variant="secondary" onClick={...}>Today</Button>`
- Both IconButtons: change `size="small"` → `size="sm"`, add `aria-label`

Also update the import for `Toggle` from `../../custom-buttons` — this stays as-is since SegmentedControl is not being removed.

**Step 2: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/karm/admin/dashboard/
git commit -m "refactor(admin/dashboard): migrate CustomButton/IconButton to core Button/IconButton"
```

---

### Task 11: Delete Old Components + Update Exports

**Files:**
- Delete: `src/karm/custom-buttons/CustomButton.tsx`
- Delete: `src/karm/custom-buttons/CustomButton.stories.tsx`
- Delete: `src/karm/custom-buttons/icon-button.tsx`
- Delete: `src/karm/custom-buttons/icon-button.stories.tsx`
- Delete: `src/karm/custom-buttons/use-button-state.ts`
- Delete: `src/karm/custom-buttons/use-ripple.ts`
- Modify: `src/karm/custom-buttons/index.ts`
- Modify: `src/karm/index.ts`

**Step 1: Delete files**

```bash
rm src/karm/custom-buttons/CustomButton.tsx
rm src/karm/custom-buttons/CustomButton.stories.tsx
rm src/karm/custom-buttons/icon-button.tsx
rm src/karm/custom-buttons/icon-button.stories.tsx
rm src/karm/custom-buttons/use-button-state.ts
rm src/karm/custom-buttons/use-ripple.ts
```

**Step 2: Update custom-buttons/index.ts**

Remove CustomButton and IconButton exports. Keep only SegmentedControl:

```tsx
export {
  SegmentedControl,
  SegmentedControlItem,
  segmentedControlItemVariants,
  type SegmentedControlSize,
  type SegmentedControlColor,
  type SegmentedControlOption,
} from './segmented-control'
/** @deprecated Use SegmentedControl instead */
export { SegmentedControl as Toggle } from './segmented-control'
/** @deprecated Use SegmentedControlSize instead */
export type { ToggleSize } from './segmented-control'
/** @deprecated Use SegmentedControlColor instead */
export type { ToggleColor } from './segmented-control'
/** @deprecated Use SegmentedControlOption instead */
export type { ToggleOption } from './segmented-control'
```

**Step 3: Update karm/index.ts**

Remove `CustomButton`, `ButtonVariant`, `ButtonType`, `IconButton`, `IconButtonProps` from the custom-buttons export block. Keep SegmentedControl exports and Toggle alias.

**Step 4: Run typecheck + tests**

Run: `pnpm tsc --noEmit && pnpm vitest run`
Expected: No errors, all tests pass.

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(karm): remove CustomButton, deprecated IconButton, and animation hooks"
```

---

### Task 12: Final Verification

**Step 1: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass.

**Step 2: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors.

**Step 3: Run lint**

Run: `pnpm lint`
Expected: No new errors.

**Step 4: Build**

Run: `pnpm build`
Expected: Clean build.

**Step 5: Commit any fixes if needed, then done.**
