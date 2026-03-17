'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../ui/lib/utils'
import { springs } from '../ui/lib/motion'
import { useMotion } from '../motion/motion-provider'
import { Alert } from '../ui/alert'
import type { Block, BlockComponentProps } from './types'
import { useAICommand } from './ai-command-provider'

// Import all built-in blocks
import { TextBlock } from './blocks/text'
import { BlockTable } from './blocks/block-table'
import { ConfirmBlock } from './blocks/confirm'
import { SuccessBlock } from './blocks/success'
import { ErrorBlock } from './blocks/error'
import { InfoBlock } from './blocks/info'
import { LoadingBlock } from './blocks/loading'
import { DividerBlock } from './blocks/divider'
import { StatRowBlock } from './blocks/stat-row'

const BUILT_IN_BLOCKS: Record<string, React.ComponentType<BlockComponentProps<any>>> = {
  text: TextBlock,
  table: BlockTable,
  confirm: ConfirmBlock,
  success: SuccessBlock,
  error: ErrorBlock,
  info: InfoBlock,
  loading: LoadingBlock,
  divider: DividerBlock,
  stat_row: StatRowBlock,
}

function FallbackBlock({ data, blockId }: BlockComponentProps & { type: string }) {
  return (
    <Alert color="info" variant="subtle" title={`Unknown block type: ${blockId}`}>
      <pre className="mt-2 text-ds-xs whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </Alert>
  )
}

export interface BlockRendererProps {
  blocks: Block[]
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  customBlocks?: Record<string, React.ComponentType<BlockComponentProps<any>>>
  staggerDelay?: number
  className?: string
}

export function BlockRenderer({
  blocks,
  onAction,
  customBlocks,
  staggerDelay = 50,
  className,
}: BlockRendererProps) {
  const ctx = useAICommand()
  const { reducedMotion } = useMotion()

  // Merge custom blocks: prop wins over context
  const mergedCustomBlocks = React.useMemo(() => {
    const contextBlocks = ctx?.customBlocks ?? {}
    return { ...contextBlocks, ...customBlocks }
  }, [ctx?.customBlocks, customBlocks])

  // Resolve onAction: prop wins over context
  const resolvedOnAction = onAction ?? ctx?.onAction

  return (
    <div className={cn('flex flex-col gap-ds-04', className)}>
      {blocks.map((block, index) => {
        const Component =
          mergedCustomBlocks[block.type] ??
          BUILT_IN_BLOCKS[block.type] ??
          null

        const blockProps: BlockComponentProps<any> = {
          data: block.data,
          blockId: block.id,
          confidence: block.confidence,
          onAction: resolvedOnAction,
        }

        const content = Component ? (
          <Component {...blockProps} />
        ) : (
          <FallbackBlock {...blockProps} type={block.type} blockId={block.type} />
        )

        const key = block.id ?? `${block.type}-${index}`

        if (reducedMotion) {
          return <div key={key}>{content}</div>
        }

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.responsive, delay: index * (staggerDelay / 1000) }}
          >
            {content}
          </motion.div>
        )
      })}
    </div>
  )
}
