import Link from 'next/link'
import { IconSparkles } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CodeBlock } from './code-block'

export function AgentCallout() {
  return (
    <section className="mx-auto max-w-4xl px-ds-page-x py-ds-12">
      <div className="rounded-ds-lg border border-accent-6 bg-accent-2 p-ds-08 flex flex-col gap-ds-05">
        <div className="flex items-start gap-ds-04">
          <div className="w-10 h-10 rounded-ds-sm bg-accent-9 text-accent-fg flex items-center justify-center shrink-0">
            <IconSparkles size={20} />
          </div>
          <div className="flex flex-col gap-ds-02">
            <Text variant="label-md" className="text-accent-11">
              For the AI in your editor
            </Text>
            <Text variant="heading-md" className="text-surface-fg">
              Teach your AI the library, in one line.
            </Text>
            <Text variant="body-sm" className="text-surface-fg-muted max-w-2xl">
              Run this once. After that, Cursor, Claude Code, and Codex know every component,
              every setup step, every gotcha. They write code that actually works, the first
              time. No more pasting docs into chat.
            </Text>
          </div>
        </div>
        <CodeBlock
          language="bash"
          code={`curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash`}
        />
        <Text variant="body-xs" className="text-surface-fg-subtle">
          The skill installs locally to{' '}
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
        </Text>
      </div>
    </section>
  )
}
