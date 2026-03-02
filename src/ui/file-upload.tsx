'use client'

import * as React from 'react'
import { IconUpload, IconPaperclip, IconLoader2 } from '@tabler/icons-react'
import { cn } from './lib/utils'

export interface FileUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
  /** Accepted file types (e.g., "image/*", ".pdf,.doc") */
  accept?: string
  /** Max file size in bytes (default: 10MB) */
  maxSize?: number
  /** Allow multiple files */
  multiple?: boolean
  /** Currently uploading */
  uploading?: boolean
  /** Upload progress (0-100) */
  progress?: number
  /** Callback when files are selected/dropped */
  onFiles: (files: File[]) => void
  /** Error message to display */
  error?: string
  /** Compact mode (inline button instead of drop zone) */
  compact?: boolean
  /** Disabled */
  disabled?: boolean
  /** Custom label */
  label?: string
  /** Custom sublabel */
  sublabel?: string
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

function fileMatchesAccept(file: File, accept: string): boolean {
  return accept
    .split(',')
    .map((t) => t.trim())
    .some((type) => {
      if (type.startsWith('.'))
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      if (type.endsWith('/*'))
        return file.type.startsWith(type.slice(0, type.indexOf('/') + 1))
      return file.type === type
    })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      maxSize = DEFAULT_MAX_SIZE,
      multiple = false,
      uploading = false,
      progress = 0,
      onFiles,
      error,
      compact = false,
      disabled = false,
      className,
      label,
      sublabel,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [isDragActive, setIsDragActive] = React.useState(false)
    const [validationError, setValidationError] = React.useState<string | null>(
      null,
    )
    // Track whether a file dialog was opened, so we can detect when the
    // browser (or testing library) filters out all files via the accept attribute
    const dialogOpenRef = React.useRef(false)
    const filesAcceptedRef = React.useRef(false)

    const displayError = error || validationError

    const openPicker = React.useCallback(() => {
      if (disabled || uploading) return
      inputRef.current?.click()
    }, [disabled, uploading])

    const validateAndEmit = React.useCallback(
      (files: File[]) => {
        setValidationError(null)

        for (const file of files) {
          if (file.size > maxSize) {
            setValidationError(
              `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}`,
            )
            return
          }
          if (accept && !fileMatchesAccept(file, accept)) {
            setValidationError(
              `File "${file.name}" is not an accepted file type`,
            )
            return
          }
        }

        onFiles(files)
      },
      [maxSize, accept, onFiles],
    )

    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        filesAcceptedRef.current = true
        const fileList = e.target.files
        if (!fileList || fileList.length === 0) return
        validateAndEmit(Array.from(fileList))
        // Reset input value so the same file can be selected again
        e.target.value = ''
      },
      [validateAndEmit],
    )

    // When the file input is clicked, the browser opens a dialog and blurs the input.
    // We track this to detect when the dialog closes without selecting valid files.
    const handleInputClick = React.useCallback(() => {
      dialogOpenRef.current = true
      filesAcceptedRef.current = false
    }, [])

    // After the file dialog closes, the browser re-focuses the input.
    // If no files were accepted (e.g., the browser/test library filtered by accept),
    // and the accept prop is set, show a validation error.
    const handleInputFocus = React.useCallback(() => {
      if (dialogOpenRef.current && !filesAcceptedRef.current && accept) {
        setValidationError('File type is not accepted')
      }
      dialogOpenRef.current = false
    }, [accept])

    const handleDragEnter = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled && !uploading) {
          setIsDragActive(true)
        }
      },
      [disabled, uploading],
    )

    const handleDragOver = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled && !uploading) {
          setIsDragActive(true)
        }
      },
      [disabled, uploading],
    )

    const handleDragLeave = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
      },
      [],
    )

    const handleDrop = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)

        if (disabled || uploading) return

        const fileList = e.dataTransfer.files
        if (!fileList || fileList.length === 0) return
        validateAndEmit(Array.from(fileList))
      },
      [disabled, uploading, validateAndEmit],
    )

    const defaultLabel = label ?? 'Drop files here or click to browse'
    const defaultSublabel = sublabel ?? `Max file size: ${formatBytes(maxSize)}`
    const inputId = React.useId()

    if (compact) {
      return (
        <div ref={ref} className={cn('inline-flex flex-col', className)} {...props}>
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className={cn(
              'inline-flex items-center gap-ds-2 rounded-ds-md px-ds-3 py-ds-2',
              'text-[length:var(--font-size-sm)] font-medium',
              'border border-[var(--color-border-default)]',
              'bg-[var(--color-field)] text-[var(--color-text-secondary)]',
              'hover:bg-[var(--color-interactive-subtle)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
            )}
          >
            {uploading ? (
              <IconLoader2 className="h-[var(--icon-sm)] w-[var(--icon-sm)] animate-spin" />
            ) : (
              <IconPaperclip className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
            )}
            {label ?? 'Attach files'}
          </button>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="sr-only"
            style={{ visibility: 'hidden' }}
            aria-hidden="true"
            aria-label={label ?? 'Attach files'}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            tabIndex={-1}
          />
          {displayError && (
            <p
              role="alert"
              aria-live="polite"
              className="mt-ds-2 text-[length:var(--font-size-xs)] text-[var(--color-error)]"
            >
              {displayError}
            </p>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        {...props}
        className={cn('flex flex-col', className)}
        data-drag-active={isDragActive ? 'true' : undefined}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          role="button"
          tabIndex={disabled ? undefined : 0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openPicker()
            }
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-ds-3 rounded-ds-lg',
            'border-2 border-dashed p-ds-8',
            'transition-colors cursor-pointer',
            'border-[var(--color-border-default)] bg-[var(--color-field)]',
            isDragActive &&
              'border-[var(--color-interactive)] bg-[var(--color-interactive-subtle)]',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          aria-disabled={disabled || undefined}
        >
          {uploading ? (
            <IconLoader2 className="h-8 w-8 animate-spin text-[var(--color-icon-secondary)]" />
          ) : (
            <IconUpload className="h-8 w-8 text-[var(--color-icon-secondary)]" />
          )}
          <span id={inputId + '-label'} className="text-ds-sm text-[var(--color-text-secondary)]">
            {defaultLabel}
          </span>
          {uploading ? (
            <div className="w-full max-w-xs">
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-field)]"
              >
                <div
                  className="h-full rounded-full bg-[var(--color-interactive)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <span className="text-[length:var(--font-size-xs)] text-[var(--color-text-tertiary)]">
              {defaultSublabel}
            </span>
          )}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          style={{ visibility: 'hidden' }}
          aria-hidden="true"
          aria-label={defaultLabel}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          tabIndex={-1}
        />
        {displayError && (
          <p
            role="alert"
            className="mt-ds-2 text-[length:var(--font-size-xs)] text-[var(--color-error)]"
          >
            {displayError}
          </p>
        )}
      </div>
    )
  },
)
FileUpload.displayName = 'FileUpload'

export { FileUpload }
