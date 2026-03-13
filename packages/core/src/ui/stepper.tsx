'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from './lib/utils'
import { springs } from './lib/motion'

type StepState = 'completed' | 'active' | 'pending'

type StepperContextValue = {
  activeStep: number
  orientation: 'horizontal' | 'vertical'
  stepperId: string
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 0,
  orientation: 'horizontal',
  stepperId: '',
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
    const stepperId = React.useId()
    return (
      <StepperContext.Provider value={{ activeStep, orientation, stepperId }}>
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
                    'relative flex-1 overflow-hidden',
                    orientation === 'vertical'
                      ? 'ml-ds-04 w-ds-01 min-h-ds-05'
                      : 'h-ds-01 min-w-ds-05',
                    'bg-surface-border',
                  )}
                  aria-hidden="true"
                >
                  {/* Animated filled portion */}
                  <motion.div
                    className={cn(
                      'absolute inset-0 bg-accent-9',
                      orientation === 'vertical' ? 'origin-top' : 'origin-left',
                    )}
                    initial={false}
                    animate={{
                      [orientation === 'vertical' ? 'scaleY' : 'scaleX']:
                        index < activeStep ? 1 : 0,
                    }}
                    transition={springs.smooth}
                  />
                </div>
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
    const { activeStep, orientation, stepperId } = React.useContext(StepperContext)
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
            'relative flex-shrink-0 flex items-center justify-center w-ds-sm h-ds-sm rounded-ds-full text-ds-sm font-semibold',
            state === 'completed' && 'bg-accent-9 text-accent-fg',
            state === 'active' && 'text-accent-fg',
            state === 'pending' && 'bg-surface-2 text-surface-fg-subtle border border-surface-border-strong',
          )}
        >
          {/* Active step highlight — slides between steps via layoutId */}
          {state === 'active' && (
            <motion.div
              layoutId={`${stepperId}-stepper-active`}
              className="absolute inset-0 rounded-ds-full bg-accent-9"
              transition={springs.smooth}
            />
          )}
          <span className="relative z-10">
            {icon || (state === 'completed' ? (
              <motion.svg
                className="w-ico-sm h-ico-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springs.bouncy}
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            ) : (
              _index + 1
            ))}
          </span>
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              'text-ds-md font-medium leading-ds-snug',
              state === 'pending'
                ? 'text-surface-fg-subtle'
                : 'text-surface-fg',
            )}
          >
            {label}
          </span>
          {description && (
            <span className="text-ds-sm text-surface-fg-muted leading-ds-relaxed">
              {description}
            </span>
          )}
        </div>
      </div>
    )
  },
)

/**
 * Props for StepperContent — wraps the content panel for the active step, animating
 * slide transitions when `activeStep` changes. Detects forward vs backward navigation
 * and slides content accordingly.
 *
 * @example
 * <StepperContent activeStep={currentStep}>
 *   {currentStep === 0 && <AccountForm />}
 *   {currentStep === 1 && <ProfileForm />}
 *   {currentStep === 2 && <ReviewPanel />}
 * </StepperContent>
 */
interface StepperContentProps {
  activeStep: number
  children: React.ReactNode
  className?: string
}

const SLIDE_OFFSET = 40

const stepContentVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * SLIDE_OFFSET,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -SLIDE_OFFSET,
  }),
}

function StepperContent({ activeStep, children, className }: StepperContentProps) {
  const prevStepRef = React.useRef(activeStep)
  const direction = activeStep >= prevStepRef.current ? 1 : -1

  React.useEffect(() => {
    prevStepRef.current = activeStep
  }, [activeStep])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeStep}
          custom={direction}
          variants={stepContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springs.smooth}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

Stepper.displayName = 'Stepper'
Step.displayName = 'Step'
StepperContent.displayName = 'StepperContent'

export { Stepper, Step, StepperContent, type StepperProps, type StepProps, type StepperContentProps }
