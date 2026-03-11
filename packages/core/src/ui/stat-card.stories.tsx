import type { Meta, StoryObj } from '@storybook/react'
import { StatCard } from './stat-card'

const meta: Meta<typeof StatCard> = {
  title: 'UI/Data Display/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    loading: { control: 'boolean' },
    accent: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
    progress: { control: { type: 'range', min: 0, max: 100 } },
  },
}
export default meta
type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    label: 'Total Projects',
    value: 24,
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithDeltaUp: Story = {
  args: {
    label: 'Active Tasks',
    value: 142,
    delta: { value: '+12% from last month', direction: 'up' },
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithDeltaDown: Story = {
  args: {
    label: 'Open Issues',
    value: 8,
    delta: { value: '-3 from last week', direction: 'down' },
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithDeltaNeutral: Story = {
  args: {
    label: 'Team Members',
    value: 12,
    delta: { value: 'No change', direction: 'neutral' },
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithIcon: Story = {
  args: {
    label: 'Revenue',
    value: '$45,231',
    delta: { value: '+20.1% from last month', direction: 'up' },
    icon: <span className="text-ds-lg">$</span>,
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const Loading: Story = {
  args: {
    label: 'Loading...',
    value: 0,
    loading: true,
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-ds-04">
      <StatCard
        label="Total Lokwasi"
        value={24}
        delta={{ value: '+2 this month', direction: 'up' }}
      />
      <StatCard
        label="Active Projects"
        value={8}
        delta={{ value: '+1 from last month', direction: 'up' }}
      />
      <StatCard
        label="Pending Breaks"
        value={3}
        delta={{ value: '-2 from yesterday', direction: 'down' }}
      />
      <StatCard
        label="Attendance Rate"
        value="96%"
        delta={{ value: 'No change', direction: 'neutral' }}
      />
    </div>
  ),
}

/* ── New stories for enhanced features ── */

export const WithSparkline: Story = {
  args: {
    label: 'Monthly Revenue',
    value: '$48,200',
    delta: { value: '+12%', direction: 'up' },
    sparkline: [22, 28, 25, 31, 27, 35, 33, 40, 38, 42, 45, 48],
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
}

export const WithProgress: Story = {
  args: {
    label: 'Quarterly Target',
    value: '$48,200',
    secondaryLabel: 'of $50,000 target',
    progress: 86,
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
}

export const WithAccent: Story = {
  args: {
    label: 'Error Rate',
    value: '2.4%',
    delta: { value: '+0.8%', direction: 'up' },
    accent: 'error',
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithComparison: Story = {
  args: {
    label: 'Active Users',
    value: '1,842',
    delta: { value: '+12%', direction: 'up' },
    comparisonLabel: 'vs last month',
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
}

export const Clickable: Story = {
  args: {
    label: 'Open Tickets',
    value: 42,
    delta: { value: '-5', direction: 'down' },
    onClick: () => alert('StatCard clicked!'),
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const FullFeatured: Story = {
  args: {
    label: 'Monthly Revenue',
    value: '$48,200',
    delta: { value: '+12%', direction: 'up' },
    comparisonLabel: 'vs last month',
    secondaryLabel: 'of $50,000 target',
    progress: 96,
    accent: 'success',
    sparkline: [22, 28, 25, 31, 27, 35, 33, 40, 38, 42, 45, 48],
    onClick: () => alert('View revenue details'),
  },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
}

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-ds-04">
      <StatCard
        label="Revenue"
        value="48,200"
        prefix="$"
        delta={{ value: '+12%', direction: 'up' }}
        comparisonLabel="vs last month"
        accent="success"
        sparkline={[22, 28, 25, 31, 27, 35, 33, 40, 38, 42, 45, 48]}
        onClick={() => {}}
      />
      <StatCard
        label="Active Users"
        value="1,842"
        delta={{ value: '+8%', direction: 'up' }}
        comparisonLabel="vs last week"
        accent="info"
        sparkline={[150, 162, 158, 170, 165, 175, 180, 184]}
      />
      <StatCard
        label="Conversion Rate"
        value="3.2%"
        delta={{ value: '-0.4%', direction: 'down' }}
        comparisonLabel="vs last month"
        accent="warning"
        secondaryLabel="target: 4.0%"
        progress={72}
      />
      <StatCard
        label="Error Rate"
        value="0.12%"
        delta={{ value: '+0.02%', direction: 'up' }}
        accent="error"
        sparkline={[0.08, 0.09, 0.1, 0.11, 0.09, 0.1, 0.12]}
      />
    </div>
  ),
}

/* ── Edge case and new feature stories ── */

export const ProgressEdgeCases: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-ds-04">
      <StatCard
        label="Not Started"
        value="0%"
        progress={0}
        secondaryLabel="of 100 target"
      />
      <StatCard
        label="Complete"
        value="100%"
        progress={100}
        accent="success"
        secondaryLabel="target reached"
      />
      <StatCard
        label="Overflow (clamped)"
        value="142%"
        progress={142}
        accent="warning"
        secondaryLabel="over target — clamped to 100"
      />
    </div>
  ),
}

export const SparklineFlatLine: Story = {
  args: {
    label: 'Flat Metric',
    value: 5,
    sparkline: [5, 5, 5, 5, 5],
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
}

export const SparklineSinglePoint: Story = {
  args: {
    label: 'Single Data Point',
    value: 42,
    sparkline: [42],
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
}

export const WithPrefixSuffix: Story = {
  args: {
    label: 'Total Revenue',
    value: '48,200',
    prefix: '$',
    suffix: ' revenue',
    delta: { value: '+12%', direction: 'up' },
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
}

export const WithFooter: Story = {
  args: {
    label: 'Active Users',
    value: '1,842',
    delta: { value: '+8%', direction: 'up' },
    footer: (
      <a href="#" className="text-interactive hover:underline">
        View details &rarr;
      </a>
    ),
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
}

export const ClickableWithHref: Story = {
  args: {
    label: 'Open Tickets',
    value: 42,
    delta: { value: '-5', direction: 'down' },
    href: '/tickets',
    onClick: () => console.log('StatCard link clicked'),
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const LoadingWithAccent: Story = {
  args: {
    label: 'Revenue',
    value: 0,
    loading: true,
    accent: 'success',
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}
