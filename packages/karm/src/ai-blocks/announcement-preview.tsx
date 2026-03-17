'use client'

import * as React from 'react'
import { Badge } from '@/ui/badge'
import { cn } from '@/ui/lib/utils'
import type { BlockComponentProps } from '@/ai/types'

// ============================================================
// Types
// ============================================================

export interface AnnouncementPreviewData {
  title: string
  body: string
  author?: string
  createdAt?: string
  audience?: string
}

// ============================================================
// Component
// ============================================================

function AnnouncementPreviewBlock({ data }: BlockComponentProps<AnnouncementPreviewData>) {
  const { title, body, author, createdAt, audience } = data

  return (
    <div className="flex flex-col gap-ds-03 rounded-ds-lg border border-surface-border-strong bg-surface-raised p-ds-05">
      <div className="flex items-start justify-between gap-ds-03">
        <h3 className="text-ds-base font-semibold text-surface-fg">{title}</h3>
        {audience && (
          <Badge variant="outline" size="xs">{audience}</Badge>
        )}
      </div>
      <p className="whitespace-pre-wrap text-ds-sm text-surface-fg-muted">{body}</p>
      {(author || createdAt) && (
        <div className="flex items-center gap-ds-03 text-ds-xs text-surface-fg-subtle">
          {author && <span>{author}</span>}
          {author && createdAt && <span aria-hidden="true">&middot;</span>}
          {createdAt && <span>{createdAt}</span>}
        </div>
      )}
    </div>
  )
}

AnnouncementPreviewBlock.displayName = 'AnnouncementPreviewBlock'

export { AnnouncementPreviewBlock }
