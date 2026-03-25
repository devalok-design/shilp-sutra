'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'
import { useFormField } from './form'
import { IconProvider, type IconSize } from './icon-context'

export type InputState = 'default' | 'error' | 'warning' | 'success'

const inputWrapperVariants = cva(
  [
    'relative flex items-center w-full font-sans',
    'bg-surface-raised-hover text-surface-fg',
    'border border-surface-border rounded-ds-md',
    'hover:bg-surface-raised-active',
    'transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard',
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-9 focus-within:ring-offset-2 focus-within:border-surface-border',
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-action-disabled',
    'has-[:read-only]:bg-surface-raised has-[:read-only]:cursor-default',
  ],
  {
    variants: {
      size: {
        xs: 'h-ds-xs-plus text-ds-sm',
        sm: 'h-ds-sm text-ds-sm',
        md: 'h-ds-md text-ds-md',
        lg: 'h-ds-lg rounded-ds-lg text-ds-md',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const sectionWidthMap: Record<string, string> = {
  xs: 'w-[26px]',
  sm: 'w-[30px]',
  md: 'w-[38px]',
  lg: 'w-[46px]',
}

const paddingMap: Record<string, { base: string; withStart: string; withEnd: string }> = {
  xs: { base: 'px-ds-02', withStart: 'pl-[26px]', withEnd: 'pr-[26px]' },
  sm: { base: 'px-ds-03', withStart: 'pl-[30px]', withEnd: 'pr-[30px]' },
  md: { base: 'px-ds-04', withStart: 'pl-[38px]', withEnd: 'pr-[38px]' },
  lg: { base: 'px-ds-05', withStart: 'pl-[46px]', withEnd: 'pr-[46px]' },
}

const iconSizeMap: Record<string, IconSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

/**
 * Props for Input — a single-line text field with container-first architecture,
 * section-based icons with automatic padding, per-size scaling, and validation state coloring.
 *
 * **Sizes:** `xs` (28px) | `sm` (32px) | `md` (40px, default) | `lg` (48px)
 * HTML's native `size` attribute is excluded — use CSS width instead.
 *
 * **Validation states:** `state="error"` colors the border red and sets `aria-invalid`.
 * Use with `<FormField>` to show helper text below the input.
 *
 * **Section-based icons:** `startSection` and `endSection` accept any React node.
 * Icons are auto-sized via `IconProvider`. Sections are `pointer-events-none` by default;
 * use `startSectionClickable`/`endSectionClickable` for interactive sections.
 *
 * **className** targets the `<input>` element (backward compatible).
 * **wrapperClassName** targets the wrapper div for border/bg/ring overrides.
 *
 * @example
 * // Basic email field with placeholder:
 * <Input type="email" placeholder="you@example.com" />
 *
 * @example
 * // Search input with a leading icon:
 * <Input size="md" startSection={<IconSearch />} placeholder="Search projects..." />
 *
 * @example
 * // Validated error state (pair with FormField for label + helper text):
 * <Input state="error" value={email} onChange={handleChange} />
 *
 * @example
 * // Read-only field (shows a muted background, non-editable):
 * <Input readOnly value="https://devalok.com/api/key/abc123" endSection={<IconCopy />} />
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputWrapperVariants> {
  state?: InputState
  startSection?: React.ReactNode
  endSection?: React.ReactNode
  startSectionClickable?: boolean
  endSectionClickable?: boolean
  /** Classes for the wrapper div (border, bg, ring). */
  wrapperClassName?: string
  /** @deprecated Use startSection */
  startIcon?: React.ReactNode
  /** @deprecated Use endSection */
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      state: stateProp,
      size: sizeProp = 'md',
      startSection,
      endSection,
      startSectionClickable,
      endSectionClickable,
      startIcon,
      endIcon,
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const size = sizeProp ?? 'md'
    const fieldCtx = useFormField()
    // Merge FormField context — explicit props always win
    const state =
      stateProp ??
      (fieldCtx.state === 'helper'
        ? undefined
        : (fieldCtx.state as InputState | undefined))
    const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
    const ariaRequired = props['aria-required'] ?? fieldCtx.required

    // Backward compat: map deprecated props
    const resolvedStart = startSection ?? startIcon
    const resolvedEnd = endSection ?? endIcon

    const pad = paddingMap[size]
    const hasStart = !!resolvedStart
    const hasEnd = !!resolvedEnd

    return (
      <div
        className={cn(
          inputWrapperVariants({ size }),
          state === 'error' && 'border-error-7 focus-within:ring-error-7',
          state === 'warning' && 'border-warning-7 focus-within:ring-warning-7',
          state === 'success' && 'border-success-7 focus-within:ring-success-7',
          wrapperClassName,
        )}
      >
        {hasStart && (
          <IconProvider size={iconSizeMap[size]}>
            <span
              className={cn(
                'absolute left-0 top-0 h-full flex items-center justify-center text-surface-fg-muted',
                sectionWidthMap[size],
                !startSectionClickable && 'pointer-events-none',
              )}
            >
              {resolvedStart}
            </span>
          </IconProvider>
        )}

        <input
          type={type}
          className={cn(
            'w-full h-full bg-transparent outline-none font-sans',
            'placeholder:text-surface-fg-subtle',
            'disabled:cursor-not-allowed',
            'read-only:cursor-default',
            pad.base,
            hasStart && pad.withStart,
            hasEnd && pad.withEnd,
            className,
          )}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={ariaRequired || undefined}
          ref={ref}
          {...props}
        />

        {hasEnd && (
          <IconProvider size={iconSizeMap[size]}>
            <span
              className={cn(
                'absolute right-0 top-0 h-full flex items-center justify-center text-surface-fg-muted',
                sectionWidthMap[size],
                !endSectionClickable && 'pointer-events-none',
              )}
            >
              {resolvedEnd}
            </span>
          </IconProvider>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

/** @deprecated Use inputWrapperVariants — semantics changed (now targets wrapper, not input) */
const inputVariants = inputWrapperVariants

export { Input, inputVariants, inputWrapperVariants }
