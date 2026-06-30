'use client'

import * as React from 'react'

import { CodeBlock } from '../code-block'

interface ResultActionsProps {
  css: string
}

/**
 * Manual-path buttons: CSS copy + share URL. The headline "Copy AI agent
 * prompt" CTA moved to the hero (AgentPromptHero) — these are the fallbacks
 * for users who want to wire the theme by hand.
 */
export function ResultActions({ css }: ResultActionsProps) {
  const [cssState, setCssState] = React.useState<'idle' | 'copied'>('idle')
  const [shareState, setShareState] = React.useState<'idle' | 'copied'>('idle')

  const copy = async (
    text: string,
    setState: React.Dispatch<React.SetStateAction<'idle' | 'copied'>>,
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
      setTimeout(() => setState('idle'), 1500)
    } catch {
      // clipboard blocked — no fallback noise
    }
  }

  return (
    <div className="flex flex-col gap-ds-04">
      <div className="flex flex-wrap items-center gap-ds-03">
        <button
          type="button"
          onClick={() => copy(css, setCssState)}
          className="inline-flex items-center gap-ds-02 rounded-control border border-surface-border-strong bg-surface-2 px-ds-04 py-ds-02 text-ds-sm font-medium text-surface-fg hover:bg-surface-3"
        >
          {cssState === 'copied' ? 'Copied' : 'Copy CSS'}
        </button>
        <button
          type="button"
          onClick={() => copy(window.location.href, setShareState)}
          className="inline-flex items-center gap-ds-02 rounded-control border border-surface-border-subtle bg-surface-2 px-ds-04 py-ds-02 text-ds-sm font-medium text-surface-fg-muted hover:text-surface-fg hover:bg-surface-3"
        >
          {shareState === 'copied' ? 'Share URL copied' : 'Copy share URL'}
        </button>
      </div>
      <CodeBlock code={css} language="css" />
    </div>
  )
}
