import type { Metadata } from 'next'
import Link from 'next/link'
import { IconArrowRight, IconBrandGithub, IconFileText, IconPlug, IconRobot, IconTerminal } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CodeBlock } from '@/components/code-block'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { CLOSES, PRIZE, isOpen as isBuildathonOpen } from '@/lib/buildathon'

export const metadata: Metadata = {
  title: 'For AI editors',
  description:
    'Claude Code, Cursor, Codex, Aider. Install the shilp-sutra Agent Skill once and the library lives inside your editor. Current shape, current props, current gotchas. Built on the agentskills.io standard.',
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
    body: 'The router index. Setup playbook, peer-dep matrix, breaking changes, design rules, and pointers into per-component docs. Inject this into any chat.',
    cmd: 'curl https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/packages/core/llms.txt',
    href: 'https://github.com/devalok-design/shilp-sutra/blob/main/packages/core/llms.txt',
  },
  {
    icon: IconPlug,
    title: 'Hosted MCP',
    body: 'Live Model Context Protocol server. Your agent queries the current component APIs, tokens, and upgrade guidance on demand, over MCP, with no files to sync.',
    cmd: 'https://shilp-sutra.devalok.in/mcp',
    href: 'https://shilp-sutra.devalok.in/mcp',
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
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-5xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <PageHeader
            eyebrow="For your AI editor"
            title="Your AI editor already knows shilp-sutra."
            subtitle="One install. Every release."
            description="We ship an installable skill, an llms.txt router, a hosted MCP server, and AGENTS.md with every release so your coding agent doesn't guess at the library. Install once, never paste docs into chat again."
          />

          <div className="max-w-3xl rounded-control border border-accent-7 bg-accent-2 p-ds-06 mb-ds-12">
            <div className="flex items-start gap-ds-04 mb-ds-04">
              <span className="w-10 h-10 rounded-control-inner bg-accent-9 text-accent-fg flex items-center justify-center shrink-0">
                <IconTerminal size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-ds-md text-surface-fg font-semibold">
                  One install. Run this in your terminal.
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
                  className="flex flex-col gap-ds-01 p-ds-04 rounded-control border border-surface-border-subtle bg-surface-raised"
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
                    <div className="flex items-center gap-ds-02">
                      <r.icon size={16} className="text-accent-11 shrink-0" />
                      <CardTitle className="text-[length:var(--typo-heading-sm-size)]">{r.title}</CardTitle>
                    </div>
                    <CardDescription>{r.body}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-ds-03">
                    <pre className="px-ds-03 py-ds-03 rounded-control-inner border border-surface-border-subtle bg-surface-overlay overflow-x-auto text-ds-xs font-mono text-surface-fg whitespace-pre">
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
                  Skill + llms.txt give your agent the current shape of the library, including
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

          {/* Time-boxed: remove this section after the buildathon closes. */}
          {isBuildathonOpen() && (
            <section className="mt-ds-12 border-t border-surface-border-subtle pt-ds-09">
              <Text variant="label-sm" className="mb-ds-02 text-surface-fg-subtle">
                Running now
              </Text>
              <Text variant="heading-md" className="mb-ds-03 text-surface-fg">
                Your agent can enter you into the buildathon.
              </Text>
              <Text variant="body-md" className="mb-ds-05 max-w-2xl text-pretty text-surface-fg-muted">
                Build with Shilp Sutra is open to everyone, solo or team, until {CLOSES}. Build
                anything that runs on Shilp Sutra and solves a problem with real cause. The winner
                receives {PRIZE} worth of brand identity, GTM strategy, and ongoing support from
                Devalok. Once the MCP is connected, tell your agent to submit and it will collect
                your details, read them back, and file the entry after you confirm.
              </Text>
              <Link href="/buildathon">
                <Button variant="soft" endIcon={<IconArrowRight size={16} />}>
                  Rules, prize, and how to enter
                </Button>
              </Link>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
