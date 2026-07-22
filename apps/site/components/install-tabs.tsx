'use client'

import { useState } from 'react'
import { CodeBlock } from './code-block'

type Manager = 'pnpm' | 'npm' | 'yarn' | 'bun'

const installCommands: Record<Manager, string> = {
  pnpm: `pnpm add @devalok/shilp-sutra framer-motion
pnpm add -D tailwindcss@^4 @tailwindcss/postcss
pnpm add -D @devalok/eslint-plugin-shilp-sutra   # lint rules + migration autofixes`,
  npm: `npm install @devalok/shilp-sutra framer-motion
npm install -D tailwindcss@^4 @tailwindcss/postcss
npm install -D @devalok/eslint-plugin-shilp-sutra   # lint rules + migration autofixes`,
  yarn: `yarn add @devalok/shilp-sutra framer-motion
yarn add -D tailwindcss@^4 @tailwindcss/postcss
yarn add -D @devalok/eslint-plugin-shilp-sutra   # lint rules + migration autofixes`,
  bun: `bun add @devalok/shilp-sutra framer-motion
bun add -d tailwindcss@^4 @tailwindcss/postcss
bun add -d @devalok/eslint-plugin-shilp-sutra   # lint rules + migration autofixes`,
}

const managers: Manager[] = ['pnpm', 'npm', 'yarn', 'bun']

export function InstallTabs() {
  const [active, setActive] = useState<Manager>('pnpm')

  return (
    <div className="flex flex-col gap-ds-03">
      <div role="tablist" aria-label="Package manager" className="flex items-center gap-ds-01 border-b border-surface-border-subtle">
        {managers.map((m) => {
          const isActive = m === active
          return (
            <button
              key={m}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActive(m)}
              className={[
                'px-ds-04 py-ds-02 text-ds-sm font-medium border-b-2 -mb-px transition-colors duration-fast-01',
                isActive
                  ? 'border-accent-9 text-surface-fg'
                  : 'border-transparent text-surface-fg-muted hover:text-surface-fg',
              ].join(' ')}
            >
              {m}
            </button>
          )
        })}
      </div>
      <CodeBlock code={installCommands[active]} language="bash" copyContext="install" copyMeta={{ manager: active }} />
    </div>
  )
}
