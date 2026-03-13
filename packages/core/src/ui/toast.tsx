'use client'

import * as React from 'react'
import { toast as sonnerToast, type ExternalToast } from 'sonner'
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconCircleX,
  IconInfoCircle,
  IconUpload,
  IconFile,
  IconPhoto,
  IconCheck,
  IconX,
  IconRefresh,
  IconAlertCircle,
} from '@tabler/icons-react'
import { cn } from './lib/utils'
import { Spinner } from './spinner'
import { Progress } from './progress'
import type {
  ToastOptions,
  ToastType,
  ToastActionOptions,
  ToastUndoOptions,
  ToastUploadOptions,
  UploadFile,
} from './toast-types'

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------ */

const DEFAULT_DURATION = 5000
const UNDO_DURATION = 8000
const UPLOAD_COMPLETE_DELAY = 3000

/* ---------------------------------------------------------------------------
 * Accent bar & icon config per toast type
 * ------------------------------------------------------------------------ */

const TOAST_TYPE_CONFIG: Record<
  ToastType,
  {
    accentClass: string
    iconClass: string
    icon: React.ComponentType<{ className?: string }> | null
    timerBarClass: string
  }
> = {
  message: {
    accentClass: '',
    iconClass: '',
    icon: null,
    timerBarClass: 'bg-border',
  },
  success: {
    accentClass: 'bg-success-border',
    iconClass: 'text-success-text',
    icon: IconCircleCheck,
    timerBarClass: 'bg-success-border',
  },
  error: {
    accentClass: 'bg-error-border',
    iconClass: 'text-error-text',
    icon: IconCircleX,
    timerBarClass: 'bg-error-border',
  },
  warning: {
    accentClass: 'bg-warning-border',
    iconClass: 'text-warning-text',
    icon: IconAlertTriangle,
    timerBarClass: 'bg-warning-border',
  },
  info: {
    accentClass: 'bg-info-border',
    iconClass: 'text-info-text',
    icon: IconInfoCircle,
    timerBarClass: 'bg-info-border',
  },
  loading: {
    accentClass: 'bg-interactive',
    iconClass: 'text-interactive',
    icon: null,
    timerBarClass: 'bg-interactive',
  },
}

/* ---------------------------------------------------------------------------
 * Timer bar — shows auto-dismiss countdown
 * ------------------------------------------------------------------------ */

