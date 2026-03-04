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
    'transition-colors duration-fast-01',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-border-interactive',
    'disabled:cursor-not-allowed disabled:opacity-[0.38]',
    'read-only:bg-layer-02 read-only:cursor-default',
  ],
  {
    variants: {
      size: {
        sm: 'h-ds-sm text-ds-sm px-ds-03',
        md: 'h-ds-md text-ds-base px-ds-04',
        lg: 'h-ds-lg text-ds-lg px-ds-05',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

/**
 * Props for Input — a single-line text field with size variants, validation state coloring,
 * and icon adornments (start/end slots).
 *
 * **Sizes:** `sm` (32px) | `md` (40px, default) | `lg` (48px) — note: uses `size` prop not `inputSize`.
 * HTML's native `size` attribute is excluded — use CSS width instead.
 *
 * **Validation states:** `state="error"` colors the border red and sets `aria-invalid`.
 * Use with `<FormField>` to show helper text below the input.
 *
 * **Icon adornments:** `startIcon` and `endIcon` accept any React node (prefer SVG icons at 16px).
 * The icon is pointer-events-none (decorative); for a clickable end icon use `endIcon` + a sibling button.
 *
 * @example
 * // Basic email field with placeholder:
 * <Input type="email" placeholder="you@example.com" />
 *
 * @example
 * // Search input with a leading icon:
 * <Input size="md" startIcon={<IconSearch />} placeholder="Search projects..." />
 *
 * @example
 * // Validated error state (pair with FormField for label + helper text):
 * <Input state="error" value={email} onChange={handleChange} />
 *
 * @example
 * // Read-only field (shows a muted background, non-editable):
 * <Input readOnly value="https://devalok.com/api/key/abc123" endIcon={<IconCopy />} />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  state?: InputState
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state, size, startIcon, endIcon, ...props }, ref) => {
    const inputEl = (
      <input
        type={type}
        className={cn(
          inputVariants({ size }),
          startIcon && 'pl-ds-08',
          endIcon && 'pr-ds-08',
          state === 'error' && 'border-border-error focus-visible:ring-error',
          state === 'warning' && 'border-border-warning focus-visible:ring-warning',
          state === 'success' && 'border-border-success focus-visible:ring-success',
          className,
        )}
        aria-invalid={state === 'error' || undefined}
        ref={ref}
        {...props}
      />
    )

    if (!startIcon && !endIcon) return inputEl

    return (
      <div className="relative flex items-center w-full">
        {startIcon && (
          <span className="absolute left-ds-03 flex items-center text-text-secondary pointer-events-none [&>svg]:h-ico-sm [&>svg]:w-ico-sm">
            {startIcon}
          </span>
        )}
        {inputEl}
        {endIcon && (
          <span className="absolute right-ds-03 flex items-center text-text-secondary pointer-events-none [&>svg]:h-ico-sm [&>svg]:w-ico-sm">
            {endIcon}
          </span>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input, inputVariants }
