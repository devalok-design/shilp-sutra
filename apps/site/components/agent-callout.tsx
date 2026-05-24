import Link from 'next/link'
import { IconBook, IconSparkles } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { CodeBlock } from './code-block'

export function AgentCallout() {
  return (
    <section className="mx-auto max-w-4xl px-ds-page-x py-ds-12">
      <div className="rounded-ds-lg border border-accent-7 bg-accent-2 p-ds-08 flex flex-col gap-ds-05">
        <header className="flex items-start gap-ds-04">
          <div className="w-10 h-10 rounded-ds-sm bg-accent-9 text-accent-fg flex items-center justify-center shrink-0">
            <IconSparkles size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-ds-xs text-accent-11 uppercase tracking-wide">
              Install
            </span>
            <h2 className="text-ds-xl text-surface-fg font-semibold mt-ds-01">
              Teach your AI editor the library, in one line.
            </h2>
            <p className="text-ds-md text-surface-fg-muted max-w-2xl mt-ds-03">
              Run this once. Cursor, Claude Code, and Codex then know every component, every
              setup step, every gotcha. They write code that works the first time.
            </p>
          </div>
        </header>

        <CodeBlock
          language="bash"
          code={`curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash`}
        />

        <footer className="flex flex-wrap items-center justify-between gap-ds-03 pt-ds-02">
          <p className="text-ds-xs text-surface-fg-subtle">
            Installs to{' '}
            <code className="font-mono text-surface-fg">~/.claude/skills/shilp-sutra/</code>. Works
            in any editor that speaks the{' '}
            <Link
              href="https://agentskills.io/specification"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-surface-fg"
            >
              Agent Skills standard
            </Link>
            .
          </p>
          <Link href="/docs/install-vite">
            <Button variant="ghost" size="sm" startIcon={<IconBook size={14} />}>
              Prefer to install by hand?
            </Button>
          </Link>
        </footer>
      </div>
    </section>
  )
}
