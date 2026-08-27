'use client'

import { type VariantProps } from 'class-variance-authority'
import { motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  avatarVariants,
  type AvatarRing,
} from '../ui/avatar'
import { springs } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { getInitials } from './lib/string-utils'

type Size = NonNullable<VariantProps<typeof avatarVariants>['size']>

// Group-level ring. Applied here (not via Avatar's `ring` prop) because that adds
// a ring-offset that gets clipped by the group's overflow; the offset surface is
// derived from `borderColor` so it never seams against a surface-base blend.
const groupRingMap: Record<Exclude<AvatarRing, 'none'>, string> = {
  lead: 'ring-2 ring-accent-7',
  admin: 'ring-2 ring-warning-7',
  client: 'ring-2 ring-info-7',
}

export interface AvatarUser {
  name: string
  image?: string | null
  ring?: AvatarRing
  /** Small top-right marker. `lead` = accent dot, `admin` = warning dot, or any node. */
  indicator?: 'lead' | 'admin' | React.ReactNode
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  users: AvatarUser[]
  max?: number
  size?: Size
  showTooltip?: boolean
  /**
   * Border color for the group avatars. @default 'surface-panel'
   *
   * `'surface-raised'` is the pre-0.57 name for `'surface-panel'` and still
   * works — a widening, so nothing breaks. It is removed next major.
   */
  borderColor?: 'surface-base' | 'surface-panel' | 'surface-raised'
  /** Callback when the "+N" overflow badge is clicked (renders it as a button). */
  onOverflowClick?: () => void
  /** Custom render function for each avatar (consumer owns the Avatar). */
  renderAvatar?: (user: AvatarUser, index: number) => React.ReactNode
  /** Direction avatars expand on hover/focus. @default 'right' */
  expandDirection?: 'left' | 'right'
  /** How far avatars spread on hover/focus. @default 'default' */
  expandAmount?: 'compact' | 'default' | 'wide'
  /** Accessible label for the group. @default `${count} team members` */
  label?: string
}

