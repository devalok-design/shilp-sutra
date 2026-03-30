'use client'

import * as React from 'react'
import {
  IconUpload,
  IconLink,
  IconFile,
  IconPhoto,
  IconVideo,
  IconExternalLink,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconCircleCheck,
  IconCircleMinus,
  IconX,
  IconBrandFigma,
  IconBrandYoutube,
  IconBrandVimeo,
  IconBrandGoogle,
  IconBrandDropbox,
  IconPlayerPlay,
  IconFileText,
  IconPresentation,
} from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Progress } from '@/ui/progress'
import { MotionCollapse } from '@/motion/primitives'
import { TaskSection } from '../../composed/task-section'
import { useTaskPanel } from './task-panel-context'
import {
  isImageFile,
  groupFilesByCategory,
  type FileCategory,
} from './file-utils'
import { TaskPanelFilePreview } from './task-panel-file-preview'
import type { TaskFile, UploadingFile } from './task-panel-types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(file: TaskFile) {
  if (file.source === 'figma') return IconBrandFigma
  if (file.source === 'youtube') return IconBrandYoutube
  if (file.source === 'vimeo') return IconBrandVimeo
  if (file.source === 'gdrive') return IconBrandGoogle
  if (file.source === 'dropbox') return IconBrandDropbox
  if (file.source === 'loom') return IconPlayerPlay
  if (isImageFile(file.name)) return IconPhoto
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['mp4', 'mov', 'webm'].includes(ext)) return IconVideo
  if (['pdf', 'docx', 'txt'].includes(ext)) return IconFileText
  if (['pptx', 'xlsx'].includes(ext)) return IconPresentation
  return IconFile
}

const CATEGORY_ORDER: FileCategory[] = ['design', 'media', 'documents', 'links']

const CATEGORY_LABELS: Record<FileCategory, string> = {
  design: 'Design',
  media: 'Media',
  documents: 'Documents',
  links: 'Links',
}

// ---------------------------------------------------------------------------
// FileRow
// ---------------------------------------------------------------------------

interface FileRowProps {
  file: TaskFile
  isStaff: boolean
  canDeleteOwn: boolean
  currentUserId: string | null
  onDelete: (fileId: string) => void
  onToggleVisibility: (fileId: string) => void
  onUpdateStatus: (fileId: string, status: 'draft' | 'final') => void
  onPreview?: () => void
}

