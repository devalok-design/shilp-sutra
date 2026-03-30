'use client'

import * as React from 'react'
import { IconChevronLeft, IconChevronRight, IconDownload } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/ui/dialog'
import { FilePreview } from '@/composed/file-preview'
import type { TaskFile } from './task-panel-types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPreviewType(
  file: TaskFile,
): 'image' | 'pdf' | 'video' | 'audio' | 'embed' | undefined {
  if (
    file.source === 'figma' ||
    file.source === 'youtube' ||
    file.source === 'vimeo' ||
    file.source === 'loom'
  )
    return 'embed'
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext))
    return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio'
  return undefined
}

// ---------------------------------------------------------------------------
// TaskPanelFilePreview
// ---------------------------------------------------------------------------

export interface TaskPanelFilePreviewProps {
  files: TaskFile[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskPanelFilePreview({
  files,
  initialIndex,
  open,
  onOpenChange,
}: TaskPanelFilePreviewProps) {
  const [index, setIndex] = React.useState(initialIndex)

  // Sync index when initialIndex changes (e.g. user clicks a different file)
  React.useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex])

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setIndex((i) => (i > 0 ? i - 1 : i))
      } else if (e.key === 'ArrowRight') {
        setIndex((i) => (i < files.length - 1 ? i + 1 : i))
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, files.length])

  const file = files[index]
  if (!file) return null

  const hasPrev = index > 0
  const hasNext = index < files.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 flex flex-col">
        {/* sr-only title for accessibility */}
        <div className="sr-only">
          <DialogTitle>{file.name}</DialogTitle>
          <DialogDescription>File preview</DialogDescription>
        </div>

        {/* Header bar */}
        <div className="flex items-center justify-between px-ds-05 py-ds-03 border-b border-surface-border-subtle shrink-0">
          <span className="text-ds-sm font-medium text-surface-fg truncate">
            {file.name}
          </span>
          <div className="flex items-center gap-ds-02">
            <span className="text-ds-xs text-surface-fg-subtle">
              {index + 1} of {files.length}
            </span>
            <a href={file.downloadUrl} download>
              <Button variant="ghost" size="icon-xs" aria-label="Download">
                <Icon icon={IconDownload} />
              </Button>
            </a>
          </div>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-hidden relative">
          <FilePreview
            url={file.embedUrl || file.fileUrl}
            type={getPreviewType(file)}
            fileName={file.name}
            alt={file.name}
          />

          {/* Navigation arrows */}
          {hasPrev && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute left-ds-03 top-1/2 -translate-y-1/2 bg-surface-overlay/80 backdrop-blur-sm shadow-sm"
              onClick={() => setIndex((i) => i - 1)}
              aria-label="Previous file"
            >
              <Icon icon={IconChevronLeft} />
            </Button>
          )}
          {hasNext && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-ds-03 top-1/2 -translate-y-1/2 bg-surface-overlay/80 backdrop-blur-sm shadow-sm"
              onClick={() => setIndex((i) => i + 1)}
              aria-label="Next file"
            >
              <Icon icon={IconChevronRight} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

TaskPanelFilePreview.displayName = 'TaskPanelFilePreview'
