import Link from 'next/link'
import { IconArrowRight, IconBook, IconSparkles } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'

/**
 * Landing teaser for /agents. One-sentence pitch + primary CTA to the full
 * page, secondary CTA to the docs index. No duplicate install script — the
 * full pitch lives at /agents.
 */
export function AgentCallout() {
  return (
    <section className="mx-auto max-w-4xl px-page-x py-ds-12">
      <div className="rounded-surface border border-accent-7 bg-accent-2 p-ds-08 flex flex-col gap-ds-05">
        <header className="flex items-start gap-ds-04">
          <div className="w-10 h-10 rounded-control-inner bg-accent-9 text-accent-fg flex items-center justify-center shrink-0">
            <IconSparkles size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-ds-xs text-accent-11 uppercase tracking-wide">
              Built for AI editors
            </span>
            <h2 className="text-ds-xl text-surface-fg font-semibold mt-ds-01">
              Your editor already knows the library.
            </h2>
            <p className="text-ds-md text-surface-fg-muted max-w-2xl mt-ds-03">
              Install the Agent Skill once. Cursor, Claude Code, Codex, Aider then write code
              that compiles the first time. Every component, every prop, every gotcha.
            </p>
          </div>
        </header>

        <footer className="flex flex-wrap items-center gap-ds-03 pt-ds-02">
          <Link href="/agents">
            <Button size="md" endIcon={<IconArrowRight size={14} />}>
              Set up your editor
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="ghost" size="md" startIcon={<IconBook size={14} />}>
              Install by hand
            </Button>
          </Link>
        </footer>
      </div>
    </section>
  )
}
