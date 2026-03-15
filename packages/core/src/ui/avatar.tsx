'use client'

import * as React from "react"
import * as AvatarPrimitive from "@primitives/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { springs } from "./lib/motion"
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

export type AvatarRing = 'none' | 'lead' | 'admin' | 'client'

const statusColorMap: Record<AvatarStatus, string> = {
  online: 'bg-success-9',
  offline: 'bg-surface-3',
  busy: 'bg-error-9',
  away: 'bg-warning-9',
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
  sm: 'h-[8px] w-[8px]',
  md: 'h-ds-03 w-ds-03',
  lg: 'h-[12px] w-[12px]',
  xl: 'h-ds-04 w-ds-04',
}

// ── Role ring ───────────────────────────────────────────────────────────────

const ringColorMap: Record<Exclude<AvatarRing, 'none'>, string> = {
  lead: 'ring-accent-7',
  admin: 'ring-warning-7',
  client: 'ring-info-7',
}

const ringShapeMap: Record<string, string> = {
  circle: 'rounded-ds-full',
  square: 'rounded-ds-none',
  rounded: 'rounded-ds-md',
}

// ── Deterministic fallback colors ───────────────────────────────────────────

const FALLBACK_COLORS = [
  { bg: 'bg-accent-2', text: 'text-accent-11' },
  { bg: 'bg-success-2', text: 'text-success-11' },
  { bg: 'bg-warning-2', text: 'text-warning-11' },
  { bg: 'bg-error-2', text: 'text-error-11' },
  { bg: 'bg-info-2', text: 'text-info-11' },
  { bg: 'bg-cat-purple-2', text: 'text-cat-purple-11' },
  { bg: 'bg-cat-pink-2', text: 'text-cat-pink-11' },
  { bg: 'bg-cat-teal-2', text: 'text-cat-teal-11' },
] as const

/**
 * Simple string hash that produces a deterministic index into FALLBACK_COLORS.
 * Uses djb2 for a reasonable distribution with short strings.
 */
function getFallbackColor(seed: string): (typeof FALLBACK_COLORS)[number] {
  let hash = 5381
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % FALLBACK_COLORS.length
  return FALLBACK_COLORS[index]
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
 * **Role ring:** `ring="lead"` (accent) | `"admin"` (warning) | `"client"` (info) — a colored ring
 * around the avatar indicating the user's role.
 *
 * **Badge:** `badge={5}` (number) | `badge="dot"` (notification dot) | `badge={<Icon />}` (custom).
 * Numbers > 99 display as "99+". Badge is hidden when `0` or `undefined`.
 *
 * **Loading:** `loading={true}` shows a pulse skeleton placeholder.
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
  /** Role ring color indicator */
  ring?: AvatarRing
  /** Badge overlay: number, 'dot', or custom ReactNode */
  badge?: number | 'dot' | React.ReactNode
  /** Show loading skeleton instead of content */
  loading?: boolean
  children?: React.ReactNode
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, shape, status, ring, badge, loading, children, ...props }, ref) => {
  const resolvedShape = shape ?? 'circle'

  // Build ring classes for the outer wrapper
  const ringClasses = ring && ring !== 'none'
    ? cn('ring-2 ring-offset-2 ring-offset-surface-2', ringColorMap[ring], ringShapeMap[resolvedShape])
    : undefined

  // Loading skeleton — early return
  if (loading) {
    return (
      <span ref={ref} className={cn('relative inline-flex shrink-0', ringClasses)}>
        <span
          className={cn(avatarVariants({ size, shape }), 'animate-pulse bg-surface-3')}
          data-slot="avatar-skeleton"
        />
      </span>
    )
  }

  // Determine whether to render badge
  const showBadge = badge !== undefined && badge !== 0

  return (
    <span className={cn('relative inline-flex shrink-0', ringClasses)}>
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
            'absolute bottom-0 right-0 rounded-ds-full ring-2 ring-surface-2',
            statusColorMap[status],
            statusDotSizeMap[size ?? 'md'],
            status === 'online' && 'animate-pulse',
          )}
          role="img"
          aria-label={statusLabelMap[status]}
        />
      )}
      {showBadge && (
        badge === 'dot' ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-[8px] w-[8px] rounded-ds-full bg-error-9 ring-2 ring-surface-2"
            data-slot="avatar-badge-dot"
            aria-hidden="true"
          />
        ) : typeof badge === 'number' ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springs.bouncy}
            className="absolute -right-1 -top-1 flex min-w-[16px] items-center justify-center rounded-ds-full bg-error-9 px-1 text-[10px] font-bold leading-[16px] text-error-fg ring-2 ring-surface-2"
            data-slot="avatar-badge"
            role="status"
            aria-label={`${badge > 99 ? '99+' : badge} notifications`}
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        ) : (
          <span className="absolute -right-1 -top-1" data-slot="avatar-badge-custom">
            {badge}
          </span>
        )
      )}
    </span>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={springs.smooth}
    className="h-full w-full"
  >
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  </motion.span>
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  /**
   * Seed string for deterministic color selection.
   * Falls back to the text content of `children` if not provided.
   */
  colorSeed?: string
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, colorSeed, children, ...props }, ref) => {
  // Derive seed: explicit colorSeed > children text content > empty string
  const childrenText = typeof children === 'string' ? children : ''
  const seed = colorSeed ?? childrenText
  const color = getFallbackColor(seed)

  // Letter-spacing based on character count
  const tracking = childrenText.length === 1 ? 'tracking-wide' : 'tracking-normal'

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        'flex h-full w-full items-center justify-center rounded-ds-full',
        color.bg,
        color.text,
        tracking,
        className,
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
