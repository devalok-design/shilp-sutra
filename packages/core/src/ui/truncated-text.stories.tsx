import type { Meta, StoryObj } from '@storybook/react-vite'

import { TruncatedText } from './truncated-text'

const meta: Meta<typeof TruncatedText> = {
  title: 'Components/Typography/TruncatedText',
  component: TruncatedText,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof TruncatedText>

const LONG_NAME = 'Aaravindhan Venkataraghavan Subramaniam'
const LONG_FILE = 'Q3-2026-board-deck-final-revised-APPROVED-v7.pdf'
const LONG_BODY =
  'This project description runs well beyond two lines so that the line-clamp mode has something to actually clamp against and a tooltip to recover the rest.'

/** A narrow box so every mode actually overflows. Inline width so it works without a TW rescan. */
function Box({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ width: 220 }}
      className="rounded-surface border border-border-subtle bg-surface-panel p-ds-04"
    >
      {children}
    </div>
  )
}

export const End: Story = {
  render: () => (
    <Box>
      <TruncatedText>{LONG_NAME}</TruncatedText>
    </Box>
  ),
}

export const Middle: Story = {
  name: 'Middle (filenames)',
  render: () => (
    <Box>
      <TruncatedText mode="middle">{LONG_FILE}</TruncatedText>
    </Box>
  ),
}

export const Clamp: Story = {
  name: 'Clamp (multi-line)',
  render: () => (
    <Box>
      <TruncatedText as="p" mode="clamp" lines={2} className="text-ds-sm text-surface-fg-subtle">
        {LONG_BODY}
      </TruncatedText>
    </Box>
  ),
}

export const FitsNoTruncation: Story = {
  name: 'Fits (no tooltip)',
  render: () => (
    <Box>
      <TruncatedText>Short name</TruncatedText>
    </Box>
  ),
}

export const InFlexRow: Story = {
  name: 'In a flex row (needs min-w-0)',
  render: () => (
    <div style={{ width: 260 }} className="flex items-center gap-ds-03 rounded-surface border border-border-subtle bg-surface-panel p-ds-04">
      <span className="size-8 shrink-0 rounded-pill bg-accent-3" aria-hidden />
      {/* min-w-0 lets the truncating item shrink below its content width */}
      <TruncatedText className="min-w-0 flex-1 font-medium">{LONG_NAME}</TruncatedText>
    </div>
  ),
}
