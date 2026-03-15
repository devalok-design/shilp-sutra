'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../ui/avatar'
import type { AvatarRing } from '../ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { getInitials } from './lib/string-utils'

// Ring classes applied at group level (not via Avatar's ring prop, which adds an extra wrapper)
const groupRingMap: Record<string, string> = {
  lead: 'ring-2 ring-accent-7 ring-offset-1 ring-offset-surface-2',
  admin: 'ring-2 ring-warning-7 ring-offset-1 ring-offset-surface-2',
  client: 'ring-2 ring-info-7 ring-offset-1 ring-offset-surface-2',
}

const avatarSizeVariants = cva(
  'shrink-0 rounded-ds-full border-2',
  {
    variants: {
      size: {
        xs: 'h-ds-xs w-ds-xs text-[10px]',
        sm: 'h-ds-xs w-ds-xs text-ds-xs',
        md: 'h-ds-sm w-ds-sm text-ds-sm',
        lg: 'h-ds-md w-ds-md text-ds-md',
        xl: 'h-ds-lg w-ds-lg text-ds-md',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export interface AvatarUser {
  name: string
  image?: string | null
  ring?: AvatarRing
}

export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarSizeVariants> {
  users: AvatarUser[]
  max?: number
  showTooltip?: boolean
  /** Border color for the group avatars. @default 'surface-2' */
  borderColor?: 'surface-1' | 'surface-2'
  /** Callback when the "+N" overflow badge is clicked */
  onOverflowClick?: () => void
  /** Custom render function for each avatar */
  renderAvatar?: (user: AvatarUser, index: number) => React.ReactNode
  /** Direction the group expands on hover. 'right' (default) for left-aligned groups, 'left' for right-aligned groups. */
  expandDirection?: 'left' | 'right'
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      users,
      max = 4,
      size,
      showTooltip = true,
      borderColor = 'surface-2',
      onOverflowClick,
      renderAvatar,
      expandDirection = 'right',
      className,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const displayed = users.slice(0, max)
    const overflow = users.length - max

    const overlapMap: Record<string, string> = {
      xs: '-ml-ds-02',
      sm: '-ml-ds-02b',
      md: '-ml-ds-03',
      lg: '-ml-ds-04',
      xl: '-ml-ds-05',
    }
    // Pixel values matching the overlap tokens — used for translateX compensation on hover
    const overlapPxMap: Record<string, number> = {
      xs: 8,
      sm: 10,
      md: 12,
      lg: 16,
      xl: 20,
    }
    const resolvedSize = size ?? 'md'
    const overlapClass = overlapMap[resolvedSize]
    const overlapPx = overlapPxMap[resolvedSize]

    const borderClass =
      borderColor === 'surface-1' ? 'border-surface-1' : 'border-surface-2'

    // Hover expand: margins stay static (negative overlap). On group hover,
    // each avatar translates via inline style (GPU-composited, zero layout thrashing).
    // 'right': avatars spread rightward (for left-aligned groups)
    // 'left': avatars spread leftward (for right-aligned groups)
    const totalVisible = displayed.length + (overflow > 0 ? 1 : 0)

    function getExpandTransform(index: number): string {
      if (!isHovered) return 'translateX(0)'
      if (expandDirection === 'left') {
        return `translateX(-${(totalVisible - 1 - index) * overlapPx}px)`
      }
      return `translateX(${index * overlapPx}px)`
    }

    const spotlightClasses =
      'transition-[transform,opacity] duration-300 ease-out hover:z-50 hover:scale-105 group-hover:[&:not(:hover)]:opacity-85'

    return (
      <TooltipProvider>
        <div
          ref={ref}
          role="group"
          aria-label={`${users.length} team members`}
          tabIndex={0}
          className={cn('group flex items-center', className)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setIsHovered(false)
          }}
          {...props}
        >
          {displayed.map((user, index) => {
            const initials = getInitials(user.name)

            if (renderAvatar) {
              const element = (
                <div
                  key={user.name}
                  className={cn(
                    avatarSizeVariants({ size }),
                    borderClass,
                    index > 0 && overlapClass,
                    spotlightClasses,
                    user.ring && user.ring !== 'none' && groupRingMap[user.ring],
                  )}
                  style={{
                    zIndex: displayed.length - index,
                    transform: getExpandTransform(index),
                  }}
                >
                  {renderAvatar(user, index)}
                </div>
              )

              if (!showTooltip) return element

              return (
                <Tooltip key={user.name}>
                  <TooltipTrigger asChild>{element}</TooltipTrigger>
                  <TooltipContent
                    className="border-surface-border-strong bg-surface-1 text-surface-fg"
                    sideOffset={6}
                  >
                    <p className="text-ds-sm">{user.name}</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            const avatar = (
              <Avatar
                key={user.name}
                className={cn(
                  avatarSizeVariants({ size }),
                  borderClass,
                  index > 0 && overlapClass,
                  spotlightClasses,
                  user.ring && user.ring !== 'none' && groupRingMap[user.ring],
                )}
                style={{
                  zIndex: displayed.length - index,
                  transform: getExpandTransform(index),
                }}
              >
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name} />
                )}
                <AvatarFallback
                  className="font-body font-semibold"
                  colorSeed={user.name}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            )

            if (!showTooltip) return avatar

            return (
              <Tooltip key={user.name}>
                <TooltipTrigger asChild>{avatar}</TooltipTrigger>
                <TooltipContent
                  className="border-surface-border-strong bg-surface-1 text-surface-fg"
                  sideOffset={6}
                >
                  <p className="text-ds-sm">{user.name}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {overflow > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                {onOverflowClick ? (
                  <button
                    type="button"
                    onClick={onOverflowClick}
                    className={cn(
                      avatarSizeVariants({ size }),
                      borderClass,
                      overlapClass,
                      'flex cursor-pointer items-center justify-center bg-accent-2 font-body font-semibold text-accent-11',
                      'transition-[transform,background-color] duration-300 ease-out',
                      'hover:scale-105 hover:bg-accent-3',
                    )}
                    style={{
                      zIndex: 0,
                      transform: getExpandTransform(displayed.length),
                    }}
                  >
                    +{overflow}
                  </button>
                ) : (
                  <div
                    className={cn(
                      avatarSizeVariants({ size }),
                      borderClass,
                      overlapClass,
                      'flex cursor-default items-center justify-center bg-accent-2 font-body font-semibold text-accent-11',
                      'transition-[transform] duration-300 ease-out',
                    )}
                    style={{
                      zIndex: 0,
                      transform: getExpandTransform(displayed.length),
                    }}
                  >
                    +{overflow}
                  </div>
                )}
              </TooltipTrigger>
              <TooltipContent
                className="border-surface-border-strong bg-surface-1 text-surface-fg"
                sideOffset={6}
              >
                <div className="flex flex-col gap-ds-01">
                  {users.slice(max).map((user, i) => (
                    <p key={i} className="text-ds-sm">{user.name}</p>
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
