'use client'

import * as React from 'react'
import {
  IconFile,
  IconPhoto,
  IconCheck,
  IconX,
  IconRefresh,
  IconAlertCircle,
  IconLoader2,
} from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'
import { Progress } from '../ui/progress'

/* ---------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */

export interface UploadFile {
  id: string
  name: string
  /** File size in bytes */
  size: number
  /** 0-100 progress percentage. undefined = indeterminate */
  progress?: number
  /** Upload state */
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  /** Error message if status is 'error' */
  error?: string
  /** Optional preview URL (for images) */
  previewUrl?: string
}

export interface UploadProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  files: UploadFile[]
  /** Called when user cancels/removes a file */
  onRemove?: (fileId: string) => void
  /** Called when user retries a failed upload */
  onRetry?: (fileId: string) => void
  /** Called when user dismisses all terminal files */
  onDismissAll?: () => void
  /** Show compact single-line items vs expanded items */
  variant?: 'default' | 'compact'
  /** Whether to show file size */
  showSize?: boolean
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0 || !Number.isFinite(bytes)) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'ico',
  'avif',
])

function isImageFile(file: UploadFile): boolean {
  if (file.previewUrl) return true
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTENSIONS.has(ext)
}

function getProgressColor(
  status: UploadFile['status'],
): 'default' | 'success' | 'warning' | 'error' {
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
      return undefined // indeterminate
    case 'complete':
      return 100
    case 'error':
      return file.progress ?? 0
  }
}

/* ---------------------------------------------------------------------------
 * Sub-components
 * ------------------------------------------------------------------------ */

function FileIcon({
  file,
  className,
}: {
  file: UploadFile
  className?: string
}) {
  if (file.previewUrl) {
    return (
      <div
        className={cn(
          'h-8 w-8 shrink-0 overflow-hidden rounded-ds-md',
          className,
        )}
      >
        <img
          src={file.previewUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  if (file.status === 'complete') {
    return (
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-ds-md bg-success-surface animate-check-pop',
          className,
        )}
      >
        <IconCheck size={16} className="text-text-success" />
      </div>
    )
  }

  if (file.status === 'error') {
    return (
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-ds-md bg-error-surface animate-shake',
          className,
        )}
      >
        <IconAlertCircle size={16} className="text-text-error" />
      </div>
    )
  }

  if (file.status === 'processing') {
    return (
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-ds-md bg-layer-02',
          className,
        )}
      >
        <IconLoader2
          size={16}
          className="animate-spin text-text-secondary"
        />
      </div>
    )
  }

  const Icon = isImageFile(file) ? IconPhoto : IconFile

  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-ds-md bg-layer-02',
        file.status === 'pending' && 'opacity-50',
        className,
      )}
    >
      <Icon size={16} className="text-text-secondary" />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Default variant — two-line layout
 * ------------------------------------------------------------------------ */

function DefaultFileRow({
  file,
  index,
  showSize,
  onRemove,
  onRetry,
}: {
  file: UploadFile
  index: number
  showSize?: boolean
  onRemove?: (fileId: string) => void
  onRetry?: (fileId: string) => void
}) {
  const progressValue = getProgressValue(file)
  const progressColor = getProgressColor(file.status)

  return (
    <div
      className="animate-slide-up px-ds-04 py-ds-03"
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Top line: icon, name, size, action */}
      <div className="flex items-center gap-ds-03">
        <FileIcon file={file} />

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-ds-sm font-medium text-text-primary',
              file.status === 'pending' && 'text-text-disabled',
            )}
          >
            {file.name}
          </p>
          <div className="flex items-center gap-ds-02">
            {showSize && (
              <span className="text-ds-xs text-text-placeholder">
                {formatFileSize(file.size)}
              </span>
            )}
            {file.status === 'processing' && (
              <span className="text-ds-xs text-text-secondary">
                Processing...
              </span>
            )}
            {file.status === 'error' && file.error && (
              <span className="text-ds-xs text-text-error">
                {file.error}
              </span>
            )}
          </div>
        </div>

        {file.status === 'uploading' && file.progress !== undefined && (
          <span className="shrink-0 text-ds-xs tabular-nums text-text-secondary">
            {file.progress}%
          </span>
        )}

        <div className="flex shrink-0 items-center gap-ds-01">
          {file.status === 'error' && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(file.id)}
              className="flex h-6 w-6 items-center justify-center rounded-ds-md text-text-secondary transition-colors duration-fast-01 hover:bg-layer-03 hover:text-text-primary"
              aria-label={`Retry upload for ${file.name}`}
            >
              <IconRefresh size={14} />
            </button>
          )}
          {(file.status === 'error' ||
            file.status === 'complete' ||
            file.status === 'pending') &&
            onRemove && (
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="flex h-6 w-6 items-center justify-center rounded-ds-md text-text-secondary transition-colors duration-fast-01 hover:bg-layer-03 hover:text-text-primary"
                aria-label={`Remove ${file.name}`}
              >
                <IconX size={14} />
              </button>
            )}
          {file.status === 'uploading' && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="flex h-6 w-6 items-center justify-center rounded-ds-md text-text-secondary transition-colors duration-fast-01 hover:bg-layer-03 hover:text-text-primary"
              aria-label={`Cancel upload for ${file.name}`}
            >
              <IconX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom line: full-width progress bar */}
      <div className="mt-ds-02 pl-11">
        <Progress
          value={progressValue}
          color={progressColor}
          size="sm"
          aria-label={`Upload progress for ${file.name}`}
        />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Compact variant — single-line layout
 * ------------------------------------------------------------------------ */

