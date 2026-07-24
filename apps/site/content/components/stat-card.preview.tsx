'use client'

import { IconCurrencyDollar, IconUsers } from '@tabler/icons-react'
import { StatCard } from '@devalok/shilp-sutra/ui/stat-card'

export function StatCardHero() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-04 max-w-2xl">
      <StatCard
        label="Monthly Revenue"
        value="$48,200"
        delta={{ value: '+12%', direction: 'up' }}
        comparisonLabel="vs last month"
        icon={<IconCurrencyDollar />}
        accentStyle="icon"
        sparkline={[12, 18, 15, 22, 19, 28, 34]}
      />
      <StatCard
        label="Active Users"
        value={8420}
        delta={{ value: '−3%', direction: 'down' }}
        comparisonLabel="vs last week"
        icon={<IconUsers />}
      />
    </div>
  )
}

export function StatCardVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="variant">
        <StatCard variant="default" label="Default" value="1,204" delta={{ value: '+4%', direction: 'up' }} />
        <StatCard variant="elevated" label="Elevated" value="1,204" delta={{ value: '+4%', direction: 'up' }} />
        <StatCard variant="outline" label="Outline" value="1,204" delta={{ value: '+4%', direction: 'up' }} />
      </Block>

      <Block title="accentStyle">
        <StatCard accentStyle="none" label="None" value="98%" icon={<IconUsers />} />
        <StatCard accentStyle="icon" label="Icon chip" value="98%" icon={<IconUsers />} />
        <StatCard accentStyle="tint" label="Tint wash" value="98%" icon={<IconUsers />} />
      </Block>

      <Block title="progress + secondary">
        <StatCard
          label="Storage Used"
          value="4.2 GB"
          secondaryLabel="of 10 GB plan"
          progress={42}
        />
      </Block>

      <Block title="loading">
        <StatCard label="Users" value={0} loading />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-03">{children}</div>
    </div>
  )
}
