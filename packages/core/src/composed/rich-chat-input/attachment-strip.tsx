'use client'

import { IconFile,IconX } from '@tabler/icons-react'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { MotionPreference } from '../../motion/motion-preference'
import { Icon } from '../../ui/icon'
import { durations } from '../../ui/lib/motion'
import { Spinner } from '../../ui/spinner'
import { TruncatedText } from '../../ui/truncated-text'

export interface Attachment {
  id: string
  url?: string
  name: string
  size: number
  type: 'image' | 'file'
  uploading: boolean
}

export interface AttachmentStripProps {
  attachments: Attachment[]
  onRemoveAttachment: (id: string) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentStrip({
  attachments,
  onRemoveAttachment,
}: AttachmentStripProps) {
  return (
    <MotionPreference>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: durations.moderate02, ease: [0.2, 0, 0.38, 0.9] }}
        className="overflow-hidden"
      >
        <div
          role="list"
          aria-label="Attachments"
          className="flex gap-ds-02 overflow-x-auto px-ds-04 py-ds-02b border-b border-surface-border"
        >
          <AnimatePresence initial={false}>
            {attachments.map((att) =>
              att.type === 'image' ? (
                <motion.div
                  key={att.id}
                  role="listitem"
                  aria-label={`Image: ${att.name}`}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{
                    /* Near springs.snappy (500/30/0.5) — intentionally softer for thumbnail pop-in */
                    layout: { type: 'spring', stiffness: 400, damping: 30 },
                    scale: { type: 'spring', stiffness: 400, damping: 30 },
                    opacity: { duration: durations.fast02 },
                  }}
                  /* h-12 w-12 (48px): component-specific thumbnail size — no design token equivalent */
                  className="relative h-12 w-12 shrink-0 group"
                >
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-full w-full rounded-control object-cover"
                  />
                  <button
                    onClick={() => onRemoveAttachment(att.id)}
                    className="absolute -top-1 -right-1 h-ico-sm w-ico-sm rounded-pill bg-error-9 text-error-fg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-fast-02"
                    aria-label={`Remove ${att.name}`}
                    title="Remove"
                  >
                    <Icon icon={IconX} size="xs" />
                  </button>
                  {att.uploading && (
                    <div className="absolute inset-0 rounded-control bg-surface-overlay/50 flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={att.id}
                  role="listitem"
                  aria-label={`File: ${att.name}, ${formatSize(att.size)}`}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{
                    /* Near springs.snappy (500/30/0.5) — intentionally softer for file chip pop-in */
                    layout: { type: 'spring', stiffness: 400, damping: 30 },
                    scale: { type: 'spring', stiffness: 400, damping: 30 },
                    opacity: { duration: durations.fast02 },
                  }}
                  className="flex items-center gap-ds-02 shrink-0 rounded-control bg-surface-panel px-ds-03 py-ds-01 group"
                >
                  <Icon
                    icon={IconFile}
                    size="xs"
                    className="text-surface-fg-muted"
                  />
                  {/* max-w-[120px]: component-specific truncation width for file names */}
                  <TruncatedText mode="middle" className="max-w-[120px] text-caption text-surface-fg-muted">
                    {att.name}
                  </TruncatedText>
                  <span className="text-caption text-surface-fg-subtle">
                    {formatSize(att.size)}
                  </span>
                  <button
                    onClick={() => onRemoveAttachment(att.id)}
                    className="text-surface-fg-subtle hover:text-error-11 opacity-0 group-hover:opacity-100 transition-opacity duration-fast-02"
                    aria-label={`Remove ${att.name}`}
                    title="Remove"
                  >
                    <Icon icon={IconX} size="xs" />
                  </button>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionPreference>
  )
}
