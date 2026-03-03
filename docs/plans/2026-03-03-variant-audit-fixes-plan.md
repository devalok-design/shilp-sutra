# Variant Audit Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 5 confirmed bugs and add priority variant gaps identified by the 9-expert council audit, organized into 4 independent parallel batches.

**Architecture:** 4 parallel branches (one per batch), each targeting a distinct component domain with no file overlap. Merge in any order after all batches pass CI. All changes use the existing CVA + Tailwind token pattern established in the codebase. Tests first.

**Tech Stack:** React 18, TypeScript 5.7 strict, CVA (class-variance-authority), Tailwind 3.4, Vitest + RTL (pnpm test), pnpm

---

## HOW TO READ THIS PLAN

Each batch is fully independent. Batches can be executed in **parallel by separate agents**, each on its own branch:
- **Batch 1:** `git checkout -b fix/form-layer`
- **Batch 2:** `git checkout -b fix/data-display`
- **Batch 3:** `git checkout -b fix/chip-tags`
- **Batch 4:** `git checkout -b fix/system-coherence`

Run all tests: `pnpm test`
Run one test file: `pnpm vitest run src/ui/input.test.tsx`
Build check: `pnpm build`
TypeScript check: `pnpm typecheck`

Token reference (for class names in Tailwind): all `ds-*` tokens come from the tailwind preset. Use class names like `h-ds-sm`, `h-ds-md`, `h-ds-lg`, `px-ds-03`, `px-ds-04`, `px-ds-05`.

---

## BATCH 1 — Form Layer

**Branch:** `fix/form-layer`
**Files:** `src/ui/input.tsx`, `src/ui/select.tsx`, `src/ui/textarea.tsx`, `src/ui/search-input.tsx`, `src/ui/form.tsx`, `src/ui/alert.tsx`, `src/ui/banner.tsx`

---

### Task 1.1: Input — size variants + adornments

**Files:**
- Modify: `src/ui/input.tsx`
- Test: `src/ui/input.test.tsx` (add tests to existing file)

**Step 1: Add failing tests**

Open `src/ui/input.test.tsx` and add these tests inside the existing `describe` block:

```tsx
it('renders with sm size class', () => {
  render(<Input size="sm" />)
  expect(screen.getByRole('textbox')).toHaveClass('h-ds-sm')
})

it('renders with md size class (default)', () => {
  render(<Input />)
  expect(screen.getByRole('textbox')).toHaveClass('h-ds-md')
})

it('renders with lg size class', () => {
  render(<Input size="lg" />)
  expect(screen.getByRole('textbox')).toHaveClass('h-ds-lg')
})

it('renders startIcon with compensating left padding', () => {
  const Icon = () => <svg data-testid="start-icon" />
  render(<Input startIcon={<Icon />} />)
  expect(screen.getByTestId('start-icon')).toBeInTheDocument()
  expect(screen.getByRole('textbox')).toHaveClass('pl-ds-09')
})

it('renders endIcon with compensating right padding', () => {
  const Icon = () => <svg data-testid="end-icon" />
  render(<Input endIcon={<Icon />} />)
  expect(screen.getByTestId('end-icon')).toBeInTheDocument()
  expect(screen.getByRole('textbox')).toHaveClass('pr-ds-09')
})

it('wraps in relative div when icon is present', () => {
  const Icon = () => <svg data-testid="icon" />
  const { container } = render(<Input startIcon={<Icon />} />)
  expect(container.firstChild).toHaveClass('relative')
})
```

**Step 2: Run tests to verify they fail**

```
pnpm vitest run src/ui/input.test.tsx
```
Expected: 6 new tests fail with "Property 'size' does not exist" or similar.

**Step 3: Implement**

Replace the full content of `src/ui/input.tsx` with:

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

export type InputState = 'default' | 'error' | 'warning' | 'success'

