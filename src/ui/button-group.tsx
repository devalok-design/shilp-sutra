import * as React from 'react'
import { cn } from './lib/utils'
import type { ButtonProps } from './button'

interface ButtonGroupContextValue {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue>({})

export function useButtonGroup() {
  return React.useContext(ButtonGroupContext)
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shared variant applied to all child Buttons (children can override) */
  variant?: ButtonProps['variant']
  /** Shared size applied to all child Buttons (children can override) */
  size?: ButtonProps['size']
  /** Layout direction. Default: 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, variant, size, orientation = 'horizontal', children, ...props }, ref) => {
    const contextValue = React.useMemo(() => ({ variant, size }), [variant, size])

    return (
      <ButtonGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          className={cn(
            'inline-flex',
            orientation === 'horizontal'
              ? [
                  'flex-row',
                  '[&>*:not(:first-child)]:rounded-l-none',
                  '[&>*:not(:last-child)]:rounded-r-none',
                  '[&>*:not(:first-child)]:-ml-px',
                ]
              : [
                  'flex-col',
                  '[&>*:not(:first-child)]:rounded-t-none',
                  '[&>*:not(:last-child)]:rounded-b-none',
                  '[&>*:not(:first-child)]:-mt-px',
                ],
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ButtonGroupContext.Provider>
    )
  },
)
ButtonGroup.displayName = 'ButtonGroup'

export { ButtonGroup }
