'use client'

import { MarkdownViewer } from '@devalok/shilp-sutra/composed/markdown-viewer'

const DOC = `# Getting started

Pick **one colour** and every component follows. It works in _light_ and _dark_.

- Buttons, cards, forms
- Light and dark, out of the box
- One \`@import\` line

\`\`\`ts
import { Button } from "@devalok/shilp-sutra/ui/button"
\`\`\`

> Craft is slower because it carries intention.

[Read the docs](/docs)`

export function MarkdownViewerHero() {
  return (
    <div className="max-w-2xl">
      <MarkdownViewer content={DOC} />
    </div>
  )
}

export function MarkdownViewerVariants() {
  return (
    <div className="flex flex-col gap-ds-06">
      <Block title="compact">
        <MarkdownViewer compact content={'A **compact** render for inline notes and cells. Supports `code` and [links](/docs).'} />
      </Block>
      <Block title="table + list">
        <MarkdownViewer
          content={'| Token | Value |\n| --- | --- |\n| accent-9 | brand |\n| radius | 8px |\n\n1. First\n2. Second'}
        />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 rounded-control border border-surface-border-subtle bg-surface-panel p-ds-05">
      <span className="font-mono text-ds-xs text-surface-fg-subtle">{title}</span>
      {children}
    </div>
  )
}
