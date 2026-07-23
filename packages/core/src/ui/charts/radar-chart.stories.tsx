import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { RadarChart } from './radar-chart'

const meta: Meta<typeof RadarChart> = {
  title: 'Components/Charts/RadarChart',
  component: RadarChart,
  tags: ['autodocs', 'stable'],
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
      { key: 'alice', label: 'Alice', color: 'var(--color-accent-9)' },
      { key: 'bob', label: 'Bob', color: 'var(--color-warning-9)' },
    ],
    maxValue: 100,
    height: 350,
    levels: 4,
    fillOpacity: 0.4,
    showDots: true,
    showLegend: true,
  },
}

// Setu's Brand-Health view: coverage across the 13 canonical brand dimensions.
const brandDimensions = [
  'Foundation',
  'Voice',
  'Lexicon',
  'Messaging',
  'Colour',
  'Typography',
  'Logo',
  'Imagery',
  'Motion',
  'Applications',
  'Governance',
  'Architecture',
  'Exemplars',
]
const brandHealthData = brandDimensions.map((axis, i) => ({
  axis,
  coverage: [92, 88, 80, 84, 95, 90, 100, 45, 30, 70, 65, 25, 60][i],
}))
const brandDescriptions = [
  'Purpose, mission, values, positioning and audience.',
  'How the brand sounds — register, tone by context, sentence discipline.',
  'Words to use and avoid; canonical phrases and banned patterns.',
  'Tagline, positioning line, value propositions and key lines.',
  'Palette, neutrals, tints and approved colour combinations.',
  'Typefaces, scale, weights and pairing rules.',
  'Logo lockups, clear space, misuse and responsive variants.',
  'Photography, illustration, iconography and graphic elements.',
  'Motion principles, transitions and any logo animation.',
  'How the brand shows up across social, email, web and print.',
  'Asset index, ownership, versioning and usage approval.',
  'House model, sub-brands, endorsement and multi-market structure.',
  'On- and off-brand reference examples across channels.',
]

/**
 * 13 axes — the case that used to clip/overlap. Labels auto-switch to radial
 * orientation and truncate; the dashed ring is the 80% coverage target.
 */
export const BrandHealth13Axes: Story = {
  name: 'Brand health (13 axes)',
  render: () => {
    const [opened, setOpened] = React.useState<string | null>(null)
    return (
      <div>
        <RadarChart
          data={brandHealthData}
          axes={brandDimensions}
          series={[{ key: 'coverage', label: 'Coverage', color: 'var(--color-accent-9)' }]}
          maxValue={100}
          height={480}
          fillOpacity={0.3}
          showDots
          target={80}
          axisDescriptions={brandDescriptions}
          onAxisClick={(axis) => setOpened(axis)}
        />
        <p className="mt-ds-03 text-center text-ds-sm text-surface-fg-subtle">
          {opened ? `Opened dimension: ${opened}` : 'Click a spoke or label to drill into a dimension. Dashed ring = 80% target.'}
        </p>
      </div>
    )
  },
}
