'use client'

import * as React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../ui/lib/utils'
import { Alert } from '../../ui/alert'
import type { BlockComponentProps, ErrorBlockData } from '../types'

const ErrorBlock = React.memo(function ErrorBlock({
  data,
  confidence,
}: BlockComponentProps<ErrorBlockData>) {
  return (
    <div
      className={cn(
        confidence === 'low' && 'border-l-2 border-warning-7 pl-3',
      )}
    >
      <Alert color="error" variant="subtle" title={data.title}>
        <div className="prose prose-sm">
          <Markdown remarkPlugins={[remarkGfm]}>{data.message}</Markdown>
        </div>
      </Alert>
      {data.suggestion && (
        <p className="mt-2 text-ds-sm text-surface-fg-muted">
          {data.suggestion}
        </p>
      )}
    </div>
  )
})

ErrorBlock.displayName = 'ErrorBlock'

export { ErrorBlock }
