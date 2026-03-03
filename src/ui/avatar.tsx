import * as React from "react"
import * as AvatarPrimitive from "@primitives/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./lib/utils"

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-ds-full',
  {
    variants: {
      size: {
        xs: 'h-ds-xs w-ds-xs',
        sm: 'h-ds-sm w-ds-sm',
        md: 'h-ds-md w-ds-md',
        lg: 'h-ds-lg w-ds-lg',
        xl: 'h-ds-xl w-ds-xl',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

const statusColorMap: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-layer-03',
  busy: 'bg-error',
  away: 'bg-warning',
}

const statusLabelMap: Record<AvatarStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
  away: 'Away',
}

/**
 * Dot size classes that scale with the avatar size.
 * xs/sm get a smaller dot, md gets medium, lg/xl get a larger dot.
 */
const statusDotSizeMap: Record<string, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
}

export interface AvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, 'children'>,
    VariantProps<typeof avatarVariants> {
  /** Optional status indicator displayed as a dot at the bottom-right corner */
  status?: AvatarStatus
  children?: React.ReactNode
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, status, children, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  >
    {children}
    {status && (
      <span
        className={cn(
          'absolute bottom-0 right-0 rounded-ds-full ring-2 ring-layer-01',
          statusColorMap[status],
          statusDotSizeMap[size ?? 'md'],
        )}
        role="img"
        aria-label={statusLabelMap[status]}
      />
    )}
  </AvatarPrimitive.Root>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-ds-full bg-interactive-subtle text-interactive",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
