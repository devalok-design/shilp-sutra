import * as React from 'react'
import { cn } from './lib/utils'

export type FormHelperState = 'helper' | 'error' | 'warning' | 'success'

type FormFieldContextValue = { state: FormHelperState }
const FormFieldContext = React.createContext<FormFieldContextValue>({ state: 'helper' })

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique ID for the helper text — link to input via aria-describedby */
  helperTextId?: string
  /** Current validation state — propagated to children via context */
  state?: FormHelperState
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, helperTextId: _helperTextId, state = 'helper', ...props }, ref) => (
    <FormFieldContext.Provider value={{ state }}>
      <div
        ref={ref}
        className={cn('flex flex-col gap-ds-02', className)}
        {...props}
      />
    </FormFieldContext.Provider>
  ),
)
FormField.displayName = 'FormField'

// FormHelperText — small helper/error/warning/success message under a field
//
// When used for errors, set an `id` matching the input's `aria-describedby`.
export interface FormHelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  state?: FormHelperState
}

const helperStateClasses: Record<FormHelperState, string> = {
  helper:  'text-text-helper',
  error:   'text-text-error',
  warning: 'text-text-warning',
  success: 'text-text-success',
}

const FormHelperText = React.forwardRef<HTMLParagraphElement, FormHelperTextProps>(
  ({ className, state: stateProp, ...props }, ref) => {
    const context = React.useContext(FormFieldContext)
    const state = stateProp ?? context.state

    return (
      <p
        ref={ref}
        role={state === 'error' ? 'alert' : undefined}
        className={cn('text-ds-sm', helperStateClasses[state], className)}
        {...props}
      />
    )
  },
)
FormHelperText.displayName = 'FormHelperText'

/**
 * Helper to compute a11y attributes for form inputs.
 *
 * @example
 *   const a11y = getFormFieldA11y('email-error', 'error')
 *   <Input {...a11y} />
 *   // => { "aria-describedby": "email-error", "aria-invalid": true }
 */
function getFormFieldA11y(
  helperTextId?: string,
  state?: FormHelperState,
): { 'aria-describedby'?: string; 'aria-invalid'?: boolean } {
  return {
    ...(helperTextId ? { 'aria-describedby': helperTextId } : {}),
    ...(state === 'error' ? { 'aria-invalid': true as const } : {}),
  }
}

export { FormField, FormFieldContext, FormHelperText, getFormFieldA11y }
