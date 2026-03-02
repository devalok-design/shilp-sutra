'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../ui/dialog'
import { Button } from '../../ui/button'
import { EmptyState } from '../../shared/empty-state'
import {
  IconFile as FileIcon,
  IconFileText,
  IconPhoto,
  IconFileCode,
  IconFileSpreadsheet,
  IconFileZip,
  IconUpload,
  IconDownload,
  IconTrash,
  IconPaperclip,
} from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

export interface TaskFile {
  id: string
  taskId: string
  title: string
  fileUrl: string
  downloadUrl?: string
  fileType: string | null
  uploadedBy: {
    id: string
    name: string
    image: string | null
  }
  createdAt: string
}

interface FilesTabProps {
  files: TaskFile[]
  onUpload: (file: File, title?: string) => void
  onDelete: (fileId: string) => void
  isUploading?: boolean
  className?: string
  /** When true, hide upload/delete controls (client view) */
  readOnly?: boolean
}

// ============================================================
// Helpers
// ============================================================

function getFileIcon(fileType: string | null) {
  if (!fileType) return FileIcon
  const type = fileType.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(type))
    return IconPhoto
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(type))
    return IconFileText
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'html', 'css', 'json'].includes(type))
    return IconFileCode
  if (['xls', 'xlsx', 'csv'].includes(type))
    return IconFileSpreadsheet
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(type))
    return IconFileZip
  return FileIcon
}

function formatFileDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ============================================================
// Files Tab
// ============================================================

function FilesTab({
  files,
  onUpload,
  onDelete,
  isUploading = false,
  className,
  readOnly = false,
}: FilesTabProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onUpload(selectedFile)
    }
    // Reset so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      onUpload(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Upload zone -- hidden in readOnly mode */}
      {!readOnly && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'rounded-[var(--radius-lg)] border-2 border-dashed transition-colors',
            dragOver
              ? 'border-[var(--color-interactive)] bg-[var(--color-interactive)]/5'
              : 'border-[var(--color-border-default)]',
          )}
        >
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-layer-02)]">
              <IconUpload
                className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-placeholder)]"
                stroke={1.5}
              />
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-[13px] font-body font-medium text-[var(--color-interactive)] transition-colors hover:underline disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Click to upload'}
              </button>
              <span className="text-[13px] font-body text-[var(--color-text-placeholder)]">
                {' '}or drag and drop
              </span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Files list */}
      {files.length > 0 ? (
        <div className="mt-4 space-y-1">
          {files.map((file) => {
            const Icon = getFileIcon(file.fileType)
            return (
              <div
                key={file.id}
                className="group flex items-center gap-3 rounded-[var(--radius-lg)] px-2 py-2 transition-colors hover:bg-[var(--color-field)]"
              >
                {/* File icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-layer-02)]">
                  <Icon
                    className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-tertiary)]"
                    stroke={1.5}
                  />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-body font-medium text-[var(--color-text-primary)]">
                    {file.title}
                  </p>
                  <p className="text-[11px] font-body text-[var(--color-text-placeholder)]">
                    {formatFileDate(file.createdAt)}
                    <span className="mx-1.5">by</span>
                    {file.uploadedBy.name}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {file.downloadUrl && (
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-[var(--color-layer-02)]"
                      title="Download"
                    >
                      <IconDownload className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-tertiary)]" />
                    </a>
                  )}
                  {!readOnly && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-[var(--color-error-surface)]"
                          title="Delete"
                        >
                          <IconTrash className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-error)]" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete file?</DialogTitle>
                          <DialogDescription>
                            &quot;{file.title}&quot; will be permanently deleted.
                            This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="secondary" size="sm">
                              Cancel
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onDelete(file.id)}
                            >
                              Delete
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-2">
          <EmptyState
            icon={IconPaperclip}
            title="No files attached"
            description="Upload files to share with your team"
            compact
          />
        </div>
      )}
    </div>
  )
}

FilesTab.displayName = 'FilesTab'

export { FilesTab }
export type { FilesTabProps }
