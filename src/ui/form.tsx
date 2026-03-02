import * as React from 'react'
import { cn } from './lib/utils'

export type FormHelperState = 'helper' | 'error' | 'warning' | 'success'

// FormField — wraps a label + input + helper text in a column layout
const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-[var(--spacing-02)]', className)}
      {...props}
    />
  ),
)
FormField.displayName = 'FormField'

// FormHelperText — small helper/error/warning/success message under a field
export interface FormHelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  state?: FormHelperState
}

const helperStateClasses: Record<FormHelperState, string> = {
  helper:  'text-[var(--color-text-helper)]',
  error:   'text-[var(--color-text-error)]',
  warning: 'text-[var(--color-text-warning)]',
  success: 'text-[var(--color-text-success)]',
}

const FormHelperText = React.forwardRef<HTMLParagraphElement, FormHelperTextProps>(
  ({ className, state = 'helper', ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-ds-sm', helperStateClasses[state], className)}
      {...props}
    />
  ),
)
FormHelperText.displayName = 'FormHelperText'

export { FormField, FormHelperText }
