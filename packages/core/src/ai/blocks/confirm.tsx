'use client'

import * as React from 'react'

import { Button } from '../../ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../ui/collapsible'
import { cn } from '../../ui/lib/utils'
import type { BlockComponentProps, ConfirmBlockData } from '../types'

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
    <div
      className={cn(
        confidence === 'low' && 'border-l-2 border-warning-7 pl-3',
      )}
    >
      {data.description && (
        <p className="text-ds-sm text-surface-fg-muted mb-3">
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
              className="text-ds-xs text-surface-fg-subtle underline cursor-pointer"
            >
              Why this action?
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-ds-sm text-surface-fg-muted mt-2 p-3 bg-surface-raised rounded-surface">
              {data.rationale}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
})

ConfirmBlock.displayName = 'ConfirmBlock'

export { ConfirmBlock }
