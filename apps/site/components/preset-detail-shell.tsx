'use client'

import { useState } from 'react'
import { IconCheck, IconCode, IconCopy, IconEye, IconSparkles, IconTerminal2 } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

type Tab = 'preview' | 'code'

function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }
  return { copied, copy }
}

function CopyRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const { copied, copy } = useCopy()
  return (
    <div className="flex flex-col gap-ds-02">
      <div className="flex items-center gap-ds-02">
        <span className="text-surface-fg-subtle">{icon}</span>
        <Text variant="label-sm" className="text-surface-fg-subtle">{label}</Text>
      </div>
      <div className="flex items-stretch gap-ds-02">
        <code className="flex-1 overflow-x-auto rounded-control border border-surface-border-subtle bg-surface-overlay px-ds-03 py-ds-02 text-ds-xs font-mono text-surface-fg whitespace-pre">
          {value}
        </code>
        <Button
          variant="soft"
          size="sm"
          aria-label={`Copy: ${label}`}
          startIcon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          onClick={() => copy(value)}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}

export function PresetDetailShell({
  children,
  source,
  uses,
  installName,
}: {
  children: React.ReactNode
  source: string
  uses: string[]
  /** e.g. "@devalok/sidebar-app" */
  installName: string
}) {
  const [tab, setTab] = useState<Tab>('preview')
  const { copied, copy } = useCopy()

  const addCmd = `npx shadcn@latest add ${installName}`
  const registrySnippet = `"registries": {\n  "@devalok": "https://shilp-sutra.devalok.in/r/{name}.json"\n}`
  const mcpPrompt = `add the ${installName} preset`

  return (
    <div className="flex flex-col gap-ds-06">
      {/* Install panel — the hero action */}
      <section
        aria-label="Install"
        className="flex flex-col gap-ds-04 rounded-control border border-surface-border bg-surface-panel p-ds-05"
      >
        <Text variant="heading-xs" className="text-surface-fg">Install</Text>
        <CopyRow label="Add to your project" value={addCmd} icon={<IconTerminal2 size={14} />} />
        <CopyRow label="Or tell your AI agent" value={mcpPrompt} icon={<IconSparkles size={14} />} />

        <details className="group">
          <summary className="cursor-pointer list-none text-ds-sm text-surface-fg-muted hover:text-surface-fg">
            First time? Register the <code className="font-mono">@devalok</code> namespace once →
          </summary>
          <div className="mt-ds-03 flex flex-col gap-ds-03">
            <Text variant="body-sm" className="text-surface-fg-muted">
              Add this to your <code className="font-mono">components.json</code>, then
              <code className="font-mono"> shadcn add</code> works for every preset:
            </Text>
            <pre className="overflow-x-auto rounded-control border border-surface-border-subtle bg-surface-overlay p-ds-03 text-ds-xs font-mono text-surface-fg">
              <code>{registrySnippet}</code>
            </pre>
            <Text variant="body-sm" className="text-surface-fg-muted">
              Requires <code className="font-mono">@devalok/shilp-sutra</code> installed and its CSS
              imported (<code className="font-mono">@import &quot;@devalok/shilp-sutra/css&quot;</code>).
              Unstyled after install? Your CSS isn&apos;t wired — see the{' '}
              <a href="/docs/install-vite" className="text-accent-11 underline underline-offset-2">setup recipe</a>.
            </Text>
          </div>
        </details>
      </section>

      {/* Preview / Code */}
      <div className="flex flex-col gap-ds-04">
        <div className="flex items-center justify-between gap-ds-03 flex-wrap">
          <div
            role="tablist"
            aria-label="View"
            className="inline-flex items-center gap-ds-01 rounded-control border border-surface-border bg-surface-panel p-ds-01"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'preview'}
              onClick={() => setTab('preview')}
              className={[
                'inline-flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-control-inner text-ds-sm transition-colors duration-fast-01',
                tab === 'preview' ? 'bg-surface-overlay text-surface-fg shadow-raised' : 'text-surface-fg-muted',
              ].join(' ')}
            >
              <IconEye size={14} />
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'code'}
              onClick={() => setTab('code')}
              className={[
                'inline-flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-control-inner text-ds-sm transition-colors duration-fast-01',
                tab === 'code' ? 'bg-surface-overlay text-surface-fg shadow-raised' : 'text-surface-fg-muted',
              ].join(' ')}
            >
              <IconCode size={14} />
              Code
            </button>
          </div>

          {tab === 'code' && (
            <Button
              variant="ghost"
              size="sm"
              startIcon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              onClick={() => copy(source)}
            >
              {copied ? 'Copied' : 'Copy source'}
            </Button>
          )}
        </div>

        {tab === 'preview' ? (
          <div className="h-[30rem] overflow-hidden rounded-control border border-surface-border bg-surface-base">
            {children}
          </div>
        ) : (
          <pre className="max-h-[720px] overflow-x-auto rounded-control border border-surface-border bg-surface-overlay p-ds-05 text-ds-xs font-mono leading-relaxed text-surface-fg whitespace-pre">
            <code>{source}</code>
          </pre>
        )}

        {uses.length > 0 && (
          <div className="flex flex-wrap items-center gap-ds-02">
            <Text variant="label-sm" className="text-surface-fg-subtle">Uses:</Text>
            {uses.map((u) => (
              <span
                key={u}
                className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-surface-panel border border-surface-border-subtle text-ds-xs font-mono text-surface-fg-muted"
              >
                {u}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