// Overlap (negative margin) + spread distance, keyed off the same per-size scale.
const overlapMap: Record<Size, string> = {
  xs: '-ml-ds-02',
  sm: '-ml-ds-02b',
  md: '-ml-ds-03',
  lg: '-ml-ds-04',
  xl: '-ml-ds-05',
}
const spreadPxMap: Record<Size, number> = {
  xs: 8, sm: 10, md: 12, lg: 16, xl: 20,
}
const indicatorDotMap: Record<Size, string> = {
  xs: 'size-1', sm: 'size-1.5', md: 'size-2', lg: 'size-2.5', xl: 'size-3',
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      users,
      max = 4,
      size = 'md',
      showTooltip = true,
      borderColor = 'surface-panel',
      onOverflowClick,
      renderAvatar,
      expandDirection = 'right',
      expandAmount = 'default',
      label,
      className,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const reduced = useReducedMotion()
    const [active, setActive] = React.useState(false)

    // Empty group is not a focusable "0 members" target — render nothing.
    if (users.length === 0) return null

    const cap = Math.max(1, max)
    const displayed = users.slice(0, cap)
    const overflow = users.length - cap
    const overlapClass = overlapMap[size]
    const borderClass = borderColor === 'surface-base' ? 'border-surface-base' : 'border-surface-panel'
    const ringOffsetClass = borderColor === 'surface-base'
      ? 'ring-offset-1 ring-offset-surface-base'
      : 'ring-offset-1 ring-offset-surface-panel'

    const spreadPx = spreadPxMap[size]
    const spreadMult = { compact: 0.5, default: 1, wide: 1.5 }[expandAmount]
    const totalVisible = displayed.length + (overflow > 0 ? 1 : 0)

    // Spread offset per index. Zero under reduced-motion (no positional animation).
    const xFor = (index: number): number => {
      if (!active || reduced) return 0
      const shift = spreadPx * spreadMult
      return expandDirection === 'left' ? -(totalVisible - 1 - index) * shift : index * shift
    }

    // framer governs the transition; reduced-motion collapses it to instant.
    const spreadTransition = reduced ? { duration: 0 } : springs.snappy
    // Gentle dim of non-focused peers; instant under reduced-motion.
    const spotlight =
      'transition-opacity duration-fast-02 ease-productive-standard motion-reduce:transition-none hover:z-30 focus-visible:z-30 group-hover:[&:not(:hover)]:opacity-80'

    const onEnter = (e: React.MouseEvent<HTMLDivElement>) => { setActive(true); onMouseEnter?.(e) }
    const onLeave = (e: React.MouseEvent<HTMLDivElement>) => { setActive(false); onMouseLeave?.(e) }
    const onGroupFocus = (e: React.FocusEvent<HTMLDivElement>) => { setActive(true); onFocus?.(e) }
    const onGroupBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setActive(false)
      onBlur?.(e)
    }

    return (
      <TooltipProvider>
        <div
          ref={ref}
          role="group"
          aria-label={label ?? `${users.length} team members`}
          className={cn('group flex items-center', className)}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onFocus={onGroupFocus}
          onBlur={onGroupBlur}
          {...props}
        >
          {displayed.map((user, index) => {
            const key = `${user.name}-${index}`
            const extraRing = user.ring && user.ring !== 'none'
              ? cn(groupRingMap[user.ring], ringOffsetClass)
              : undefined

            const inner = renderAvatar ? (
              renderAvatar(user, index)
            ) : (
              <Avatar size={size} className={borderClass}>
                {user.image && <AvatarImage src={user.image} alt="" />}
                <AvatarFallback colorSeed={user.name}>{getInitials(user.name)}</AvatarFallback>
                {user.indicator && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute top-0 right-0 rounded-pill ring-1 ring-surface-panel',
                      indicatorDotMap[size],
                      user.indicator === 'lead' ? 'bg-accent-9'
                        : user.indicator === 'admin' ? 'bg-warning-9' : '',
                    )}
                  >
                    {typeof user.indicator !== 'string' && user.indicator}
                  </span>
                )}
              </Avatar>
            )

            // Each avatar is a focusable, labelled trigger so keyboard/AT users reach
            // the member name (via the tooltip) and get a visible focus ring.
            const node = (
              <motion.button
                type="button"
                aria-label={user.name}
                animate={{ x: xFor(index) }}
                transition={spreadTransition}
                style={{ zIndex: displayed.length - index }}
                className={cn(
                  'relative shrink-0 rounded-pill focus-ring',
                  index > 0 && overlapClass,
                  spotlight,
                  extraRing,
                )}
              >
                {inner}
              </motion.button>
            )

            if (!showTooltip) return <React.Fragment key={key}>{node}</React.Fragment>

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>{node}</TooltipTrigger>
                <TooltipContent sideOffset={6}>
                  <p className="text-body-sm">{user.name}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {overflow > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={onOverflowClick}
                  aria-label={`${overflow} more ${overflow === 1 ? 'member' : 'members'}`}
                  animate={{ x: xFor(displayed.length) }}
                  transition={spreadTransition}
                  style={{ zIndex: 0 }}
                  className={cn(
                    'relative shrink-0 rounded-pill focus-ring',
                    overlapClass,
                    spotlight,
                    !onOverflowClick && 'cursor-default',
                  )}
                >
                  <Avatar size={size} className={borderClass}>
                    <AvatarFallback className="bg-accent-2 font-semibold text-accent-11">
                      +{overflow}
                    </AvatarFallback>
                  </Avatar>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>
                <div className="flex flex-col gap-ds-01">
                  {users.slice(cap).map((user, i) => (
                    <p key={i} className="text-body-sm">{user.name}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    )
  },
)
AvatarGroup.displayName = 'AvatarGroup'

export { AvatarGroup }
