import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from './lib/utils'

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'font-sans text-sm font-medium text-[var(--color-text-primary)] leading-none peer-disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="text-[var(--color-text-error)] ml-0.5" aria-hidden="true">*</span>
    )}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
