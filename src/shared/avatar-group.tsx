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
  'shrink-0 overflow-hidden rounded-[var(--radius-full)] border-2 border-[var(--color-layer-01)]',
  {
    variants: {
      size: {
        sm: 'h-6 w-6 text-[9px]',
        md: 'h-8 w-8 B3-Reg',
        lg: 'h-10 w-10 B2-Reg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

interface AvatarUser {
  name: string
  image?: string | null
}

interface AvatarGroupProps
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
      sm: '-ml-1.5',
      md: '-ml-2',
      lg: '-ml-2.5',
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
                  className="bg-[var(--color-field)] font-body font-semibold text-[var(--color-text-on-color)]"
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
                  className="border-[var(--color-border-default)] bg-[var(--color-layer-01)] text-[var(--color-text-primary)]"
                  sideOffset={6}
                >
                  <p className="B3-Reg">{user.name}</p>
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
                    'flex cursor-default items-center justify-center bg-[var(--color-layer-03)] font-body font-semibold text-[var(--color-text-on-color)]',
                  )}
                  style={{ zIndex: 0 }}
                >
                  +{overflow}
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="border-[var(--color-border-default)] bg-[var(--color-layer-01)] text-[var(--color-text-primary)]"
                sideOffset={6}
              >
                <div className="flex flex-col gap-0.5">
                  {users.slice(max).map((user, i) => (
                    <p key={i} className="B3-Reg">{user.name}</p>
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
export type { AvatarGroupProps, AvatarUser }
