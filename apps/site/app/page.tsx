import { AgentCallout } from '@/components/agent-callout'
import { FeatureGrid } from '@/components/feature-grid'
import { Hero } from '@/components/hero'
import { InstallSection } from '@/components/install-section'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <InstallSection />
        <FeatureGrid />
        <AgentCallout />
      </main>
      <SiteFooter />
    </>
  )
}
