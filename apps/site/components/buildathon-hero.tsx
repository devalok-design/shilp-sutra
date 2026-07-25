'use client'

/**
 * BuildathonHero — the "Build with Shilp Sutra" key visual, adapted from the
 * Figma frame SSB-LinkedIn (node 125:5657) in "Shilp-Sutra | Visual Identity".
 *
 * The poster is a fixed 1920×1080 composition; this is the responsive reading of
 * it. What carries over exactly: the identity gradient (white → #C6EBE6 at 37.9%
 * → white on a 28.9° axis), the lime plate under the prize figure and the short
 * link, Vishwakarma bleeding off the bottom-right, and the ten-letterform
 * BUILDATHON display mark as the signature artifact.
 *
 * What deliberately differs from the poster:
 * - No QR code. On a page you are already at the destination.
 * - No full-bleed line grid. The poster's bg lines read as graph paper once
 *   they tile a scrolling page; the gradient and the deity carry the atmosphere.
 * - Vishwakarma binds to the brand accent tokens instead of the literal #33C9BF,
 *   so the deity recolours with the active preset. Body masses take accent-7
 *   (the ramp step nearest #33C9BF) and the carved line-work accent-2, holding
 *   the poster's duotone while staying light enough that the dark letterforms
 *   crossing the figure keep their silhouette.
 *
 * Every string is visible without JS. Motion is opt-in via prefers-reduced-motion
 * and only ever animates transform, never the existence of content.
 */

import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { BuildathonLettering } from './buildathon-lettering'
import { TrackedLink } from './tracked-link'
import { FORM_URL, PRIZE, DATES, CLOSES } from '@/lib/buildathon'

const VishwakarmaArt = dynamic(() => import('./vishwakarma-art').then((m) => m.VishwakarmaArt), {
  ssr: false,
})

// Fixed identity colours from the Figma file. The lime plate is a flat brand
// colour, not a token — ink on it measures 14.34:1 (setu_check, 2026-07-25).
const LIME = '#D5EF72'
const LIME_INK = '#131514'

/**
 * The poster gradient, on its 28.9° axis with the stops at the authored offsets.
 * The source art hardcodes #FFFFFF → #C6EBE6 → #FFFFFF; here the stops are TOKENS,
 * so the canvas follows the active brand preset and the theme the same way the
 * artwork does. #C6EBE6 is oklch L≈0.91 C≈0.03 H≈180, which is the accent ramp's
 * step 4 on the shilp-sutra teal preset — so the default renders as the poster
 * does, and picking another brand recolours the whole surface with it.
 */
const IDENTITY_GRADIENT =
  'linear-gradient(118.9deg, var(--color-surface-base) 0%, var(--color-accent-4) 37.9%, var(--color-surface-base) 100%)'

