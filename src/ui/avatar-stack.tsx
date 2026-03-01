import type React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { cn } from './lib/utils'

export interface AvatarData {
  src?: string
  alt?: string
  fallback: string
  name: string
}

interface AvatarStackProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: AvatarData[]
  maxAvatars?: number
  size?: number
  overlap?: number
  disableTooltip?: boolean
}

export function AvatarStack({
  avatars,
  maxAvatars = 4,
  size = 40,
  overlap = 8,
  disableTooltip = true,
  className,
  ...props
}: AvatarStackProps) {
  const displayAvatars = avatars.slice(0, maxAvatars)
  const remainingAvatars = avatars.slice(maxAvatars)
  const remainingCount = remainingAvatars.length

  const renderAvatar = (avatar: AvatarData, index: number) => {
    const avatarElement = (
      <Avatar
        key={index}
        className="border-2 border-[var(--color-layer-02)]"
        style={{
          width: size,
          height: size,
          marginRight: -overlap,
          zIndex: index + 1,
        }}
      >
        <AvatarImage src={avatar.src} alt={avatar.alt || avatar.name} />
        <AvatarFallback>{avatar.fallback}</AvatarFallback>
      </Avatar>
    )

    if (disableTooltip) {
      return avatarElement
    }

    return (
      <Tooltip key={index}>
        <TooltipTrigger asChild>{avatarElement}</TooltipTrigger>
        <TooltipContent>
          <p>{avatar.name}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center', className)} {...props}>
      {displayAvatars.map((avatar, index) => renderAvatar(avatar, index))}

      {remainingCount > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="text-sm font-semibold flex cursor-pointer items-center justify-center rounded-[var(--radius-full)] border-2 border-[var(--color-layer-02)] bg-[var(--color-layer-03)] text-[var(--color-interactive-hover)]"
              style={{
                width: size,
                height: size,
                zIndex: displayAvatars.length + 1,
              }}
            >
              +{remainingCount}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="max-h-[240px] w-[180px] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] p-0 shadow-[var(--shadow-02)]"
            sideOffset={5}
            align="end"
          >
            {remainingAvatars.map((avatar, index) => (
              <DropdownMenuItem
                key={index}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-[8px] px-[8px] py-[6px] hover:bg-[var(--color-field-hover)]',
                  index !== remainingAvatars.length - 1 &&
                    'border-b border-b-[var(--color-border-subtle)]',
                )}
              >
                <Avatar className="h-[40px] w-[40px]">
                  <AvatarImage
                    src={avatar.src}
                    alt={avatar.alt || avatar.name}
                  />
                  <AvatarFallback>{avatar.fallback}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {avatar.name}
                </p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
