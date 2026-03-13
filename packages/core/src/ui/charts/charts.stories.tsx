import type { Meta, StoryObj } from '@storybook/react'
import { BarChart } from './bar-chart'
import { LineChart } from './line-chart'
import { AreaChart } from './area-chart'
import { PieChart } from './pie-chart'
import { Sparkline } from './sparkline'
import { GaugeChart } from './gauge-chart'
import { RadarChart } from './radar-chart'

const meta: Meta = {
  title: 'UI/Charts/Overview',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

// Sample data for each chart type
const barData = [
  { month: 'Jan', value: 120 },
  { month: 'Feb', value: 95 },
  { month: 'Mar', value: 150 },
  { month: 'Apr', value: 180 },
  { month: 'May', value: 130 },
  { month: 'Jun', value: 160 },
]

const lineData = [
  { month: 'Jan', revenue: 120, costs: 80 },
  { month: 'Feb', revenue: 95, costs: 70 },
  { month: 'Mar', revenue: 150, costs: 90 },
  { month: 'Apr', revenue: 180, costs: 100 },
  { month: 'May', revenue: 130, costs: 85 },
  { month: 'Jun', revenue: 160, costs: 95 },
]

const pieData = [
  { label: 'Approved', value: 45 },
  { label: 'Pending', value: 12 },
  { label: 'Rejected', value: 5 },
  { label: 'Draft', value: 8 },
]

const radarData = [
  { axis: 'Frontend', score: 85 },
  { axis: 'Backend', score: 70 },
  { axis: 'DevOps', score: 55 },
  { axis: 'Design', score: 90 },
  { axis: 'Testing', score: 75 },
]

const sparkData = [4, 7, 3, 8, 5, 9, 6, 10, 7, 12]

export const Dashboard: StoryObj = {
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
          <BarChart data={barData} xKey="month" yKey="value" height={250} />
        </div>

        {/* Line Chart */}
        <div className="rounded-ds-lg border border-surface-border p-ds-05">
          <h3 className="mb-ds-04 text-ds-md font-medium text-surface-fg-muted">
            Revenue vs Costs
          </h3>
          <LineChart
            data={lineData}
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
            data={lineData}
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
          <PieChart data={pieData} variant="donut" showLegend height={250} />
        </div>

        {/* Radar Chart */}
        <div className="rounded-ds-lg border border-surface-border p-ds-05">
          <h3 className="mb-ds-04 text-ds-md font-medium text-surface-fg-muted">
            Skills Assessment
          </h3>
          <RadarChart
            data={radarData}
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
              Revenue <Sparkline data={sparkData} variant="line" color="chart-1" />
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
