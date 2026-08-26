import { IconLayoutGrid, IconPalette, IconShield, IconUsers } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

/**
 * "Built to ship real products" — three pillars as cards + one promise card.
 * Per docs/copy/shilp-sutra-copy-context.md §3/§4. Short, layman copy.
 */
const pillars = [
  {
    icon: IconPalette,
    title: 'Your brand, everywhere',
    body: 'Set one colour. Every button, card, and form recolours across light and dark. No config, no hex list.',
  },
  {
    icon: IconShield,
    title: 'The tedious parts, handled',
    body: 'Keyboard nav, screen-reader labels, focus rings. The accessibility work lives inside every component.',
  },
  {
    icon: IconLayoutGrid,
    title: 'Real production components',
    body: 'Dashboards, settings, pricing, tables, toasts. The full set a shipping product needs, ready to drop in.',
  },
] as const

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <Text variant="heading-xl" className="max-w-3xl text-surface-fg">
          Built to ship real products.
        </Text>

        <div className="grid grid-cols-1 gap-ds-05 md:grid-cols-3">
          {pillars.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-ds-04 rounded-surface border border-surface-border-subtle bg-surface-panel p-ds-06"
            >
              <span className="flex size-10 items-center justify-center rounded-control bg-accent-3 text-accent-11">
                <f.icon size={20} />
              </span>
              <div className="flex flex-col gap-ds-02">
                <h3 className="text-ds-md font-semibold text-surface-fg">{f.title}</h3>
                <p className="text-ds-sm text-surface-fg-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* The one promise — a distinct accent-tinted card. */}
        <div className="flex flex-col gap-ds-04 rounded-surface border border-accent-6 bg-accent-2 p-ds-06 sm:flex-row sm:items-center sm:gap-ds-06">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-accent-9 text-accent-fg">
            <IconUsers size={20} />
          </span>
          <div className="flex flex-col gap-ds-01">
            <h3 className="text-ds-md font-semibold text-surface-fg">We build on it too</h3>
            <p className="text-ds-sm text-surface-fg-muted">
              shilp-sutra runs Karm, our own studio tool. One library, one team, shaped by shipping
              real software.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
