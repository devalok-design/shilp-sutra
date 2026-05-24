import type { Metadata } from 'next'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Theming',
  description:
    'Build your own brand on shilp-sutra. OKLCH accent editor with live preview, twelve-step ramp generation, and CSS export.',
}

// Phase 8 will replace this with the live OKLCH editor.
// This stub exists so the chrome BrandSwitcher's "Build your own →" doesn't 404.
export default function ThemingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-ds-page-x py-ds-13">
          <div className="flex flex-col gap-ds-05">
            <Text variant="label-md" className="text-surface-fg-subtle">
              Theming
            </Text>
            <Text variant="heading-2xl" className="text-surface-fg">
              Build your own brand. Live.
            </Text>
            <Text variant="body-md" className="text-surface-fg-muted">
              The accent ramp generator is coming in the next site update. For now, pick from the
              shipped presets in the header, or edit the OKLCH primitives in your consumer CSS
              directly. The customize-brand recipe documents the override pattern step by step.
            </Text>
            <div className="mt-ds-04 inline-flex items-center gap-ds-02 rounded-ds-sm border border-warning-6 bg-warning-2 px-ds-04 py-ds-03 max-w-fit">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning-9" />
              <Text variant="body-xs" className="text-warning-11">
                Phase 8 lands shortly. The live editor with H/C/L sliders is on the next release.
              </Text>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
