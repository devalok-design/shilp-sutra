import { Text } from '@devalok/shilp-sutra/ui/text'

/**
 * "Why this, not shadcn" — the wedge, in one 10-second scan, sitting right
 * under the hero. Content is the wedge from
 * docs/copy/shilp-sutra-copy-context.md §2: shadcn ships you its look; this
 * recolours to yours. Three concrete differentiators, no marketing verbs.
 *
 * Server component — no interactivity.
 */
const differences = [
  {
    index: '01',
    title: 'One colour in, everything out.',
    body: 'Set a single hue. Every component recolours across light, dark, hover, pressed, and focus. No theme provider, no re-render — CSS-vars carry it.',
  },
  {
    index: '02',
    title: 'OKLCH ramps, generated.',
    body: 'Ramps build themselves from that one hue, perceptually even. A step-9 pink weighs the same as a step-9 indigo. No spreadsheet of hex codes.',
  },
  {
    index: '03',
    title: 'Surfaces that survive it.',
    body: 'Semantic surface layers, checked by a CI audit on every PR. Cards never sit on the page background; dialogs never collide with cards.',
  },
] as const

export function WhyNotShadcn() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col items-center gap-ds-03 max-w-3xl mx-auto text-center">
          <Text variant="heading-xl" className="text-surface-fg">
            shadcn looks like shadcn. This looks like you.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-ds-08 gap-y-ds-07">
          {differences.map((d) => (
            <div
              key={d.index}
              className="flex flex-col gap-ds-02 border-t border-surface-border-subtle pt-ds-04"
            >
              <Text variant="label-sm" className="text-accent-11">
                {d.index}
              </Text>
              <h3 className="text-ds-md text-surface-fg font-semibold">{d.title}</h3>
              <p className="text-ds-sm text-surface-fg-subtle">{d.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
