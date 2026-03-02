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

type StepperProps = {
  activeStep: number
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children: React.ReactNode
}

function Stepper({ activeStep, orientation = 'horizontal', className, children }: StepperProps) {
  const steps = React.Children.toArray(children)
  return (
    <StepperContext.Provider value={{ activeStep, orientation }}>
      <div
        className={cn(
          'flex gap-ds-02',
          orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
          className,
        )}
        role="list"
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
                    ? 'ml-ds-04 w-0.5 min-h-[var(--spacing-05)]'
                    : 'h-0.5 min-w-[var(--spacing-05)]',
                  index < activeStep
                    ? 'bg-[var(--color-interactive)]'
                    : 'bg-[var(--color-border-default)]',
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </StepperContext.Provider>
  )
}

type StepProps = {
  label: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

type StepInternalProps = StepProps & { _index?: number }

function Step({ label, description, icon, className, _index = 0 }: StepInternalProps) {
  const { activeStep, orientation } = React.useContext(StepperContext)
  const state: StepState = _index < activeStep ? 'completed' : _index === activeStep ? 'active' : 'pending'

  return (
    <div
      data-step=""
      data-state={state}
      role="listitem"
      className={cn(
        'flex items-center gap-ds-03',
        orientation === 'vertical' && 'py-ds-02',
        className,
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center w-ds-sm h-ds-sm rounded-[var(--radius-full)] text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] transition-colors duration-fast',
          state === 'completed' && 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]',
          state === 'active' && 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]',
          state === 'pending' && 'bg-[var(--color-layer-02)] text-[var(--color-text-tertiary)] border border-[var(--color-border-default)]',
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
              ? 'text-[var(--color-text-tertiary)]'
              : 'text-[var(--color-text-primary)]',
          )}
        >
          {label}
        </span>
        {description && (
          <span className="text-[length:var(--font-size-sm)] text-[var(--color-text-secondary)] leading-[var(--line-height-relaxed)]">
            {description}
          </span>
        )}
      </div>
    </div>
  )
}

export { Stepper, Step, type StepperProps, type StepProps }
