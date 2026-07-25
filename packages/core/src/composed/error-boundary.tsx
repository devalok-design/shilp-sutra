'use client'

import { IconAlertTriangle, IconBan, IconFileUnknown, IconServerOff } from '@tabler/icons-react'
import * as React from 'react'

import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'

declare const process: { env: { NODE_ENV?: string } } | undefined

export interface ErrorDisplayProps extends React.ComponentPropsWithoutRef<'div'> {
  error: unknown
  onReset?: () => void
  /** Custom recovery actions. When set, replaces the default "Try Again" button. */
  actions?: React.ReactNode
  /** Center in a full-viewport-height region (error page). @default true */
  fullPage?: boolean
  /** Move focus to the recovery button on mount (set by ErrorBoundary on swap). @default false */
  autoFocusReset?: boolean
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
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as Record<string, unknown>).data
    if (typeof data === 'string') return data
    if (data && typeof data === 'object' && 'message' in data) {
      return String((data as Record<string, unknown>).message)
    }
  }
  if (typeof error === 'string') return error
  return undefined
}

function getStackFromError(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined
}

function isDevEnv() {
  return typeof process !== 'undefined' && !!process.env && process.env.NODE_ENV === 'development'
}

function getErrorConfig(status?: number) {
  switch (status) {
    case 404:
      return { icon: IconFileUnknown, title: 'Page not found', message: 'The page you are looking for does not exist or has been moved.', bgClass: 'bg-accent-2', iconClass: 'text-accent-11' }
    case 403:
      return { icon: IconBan, title: 'Access denied', message: 'You do not have permission to view this page. Contact your administrator if you believe this is a mistake.', bgClass: 'bg-warning-3', iconClass: 'text-warning-11' }
    case 500:
      return { icon: IconServerOff, title: 'Server error', message: 'Something went wrong on our end. Please try again later or contact support if the issue persists.', bgClass: 'bg-error-3', iconClass: 'text-error-11' }
    default:
      return { icon: IconAlertTriangle, title: 'Something went wrong', message: 'An unexpected error occurred. Please try again or go back to the home page.', bgClass: 'bg-accent-2', iconClass: 'text-accent-11' }
  }
}

const ErrorDisplay = React.forwardRef<HTMLDivElement, ErrorDisplayProps>(
  function ErrorDisplay({ error, onReset, actions, fullPage = true, autoFocusReset = false, className, ...props }, ref) {
    const status = getStatusFromError(error)
    const rawMessage = getMessageFromError(error)
    const stack = getStackFromError(error)
    const isDev = isDevEnv()
    const errorConfig = getErrorConfig(status)
    const ErrorIcon = errorConfig.icon
    const resetRef = React.useRef<HTMLButtonElement>(null)

    // Only surface the raw error message in development — in production it can leak
    // internal detail; users see the friendly, status-mapped copy instead.
    const shownMessage = isDev ? rawMessage || errorConfig.message : errorConfig.message

    React.useEffect(() => {
      if (autoFocusReset) resetRef.current?.focus()
    }, [autoFocusReset])

    return (
      <div ref={ref} {...props} className={cn('flex items-center justify-center p-ds-05', fullPage && 'min-h-[60vh]', className)}>
        {/* role=alert → assertive live region: AT announces the error on appearance. */}
        <div
          role="alert"
          className="flex w-full max-w-lg flex-col items-center gap-ds-06 rounded-overlay-lg bg-surface-raised p-ds-07 text-center shadow-raised"
        >
          <div className={cn('flex h-ds-lg w-ds-lg items-center justify-center rounded-bubble', errorConfig.bgClass)}>
            <Icon icon={ErrorIcon} size="2xl" className={errorConfig.iconClass} />
          </div>

          <div className="flex flex-col gap-ds-03">
            {status && <span className="text-body-sm text-surface-fg-subtle">Error {status}</span>}
            <h2 className="text-heading-md font-semibold text-surface-fg">{errorConfig.title}</h2>
            <p className="text-body-lg text-surface-fg-subtle">{shownMessage}</p>
          </div>

          {(actions || onReset) && (
            <div className="flex items-center gap-ds-04">
              {actions ?? (
                <Button ref={resetRef} variant="soft" size="md" onClick={onReset}>
                  Try Again
                </Button>
              )}
            </div>
          )}

          {isDev && stack && (
            <div className="w-full overflow-auto rounded-surface border border-card bg-surface-raised p-ds-05 text-left">
              <p className="text-body-sm mb-ds-03 font-semibold text-surface-fg">Stack Trace (development only)</p>
              <pre className="whitespace-pre-wrap text-body-sm text-surface-fg-subtle">{stack}</pre>
            </div>
          )}
        </div>
      </div>
    )
  },
)
ErrorDisplay.displayName = 'ErrorDisplay'

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Called when the user clicks "Try Again" (after the boundary resets). */
  onReset?: () => void
  /** Called when an error is caught — wire your logger/Sentry here. */
  onError?: (error: unknown, info: React.ErrorInfo) => void
  /** Auto-reset when any value in this array changes (react-error-boundary parity). */
  resetKeys?: unknown[]
  /** Custom fallback — receives the caught error + a reset callback. Defaults to ErrorDisplay. */
  fallback?: (props: { error: unknown; onReset: () => void }) => React.ReactNode
}

interface ErrorBoundaryState {
  error: unknown | null
}

function keysChanged(a: unknown[] | undefined, b: unknown[] | undefined) {
  if (!a || !b) return false
  if (a.length !== b.length) return true
  return a.some((v, i) => !Object.is(v, b[i]))
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    // Auto-recover when the reset dependencies change.
    if (this.state.error !== null && keysChanged(prev.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null })
    }
  }

  private handleReset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.error !== null) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, onReset: this.handleReset })
      }
      return <ErrorDisplay error={this.state.error} onReset={this.handleReset} autoFocusReset />
    }
    return this.props.children
  }
}

export { ErrorBoundary, ErrorDisplay }
export type { ErrorBoundaryProps }
