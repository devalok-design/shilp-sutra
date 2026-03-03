'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'

export interface ClientPortalHeaderProps extends React.HTMLAttributes<HTMLElement> {
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
          'flex h-16 items-center justify-between border-b border-border-subtle bg-layer-01 px-ds-06',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-ds-04">
          {orgLogo ? (
            <img
              src={orgLogo}
              alt={orgName}
              className="h-ds-sm w-ds-sm rounded-ds-md object-cover"
            />
          ) : (
            <div className="flex h-ds-sm w-ds-sm items-center justify-center rounded-ds-md bg-interactive text-ds-sm font-semibold text-text-on-color">
              {initials}
            </div>
          )}
          <span className="font-display text-ds-base font-semibold text-text-primary">
            {orgName}
          </span>
        </div>
        <div className="flex items-center gap-ds-04">
          {children}
          <div className="flex items-center gap-ds-03">
            <Avatar className="h-ds-sm w-ds-sm">
              {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
              <AvatarFallback className="bg-interactive-subtle text-ds-sm font-medium text-interactive">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-ds-md font-medium text-text-primary sm:inline">
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
