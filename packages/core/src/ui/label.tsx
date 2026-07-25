'use client'

import * as LabelPrimitive from '@primitives/react-label'
import * as React from 'react'

import { useFormField } from './form'
import { cn } from './lib/utils'

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, children, htmlFor, id, ...props }, ref) => {
  const fieldCtx = useFormField()
  // Explicit htmlFor wins; otherwise fall back to FormField's inputId.
  const resolvedHtmlFor = htmlFor ?? fieldCtx.inputId
  // Adopt the field's labelId so non-labellable controls (Combobox div) can point
  // aria-labelledby at this label. Explicit id wins.
  const resolvedId = id ?? fieldCtx.labelId
  const resolvedRequired = required ?? fieldCtx.required
  return (
    <LabelPrimitive.Root
      ref={ref}
      id={resolvedId}
      htmlFor={resolvedHtmlFor}
      className={cn(
        'font-sans text-body-md font-medium text-surface-fg leading-none transition-opacity duration-fast-01 ease-productive-standard peer-disabled:opacity-action-disabled',
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
