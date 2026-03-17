'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'
import { motionProps } from './lib/motion'
import type { InputState } from './input'
import { useFormField } from './form'

const textareaVariants = cva(
  [
    'flex w-full font-sans resize-y cursor-ns-resize',
    'bg-surface-raised-hover text-surface-fg',
    'border border-surface-border-strong rounded-ds-md',
    'placeholder:text-surface-fg-subtle',
    'hover:bg-surface-raised-active',
    'transition-colors duration-fast-01 ease-productive-standard',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:border-accent-7',
    'disabled:cursor-not-allowed disabled:opacity-action-disabled',
    'read-only:bg-surface-raised read-only:cursor-default',
  ],
  {
    variants: {
      size: {
        xs: 'min-h-[48px] text-ds-sm px-ds-02 py-ds-02',
        sm: 'min-h-[60px] text-ds-sm px-ds-03 py-ds-02',
        md: 'min-h-[80px] text-ds-md px-ds-04 py-ds-03',
        lg: 'min-h-[120px] text-ds-md px-ds-05 py-ds-04',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

/**
 * Props for Textarea — a resizable multi-line text input with size variants and validation state coloring,
 * sharing the same `InputState` type as `<Input>`.
 *
 * **Sizes:** `sm` (min 60px) | `md` (min 80px, default) | `lg` (min 120px) — all are vertically resizable.
 *
 * **Validation states:** `state="error"` | `"warning"` | `"success"` — changes border color and focus ring.
 * HTML's native `size` attribute is omitted; use `rows` for initial height or CSS `min-height`.
 *
 * **Pair with FormField:** Use inside `<FormField>` to get a label, helper text, and associated `state`.
 *
 * @example
 * // Basic description textarea in a form:
 * <Textarea placeholder="Describe the issue..." rows={4} />
 *
 * @example
 * // Error state when validation fails:
 * <Textarea state="error" value={bio} onChange={(e) => setBio(e.target.value)} />
 *
 * @example
 * // Large textarea for a full email draft composer:
 * <Textarea size="lg" placeholder="Write your message..." className="min-h-[200px]" />
 *
 * @example
 * // Read-only view of a previously submitted note:
 * <Textarea readOnly value={submission.notes} size="md" />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  state?: InputState
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state: stateProp, size, ...props }, ref) => {
    const fieldCtx = useFormField()
    // Merge FormField context — explicit props always win
    const state = stateProp ?? (fieldCtx.state === 'helper' ? undefined : fieldCtx.state as InputState | undefined)
    const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
    const ariaRequired = props['aria-required'] ?? fieldCtx.required

    return (
      <motion.textarea
        aria-invalid={state === 'error' || undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={ariaRequired || undefined}
        className={cn(
          textareaVariants({ size }),
          state === 'error' && 'border-error-7 focus-visible:ring-error-7',
          state === 'warning' && 'border-warning-7 focus-visible:ring-warning-7',
          state === 'success' && 'border-success-7 focus-visible:ring-success-7',
          className,
        )}
        ref={ref}
        {...motionProps(props)}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
