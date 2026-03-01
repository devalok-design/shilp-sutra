import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DatePicker, DateRangePicker, CalendarGrid } from './date-picker'

// --- DatePicker ---

const datePickerMeta: Meta<typeof DatePicker> = {
  title: 'Shared/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
}
export default datePickerMeta
type DatePickerStory = StoryObj<typeof DatePicker>

export const Default: DatePickerStory = {
  args: {},
}

export const WithValue: DatePickerStory = {
  args: {
    value: new Date(2026, 2, 15),
    formatStr: 'MMM d, yyyy',
  },
}

export const CustomPlaceholder: DatePickerStory = {
  args: {
    placeholder: 'Select due date',
  },
}

export const CustomFormat: DatePickerStory = {
  args: {
    value: new Date(2026, 2, 1),
    formatStr: 'dd/MM/yyyy',
  },
}

export const Controlled: DatePickerStory = {
  render: () => {
    const ControlledDatePicker = () => {
      const [date, setDate] = useState<Date | null>(null)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Selected: {date ? date.toLocaleDateString() : 'None'}
          </p>
        </div>
      )
    }
    return <ControlledDatePicker />
  },
}

// --- DateRangePicker ---

export const RangeDefault: DatePickerStory = {
  render: () => <DateRangePicker />,
}

export const RangeWithValue: DatePickerStory = {
  render: () => (
    <DateRangePicker
      startDate={new Date(2026, 2, 1)}
      endDate={new Date(2026, 2, 15)}
    />
  ),
}

export const RangeCustomPlaceholder: DatePickerStory = {
  render: () => (
    <DateRangePicker placeholder="Select sprint dates" />
  ),
}

export const RangeControlled: DatePickerStory = {
  render: () => {
    const ControlledRange = () => {
      const [start, setStart] = useState<Date | null>(null)
      const [end, setEnd] = useState<Date | null>(null)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DateRangePicker
            startDate={start}
            endDate={end}
            onChange={(range) => {
              setStart(range.start)
              setEnd(range.end)
            }}
          />
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Start: {start ? start.toLocaleDateString() : 'None'} | End: {end ? end.toLocaleDateString() : 'None'}
          </p>
        </div>
      )
    }
    return <ControlledRange />
  },
}

// --- CalendarGrid ---

export const CalendarGridDefault: DatePickerStory = {
  render: () => {
    const CalendarGridDemo = () => {
      const [month, setMonth] = useState(new Date(2026, 2, 1))
      const [selected, setSelected] = useState<Date | null>(null)
      return (
        <div style={{ padding: 16, border: '1px solid var(--color-border-default)', borderRadius: 12, display: 'inline-block', background: 'var(--color-layer-01)' }}>
          <CalendarGrid
            currentMonth={month}
            selected={selected}
            onSelect={setSelected}
            onMonthChange={setMonth}
          />
        </div>
      )
    }
    return <CalendarGridDemo />
  },
}

export const CalendarGridWithSelection: DatePickerStory = {
  render: () => {
    const CalendarGridWithSel = () => {
      const [month, setMonth] = useState(new Date(2026, 2, 1))
      return (
        <div style={{ padding: 16, border: '1px solid var(--color-border-default)', borderRadius: 12, display: 'inline-block', background: 'var(--color-layer-01)' }}>
          <CalendarGrid
            currentMonth={month}
            selected={new Date(2026, 2, 15)}
            onSelect={() => {}}
            onMonthChange={setMonth}
          />
        </div>
      )
    }
    return <CalendarGridWithSel />
  },
}

export const CalendarGridWithRange: DatePickerStory = {
  render: () => {
    const CalendarGridRange = () => {
      const [month, setMonth] = useState(new Date(2026, 2, 1))
      return (
        <div style={{ padding: 16, border: '1px solid var(--color-border-default)', borderRadius: 12, display: 'inline-block', background: 'var(--color-layer-01)' }}>
          <CalendarGrid
            currentMonth={month}
            rangeStart={new Date(2026, 2, 8)}
            rangeEnd={new Date(2026, 2, 22)}
            onSelect={() => {}}
            onMonthChange={setMonth}
          />
        </div>
      )
    }
    return <CalendarGridRange />
  },
}

export const BothPickers: DatePickerStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Single Date Picker
        </p>
        <DatePicker value={new Date(2026, 2, 15)} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Date Range Picker
        </p>
        <DateRangePicker startDate={new Date(2026, 2, 1)} endDate={new Date(2026, 2, 15)} />
      </div>
    </div>
  ),
}
