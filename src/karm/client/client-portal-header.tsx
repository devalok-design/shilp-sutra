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
          'flex h-16 items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] px-6',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {orgLogo ? (
            <img
              src={orgLogo}
              alt={orgName}
              className="h-8 w-8 rounded-[var(--radius-md)] object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive)] text-xs font-semibold text-[var(--color-text-on-color)]">
              {initials}
            </div>
          )}
          <span className="font-display text-base font-semibold text-[var(--color-text-primary)]">
            {orgName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {children}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
              <AvatarFallback className="bg-[var(--color-interactive-subtle)] text-xs font-medium text-[var(--color-interactive)]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-[var(--color-text-primary)] sm:inline">
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
