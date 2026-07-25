import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CodeBlock } from '@/components/code-block'
import { BuildathonHero } from '@/components/buildathon-hero'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { TrackedLink } from '@/components/tracked-link'
import {
  CLOSES,
  CONTACT_EMAIL,
  DATES,
  FORM_URL,
  JUDGING,
  MCP_URL,
  PRIZE,
  REQUIREMENTS,
} from '@/lib/buildathon'

export const metadata: Metadata = {
  title: 'Build with Shilp Sutra',
  description: `An online buildathon by Devalok, ${DATES}. Open to everyone, solo or team. Build anything that runs on Shilp Sutra and solves a problem with real cause. The winner receives ${PRIZE} worth of brand identity, GTM strategy, and ongoing support from Devalok. Entries close ${CLOSES}.`,
  alternates: { canonical: 'https://shilp-sutra.devalok.in/buildathon' },
}

/**
 * The lime plate from the poster, reused as this page's single emphasis device.
 * A flat identity colour rather than a token, so it holds in both themes — ink on
 * it measures 14.34:1 (setu_check, 2026-07-25). Used exactly twice below the
 * hero: on the deadline, and nowhere else. It stops meaning anything if it spreads.
 */
const LIME = '#D5EF72'
const LIME_INK = '#131514'

export default function BuildathonPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <BuildathonHero />

        {/* ── The invitation ───────────────────────────────────────────────────
            Editorial opening: one wide lead, then the detail dropping into a
            narrower measure with the parallel-hackathon note set off beside it.
            The asymmetry continues the hero's left-anchored composition. */}
        <section className="mx-auto w-full max-w-[88rem] px-page-x pt-ds-11 pb-ds-10">
          <Text
            variant="heading-lg"
            as="p"
            className="max-w-[46rem] text-balance text-surface-fg"
          >
            Namaskar. Shilp Sutra is our open React design system: pick one colour and your whole
            interface takes on your brand.
          </Text>

          <div className="mt-ds-08 grid gap-ds-08 lg:grid-cols-12 lg:gap-ds-09">
            <div className="flex flex-col gap-ds-05 lg:col-span-7">
              <Text variant="body-lg" className="text-pretty text-surface-fg">
                This week we are inviting builders to put it to work and show us what it looks like
                in your hands. Build anything you like, from a full product to a small useful tool,
                as long as it runs on Shilp Sutra and solves a problem with real cause.
              </Text>
              <Text variant="body-lg" className="text-pretty text-surface-fg">
                Open to everyone, solo or as a team.
              </Text>
            </div>

            <aside className="border-t border-surface-border-subtle pt-ds-04 lg:col-span-4 lg:col-start-9">
              <Text variant="body-md" className="text-pretty text-surface-fg-muted">
                Already building at the Cursor India or Sarvam AI hackathons this week? Run your
                project here in parallel too. It counts.
              </Text>
            </aside>
          </div>
        </section>

        {/* ── Judging ──────────────────────────────────────────────────────────
            The substance of the page, so it gets the boldest type in the body:
            each criterion at heading scale in its own column with the definition
            hanging beside it. Space separates the rows — no rules, no cards. */}
        <section className="mx-auto w-full max-w-[88rem] px-page-x pt-ds-10 pb-ds-06">
          <Text variant="label-sm" as="h2" className="mb-ds-07 text-surface-fg-subtle">
            What we are judging on
          </Text>

          <dl className="flex flex-col gap-ds-09">
            {JUDGING.map((j) => (
              <div key={j.title} className="grid gap-ds-03 lg:grid-cols-12 lg:gap-ds-09">
                <dt className="lg:col-span-5">
                  <Text variant="heading-lg" as="span" className="text-balance text-surface-fg">
                    {j.title}
                  </Text>
                </dt>
                <dd className="lg:col-span-5 lg:col-start-6 lg:self-end">
                  <Text variant="body-lg" className="text-pretty text-surface-fg-muted">
                    {j.body}
                  </Text>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Requirements ─────────────────────────────────────────────────────
            Three short strings, so this reads as a compact spec strip across the
            width — deliberately the opposite rhythm to the tall judging rows
            above it. Hairlines divide the columns; nothing is boxed. */}
        <section className="mx-auto w-full max-w-[88rem] px-page-x pt-ds-04 pb-ds-10">
          <div className="border-y border-surface-border-subtle py-ds-07">
            <Text variant="label-sm" as="h2" className="mb-ds-06 text-surface-fg-subtle">
              To enter, you need
            </Text>
            <ul className="grid gap-ds-06 sm:grid-cols-3 sm:gap-0">
              {REQUIREMENTS.map((r, i) => (
                <li
                  key={r}
                  className={[
                    'sm:px-ds-06 sm:first:pl-0 sm:last:pr-0',
                    i > 0 ? 'sm:border-l sm:border-surface-border-subtle' : '',
                  ].join(' ')}
                >
                  <Text variant="heading-sm" as="span" className="text-surface-fg">
                    {r}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          <Text
            variant="body-md"
            className="mt-ds-06 max-w-[42rem] text-pretty text-surface-fg-muted"
          >
            Judging includes how considered it looks. Before you ship the interface, run{' '}
            <Text variant="code" as="code" className="text-surface-fg">
              check_slop
            </Text>{' '}
            from our MCP over your components. It reads the design back to you and names what is
            generic.
          </Text>
        </section>

        {/* ── Two ways in ──────────────────────────────────────────────────────
            The functional core, so the two paths sit side by side at real widths
            rather than stacked: the agent path is wider because it carries the
            snippet, and a single hairline separates them. One Button in the
            section — the agent path's affordance is the snippet's own copy
            control, which keeps this off the stock filled-plus-outline pairing. */}
        <section className="mx-auto w-full max-w-[88rem] px-page-x pt-ds-11 pb-ds-11">
          <div className="max-w-[46rem]">
            <Text variant="heading-xl" className="text-balance text-surface-fg">
              Two ways to submit
            </Text>
            <Text variant="body-lg" className="mt-ds-04 text-pretty text-surface-fg-muted">
              Shilp Sutra ships with a hosted MCP server, so the coding agent you are already
              building with can file your entry for you. The form is open either way. Both land in
              the same place.
            </Text>
          </div>

          <div className="mt-ds-09 grid gap-ds-09 lg:grid-cols-12 lg:gap-0">
            <div className="flex flex-col lg:col-span-7 lg:pr-ds-09">
              <Text variant="label-sm" as="h3" className="mb-ds-03 text-surface-fg-subtle">
                Through your agent
              </Text>
              <Text variant="body-md" className="mb-ds-05 text-pretty text-surface-fg">
                Connect the MCP once, then say it in plain words. Your agent will ask for your
                details, read every field back to you, and submit only after you confirm.
              </Text>
              <CodeBlock language="text" code={`Submit my project to the Shilp Sutra buildathon.`} />
              <Text variant="body-sm" className="mt-ds-04 text-surface-fg-muted">
                Not connected yet? Point your editor at{' '}
                <Text variant="code" as="code" className="text-surface-fg">
                  {MCP_URL}
                </Text>{' '}
                and see the{' '}
                <Link href="/agents" className="text-accent-11 underline underline-offset-4">
                  setup for AI editors
                </Link>
                .
              </Text>
            </div>

            <div className="flex flex-col border-surface-border-subtle lg:col-span-5 lg:border-l lg:pl-ds-09">
              <Text variant="label-sm" as="h3" className="mb-ds-03 text-surface-fg-subtle">
                By hand
              </Text>
              <Text variant="body-md" className="text-pretty text-surface-fg">
                Fill in the form yourself. Same questions, same sheet, and you get a copy of your
                responses.
              </Text>
              {/* mt-auto anchors the action to the bottom of the column so it does
                  not float at a different height to the snippet beside it. */}
              <TrackedLink
                href={FORM_URL}
                className="mt-ds-06 self-start lg:mt-auto"
                event="cta_click"
                eventProps={{ cta: 'buildathon-form', location: 'buildathon-submit' }}
              >
                <Button>Open the entry form</Button>
              </TrackedLink>
            </div>
          </div>
        </section>

        {/* ── The floor ────────────────────────────────────────────────────────
            The page's one deliberate surface break, which is what a closing band
            is for: the prize, who is behind it, and the date it all ends. */}
        <section className="border-t border-surface-border-subtle bg-surface-sunken">
          <div className="mx-auto w-full max-w-[88rem] px-page-x py-ds-11">
            <div className="grid gap-ds-09 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <Text variant="label-sm" as="h2" className="mb-ds-05 text-surface-fg-subtle">
                  The prize
                </Text>
                <Text variant="heading-lg" as="p" className="text-balance text-surface-fg">
                  {PRIZE} worth of full brand identity, GTM strategy, and ongoing support from
                  Devalok Design and Strategy Studio.
                </Text>
              </div>

              <div className="flex flex-col gap-ds-05 lg:col-span-5 lg:col-start-8 lg:self-end">
                <Text variant="body-lg" className="text-pretty text-surface-fg-muted">
                  We have partnered with 30+ startups globally to define their identity, position
                  their products, and prepare them for launch and scale. We will bring the same
                  support to the winning team.
                </Text>
                <Link
                  href="https://devalok.in"
                  target="_blank"
                  rel="noreferrer"
                  className="self-start text-ds-md text-accent-11 underline underline-offset-4"
                >
                  Explore our work at devalok.in
                </Link>
              </div>
            </div>

            {/* Deadline + contact, on the band's baseline. The lime plate returns
                here — its second and last use on the page — because the date is
                the one fact a reader must not miss. */}
            <div className="mt-ds-12 flex flex-col gap-ds-06 border-t border-surface-border-subtle pt-ds-07 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col items-start gap-ds-02">
                <Text variant="label-sm" as="p" className="text-surface-fg-subtle">
                  Submissions close
                </Text>
                <span
                  className="px-ds-03 py-ds-01 text-ds-xl font-semibold md:text-ds-2xl"
                  style={{ background: LIME, color: LIME_INK }}
                >
                  {CLOSES}
                </span>
              </div>

              <Text variant="body-md" className="text-surface-fg-muted">
                Questions? Write to us at{' '}
                <Link
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-accent-11 underline underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </Link>
                .
              </Text>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
