import { preview } from '#.storybook/preview'

import { UnreadSeparator } from './unread-separator'

const meta = preview.meta({
  title: 'Components/Chat/UnreadSeparator',
  component: UnreadSeparator,
  tags: ['autodocs', 'stable'],
  argTypes: {
    label: { control: 'text' },
    count: { control: 'number' },
  },
  decorators: [
    (Story: any) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
})
export default meta

export const Default = meta.story({})

/** With a count, the label reads as a unit: "3 NEW". */
export const WithCount = meta.story({
  args: { count: 3 },
})

/**
 * `count` is rendered only when truthy, so `0` shows the bare label rather
 * than "0 NEW" — a marker for zero unread messages would not make sense.
 */
export const ZeroCountFallsBackToLabel = meta.story({
  args: { count: 0 },
})

export const CustomLabel = meta.story({
  args: { label: 'UNREAD', count: 12 },
})

/** In place: the rule marks where the reader last left off. */
export const InAMessageList = meta.story({
  render: () => (
    <div className="flex flex-col gap-ds-03 rounded-surface bg-surface-panel p-ds-05">
      <p className="text-body-sm text-surface-fg">
        Shipped the density cascade — one mode now re-pads every cell.
      </p>
      <p className="text-body-sm text-surface-fg">Nice. Did the header row follow?</p>
      <UnreadSeparator count={2} />
      <p className="text-body-sm text-surface-fg">
        It did, all sixteen. Numbers match the CSS to the pixel.
      </p>
      <p className="text-body-sm text-surface-fg">Then let&rsquo;s publish.</p>
    </div>
  ),
})
