'use client'

import { IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'

import { Icon } from '../../ui/icon'
import { cn } from '../../ui/lib/utils'

export interface BlockShellProps {
  confidence?: 'high' | 'medium' | 'low'
  className?: string
  children: React.ReactNode
}

/**
 * Shared wrapper for AI block renderers. Owns the low-confidence treatment so it
 * lives in ONE place instead of a copy-pasted rail across every block.
 *
 * Low confidence = a faint warning wash (`bg-warning-2`, the DS "Subtle
 * background" step) + a "Low confidence" chip pinned top-right. NOT a colored
 * left rail (the AI tell removed from Card in v0.44.0). `pt-ds-07` reserves
 * clearance so the chip never overlaps content in prose/table blocks.
 */
const BlockShell = React.memo(function BlockShell({
  confidence,
  className,
  children,
}: BlockShellProps) {
  const low = confidence === 'low'
  return (
    <div
      data-confidence={confidence}
      className={cn(
        low && 'relative rounded-surface bg-warning-2 p-ds-04 pt-ds-07',
        className,
      )}
    >
      {low && (
        <span className="absolute right-ds-03 top-ds-03 inline-flex items-center gap-1 rounded-pill bg-warning-3 px-ds-02 py-px text-ds-xs font-semibold text-warning-11">
          <Icon icon={IconAlertTriangle} size="xs" aria-hidden />
          Low confidence
        </span>
      )}
      {children}
    </div>
  )
})

BlockShell.displayName = 'BlockShell'

export { BlockShell }
