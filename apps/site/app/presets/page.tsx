import type { Metadata } from 'next'
import Link from 'next/link'
import { IconArrowRight, IconSparkles } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getAllPresets } from '@/lib/presets-registry'

export const metadata: Metadata = {
  title: 'Preset Library · shilp-sutra',
  description:
    'Pre-assembled, real-world screens built from shilp-sutra components — copy them, own them, or tell your AI agent to install one. shadcn-compatible registry.',
}

export default function PresetsIndexPage() {
  const presets = getAllPresets()

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <PageHeader
            eyebrow="Preset Library"
            title="Screens, pre-assembled from the system"
            description="Real-world compositions built from shilp-sutra components. Copy the source and own it, or point your AI agent at our registry and let it install one for you."
          />

          {/* AI-native install pitch */}
          <div className="mb-ds-08 flex flex-col gap-ds-02 rounded-control border border-surface-border bg-surface-raised p-ds-05">
            <div className="flex items-center gap-ds-02 text-accent-11">
              <IconSparkles size={16} />
              <Text variant="label-md">Install by asking</Text>
            </div>
            <Text variant="body-md" className="text-surface-fg-muted">
              Register the <code className="font-mono">@devalok</code> namespace in your{' '}
              <code className="font-mono">components.json</code> once, then tell your AI agent
              &ldquo;<span className="text-surface-fg">add the @devalok/sidebar-app preset</span>&rdquo; —
              it pulls the source into your codebase and installs what it needs. Works with the shadcn CLI
              and any shadcn-compatible MCP.
            </Text>
          </div>

          <div className="grid gap-ds-05 sm:grid-cols-2">
            {presets.map((preset) => (
              <Link
                key={preset.slug}
                href={`/presets/${preset.slug}`}
                className="group flex flex-col gap-ds-03 rounded-control border border-surface-border bg-surface-raised p-ds-05 transition-colors duration-fast-01 hover:border-surface-border-strong hover:bg-surface-raised-hover"
              >
                <div className="flex items-start justify-between gap-ds-03">
                  <Text variant="heading-xs" className="text-surface-fg">{preset.title}</Text>
                  <IconArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-surface-fg-subtle transition-transform duration-fast-01 group-hover:translate-x-0.5"
                  />
                </div>
                <Text variant="body-sm" className="text-surface-fg-muted">{preset.description}</Text>
                <code className="mt-auto w-fit rounded-control-inner bg-surface-overlay px-ds-02 py-[2px] text-ds-xs font-mono text-surface-fg-subtle">
                  {preset.installName}
                </code>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
