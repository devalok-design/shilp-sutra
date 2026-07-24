import Link from 'next/link'
import { IconArrowRight, IconBook } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'

/**
 * Landing teaser for /agents. One-sentence pitch + primary CTA to the full
 * page, secondary CTA to the docs index. No duplicate install script — the
 * full pitch lives at /agents.
 */
export function AgentCallout() {
  return (
    <section className="mx-auto max-w-4xl px-page-x py-ds-12">
      <div className="rounded-surface border border-accent-7 bg-accent-2 p-ds-08 flex flex-col items-center gap-ds-05 text-center">
        <header className="flex flex-col items-center gap-ds-03">
          <h2 className="text-ds-xl text-surface-fg font-semibold">
            Your editor already knows the library.
          </h2>
          <p className="text-ds-md text-surface-fg-muted max-w-2xl">
            Install the Agent Skill once and Cursor, Claude Code, Codex, and Aider read every
            component, prop, and setup step straight from the source, so you stop pasting docs
            into a chat window.
          </p>
        </header>

        <footer className="flex flex-wrap items-center justify-center gap-ds-03 pt-ds-02">
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
