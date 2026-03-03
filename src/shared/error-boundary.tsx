'use client'

import * as React from 'react'
import { IconAlertTriangle, IconBan, IconFileUnknown, IconServerOff } from '@tabler/icons-react'
import { Button } from '../ui/button'
import { cn } from '../ui/lib/utils'

declare const process: { env: { NODE_ENV?: string } } | undefined

export interface ErrorDisplayProps {
  error: unknown
  onReset?: () => void
}

function getStatusFromError(error: unknown): number | undefined {
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  ) {
    return (error as Record<string, unknown>).status as number
  }
  return undefined
}

function getMessageFromError(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.message
  }
  if (
    error &&
    typeof error === 'object' &&
    'data' in error
  ) {
    const data = (error as Record<string, unknown>).data
    if (typeof data === 'string') return data
    if (data && typeof data === 'object' && 'message' in data) {
      return String((data as Record<string, unknown>).message)
    }
  }
  if (typeof error === 'string') {
    return error
  }
  return undefined
}

function getStackFromError(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack
  }
  return undefined
}

function getErrorConfig(status?: number) {
  switch (status) {
    case 404:
      return {
        icon: IconFileUnknown,
        title: 'Page not found',
        message:
          'The page you are looking for does not exist or has been moved.',
        bgClass: 'bg-interactive-subtle',
        iconClass: 'text-interactive',
      }
    case 403:
      return {
        icon: IconBan,
        title: 'Access denied',
        message:
          'You do not have permission to view this page. Contact your administrator if you believe this is a mistake.',
        bgClass: 'bg-warning-surface',
        iconClass: 'text-warning',
      }
    case 500:
      return {
        icon: IconServerOff,
        title: 'Server error',
        message:
          'Something went wrong on our end. Please try again later or contact support if the issue persists.',
        bgClass: 'bg-error-surface',
        iconClass: 'text-error',
      }
    default:
      return {
        icon: IconAlertTriangle,
        title: 'Something went wrong',
        message:
          'An unexpected error occurred. Please try again or go back to the home page.',
        bgClass: 'bg-interactive-subtle',
        iconClass: 'text-interactive',
      }
  }
}

const ErrorDisplay = React.forwardRef<HTMLDivElement, ErrorDisplayProps>(
  function ErrorDisplay({ error, onReset }, ref) {
  const status = getStatusFromError(error)
  const message = getMessageFromError(error)
  const stack = getStackFromError(error)
  const isDev =
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'development'

  const errorConfig = getErrorConfig(status)
  const Icon = errorConfig.icon

  return (
    <div ref={ref} className="flex min-h-[60vh] items-center justify-center p-ds-05">
      <div
        className="flex w-full max-w-lg flex-col items-center gap-ds-06 rounded-ds-xl border border-border bg-layer-01 p-ds-07 text-center shadow-01"
      >
        {/* Error Icon */}
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-ds-2xl',
            errorConfig.bgClass,
          )}
        >
          <Icon
            className={cn('h-8 w-8', errorConfig.iconClass)}
          />
        </div>

        {/* Error IconInfoCircle */}
        <div className="flex flex-col gap-ds-03">
          {status && (
            <span className="text-ds-sm text-text-placeholder">
              Error {status}
            </span>
          )}
          <h2 className="text-ds-2xl font-semibold text-text-primary">
            {errorConfig.title}
          </h2>
          <p className="text-ds-base text-text-tertiary">
            {message || errorConfig.message}
          </p>
        </div>

        {/* Actions */}
        {onReset && (
          <div className="flex items-center gap-ds-04">
            <Button
              variant="secondary"
              size="md"
              onClick={onReset}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Dev stack trace */}
        {isDev && stack && (
          <div className="w-full overflow-auto rounded-ds-lg border border-border bg-layer-02 p-ds-05 text-left">
            <p className="text-ds-sm mb-ds-03 font-semibold text-text-primary">
              Stack Trace (development only)
            </p>
            <pre className="whitespace-pre-wrap text-ds-sm text-text-tertiary">
              {stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
},
)

ErrorDisplay.displayName = 'ErrorDisplay'

export { ErrorDisplay }
