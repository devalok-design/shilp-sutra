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
          A design system that becomes
          <br className="hidden md:inline" />{' '}
          <span className="text-accent-11">your brand.</span>
        </h1>
        <Text variant="body-lg" className="text-surface-fg-muted max-w-2xl text-balance">
          119 accessible React components, OKLCH design tokens, and AI-agent setup recipes. Pick
          a hue in <Link href="/theming" className="text-surface-fg underline underline-offset-2">/theming</Link>{' '}
          and the whole library follows — perceptually balanced, light and dark, every variant.
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
        <div className="mt-ds-06 flex flex-wrap items-center justify-center gap-ds-04 text-ds-xs text-surface-fg-subtle">
          <span className="inline-flex items-center gap-ds-02">
            <span className="w-1.5 h-1.5 rounded-full bg-success-9" />
            v0.39 live on npm
          </span>
          <span>·</span>
          <span>MIT licensed</span>
          <span>·</span>
          <span>Ships with an installable Agent Skill</span>
        </div>
      </div>
    </section>
  )
}
