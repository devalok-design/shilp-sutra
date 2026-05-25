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
              eyebrow="Docs"
              title="Pick your stack. Ship in five minutes."
              subtitle="Six framework recipes, plus theming, server components, and troubleshoot."
              description="Every recipe is the same as the one shipped inside the npm tarball at node_modules/@devalok/shilp-sutra/docs/recipes/. Single source of truth, no drift."
            />

            <section className="flex flex-col gap-ds-05">
              <header className="flex flex-col gap-ds-02 max-w-3xl">
                <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                  Install
                </span>
                <h2 className="text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] text-surface-fg">
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

            <section className="rounded-control border border-surface-border-subtle bg-surface-raised p-ds-06 flex flex-col gap-ds-03">
              <div className="flex items-center gap-ds-02">
                <IconCode size={16} className="text-surface-fg-subtle" />
                <Text variant="label-sm" className="text-surface-fg-subtle">
                  Working with an AI editor?
                </Text>
              </div>
              <Text variant="body-sm" className="text-surface-fg-muted max-w-3xl">
                Install the Agent Skill once. Cursor, Claude Code, Codex, Aider then know every
                component, every setup step, every gotcha. No more pasting docs into chat.
              </Text>
              <Link
                href="/agents"
                className="text-ds-sm text-accent-11 hover:text-accent-12 inline-flex items-center gap-ds-01 w-fit"
              >
                Set up your editor
                <IconArrowRight size={14} />
              </Link>
            </section>
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
        <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">{eyebrow}</span>
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
          <span className="w-9 h-9 rounded-control-inner bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
            <item.Icon size={18} />
          </span>
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