function CompactFileRow({
  file,
  index,
  onRemove,
  onRetry,
}: {
  file: UploadFile
  index: number
  onRemove?: (fileId: string) => void
  onRetry?: (fileId: string) => void
}) {
  const progressValue = getProgressValue(file)
  const progressColor = getProgressColor(file.status)

  return (
    <div
      className="flex items-center gap-ds-03 px-ds-03 py-ds-02 animate-slide-up"
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: 'both',
      }}
    >
      <FileIcon file={file} className="h-6 w-6" />

      <p
        className={cn(
          'min-w-0 shrink truncate text-ds-xs font-medium text-text-primary',
          file.status === 'pending' && 'text-text-disabled',
        )}
      >
        {file.name}
      </p>

      <div className="w-20 shrink-0">
        <Progress
          value={progressValue}
          color={progressColor}
          size="sm"
          aria-label={`Upload progress for ${file.name}`}
        />
      </div>

      {file.status === 'uploading' && file.progress !== undefined && (
        <span className="shrink-0 text-ds-xs tabular-nums text-text-secondary">
          {file.progress}%
        </span>
      )}
      {file.status === 'processing' && (
        <span className="shrink-0 text-ds-xs text-text-secondary">
          Processing...
        </span>
      )}
      {file.status === 'error' && (
        <span className="shrink-0 text-ds-xs text-text-error">Error</span>
      )}

      <div className="flex shrink-0 items-center gap-ds-01">
        {file.status === 'error' && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(file.id)}
            className="flex h-5 w-5 items-center justify-center rounded-ds-md text-text-secondary transition-colors duration-fast-01 hover:bg-layer-03 hover:text-text-primary"
            aria-label={`Retry upload for ${file.name}`}
          >
            <IconRefresh size={12} />
          </button>
        )}
        {(file.status === 'error' ||
          file.status === 'complete' ||
          file.status === 'pending') &&
          onRemove && (
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="flex h-5 w-5 items-center justify-center rounded-ds-md text-text-secondary transition-colors duration-fast-01 hover:bg-layer-03 hover:text-text-primary"
              aria-label={`Remove ${file.name}`}
            >
              <IconX size={12} />
            </button>
          )}
        {file.status === 'uploading' && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="flex h-5 w-5 items-center justify-center rounded-ds-md text-text-secondary transition-colors duration-fast-01 hover:bg-layer-03 hover:text-text-primary"
            aria-label={`Cancel upload for ${file.name}`}
          >
            <IconX size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------ */

const UploadProgress = React.forwardRef<HTMLDivElement, UploadProgressProps>(
  (
    {
      files,
      onRemove,
      onRetry,
      onDismissAll,
      variant = 'default',
      showSize = true,
      className,
      ...props
    },
    ref,
  ) => {
    if (files.length === 0) return null

    const completedCount = files.filter(
      (f) => f.status === 'complete',
    ).length
    const allTerminal = files.every(
      (f) => f.status === 'complete' || f.status === 'error',
    )

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-ds-xl border border-border-subtle bg-layer-01 shadow-01 overflow-hidden animate-fade-in',
          className,
        )}
        role="region"
        aria-label="File uploads"
        {...props}
      >
        {/* Summary header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-ds-04 py-ds-03">
          <span className="text-ds-sm text-text-secondary">
            {completedCount} of {files.length} uploaded
          </span>
          {allTerminal && onDismissAll && (
            <button
              type="button"
              onClick={onDismissAll}
              className="text-ds-sm text-interactive hover:text-interactive-hover transition-colors"
            >
              Dismiss all
            </button>
          )}
        </div>

        {/* Scrollable file list */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border-subtle">
          {files.map((file, index) =>
            variant === 'compact' ? (
              <CompactFileRow
                key={file.id}
                file={file}
                index={index}
                onRemove={onRemove}
                onRetry={onRetry}
              />
            ) : (
              <DefaultFileRow
                key={file.id}
                file={file}
                index={index}
                showSize={showSize}
                onRemove={onRemove}
                onRetry={onRetry}
              />
            ),
          )}
        </div>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="false">
          {files.map((f) =>
            f.status === 'complete' ? (
              <span key={`sr-${f.id}`}>{f.name} upload complete.</span>
            ) : f.status === 'error' ? (
              <span key={`sr-${f.id}`}>
                {f.name} upload failed
                {f.error ? `: ${f.error}` : ''}.
              </span>
            ) : null,
          )}
        </div>
      </div>
    )
  },
)
UploadProgress.displayName = 'UploadProgress'

export { UploadProgress, formatFileSize }
