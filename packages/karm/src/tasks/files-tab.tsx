'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { EmptyState } from '@/composed/empty-state'
import {
  IconFile as FileIcon,
  IconFileText,
  IconPhoto,
  IconFileCode,
  IconFileSpreadsheet,
  IconFileZip,
  IconUpload,
  IconDownload,
  IconExternalLink,
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
  /** External link (e.g. Google Drive) displayed alongside the download button */
  externalUrl?: string
  /** Label for the external link tooltip (default: "Open externally") */
  externalLabel?: string
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

const FilesTab = React.forwardRef<HTMLDivElement, FilesTabProps>(
  function FilesTab({
  files,
  onUpload,
  onDelete,
  isUploading = false,
  className,
  readOnly = false,
}, ref) {
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
    <div ref={ref} className={cn('flex flex-col', className)}>
      {/* Upload zone -- hidden in readOnly mode */}
      {!readOnly && (
        <div
          role="region"
          aria-label="File upload drop zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'rounded-ds-lg border-2 border-dashed transition-colors',
            dragOver
              ? 'border-interactive bg-interactive/5'
              : 'border-border',
          )}
        >
          <div className="flex flex-col items-center gap-ds-03 py-ds-06">
            <div className="flex h-ds-sm-plus w-ds-sm-plus items-center justify-center rounded-ds-lg bg-layer-02">
              <IconUpload
                className="h-ico-sm w-ico-sm text-text-placeholder"
                stroke={1.5}
              />
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-ds-md font-medium text-interactive transition-colors hover:underline disabled:opacity-[0.38]"
              >
                {isUploading ? 'Uploading...' : 'Click to upload'}
              </button>
              <span className="text-ds-md text-text-placeholder">
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
        <div className="mt-ds-05 space-y-ds-02">
          {files.map((file) => {
            const Icon = getFileIcon(file.fileType)
            return (
              <div
                key={file.id}
                className="group flex items-center gap-ds-04 rounded-ds-lg px-ds-03 py-ds-03 transition-colors hover:bg-field"
              >
                {/* File icon */}
                <div className="flex h-ds-sm w-ds-sm shrink-0 items-center justify-center rounded-ds-lg bg-layer-02">
                  <Icon
                    className="h-ico-sm w-ico-sm text-text-tertiary"
                    stroke={1.5}
                  />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-ds-md font-medium text-text-primary">
                    {file.title}
                  </p>
                  <p className="text-ds-sm text-text-placeholder">
                    {formatFileDate(file.createdAt)}
                    <span className="mx-ds-02b">by</span>
                    {file.uploadedBy.name}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-ds-02 opacity-0 transition-opacity group-hover:opacity-100">
                  {file.externalUrl && (
                    <a
                      href={file.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md transition-colors hover:bg-layer-02"
                      title={file.externalLabel ?? 'Open externally'}
                    >
                      <IconExternalLink className="h-ico-sm w-ico-sm text-text-tertiary" />
                    </a>
                  )}
                  {file.downloadUrl && (
                    <a
                      href={/^https?:\/\//.test(file.downloadUrl) ? file.downloadUrl : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md transition-colors hover:bg-layer-02"
                      title="Download"
                    >
                      <IconDownload className="h-ico-sm w-ico-sm text-text-tertiary" />
                    </a>
                  )}
                  {!readOnly && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md transition-colors hover:bg-error-surface"
                          title="Delete"
                        >
                          <IconTrash className="h-ico-sm w-ico-sm text-text-error" />
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
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="solid"
                              color="error"
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
        <div className="mt-ds-03">
          <EmptyState
            icon={<IconPaperclip />}
            title="No files attached"
            description="Upload files to share with your team"
            compact
          />
        </div>
      )}
    </div>
  )
},
)

FilesTab.displayName = 'FilesTab'

export { FilesTab }
export type { FilesTabProps }
