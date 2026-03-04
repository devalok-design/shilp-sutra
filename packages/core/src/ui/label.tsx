'use client'

import * as React from 'react'
import * as LabelPrimitive from '@primitives/react-label'

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
      'font-sans text-ds-md font-medium text-text-primary leading-none peer-disabled:opacity-[0.38]',
      className,
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="text-text-error ml-ds-01" aria-hidden="true">*</span>
    )}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
