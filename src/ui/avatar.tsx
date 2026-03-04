import * as React from "react"
import * as AvatarPrimitive from "@primitives/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./lib/utils"

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden',
  {
    variants: {
      size: {
        xs: 'h-ds-xs w-ds-xs',
        sm: 'h-ds-sm w-ds-sm',
        md: 'h-ds-md w-ds-md',
        lg: 'h-ds-lg w-ds-lg',
        xl: 'h-ds-xl w-ds-xl',
      },
      shape: {
        circle: 'rounded-ds-full',
        square: 'rounded-ds-none',
        rounded: 'rounded-ds-md',
      },
    },
    defaultVariants: { size: 'md', shape: 'circle' },
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
  xs: 'h-ds-02b w-ds-02b',
  sm: 'h-2 w-2',
  md: 'h-ds-03 w-ds-03',
  lg: 'h-3 w-3',
  xl: 'h-ds-04 w-ds-04',
}

/**
 * Props for Avatar — a user/entity image container with size, shape, and presence-status variants.
 *
 * **Sizes:** `xs` | `sm` | `md` (default) | `lg` | `xl` — the status dot scales with the avatar size.
 *
 * **Shapes:** `circle` (default, round) | `square` (sharp corners) | `rounded` (rounded corners, for bots/apps)
 *
 * **Status dot:** `status="online"` (green) | `"offline"` (muted) | `"busy"` (red) | `"away"` (amber).
 * The dot renders with `role="img"` and an accessible `aria-label` — it is not purely decorative.
 *
 * **Children:** Use `<AvatarImage>` for the photo and `<AvatarFallback>` for initials when the image fails.
 *
 * @example
 * // User avatar with photo and fallback initials:
 * <Avatar size="md">
 *   <AvatarImage src={user.avatarUrl} alt={user.name} />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 *
 * @example
 * // Online presence indicator in a team roster:
 * <Avatar size="lg" status="online">
 *   <AvatarImage src={user.photoUrl} alt={user.name} />
 *   <AvatarFallback>{user.initials}</AvatarFallback>
 * </Avatar>
 *
 * @example
 * // Square shape for a bot/integration logo:
 * <Avatar shape="square" size="xl">
 *   <AvatarImage src="/logos/github.png" alt="GitHub" />
 * </Avatar>
 * // These are just a few ways — feel free to combine props creatively!
 */
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
>(({ className, size, shape, status, children, ...props }, ref) => (
  <span className="relative inline-flex shrink-0">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size, shape }), className)}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
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
  </span>
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
