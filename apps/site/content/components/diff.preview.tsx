'use client'

import { Diff } from '@devalok/shilp-sutra/composed/diff'

const BEFORE = `function greet(name) {
  console.log("Hi " + name)
  return true
}`

const AFTER = `function greet(name: string) {
  console.log(\`Namaste \${name}\`)
  return { ok: true }
}`

export function DiffHero() {
  return <Diff before={BEFORE} after={AFTER} mode="inline" granularity="line" />
}

export function DiffVariants() {
  return (
    <div className="flex flex-col gap-ds-06">
      <Block title="split (side-by-side)">
        <Diff before={BEFORE} after={AFTER} mode="split" beforeLabel="main" afterLabel="branch" />
      </Block>
      <Block title="word granularity (prose)">
        <Diff
          before="Craft is slower because it carries intention."
          after="Craft is slower, but it carries intention and care."
          granularity="word"
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
