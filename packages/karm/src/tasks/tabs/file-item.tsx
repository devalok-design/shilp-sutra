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
import {
  IconFile as FileIcon,
  IconFileText,
  IconPhoto,
  IconFileCode,
  IconFileSpreadsheet,
  IconFileZip,
  IconDownload,
  IconExternalLink,
  IconTrash,
} from '@tabler/icons-react'
import type { TaskFile } from '../task-types'

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
// Types
// ============================================================

export interface FileItemProps extends React.HTMLAttributes<HTMLDivElement> {
  file: TaskFile
  onDelete?: (id: string) => void
  readOnly?: boolean
}

// ============================================================
// FileItem
// ============================================================

const FileItem = React.forwardRef<HTMLDivElement, FileItemProps>(
  function FileItem({ file, onDelete, readOnly = false, className, ...props }, ref) {
    const Icon = getFileIcon(file.fileType)

    return (
      <div
        ref={ref}
        className={cn(
          'group flex items-center gap-ds-04 rounded-ds-lg px-ds-03 py-ds-03 transition-colors hover:bg-surface-3',
          className,
        )}
        {...props}
      >
        {/* File icon */}
        <div className="flex h-ds-sm w-ds-sm shrink-0 items-center justify-center rounded-ds-lg bg-surface-2">
          <Icon
            className="h-ico-sm w-ico-sm text-surface-fg-subtle"
            stroke={1.5}
          />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-ds-md font-medium text-surface-fg">
            {file.title}
          </p>
          <p className="text-ds-sm text-surface-fg-subtle">
            {formatFileDate(file.createdAt)}
            <span className="mx-ds-02b">by</span>
            {file.uploadedBy.name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-ds-02 opacity-0 transition-opacity group-hover:opacity-100">
          {file.externalUrl && (
            <a
              href={/^https?:\/\//.test(file.externalUrl) ? file.externalUrl : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md transition-colors hover:bg-surface-2"
              title={file.externalLabel ?? 'Open externally'}
            >
              <IconExternalLink className="h-ico-sm w-ico-sm text-surface-fg-subtle" />
            </a>
          )}
          {file.downloadUrl && (
            <a
              href={/^https?:\/\//.test(file.downloadUrl) ? file.downloadUrl : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md transition-colors hover:bg-surface-2"
              title="Download"
            >
              <IconDownload className="h-ico-sm w-ico-sm text-surface-fg-subtle" />
            </a>
          )}
          {!readOnly && onDelete && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-ds-md transition-colors hover:bg-error-3"
                  aria-label="Delete file"
                >
                  <IconTrash className="h-ico-sm w-ico-sm text-error-11" />
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
  },
)

FileItem.displayName = 'FileItem'

export { FileItem }
