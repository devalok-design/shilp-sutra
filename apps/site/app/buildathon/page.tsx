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

export default function BuildathonPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <BuildathonHero />

        <div className="mx-auto max-w-3xl px-page-x py-ds-12">
          {/* The invitation. Register is warm; this is a welcome, not a brief. */}
          <section className="mb-ds-12 flex flex-col gap-ds-05">
            <Text variant="body-lg" className="text-pretty text-surface-fg">
              Namaskar. Shilp Sutra is our open React design system: pick one colour and your whole
              interface takes on your brand. This week we are inviting builders to put it to work and
              show us what it looks like in your hands.
            </Text>
            <Text variant="body-lg" className="text-pretty text-surface-fg">
              Build anything you like, from a full product to a small useful tool, as long as it runs
              on Shilp Sutra and solves a problem with real cause. Open to everyone, solo or as a
              team.
            </Text>
            <Text variant="body-md" className="text-pretty text-surface-fg-muted">
              Already building at the Cursor India or Sarvam AI hackathons this week? Run your project
              here in parallel too. It counts.
            </Text>
          </section>

          {/* Judging. Three beats, no cards, no icons — hierarchy carries it. */}
          <section className="mb-ds-12">
            <Text variant="heading-md" className="mb-ds-06 text-surface-fg">
              What we are judging on
            </Text>
            <dl className="flex flex-col divide-y divide-surface-border-subtle">
              {JUDGING.map((j) => (
                <div key={j.title} className="flex flex-col gap-ds-01 py-ds-04 sm:flex-row sm:gap-ds-06">
                  <dt className="text-ds-md font-semibold text-surface-fg sm:w-[16rem] sm:shrink-0">
                    {j.title}
                  </dt>
                  <dd className="text-ds-md text-surface-fg-muted">{j.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Requirements. */}
          <section className="mb-ds-12">
            <Text variant="heading-md" className="mb-ds-05 text-surface-fg">
              To enter, you need
            </Text>
            <ul className="flex flex-col gap-ds-03">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-baseline gap-ds-03 text-ds-md text-surface-fg">
                  <span aria-hidden className="text-accent-11">
                    &rarr;
                  </span>
                  {r}
                </li>
              ))}
            </ul>
            <Text variant="body-sm" className="mt-ds-05 text-surface-fg-muted">
              Judging includes how considered it looks. Before you ship the interface, run{' '}
              <code className="font-mono text-ds-sm text-surface-fg">check_slop</code> from our MCP
              over your components. It reads the design back to you and names what is generic.
            </Text>
          </section>

          {/* Two ways to submit. The MCP path is the reason this page exists. */}
          <section className="mb-ds-12">
            <Text variant="heading-md" className="mb-ds-03 text-surface-fg">
              Two ways to submit
            </Text>
            <Text variant="body-md" className="mb-ds-07 text-pretty text-surface-fg-muted">
              Shilp Sutra ships with a hosted MCP server, so the coding agent you are already building
              with can file your entry for you. The form is open either way. Both land in the same
              place.
            </Text>

            <div className="flex flex-col gap-ds-08">
              <div>
                <Text variant="label-sm" className="mb-ds-02 text-surface-fg-subtle">
                  Through your agent
                </Text>
                <Text variant="body-md" className="mb-ds-04 text-pretty text-surface-fg">
                  Connect the MCP once, then say it in plain words. Your agent will ask for your
                  details, read every field back to you, and submit only after you confirm.
                </Text>
                <CodeBlock language="text" code={`Submit my project to the Shilp Sutra buildathon.`} />
                <Text variant="body-sm" className="mt-ds-03 text-surface-fg-muted">
                  Not connected yet? Point your editor at{' '}
                  <code className="font-mono text-ds-sm text-surface-fg">{MCP_URL}</code> and see the{' '}
                  <Link href="/agents" className="text-accent-11 underline underline-offset-4">
                    setup for AI editors
                  </Link>
                  .
                </Text>
              </div>

              <div>
                <Text variant="label-sm" className="mb-ds-02 text-surface-fg-subtle">
                  By hand
                </Text>
                <Text variant="body-md" className="mb-ds-04 text-pretty text-surface-fg">
                  Fill in the form yourself. Same questions, same sheet.
                </Text>
                <TrackedLink
                  href={FORM_URL}
                  event="cta_click"
                  eventProps={{ cta: 'buildathon-form', location: 'buildathon-submit' }}
                >
                  <Button variant="soft">Open the entry form</Button>
                </TrackedLink>
              </div>
            </div>
          </section>

          {/* The prize, and who is behind it. */}
          <section className="mb-ds-12">
            <Text variant="heading-md" className="mb-ds-05 text-surface-fg">
              The prize
            </Text>
            <Text variant="body-lg" className="mb-ds-04 text-pretty text-surface-fg">
              The winner receives {PRIZE} worth of full brand identity, GTM strategy, and ongoing
              support from Devalok Design and Strategy Studio.
            </Text>
            <Text variant="body-md" className="text-pretty text-surface-fg-muted">
              We have partnered with 30+ startups globally to define their identity, position their
              products, and prepare them for launch and scale. We will bring the same support to the
              winning team. Explore our work at{' '}
              <Link
                href="https://devalok.in"
                target="_blank"
                rel="noreferrer"
                className="text-accent-11 underline underline-offset-4"
              >
                devalok.in
              </Link>
              .
            </Text>
          </section>

          <section className="border-t border-surface-border-subtle pt-ds-07">
            <Text variant="body-md" className="text-surface-fg">
              Submissions close {CLOSES}.
            </Text>
            <Text variant="body-md" className="mt-ds-02 text-surface-fg-muted">
              Questions? Write to us at{' '}
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-accent-11 underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </Link>
              .
            </Text>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
