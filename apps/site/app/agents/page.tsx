import type { Metadata } from 'next'
import Link from 'next/link'
import { IconBrandGithub, IconFileText, IconRobot, IconSparkles, IconTerminal } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CodeBlock } from '@/components/code-block'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'For AI editors',
  description:
    'Cursor, Claude Code, Codex, Aider. Install the shilp-sutra Agent Skill once. The library lives inside your editor.',
}

const tools = [
  { name: 'Claude Code', note: 'Anthropic agent. Skill loads natively.' },
  { name: 'Cursor', note: 'Skill works via Agent Skills standard.' },
  { name: 'Codex (Codex IDE)', note: 'Skill works via Agent Skills standard.' },
  { name: 'Aider', note: 'Reads llms.txt + AGENTS.md.' },
  { name: 'Continue.dev', note: 'Reads llms.txt directly.' },
  { name: 'Any other', note: 'agentskills.io-compatible tool.' },
]

const resources = [
  {
    icon: IconRobot,
    title: 'Agent Skill',
    body: 'Anthropic-format installable skill. Ships every setup playbook, component reference, theming guide, and troubleshoot tree.',
    cmd: 'curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash',
    href: 'https://github.com/devalok-design/shilp-sutra/tree/main/skills/shilp-sutra',
  },
  {
    icon: IconFileText,
    title: 'llms.txt',
    body: 'Concise cheatsheet — 660 lines. Setup playbook, peer-dep matrix, breaking changes, design rules. Inject this into any chat.',
    cmd: 'curl https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/packages/core/llms.txt',
    href: 'https://github.com/devalok-design/shilp-sutra/blob/main/packages/core/llms.txt',
  },
  {
    icon: IconFileText,
    title: 'llms-full.txt',
    body: 'Exhaustive per-component reference — 6,900 lines. Every prop, every variant, every example. Reach for this when llms.txt is too brief.',
    cmd: 'curl https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/packages/core/llms-full.txt',
    href: 'https://github.com/devalok-design/shilp-sutra/blob/main/packages/core/llms-full.txt',
  },
  {
    icon: IconTerminal,
    title: 'AGENTS.md',
    body: 'Agent contract at the repo root. The rules every coding agent should follow when working on shilp-sutra or a consumer of it.',
    cmd: 'cat AGENTS.md',
    href: 'https://github.com/devalok-design/shilp-sutra/blob/main/AGENTS.md',
  },
]

export default function AgentsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-ds-page-x py-ds-09">
          <PageHeader
            eyebrow="For your AI editor"
            title="Your AI editor already knows shilp-sutra."
            subtitle="One install. Four files. Every release."
            description="We ship an installable skill, two flavours of llms.txt, and AGENTS.md with every release so your coding agent doesn't guess at the library. Install once, never paste docs into chat again."
          />

          <div className="max-w-3xl rounded-ds-md border border-accent-7 bg-accent-2 p-ds-06 mb-ds-12">
            <div className="flex items-start gap-ds-04 mb-ds-04">
              <span className="w-10 h-10 rounded-ds-sm bg-accent-9 text-accent-fg flex items-center justify-center shrink-0">
                <IconSparkles size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                  One install
                </span>
                <span className="text-ds-md text-surface-fg font-semibold mt-ds-01">
                  Run this in your terminal.
                </span>
              </div>
            </div>
            <CodeBlock
              language="bash"
              code={`curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash`}
            />
          </div>

          <section className="mb-ds-12">
            <header className="flex flex-col gap-ds-02 max-w-2xl mb-ds-06">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                Works with
              </Text>
              <Text variant="heading-md" className="text-surface-fg">
                Every tool that speaks Agent Skills.
              </Text>
            </header>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-03">
              {tools.map((t) => (
                <li
                  key={t.name}
                  className="flex flex-col gap-ds-01 p-ds-04 rounded-ds-md border border-surface-border-subtle bg-surface-raised"
                >
                  <Text variant="body-sm" className="text-surface-fg">
                    {t.name}
                  </Text>
                  <Text variant="body-xs" className="text-surface-fg-subtle">
                    {t.note}
                  </Text>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <header className="flex flex-col gap-ds-02 max-w-2xl mb-ds-06">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                What ships in the box
              </Text>
              <Text variant="heading-md" className="text-surface-fg">
                Four files. Pick the one your tool reads.
              </Text>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-ds-04">
              {resources.map((r) => (
                <Card key={r.title}>
                  <CardHeader>
                    <div className="flex items-center gap-ds-03">
                      <span className="w-9 h-9 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center">
                        <r.icon size={16} />
                      </span>
                      <CardTitle className="text-[length:var(--typo-heading-sm-size)]">{r.title}</CardTitle>
                    </div>
                    <CardDescription>{r.body}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-ds-03">
                    <pre className="px-ds-03 py-ds-03 rounded-ds-sm border border-surface-border-subtle bg-surface-overlay overflow-x-auto text-ds-xs font-mono text-surface-fg whitespace-pre">
                      <code>{r.cmd}</code>
                    </pre>
                    <Link href={r.href} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" startIcon={<IconBrandGithub size={14} />}>
                        View on GitHub
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-ds-12 pt-ds-08 border-t border-surface-border-subtle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-06">
              <div className="flex flex-col gap-ds-02">
                <Text variant="label-sm" className="text-surface-fg-subtle">
                  Why this exists
                </Text>
                <Text variant="heading-sm" className="text-surface-fg">
                  The library outpaces training data.
                </Text>
                <Text variant="body-sm" className="text-surface-fg-muted">
                  Coding agents trained pre-2026 hallucinate component APIs that never existed.
                  Skill + llms.txt give your agent the current shape of the library — including
                  what changed in the last release.
                </Text>
              </div>
              <div className="flex flex-col gap-ds-02">
                <Text variant="label-sm" className="text-surface-fg-subtle">
                  Spec
                </Text>
                <Text variant="heading-sm" className="text-surface-fg">
                  Built on the open standard.
                </Text>
                <Text variant="body-sm" className="text-surface-fg-muted">
                  The skill follows the{' '}
                  <Link
                    href="https://agentskills.io/specification"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-surface-fg"
                  >
                    agentskills.io specification
                  </Link>
                  . Any tool that adopts the standard reads our skill the same way.
                </Text>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
