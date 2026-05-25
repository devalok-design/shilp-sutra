import type { Metadata } from 'next'
import Link from 'next/link'

import { InstallTabs } from '@/components/install-tabs'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { PreviewFrame } from '@/components/themer/PreviewFrame'
import { ResultActions } from '@/components/themer/ResultActions'
import { ThemeSummaryBar } from '@/components/themer/ThemeSummaryBar'
import {
  type ArchetypeName,
  type DensityName,
  type ShapeName,
  ARCHETYPE_DESCRIPTIONS,
  ARCHETYPE_TITLES,
} from '@/lib/archetype-presets'
import { generateThemerCss } from '@/lib/themer-css'
import { parseThemerParams } from '@/lib/themer-state'

export const metadata: Metadata = {
  title: 'Result — Themer',
  description:
    'Your shilp-sutra theme: install commands, CSS to paste, a live preview, and a share URL.',
}

interface ResultPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string') sp.set(k, v)
  }
  const state = parseThemerParams(sp)
  const archetype: ArchetypeName = state.archetype ?? 'devalok'
  const density = state.density as DensityName | undefined
  const shape = state.shape as ShapeName | undefined
  const hue = state.hue ?? 340
  const chroma = state.chroma ?? 0.19

  const css = generateThemerCss(state)

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-08">
            <PageHeader
              eyebrow="Themer · Result"
              title={ARCHETYPE_TITLES[archetype]}
              subtitle="Install. Paste. Ship."
              description={ARCHETYPE_DESCRIPTIONS[archetype]}
              meta={
                <ThemeSummaryBar
                  archetype={archetype}
                  density={density}
                  shape={shape}
                  motion={state.motion}
                  hue={hue}
                  chroma={chroma}
                />
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-ds-06">
              <div className="flex flex-col gap-ds-08">
                <section className="flex flex-col gap-ds-04">
                  <div className="flex items-baseline gap-ds-02">
                    <span className="inline-flex h-ds-md w-ds-md items-center justify-center rounded-pill bg-accent-9 text-accent-fg text-ds-sm font-semibold">
                      1
                    </span>
                    <h2 className="text-ds-xl font-semibold text-surface-fg">Install</h2>
                  </div>
                  <InstallTabs />
                </section>

                <section className="flex flex-col gap-ds-04">
                  <div className="flex items-baseline gap-ds-02">
                    <span className="inline-flex h-ds-md w-ds-md items-center justify-center rounded-pill bg-accent-9 text-accent-fg text-ds-sm font-semibold">
                      2
                    </span>
                    <h2 className="text-ds-xl font-semibold text-surface-fg">Paste this CSS</h2>
                  </div>
                  <p className="text-ds-sm text-surface-fg-muted">
                    Drop into your global stylesheet, <em>after</em> the{' '}
                    <code className="font-mono text-ds-xs text-surface-fg">@import "@devalok/shilp-sutra/css";</code>{' '}
                    line. Reloads pick it up immediately.
                  </p>
                  <ResultActions css={css} />
                </section>

                <section className="flex flex-col gap-ds-04">
                  <div className="flex items-baseline gap-ds-02">
                    <span className="inline-flex h-ds-md w-ds-md items-center justify-center rounded-pill bg-accent-9 text-accent-fg text-ds-sm font-semibold">
                      3
                    </span>
                    <h2 className="text-ds-xl font-semibold text-surface-fg">
                      Verify with a button + card
                    </h2>
                  </div>
                  <p className="text-ds-sm text-surface-fg-muted">
                    Open any page that uses{' '}
                    <code className="font-mono text-ds-xs text-surface-fg">Button</code> and{' '}
                    <code className="font-mono text-ds-xs text-surface-fg">Card</code>. The radius
                    + accent should match the preview on the right.
                  </p>
                </section>
              </div>

              <aside className="flex flex-col gap-ds-04 lg:sticky lg:top-[5.5rem] lg:self-start">
                <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                  Live preview
                </span>
                <PreviewFrame
                  archetype={archetype}
                  density={density}
                  shape={shape}
                  hue={hue}
                  chroma={chroma}
                  size="full"
                />
                <div className="flex flex-col gap-ds-02 text-ds-sm">
                  <Link href="/themer" className="text-surface-fg-muted hover:text-surface-fg">
                    ← Try a different path
                  </Link>
                  <Link
                    href="/themer/archetypes"
                    className="text-surface-fg-muted hover:text-surface-fg"
                  >
                    See other archetypes
                  </Link>
                  <Link
                    href="/docs/customize-brand"
                    className="text-accent-11 underline underline-offset-2"
                  >
                    Customize-brand recipe →
                  </Link>
                </div>
              </aside>
            </div>

            <section className="border-t border-surface-border-subtle pt-ds-08 flex flex-col gap-ds-03 max-w-2xl">
              <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                Want to tweak more?
              </span>
              <p className="text-ds-md text-surface-fg-muted leading-relaxed">
                This snippet covers the headline tokens — radius, accent ramp. Everything else (font
                stack, spacing scale, focus ring, texture) is overridable the same way: write the
                CSS variable in <code className="font-mono text-ds-sm text-surface-fg">:root</code>{' '}
                and it cascades to every component. See the{' '}
                <Link href="/docs/customize-brand" className="text-accent-11 underline underline-offset-2">
                  customize-brand recipe
                </Link>{' '}
                for the full variable list.
              </p>
            </section>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  )
}
