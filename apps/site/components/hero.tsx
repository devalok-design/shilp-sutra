import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-base via-surface-base to-surface-sunken" />
      <div className="mx-auto max-w-4xl px-ds-page-x pt-ds-13 pb-ds-12 md:pt-[10rem] md:pb-[8rem] flex flex-col items-center text-center gap-ds-06">
        <Text variant="label-md" className="text-surface-fg-subtle">
          Devalok Design &amp; Strategy Studios
        </Text>
        <h1 className="text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] tracking-[var(--typo-heading-2xl-tracking)] text-surface-fg max-w-3xl text-balance">
          A design system that just works,
          <br className="hidden md:inline" />{' '}
          <span className="text-surface-fg-muted">in code, in design, in production.</span>
        </h1>
        <Text variant="body-lg" className="text-surface-fg-muted max-w-2xl text-balance">
          Tailwind 4 CSS-first. React 19. 119 accessible components. OKLCH design tokens. Ships
          with AI-agent setup recipes and an installable Agent Skill — so onboarding, by humans
          and machines, takes minutes.
        </Text>
        <div className="flex flex-col sm:flex-row gap-ds-03 mt-ds-03">
          <Link href="#install">
            <Button size="lg">Install</Button>
          </Link>
          <Link href="/components">
            <Button variant="soft" size="lg" endIcon={<IconArrowRight size={18} />}>
              Browse components
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
