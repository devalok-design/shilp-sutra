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
        {/* The lockup sits to the RIGHT of the card at lg and up. Below lg it
            stays above the copy — a 10rem mark dropped under a paragraph on a
            phone reads as a stray footer rather than a signature.
            The gap is Setu's clear-space rule (logo.clear-space): assets ship
            trimmed to their bounding box, so at least one cap-height of
            breathing room on every side is the layout's job and is never baked
            into the file. */}
        <div className="relative flex flex-col gap-ds-07 lg:flex-row lg:items-start lg:justify-between lg:gap-ds-09">
          {/* 772px source rendered at 160px — 4.8x density, so 4x the previous
              size costs nothing in sharpness. width/height are set so the box is
              reserved before the image decodes and the copy cannot shift. */}
          <img
            src="/brand/devalok/wordmark-white.webp"
            alt="Devalok"
            width={160}
            height={160}
            className="h-40 w-auto shrink-0 self-start lg:order-last"
          />

          <div className="flex max-w-3xl flex-col gap-ds-06">
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
                  Designers are builders too. It hands you the base layer, so your hours go to
                  motion, illustration, and voice, not rebuilding the fifth Button this year.
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
      </div>
    </section>
  )
}
