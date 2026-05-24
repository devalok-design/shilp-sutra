import { IconBolt, IconHeart, IconPalette, IconSparkles } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

const features = [
  {
    icon: IconPalette,
    title: 'Your brand. Baked in.',
    body: 'Pick a colour. Every button, badge, alert, and form across the entire library matches — automatically. Light mode. Dark mode. Hover. Pressed. Focus. All of it.',
  },
  {
    icon: IconBolt,
    title: 'Fast pages, no shortcuts.',
    body: 'Every screen ships only what it needs. The bundles stay small. The first paint stays quick. The thing your users came to do stays the focus.',
  },
  {
    icon: IconSparkles,
    title: 'Your AI already knows it.',
    body: 'Cursor, Claude Code, and Codex come pre-trained on shilp-sutra. They write the right component, the first time, with the right props. One install command.',
  },
  {
    icon: IconHeart,
    title: 'Designed for human hands.',
    body: 'Keyboard navigation. Screen reader labels. Focus rings you can actually see. High-contrast mode. Touch targets sized for real fingers. We did the boring work so you don’t have to.',
  },
] as const

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-5xl px-ds-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col gap-ds-03 max-w-3xl">
          <Text variant="label-md" className="text-surface-fg-subtle">
            Why people stay
          </Text>
          <Text variant="heading-xl" className="text-surface-fg">
            The little things, done well.
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-06">
          {features.map((f) => (
            <article
              key={f.title}
              className="flex flex-col gap-ds-03 p-ds-06 rounded-ds-md bg-surface-raised border border-surface-border-subtle hover:border-accent-9 hover:bg-surface-raised-hover hover:shadow-floating hover:-translate-y-1 transition-[box-shadow,border-color,translate,background-color] duration-fast-02 ease-productive-standard"
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
