'use client'

import { motion } from 'framer-motion'
import * as React from 'react'

import { MotionPreference } from '../motion/motion-preference'
import { motionProps, tweens } from './lib/motion'
import { cn } from './lib/utils'

export type FormHelperState = 'helper' | 'error' | 'warning' | 'success'

interface FormFieldContextValue {
  state?: FormHelperState
  helperTextId?: string
  /** Auto-generated id shared between Label (htmlFor) and the field input (id). */
  inputId?: string
  /**
   * Auto-generated id of the Label itself. Non-labellable controls (e.g. the
   * Combobox trigger, a `div[role=combobox]`, which `<label htmlFor>` can't target)
   * reference this via `aria-labelledby` to still adopt the visible label as their
   * accessible name.
   */
  labelId?: string
  required?: boolean
}
const FormFieldContext = React.createContext<FormFieldContextValue>({})

/**
 * FormField — vertical flex container that provides validation state and
 * aria-describedby wiring to children via React context.
 *
 * **Automatic a11y wiring:** FormField generates a stable ID (or uses a provided `helperTextId`)
 * and passes it to `FormHelperText` via context. Use the `useFormField()` hook in custom inputs
 * to read `{ state, helperTextId, required }` and spread onto your input element.
 *
 * @example
 * <FormField state="error">
 *   <Label htmlFor="email">Email</Label>
 *   <Input id="email" state="error" />
 *   <FormHelperText>Please enter a valid email address.</FormHelperText>
 * </FormField>
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Custom ID for the helper text element. If omitted, an auto-generated ID is used.
   * Pass this to `useFormField()` consumers that need to set `aria-describedby`.
   */
  helperTextId?: string
  /**
   * Custom ID for the field input element. If omitted, an auto-generated ID is used.
   * Label (when inside FormField) reads this via `htmlFor`; Input reads it via `id`.
   * Explicit `htmlFor` / `id` props on children always win.
   */
  inputId?: string
  /** Current validation state — propagated to child `FormHelperText` via context */
  state?: FormHelperState
  /** Whether the field is required — available to children via `useFormField()` */
  required?: boolean
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, helperTextId, inputId, state = 'helper', required, children, ...props }, ref) => {
    const autoId = React.useId()
    const resolvedHelperId = helperTextId || `${autoId}-helper`
    const resolvedInputId = inputId || `${autoId}-input`
    const resolvedLabelId = `${resolvedInputId}-label`
    const contextValue = React.useMemo(
      () => ({ state, helperTextId: resolvedHelperId, inputId: resolvedInputId, labelId: resolvedLabelId, required }),
      [state, resolvedHelperId, resolvedInputId, resolvedLabelId, required],
    )

    return (
      <FormFieldContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('flex flex-col gap-ds-02', className)}
          {...props}
        >
          {children}
        </div>
      </FormFieldContext.Provider>
    )
  },
)
FormField.displayName = 'FormField'

// FormHelperText — small helper/error/warning/success message under a field
//
// When used for errors, set an `id` matching the input's `aria-describedby`.
export interface FormHelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  state?: FormHelperState
}

const helperStateClasses: Record<FormHelperState, string> = {
  helper:  'text-surface-fg-subtle',
  error:   'text-error-11',
  warning: 'text-warning-11',
  success: 'text-success-11',
}

const FormHelperText = React.forwardRef<HTMLParagraphElement, FormHelperTextProps>(
  ({ className, id: idProp, state: stateProp, ...props }, ref) => {
    const context = React.useContext(FormFieldContext)
    const state = stateProp ?? context.state ?? 'helper'
    const id = idProp ?? context.helperTextId

    return (
      <MotionPreference>
        <motion.p
          ref={ref}
          id={id}
          role={state === 'error' ? 'alert' : undefined}
          className={cn('text-body-sm', helperStateClasses[state], className)}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={tweens.fade}
          {...motionProps(props)}
        />
      </MotionPreference>
    )
  },
)
FormHelperText.displayName = 'FormHelperText'

/**
 * Hook to read FormField context — returns `{ state, helperTextId, required }`.
 * Use in custom input components to auto-wire `aria-describedby` and `aria-invalid`.
 *
 * @example
 * function MyCustomInput(props) {
 *   const { state, helperTextId, required } = useFormField()
 *   return (
 *     <input
 *       aria-describedby={helperTextId}
 *       aria-invalid={state === 'error' || undefined}
 *       aria-required={required}
 *       {...props}
 *     />
 *   )
 * }
 */
export function useFormField(): FormFieldContextValue {
  return React.useContext(FormFieldContext)
}

export { FormField, FormFieldContext, FormHelperText }
