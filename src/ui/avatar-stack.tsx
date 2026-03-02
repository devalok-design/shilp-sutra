import * as React from 'react'
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

/**
 * Color palette for avatar fallbacks, using design system tag tokens.
 * Each avatar without an image gets a deterministic color based on its name.
 */
const AVATAR_PALETTE = [
  { bg: 'var(--color-tag-blue-bg)', text: 'var(--color-tag-blue-text)' },
  { bg: 'var(--color-tag-green-bg)', text: 'var(--color-tag-green-text)' },
  { bg: 'var(--color-tag-magenta-bg)', text: 'var(--color-tag-magenta-text)' },
  { bg: 'var(--color-tag-purple-bg)', text: 'var(--color-tag-purple-text)' },
  { bg: 'var(--color-tag-red-bg)', text: 'var(--color-tag-red-text)' },
  { bg: 'var(--color-tag-yellow-bg)', text: 'var(--color-tag-yellow-text)' },
] as const

/** Simple string hash to pick a consistent palette color per name */
function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getAvatarColor(name: string) {
  return AVATAR_PALETTE[hashName(name) % AVATAR_PALETTE.length]
}

const AvatarStack = React.forwardRef<HTMLDivElement, AvatarStackProps>(
  (
    {
      avatars,
      maxAvatars = 4,
      size = 40,
      overlap = 8,
      disableTooltip = true,
      className,
      ...props
    },
    ref,
  ) => {
    const displayAvatars = avatars.slice(0, maxAvatars)
    const remainingAvatars = avatars.slice(maxAvatars)
    const remainingCount = remainingAvatars.length

    const renderAvatar = (avatar: AvatarData, index: number) => {
      const color = getAvatarColor(avatar.name)
      const avatarElement = (
        <Avatar
          key={avatar.name}
          className="border-2 border-layer-02"
          style={{
            width: size,
            height: size,
            marginRight: -overlap,
            zIndex: index + 1,
          }}
        >
          <AvatarImage src={avatar.src} alt={avatar.alt || avatar.name} />
          <AvatarFallback
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {avatar.fallback}
          </AvatarFallback>
        </Avatar>
      )

      if (disableTooltip) {
        return avatarElement
      }

      return (
        <Tooltip key={avatar.name}>
          <TooltipTrigger asChild>{avatarElement}</TooltipTrigger>
          <TooltipContent>
            <p>{avatar.name}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center', className)} {...props}>
        {displayAvatars.map((avatar, index) => renderAvatar(avatar, index))}

        {remainingCount > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className="text-ds-md font-semibold flex cursor-pointer items-center justify-center rounded-ds-full border-2 border-layer-02 bg-layer-03 text-interactive-hover"
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
              className="max-h-[240px] w-[180px] overflow-y-auto rounded-ds-lg border border-border-subtle bg-layer-01 p-0 shadow-02"
              sideOffset={5}
              align="end"
            >
              {remainingAvatars.map((avatar) => {
                const color = getAvatarColor(avatar.name)
                return (
                  <DropdownMenuItem
                    key={avatar.name}
                    className="flex w-full cursor-pointer items-center gap-[8px] px-[8px] py-[6px] hover:bg-field-hover"
                  >
                    <Avatar className="h-[40px] w-[40px]">
                      <AvatarImage
                        src={avatar.src}
                        alt={avatar.alt || avatar.name}
                      />
                      <AvatarFallback
                        style={{ backgroundColor: color.bg, color: color.text }}
                      >
                        {avatar.fallback}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-ds-md text-text-secondary">
                      {avatar.name}
                    </p>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  },
)
AvatarStack.displayName = 'AvatarStack'

export { AvatarStack }
