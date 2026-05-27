import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Themer — shilp-sutra',
  description:
    'Make shilp-sutra look like your brand. Pick the path that fits where you are: brand colors in hand, an archetype to clone, a guided wizard, or just browsing.',
}

interface PersonaCard {
  href: string
  eyebrow: string
  title: string
  description: string
  cta: string
}

const PERSONAS: PersonaCard[] = [
  {
    href: '/themer/archetypes',
    eyebrow: 'I want it to look like…',
    title: 'Pick an archetype',
    description:
      "Clone the feel of a system you already trust. Linear's sharp + dense. Apple's soft + spacious. Stripe's balanced. Seven presets, side-by-side.",
    cta: 'Browse archetypes →',
  },
  {
    href: '/themer/brand',
    eyebrow: 'I have a brand',
    title: 'Use my brand color',
    description:
      'Drop in a hex, or dial OKLCH hue + chroma. We generate the full 12-step ramp and suggest an archetype that pairs with it.',
    cta: 'Paste a color →',
  },
  {
    href: '/themer/wizard',
    eyebrow: "I'm not sure yet",
    title: 'Walk me through it',
    description:
      "Five questions. We pick the archetype, density, shape, and motion for you, then drop you at a result page with the CSS to paste.",
    cta: 'Start the wizard →',
  },
  {
    href: '/themer/result?archetype=devalok&hue=340&chroma=0.19',
    eyebrow: 'Just exploring',
    title: 'Show me a result page',
    description:
      'Land on the same screen everyone else does: install commands, a CSS snippet to paste, a live preview, and a share URL. See what you ship away with.',
    cta: 'See a sample result →',
  },
]

export default function ThemerLandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-08">
            <PageHeader
              eyebrow="Themer"
              title="Make it look like you."
              subtitle="Four ways in. Same place to land."
              description="The Themer is one funnel with four entry doors. Pick the door that fits where you are right now — each path drops you at a result page with install commands, a CSS snippet, and a live preview."
            />

            <section
              aria-label="Themer entry points"
              className="grid grid-cols-1 md:grid-cols-2 gap-ds-04"
            >
              {PERSONAS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group flex flex-col gap-ds-03 rounded-surface border border-surface-border-subtle bg-surface-2 p-ds-06 transition-colors duration-fast-01 hover:border-accent-7 hover:bg-surface-3"
                >
                  <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                    {p.eyebrow}
                  </span>
                  <h2 className="text-ds-xl font-semibold text-surface-fg">{p.title}</h2>
                  <p className="text-ds-md text-surface-fg-muted leading-relaxed flex-1">
                    {p.description}
                  </p>
                  <span className="text-ds-sm font-medium text-accent-11 group-hover:underline underline-offset-2">
                    {p.cta}
                  </span>
                </Link>
              ))}
            </section>

            <section className="border-t border-surface-border-subtle pt-ds-08 flex flex-col gap-ds-03 max-w-2xl">
              <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                Under the hood
              </span>
              <h3 className="text-ds-lg font-semibold text-surface-fg">CSS variables. No JS theme provider.</h3>
              <p className="text-ds-md text-surface-fg-muted leading-relaxed">
                Whichever door you pick, you walk out with the same thing: a CSS block of role
                tokens + an OKLCH accent ramp. Paste into your global stylesheet. Every shilp-sutra
                component follows. Switch themes by toggling a class, or write{' '}
                <code className="font-mono text-ds-sm text-surface-fg">data-archetype="apple"</code>{' '}
                on the body and reload.
              </p>
              <div className="flex flex-wrap gap-ds-03 text-ds-sm mt-ds-02">
                <Link href="/docs/customize-brand" className="text-accent-11 underline underline-offset-2 hover:text-accent-12">
                  Customize-brand recipe
                </Link>
                <Link href="/theming" className="text-accent-11 underline underline-offset-2 hover:text-accent-12">
                  Power-user editor
                </Link>
                <Link href="/agents" className="text-accent-11 underline underline-offset-2 hover:text-accent-12">
                  AI agent setup
                </Link>
              </div>
            </section>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  )
}
