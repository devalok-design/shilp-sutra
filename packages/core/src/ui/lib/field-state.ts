/**
 * Shared validation/feedback state for every form control (Input, Textarea,
 * Select, Checkbox, Radio, Switch, Combobox). One prop name, one type, one
 * precedence rule across the whole form family.
 *
 * Precedence: an explicit `state` prop wins over the `FormField` context state.
 * FormField's neutral value is `'helper'` (helper-text styling); a control's
 * neutral is `'default'`/undefined — both resolve to "no validation styling".
 */

/** Validation/feedback state shared by all form controls. */
export type FieldState = 'default' | 'error' | 'warning' | 'success'

/**
 * Resolve the effective control state from an explicit prop + FormField context.
 * `ctxState` is FormField's state (`'helper' | 'error' | 'warning' | 'success'`),
 * typed loosely to avoid a dependency cycle with the (client) form module.
 *
 * Returns the active non-neutral state, or `undefined` when neutral.
 */
export function resolveFieldState(
  explicit: FieldState | undefined,
  ctxState: string | undefined,
): Exclude<FieldState, 'default'> | undefined {
  if (explicit && explicit !== 'default') return explicit
  if (ctxState && ctxState !== 'helper' && ctxState !== 'default') {
    return ctxState as Exclude<FieldState, 'default'>
  }
  return undefined
}
