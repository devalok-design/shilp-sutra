import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { BrahmaBackdrop } from './brahma-backdrop'
import { CopyInstallButton } from './copy-install-button'
import { TrackedLink } from './tracked-link'

export function Hero() {
  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden">
      <BrahmaBackdrop />
      {/* Content sits in a left column; the Brahma identity composition owns the
          right. pt clears the floating pill (~70–80px). */}
      <div className="relative z-10 mx-auto flex w-full max-w-[96rem] flex-col px-page-x pt-ds-11 pb-ds-10 md:pt-ds-13 md:pb-ds-12">
        <div className="flex flex-col items-center gap-ds-06 text-center md:gap-ds-07 lg:max-w-[40rem] lg:items-start lg:text-left">
          <h1 className="font-display text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] tracking-[var(--typo-heading-2xl-tracking)] text-surface-fg text-balance hero-rise" style={{ ['--hero-delay' as string]: '4450ms' } as React.CSSProperties}>
            A design system that takes{' '}
            <span className="text-accent-11">your brand&apos;s shape.</span>
          </h1>
          <Text variant="body-lg" className="max-w-2xl text-pretty text-surface-fg hero-rise" style={{ ['--hero-delay' as string]: '4600ms' } as React.CSSProperties}>
            Pick one colour and your whole interface matches it. Buttons, cards, forms, light and
            dark. Install with one prompt and start building.
          </Text>
          <div className="mt-ds-03 flex w-full max-w-sm flex-col gap-ds-03 sm:w-auto sm:max-w-none sm:flex-row hero-rise" style={{ ['--hero-delay' as string]: '4750ms' } as React.CSSProperties}>
            <CopyInstallButton />
            <TrackedLink
              href="/theming"
              className="w-full sm:w-auto"
              event="cta_click"
              eventProps={{ cta: 'make-it-yours', location: 'hero' }}
            >
              <Button
                variant="soft"
                size="lg"
                className="w-full sm:w-auto"
                endIcon={<IconArrowRight size={18} />}
              >
                Make it yours
              </Button>
            </TrackedLink>
          </div>
          {/* Trust chips — layman signals that matter for a DS; no slop. */}
          <ul className="mt-ds-08 flex w-full flex-wrap items-center justify-center gap-x-ds-03 gap-y-ds-02 text-ds-base text-surface-fg-muted lg:justify-start hero-rise" style={{ ['--hero-delay' as string]: '4880ms' } as React.CSSProperties}>
            {['120+ components', 'WCAG-AA accessible', 'MIT · open source', 'React 19 + Tailwind 4'].map(
              (chip, i) => (
                <li key={chip} className="inline-flex items-center gap-ds-03 whitespace-nowrap">
                  {i > 0 && (
                    <span aria-hidden className="text-surface-fg-subtle/50">
                      ·
                    </span>
                  )}
                  {chip}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
