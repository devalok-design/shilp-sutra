'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'

interface ClientPortalHeaderProps extends React.HTMLAttributes<HTMLElement> {
  orgName: string
  orgLogo?: string | null
  userName: string
  userAvatar?: string | null
}

const ClientPortalHeader = React.forwardRef<
  HTMLElement,
  ClientPortalHeaderProps
>(
  (
    { className, orgName, orgLogo, userName, userAvatar, children, ...props },
    ref,
  ) => {
    const initials = orgName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    const userInitials = userName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return (
      <header
        ref={ref}
        className={cn(
          'flex h-16 items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] px-ds-06',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-ds-04">
          {orgLogo ? (
            <img
              src={orgLogo}
              alt={orgName}
              className="h-8 w-8 rounded-[var(--radius-md)] object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive)] B3-Reg font-semibold text-[var(--color-text-on-color)]">
              {initials}
            </div>
          )}
          <span className="font-display B1-Reg font-semibold text-[var(--color-text-primary)]">
            {orgName}
          </span>
        </div>
        <div className="flex items-center gap-ds-04">
          {children}
          <div className="flex items-center gap-ds-03">
            <Avatar className="h-8 w-8">
              {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
              <AvatarFallback className="bg-[var(--color-interactive-subtle)] B3-Reg font-medium text-[var(--color-interactive)]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden B2-Reg font-medium text-[var(--color-text-primary)] sm:inline">
              {userName}
            </span>
          </div>
        </div>
      </header>
    )
  },
)
ClientPortalHeader.displayName = 'ClientPortalHeader'

export { ClientPortalHeader }
