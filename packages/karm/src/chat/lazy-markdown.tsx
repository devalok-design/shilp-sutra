'use client'

import * as React from 'react'
import { markdownComponents } from './markdown-components'

// Dynamic import — react-markdown's transitive dep (decode-named-character-reference)
// calls document.createElement() at module scope. Static imports cause this to execute
// during Next.js SSR, crashing with "document is not defined". React.lazy + dynamic
// import() ensures the module only loads on the client when rendering.
const ReactMarkdown = React.lazy(() => import('react-markdown'))

export interface LazyMarkdownProps {
  children: string
  className?: string
}

/**
 * LazyMarkdown — SSR-safe markdown renderer.
 *
 * Renders raw text as fallback during SSR/Suspense, then hydrates with
 * full markdown rendering on the client. For streaming text this is
 * invisible — users see text appearing progressively either way.
 */
export function LazyMarkdown({ children, className }: LazyMarkdownProps) {
  return (
    <React.Suspense fallback={<div className={className}>{children}</div>}>
      <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>
    </React.Suspense>
  )
}
