'use client'

import { IconX } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'

import { Icon } from '../../ui/icon'
import { durations } from '../../ui/lib/motion'
import { cn } from '../../ui/lib/utils'

export interface ReplyBannerProps {
  author: string
  preview: string
  onDismiss: () => void
}

export function ReplyBanner({ author, preview, onDismiss }: ReplyBannerProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: durations.moderate02, ease: [0.2, 0, 0.38, 0.9] }}
      className="overflow-hidden"
    >
      <div
        role="status"
        aria-label={`Replying to ${author}`}
        className="flex items-center gap-ds-03 border-b border-surface-border px-ds-04 py-ds-02b"
      >
        <div className="flex-1 min-w-0">
          <span className="text-body-sm font-semibold text-surface-fg">
            Replying to {author}
          </span>
          <span className="mx-ds-02 text-surface-fg-subtle">&middot;</span>
          <span className="text-body-sm text-surface-fg-muted truncate">
            {preview}
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-control touch-target',
            'text-surface-fg-subtle hover:text-surface-fg hover:bg-surface-panel-hover',
            'transition-colors duration-fast-01 ease-productive-standard',
            'active:scale-95',
          )}
          aria-label="Cancel reply"
          title="Cancel reply"
        >
          <Icon icon={IconX} size="xs" />
        </button>
      </div>
    </motion.div>
  )
}
