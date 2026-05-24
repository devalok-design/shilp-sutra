import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { AuroraBloom } from '@/components/aurora-bloom'

export function Hero() {
  return (
    <section className="relative overflow-hidden isolate">
      <AuroraBloom />
      <div className="relative z-10 mx-auto max-w-4xl px-page-x pt-ds-10 pb-ds-09 md:pt-ds-13 md:pb-ds-12 lg:pt-[10rem] lg:pb-[8rem] flex flex-col items-center text-center gap-ds-05 md:gap-ds-06">
        <Text variant="label-md" className="text-surface-fg-subtle">
          From Devalok Studios
        </Text>
        <h1 className="text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] tracking-[var(--typo-heading-2xl-tracking)] text-surface-fg max-w-3xl text-balance">
          The library that
          <br className="hidden md:inline" />{' '}
          <span className="text-accent-11">looks like yours.</span>
        </h1>
        <Text variant="body-lg" className="text-surface-fg-muted max-w-2xl text-balance">
          Pick one colour. Watch every button, badge, card, and form match — light mode, dark
          mode, every screen — instantly. No spreadsheet of hex codes. No config files. Just your
          brand, everywhere.
        </Text>
        <div className="w-full max-w-sm sm:max-w-none sm:w-auto flex flex-col sm:flex-row gap-ds-03 mt-ds-03">
          <Link href="/theming" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">Try it on</Button>
          </Link>
          <Link href="/components" className="w-full sm:w-auto">
            <Button variant="soft" size="lg" className="w-full sm:w-auto" endIcon={<IconArrowRight size={18} />}>
              See what&apos;s inside
            </Button>
          </Link>
        </div>
        <div className="mt-ds-06 flex flex-wrap items-center justify-center gap-ds-04 text-ds-xs text-surface-fg-subtle">
          <span className="inline-flex items-center gap-ds-02">
            <span className="w-1.5 h-1.5 rounded-full bg-success-9" />
            v0.39 live
          </span>
          <span>·</span>
          <span>Open source · MIT</span>
          <span>·</span>
          <span>Free, forever</span>
          <span>·</span>
          <span>Built into your AI editor</span>
        </div>
      </div>
    </section>
  )
}
