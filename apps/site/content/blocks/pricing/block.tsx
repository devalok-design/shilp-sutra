'use client'

import { IconCheck } from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

type Tier = {
  name: string
  price: string
  cadence: string
  blurb: string
  features: string[]
  cta: string
  featured?: boolean
}

const tiers: Tier[] = [
  {
    name: 'Studio',
    price: 'Free',
    cadence: 'forever',
    blurb: 'For solo founders and small teams shipping their first real brand.',
    features: [
      '119 accessible components',
      'OKLCH design tokens',
      'Agent Skill bundle (Claude / Cursor / Codex)',
      'MIT licensed source',
      'GitHub community support',
    ],
    cta: 'Install now',
  },
  {
    name: 'Atelier',
    price: '$24',
    cadence: 'per editor / month',
    blurb: 'For design and engineering teams who want shared brand presets and review tools.',
    features: [
      'Everything in Studio',
      'Shared brand presets across your org',
      'Figma library sync with code parity',
      'Token drift alerts on PRs',
      'Quarterly office hours with Devalok',
    ],
    cta: 'Start a trial',
    featured: true,
  },
  {
    name: 'Bespoke',
    price: 'Custom',
    cadence: 'engagement',
    blurb: 'For brands that need shilp-sutra extended for their stack. Design, dev, and decisions.',
    features: [
      'Everything in Atelier',
      'Custom component design + dev cycle',
      'Brand-system audit by Devalok',
      'Migration support from shadcn / MUI / Chakra',
      'Private Slack channel with the studio',
    ],
    cta: 'Talk to us',
  },
]

const faqs = [
  {
    q: 'Do I need the paid plan to use shilp-sutra in production?',
    a: 'No. Studio is free forever, MIT licensed, and identical to the components and tokens used internally at Devalok. Atelier and Bespoke add team workflows and direct support, not features.',
  },
  {
    q: 'How does brand-preset sharing work?',
    a: 'On Atelier, brand presets and the custom-brand exports from /theming sync across your org. Designers tweak the OKLCH ramp, engineers pull the latest CSS without copy-paste.',
  },
  {
    q: 'Will Bespoke fork the package?',
    a: 'No fork. We extend, never branch off. Custom work lands in your repo as a thin layer on top of @devalok/shilp-sutra, so upgrades stay clean and your patches survive.',
  },
] as const

export function PricingBlock() {
  return (
    <div className="flex flex-col gap-ds-12 py-ds-09">
      <header className="text-center max-w-2xl mx-auto flex flex-col gap-ds-03 px-page-x">
        <Text variant="label-md" className="text-surface-fg-subtle">
          Pricing
        </Text>
        <Text variant="heading-2xl" className="text-surface-fg">
          Start free. Pay only when the studio scales with you.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          Three tiers. The free one is the same one Devalok ships internally. No asterisks.
        </Text>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-ds-05 max-w-6xl mx-auto px-page-x w-full">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.featured ? 'border-accent-9 shadow-overlay relative' : ''}
          >
            {tier.featured && (
              <div className="absolute -top-3 left-ds-05">
                <Badge color="accent" variant="solid">Most studios pick this</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.blurb}</CardDescription>
              <div className="flex items-baseline gap-ds-02 mt-ds-04">
                <Text variant="heading-xl" className="text-surface-fg">
                  {tier.price}
                </Text>
                <Text variant="body-sm" className="text-surface-fg-subtle">
                  / {tier.cadence}
                </Text>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-ds-02">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-ds-03">
                    <IconCheck size={14} className="mt-[0.2em] text-accent-11 shrink-0" />
                    <span className="text-ds-sm text-surface-fg-subtle">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-ds-06">
                <Button
                  variant={tier.featured ? 'solid' : 'soft'}
                  size="lg"
                  fullWidth
                >
                  {tier.cta}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="max-w-2xl mx-auto px-page-x flex flex-col gap-ds-05">
        <Text variant="heading-md" className="text-surface-fg text-center">
          Honest questions, honest answers.
        </Text>
        <dl className="flex flex-col gap-ds-04">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised"
            >
              <dt>
                <Text variant="label-md" className="text-surface-fg">
                  {f.q}
                </Text>
              </dt>
              <dd className="mt-ds-02">
                <Text variant="body-sm" className="text-surface-fg-muted">
                  {f.a}
                </Text>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
