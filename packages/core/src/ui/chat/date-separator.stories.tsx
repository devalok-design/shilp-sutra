import { preview } from '#.storybook/preview'

import { DateSeparator } from './date-separator'

const meta = preview.meta({
  title: 'Components/Chat/DateSeparator',
  component: DateSeparator,
  tags: ['autodocs', 'stable'],
  argTypes: {
    date: { control: 'date' },
    locale: { control: 'text' },
    timeZone: { control: 'text' },
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

// Anchored relative to render time so "Today" and "Yesterday" stay correct
// whenever the story is opened, rather than going stale on a fixed date.
const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export const Today = meta.story({
  args: { date: new Date() },
})

export const Yesterday = meta.story({
  args: { date: daysAgo(1) },
})

/** Past this week the label switches to a month and day. */
export const EarlierThisYear = meta.story({
  args: { date: daysAgo(30) },
})

/** A different year gains the year, so an old thread is never ambiguous. */
export const PreviousYear = meta.story({
  args: { date: daysAgo(400) },
})

/**
 * `locale` only affects the month name — "Today" and "Yesterday" are the
 * component's own strings and are not translated. Pass `format` if you need
 * those localised too.
 */
export const Localised = meta.story({
  args: { date: daysAgo(30), locale: 'de-DE' },
})

/**
 * `timeZone` decides which calendar day a timestamp falls on, so the same
 * instant can read as two different days for two readers. Both stories below
 * render the same `Date`.
 */
export const TimeZoneShiftsTheDay = meta.story({
  render: () => {
    // 01:30 UTC — already "today" in Kolkata, still "yesterday" in Los Angeles.
    const instant = new Date()
    instant.setUTCHours(1, 30, 0, 0)
    return (
      <div className="flex flex-col gap-ds-05">
        <div>
          <p className="mb-ds-02 text-body-xs text-surface-fg-subtle">Asia/Kolkata</p>
          <DateSeparator date={instant} timeZone="Asia/Kolkata" />
        </div>
        <div>
          <p className="mb-ds-02 text-body-xs text-surface-fg-subtle">America/Los_Angeles</p>
          <DateSeparator date={instant} timeZone="America/Los_Angeles" />
        </div>
      </div>
    )
  },
})

/** `format` replaces the label entirely. */
export const CustomFormat = meta.story({
  args: {
    date: daysAgo(3),
    format: (d: Date) =>
      d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
  },
})

/** An ISO string is accepted and parsed. */
export const FromISOString = meta.story({
  args: { date: '2026-03-24T09:00:00Z' },
})
