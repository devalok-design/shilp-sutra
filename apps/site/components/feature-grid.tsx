import { IconLayoutGrid, IconPalette, IconShield, IconUsers } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CARD_RESTING } from '@/lib/card-recipe'

/**
 * Three pillars + one builder promise. Per docs/copy/shilp-sutra-copy-context.md §3 + §14.
 *
 * Pillars (§3) — the three the doc names, and only these three:
 *   1. Be yourself      — customisability is the headline
 *   2. Thought through  — craft shown, not claimed
 *   3. Real-scale       — full pages, not toys
 *
 * Promise (§4) — "For builders, by builders" is the audience line, NOT a
 * pillar. It renders as a distinct card below the pillar row so the
 * "Three pillars. One promise." heading counts true.
 *
 * Agent angle lives in <AgentCallout /> below this section, not here.
 */
const pillars = [
  {
    icon: IconPalette,
    title: 'Your brand, everywhere',
    body: "Set one colour and every button, badge, card, and form recolours across light and dark. CSS variables carry it, so there's no config file and no list of hex codes to keep in sync.",
  },
  {
    icon: IconShield,
    title: 'The tedious parts, handled',
    body: "Keyboard navigation, screen-reader labels, focus traps, roving tabindex, dismissable popovers, visible focus rings. The accessibility work lives inside every component, so you don't rewire it on each screen.",
  },
  {
    icon: IconLayoutGrid,
    title: 'Real production components',
    body: 'Dashboards, settings, pricing, sign-up, data tables, toasts. The full set a shipping product needs, ready to drop in.',
  },
] as const

const promise = {
  icon: IconUsers,
  title: 'We build on it too',
  body: "shilp-sutra runs Devalok's own products: Karm, Devalok Hiring, BharatTools, and Gurukul. One library, one team maintaining it, shaped by shipping real software.",
} as const

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col items-center gap-ds-03 max-w-3xl mx-auto text-center">
          <Text variant="heading-xl" className="text-surface-fg">
            Built to ship real products.
          </Text>
        </div>

        {/* The three pillars — one clean row on desktop. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-ds-08 gap-y-ds-07">
          {pillars.map((f) => (
            <div key={f.title} className="flex flex-col gap-ds-02">
              <div className="flex items-center gap-ds-02">
                <f.icon size={18} className="text-accent-11 shrink-0" />
                <h3 className="text-ds-md text-surface-fg font-semibold">{f.title}</h3>
              </div>
              <p className="text-ds-sm text-surface-fg-subtle">{f.body}</p>
            </div>
          ))}
        </div>

        {/* The one promise — set apart from the pillars as its own card. */}
        <div className={`${CARD_RESTING} flex flex-col gap-ds-03 sm:flex-row sm:items-center sm:gap-ds-06`}>
          <div className="flex items-center gap-ds-02 sm:w-64 sm:shrink-0">
            <promise.icon size={18} className="text-accent-11 shrink-0" />
            <h3 className="text-ds-md text-surface-fg font-semibold">{promise.title}</h3>
          </div>
          <p className="text-ds-sm text-surface-fg-subtle sm:flex-1">{promise.body}</p>
        </div>
      </div>
    </section>
  )
}
