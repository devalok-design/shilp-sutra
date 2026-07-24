'use client'

/**
 * Primary hero CTA. Copies a ready-to-paste AI-editor prompt that installs and
 * wires up shilp-sutra, then confirms with an inline toast. Layman promise:
 * "one prompt to install" — paste into Cursor/Claude/Copilot and go.
 */

import { useEffect, useRef, useState } from 'react'
import { IconCheck, IconClipboard } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { track } from '@/lib/analytics'

const INSTALL_PROMPT = `Set up the shilp-sutra design system in this project.
1. Install it: npm i @devalok/shilp-sutra
2. In the global stylesheet, after \`@import "tailwindcss";\`, add: @import "@devalok/shilp-sutra/css";
3. Use its docs MCP at https://shilp-sutra.devalok.in/mcp to look up components and tokens.
Then build my UI with shilp-sutra components and theme everything from one accent colour.`

export function CopyInstallButton() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_PROMPT)
      setCopied(true)
      track('cta_click', { cta: 'copy-install-prompt', location: 'hero' })
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2600)
    } catch {
      // Clipboard blocked — no-op; the button simply doesn't confirm.
    }
  }

  return (
    <div className="relative w-full sm:w-auto">
      <Button
        size="lg"
        className="w-full sm:w-auto"
        onClick={copy}
        startIcon={copied ? <IconCheck size={18} /> : <IconClipboard size={18} />}
      >
        {copied ? 'Copied' : 'Copy install prompt'}
      </Button>

      {/* Inline toast — confirms + tells the user what to do with it. */}
      <div
        role="status"
        aria-live="polite"
        className={[
          'pointer-events-none absolute left-0 top-full z-10 mt-ds-02 w-max max-w-[min(20rem,90vw)]',
          'rounded-control border border-surface-border-subtle bg-surface-overlay px-ds-03 py-ds-02 text-ds-xs text-surface-fg shadow-overlay',
          'transition-all duration-fast-02 ease-out motion-reduce:transition-none',
          copied ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0',
        ].join(' ')}
      >
        Prompt copied — paste it into your AI editor (Cursor, Claude, Copilot).
      </div>
    </div>
  )
}