function FileRow({
  file,
  isStaff,
  canDeleteOwn,
  currentUserId,
  onDelete,
  onToggleVisibility,
  onUpdateStatus,
  onPreview,
}: FileRowProps) {
  const FileIcon = getFileIcon(file)
  const isImage = isImageFile(file.name)
  const canDelete =
    isStaff || (canDeleteOwn && file.uploadedBy.id === currentUserId)

  return (
    <div className="group/file rounded-ds-md px-ds-03 py-ds-02 hover:bg-surface-raised-hover transition-colors">
      <div className="flex items-center gap-ds-03">
        {/* Thumbnail or icon */}
        {isImage && (file.thumbnailUrl || file.fileUrl) ? (
          <button
            type="button"
            className="size-12 shrink-0 overflow-hidden rounded-ds-md bg-surface-raised"
            onClick={onPreview}
          >
            <img
              src={file.thumbnailUrl || file.fileUrl}
              alt={file.name}
              className="size-full object-cover"
            />
          </button>
        ) : (
          <Icon
            icon={FileIcon}
            size="sm"
            className="shrink-0 text-surface-fg-subtle"
          />
        )}

        {/* Name + metadata */}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="text-ds-sm text-surface-fg truncate block text-left hover:text-accent-11 transition-colors max-w-full"
            onClick={onPreview}
          >
            {file.name}
          </button>
          <span className="text-ds-xs text-surface-fg-subtle">
            {formatFileSize(file.size)} &middot; {file.uploadedBy.name}
          </span>
        </div>

        {/* Status badge */}
        {file.status === 'final' && (
          <Badge size="xs" color="success" variant="subtle">
            Final
          </Badge>
        )}

        {/* Hover actions */}
        <div className="flex items-center gap-ds-01 shrink-0 opacity-0 group-hover/file:opacity-100 transition-opacity">
          {isStaff && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onToggleVisibility(file.id)}
              aria-label={
                file.isClientVisible === false
                  ? `Show ${file.name} to client`
                  : `Hide ${file.name} from client`
              }
            >
              <Icon
                icon={file.isClientVisible === false ? IconEyeOff : IconEye}
              />
            </Button>
          )}

          {isStaff && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() =>
                onUpdateStatus(
                  file.id,
                  file.status === 'final' ? 'draft' : 'final',
                )
              }
              aria-label={
                file.status === 'final'
                  ? `Mark ${file.name} as draft`
                  : `Mark ${file.name} as final`
              }
            >
              <Icon
                icon={
                  file.status === 'final' ? IconCircleMinus : IconCircleCheck
                }
              />
            </Button>
          )}

          {file.gDriveUrl && (
            <a
              href={file.gDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-ds-md p-ds-01 text-surface-fg-subtle hover:text-accent-11 transition-colors"
              aria-label="Open in Google Drive"
            >
              <Icon icon={IconExternalLink} size="xs" />
            </a>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(file.id)}
              aria-label={`Delete ${file.name}`}
            >
              <Icon icon={IconTrash} />
            </Button>
          )}
        </div>
      </div>

      {/* Inline Figma embed */}
      {file.source === 'figma' && file.embedUrl && (
        <div className="mt-ds-02 rounded-ds-md overflow-hidden border border-surface-border-subtle">
          <iframe
            src={`https://www.figma.com/embed?embed_host=karm&url=${encodeURIComponent(file.embedUrl)}`}
            className="w-full h-[200px]"
            allowFullScreen
            loading="lazy"
            title={`Figma: ${file.name}`}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// UploadingFileRow
// ---------------------------------------------------------------------------

interface UploadingFileRowProps {
  upload: UploadingFile
  onCancel: (uploadId: string) => void
  onRetry: (uploadId: string) => void
}

function UploadingFileRow({ upload, onCancel, onRetry }: UploadingFileRowProps) {
  const hasError = !!upload.error

  return (
    <div className="flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02">
      <Icon icon={IconFile} size="sm" className="shrink-0 text-surface-fg-subtle" />
      <div className="min-w-0 flex-1">
        <span className="text-ds-sm text-surface-fg truncate block">
          {upload.name}
        </span>
        {hasError ? (
          <span className="text-ds-xs text-error-11">{upload.error}</span>
        ) : (
          <Progress value={upload.progress} autoColor size="sm" className="mt-ds-01" />
        )}
      </div>
      {hasError ? (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRetry(upload.id)}
          aria-label={`Retry upload ${upload.name}`}
          className="shrink-0 text-accent-11"
        >
          <span className="text-ds-xs font-medium">Retry</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onCancel(upload.id)}
          aria-label={`Cancel upload ${upload.name}`}
          className="shrink-0"
        >
          <Icon icon={IconX} />
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ValidationError
// ---------------------------------------------------------------------------

interface ValidationErrorProps {
  errors: string[]
}

function ValidationErrors({ errors }: ValidationErrorProps) {
  if (errors.length === 0) return null
  return (
    <div className="px-ds-03 py-ds-02">
      {errors.map((err, i) => (
        <p key={i} className="text-ds-xs text-error-11">
          {err}
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TaskPanelFiles
// ---------------------------------------------------------------------------

export interface TaskPanelFilesProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskPanelFiles({
  className,
  ...props
}: TaskPanelFilesProps) {
  const {
    task,
    mode,
    clientMode,
    currentUserId,
    onUploadFile,
    onDeleteFile,
    uploadingFiles,
    onRetryUpload,
    onCancelUpload,
    onAttachLink,
    onUpdateFileStatus,
    onToggleFileVisibility,
    maxFileSize,
    acceptedFileTypes,
  } = useTaskPanel()

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dragCountRef = React.useRef(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [showLinkInput, setShowLinkInput] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState('')
  const [validationErrors, setValidationErrors] = React.useState<string[]>([])
  const [previewIndex, setPreviewIndex] = React.useState(-1)

  // Clear validation errors after 5 seconds
  React.useEffect(() => {
    if (validationErrors.length === 0) return
    const timer = setTimeout(() => setValidationErrors([]), 5000)
    return () => clearTimeout(timer)
  }, [validationErrors])

  if (mode === 'peek') return null

  const isStaff = !clientMode
  const isCollaborator = clientMode === 'COLLABORATOR'
  const canUpload = isStaff || isCollaborator

  // Client filtering: clients only see files where isClientVisible !== false
  const allFiles = task.files ?? []
  const files = clientMode
    ? allFiles.filter((f) => f.isClientVisible !== false)
    : allFiles

  const uploads = uploadingFiles ?? []

  // Client with no visible files: hide section entirely
  if (clientMode && files.length === 0 && uploads.length === 0) return null

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validateFile = (file: File): string | null => {
    if (maxFileSize && file.size > maxFileSize)
      return `File too large (max ${formatFileSize(maxFileSize)})`
    if (acceptedFileTypes?.length) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const matches = acceptedFileTypes.some((t) =>
        t.startsWith('.') ? ext === t.slice(1) : file.type === t,
      )
      if (!matches) return `File type .${ext} not accepted`
    }
    return null
  }

  const processFiles = (fileList: FileList | File[]) => {
    const errors: string[] = []
    const valid: File[] = []
    Array.from(fileList).forEach((f) => {
      const err = validateFile(f)
      if (err) {
        errors.push(`${f.name}: ${err}`)
      } else {
        valid.push(f)
      }
    })
    if (errors.length > 0) {
      setValidationErrors(errors)
    }
    valid.forEach((f) => onUploadFile(f))
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (selected) processFiles(selected)
    e.target.value = ''
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCountRef.current += 1
    if (dragCountRef.current === 1) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCountRef.current -= 1
    if (dragCountRef.current === 0) setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCountRef.current = 0
    setIsDragging(false)
    const dropped = e.dataTransfer.files
    if (dropped) processFiles(dropped)
  }

  const handleLinkSubmit = () => {
    const trimmed = linkUrl.trim()
    if (trimmed) {
      onAttachLink(trimmed)
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLinkSubmit()
    } else if (e.key === 'Escape') {
      setShowLinkInput(false)
      setLinkUrl('')
    }
  }

  // ---------------------------------------------------------------------------
  // Categorized vs flat rendering
  // ---------------------------------------------------------------------------

  const grouped = groupFilesByCategory(files)
  const categoryCount = grouped.size
  const shouldCategorize = files.length > 3 && categoryCount > 1

  // Build flat ordered list matching rendered order (for gallery navigation)
  const orderedFiles = (() => {
    if (!shouldCategorize) return files
    const result: TaskFile[] = []
    for (const cat of CATEGORY_ORDER) {
      const group = grouped.get(cat)
      if (group) result.push(...group)
    }
    return result
  })()

  const renderFileRow = (file: TaskFile) => (
    <FileRow
      key={file.id}
      file={file}
      isStaff={isStaff}
      canDeleteOwn={isCollaborator}
      currentUserId={currentUserId}
      onDelete={onDeleteFile}
      onToggleVisibility={onToggleFileVisibility}
      onUpdateStatus={onUpdateFileStatus}
      onPreview={() => {
        const idx = orderedFiles.findIndex((f) => f.id === file.id)
        setPreviewIndex(idx >= 0 ? idx : 0)
      }}
    />
  )

  const renderFileList = () => {
    if (files.length === 0) return null

    if (!shouldCategorize) {
      return files.map((file) => renderFileRow(file))
    }

    return CATEGORY_ORDER.map((cat) => {
      const catFiles = grouped.get(cat)
      if (!catFiles || catFiles.length === 0) return null
      return (
        <div key={cat}>
          <span className="block text-[11px] font-semibold text-surface-fg-subtle/60 uppercase tracking-wider mt-ds-03 mb-ds-01 px-ds-03">
            {CATEGORY_LABELS[cat]}
          </span>
          {catFiles.map((file) => renderFileRow(file))}
        </div>
      )
    })
  }

  // ---------------------------------------------------------------------------
  // Empty state for staff
  // ---------------------------------------------------------------------------

  if (files.length === 0 && uploads.length === 0 && isStaff) {
    return (
      <div
        className={cn(
          'px-ds-06 py-ds-03 border-b border-surface-border-subtle',
          className,
        )}
        {...props}
      >
        <div
          className="relative"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <button
            type="button"
            className="w-full rounded-ds-lg border border-dashed border-surface-border px-ds-04 py-ds-03 text-center text-ds-sm text-surface-fg-subtle transition-colors hover:border-surface-border-strong hover:text-accent-11"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon icon={IconUpload} size="sm" className="mx-auto mb-ds-01" />
            <span>Drop files or click to upload</span>
          </button>
          <div className="mt-ds-02 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkInput(true)}
            >
              <Icon icon={IconLink} size="xs" className="mr-ds-01" />
              Attach link
            </Button>
          </div>
          <MotionCollapse show={showLinkInput}>
            <div className="mt-ds-02">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                placeholder="Paste a Figma, Drive, Loom, or any URL..."
                className="w-full rounded-ds-md border border-surface-border bg-surface-1 px-ds-03 py-ds-02 text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle/50 outline-none focus:border-accent-7 transition-colors"
                autoFocus
              />
            </div>
          </MotionCollapse>
          <ValidationErrors errors={validationErrors} />
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-ds-lg border-2 border-dashed border-accent-7 bg-accent-3/50">
              <span className="text-ds-sm font-medium text-accent-11">
                Drop files here
              </span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  const totalCount = files.length + uploads.length

  return (
    <div
      className={cn(
        'px-ds-06 py-ds-03 border-b border-surface-border-subtle',
        className,
      )}
      {...props}
    >
      <TaskSection
        title="Files"
        count={totalCount}
        defaultOpen={totalCount > 0}
      >
        <div
          className="relative px-ds-04 pb-ds-03 mt-ds-02 flex flex-col gap-ds-01"
          onDragEnter={canUpload ? handleDragEnter : undefined}
          onDragLeave={canUpload ? handleDragLeave : undefined}
          onDragOver={canUpload ? handleDragOver : undefined}
          onDrop={canUpload ? handleDrop : undefined}
        >
          {/* Action bar — upload + link buttons */}
          {canUpload && (
            <div className="flex items-center gap-ds-02 mb-ds-02">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon icon={IconUpload} size="xs" className="mr-ds-01" />
                Upload
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkInput((v) => !v)}
              >
                <Icon icon={IconLink} size="xs" className="mr-ds-01" />
                Attach link
              </Button>
            </div>
          )}

          {/* Link URL input */}
          <MotionCollapse show={showLinkInput && canUpload}>
            <div className="mb-ds-02">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                placeholder="Paste a Figma, Drive, Loom, or any URL..."
                className="w-full rounded-ds-md border border-surface-border bg-surface-1 px-ds-03 py-ds-02 text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle/50 outline-none focus:border-accent-7 transition-colors"
                autoFocus
              />
            </div>
          </MotionCollapse>

          {/* Validation errors */}
          <ValidationErrors errors={validationErrors} />

          {/* Uploading files */}
          {uploads.map((upload) => (
            <UploadingFileRow
              key={upload.id}
              upload={upload}
              onCancel={onCancelUpload}
              onRetry={onRetryUpload}
            />
          ))}

          {/* File list — categorized or flat */}
          {renderFileList()}

          {/* Upload area at bottom — staff and collaborator */}
          {canUpload && files.length > 0 && (
            <button
              type="button"
              className="mt-ds-02 rounded-ds-lg border border-dashed border-surface-border px-ds-04 py-ds-03 text-center text-ds-xs text-surface-fg-subtle transition-colors hover:border-accent-7 hover:text-accent-11"
              onClick={() => fileInputRef.current?.click()}
            >
              + Upload files
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            multiple
          />

          {/* Drag overlay */}
          {canUpload && isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-ds-lg border-2 border-dashed border-accent-7 bg-accent-3/50">
              <span className="text-ds-sm font-medium text-accent-11">
                Drop files here
              </span>
            </div>
          )}
        </div>
      </TaskSection>

      <TaskPanelFilePreview
        files={orderedFiles}
        initialIndex={previewIndex}
        open={previewIndex >= 0}
        onOpenChange={(open) => {
          if (!open) setPreviewIndex(-1)
        }}
      />
    </div>
  )
}

TaskPanelFiles.displayName = 'TaskPanelFiles'
