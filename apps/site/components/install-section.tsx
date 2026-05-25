import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { InstallTabs } from './install-tabs'
import { CodeBlock } from './code-block'

const frameworks = [
  { name: 'Next.js (App Router)', slug: 'install-next-app-router' },
  { name: 'Next.js (Pages Router)', slug: 'install-next-pages' },
  { name: 'Vite + React', slug: 'install-vite' },
  { name: 'Astro', slug: 'install-astro' },
  { name: 'Remix', slug: 'install-remix' },
  { name: 'TanStack Start', slug: 'install-tanstack-start' },
] as const

export function InstallSection() {
  return (
    <section id="install" className="mx-auto max-w-4xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col gap-ds-03">
          <Text variant="label-md" className="text-surface-fg-subtle">
            Add it to your project
          </Text>
          <Text variant="heading-xl" className="text-surface-fg">
            Three lines. You&apos;re done.
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted max-w-2xl">
            No config files to read. No setup wizards. Pick your package manager, paste the
            line, add one import. Start using the library.
          </Text>
        </div>

        <div className="flex flex-col gap-ds-04">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            1. Install dependencies
          </Text>
          <InstallTabs />
        </div>

        <div className="flex flex-col gap-ds-04">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            2. Add one CSS import
          </Text>
          <CodeBlock
            language="css"
            code={`@import "tailwindcss";
@import "@devalok/shilp-sutra/css";`}
          />
        </div>

        <div className="flex flex-col gap-ds-04">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            3. Use a component
          </Text>
          <CodeBlock
            language="tsx"
            code={`import { Button } from '@devalok/shilp-sutra/ui/button'

export default function Page() {
  return <Button variant="soft">Hello, shilp-sutra</Button>
}`}
          />
        </div>

        <div className="rounded-control border border-surface-border bg-surface-raised p-ds-06 flex flex-col gap-ds-04">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            On a specific framework?
          </Text>
          <Text variant="body-md" className="text-surface-fg">
            Pick yours below. Each guide is short, copy-paste, and tested on a real project.
          </Text>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-ds-02">
            {frameworks.map((fw) => (
              <li key={fw.slug}>
                <Link
                  href={`/docs/${fw.slug}`}
                  className="flex items-center justify-between gap-ds-03 rounded-control-inner px-ds-04 py-ds-03 hover:bg-surface-raised-hover transition-colors duration-fast-01 group"
                >
                  <Text variant="body-sm" className="text-surface-fg group-hover:text-surface-fg">
                    {fw.name}
                  </Text>
                  <IconArrowUpRight
                    size={14}
                    className="text-surface-fg-subtle group-hover:text-surface-fg transition-colors duration-fast-01"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
