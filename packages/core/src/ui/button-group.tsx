'use client'

import * as React from 'react'

import type { ButtonProps } from './button'
import { cn } from './lib/utils'

// ── Context ─────────────────────────────────────────────────────

export type ButtonGroupPosition = 'first' | 'middle' | 'last' | 'only'

interface ButtonGroupContextValue {
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  weight?: ButtonProps['weight']
  shape?: ButtonProps['shape']
  size?: ButtonProps['size']
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  attached?: boolean
  /** Internal: signals Button children to stretch to fill available width */
  _stretch?: boolean
}

// Separate context for position (changes per child) vs group settings (same for all)
interface ButtonGroupItemContext {
  position: ButtonGroupPosition
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue>({})
const ButtonGroupItemContext = React.createContext<ButtonGroupItemContext | null>(null)

export function useButtonGroup() {
  return React.useContext(ButtonGroupContext)
}

export function useButtonGroupItem() {
  return React.useContext(ButtonGroupItemContext)
}

// ── Radius helper (consumed by Button internally) ───────────────

/**
 * Returns inline style for border-radius AND border-collapse based on position
 * in an attached ButtonGroup. Inner borders are removed (not overlapped) to
 * guarantee consistent 1px borders regardless of wrapper nesting.
 */
export function getGroupPositionStyle(
  position: ButtonGroupPosition,
  orientation: 'horizontal' | 'vertical',
): React.CSSProperties | undefined {
  if (position === 'only') return undefined

  if (orientation === 'horizontal') {
    switch (position) {
      case 'first':
        return { borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }
      case 'middle':
        return { borderRadius: 0, borderRightWidth: 0 }
      case 'last':
        return { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
    }
  } else {
    switch (position) {
      case 'first':
        return { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0 }
      case 'middle':
        return { borderRadius: 0, borderBottomWidth: 0 }
      case 'last':
        return { borderTopLeftRadius: 0, borderTopRightRadius: 0 }
    }
  }
}

// ── Props ───────────────────────────────────────────────────────

export interface ButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Shared variant applied to all child Buttons (children can override). */
  variant?: ButtonProps['variant']
  /** Shared color applied to all child Buttons (children can override). */
  color?: ButtonProps['color']
  /** Shared weight applied to all child Buttons (children can override). */
  weight?: ButtonProps['weight']
  /** Shared shape applied to all child Buttons (children can override). */
  shape?: ButtonProps['shape']
  /** Shared size applied to all child Buttons (children can override). */
  size?: ButtonProps['size']
  /** Disable all child Buttons. */
  disabled?: boolean
  /** Layout direction. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Whether buttons are visually attached (merged) or spaced apart. @default true */
  attached?: boolean
  /** Stretch to full width of parent container. */
  fullWidth?: boolean
}

// ── Divider colors (for non-outline variants that lack visible borders) ──

function getDividerColor(variant?: string, color?: string): string {
  if (variant === 'solid') {
    const map: Record<string, string> = {
      accent: 'bg-accent-11/20', error: 'bg-error-11/20', success: 'bg-success-11/20',
      warning: 'bg-warning-11/20', info: 'bg-info-11/20', neutral: 'bg-neutral-8/30',
    }
    return map[color ?? 'accent'] ?? map.accent
  }
  if (variant === 'soft') {
    const map: Record<string, string> = {
      accent: 'bg-accent-5', error: 'bg-error-5', success: 'bg-success-5',
      warning: 'bg-warning-5', info: 'bg-info-5', neutral: 'bg-neutral-4',
    }
    return map[color ?? 'accent'] ?? map.accent
  }
  // ghost, link, etc.
  return 'bg-surface-border'
}

// ── Component ───────────────────────────────────────────────────

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, variant, color, weight, shape, size, disabled, orientation = 'horizontal', attached = true, fullWidth, children, ...props }, ref) => {
    const shouldStretch = fullWidth || orientation === 'vertical'
    const groupValue = React.useMemo(
      () => ({ variant, color, weight, shape, size, disabled, orientation, attached, _stretch: shouldStretch }),
      [variant, color, weight, shape, size, disabled, orientation, attached, shouldStretch],
    )

    const validChildren = React.Children.toArray(children).filter(React.isValidElement)
    const total = validChildren.length

    function getPosition(index: number): ButtonGroupPosition {
      if (total === 1) return 'only'
      if (index === 0) return 'first'
      if (index === total - 1) return 'last'
      return 'middle'
    }

    return (
      <ButtonGroupContext.Provider value={groupValue}>
        <div
          ref={ref}
          role="group"
          className={cn(
            'inline-flex',
            fullWidth && 'w-full',
            fullWidth && orientation === 'horizontal' && '[&>*]:flex-1',
            orientation === 'horizontal' ? 'flex-row' : 'flex-col items-stretch',
            !attached && 'gap-ds-02',
            // Focus isolation — lift focused/hovered button above siblings
            '[&>*:focus-within]:z-10 [&>*:hover]:z-10',
            className,
          )}
          {...props}
        >
          {attached
            ? validChildren.map((child, i) => {
                const needsDivider = i > 0 && variant !== 'outline'
                return (
                  <React.Fragment key={i}>
                    {needsDivider && (
                      <div
                        aria-hidden
                        className={cn(
                          'shrink-0 self-stretch',
                          orientation === 'horizontal' ? 'w-px' : 'h-px',
                          getDividerColor(variant ?? undefined, color ?? undefined),
                        )}
                      />
                    )}
                    <ButtonGroupItemContext.Provider value={{ position: getPosition(i) }}>
                      {child}
                    </ButtonGroupItemContext.Provider>
                  </React.Fragment>
                )
              })
            : children}
        </div>
      </ButtonGroupContext.Provider>
    )
  },
)
ButtonGroup.displayName = 'ButtonGroup'

export { ButtonGroup }
