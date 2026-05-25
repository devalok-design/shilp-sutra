'use client'

import * as React from 'react'

import { CodeBlock } from '../code-block'

interface ResultActionsProps {
  css: string
}

/**
 * Copy buttons + share link for the result page. Client island so the
 * surrounding result page can stay an RSC.
 */
export function ResultActions({ css }: ResultActionsProps) {
  const [copyState, setCopyState] = React.useState<'idle' | 'copied'>('idle')
  const [shareState, setShareState] = React.useState<'idle' | 'copied'>('idle')

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(css)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1500)
    } catch {
      // clipboard may be blocked — no fallback noise
    }
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-ds-04">
      <div className="flex flex-wrap items-center gap-ds-03">
        <button
          type="button"
          onClick={copyCss}
          className="inline-flex items-center gap-ds-02 rounded-control bg-accent-9 px-ds-04 py-ds-02 text-ds-sm font-medium text-accent-fg hover:bg-accent-10"
        >
          {copyState === 'copied' ? '✓ Copied' : 'Copy CSS'}
        </button>
        <button
          type="button"
          onClick={copyShareUrl}
          className="inline-flex items-center gap-ds-02 rounded-control border border-surface-border-subtle bg-surface-2 px-ds-04 py-ds-02 text-ds-sm font-medium text-surface-fg hover:bg-surface-3"
        >
          {shareState === 'copied' ? '✓ Share URL copied' : 'Copy share URL'}
        </button>
      </div>
      <CodeBlock code={css} language="css" />
    </div>
  )
}
