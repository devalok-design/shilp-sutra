'use client'

import * as React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Alert } from '../../ui/alert'
import type { BlockComponentProps, ErrorBlockData } from '../types'
import { BlockShell } from './block-shell'

const ErrorBlock = React.memo(function ErrorBlock({
  data,
  confidence,
}: BlockComponentProps<ErrorBlockData>) {
  return (
    <BlockShell confidence={confidence}>
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
    </BlockShell>
  )
})

ErrorBlock.displayName = 'ErrorBlock'

export { ErrorBlock }
