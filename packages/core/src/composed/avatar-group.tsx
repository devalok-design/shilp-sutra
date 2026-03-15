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

const avatarSizeVariants = cva(
  'shrink-0 overflow-hidden rounded-ds-full border-2',
  {
    variants: {
      size: {
        xs: 'h-ds-xs w-ds-xs text-[10px]',
        sm: 'h-ds-xs w-ds-xs text-ds-xs',
        md: 'h-ds-sm w-ds-sm text-ds-sm',
        lg: 'h-ds-md w-ds-md text-ds-md',
        xl: 'h-ds-lg w-ds-lg text-ds-lg',
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
      className,
      ...props
    },
    ref,
  ) => {
    const displayed = users.slice(0, max)
    const overflow = users.length - max

    const overlapMap = {
      xs: '-ml-ds-02',
      sm: '-ml-ds-02b',
      md: '-ml-ds-03',
      lg: '-ml-ds-04',
      xl: '-ml-ds-05',
    }
    const overlapClass = overlapMap[size ?? 'md']

    const borderClass =
      borderColor === 'surface-1' ? 'border-surface-1' : 'border-surface-2'

    // Hover expand + spotlight classes for avatars after the first
    const hoverExpandClasses =
      'transition-all duration-200 group-hover:ml-0 group-focus-within:ml-0'
    const spotlightClasses =
      'hover:z-50 hover:scale-110 hover:shadow-md group-hover:[&:not(:hover)]:opacity-80'

    return (
      <TooltipProvider>
        <div
          ref={ref}
          role="group"
          aria-label={`${users.length} team members`}
          tabIndex={0}
          className={cn('group flex items-center', className)}
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
                    index > 0 && hoverExpandClasses,
                    spotlightClasses,
                    'transition-all duration-200',
                  )}
                  style={{ zIndex: displayed.length - index }}
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
                ring={user.ring}
                className={cn(
                  avatarSizeVariants({ size }),
                  borderClass,
                  index > 0 && overlapClass,
                  index > 0 && hoverExpandClasses,
                  spotlightClasses,
                  'transition-all duration-200',
                )}
                style={{ zIndex: displayed.length - index }}
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
                      hoverExpandClasses,
                      'flex cursor-pointer items-center justify-center bg-accent-2 font-body font-semibold text-accent-11',
                      'hover:scale-105 hover:bg-accent-3 transition-all duration-150',
                    )}
                    style={{ zIndex: 0 }}
                  >
                    +{overflow}
                  </button>
                ) : (
                  <div
                    className={cn(
                      avatarSizeVariants({ size }),
                      borderClass,
                      overlapClass,
                      hoverExpandClasses,
                      'flex cursor-default items-center justify-center bg-accent-2 font-body font-semibold text-accent-11',
                    )}
                    style={{ zIndex: 0 }}
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
