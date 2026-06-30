import type { Metadata } from 'next'
import Link from 'next/link'
import {
  IconBrandFigma,
  IconBrandGithub,
  IconCircleCheck,
  IconClockExclamation,
  IconExternalLink,
  IconPackage,
  IconClipboardText,
  IconRocket,
  IconStack2,
} from '@tabler/icons-react'
import { Alert } from '@devalok/shilp-sutra/ui/alert'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CodeBlock } from '@/components/code-block'
import { MakeKitPaster } from '@/components/make-kit-paster'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { concatGroup, fileCount, getGuidelineGroups } from '@/lib/make-kit-content'

export const metadata: Metadata = {
  title: 'Figma Make kit',
  description:
    'Generate apps in Figma Make against the production shilp-sutra design system. Register the npm package as a Make kit, paste twenty-six guideline files, and ship prototypes that match the same conventions as production code.',
}

const KIT_VERSION = process.env.NEXT_PUBLIC_SHILP_SUTRA_VERSION ?? '0.42.0'

const STEPS = [
  {
    icon: IconBrandFigma,
    title: 'Open the Resources panel',
    body: 'From Figma\'s top-right menu, head to Resources → Make kits tab → Create Make kit. Name it shilp-sutra. Description below.',
    snippet: 'Devalok Design System — React + Tailwind 4 + CVA. OKLCH tokens, framer-motion, dark mode, accessibility baked in.',
    snippetLang: 'text',
  },
  {
    icon: IconPackage,
    title: 'Pick public npm',
    body: 'Two registry options show up: public npm and Figma\'s private registry. Pick public npm. shilp-sutra lives at @devalok/shilp-sutra on npmjs.com.',
    snippet: '@devalok/shilp-sutra',
    snippetLang: 'text',
  },
  {
    icon: IconStack2,
    title: 'Pin the version',
    body: `Type the package name above and version ${KIT_VERSION}. Figma fetches the tarball — confirm version, size (about 6 MB), and dependency count look right before continuing.`,
    snippet: KIT_VERSION,
    snippetLang: 'text',
  },
  {
    icon: IconClipboardText,
    title: 'Choose manual guidelines',
    body: 'Figma offers auto-gen or manual. Pick manual. Auto-gen reads the package and drafts what it thinks the rules are; the files below are written from inside the system, with conventions and anti-patterns baked in.',
    snippet: null,
    snippetLang: null,
  },
  {
    icon: IconCircleCheck,
    title: `Paste the ${fileCount()} files`,
    body: 'Recreate the file tree from the section below. Paste Guidelines.md first — Figma always reads that as the entry point. Within each group, order does not matter.',
    snippet: null,
    snippetLang: null,
  },
  {
    icon: IconRocket,
    title: 'Publish the kit',
    body: 'Hit Publish kit. Figma assigns a kit version separate from the npm version — kit 1.0.0, npm ' + KIT_VERSION + '. Teammates see the kit in their Make kit picker on next session.',
    snippet: null,
    snippetLang: null,
  },
] as const

const FAQ = [
  {
    q: 'Can I use the kit on a free Figma plan?',
    a: 'Make kits need an Organization or Enterprise plan. Free and Pro can still install @devalok/shilp-sutra in any React project — the kit registration is the part that needs the higher tier.',
  },
  {
    q: 'Does Figma Make pull new versions automatically?',
    a: 'No. Publishing a new npm version does not flow into Figma. Open the kit in Figma → Update kit → bump the npm version field → republish. Files using the kit get a notification next session.',
  },
  {
    q: 'Why does Figma bump the kit version on every republish?',
    a: 'Kit version (Figma-internal) is separate from npm version. Figma auto-increments the kit version every republish. If your CI also publishes the npm tarball, both can move independently — pick one to drive bumps to avoid "package version already exists" errors.',
  },
  {
    q: 'Make generated a raw <button> instead of <Button>. What now?',
    a: 'Open components/button.md in the kit, tighten the rule that was missed, republish. File an issue against shilp-sutra so the upstream guideline catches it for everyone else.',
  },
  {
    q: 'Auto-gen guidelines look fine. Should I use those instead?',
    a: 'Acceptable starting point. Ours are stricter on conventions (soft over outline default, ds-* spacing cadence, surface tiers, no mixing border with shadow). Swap them in when you start seeing drift in Make output.',
  },
  {
    q: 'Can I share the kit with another Figma org?',
    a: 'Not directly. Each consumer org registers its own kit against the same npm package and pastes the same guidelines. The npm tarball is the shared source of truth.',
  },
] as const

