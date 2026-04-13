import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChart } from './bar-chart'
import { LineChart } from './line-chart'
import { AreaChart } from './area-chart'
import { PieChart } from './pie-chart'
import { Sparkline } from './sparkline'
import { GaugeChart } from './gauge-chart'
import { RadarChart } from './radar-chart'

const meta: Meta<typeof BarChart> = {
  title: 'Components/Charts/BarChart',
  component: BarChart,
  tags: ['autodocs', 'stable'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
    },
    stacked: { control: 'boolean' },
    grouped: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    showTooltip: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    animate: { control: 'boolean' },
    barRadius: { control: { type: 'range', min: 0, max: 12, step: 1 } },
    height: { control: { type: 'number', min: 150, max: 600 } },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[700px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof BarChart>

const monthlyData = [
  { month: 'Jan', value: 120 },
  { month: 'Feb', value: 95 },
  { month: 'Mar', value: 150 },
  { month: 'Apr', value: 180 },
  { month: 'May', value: 130 },
  { month: 'Jun', value: 160 },
]

const multiSeriesData = [
  { month: 'Jan', revenue: 120, costs: 80 },
  { month: 'Feb', revenue: 95, costs: 70 },
  { month: 'Mar', revenue: 150, costs: 90 },
  { month: 'Apr', revenue: 180, costs: 100 },
  { month: 'May', revenue: 130, costs: 85 },
  { month: 'Jun', revenue: 160, costs: 95 },
]

export const Default: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    height: 300,
  },
}

export const Horizontal: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    orientation: 'horizontal',
    height: 300,
  },
}

export const MultiSeries: Story = {
  args: {
    data: multiSeriesData,
    xKey: 'month',
    yKey: ['revenue', 'costs'],
    grouped: true,
    seriesLabels: ['Revenue', 'Costs'],
    height: 300,
  },
}

export const Stacked: Story = {
  args: {
    data: multiSeriesData,
    xKey: 'month',
    yKey: ['revenue', 'costs'],
    stacked: true,
    seriesLabels: ['Revenue', 'Costs'],
    height: 300,
  },
}

export const WithLegend: Story = {
  args: {
    data: multiSeriesData,
    xKey: 'month',
    yKey: ['revenue', 'costs'],
    grouped: true,
    showLegend: true,
    seriesLabels: ['Revenue', 'Costs'],
    height: 300,
  },
}

export const CustomColors: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    color: 'chart-3',
    height: 300,
  },
}

export const WithLabels: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    xLabel: 'Month',
    yLabel: 'Sales',
    height: 350,
  },
}

export const NoGrid: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    showGrid: false,
    height: 300,
  },
}

// ── Charts Overview (merged from charts.stories) ──────────

const overviewLineData = [
  { month: 'Jan', revenue: 120, costs: 80 },
  { month: 'Feb', revenue: 95, costs: 70 },
  { month: 'Mar', revenue: 150, costs: 90 },
  { month: 'Apr', revenue: 180, costs: 100 },
  { month: 'May', revenue: 130, costs: 85 },
  { month: 'Jun', revenue: 160, costs: 95 },
]

const overviewPieData = [
  { label: 'Approved', value: 45 },
  { label: 'Pending', value: 12 },
  { label: 'Rejected', value: 5 },
  { label: 'Draft', value: 8 },
]

const overviewRadarData = [
  { axis: 'Frontend', score: 85 },
  { axis: 'Backend', score: 70 },
  { axis: 'DevOps', score: 55 },
  { axis: 'Design', score: 90 },
  { axis: 'Testing', score: 75 },
]

const overviewSparkData = [4, 7, 3, 8, 5, 9, 6, 10, 7, 12]

export const Dashboard: Story = {
  name: 'Charts Overview Dashboard',
  render: () => (
    <div className="space-y-ds-06">
      <h2 className="text-ds-2xl font-semibold text-surface-fg">
        Analytics Dashboard
      </h2>
      <div className="grid grid-cols-2 gap-ds-06">
        {/* Bar Chart */}
        <div className="rounded-ds-lg border border-surface-border p-ds-05">
          <h3 className="mb-ds-04 text-ds-md font-medium text-surface-fg-muted">
            Monthly Revenue
          </h3>
          <BarChart data={monthlyData} xKey="month" yKey="value" height={250} />
        </div>

        {/* Line Chart */}
        <div className="rounded-ds-lg border border-surface-border p-ds-05">
          <h3 className="mb-ds-04 text-ds-md font-medium text-surface-fg-muted">
            Revenue vs Costs
          </h3>
          <LineChart
            data={overviewLineData}
            xKey="month"
            series={[
              { key: 'revenue', label: 'Revenue', color: 'chart-1' },
              { key: 'costs', label: 'Costs', color: 'chart-2' },
            ]}
            curved
            showLegend
            height={250}
          />
        </div>

        {/* Area Chart */}
        <div className="rounded-ds-lg border border-surface-border p-ds-05">
          <h3 className="mb-ds-04 text-ds-md font-medium text-surface-fg-muted">
            Revenue Trend
          </h3>
          <AreaChart
            data={overviewLineData}
            xKey="month"
            series={[{ key: 'revenue', label: 'Revenue' }]}
            gradient
            height={250}
          />
        </div>

        {/* Pie Chart */}
        <div className="rounded-ds-lg border border-surface-border p-ds-05">
          <h3 className="mb-ds-04 text-ds-md font-medium text-surface-fg-muted">
            Leave Status
          </h3>
          <PieChart data={overviewPieData} variant="donut" showLegend height={250} />
        </div>

        {/* Radar Chart */}
        <div className="rounded-ds-lg border border-surface-border p-ds-05">
          <h3 className="mb-ds-04 text-ds-md font-medium text-surface-fg-muted">
            Skills Assessment
          </h3>
          <RadarChart
            data={overviewRadarData}
            axes={['Frontend', 'Backend', 'DevOps', 'Design', 'Testing']}
            series={[{ key: 'score', label: 'Score' }]}
            showDots
            height={280}
          />
        </div>

        {/* Gauges + Sparklines */}
        <div className="rounded-ds-lg border border-surface-border p-ds-05">
          <h3 className="mb-ds-04 text-ds-md font-medium text-surface-fg-muted">
            KPI Summary
          </h3>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <GaugeChart value={73} label="Attendance" height={120} />
            </div>
            <div className="text-center">
              <GaugeChart value={89} label="On-time" color="chart-4" height={120} />
            </div>
            <div className="text-center">
              <GaugeChart value={45} label="Utilization" color="chart-2" height={120} />
            </div>
          </div>
          <div className="mt-ds-05 flex items-center justify-around text-ds-sm text-surface-fg-muted">
            <div className="flex items-center gap-ds-02">
              Revenue <Sparkline data={overviewSparkData} variant="line" color="chart-1" />
            </div>
            <div className="flex items-center gap-ds-02">
              Users{' '}
              <Sparkline
                data={[3, 5, 2, 8, 4, 7, 6, 9]}
                variant="area"
                color="chart-4"
              />
            </div>
            <div className="flex items-center gap-ds-02">
              Tasks{' '}
              <Sparkline
                data={[8, 6, 7, 5, 9, 4, 8, 10]}
                variant="bar"
                color="chart-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}
