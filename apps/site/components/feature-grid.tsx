import { IconLayoutGrid, IconPalette, IconShield, IconUsers } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CARD_RESTING } from '@/lib/card-recipe'

/**
 * Three pillars + one builder card. Per docs/copy/shilp-sutra-copy-context.md §3.
 *  1. Be yourself — customisability is the headline
 *  2. Thought through — craft shown, not claimed
 *  3. Real-scale — full pages, not toys
 *  4. For builders, by builders — audience promise
 *
 * Agent angle lives in <AgentCallout /> below this section, not here.
 */
const features = [
  {
    icon: IconPalette,
    title: 'Your brand. Live.',
    body: 'Pick one colour. Every button, badge, alert, and form across the entire library recolours. Light mode, dark mode, hover, pressed, focus, every state. No theme provider. No re-render. CSS-vars do the work.',
  },
  {
    icon: IconShield,
    title: 'The boring work, done.',
    body: 'Keyboard navigation, screen-reader labels, visible focus rings, forced-colors mode, touch targets sized for real fingers. Surface-layer hygiene runs in CI on every PR. The work that usually slips is the work that ships.',
  },
  {
    icon: IconLayoutGrid,
    title: 'Real pages, not toys.',
    body: 'Dashboards. Settings. Pricing. Sign-up. Data tables. Five full blocks ship today, more this beta. Real spacing, real copy, real states. The stuff your users actually use.',
  },
  {
    icon: IconUsers,
    title: 'For builders, by builders.',
    body: 'Indie devs, studio teams, designers reaching for code, coding agents. One library, one install. Devalok ships on it; so do Karm, Devalok Hiring, BharatTools, and Gurukul.',
  },
] as const

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-5xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col gap-ds-03 max-w-3xl">
          <Text variant="label-md" className="text-surface-fg-subtle">
            What&apos;s inside
          </Text>
          <Text variant="heading-xl" className="text-surface-fg">
            Three pillars. One promise.
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-06">
          {features.map((f) => (
            <article key={f.title} className={CARD_RESTING + ' flex flex-col gap-ds-03'}>
              <div className="w-9 h-9 rounded-control-inner bg-accent-3 text-accent-11 flex items-center justify-center">
                <f.icon size={18} />
              </div>
              <h3 className="text-ds-md text-surface-fg font-semibold">{f.title}</h3>
              <p className="text-ds-sm text-surface-fg-subtle">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
