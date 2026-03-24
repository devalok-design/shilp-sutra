'use client'

import * as React from 'react'
import {
  IconChevronDown,
  IconUpload,
  IconFile,
  IconPhoto,
  IconExternalLink,
  IconTrash,
} from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { MotionCollapse } from '@/motion/primitives'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']

function getFileIcon(name: string) {
  return IMAGE_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext))
    ? IconPhoto
    : IconFile
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelFilesProps
  extends React.HTMLAttributes<HTMLDivElement> {}

// ---------------------------------------------------------------------------
// TaskPanelFiles
// ---------------------------------------------------------------------------

export function TaskPanelFiles({
  className,
  ...props
}: TaskPanelFilesProps) {
  const { task, mode, clientMode, onUploadFile, onDeleteFile } = useTaskPanel()
  const [expanded, setExpanded] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  if (mode === 'peek') return null

  const files = task.files ?? []
  const isStaff = !clientMode

  if (files.length === 0 && !isStaff) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (selected) {
      Array.from(selected).forEach((f) => onUploadFile(f))
    }
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files
    if (dropped) {
      Array.from(dropped).forEach((f) => onUploadFile(f))
    }
  }

  // Empty state for staff — just show upload zone
  if (files.length === 0 && isStaff) {
    return (
      <div
        className={cn(
          'px-ds-06 py-ds-03 border-b border-surface-border-subtle',
          className,
        )}
        {...props}
      >
        <button
          type="button"
          className="w-full rounded-ds-lg border border-dashed border-surface-border px-ds-04 py-ds-03 text-center text-ds-sm text-surface-fg-subtle transition-colors hover:border-surface-border-strong hover:text-accent-11"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Icon icon={IconUpload} size="sm" className="mx-auto mb-ds-01" />
          <span>Drop files or click to upload</span>
        </button>
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

  return (
    <div
      className={cn(
        'px-ds-06 py-ds-03 border-b border-surface-border-subtle',
        className,
      )}
      {...props}
    >
      {/* Compact strip */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-ds-03 justify-start -mx-ds-04 px-ds-04"
      >
        <Icon
          icon={IconChevronDown}
          size="xs"
          className={cn(
            'shrink-0 text-surface-fg-subtle transition-transform',
            expanded && 'rotate-180',
          )}
        />
        <span className="text-ds-xs font-medium text-surface-fg-muted uppercase tracking-wider">
          Files
        </span>
        <Badge size="xs" variant="outline">
          {files.length}
        </Badge>
      </Button>

      <MotionCollapse show={expanded}>
        <div className="px-ds-04 pb-ds-03 mt-ds-02 flex flex-col gap-ds-01">
          {files.map((file) => (
            <div
              key={file.id}
              className="group/file flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02 hover:bg-surface-raised-hover transition-colors"
            >
              <Icon
                icon={getFileIcon(file.name)}
                size="sm"
                className="shrink-0 text-surface-fg-subtle"
              />
              <div className="min-w-0 flex-1">
                <a
                  href={file.downloadUrl}
                  className="text-ds-sm text-surface-fg truncate block hover:text-accent-11 transition-colors"
                  download
                >
                  {file.name}
                </a>
                <span className="text-ds-xs text-surface-fg-subtle">
                  {formatFileSize(file.size)} &middot; {file.uploadedBy.name}
                </span>
              </div>
              {file.gDriveUrl && (
                <a
                  href={file.gDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-surface-fg-subtle hover:text-accent-11 transition-colors"
                  aria-label="Open in Google Drive"
                >
                  <Icon icon={IconExternalLink} size="xs" />
                </a>
              )}
              {isStaff && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onDeleteFile(file.id)}
                  aria-label={`Delete ${file.name}`}
                  className="shrink-0 opacity-0 group-hover/file:opacity-100"
                >
                  <Icon icon={IconTrash} />
                </Button>
              )}
            </div>
          ))}

          {/* Upload area — staff only */}
          {isStaff && (
            <button
              type="button"
              className="mt-ds-02 rounded-ds-lg border border-dashed border-surface-border px-ds-04 py-ds-03 text-center text-ds-xs text-surface-fg-subtle transition-colors hover:border-accent-7 hover:text-accent-11"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
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
        </div>
      </MotionCollapse>
    </div>
  )
}

TaskPanelFiles.displayName = 'TaskPanelFiles'
