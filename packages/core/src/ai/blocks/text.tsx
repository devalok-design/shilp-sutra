'use client'

import * as React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '../../ui/lib/utils'
import type { BlockComponentProps } from '../types'

const TextBlock = React.memo(function TextBlock({
  data,
  confidence,
}: BlockComponentProps<{ content: string }>) {
  return (
    <div
      className={cn(
        'prose prose-sm',
        'text-surface-fg',
        'prose-headings:text-surface-fg',
        'prose-a:text-accent-11 prose-a:underline',
        'prose-code:text-accent-11 prose-code:bg-surface-raised prose-code:rounded prose-code:px-1',
        'prose-strong:text-surface-fg',
        confidence === 'low' && 'border-l-2 border-warning-7 pl-3',
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{data.content}</Markdown>
    </div>
  )
})

TextBlock.displayName = 'TextBlock'

export { TextBlock }