function TimerBar({
  duration,
  type,
  paused,
}: {
  duration: number
  type: ToastType
  paused: boolean
}) {
  const config = TOAST_TYPE_CONFIG[type]
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
      <div
        className={cn(
          'h-full w-full origin-left opacity-30',
          config.timerBarClass,
          'motion-safe:animate-timer-bar',
        )}
        style={{
          animationDuration: `${duration}ms`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Base toast UI — used by all typed toasts
 * ------------------------------------------------------------------------ */

function ToastContent({
  type,
  title,
  description,
  action,
  cancel,
  duration = DEFAULT_DURATION,
  showTimerBar = true,
  selfDismissId,
}: {
  type: ToastType
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionOptions
  cancel?: ToastActionOptions
  duration?: number
  showTimerBar?: boolean
  /** When set, this component manages its own dismiss timer (hover-aware). */
  selfDismissId?: string | number
}) {
  const [hovered, setHovered] = React.useState(false)
  const config = TOAST_TYPE_CONFIG[type]
  const Icon = config.icon

  // Self-managed dismiss timer that pauses on hover
  const remainingRef = React.useRef(duration)
  const startTimeRef = React.useRef(0)

  React.useEffect(() => {
    if (selfDismissId == null || duration === Infinity) return
    if (hovered) {
      // Pause: save remaining time
      const elapsed = Date.now() - startTimeRef.current
      remainingRef.current = Math.max(0, remainingRef.current - elapsed)
      return
    }
    // Start/resume timer
    startTimeRef.current = Date.now()
    const timer = setTimeout(() => {
      sonnerToast.dismiss(selfDismissId)
    }, remainingRef.current)
    return () => clearTimeout(timer)
  }, [selfDismissId, duration, hovered])

  return (
    <div
      role="status"
      aria-live="polite"
      className="group relative flex w-full overflow-hidden rounded-ds-md border border-border bg-layer-01 shadow-02"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left accent bar */}
      {config.accentClass && (
        <div
          className={cn('w-1 shrink-0 rounded-l-ds-md', config.accentClass)}
        />
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 items-start gap-ds-03 p-ds-04">
        {/* Status icon */}
        {type === 'loading' ? (
          <Spinner size="sm" className="mt-0.5 h-4 w-4 shrink-0" />
        ) : Icon ? (
          <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconClass)} />
        ) : null}

        {/* Text */}
        <div className="min-w-0 flex-1">
          {title && (
            <p className="text-ds-md font-semibold text-text-primary">
              {title}
            </p>
          )}
          {description && (
            <p
              className={cn(
                'text-ds-sm text-text-secondary',
                title && 'mt-0.5',
              )}
            >
              {description}
            </p>
          )}

          {/* Action / cancel buttons */}
          {(action || cancel) && (
            <div className="mt-ds-03 flex items-center gap-ds-03">
              {action && (
                <button
                  type="button"
                  onClick={action.onClick}
                  className="text-ds-sm font-medium text-interactive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:rounded-ds-sm"
                >
                  {action.label}
                </button>
              )}
              {cancel && (
                <button
                  type="button"
                  onClick={cancel.onClick}
                  className="text-ds-sm text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:rounded-ds-sm"
                >
                  {cancel.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timer bar */}
      {showTimerBar && type !== 'loading' && (
        <TimerBar duration={duration} type={type} paused={hovered} />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Upload toast UI
 * ------------------------------------------------------------------------ */

const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif',
])

function isImageFile(file: UploadFile): boolean {
  if (file.previewUrl) return true
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTENSIONS.has(ext)
}

function getProgressColor(
  status: UploadFile['status'],
): 'default' | 'success' | 'error' {
  switch (status) {
    case 'complete':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'default'
  }
}

function getProgressValue(file: UploadFile): number | undefined {
  switch (file.status) {
    case 'pending':
      return 0
    case 'uploading':
      return file.progress ?? 0
    case 'processing':
      return undefined
    case 'complete':
      return 100
    case 'error':
      return file.progress ?? 0
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0 || !Number.isFinite(bytes)) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function UploadFileRow({
  file,
  onRetry,
  onRemove,
}: {
  file: UploadFile
  onRetry?: (fileId: string) => void
  onRemove?: (fileId: string) => void
}) {
  const isTerminal = file.status === 'complete' || file.status === 'error'
  const isUploading =
    file.status === 'uploading' || file.status === 'processing'

  return (
    <div className="flex items-center gap-ds-02 py-1">
      {/* File icon */}
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {file.status === 'complete' ? (
          <IconCheck className="h-3.5 w-3.5 text-success-text" />
        ) : file.status === 'error' ? (
          <IconAlertCircle className="h-3.5 w-3.5 text-error-text" />
        ) : file.status === 'processing' ? (
          <Spinner size="sm" className="h-3.5 w-3.5" />
        ) : isImageFile(file) ? (
          <IconPhoto className="h-3.5 w-3.5 text-text-secondary" />
        ) : (
          <IconFile className="h-3.5 w-3.5 text-text-secondary" />
        )}
      </div>

      {/* Filename */}
      <span className="min-w-0 flex-1 truncate text-ds-xs text-text-primary">
        {file.name}
      </span>

      {/* Progress bar or status */}
      {isUploading ? (
        <div className="flex w-16 items-center gap-1">
          <Progress
            size="sm"
            color={getProgressColor(file.status)}
            value={getProgressValue(file)}
            className="flex-1"
          />
          {file.progress !== undefined && (
            <span className="shrink-0 text-[10px] tabular-nums text-text-secondary">
              {file.progress}%
            </span>
          )}
        </div>
      ) : file.status === 'complete' ? (
        <span className="text-[10px] text-success-text">Done</span>
      ) : file.status === 'error' ? (
        <span className="max-w-[60px] truncate text-[10px] text-error-text">
          {file.error || 'Failed'}
        </span>
      ) : (
        <span className="text-[10px] text-text-secondary">
          {formatFileSize(file.size)}
        </span>
      )}

      {/* Actions */}
      {file.status === 'error' && onRetry && (
        <button
          type="button"
          onClick={() => onRetry(file.id)}
          className="flex h-4 w-4 items-center justify-center rounded-ds-sm text-text-secondary hover:text-text-primary"
          aria-label={`Retry ${file.name}`}
        >
          <IconRefresh className="h-3 w-3" />
        </button>
      )}
      {!isTerminal && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(file.id)}
          className="flex h-4 w-4 items-center justify-center rounded-ds-sm text-text-secondary hover:text-text-primary"
          aria-label={`Cancel ${file.name}`}
        >
          <IconX className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function UploadToastContent({
  files,
  onRetry,
  onRemove,
  selfDismissId,
}: {
  files: UploadFile[]
  onRetry?: (fileId: string) => void
  onRemove?: (fileId: string) => void
  selfDismissId?: string | number
}) {
  const [hovered, setHovered] = React.useState(false)
  const completeCount = files.filter((f) => f.status === 'complete').length
  const errorCount = files.filter((f) => f.status === 'error').length
  const allTerminal = files.every(
    (f) => f.status === 'complete' || f.status === 'error',
  )

  // Self-managed dismiss timer that pauses on hover
  const remainingRef = React.useRef(UPLOAD_COMPLETE_DELAY)
  const startTimeRef = React.useRef(0)

  React.useEffect(() => {
    if (selfDismissId == null || !allTerminal) return
    if (hovered) {
      const elapsed = Date.now() - startTimeRef.current
      remainingRef.current = Math.max(0, remainingRef.current - elapsed)
      return
    }
    startTimeRef.current = Date.now()
    const timer = setTimeout(() => {
      sonnerToast.dismiss(selfDismissId)
    }, remainingRef.current)
    return () => clearTimeout(timer)
  }, [selfDismissId, allTerminal, hovered])

  const accentClass = allTerminal
    ? errorCount > 0
      ? 'bg-error-border'
      : 'bg-success-border'
    : 'bg-interactive'

  const timerBarType: ToastType = allTerminal
    ? errorCount > 0
      ? 'error'
      : 'success'
    : 'loading'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="File uploads"
      className="group relative flex w-full overflow-hidden rounded-ds-md border border-border bg-layer-01 shadow-02"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left accent bar */}
      <div className={cn('w-1 shrink-0 rounded-l-ds-md', accentClass)} />

      {/* Content */}
      <div className="min-w-0 flex-1 p-ds-04">
        {/* Header */}
        <div className="flex items-center gap-ds-02">
          <IconUpload className="h-4 w-4 shrink-0 text-text-secondary" />
          <p className="text-ds-md font-semibold text-text-primary">
            {allTerminal
              ? errorCount > 0
                ? `${completeCount} of ${files.length} uploaded`
                : `${files.length} file${files.length > 1 ? 's' : ''} uploaded`
              : `Uploading ${files.length} file${files.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {!allTerminal && (
          <p className="mt-0.5 text-ds-xs text-text-secondary">
            {completeCount} of {files.length} complete
            {errorCount > 0 && ` · ${errorCount} failed`}
          </p>
        )}

        {/* File list */}
        <div className="mt-ds-02 max-h-[140px] overflow-y-auto">
          {files.map((file) => (
            <UploadFileRow
              key={file.id}
              file={file}
              onRetry={onRetry}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* Screen reader announcement */}
        <div className="sr-only" aria-live="polite">
          {completeCount} of {files.length} files uploaded
          {errorCount > 0 && `, ${errorCount} failed`}
        </div>
      </div>

      {/* Timer bar — only after all terminal */}
      {allTerminal && (
        <TimerBar
          duration={UPLOAD_COMPLETE_DELAY}
          type={timerBarType}
          paused={false}
        />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Toast API — wraps Sonner with our styled UI
 * ------------------------------------------------------------------------ */

function createSonnerOptions(
  options?: ToastOptions,
  duration?: number,
): ExternalToast {
  return {
    id: options?.id,
    duration: options?.duration ?? duration ?? DEFAULT_DURATION,
    unstyled: true,
    classNames: { toast: 'w-full' },
  }
}

function createTypedToast(
  type: ToastType,
  message: string | React.ReactNode,
  options?: ToastOptions,
) {
  const duration = options?.duration ?? DEFAULT_DURATION
  return sonnerToast.custom(
    () => (
      <ToastContent
        type={type}
        title={message}
        description={options?.description}
        action={options?.action}
        cancel={options?.cancel}
        duration={duration}
      />
    ),
    createSonnerOptions(options, duration),
  )
}

/**
 * Toast API — imperative toast notifications with Sonner rendering engine.
 *
 * Mount `<Toaster />` once at your root layout. Then call `toast()` from anywhere.
 *
 * @example
 * toast('Something happened')
 * toast.success('Saved!')
 * toast.error('Failed to save')
 * toast.promise(saveFn(), { loading: 'Saving...', success: 'Done!', error: 'Failed' })
 * toast.undo('Deleted', { onUndo: () => restore() })
 * toast.upload({ files, onRetry, onRemove })
 */
function toast(message: string | React.ReactNode, options?: ToastOptions) {
  return createTypedToast('message', message, options)
}

toast.message = (
  message: string | React.ReactNode,
  options?: ToastOptions,
) => {
  return createTypedToast('message', message, options)
}

toast.success = (
  message: string | React.ReactNode,
  options?: ToastOptions,
) => {
  return createTypedToast('success', message, options)
}

toast.error = (
  message: string | React.ReactNode,
  options?: ToastOptions,
) => {
  return createTypedToast('error', message, options)
}

toast.warning = (
  message: string | React.ReactNode,
  options?: ToastOptions,
) => {
  return createTypedToast('warning', message, options)
}

toast.info = (
  message: string | React.ReactNode,
  options?: ToastOptions,
) => {
  return createTypedToast('info', message, options)
}

toast.loading = (
  message: string | React.ReactNode,
  options?: ToastOptions,
) => {
  return createTypedToast('loading', message, {
    ...options,
    duration: options?.duration ?? Infinity,
  })
}

toast.promise = <T,>(
  promise: Promise<T>,
  options: {
    loading: string | React.ReactNode
    success: string | React.ReactNode | ((data: T) => string | React.ReactNode)
    error:
      | string
      | React.ReactNode
      | ((error: unknown) => string | React.ReactNode)
  },
) => {
  const id = sonnerToast.custom(
    () => (
      <ToastContent type="loading" title={options.loading} showTimerBar={false} />
    ),
    { duration: Infinity, unstyled: true, classNames: { toast: 'w-full' } },
  )

  const replaceWith = (type: ToastType, message: React.ReactNode) => {
    // Sonner doesn't reset its auto-dismiss timer when updating a custom toast
    // in-place from duration: Infinity, so ToastContent manages its own
    // hover-aware dismiss timer via selfDismissId.
    sonnerToast.custom(
      () => (
        <ToastContent
          type={type}
          title={message}
          duration={DEFAULT_DURATION}
          selfDismissId={id}
        />
      ),
      { id, duration: Infinity, unstyled: true, classNames: { toast: 'w-full' } },
    )
  }

  promise
    .then((data) => {
      const message =
        typeof options.success === 'function'
          ? options.success(data)
          : options.success
      replaceWith('success', message)
    })
    .catch((error) => {
      const message =
        typeof options.error === 'function'
          ? options.error(error)
          : options.error
      replaceWith('error', message)
    })

  return id
}

toast.undo = (message: string | React.ReactNode, options: ToastUndoOptions) => {
  const duration = options.duration ?? UNDO_DURATION
  return sonnerToast.custom(
    () => (
      <ToastContent
        type="message"
        title={message}
        description={options.description}
        action={{ label: 'Undo', onClick: options.onUndo }}
        duration={duration}
      />
    ),
    { duration, unstyled: true, classNames: { toast: 'w-full' } },
  )
}

toast.upload = (options: ToastUploadOptions) => {
  // Pre-determine the id so we can pass it to UploadToastContent for self-dismiss.
  const toastId = options.id ?? String(Date.now())

  sonnerToast.custom(
    () => (
      <UploadToastContent
        files={options.files}
        onRetry={options.onRetry}
        onRemove={options.onRemove}
        selfDismissId={toastId}
      />
    ),
    {
      id: toastId,
      duration: Infinity,
      unstyled: true,
      classNames: { toast: 'w-full' },
    },
  )

  return toastId
}

toast.custom = (
  render: (id: string | number) => React.ReactElement,
  options?: ExternalToast,
) => {
  return sonnerToast.custom(render, {
    ...options,
    unstyled: true,
    classNames: { toast: 'w-full', ...(options?.classNames as Record<string, string>) },
  })
}

toast.dismiss = (id?: string | number) => {
  if (id !== undefined) {
    sonnerToast.dismiss(id)
  } else {
    sonnerToast.dismiss()
  }
}

/* ---------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------ */

export type ToastProps = ToastOptions

export {
  toast,
  formatFileSize,
  ToastContent,
  UploadToastContent,
  UploadFileRow,
  TimerBar,
}
export type {
  ToastOptions,
  ToastType,
  ToastActionOptions,
  ToastUndoOptions,
  ToastUploadOptions,
  UploadFile,
} from './toast-types'