export default function FigmaMakePage() {
  const groups = getGuidelineGroups()
  const groupConcat: Record<string, string> = Object.fromEntries(
    groups.map((g) => [g.id, concatGroup(g)]),
  )

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-5xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <PageHeader
            eyebrow="For Figma Make"
            title="Generate apps in Figma against the real design system."
            subtitle={`One npm version. ${fileCount()} guideline files. Same conventions as production.`}
            description="Figma Make turns prompts into React. shilp-sutra-as-a-Make-kit teaches it which Button to reach for, which surface a card sits on, why soft beats outline. The Buttons your team already ships, applied to AI-generated screens."
          />

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-ds-03 mb-ds-09 -mt-ds-04">
            <Link href="https://www.figma.com/make" target="_blank" rel="noreferrer">
              <Button startIcon={<IconBrandFigma size={16} />}>
                Open Figma Make
              </Button>
            </Link>
            <Link href="#setup">
              <Button variant="soft">Read the setup ↓</Button>
            </Link>
            <Link
              href={`https://www.npmjs.com/package/@devalok/shilp-sutra/v/${KIT_VERSION}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto"
            >
              <Badge variant="soft" color="neutral" size="md">
                v{KIT_VERSION} on npm
              </Badge>
            </Link>
          </div>

          {/* Eligibility */}
          <Alert
            color="info"
            title="Make kits need an Organization or Enterprise Figma plan."
            className="mb-ds-09"
          >
            Free and Pro plans can install the npm package directly in any React project. Registering
            a private Make kit is the part that needs the higher tier — that's a Figma platform limit,
            not ours.
          </Alert>

          {/* Steps */}
          <section id="setup" className="mb-ds-12">
            <header className="flex flex-col gap-ds-02 max-w-2xl mb-ds-06">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                Setup
              </Text>
              <Text variant="heading-md" className="text-surface-fg">
                Six steps. Fifteen minutes, mostly pasting.
              </Text>
            </header>
            <ol className="flex flex-col gap-ds-04">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start gap-ds-04">
                        <span className="w-10 h-10 rounded-control bg-accent-3 text-accent-11 flex items-center justify-center shrink-0 font-semibold text-ds-md">
                          {i + 1}
                        </span>
                        <div className="flex flex-col gap-ds-02 flex-1 min-w-0">
                          <CardTitle className="flex items-center gap-ds-03">
                            <step.icon size={18} className="text-fg-muted shrink-0" />
                            {step.title}
                          </CardTitle>
                          <CardDescription>{step.body}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    {step.snippet ? (
                      <CardContent>
                        <CodeBlock language={step.snippetLang ?? 'text'} code={step.snippet} />
                      </CardContent>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ol>
          </section>

          {/* Guideline paster */}
          <section className="mb-ds-12">
            <header className="flex flex-col gap-ds-02 max-w-2xl mb-ds-06">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                Guidelines
              </Text>
              <Text variant="heading-md" className="text-surface-fg">
                {`Paste these ${fileCount()} files into the kit's guideline editor.`}
              </Text>
              <Text variant="body-md" className="text-fg-muted">
                Each file ships in the npm tarball at{' '}
                <code className="font-mono text-ds-sm bg-surface-overlay px-ds-02 rounded-control-inner">
                  node_modules/@devalok/shilp-sutra/make-kit/
                </code>{' '}
                — copy from there, or copy from below. Both reach the same content. The "Copy all" button
                concatenates a group with file-path separators so you can paste a whole tier in one shot.
              </Text>
            </header>
            <div className="flex flex-col gap-ds-09">
              {groups.map((g) => (
                <MakeKitPaster
                  key={g.id}
                  title={g.title}
                  description={g.description}
                  files={g.files}
                  concat={groupConcat[g.id]}
                  version={KIT_VERSION}
                />
              ))}
            </div>
          </section>

          {/* Update cadence */}
          <section className="mb-ds-12">
            <header className="flex flex-col gap-ds-02 max-w-2xl mb-ds-06">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                Update cadence
              </Text>
              <Text variant="heading-md" className="text-surface-fg">
                When to refresh the kit in your Figma org.
              </Text>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-04">
              <Card variant="outline" color="warning">
                <CardHeader>
                  <CardTitle className="flex items-center gap-ds-03">
                    <IconClockExclamation size={18} className="text-warning-11" />
                    No auto-update from Figma
                  </CardTitle>
                  <CardDescription>
                    Publishing a new npm version does not push to Figma Make. The republish step lives
                    inside Figma's kit UI. Track shilp-sutra releases in npm or our changelog, then trigger
                    the kit republish on the cadence below.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>The rhythm</CardTitle>
                  <CardDescription>
                    <ul className="flex flex-col gap-ds-02 mt-ds-02 list-none">
                      <li>
                        <strong className="text-fg">Minor bumps</strong> (0.43, 0.44…) — bump the kit's
                        npm version in Figma, re-paste any guideline file that changed.
                      </li>
                      <li>
                        <strong className="text-fg">Patch bumps</strong> — usually skip. Re-paste only
                        when the patch fixes Make-visible behavior (rare).
                      </li>
                      <li>
                        <strong className="text-fg">Major bumps</strong> — full re-paste. Treat as a
                        fresh kit setup, especially for breaking API changes.
                      </li>
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-ds-12">
            <header className="flex flex-col gap-ds-02 max-w-2xl mb-ds-06">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                FAQ
              </Text>
              <Text variant="heading-md" className="text-surface-fg">
                Things people ask before they hit publish.
              </Text>
            </header>
            <div className="flex flex-col gap-ds-03">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-control border border-surface-border bg-surface-raised"
                >
                  <summary className="cursor-pointer px-ds-05 py-ds-04 text-ds-md font-medium text-fg list-none flex items-center justify-between gap-ds-03">
                    <span>{item.q}</span>
                    <span className="text-fg-muted text-ds-lg shrink-0 group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="px-ds-05 pb-ds-05 text-ds-md text-fg-muted leading-relaxed border-t border-surface-border-subtle pt-ds-04">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Footer cross-links */}
          <section className="pt-ds-08 border-t border-surface-border-subtle">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-04">
              <Link
                href={`https://www.npmjs.com/package/@devalok/shilp-sutra/v/${KIT_VERSION}`}
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                <Card variant="outline" interactive>
                  <CardHeader>
                    <CardTitle className="text-ds-md flex items-center gap-ds-02">
                      <IconPackage size={16} className="text-fg-muted" />
                      npm
                      <IconExternalLink size={12} className="text-fg-subtle opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </CardTitle>
                    <CardDescription className="text-ds-sm">
                      @devalok/shilp-sutra@{KIT_VERSION} — sigstore provenance, public registry.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link
                href="https://github.com/devalok-design/shilp-sutra/tree/main/packages/core/make-kit"
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                <Card variant="outline" interactive>
                  <CardHeader>
                    <CardTitle className="text-ds-md flex items-center gap-ds-02">
                      <IconBrandGithub size={16} className="text-fg-muted" />
                      GitHub source
                      <IconExternalLink size={12} className="text-fg-subtle opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </CardTitle>
                    <CardDescription className="text-ds-sm">
                      Read the guidelines in context. File issues, suggest sharper rules.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link
                href="https://forum.figma.com/report-a-problem-6/figma-make-auto-check-of-new-design-system-npm-version-50979"
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                <Card variant="outline" interactive>
                  <CardHeader>
                    <CardTitle className="text-ds-md flex items-center gap-ds-02">
                      <IconBrandFigma size={16} className="text-fg-muted" />
                      Vote for auto-update
                      <IconExternalLink size={12} className="text-fg-subtle opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </CardTitle>
                    <CardDescription className="text-ds-sm">
                      Open Figma forum request to detect new npm versions without manual republish.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
