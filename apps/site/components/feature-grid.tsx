import { IconLayersIntersect, IconPalette, IconRobot, IconShieldCheck } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

const features = [
  {
    icon: IconPalette,
    title: 'Yours, in OKLCH',
    body: 'One accent ramp, twelve perceptually-uniform steps. Pick the hue in /theming and the whole library follows. Light and dark generate together — no auto-inversion, no broken contrast.',
  },
  {
    icon: IconLayersIntersect,
    title: 'Tailwind 4, CSS-first',
    body: 'One CSS import wires the entire token system. Spacing is `--spacing-ds-*`, typography is `--text-ds-*`. Namespaced so your project Tailwind utilities never collide with the design system.',
  },
  {
    icon: IconShieldCheck,
    title: 'RSC-safe per component',
    body: 'Each component ships at its own import path. Server-safe components (Text, Card, Container) stay on the server; interactive ones live behind a "use client" boundary the bundler honours.',
  },
  {
    icon: IconRobot,
    title: 'Agent-ready in one curl',
    body: 'llms.txt, llms-full.txt, framework recipes, AGENTS.md, and an installable Agent Skill ship in the npm tarball. Claude Code, Cursor, Codex, Aider — they know what to do.',
  },
] as const

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-5xl px-ds-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col gap-ds-03 max-w-3xl">
          <Text variant="label-md" className="text-surface-fg-subtle">
            Inside the package
          </Text>
          <Text variant="heading-xl" className="text-surface-fg">
            Thought through, top to bottom.
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
