import type { Meta, StoryObj } from '@storybook/react'
import { RadarChart } from './radar-chart'

const meta: Meta<typeof RadarChart> = {
  title: 'UI/Charts/RadarChart',
  component: RadarChart,
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'number', min: 200, max: 600 } },
    levels: { control: { type: 'range', min: 2, max: 10, step: 1 } },
    fillOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    showDots: { control: 'boolean' },
    showTooltip: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    animate: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[500px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof RadarChart>

const skillData = [
  { axis: 'Frontend', alice: 85, bob: 65 },
  { axis: 'Backend', alice: 70, bob: 90 },
  { axis: 'DevOps', alice: 55, bob: 80 },
  { axis: 'Design', alice: 90, bob: 40 },
  { axis: 'Testing', alice: 75, bob: 70 },
]

export const Default: Story = {
  args: {
    data: skillData,
    axes: ['Frontend', 'Backend', 'DevOps', 'Design', 'Testing'],
    series: [{ key: 'alice', label: 'Alice' }],
    height: 350,
    showDots: true,
  },
}

export const MultipleSeries: Story = {
  args: {
    data: skillData,
    axes: ['Frontend', 'Backend', 'DevOps', 'Design', 'Testing'],
    series: [
      { key: 'alice', label: 'Alice' },
      { key: 'bob', label: 'Bob' },
    ],
    height: 350,
    showDots: true,
    showLegend: true,
    maxValue: 100,
  },
}

const teamSkillData = [
  { axis: 'React', dev: 92, design: 40, qa: 55 },
  { axis: 'TypeScript', dev: 88, design: 30, qa: 60 },
  { axis: 'CSS/UI', dev: 65, design: 95, qa: 45 },
  { axis: 'Testing', dev: 70, design: 25, qa: 95 },
  { axis: 'CI/CD', dev: 78, design: 15, qa: 72 },
  { axis: 'Documentation', dev: 55, design: 70, qa: 80 },
  { axis: 'Architecture', dev: 82, design: 50, qa: 60 },
]

export const SkillAssessment: Story = {
  args: {
    data: teamSkillData,
    axes: ['React', 'TypeScript', 'CSS/UI', 'Testing', 'CI/CD', 'Documentation', 'Architecture'],
    series: [
      { key: 'dev', label: 'Development' },
      { key: 'design', label: 'Design' },
      { key: 'qa', label: 'QA' },
    ],
    maxValue: 100,
    height: 400,
    showDots: true,
    showLegend: true,
    showTooltip: true,
  },
}

export const Customized: Story = {
  args: {
    data: skillData,
    axes: ['Frontend', 'Backend', 'DevOps', 'Design', 'Testing'],
    series: [
      { key: 'alice', label: 'Alice', color: '#8b5cf6' },
      { key: 'bob', label: 'Bob', color: '#f97316' },
    ],
    maxValue: 100,
    height: 350,
    levels: 4,
    fillOpacity: 0.4,
    showDots: true,
    showLegend: true,
  },
}
