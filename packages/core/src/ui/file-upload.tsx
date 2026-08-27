'use client'

import { IconCheck,IconPaperclip, IconUpload } from '@tabler/icons-react'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { Icon } from './icon'
import { springs, tweens } from './lib/motion'
import { cn } from './lib/utils'
import { Spinner } from './spinner'

/**
 * Props for FileUpload — a drag-and-drop file picker with client-side validation (type + size),
 * an upload progress bar, and a compact inline mode.
 *
 * **Two modes:**
 * - Default: large drop zone with an upload icon, label, and sublabel — good for primary upload areas.
 * - `compact={true}`: a small inline button with an attachment icon — good for secondary/inline uploads.
 *
 * **Validation:** Pass `accept` (MIME or extension) and `maxSize` (bytes). Errors are shown inline.
 * The `onFiles` callback only fires with valid files — invalid files are rejected with an error message.
 *
 * **`onFiles` required:** This is the only required prop. Integrating with a real uploader means
 * calling your upload API from this callback and driving `uploading` + `progress` externally.
 *
 * @example
 * // Avatar upload with image-only restriction:
 * <FileUpload
 *   accept="image/*"
 *   maxSize={2 * 1024 * 1024}
 *   onFiles={(files) => uploadAvatar(files[0])}
 *   label="Upload profile photo"
 *   sublabel="PNG, JPG up to 2MB"
 * />
 *
 * @example
 * // Document multi-upload with progress:
 * <FileUpload
 *   multiple
 *   accept=".pdf,.doc,.docx"
 *   uploading={isUploading}
 *   progress={uploadPercent}
 *   onFiles={handleFiles}
 * />
 *
 * @example
 * // Compact inline attachment button in a comment form:
 * <FileUpload compact onFiles={(files) => attachFiles(files)} label="Attach files" />
 * // These are just a few ways — feel free to combine props creatively!
 */
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
              'inline-flex items-center gap-ds-02 rounded-control px-ds-03 py-ds-02',
              'text-body-sm font-medium',
              'border border-surface-border-interactive',
              'bg-surface-panel-hover text-surface-fg-muted',
              'hover:bg-accent-3',
              'disabled:opacity-action-disabled disabled:cursor-not-allowed',
              'transition-colors',
            )}
          >
            {uploading ? (
              <Spinner size="sm" />
            ) : (
              <Icon icon={IconPaperclip} size="sm" />
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
              className="mt-ds-02 text-body-xs text-error-11"
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
        role="presentation"
        className={cn('flex flex-col', className)}
        data-drag-active={isDragActive ? 'true' : undefined}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <motion.div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          onClick={disabled ? undefined : openPicker}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              openPicker()
            }
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-ds-03 rounded-surface',
            'border-2 border-dashed p-ds-08',
            'focus-ring transition-colors duration-fast-02 ease-productive-standard',
            // Rest on the canvas fill; reserve the hover token for actual hover.
            'border-surface-border-interactive bg-surface-base',
            disabled ? 'cursor-not-allowed opacity-action-disabled' : 'cursor-pointer hover:bg-surface-panel-hover',
            isDragActive && 'border-accent-7 bg-accent-2',
          )}
          animate={{
            scale: isDragActive ? 1.02 : 1,
          }}
          transition={springs.snappy}
        >
          {/* Icon — animates between upload ↔ spinner ↔ checkmark */}
          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={tweens.fade}
              >
                <Spinner size="md" />
              </motion.div>
            ) : progress === 100 && !error ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={springs.bouncy}
              >
                <Icon icon={IconCheck} size="2xl" className="text-success-11" />
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={tweens.fade}
              >
                <Icon icon={IconUpload} size="2xl" className="text-surface-fg-subtle" />
              </motion.div>
            )}
          </AnimatePresence>
          <span id={inputId + '-label'} className="text-body-sm text-surface-fg-muted">
            {defaultLabel}
          </span>
          {uploading ? (
            <div className="w-full max-w-xs">
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 w-full overflow-hidden rounded-pill bg-surface-panel-hover"
              >
                <motion.div
                  // scaleX (compositor-only) not width (layout) → smooth + honored by reduced-motion.
                  className="h-full w-full origin-left rounded-pill bg-accent-9"
                  animate={{ scaleX: Math.max(0, Math.min(100, progress)) / 100 }}
                  transition={springs.smooth}
                />
              </div>
            </div>
          ) : (
            <span className="text-caption text-surface-fg-subtle">
              {defaultSublabel}
            </span>
          )}
        </motion.div>
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
        {/* Error message — a calm fade/slide in (no decorative shake). */}
        <AnimatePresence>
          {displayError && (
            <motion.p
              role="alert"
              className="mt-ds-02 text-body-xs text-error-11"
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={tweens.fade}
            >
              {displayError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
FileUpload.displayName = 'FileUpload'

export { FileUpload }
