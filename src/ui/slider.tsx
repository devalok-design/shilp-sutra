import * as React from 'react'
import * as SliderPrimitive from '@primitives/react-slider'

import { cn } from './lib/utils'

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, 'aria-label': ariaLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-ds-full bg-field">
      <SliderPrimitive.Range className="absolute h-full bg-interactive" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-label={ariaLabel}
      className="block h-ico-sm w-ico-sm rounded-ds-full border-2 border-interactive bg-layer-01 shadow-01 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]"
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