const inputVariants = cva(
  [
    'flex w-full font-sans',
    'bg-field text-text-primary',
    'border border-border rounded-ds-md',
    'placeholder:text-text-placeholder',
    'hover:bg-field-hover',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-border-interactive',
    'disabled:cursor-not-allowed disabled:opacity-[0.38]',
    'read-only:bg-layer-02 read-only:cursor-default',
  ],
  {
    variants: {
      size: {
        sm: 'h-ds-sm px-ds-03 text-ds-sm',
        md: 'h-ds-md px-ds-04 text-ds-md',
        lg: 'h-ds-lg px-ds-05 text-ds-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  state?: InputState
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state, size, startIcon, endIcon, ...props }, ref) => {
    const input = (
      <input
        type={type}
        className={cn(
          inputVariants({ size }),
          state === 'error' && 'border-border-error focus-visible:ring-error',
          state === 'warning' && 'border-border-warning focus-visible:ring-warning',
          state === 'success' && 'border-border-success focus-visible:ring-success',
          startIcon && 'pl-ds-09',
          endIcon && 'pr-ds-09',
          !startIcon && !endIcon && className,
        )}
        aria-invalid={state === 'error' || undefined}
        ref={ref}
        {...props}
      />
    )

    if (!startIcon && !endIcon) return input

    return (
      <div className={cn('relative flex items-center', className)}>
        {startIcon && (
          <span className="pointer-events-none absolute left-ds-03 flex items-center text-icon-secondary [&>svg]:h-ico-sm [&>svg]:w-ico-sm">
            {startIcon}
          </span>
        )}
        {input}
        {endIcon && (
          <span className="pointer-events-none absolute right-ds-03 flex items-center text-icon-secondary [&>svg]:h-ico-sm [&>svg]:w-ico-sm">
            {endIcon}
          </span>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input, inputVariants }
```

**Step 4: Run tests**

```
pnpm vitest run src/ui/input.test.tsx
```
Expected: All tests pass.

**Step 5: Also export `inputVariants` from the UI index**

In `src/ui/index.ts`, find the Input export line and update it:
```ts
// Before:
export { Input, type InputProps, type InputState } from './input'
// After:
export { Input, inputVariants, type InputProps, type InputState } from './input'
```

**Step 6: Commit**

```bash
git add src/ui/input.tsx src/ui/input.test.tsx src/ui/index.ts
git commit -m "feat(input): add size variants (sm/md/lg) and startIcon/endIcon adornments"
```

---

### Task 1.2: SelectTrigger — size variant

**Files:**
- Modify: `src/ui/select.tsx`

SelectTrigger currently hardcodes `h-ds-md`. We need to add a `size` prop.

**Step 1: No separate test file needed** — the existing `src/ui/__tests__/select-a11y.test.tsx` covers Select. Add one test there:

```tsx
it('renders SelectTrigger with sm size', () => {
  render(
    <Select>
      <SelectTrigger size="sm">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
    </Select>
  )
  expect(screen.getByRole('combobox')).toHaveClass('h-ds-sm')
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/__tests__/select-a11y.test.tsx
```

**Step 3: Implement**

In `src/ui/select.tsx`, update `SelectTrigger`:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const selectTriggerVariants = cva(
  'flex w-full items-center justify-between whitespace-nowrap rounded-ds-md border border-border bg-field placeholder:text-text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:border-border-interactive disabled:cursor-not-allowed disabled:opacity-[0.38] [&>span]:line-clamp-1',
  {
    variants: {
      size: {
        sm: 'h-ds-sm px-ds-03 py-ds-02 text-ds-sm',
        md: 'h-ds-md px-ds-04 py-ds-03 text-ds-md',
        lg: 'h-ds-lg px-ds-05 py-ds-04 text-ds-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
    VariantProps<typeof selectTriggerVariants>
>(({ className, size, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(selectTriggerVariants({ size }), className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <IconChevronDown className="h-ico-sm w-ico-sm opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
```

**Step 4: Run tests**

```
pnpm vitest run src/ui/__tests__/select-a11y.test.tsx
```

**Step 5: Commit**

```bash
git add src/ui/select.tsx src/ui/__tests__/select-a11y.test.tsx
git commit -m "feat(select): add size variant to SelectTrigger (sm/md/lg)"
```

---

### Task 1.3: Textarea + SearchInput — size variants

**Files:**
- Modify: `src/ui/textarea.tsx`
- Modify: `src/ui/search-input.tsx`

**Step 1: Textarea — implement size**

In `src/ui/textarea.tsx`, add a `size` prop (import cva, VariantProps):

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const textareaVariants = cva(
  [
    'flex w-full font-sans',
    'min-h-20 resize-y',
    'bg-field text-text-primary',
    'border border-border rounded-ds-md',
    'placeholder:text-text-placeholder hover:bg-field-hover',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-border-interactive',
    'disabled:cursor-not-allowed disabled:opacity-[0.38]',
    'read-only:bg-layer-02 read-only:cursor-default',
  ],
  {
    variants: {
      size: {
        sm: 'px-ds-03 py-ds-02 text-ds-sm',
        md: 'px-ds-04 py-ds-03 text-ds-md',
        lg: 'px-ds-05 py-ds-04 text-ds-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  state?: InputState
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, size, ...props }, ref) => (
    <textarea
      className={cn(
        textareaVariants({ size }),
        state === 'error' && 'border-border-error focus-visible:ring-error',
        state === 'warning' && 'border-border-warning focus-visible:ring-warning',
        state === 'success' && 'border-border-success focus-visible:ring-success',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
```

Also add `import type { InputState } from './input'` at the top (already present — keep it).

**Step 2: SearchInput — add size**

In `src/ui/search-input.tsx`, update the interface and the inner `<input>` height:

```tsx
export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Inside the component, replace the hardcoded 'h-ds-md' in the input className:
const heightClass = size === 'sm' ? 'h-ds-sm' : size === 'lg' ? 'h-ds-lg' : 'h-ds-md'

// Then in the input's className, replace 'h-ds-md pl-10 pr-9' with:
// `${heightClass} pl-10 pr-9`
```

**Step 3: Run full test suite**

```
pnpm test
```
Expected: All pass. No test file needed for Textarea/SearchInput (simple prop addition, no behavioural change).

**Step 4: Commit**

```bash
git add src/ui/textarea.tsx src/ui/search-input.tsx
git commit -m "feat(textarea,search-input): add size variant (sm/md/lg)"
```

---

### Task 1.4: FormField — context bridge

**Files:**
- Modify: `src/ui/form.tsx`
- Test: `src/ui/form.test.tsx` (create new file)

**Step 1: Create the failing test**

Create `src/ui/form.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormField, FormHelperText } from './form'

describe('FormField context', () => {
  it('propagates error state to FormHelperText via context', () => {
    render(
      <FormField state="error">
        <FormHelperText>Error message</FormHelperText>
      </FormField>,
    )
    expect(screen.getByText('Error message')).toHaveClass('text-text-error')
  })

  it('propagates warning state to FormHelperText via context', () => {
    render(
      <FormField state="warning">
        <FormHelperText>Warning message</FormHelperText>
      </FormField>,
    )
    expect(screen.getByText('Warning message')).toHaveClass('text-text-warning')
  })

  it('allows FormHelperText to override context state', () => {
    render(
      <FormField state="error">
        <FormHelperText state="helper">Override</FormHelperText>
      </FormField>,
    )
    expect(screen.getByText('Override')).toHaveClass('text-text-helper')
  })

  it('useFormField returns context value', () => {
    let capturedState: string | undefined
    const Spy = () => {
      const { state } = useFormField()
      capturedState = state
      return null
    }
    render(
      <FormField state="success">
        <Spy />
      </FormField>,
    )
    expect(capturedState).toBe('success')
  })
})
```

Add the `useFormField` import at the top:
```tsx
import { FormField, FormHelperText, useFormField } from './form'
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/form.test.tsx
```
Expected: FAIL — `useFormField is not exported`.

**Step 3: Implement**

Replace the full content of `src/ui/form.tsx` with:

```tsx
import * as React from 'react'
import { cn } from './lib/utils'

export type FormHelperState = 'helper' | 'error' | 'warning' | 'success'

// ── Context ───────────────────────────────────────────────────────────────

interface FormFieldContextValue {
  state?: FormHelperState
  helperTextId?: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>({})

export function useFormField(): FormFieldContextValue {
  return React.useContext(FormFieldContext)
}

// ── FormField ─────────────────────────────────────────────────────────────
//
// Accessibility: Use `helperTextId` to link helper text to the input:
//
//   <FormField state="error" helperTextId="email-error">
//     <Label htmlFor="email">Email</Label>
//     <Input id="email" {...getFormFieldA11y('email-error', 'error')} />
//     <FormHelperText id="email-error">Invalid email</FormHelperText>
//   </FormField>
//
// FormHelperText automatically reads `state` from FormField context.

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  helperTextId?: string
  state?: FormHelperState
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, helperTextId, state, children, ...props }, ref) => (
    <FormFieldContext.Provider value={{ state, helperTextId }}>
      <div ref={ref} className={cn('flex flex-col gap-ds-02', className)} {...props}>
        {children}
      </div>
    </FormFieldContext.Provider>
  ),
)
FormField.displayName = 'FormField'

// ── FormHelperText ────────────────────────────────────────────────────────

export interface FormHelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  state?: FormHelperState
}

const helperStateClasses: Record<FormHelperState, string> = {
  helper:  'text-text-helper',
  error:   'text-text-error',
  warning: 'text-text-warning',
  success: 'text-text-success',
}

const FormHelperText = React.forwardRef<HTMLParagraphElement, FormHelperTextProps>(
  ({ className, state: stateProp, ...props }, ref) => {
    const ctx = useFormField()
    const state = stateProp ?? ctx.state ?? 'helper'

    return (
      <p
        ref={ref}
        role={state === 'error' ? 'alert' : undefined}
        className={cn('text-ds-sm', helperStateClasses[state], className)}
        {...props}
      />
    )
  },
)
FormHelperText.displayName = 'FormHelperText'

// ── getFormFieldA11y ──────────────────────────────────────────────────────

function getFormFieldA11y(
  helperTextId?: string,
  state?: FormHelperState,
): { 'aria-describedby'?: string; 'aria-invalid'?: boolean } {
  return {
    ...(helperTextId ? { 'aria-describedby': helperTextId } : {}),
    ...(state === 'error' ? { 'aria-invalid': true as const } : {}),
  }
}

export { FormField, FormHelperText, getFormFieldA11y }
```

Also update `src/ui/index.ts` — add `useFormField` to the form export:
```ts
export { FormField, FormHelperText, getFormFieldA11y, useFormField, type FormFieldProps, type FormHelperState, type FormHelperTextProps } from './form'
```

**Step 4: Run tests**

```
pnpm vitest run src/ui/form.test.tsx
```
Expected: All pass.

**Step 5: Commit**

```bash
git add src/ui/form.tsx src/ui/form.test.tsx src/ui/index.ts
git commit -m "feat(form): add FormFieldContext — auto-propagates state to FormHelperText"
```

---

### Task 1.5: Alert — neutral variant + dismissible footgun fix

**Files:**
- Modify: `src/ui/alert.tsx`
- Test: `src/ui/alert.test.tsx` (add to existing)

**Step 1: Add failing tests**

In `src/ui/alert.test.tsx`, add:

```tsx
it('renders neutral variant', () => {
  const { container } = render(<Alert variant="neutral">Note</Alert>)
  expect(container.firstChild).toHaveClass('bg-layer-02')
})

it('renders dismiss button when onDismiss is provided (no dismissible prop needed)', () => {
  const onDismiss = vi.fn()
  render(<Alert onDismiss={onDismiss}>Dismissible</Alert>)
  expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
})

it('does not render dismiss button when onDismiss is absent', () => {
  render(<Alert>Not dismissible</Alert>)
  expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/alert.test.tsx
```

**Step 3: Implement**

Replace `src/ui/alert.tsx` with:

```tsx
import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX, IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const alertVariants = cva(
  'relative flex gap-ds-04 rounded-ds-lg border p-ds-05',
  {
    variants: {
      variant: {
        neutral: 'bg-layer-02 border-border text-text-primary',
        info:    'bg-info-surface border-info-border text-info-text',
        success: 'bg-success-surface border-success-border text-success-text',
        warning: 'bg-warning-surface border-warning-border text-warning-text',
        error:   'bg-error-surface border-error-border text-error-text',
      },
    },
    defaultVariants: { variant: 'info' },
  },
)

const ALERT_ICONS = {
  neutral: IconInfoCircle,
  info:    IconInfoCircle,
  success: IconCircleCheck,
  warning: IconAlertTriangle,
  error:   IconAlertCircle,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  /** Provide this callback to render a dismiss button. No `dismissible` prop needed. */
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, onDismiss, children, ...props }, ref) => {
    const Icon = ALERT_ICONS[variant ?? 'info']

    return (
      <div ref={ref} className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
        <Icon className="mt-ds-01 h-ico-md w-ico-md shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <p className="text-ds-md font-semibold mb-ds-01">{title}</p>}
          <div className="text-ds-md opacity-90">{children}</div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-ds-sm text-icon-secondary transition-colors hover:text-icon-primary hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Dismiss"
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </button>
        )}
      </div>
    )
  },
)
Alert.displayName = 'Alert'

export { Alert, alertVariants }
```

**Note:** The `dismissible` prop is removed. Any caller using `dismissible={true} onDismiss={fn}` just becomes `onDismiss={fn}`.

**Step 4: Run tests**

```
pnpm vitest run src/ui/alert.test.tsx
```

**Step 5: TypeScript check**

```
pnpm typecheck
```
Fix any callers that pass `dismissible` prop (search for `dismissible` in `src/` and remove the boolean).

**Step 6: Commit**

```bash
git add src/ui/alert.tsx src/ui/alert.test.tsx
git commit -m "feat(alert): add neutral variant; simplify dismissible to onDismiss-only"
```

---

### Task 1.6: Banner — neutral variant + dismissible fix

**Files:**
- Modify: `src/ui/banner.tsx`

Same pattern as Alert. Banner is simpler (no test file) — just apply the identical changes:

1. Add `neutral: 'bg-layer-02 border-border text-border-primary'` to `bannerVariants`
2. Add `neutral: IconInfoCircle` to `BANNER_ICONS`
3. Remove `dismissible?: boolean` from `BannerProps`
4. Change the dismiss button condition from `dismissible && onDismiss` to just `onDismiss`

```tsx
// Updated BannerProps (remove dismissible):
export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  action?: React.ReactNode
  onDismiss?: () => void
}

// Updated dismiss button render condition:
{onDismiss && (
  <button ...>
    <IconX className="h-ico-sm w-ico-sm" />
  </button>
)}
```

**Run tests and commit:**

```bash
pnpm test
git add src/ui/banner.tsx
git commit -m "feat(banner): add neutral variant; simplify dismissible to onDismiss-only"
```

---

## BATCH 2 — Data Display

**Branch:** `fix/data-display`
**Files:** `src/ui/avatar.tsx`, `src/ui/badge.tsx`, `src/ui/toast.tsx`, `src/ui/card.tsx`

---

### Task 2.1: Avatar — fix status dot clipping + add shape variant

**Files:**
- Modify: `src/ui/avatar.tsx`
- Test: `src/ui/__tests__/avatar-a11y.test.tsx` (add to existing)

**Step 1: Add failing tests**

In `src/ui/__tests__/avatar-a11y.test.tsx`, add:

```tsx
it('renders status dot outside the overflow-hidden image container', () => {
  const { container } = render(
    <Avatar status="online">
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  )
  const statusDot = screen.getByRole('img', { name: 'Online' })
  // The image container (AvatarPrimitive.Root) has overflow-hidden
  // After the fix, the status dot must NOT be a descendant of it
  const overflowEl = container.querySelector('[class*="overflow-hidden"]')
  expect(overflowEl).not.toBeNull()
  expect(overflowEl!.contains(statusDot)).toBe(false)
})

it('renders square shape', () => {
  const { container } = render(
    <Avatar shape="square">
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  )
  const imageRoot = container.querySelector('[class*="overflow-hidden"]')
  expect(imageRoot).toHaveClass('rounded-ds-sm')
  expect(imageRoot).not.toHaveClass('rounded-ds-full')
})

it('renders rounded shape', () => {
  const { container } = render(
    <Avatar shape="rounded">
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  )
  const imageRoot = container.querySelector('[class*="overflow-hidden"]')
  expect(imageRoot).toHaveClass('rounded-ds-lg')
})

it('defaults to circle shape', () => {
  const { container } = render(
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  )
  const imageRoot = container.querySelector('[class*="overflow-hidden"]')
  expect(imageRoot).toHaveClass('rounded-ds-full')
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/__tests__/avatar-a11y.test.tsx
```

**Step 3: Implement**

Replace `src/ui/avatar.tsx` with:

```tsx
import * as React from "react"
import * as AvatarPrimitive from "@primitives/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./lib/utils"

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden',
  {
    variants: {
      size: {
        xs: 'h-ds-xs w-ds-xs',
        sm: 'h-ds-sm w-ds-sm',
        md: 'h-ds-md w-ds-md',
        lg: 'h-ds-lg w-ds-lg',
        xl: 'h-ds-xl w-ds-xl',
      },
      shape: {
        circle:  'rounded-ds-full',
        square:  'rounded-ds-sm',
        rounded: 'rounded-ds-lg',
      },
    },
    defaultVariants: { size: 'md', shape: 'circle' },
  }
)

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

const statusColorMap: Record<AvatarStatus, string> = {
  online:  'bg-success',
  offline: 'bg-layer-03',
  busy:    'bg-error',
  away:    'bg-warning',
}

const statusLabelMap: Record<AvatarStatus, string> = {
  online:  'Online',
  offline: 'Offline',
  busy:    'Busy',
  away:    'Away',
}

const statusDotSizeMap: Record<string, string> = {
  xs: 'h-ds-02b w-ds-02b',
  sm: 'h-2 w-2',
  md: 'h-ds-03 w-ds-03',
  lg: 'h-3 w-3',
  xl: 'h-ds-04 w-ds-04',
}

export interface AvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, 'children'>,
    VariantProps<typeof avatarVariants> {
  status?: AvatarStatus
  children?: React.ReactNode
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, shape, status, children, ...props }, ref) => (
  // Outer wrapper: relative container for status dot positioning (no overflow-hidden here)
  <span className="relative inline-flex shrink-0">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size, shape }), className)}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
    {status && (
      <span
        className={cn(
          'absolute bottom-0 right-0 rounded-ds-full ring-2 ring-layer-01',
          statusColorMap[status],
          statusDotSizeMap[size ?? 'md'],
        )}
        role="img"
        aria-label={statusLabelMap[status]}
      />
    )}
  </span>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-ds-full bg-interactive-subtle text-interactive",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
```

**Step 4: Run tests**

```
pnpm vitest run src/ui/__tests__/avatar-a11y.test.tsx
```

**Step 5: Update index.ts** — `shape` is now part of `AvatarProps` so no export change needed. But verify `avatarVariants` is exported from index if needed (it already is via `export { ..., avatarVariants, ... } from './avatar'`).

**Step 6: Commit**

```bash
git add src/ui/avatar.tsx src/ui/__tests__/avatar-a11y.test.tsx
git commit -m "fix(avatar): move status dot outside overflow-hidden; add shape variant (circle/square/rounded)"
```

---

### Task 2.2: Badge — solid fill variant

**Files:**
- Modify: `src/ui/badge.tsx`
- Test: `src/ui/badge.test.tsx` (add to existing)

**Step 1: Add failing tests**

In `src/ui/badge.test.tsx`, add:

```tsx
it('renders solid fill for success variant', () => {
  const { container } = render(<Badge variant="success" fill="solid">Active</Badge>)
  expect(container.firstChild).toHaveClass('bg-success')
  expect(container.firstChild).toHaveClass('text-text-on-color')
})

it('renders solid fill for error variant', () => {
  const { container } = render(<Badge variant="error" fill="solid">Error</Badge>)
  expect(container.firstChild).toHaveClass('bg-error')
})

it('defaults to surface fill', () => {
  const { container } = render(<Badge variant="success">Active</Badge>)
  expect(container.firstChild).toHaveClass('bg-success-surface')
  expect(container.firstChild).not.toHaveClass('bg-success')
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/badge.test.tsx
```

**Step 3: Implement**

In `src/ui/badge.tsx`, add a `fill` variant to `badgeVariants` and use compound variants:

```tsx
const badgeVariants = cva(
  'inline-flex items-center gap-ds-02b font-sans font-medium rounded-ds-full border',
  {
    variants: {
      variant: {
        neutral: 'bg-field text-text-secondary border-border',
        info:    'bg-info-surface text-info-text border-info-border',
        success: 'bg-success-surface text-success-text border-success-border',
        error:   'bg-error-surface text-error-text border-error-border',
        warning: 'bg-warning-surface text-warning-text border-warning-border',
        brand:   'bg-interactive-subtle text-text-brand border-interactive',
        accent:  'bg-accent-subtle text-accent border-accent',
        teal:    'bg-category-teal-surface text-category-teal-text border-category-teal-border',
        amber:   'bg-category-amber-surface text-category-amber-text border-category-amber-border',
        slate:   'bg-category-slate-surface text-category-slate-text border-category-slate-border',
        indigo:  'bg-category-indigo-surface text-category-indigo-text border-category-indigo-border',
        cyan:    'bg-category-cyan-surface text-category-cyan-text border-category-cyan-border',
        orange:  'bg-category-orange-surface text-category-orange-text border-category-orange-border',
        emerald: 'bg-category-emerald-surface text-category-emerald-text border-category-emerald-border',
      },
      size: {
        sm: 'h-5 px-ds-03 text-ds-xs',
        md: 'h-ds-xs px-ds-03 text-ds-sm',
        lg: 'h-ds-xs-plus px-ds-04 text-ds-md',
      },
      fill: {
        surface: '', // default — handled by variant above
        solid:   '', // overrides via compound variants below
      },
    },
    compoundVariants: [
      { fill: 'solid', variant: 'neutral', className: 'bg-layer-03 text-text-primary border-transparent' },
      { fill: 'solid', variant: 'info',    className: 'bg-info text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'success', className: 'bg-success text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'error',   className: 'bg-error text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'warning', className: 'bg-warning text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'brand',   className: 'bg-interactive text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'accent',  className: 'bg-accent text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'teal',    className: 'bg-category-teal text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'amber',   className: 'bg-category-amber text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'slate',   className: 'bg-category-slate text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'indigo',  className: 'bg-category-indigo text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'cyan',    className: 'bg-category-cyan text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'orange',  className: 'bg-category-orange text-text-on-color border-transparent' },
      { fill: 'solid', variant: 'emerald', className: 'bg-category-emerald text-text-on-color border-transparent' },
    ],
    defaultVariants: { variant: 'neutral', size: 'md', fill: 'surface' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  onDismiss?: () => void
}
```

**Step 4: Run tests**

```
pnpm vitest run src/ui/badge.test.tsx
```

**Step 5: Commit**

```bash
git add src/ui/badge.tsx src/ui/badge.test.tsx
git commit -m "feat(badge): add fill='solid' variant for high-contrast filled treatment"
```

---

### Task 2.3: Toast — fix semantic variants

**Files:**
- Modify: `src/ui/toast.tsx`
- Test: `src/ui/toast.test.tsx` (add to existing)

**Step 1: Add failing tests**

In `src/ui/toast.test.tsx`, add:

```tsx
it('renders success variant with correct classes', () => {
  const { container } = render(
    <ToastProvider swipeDirection="right">
      <Toast variant="success">
        <ToastTitle>Saved</ToastTitle>
      </Toast>
      <ToastViewport />
    </ToastProvider>,
  )
  const toast = container.querySelector('[role="status"]')
  expect(toast).toHaveClass('bg-success-surface')
})

it('renders error variant with correct classes', () => {
  const { container } = render(
    <ToastProvider swipeDirection="right">
      <Toast variant="error">
        <ToastTitle>Failed</ToastTitle>
      </Toast>
      <ToastViewport />
    </ToastProvider>,
  )
  const toast = container.querySelector('[role="status"]')
  expect(toast).toHaveClass('bg-error-surface')
})

it('renders warning variant with correct classes', () => {
  const { container } = render(
    <ToastProvider swipeDirection="right">
      <Toast variant="warning">
        <ToastTitle>Warning</ToastTitle>
      </Toast>
      <ToastViewport />
    </ToastProvider>,
  )
  const toast = container.querySelector('[role="status"]')
  expect(toast).toHaveClass('bg-warning-surface')
})

it('renders info variant with correct classes', () => {
  const { container } = render(
    <ToastProvider swipeDirection="right">
      <Toast variant="info">
        <ToastTitle>Info</ToastTitle>
      </Toast>
      <ToastViewport />
    </ToastProvider>,
  )
  const toast = container.querySelector('[role="status"]')
  expect(toast).toHaveClass('bg-info-surface')
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/toast.test.tsx
```

**Step 3: Implement**

In `src/ui/toast.tsx`, replace `toastVariants`:

```tsx
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-ds-03 overflow-hidden rounded-ds-md border p-ds-05 pr-ds-06 shadow-03 transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-border bg-layer-01 text-text-primary',
        info:    'bg-info-surface border-info-border text-info-text',
        success: 'bg-success-surface border-success-border text-success-text',
        warning: 'bg-warning-surface border-warning-border text-warning-text',
        error:   'bg-error-surface border-error-border text-error-text',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)
```

Also update `ToastAction` to remove the `group-[.destructive]` selectors (no longer needed):

```tsx
const ToastAction = React.forwardRef<...>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-ds-sm shrink-0 items-center justify-center rounded-ds-md border border-border bg-transparent px-ds-04 text-ds-md font-medium transition-colors hover:bg-layer-02 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]',
      className,
    )}
    {...props}
  />
))
```

**Step 4: Update `useToast` hook** if it exists. Search for `karam` or `destructive` usage in `src/ui/toaster.tsx`:

```
grep -n "karam\|destructive" src/ui/toaster.tsx
```

Update any reference from `destructive` → `error` and remove `karam`.

**Step 5: Run tests**

```
pnpm vitest run src/ui/toast.test.tsx
```

**Step 6: TypeScript check**

```
pnpm typecheck
```

Fix any callers passing `variant="destructive"` or `variant="karam"`.

**Step 7: Commit**

```bash
git add src/ui/toast.tsx src/ui/toaster.tsx src/ui/toast.test.tsx
git commit -m "fix(toast): replace broken variants with semantic success/warning/error/info variants"
```

---

### Task 2.4: Card — variant system

**Files:**
- Modify: `src/ui/card.tsx`
- Test: create `src/ui/card.test.tsx`

**Step 1: Create failing test**

Create `src/ui/card.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './card'

describe('Card variants', () => {
  it('renders default variant with border and shadow-01', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('shadow-01')
    expect(card).toHaveClass('border')
  })

  it('renders elevated variant with shadow-03 and no border', () => {
    const { container } = render(<Card variant="elevated">Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('shadow-03')
    expect(card).not.toHaveClass('border')
  })

  it('renders outlined variant with border and no shadow', () => {
    const { container } = render(<Card variant="outlined">Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('border')
    expect(card).not.toHaveClass('shadow-01')
    expect(card).not.toHaveClass('shadow-03')
  })

  it('renders flat variant with bg-layer-02', () => {
    const { container } = render(<Card variant="flat">Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-layer-02')
    expect(card).not.toHaveClass('border')
  })

  it('adds interactive styles when interactive prop is true', () => {
    const { container } = render(<Card interactive>Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('cursor-pointer')
  })
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/card.test.tsx
```

**Step 3: Implement**

Replace `src/ui/card.tsx` with:

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const cardVariants = cva(
  'rounded-ds-lg text-text-primary',
  {
    variants: {
      variant: {
        default:  'bg-layer-01 border border-border-subtle shadow-01',
        elevated: 'bg-layer-01 shadow-03',
        outlined: 'bg-layer-01 border border-border',
        flat:     'bg-layer-02',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant }),
        interactive && 'cursor-pointer transition-shadow duration-fast hover:shadow-02 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

// CardHeader, CardTitle, CardDescription, CardContent, CardFooter — unchanged
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-ds-02b p-ds-06', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('font-sans font-semibold leading-none tracking-tight text-text-primary', className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-ds-md text-text-secondary', className)} {...props} />
  ),
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-ds-06 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-ds-06 pt-0', className)} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

Update `src/ui/index.ts` — add `cardVariants` to the Card export:
```ts
export { Card, cardVariants, CardHeader, ... } from './card'
```

**Step 4: Run tests**

```
pnpm vitest run src/ui/card.test.tsx
```

**Step 5: Commit**

```bash
git add src/ui/card.tsx src/ui/card.test.tsx src/ui/index.ts
git commit -m "feat(card): add variant system (default/elevated/outlined/flat)"
```

---

## BATCH 3 — Interactive Tags

**Branch:** `fix/chip-tags`
**Files:** `src/ui/chip.tsx`

---

### Task 3.1: Chip — lg size + info + 7 category colors

**Files:**
- Modify: `src/ui/chip.tsx`
- Test: `src/ui/__tests__/chip.test.tsx` (add to existing)

**Step 1: Add failing tests**

In `src/ui/__tests__/chip.test.tsx`, add:

```tsx
it('renders lg size', () => {
  const { container } = render(<Chip label="Tag" size="lg" />)
  expect(container.firstChild).toHaveClass('h-ds-sm-plus')
})

it('renders info color (filled)', () => {
  const { container } = render(<Chip label="Tag" color="info" />)
  expect(container.firstChild).toHaveClass('bg-info-surface')
})

it('renders teal category color (filled)', () => {
  const { container } = render(<Chip label="Tag" color="teal" />)
  expect(container.firstChild).toHaveClass('bg-category-teal-surface')
})

it('renders amber category color (outlined)', () => {
  const { container } = render(<Chip label="Tag" color="amber" variant="outlined" />)
  expect(container.firstChild).toHaveClass('border-category-amber-border')
})

it('renders all category colors without errors', () => {
  const colors = ['teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald'] as const
  colors.forEach((color) => {
    const { container } = render(<Chip label={color} color={color} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/__tests__/chip.test.tsx
```

**Step 3: Implement**

Replace `src/ui/chip.tsx` with the updated CVA. Key changes: add `lg` to sizes, add `info` and 7 category colors to the color type and compound variants:

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const chipVariants = cva(
  'inline-flex items-center gap-ds-02 font-sans leading-[var(--line-height-relaxed)] rounded-ds-full transition-colors duration-fast',
  {
    variants: {
      variant: {
        filled:   'bg-layer-02 text-text-primary border border-transparent',
        outlined: 'bg-transparent text-text-primary border border-border',
      },
      size: {
        sm: 'h-ds-xs px-ds-03 text-ds-xs',
        md: 'h-ds-sm px-ds-04 text-ds-sm',
        lg: 'h-ds-sm-plus px-ds-05 text-ds-md',
      },
      color: {
        default: '',
        primary: '',
        info:    '',
        success: '',
        error:   '',
        warning: '',
        teal:    '',
        amber:   '',
        slate:   '',
        indigo:  '',
        cyan:    '',
        orange:  '',
        emerald: '',
      },
    },
    compoundVariants: [
      // filled × semantic
      { variant: 'filled', color: 'primary', className: 'bg-interactive text-text-on-color' },
      { variant: 'filled', color: 'info',    className: 'bg-info-surface text-info-text border-info-border' },
      { variant: 'filled', color: 'success', className: 'bg-success-surface text-success-text border-success-border' },
      { variant: 'filled', color: 'error',   className: 'bg-error-surface text-error-text border-error-border' },
      { variant: 'filled', color: 'warning', className: 'bg-warning-surface text-warning-text border-warning-border' },
      // filled × category
      { variant: 'filled', color: 'teal',    className: 'bg-category-teal-surface text-category-teal-text border-category-teal-border' },
      { variant: 'filled', color: 'amber',   className: 'bg-category-amber-surface text-category-amber-text border-category-amber-border' },
      { variant: 'filled', color: 'slate',   className: 'bg-category-slate-surface text-category-slate-text border-category-slate-border' },
      { variant: 'filled', color: 'indigo',  className: 'bg-category-indigo-surface text-category-indigo-text border-category-indigo-border' },
      { variant: 'filled', color: 'cyan',    className: 'bg-category-cyan-surface text-category-cyan-text border-category-cyan-border' },
      { variant: 'filled', color: 'orange',  className: 'bg-category-orange-surface text-category-orange-text border-category-orange-border' },
      { variant: 'filled', color: 'emerald', className: 'bg-category-emerald-surface text-category-emerald-text border-category-emerald-border' },
      // outlined × semantic
      { variant: 'outlined', color: 'primary', className: 'border-border-interactive text-text-interactive' },
      { variant: 'outlined', color: 'info',    className: 'border-info-border text-info-text' },
      { variant: 'outlined', color: 'success', className: 'border-border-success text-success-text' },
      { variant: 'outlined', color: 'error',   className: 'border-border-error text-error-text' },
      { variant: 'outlined', color: 'warning', className: 'border-border-warning text-warning-text' },
      // outlined × category
      { variant: 'outlined', color: 'teal',    className: 'border-category-teal-border text-category-teal-text' },
      { variant: 'outlined', color: 'amber',   className: 'border-category-amber-border text-category-amber-text' },
      { variant: 'outlined', color: 'slate',   className: 'border-category-slate-border text-category-slate-text' },
      { variant: 'outlined', color: 'indigo',  className: 'border-category-indigo-border text-category-indigo-text' },
      { variant: 'outlined', color: 'cyan',    className: 'border-category-cyan-border text-category-cyan-text' },
      { variant: 'outlined', color: 'orange',  className: 'border-category-orange-border text-category-orange-text' },
      { variant: 'outlined', color: 'emerald', className: 'border-category-emerald-border text-category-emerald-text' },
    ],
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      color: 'default',
    },
  },
)

type ChipColor = 'default' | 'primary' | 'info' | 'success' | 'error' | 'warning'
  | 'teal' | 'amber' | 'slate' | 'indigo' | 'cyan' | 'orange' | 'emerald'

type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> & {
  label: string
  color?: ChipColor
  icon?: React.ReactNode
  onClick?: React.MouseEventHandler
  onDelete?: () => void
  disabled?: boolean
  className?: string
}

const Chip = React.forwardRef<HTMLElement, ChipProps>(
  ({ label, variant, size, color, icon, onClick, onDelete, disabled, className, ...props }, ref) => {
    const isClickable = !!onClick
    const Component = isClickable ? 'button' : 'span'
    const interactiveClass = isClickable && !disabled ? 'cursor-pointer hover:bg-field-hover' : ''
    const disabledClass = disabled ? 'opacity-[var(--action-disabled-opacity,0.38)] cursor-not-allowed' : ''

    return React.createElement(
      Component,
      {
        ref,
        className: cn(chipVariants({ variant, size, color }), interactiveClass, disabledClass, className),
        onClick: isClickable ? onClick : undefined,
        disabled: isClickable ? disabled : undefined,
        type: isClickable ? 'button' : undefined,
        ...props,
      },
      <>
        {icon && <span className="flex-shrink-0 [&>svg]:w-ico-sm [&>svg]:h-ico-sm">{icon}</span>}
        <span>{label}</span>
        {onDelete && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className="flex-shrink-0 rounded-ds-full p-ds-01 hover:bg-layer-03 transition-colors duration-fast [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </>,
    )
  },
)
Chip.displayName = 'Chip'

export { Chip, chipVariants, type ChipProps }
```

**Step 4: Run tests**

```
pnpm vitest run src/ui/__tests__/chip.test.tsx
```

**Step 5: Commit**

```bash
git add src/ui/chip.tsx src/ui/__tests__/chip.test.tsx
git commit -m "feat(chip): add lg size; add info + 7 Sapta Varna category colors"
```

---

## BATCH 4 — System Coherence

**Branch:** `fix/system-coherence`
**Files:** `src/tokens/semantic.css`, `src/ui/button.tsx`, `src/ui/tabs.tsx`, + all callers of `variant="danger"`

---

### Task 4.1: Add `--color-info` solid token

**Files:**
- Modify: `src/tokens/semantic.css`

**Step 1: Edit `src/tokens/semantic.css`**

In the `:root` block, find the info tokens section (around line 116-119) and add the solid fill token:

```css
/* Before: */
--color-info:                 var(--blue-600);   /* ADD THIS LINE */
--color-info-surface:         var(--blue-50);
--color-info-border:          var(--blue-600);
--color-info-text:            var(--blue-700);

/* In the .dark block, find the info dark tokens and add: */
--color-info:                 var(--blue-500);   /* ADD THIS LINE */
--color-info-surface:         var(--blue-900);
```

**Step 2: Run build**

```
pnpm build
```
Expected: Build succeeds. The token is now available as `bg-info` in Tailwind via the preset.

**Step 3: Commit**

```bash
git add src/tokens/semantic.css
git commit -m "feat(tokens): add --color-info solid fill token (completes info color triplet)"
```

---

### Task 4.2: Button — rename `danger` → `error`, add `active:` states

**Files:**
- Modify: `src/ui/button.tsx`
- Modify: `src/ui/button.test.tsx`
- Modify: `src/ui/icon-button.tsx` (no change needed — variant pass-through)
- Modify all callers: see list below

**Step 1: Update button test**

In `src/ui/button.test.tsx`, find the test using `variant="danger"` and update it:

```tsx
// Before:
it('applies variant classes', () => {
  render(<Button variant="danger">Delete</Button>)
  ...
})

// After:
it('applies error variant classes', () => {
  render(<Button variant="error">Delete</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

it('applies error-ghost variant classes', () => {
  render(<Button variant="error-ghost">Cancel</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/button.test.tsx
```
Expected: FAIL (TypeScript error in test: 'error' not a valid variant).

**Step 3: Update `src/ui/button.tsx`**

In `buttonVariants`, rename the variant keys and add active states:

```tsx
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans font-semibold select-none border border-transparent transition-[color,background-color,border-color,box-shadow] duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]',
  {
    variants: {
      variant: {
        primary:
          'bg-interactive text-text-on-color hover:bg-interactive-hover active:bg-interactive-active shadow-01 hover:shadow-brand',
        secondary:
          'bg-transparent text-interactive border-border-interactive hover:bg-interactive-subtle active:bg-interactive-selected',
        ghost:
          'bg-transparent text-text-secondary hover:bg-layer-02 hover:text-text-primary active:bg-layer-03',
        error:
          'bg-error text-text-on-color hover:bg-error-hover shadow-01',
        'error-ghost':
          'bg-transparent text-error border border-border-error hover:bg-error-surface active:bg-error-surface',
        link: 'text-text-link underline-offset-4 hover:underline active:opacity-70',
      },
      size: { ... }, // unchanged
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)
```

**Step 4: Update all callers of `variant="danger"` and `variant="danger-ghost"`**

Run this search to find all files:
```
grep -rn "variant=\"danger\"" src/
grep -rn "variant=\"danger-ghost\"" src/
```

Files to update (based on earlier search):
- `src/karm/chat/chat-input.tsx` line 72
- `src/karm/tasks/files-tab.tsx` line 247
- `src/ui/alert-dialog.stories.tsx` line 59
- `src/ui/button-group.stories.tsx` line 80
- `src/ui/button-group.test.tsx` line 52 (also update the ButtonGroup variant if it passes danger through)
- `src/ui/button.stories.tsx` line 290
- `src/ui/dialog.stories.tsx` lines 71, 85
- `src/ui/icon-button.stories.tsx` lines 69, 130
- `src/ui/icon-button.test.tsx` line 32
- `src/ui/__tests__/button-a11y.test.tsx` line 20

For each: change `variant="danger"` → `variant="error"` and `variant="danger-ghost"` → `variant="error-ghost"`.

Also check ButtonGroup — if it has a `variant` prop that passes `danger`, update the ButtonGroup variant type as well in `button-group.tsx`.

**Step 5: Run all tests**

```
pnpm test
```
Expected: All pass.

**Step 6: TypeScript check**

```
pnpm typecheck
```
Expected: Clean. No remaining `danger` references.

**Step 7: Commit**

```bash
git add src/ui/button.tsx src/ui/button.test.tsx src/ui/button-group.tsx \
  src/karm/chat/chat-input.tsx src/karm/tasks/files-tab.tsx \
  src/ui/alert-dialog.stories.tsx src/ui/button-group.stories.tsx src/ui/button-group.test.tsx \
  src/ui/button.stories.tsx src/ui/dialog.stories.tsx \
  src/ui/icon-button.stories.tsx src/ui/icon-button.test.tsx \
  src/ui/__tests__/button-a11y.test.tsx
git commit -m "feat(button)!: rename danger→error, danger-ghost→error-ghost; add active: states to all variants"
```

---

### Task 4.3: Tabs — context bridge for variant propagation

**Files:**
- Modify: `src/ui/tabs.tsx`
- Test: `src/ui/tabs.test.tsx` (add to existing)

**Step 1: Add failing test**

In `src/ui/tabs.test.tsx`, add:

```tsx
it('TabsTrigger inherits variant from TabsList without explicit prop', () => {
  render(
    <Tabs defaultValue="tab1">
      <TabsList variant="contained">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content</TabsContent>
    </Tabs>,
  )
  // 'contained' TabsTrigger has rounded-ds-md class
  // Without context bridge, it would default to 'line' styles
  const trigger = screen.getByRole('tab', { name: 'Tab 1' })
  expect(trigger).toHaveClass('rounded-ds-md')
})

it('TabsTrigger explicit variant overrides context', () => {
  render(
    <Tabs defaultValue="tab1">
      <TabsList variant="contained">
        <TabsTrigger value="tab1" variant="line">Tab 1</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content</TabsContent>
    </Tabs>,
  )
  const trigger = screen.getByRole('tab', { name: 'Tab 1' })
  // line variant: has border-b-2, not rounded-ds-md
  expect(trigger).toHaveClass('border-b-2')
  expect(trigger).not.toHaveClass('rounded-ds-md')
})
```

**Step 2: Verify failure**

```
pnpm vitest run src/ui/tabs.test.tsx
```

**Step 3: Implement**

In `src/ui/tabs.tsx`, add context:

```tsx
import * as TabsPrimitive from '@primitives/react-tabs'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

type TabsVariant = 'line' | 'contained'

const TabsListContext = React.createContext<{ variant?: TabsVariant }>({})

const Tabs = TabsPrimitive.Root

// tabsListVariants and tabsTriggerVariants — unchanged from current implementation

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsListContext.Provider value={{ variant }}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  </TabsListContext.Provider>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant: variantProp, ...props }, ref) => {
  const ctx = React.useContext(TabsListContext)
  const variant = variantProp ?? ctx.variant ?? 'line'

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName
```

**Step 4: Run tests**

```
pnpm vitest run src/ui/tabs.test.tsx
```

**Step 5: Run full test suite**

```
pnpm test
```

**Step 6: Commit**

```bash
git add src/ui/tabs.tsx src/ui/tabs.test.tsx
git commit -m "fix(tabs): add TabsListContext so TabsTrigger inherits variant from TabsList"
```

---

## FINAL STEPS (all batches)

After all 4 branches pass CI individually:

**Step 1: Merge each branch to main**

```bash
git checkout main
git merge fix/form-layer --no-ff -m "feat: Batch 1 — Form layer variant fixes and context"
git merge fix/data-display --no-ff -m "feat: Batch 2 — Data display variant fixes"
git merge fix/chip-tags --no-ff -m "feat: Batch 3 — Chip lg size and category colors"
git merge fix/system-coherence --no-ff -m "feat: Batch 4 — System coherence (error rename, Tabs context, info token)"
```

**Step 2: Final full test + build**

```bash
pnpm test
pnpm typecheck
pnpm build
```

**Step 3: Update CHANGELOG.md**

Add entries under `[Unreleased]` for each batch using Keep a Changelog format.
