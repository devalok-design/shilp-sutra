'use client'

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

/**
 * Props for ButtonGroup — a container that visually merges adjacent `<Button>` components into
 * a single connected unit, and propagates a shared `variant` and `size` via context.
 *
 * **Context propagation:** Child `<Button>` components automatically inherit `variant` and `size`
 * from ButtonGroup. Individual children can still override by passing their own `variant` or `size`.
 *
 * **Visual joining:** Adjacent button borders are merged with negative margins and border-radius overrides.
 *
 * @example
 * // Horizontal toolbar action group (secondary variant shared):
 * <ButtonGroup variant="secondary" size="sm">
 *   <Button startIcon={<IconBold />}>Bold</Button>
 *   <Button startIcon={<IconItalic />}>Italic</Button>
 *   <Button startIcon={<IconUnderline />}>Underline</Button>
 * </ButtonGroup>
 *
 * @example
 * // Vertical action group for a sidebar panel:
 * <ButtonGroup orientation="vertical" variant="ghost" size="md">
 *   <Button>Profile</Button>
 *   <Button>Settings</Button>
 *   <Button variant="error-ghost">Danger zone</Button>
 * </ButtonGroup>
 *
 * @example
 * // Split button pattern (primary action + dropdown trigger):
 * <ButtonGroup variant="primary" size="md">
 *   <Button onClick={handlePublish}>Publish</Button>
 *   <Button size="icon-md" aria-label="More publish options"><IconChevronDown /></Button>
 * </ButtonGroup>
 * // These are just a few ways — feel free to combine props creatively!
 */
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
