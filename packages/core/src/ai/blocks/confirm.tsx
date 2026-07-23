'use client'

import * as React from 'react'

import { Button } from '../../ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../ui/collapsible'
import type { BlockComponentProps, ConfirmBlockData } from '../types'
import { BlockShell } from './block-shell'

const ConfirmBlock = React.memo(function ConfirmBlock({
  data,
  confidence,
  onAction,
}: BlockComponentProps<ConfirmBlockData>) {
  const handleConfirm = React.useCallback(() => {
    onAction?.(data.actionId, 'confirm')
  }, [data.actionId, onAction])

  const handleCancel = React.useCallback(() => {
    onAction?.(data.actionId, 'cancel')
  }, [data.actionId, onAction])

  return (
    <BlockShell confidence={confidence}>
      {data.description && (
        <p className="text-body-sm text-surface-fg-muted mb-3">
          {data.description}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="solid"
          color={data.destructive ? 'error' : undefined}
          onClick={handleConfirm}
        >
          {data.label}
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {data.rationale && (
        <Collapsible className="mt-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="text-caption text-surface-fg-subtle underline cursor-pointer"
            >
              Why this action?
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-body-sm text-surface-fg-muted mt-2 p-3 bg-surface-raised rounded-surface">
              {data.rationale}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}
    </BlockShell>
  )
})

ConfirmBlock.displayName = 'ConfirmBlock'

export { ConfirmBlock }
