'use client'

import * as React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import type { BlockComponentProps } from '../types'
import { BlockShell } from './block-shell'

const TextBlock = React.memo(function TextBlock({
  data,
  confidence,
}: BlockComponentProps<{ content: string }>) {
  return (
    <BlockShell
      confidence={confidence}
      className="prose prose-sm text-surface-fg prose-headings:text-surface-fg prose-a:text-accent-11 prose-a:underline prose-code:text-accent-11 prose-code:bg-surface-raised prose-code:rounded prose-code:px-1 prose-strong:text-surface-fg"
    >
      <Markdown remarkPlugins={[remarkGfm]}>{data.content}</Markdown>
    </BlockShell>
  )
})

TextBlock.displayName = 'TextBlock'

export { TextBlock }
