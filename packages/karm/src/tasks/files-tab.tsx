'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { EmptyState } from '@/composed/empty-state'
import { IconPaperclip } from '@tabler/icons-react'
import {
  FileDropZone,
  FileList,
  FileItem,
} from './tabs'

import type { TaskFile } from './task-types'
export type { TaskFile }

// ============================================================
// Types
// ============================================================

interface FilesTabProps extends React.HTMLAttributes<HTMLDivElement> {
  files: TaskFile[]
  onUpload: (file: File, title?: string) => void
  onDelete: (fileId: string) => void
  isUploading?: boolean
  /** When true, hide upload/delete controls (client view) */
  readOnly?: boolean
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
  ...props
}, ref) {
  return (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {/* Upload zone -- hidden in readOnly mode */}
      {!readOnly && (
        <FileDropZone onUpload={onUpload} isUploading={isUploading} />
      )}

      {/* Files list */}
      {files.length > 0 ? (
        <FileList className="mt-ds-05">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={onDelete}
              readOnly={readOnly}
            />
          ))}
        </FileList>
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
