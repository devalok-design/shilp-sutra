'use client'

import * as React from 'react'

import { CodeBlock } from '../code-block'

interface AgentPromptHeroProps {
  prompt: string
}

/**
 * Hero CTA on the /themer/result page. The pasteable AI-agent prompt is now
 * the primary path; manual CSS paste lives below as the by-hand fallback.
 */
export function AgentPromptHero({ prompt }: AgentPromptHeroProps) {
  const [copied, setCopied] = React.useState(false)
  const [showPrompt, setShowPrompt] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard blocked — no fallback noise
    }
  }

  return (
    <section
      aria-label="One-prompt setup for AI agents"
      className="relative overflow-hidden rounded-surface border border-accent-7 bg-linear-to-br from-accent-2 via-surface-2 to-accent-3 p-ds-06 md:p-ds-08"
    >
      <div className="flex flex-col gap-ds-05 max-w-3xl">
        <h2 className="text-ds-3xl md:text-ds-4xl font-semibold text-surface-fg leading-tight text-balance">
          Paste it. Ship it.
        </h2>

        <p className="text-ds-md text-surface-fg-muted leading-relaxed max-w-2xl">
          Your AI editor installs shilp-sutra, applies this theme, and verifies the result.
        </p>

        <div className="flex flex-wrap items-center gap-ds-03">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-ds-02 rounded-control bg-accent-9 px-ds-06 py-ds-04 text-ds-md font-semibold text-accent-fg shadow-raised hover:bg-accent-10 transition-colors"
          >
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
          <button
            type="button"
            onClick={() => setShowPrompt((v) => !v)}
            className="text-ds-sm text-surface-fg-muted hover:text-surface-fg underline underline-offset-2"
          >
            {showPrompt ? 'Hide' : 'Show prompt'}
          </button>
        </div>

        {showPrompt && (
          <div className="mt-ds-02">
            <CodeBlock code={prompt} language="markdown" />
          </div>
        )}
      </div>
    </section>
  )
}
