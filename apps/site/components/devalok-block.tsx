import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

/**
 * About-Devalok band. Per docs/copy/shilp-sutra-copy-context.md §5 — who
 * Devalok is + where designers fit. Deliberately a FIXED-DARK panel (same in
 * light and dark) so it reads as a distinct, Devalok-branded moment carrying
 * the studio's own identity, not the site's theme.
 */
export function DevalokBlock() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
      <div className="relative overflow-hidden rounded-surface bg-[oklch(0.17_0.008_190)] px-ds-06 py-ds-09 text-white sm:px-ds-09 sm:py-ds-10">
        <div className="relative flex max-w-3xl flex-col gap-ds-06">
          <img
            src="/brand/devalok/wordmark-white.webp"
            alt="Devalok"
            className="h-10 w-auto self-start"
          />

          <div className="flex flex-col gap-ds-04">
            <Text variant="heading-lg" className="text-white">
              A studio that ships its own tools.
            </Text>
            <div className="grid gap-ds-06 md:grid-cols-2">
              <Text variant="body-md" className="text-white/70">
                Devalok is a design and strategy studio in Bharat, a brand-craft house behind Karm
                and our other tools. Shilp Sutra is that studio infrastructure, made public.
              </Text>
              <Text variant="body-md" className="text-white/70">
                Designers are builders too. It hands you the base layer, so your hours go to motion,
                illustration, and voice, not rebuilding the fifth Button this year.
              </Text>
            </div>
          </div>

          <div>
            <Link href="https://devalok.in" target="_blank" rel="noreferrer">
              <Button
                size="lg"
                endIcon={<IconArrowUpRight size={16} />}
                className="bg-white text-[oklch(0.2_0_0)] hover:bg-white/90"
              >
                More about Devalok
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
