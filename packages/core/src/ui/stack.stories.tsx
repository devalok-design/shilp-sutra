import type { Meta, StoryObj } from '@storybook/react'
import { cn } from './lib/utils'
import { Stack } from './stack'

const meta: Meta<typeof Stack> = {
  title: 'UI/Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    gap: {
      control: 'select',
      options: ['ds-01', 'ds-02', 'ds-03', 'ds-04', 'ds-05', 'ds-06', 'ds-08'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Stack>

const Box = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => (
  <div
    className={cn('rounded-ds-md border border-surface-border-strong bg-surface-2 px-ds-04 py-ds-03 text-ds-sm text-surface-fg', wide && 'w-32')}
  >
    {children}
  </div>
)

export const Vertical: Story = {
  args: {
    direction: 'vertical',
    gap: 'ds-04',
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
}

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
    gap: 'ds-04',
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
}

export const HorizontalCentered: Story = {
  args: {
    direction: 'horizontal',
    gap: 'ds-04',
    align: 'center',
    children: (
      <>
        <Box>Short</Box>
        <div className="rounded-ds-md border border-surface-border-strong bg-surface-2 px-ds-04 py-ds-06 text-ds-sm text-surface-fg">
          Tall
        </div>
        <Box>Short</Box>
      </>
    ),
  },
}

export const SpaceBetween: Story = {
  args: {
    direction: 'horizontal',
    justify: 'between',
    align: 'center',
    children: (
      <>
        <Box>Left</Box>
        <Box>Right</Box>
      </>
    ),
  },
}

export const Wrapped: Story = {
  args: {
    direction: 'horizontal',
    gap: 'ds-03',
    wrap: true,
    children: (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <Box key={i} wide>
            Item {i + 1}
          </Box>
        ))}
      </>
    ),
  },
}

export const AsNav: Story = {
  args: {
    as: 'nav',
    direction: 'horizontal',
    gap: 'ds-04',
    align: 'center',
    children: (
      <>
        <Box>Home</Box>
        <Box>About</Box>
        <Box>Contact</Box>
      </>
    ),
  },
}

const gaps = ['ds-01', 'ds-02', 'ds-03', 'ds-04', 'ds-05', 'ds-06'] as const
const alignments = ['start', 'center', 'end', 'stretch', 'baseline'] as const

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-08">
      {/* Direction */}
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Direction</p>
        <div className="flex flex-col gap-ds-05">
          <div>
            <p className="mb-ds-02 text-ds-xs text-surface-fg-muted">vertical</p>
            <Stack direction="vertical" gap="ds-03">
              <Box>A</Box>
              <Box>B</Box>
              <Box>C</Box>
            </Stack>
          </div>
          <div>
            <p className="mb-ds-02 text-ds-xs text-surface-fg-muted">horizontal</p>
            <Stack direction="horizontal" gap="ds-03">
              <Box>A</Box>
              <Box>B</Box>
              <Box>C</Box>
            </Stack>
          </div>
        </div>
      </div>

      {/* Gap scale */}
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Gap scale</p>
        <div className="flex flex-col gap-ds-04">
          {gaps.map((gap) => (
            <div key={gap}>
              <p className="mb-ds-02 text-ds-xs text-surface-fg-muted">{gap}</p>
              <Stack direction="horizontal" gap={gap}>
                <Box>A</Box>
                <Box>B</Box>
                <Box>C</Box>
              </Stack>
            </div>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Align (horizontal)</p>
        <div className="flex flex-col gap-ds-04">
          {alignments.map((alignment) => (
            <div key={alignment}>
              <p className="mb-ds-02 text-ds-xs text-surface-fg-muted">{alignment}</p>
              <Stack
                direction="horizontal"
                gap="ds-03"
                align={alignment}
                className="rounded-ds-md border border-dashed border-surface-border-strong p-ds-03"
                style={{ minHeight: 80 }}
              >
                <Box>Short</Box>
                <div className="rounded-ds-md border border-surface-border-strong bg-surface-2 px-ds-04 py-ds-06 text-ds-sm text-surface-fg">
                  Tall
                </div>
                <Box>Short</Box>
              </Stack>
            </div>
          ))}
        </div>
      </div>

      {/* Justify */}
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Justify</p>
        <div className="flex flex-col gap-ds-04">
          {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((j) => (
            <div key={j}>
              <p className="mb-ds-02 text-ds-xs text-surface-fg-muted">{j}</p>
              <Stack
                direction="horizontal"
                gap="ds-03"
                justify={j}
                className="rounded-ds-md border border-dashed border-surface-border-strong p-ds-03"
              >
                <Box>A</Box>
                <Box>B</Box>
                <Box>C</Box>
              </Stack>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}