export function BuildathonHero() {
  const reduce = useReducedMotion()

  return (
    <section className="relative isolate overflow-hidden">
      {/* Atmosphere — one layer. Both stops are tokens, so this reads correctly in
          light and dark and recolours with the brand preset; it replaces the three
          stacked overlays that were needed when the gradient was a fixed hex. */}
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: IDENTITY_GRADIENT }} />

      {/* Vishwakarma. On the poster the 1723px figure sits at x=626 on a 1920×1080
          frame: it spans ~90% of the frame width, starts ~33% in, bleeds ~22% past
          the right edge, and its top sits just above the frame. Anchored by TOP and
          sized by WIDTH so those proportions hold however tall the section grows
          (anchoring by bottom sank him out of frame as the copy pushed the section
          taller).
          Decorative: aria-hidden + inert + pointer-events-none. */}
      <motion.div
        aria-hidden
        inert
        className="pointer-events-none absolute top-[4%] right-[-42%] aspect-square w-[118%] select-none sm:right-[-30%] sm:w-[104%] lg:top-[-6%] lg:right-[-22%] lg:w-[90%] [&_path]:transition-[fill] [&_path]:duration-500 [&_path]:ease-out"
        style={{
          transformOrigin: 'bottom right',
          // The artwork's own bottom is a flat cut (on the poster it bleeds off
          // the frame). Wherever the section is short enough for that edge to
          // land on screen it reads as a hard seam, so feather the figure's own
          // pixels out over its lower third rather than letting it stop dead.
          maskImage:
            'linear-gradient(to bottom, #000 0%, #000 62%, rgba(0,0,0,0.72) 78%, rgba(0,0,0,0.28) 91%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, #000 0%, #000 62%, rgba(0,0,0,0.72) 78%, rgba(0,0,0,0.28) 91%, transparent 100%)',
        }}
        initial={reduce ? false : { y: 24 }}
        animate={{ y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 1.1, ease: [0.618, 0, 0.382, 1] }}
      >
        <VishwakarmaArt />
      </motion.div>

      {/* Scrim below lg, where the copy runs over the deity. It must sit ABOVE the
          figure to do anything — at a negative z-index it painted behind him and
          the headline ended up over full-saturation teal. */}
      <div aria-hidden className="absolute inset-0 bg-surface-base/60 lg:hidden" />

      {/* Hand-off to the page surface. Without it the hero's bottom edge stops
          dead — measured #4FC4BD against the body's #F5F5F5 across a single pixel,
          a hard colour seam. This resolves the gradient AND the figure into
          surface-base over the last 12rem so the two sections read continuous. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[12rem] bg-linear-to-t from-surface-base to-transparent"
      />

      {/* The poster is 16:9. The hero holds close to that on desktop so the whole
          composition — identity, letterforms, prize, and the way in — lands in one
          screen instead of pushing the entry CTA below the fold. */}
      <div className="relative mx-auto flex w-full max-w-[96rem] flex-col gap-ds-06 px-page-x pt-ds-11 pb-ds-09 md:pt-ds-12 lg:min-h-svh lg:justify-center lg:gap-ds-04 lg:pt-ds-11 lg:pb-ds-06">
        {/* Identity + dates. The poster's "Read more & participate at dv.lk/ss-build26"
            block is intentionally NOT here: that short link resolves to this page, so
            on the page itself it would point at where the reader already is. */}
        <div className="flex flex-col gap-ds-02">
          <p className="font-display text-ds-2xl leading-none tracking-tight text-surface-fg md:text-ds-3xl">
            Build with <span className="font-semibold">Shilp Sutra</span>
          </p>
          <p className="text-ds-lg font-semibold text-surface-fg md:text-ds-xl">{DATES}</p>
        </div>

        {/* The signature artifact. Sized by WIDTH with the artwork's own aspect
            ratio (1141:987) on the box — give it a free height and the SVG
            letterboxes inside, which floats the letterforms in dead space instead
            of anchoring them left the way the poster does. On the poster the
            composition spans ~59% of the frame width; that carries over here. */}
        <h1 className="w-full text-surface-fg">
          <span className="sr-only">Buildathon</span>
          <span
            aria-hidden
            className="block aspect-[1141/987] w-[86%] max-w-[40rem] sm:w-[72%] lg:w-[36%]"
          >
            <BuildathonLettering />
          </span>
        </h1>

        {/* Prize + the two ways in. */}
        <div className="flex flex-col gap-ds-06 lg:max-w-[34rem]">
          <div>
            <p className="text-ds-2xl leading-tight text-surface-fg md:text-ds-3xl">Win</p>
            {/* Righteous, per the poster. Scoped to this route in
                app/buildathon/layout.tsx; falls back to the DS display face. */}
            <p
              className="mt-ds-02 inline-block px-ds-03 font-[family-name:var(--font-righteous),var(--font-display)] text-[clamp(2.75rem,7vw,4.5rem)] leading-[1.1]"
              style={{ background: LIME, color: LIME_INK }}
            >
              {PRIZE}
            </p>
            <Text variant="body-lg" className="mt-ds-04 text-pretty text-surface-fg">
              worth of Branding, GTM Strategy, and ongoing support from Devalok.
            </Text>
          </div>

          <div className="flex flex-col items-start gap-ds-03">
            <TrackedLink
              href={FORM_URL}
              className="w-full sm:w-auto"
              event="cta_click"
              eventProps={{ cta: 'buildathon-enter', location: 'buildathon-hero' }}
            >
              <Button size="lg" className="w-full sm:w-auto">
                Enter the buildathon
              </Button>
            </TrackedLink>
            <Text variant="body-sm" className="text-surface-fg-muted">
              Or tell your coding agent to submit it. Entries close {CLOSES}.
            </Text>
          </div>
        </div>
      </div>
    </section>
  )
}
