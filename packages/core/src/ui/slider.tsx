'use client'

import * as React from 'react'
import * as SliderPrimitive from '@primitives/react-slider'

import { cn } from './lib/utils'

/**
 * A Radix-powered slider supporting single or multiple thumbs.
 *
 * Pass `defaultValue={[50]}` for a single thumb, or `defaultValue={[25, 75]}`
 * for a range slider with two thumbs. One `<Thumb>` is rendered per value entry.
 *
 * When using multiple thumbs, provide per-thumb labels via the `aria-label` array
 * on the `value`/`defaultValue` entries, or wrap each in a labelled form field.
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, 'aria-label': ariaLabel, value, defaultValue, ...props }, ref) => {
  // Determine how many thumbs to render from controlled or default value
  const thumbCount = (value ?? defaultValue ?? [0]).length

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-ds-02b w-full grow overflow-hidden rounded-ds-full bg-surface-3">
        <SliderPrimitive.Range className="absolute h-full bg-accent-9" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={thumbCount === 1 ? (ariaLabel as string | undefined) : undefined}
          className="block h-ico-sm w-ico-sm rounded-ds-full border-2 border-accent-7 bg-surface-1 shadow-01 transition-[color,transform] duration-fast-02 hover:scale-110 active:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>

export { Slider }
