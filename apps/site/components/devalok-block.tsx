import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

/**
 * About-Devalok homepage block. Per docs/copy/shilp-sutra-copy-context.md §5.
 *
 * Quiet section near the foot of the homepage. Frames who Devalok is, why
 * a studio built a design system, and where designers fit in the story.
 * Subtle link to devalok.in — positioning, not lead-gen.
 */
export function DevalokBlock() {
  return (
    <section className="mx-auto max-w-4xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-06">
        <div className="flex flex-col items-center gap-ds-03 max-w-3xl mx-auto text-center">
          <Text variant="heading-xl" className="text-surface-fg">
            A studio that ships its own tools.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-08 max-w-3xl">
          <div className="flex flex-col gap-ds-03">
            <Text variant="body-md" className="text-surface-fg-muted">
              Devalok is a design and strategy studio based in Bharat. A brand-craft house that makes
              manifestos, identity systems, packaging, and publications. We build Karm, Devalok Hiring,
              BharatTools, and Gurukul. Shilp Sutra is studio infrastructure made public.
            </Text>
            <Text variant="body-md" className="text-surface-fg-muted">
              We needed a way to brand the products we were shipping with AI help without each one
              looking like every other AI-built SaaS. Shilp Sutra fell out of that need. It is open
              because keeping it private gives us no edge. The edge is the studio that wields it.
            </Text>
          </div>
          <div className="flex flex-col gap-ds-03">
            <Text variant="label-sm" className="text-surface-fg-subtle">
              A note to designers
            </Text>
            <Text variant="body-md" className="text-surface-fg-muted">
              Designers are builders too. Shilp Sutra hands you the base layer. You spend time on the
              parts that carry the brand. Motion, illustration, voice. Not on rebuilding the fifth
              Button this year.
            </Text>
          </div>
        </div>

        <div>
          <Link
            href="https://devalok.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg underline underline-offset-2 hover:text-accent-11 transition-colors duration-fast-01"
          >
            More about Devalok at devalok.in
            <IconArrowUpRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
