'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { IconUpload } from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

export interface FileDropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onUpload: (file: File, title?: string) => void
  isUploading?: boolean
  accept?: string
}

// ============================================================
// FileDropZone
// ============================================================

const FileDropZone = React.forwardRef<HTMLDivElement, FileDropZoneProps>(
  function FileDropZone({ onUpload, isUploading = false, accept, className, ...props }, ref) {
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
      <div
        ref={ref}
        role="region"
        aria-label="File upload drop zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'rounded-ds-lg border-2 border-dashed transition-colors',
          dragOver
            ? 'border-accent-7 bg-accent-1'
            : 'border-surface-border-strong',
          className,
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-ds-03 py-ds-06">
          <div className="flex h-ds-sm-plus w-ds-sm-plus items-center justify-center rounded-ds-lg bg-surface-2">
            <IconUpload
              className="h-ico-sm w-ico-sm text-surface-fg-subtle"
              stroke={1.5}
            />
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-ds-md font-medium text-accent-11 transition-colors hover:underline disabled:opacity-action-disabled"
            >
              {isUploading ? 'Uploading...' : 'Click to upload'}
            </button>
            <span className="text-ds-md text-surface-fg-subtle">
              {' '}or drag and drop
            </span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    )
  },
)

FileDropZone.displayName = 'FileDropZone'

export { FileDropZone }
