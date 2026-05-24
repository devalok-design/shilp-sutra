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
              For your AI coding agent
            </Text>
            <Text variant="heading-md" className="text-surface-fg">
              Install the skill. The agent does the rest.
            </Text>
            <Text variant="body-sm" className="text-surface-fg-muted max-w-2xl">
              Claude Code, Cursor, Codex, Aider, and any{' '}
              <Link
                href="https://agentskills.io/specification"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-surface-fg"
              >
                Agent Skills-compatible
              </Link>{' '}
              tool can install the shilp-sutra skill once and load setup playbooks, component
              APIs, theming patterns, and troubleshooting on demand — without you pasting context
              every prompt.
            </Text>
          </div>
        </div>
        <CodeBlock
          language="bash"
          code={`curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash`}
        />
        <Text variant="body-xs" className="text-surface-fg-subtle">
          Installs to <code className="font-mono text-surface-fg">~/.claude/skills/shilp-sutra/</code>.
          For project-scoped installs and full configuration, see the{' '}
          <Link
            href="https://github.com/devalok-design/shilp-sutra/tree/main/skills/shilp-sutra"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            skill repo
          </Link>
          .
        </Text>
      </div>
    </section>
  )
}
