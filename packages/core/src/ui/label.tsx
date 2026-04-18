'use client'

import * as React from 'react'
import * as LabelPrimitive from '@primitives/react-label'

import { cn } from './lib/utils'
import { useFormField } from './form'

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, children, htmlFor, ...props }, ref) => {
  const fieldCtx = useFormField()
  // Explicit htmlFor wins; otherwise fall back to FormField's inputId.
  const resolvedHtmlFor = htmlFor ?? fieldCtx.inputId
  const resolvedRequired = required ?? fieldCtx.required
  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={resolvedHtmlFor}
      className={cn(
        'font-sans text-ds-md font-medium text-surface-fg leading-none transition-opacity duration-fast-01 ease-productive-standard peer-disabled:opacity-action-disabled',
        className,
      )}
      {...props}
    >
      {children}
      {resolvedRequired && (
        <span className="text-error-11 ml-ds-01" aria-hidden="true">*</span>
      )}
    </LabelPrimitive.Root>
  )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
