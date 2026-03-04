'use client'

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

/**
 * Props for IconButton — a square or circular icon-only button built on top of `<Button>`,
 * with `aria-label` required for WCAG AA compliance.
 *
 * **`aria-label` is required** — icon-only buttons have no visible text, so a descriptive label
 * is mandatory for screen readers. TypeScript enforces this.
 *
 * **Shape:** `'square'` (default, rounded corners) | `'circle'` (fully round, great for avatar-adjacent actions)
 *
 * **Size:** `'sm'` | `'md'` (default) | `'lg'` — maps to `icon-sm/md/lg` sizes internally.
 *
 * **All `Button` variants** are supported: `primary`, `secondary`, `ghost`, `error`, `error-ghost`, `link`.
 *
 * @example
 * // Ghost toolbar icon button:
 * <IconButton icon={<IconEdit />} variant="ghost" aria-label="Edit item" />
 *
 * @example
 * // Circular close button (e.g. in a modal header):
 * <IconButton icon={<IconX />} shape="circle" variant="ghost" size="sm" aria-label="Close dialog" />
 *
 * @example
 * // Primary floating action button:
 * <IconButton icon={<IconPlus />} variant="primary" size="lg" aria-label="Create new project" />
 *
 * @example
 * // Error icon button with loading state (e.g. confirm delete):
 * <IconButton icon={<IconTrash />} variant="error" loading={isDeleting} aria-label="Delete" />
 * // These are just a few ways — feel free to combine props creatively!
 */
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
