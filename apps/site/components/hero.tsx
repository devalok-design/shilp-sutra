import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { AuroraBloom } from '@/components/aurora-bloom'
import { SHILP_SUTRA_MINOR } from '@/lib/version'

export function Hero() {
  return (
    <section className="relative overflow-hidden isolate">
      <AuroraBloom />
      {/* pt accounts for floating pill (~70–80px). Aurora-bloom reaches up to the
          true top of the section so the pill sits *over* the bloom — magic stays. */}
      <div className="relative z-10 mx-auto max-w-4xl px-page-x pt-ds-12 pb-ds-09 md:pt-ds-13 md:pb-ds-12 lg:pt-[10rem] lg:pb-[8rem] flex flex-col items-center text-center gap-ds-05 md:gap-ds-06">
        <Text variant="label-md" className="text-surface-fg-muted">
          From{' '}
          <Link
            href="https://devalok.in"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 decoration-surface-border-subtle hover:decoration-accent-11 hover:text-accent-11 transition-colors duration-fast-01"
          >
            Devalok
          </Link>
          {' · '}Public beta v{SHILP_SUTRA_MINOR}
        </Text>
        <h1 className="text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] tracking-[var(--typo-heading-2xl-tracking)] text-surface-fg max-w-3xl text-balance">
          Your brand. Every component.
          <br className="hidden md:inline" />{' '}
          <span className="text-accent-11">Out of the box.</span>
        </h1>
        <Text variant="body-lg" className="text-surface-fg max-w-2xl text-balance">
          Pick one colour. Watch every button, badge, card, and form match instantly. Light mode,
          dark mode, every screen. No spreadsheet of hex codes. No config files. Just your brand,
          everywhere.
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
        {/* Trust chips. Below sm: 2-col grid so chips align cleanly; sm+: inline wrap with dots.
            Three capability-led chips per docs/copy/shilp-sutra-copy-context.md §10. */}
        <ul className="mt-ds-06 w-full max-w-2xl grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-ds-04 sm:gap-y-ds-02 gap-ds-02 text-ds-xs text-surface-fg-muted">
          <li className="inline-flex items-center justify-center gap-ds-02">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-success-9" />
            Powers Karm, Hiring + studio tools
          </li>
          <li className="inline-flex items-center justify-center gap-ds-02">
            <span aria-hidden className="hidden sm:inline text-surface-fg-subtle/60">·</span>
            WCAG-AA · forced-colors verified
          </li>
          <li className="inline-flex items-center justify-center gap-ds-02">
            <span aria-hidden className="hidden sm:inline text-surface-fg-subtle/60">·</span>
            119 components · 1,750+ tests
          </li>
        </ul>
      </div>
    </section>
  )
}
