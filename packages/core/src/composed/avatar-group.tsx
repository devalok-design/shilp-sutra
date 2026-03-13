'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { getInitials } from './lib/string-utils'

const avatarSizeVariants = cva(
  'shrink-0 overflow-hidden rounded-ds-full border-2 border-surface-1',
  {
    variants: {
      size: {
        sm: 'h-ds-xs w-ds-xs text-ds-xs',
        md: 'h-ds-sm w-ds-sm text-ds-sm',
        lg: 'h-ds-md w-ds-md text-ds-md',
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
}

export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarSizeVariants> {
  users: AvatarUser[]
  max?: number
  showTooltip?: boolean
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ users, max = 4, size, showTooltip = true, className, ...props }, ref) => {
    const displayed = users.slice(0, max)
    const overflow = users.length - max

    const overlapMap = {
      sm: '-ml-ds-02b',
      md: '-ml-ds-03',
      lg: '-ml-ds-04',
    }
    const overlapClass = overlapMap[size ?? 'md']

    return (
      <TooltipProvider>
        <div
          ref={ref}
          className={cn('flex items-center', className)}
          {...props}
        >
          {displayed.map((user, index) => {
            const initials = getInitials(user.name)

            const avatar = (
              <Avatar
                key={index}
                className={cn(
                  avatarSizeVariants({ size }),
                  index > 0 && overlapClass,
                )}
                style={{ zIndex: displayed.length - index }}
              >
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name} />
                )}
                <AvatarFallback
                  className="font-body font-semibold"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            )

            if (!showTooltip) return avatar

            return (
              <Tooltip key={index}>
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
                <div
                  className={cn(
                    avatarSizeVariants({ size }),
                    overlapClass,
                    'flex cursor-default items-center justify-center bg-accent-2 font-body font-semibold text-accent-11',
                  )}
                  style={{ zIndex: 0 }}
                >
                  +{overflow}
                </div>
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
