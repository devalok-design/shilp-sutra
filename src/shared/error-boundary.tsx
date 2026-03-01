'use client'

import * as React from 'react'
import { AlertTriangle, Ban, FileQuestion, ServerCrash } from 'lucide-react'
import { Button } from '../ui/button'

declare const process: { env: { NODE_ENV?: string } } | undefined

interface ErrorDisplayProps {
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
        icon: FileQuestion,
        title: 'Page not found',
        message:
          'The page you are looking for does not exist or has been moved.',
        bgColor: 'var(--color-interactive-subtle)',
        iconColor: 'var(--color-interactive)',
      }
    case 403:
      return {
        icon: Ban,
        title: 'Access denied',
        message:
          'You do not have permission to view this page. Contact your administrator if you believe this is a mistake.',
        bgColor: 'var(--color-warning-surface)',
        iconColor: 'var(--color-warning)',
      }
    case 500:
      return {
        icon: ServerCrash,
        title: 'Server error',
        message:
          'Something went wrong on our end. Please try again later or contact support if the issue persists.',
        bgColor: 'var(--color-danger-surface)',
        iconColor: 'var(--color-danger)',
      }
    default:
      return {
        icon: AlertTriangle,
        title: 'Something went wrong',
        message:
          'An unexpected error occurred. Please try again or go back to the home page.',
        bgColor: 'var(--color-interactive-subtle)',
        iconColor: 'var(--color-interactive)',
      }
  }
}

function ErrorDisplay({ error, onReset }: ErrorDisplayProps) {
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
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div
        className="flex w-full max-w-lg flex-col items-center gap-6 rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-8 text-center shadow-sm"
      >
        {/* Error Icon */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-2xl)]"
          style={{ backgroundColor: errorConfig.bgColor }}
        >
          <Icon
            className="h-8 w-8"
            style={{ color: errorConfig.iconColor }}
          />
        </div>

        {/* Error Info */}
        <div className="flex flex-col gap-2">
          {status && (
            <span className="B3-Reg text-[var(--color-text-placeholder)]">
              Error {status}
            </span>
          )}
          <h2 className="T5-Reg font-semibold text-[var(--color-text-primary)]">
            {errorConfig.title}
          </h2>
          <p className="B1-Reg text-[var(--color-text-tertiary)]">
            {message || errorConfig.message}
          </p>
        </div>

        {/* Actions */}
        {onReset && (
          <div className="flex items-center gap-3">
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
          <div className="w-full overflow-auto rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-layer-02)] p-4 text-left">
            <p className="B3-Reg mb-2 font-semibold text-[var(--color-text-primary)]">
              Stack Trace (development only)
            </p>
            <pre className="whitespace-pre-wrap text-xs text-[var(--color-text-tertiary)]">
              {stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

ErrorDisplay.displayName = 'ErrorDisplay'

export { ErrorDisplay }
export type { ErrorDisplayProps }
