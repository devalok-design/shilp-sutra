import { IconCpu, IconLayersIntersect, IconRobot, IconUniverse } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

const features = [
  {
    icon: IconLayersIntersect,
    title: 'Tailwind 4, CSS-first',
    body: 'No JS preset. One CSS import wires the entire token system. Spacing is `--spacing-ds-*`, typography is `--text-ds-*` — namespaced so consumer Tailwind utilities never collide with the design system.',
  },
  {
    icon: IconCpu,
    title: 'RSC-safe by default',
    body: 'Per-component imports give the bundler the right hint. Layout and typography ship server-safe; interactive components live behind a `"use client"` boundary so Next.js App Router just works.',
  },
  {
    icon: IconRobot,
    title: 'Built for AI agents',
    body: 'Every release ships `llms.txt`, `llms-full.txt`, framework recipes, AGENTS.md, and an installable Agent Skill. Claude Code, Cursor, Codex, Aider — they all know what to do.',
  },
  {
    icon: IconUniverse,
    title: 'Designed in OKLCH',
    body: '12-step semantic ramps in perceptually-uniform color space. Dark mode is a real palette, not auto-inverted CSS. Forced-colors (Windows high-contrast) supported. Brand swap takes one ramp override.',
  },
] as const

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-5xl px-ds-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col gap-ds-03">
          <Text variant="label-md" className="text-surface-fg-subtle">
            What's inside
          </Text>
          <Text variant="heading-xl" className="text-surface-fg">
            Designed for craft. Built to scale.
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-06">
          {features.map((f) => (
            <article
              key={f.title}
              className="flex flex-col gap-ds-03 p-ds-06 rounded-ds-md bg-surface-raised border border-surface-border-subtle hover:border-surface-border transition-colors duration-fast-01"
            >
              <div className="w-9 h-9 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center">
                <f.icon size={18} />
              </div>
              <Text variant="heading-sm" className="text-surface-fg">
                {f.title}
              </Text>
              <Text variant="body-sm" className="text-surface-fg-muted">
                {f.body}
              </Text>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
