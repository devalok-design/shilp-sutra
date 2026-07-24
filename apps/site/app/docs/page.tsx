import type { Metadata } from 'next'
import Link from 'next/link'
import {
  IconArrowRight,
  IconBolt,
  IconBrandReact,
  IconCode,
  IconPalette,
  IconRocket,
  IconServer,
  IconStack2,
  IconTool,
} from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { CARD_INTERACTIVE, CARD_TITLE } from '@/lib/card-recipe'

export const metadata: Metadata = {
  title: 'Docs',
  description:
    'Pick your framework and get going. Setup recipes for Next.js, Vite, Astro, Remix, TanStack Start. Plus theming, server components, troubleshoot.',
}

type DocCard = {
  slug: string
  name: string
  blurb: string
  Icon: typeof IconBolt
}

const FRAMEWORKS: DocCard[] = [
  {
    slug: 'install-next-app-router',
    name: 'Next.js (App Router)',
    blurb: 'transpilePackages, "use client" boundaries, font + CSS wiring.',
    Icon: IconBrandReact,
  },
  {
    slug: 'install-next-pages',
    name: 'Next.js (Pages Router)',
    blurb: '_app.tsx wiring, globals.css import order.',
    Icon: IconBrandReact,
  },
  {
    slug: 'install-vite',
    name: 'Vite + React',
    blurb: 'PostCSS, Tailwind 4 CSS-first, font @import order.',
    Icon: IconBolt,
  },
  {
    slug: 'install-astro',
    name: 'Astro',
    blurb: '@astrojs/react, client:load islands, CSS bundling.',
    Icon: IconRocket,
  },
  {
    slug: 'install-remix',
    name: 'Remix',
    blurb: 'links() exports, font preloading, route-level CSS.',
    Icon: IconStack2,
  },
  {
    slug: 'install-tanstack-start',
    name: 'TanStack Start',
    blurb: 'Vite-based SSR, route-tree CSS injection.',
    Icon: IconRocket,
  },
]

const CUSTOMIZE: DocCard[] = [
  {
    slug: 'customize-brand',
    name: 'Customize brand',
    blurb: 'Override accent ramp, radius, typography. CSS-vars only, no theme provider.',
    Icon: IconPalette,
  },
]

const REFERENCE: DocCard[] = [
  {
    slug: 'server-components',
    name: 'Server Components',
    blurb: 'Which components are RSC-safe, which need a client boundary, and why.',
    Icon: IconServer,
  },
]

const TROUBLESHOOT: DocCard[] = [
  {
    slug: 'troubleshoot',
    name: 'Troubleshoot',
    blurb: 'Common errors, version mismatches, CSS load order traps.',
    Icon: IconTool,
  },
]

export default function DocsIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              title="Pick your stack. Ship in five minutes."
              subtitle="Framework recipes, theming, server components, and troubleshooting. The same recipes ship inside the npm package."
            />

            {/* For AI editors — first-class path. The MCP serves version-exact
                docs so agents stop guessing. */}
            <section className="flex flex-col gap-ds-04 rounded-surface border border-accent-6 bg-accent-2 p-ds-06">
              <div className="flex items-center gap-ds-02">
                <IconCode size={16} className="text-accent-11" />
                <Text variant="label-sm" className="font-semibold uppercase tracking-wide text-accent-11">
                  For AI editors
                </Text>
              </div>
              <Text variant="heading-sm" className="text-surface-fg">
                Point your editor at the docs MCP.
              </Text>
              <Text variant="body-sm" className="max-w-2xl text-surface-fg-muted">
                Cursor, Claude, Copilot, and Aider can read every component, prop, token, and setup
                step straight from the source. Add the server once and stop pasting docs into chat.
              </Text>
              <code className="w-fit rounded-control bg-surface-base px-ds-03 py-ds-02 font-mono text-ds-sm text-surface-fg">
                https://shilp-sutra.devalok.in/mcp
              </code>
              <Link
                href="/agents"
                className="inline-flex w-fit items-center gap-ds-01 text-ds-sm text-accent-11 hover:text-accent-12"
              >
                Full editor setup
                <IconArrowRight size={14} />
              </Link>
            </section>

            <section className="flex flex-col gap-ds-05">
              <header className="flex flex-col gap-ds-02 max-w-3xl">
                <span className="text-ds-xs text-surface-fg-subtle">
                  Install
                </span>
                <h2 className="font-display text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] text-surface-fg">
                  Pick your framework.
                </h2>
                <Text variant="body-sm" className="text-surface-fg-muted">
                  All six recipes assume Tailwind 4 CSS-first, React 18+, TypeScript optional.
                </Text>
              </header>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-04">
                {FRAMEWORKS.map((f) => (
                  <DocLinkCard key={f.slug} item={f} />
                ))}
              </ul>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-ds-06">
              <DocsSection eyebrow="Customize" title="Make it yours." items={CUSTOMIZE} />
              <DocsSection eyebrow="Reference" title="Deeper context." items={REFERENCE} />
              <DocsSection eyebrow="Troubleshoot" title="When things break." items={TROUBLESHOOT} />
            </div>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function DocsSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string
  title: string
  items: DocCard[]
}) {
  return (
    <section className="flex flex-col gap-ds-04">
      <header className="flex flex-col gap-ds-01">
        <span className="text-ds-xs text-surface-fg-subtle">{eyebrow}</span>
        <h2 className="text-ds-lg text-surface-fg font-semibold">{title}</h2>
      </header>
      <ul className="flex flex-col gap-ds-03">
        {items.map((item) => (
          <DocLinkCard key={item.slug} item={item} />
        ))}
      </ul>
    </section>
  )
}

function DocLinkCard({ item }: { item: DocCard }) {
  return (
    <li>
      <Link
        href={`/docs/${item.slug}`}
        className={CARD_INTERACTIVE + ' flex flex-col gap-ds-03 h-full'}
      >
        <div className="flex items-start justify-between gap-ds-03">
          <item.Icon size={18} className="text-accent-11 shrink-0 mt-1" />
          <IconArrowRight
            size={16}
            className="text-surface-fg-subtle group-hover:translate-x-1 group-hover:text-surface-fg transition-transform duration-fast-02 ease-productive-standard shrink-0 mt-1"
          />
        </div>
        <h3 className={CARD_TITLE}>{item.name}</h3>
        <p className="text-ds-sm text-surface-fg-subtle line-clamp-2">{item.blurb}</p>
      </Link>
    </li>
  )
}
