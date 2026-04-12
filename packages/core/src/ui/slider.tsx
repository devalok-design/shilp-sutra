'use client'

import * as React from 'react'
import * as SliderPrimitive from '@primitives/react-slider'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './lib/utils'
import { useFormField } from './form'

const sliderTrackVariants = cva(
  'relative w-full grow overflow-hidden rounded-ds-full bg-surface-raised-hover',
  {
    variants: {
      size: {
        sm: 'h-[4px]',
        md: 'h-ds-02b',
        lg: 'h-[10px]',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const sliderThumbVariants = cva(
  'touch-target block rounded-ds-full bg-surface-overlay shadow-raised transition-[color,transform,box-shadow] duration-fast-02 ease-productive-standard hover:scale-110 hover:shadow-raised-hover active:scale-[1.15] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
      },
      color: {
        accent: 'border-accent-7 focus-visible:ring-accent-9',
        success: 'border-success-7 focus-visible:ring-success-9',
        warning: 'border-warning-7 focus-visible:ring-warning-9',
        error: 'border-error-7 focus-visible:ring-error-9',
      },
    },
    defaultVariants: { size: 'md', color: 'accent' },
  },
)

const sliderRangeColorMap: Record<string, string> = {
  accent: 'bg-accent-9',
  success: 'bg-success-9',
  warning: 'bg-warning-9',
  error: 'bg-error-9',
}

export type SliderSize = NonNullable<VariantProps<typeof sliderTrackVariants>['size']>
export type SliderColor = NonNullable<VariantProps<typeof sliderThumbVariants>['color']>

export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'color'> {
  /** Size of the slider. Controls track height and thumb diameter. */
  size?: SliderSize
  /** Color of the range fill and thumb border. */
  color?: SliderColor
}

/**
 * A Radix-powered slider supporting single or multiple thumbs.
 *
 * Pass `defaultValue={[50]}` for a single thumb, or `defaultValue={[25, 75]}`
 * for a range slider with two thumbs. One `<Thumb>` is rendered per value entry.
 *
 * When using multiple thumbs, provide per-thumb labels via the `aria-label` array
 * on the `value`/`defaultValue` entries, or wrap each in a labelled form field.
 *
 * **Sizes:** `sm` | `md` (default) | `lg`
 *
 * **Colors:** `accent` (default) | `success` | `warning` | `error`
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, 'aria-label': ariaLabel, value, defaultValue, size: sizeProp = 'md', color: colorProp = 'accent', ...props }, ref) => {
  const size = sizeProp ?? 'md'
  const color = colorProp ?? 'accent'
  const fieldCtx = useFormField()
  const isError = fieldCtx.state === 'error'
  const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
  const ariaRequired = props['aria-required'] ?? fieldCtx.required

  // Determine how many thumbs to render from controlled or default value
  const thumbCount = (value ?? defaultValue ?? [0]).length

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      aria-invalid={isError || undefined}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired || undefined}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className={sliderTrackVariants({ size })}>
        <SliderPrimitive.Range className={cn('absolute h-full', sliderRangeColorMap[color])} />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={thumbCount === 1 ? (ariaLabel as string | undefined) : undefined}
          className={sliderThumbVariants({ size, color })}
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider, sliderTrackVariants, sliderThumbVariants }
