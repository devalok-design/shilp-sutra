'use client'

import { IconAlertCircle } from '@tabler/icons-react'
import * as React from 'react'

import { Icon } from '../icon'
import { IconProvider } from '../icon-context'
import type { IconInput } from '../lib/icon-input'
import { normalizeIcon } from '../lib/normalize-icon'
import { cn } from '../lib/utils'

export interface SystemMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconInput
  timestamp?: string
  variant?: 'event' | 'alert'
  children: React.ReactNode
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const SystemMessage = React.forwardRef<HTMLDivElement, SystemMessageProps>(
  ({ icon, timestamp, variant = 'event', children, className, ...props }, ref) => {
    if (variant === 'alert') {
      return (
        <div
          ref={ref}
          role="alert"
          className={cn('flex justify-center', className)}
          {...props}
        >
          <div className="flex items-center gap-ds-03 rounded-surface bg-error-3 px-ds-04 py-ds-03">
            <IconProvider size="sm">{normalizeIcon(icon) ?? <Icon icon={IconAlertCircle} />}</IconProvider>
            <span className="text-body-sm text-error-11">{children}</span>
            {timestamp && (
              <span className="text-body-sm text-error-11/60">
                {formatTime(timestamp)}
              </span>
            )}
          </div>
        </div>
      )
    }

    // event variant (default)
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-ds-02 rounded-control-inner bg-surface-raised-hover/30 px-ds-02 py-ds-01 -mx-ds-02 text-body-sm text-surface-fg-subtle/60',
          className,
        )}
        {...props}
      >
        <IconProvider size="xs">{normalizeIcon(icon)}</IconProvider>
        <span className="flex-1">{children}</span>
        {timestamp && <span>{formatTime(timestamp)}</span>}
      </div>
    )
  },
)
SystemMessage.displayName = 'SystemMessage'

export { SystemMessage }
