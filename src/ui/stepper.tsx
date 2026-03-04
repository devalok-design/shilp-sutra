import * as React from 'react'
import { cn } from './lib/utils'

type StepState = 'completed' | 'active' | 'pending'

type StepperContextValue = {
  activeStep: number
  orientation: 'horizontal' | 'vertical'
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 0,
  orientation: 'horizontal',
})

/**
 * Props for Stepper — a multi-step progress indicator that renders a connected series of `<Step>`
 * children with connector lines, showing completed/active/pending states automatically.
 *
 * **`activeStep`:** 0-indexed. Step at `activeStep` is "active", steps before it are "completed",
 * steps after it are "pending". Update this value to advance the stepper.
 *
 * **Orientation:** `'horizontal'` (default, left-to-right) | `'vertical'` (top-to-bottom, for sidebars).
 *
 * **Children:** Must be `<Step>` components. The Stepper injects `_index` into each child automatically.
 *
 * @example
 * // Horizontal 3-step form wizard:
 * <Stepper activeStep={currentStep}>
 *   <Step label="Account" description="Create your credentials" />
 *   <Step label="Profile" description="Add your details" />
 *   <Step label="Review" description="Confirm and submit" />
 * </Stepper>
 *
 * @example
 * // Vertical onboarding checklist in a sidebar:
 * <Stepper activeStep={completedSteps} orientation="vertical">
 *   <Step label="Connect workspace" />
 *   <Step label="Invite teammates" />
 *   <Step label="Set up billing" />
 * </Stepper>
 * // These are just a few ways — feel free to combine props creatively!
 */
interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number
  orientation?: 'horizontal' | 'vertical'
  children: React.ReactNode
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ activeStep, orientation = 'horizontal', className, children, ...props }, ref) => {
    const steps = React.Children.toArray(children)
    return (
      <StepperContext.Provider value={{ activeStep, orientation }}>
        <div
          ref={ref}
          className={cn(
            'flex gap-ds-02',
            orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
            className,
          )}
          role="list"
          {...props}
        >
          {steps.map((child, index) => (
            <React.Fragment key={index}>
              {React.isValidElement<StepInternalProps>(child)
                ? React.cloneElement(child, { _index: index })
                : child}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1',
                    orientation === 'vertical'
                      ? 'ml-ds-04 w-ds-01 min-h-ds-05'
                      : 'h-ds-01 min-w-ds-05',
                    index < activeStep
                      ? 'bg-interactive'
                      : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </StepperContext.Provider>
    )
  },
)

/**
 * Props for Step — a single step within a `<Stepper>`. The visual state (completed/active/pending)
 * is derived from the parent Stepper's `activeStep` and this step's position — you don't set it manually.
 *
 * @example
 * // Basic step with label and description:
 * <Step label="Payment" description="Enter your card details" />
 *
 * @example
 * // Step with a custom icon (overrides the default number/checkmark):
 * <Step label="Verified" icon={<IconShieldCheck className="h-ico-sm w-ico-sm" />} />
 */
interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  description?: string
  icon?: React.ReactNode
}

type StepInternalProps = StepProps & { _index?: number }

const Step = React.forwardRef<HTMLDivElement, StepInternalProps>(
  ({ label, description, icon, className, _index = 0, ...props }, ref) => {
    const { activeStep, orientation } = React.useContext(StepperContext)
    const state: StepState = _index < activeStep ? 'completed' : _index === activeStep ? 'active' : 'pending'

    return (
      <div
        ref={ref}
        data-step=""
        data-state={state}
        role="listitem"
        className={cn(
          'flex items-center gap-ds-03',
          orientation === 'vertical' && 'py-ds-02',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'flex-shrink-0 flex items-center justify-center w-ds-sm h-ds-sm rounded-ds-full text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] transition-colors duration-fast-01',
            state === 'completed' && 'bg-interactive text-text-on-color',
            state === 'active' && 'bg-interactive text-text-on-color',
            state === 'pending' && 'bg-layer-02 text-text-tertiary border border-border',
          )}
        >
          {icon || (state === 'completed' ? (
            <svg className="w-ico-sm h-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            _index + 1
          ))}
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              'text-[length:var(--font-size-md)] font-[number:var(--font-weight-medium)] leading-[var(--line-height-snug)]',
              state === 'pending'
                ? 'text-text-tertiary'
                : 'text-text-primary',
            )}
          >
            {label}
          </span>
          {description && (
            <span className="text-[length:var(--font-size-sm)] text-text-secondary leading-[var(--line-height-relaxed)]">
              {description}
            </span>
          )}
        </div>
      </div>
    )
  },
)

Stepper.displayName = 'Stepper'
Step.displayName = 'Step'

export { Stepper, Step, type StepperProps, type StepProps }
