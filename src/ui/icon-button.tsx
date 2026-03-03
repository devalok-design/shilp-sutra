import * as React from 'react'
import { Button, type ButtonProps } from './button'
import { cn } from './lib/utils'

/** Map friendly sizes to icon-* sizes for the underlying Button */
const sizeMap = {
  sm: 'icon-sm',
  md: 'icon-md',
  lg: 'icon-lg',
} as const

type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps
  extends Omit<ButtonProps, 'startIcon' | 'endIcon' | 'fullWidth' | 'loadingPosition' | 'children' | 'size'> {
  /** The icon element to render */
  icon: React.ReactNode
  /** Accessible label — required for icon-only buttons (WCAG AA) */
  'aria-label': string
  /** Button shape. Default: 'square' */
  shape?: 'square' | 'circle'
  /** Button size. Default: 'md' */
  size?: IconButtonSize
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, shape = 'square', size = 'md', className, loading, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={sizeMap[size]}
        className={cn(shape === 'circle' && 'rounded-ds-full', className)}
        loading={loading}
        loadingPosition="center"
        {...props}
      >
        {icon}
      </Button>
    )
  },
)
IconButton.displayName = 'IconButton'

export { IconButton }
