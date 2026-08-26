'use client'

import { Code } from '@devalok/shilp-sutra/ui/code'

export function CodeHero() {
  return (
    <p className="text-body-md text-surface-fg">
      Install with <Code>pnpm add @devalok/shilp-sutra</Code> to get started.
    </p>
  )
}

export function CodeVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title='variant="inline"'>
        <p className="text-body-md text-surface-fg">
          Pass <Code>loading={'{true}'}</Code> to show the spinner.
        </p>
      </Block>

      <Block title='variant="block"'>
        <Code variant="block">{`const greeting = "Hello, world!"
console.log(greeting)`}</Code>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-02">{children}</div>
    </div>
  )
}
