import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { format } from 'date-fns'
import { DatePicker, DateRangePicker, CalendarGrid, TimePicker, DateTimePicker } from './date-picker'

// --- DatePicker ---

const datePickerMeta: Meta<typeof DatePicker> = {
  title: 'Composed/DatePicker',
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

// --- Constraints ---

export const WithConstraints: DatePickerStory = {
  render: () => (
    <DatePicker
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 11, 31)}
      disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
    />
  ),
}

export const WithMinMaxDates: DatePickerStory = {
  render: () => {
    const WithMinMax = () => {
      const [date, setDate] = useState<Date | null>(null)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DatePicker
            value={date}
            onChange={setDate}
            minDate={new Date(2026, 2, 5)}
            maxDate={new Date(2026, 2, 25)}
            placeholder="Mar 5 - Mar 25 only"
          />
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Selected: {date ? date.toLocaleDateString() : 'None'}
          </p>
        </div>
      )
    }
    return <WithMinMax />
  },
}

// --- Year/Month Picker ---

export const WithYearMonthPicker: DatePickerStory = {
  render: () => <DatePicker />,
  // This story demonstrates the month/year navigation by clicking the header
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

export const RangeWithConstraints: DatePickerStory = {
  render: () => (
    <DateRangePicker
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 11, 31)}
      disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
      placeholder="Pick weekdays in 2026"
    />
  ),
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

export const CalendarGridDisabledDates: DatePickerStory = {
  render: () => {
    const CalendarGridDisabled = () => {
      const [month, setMonth] = useState(new Date(2026, 2, 1))
      const [selected, setSelected] = useState<Date | null>(null)
      return (
        <div style={{ padding: 16, border: '1px solid var(--color-border-default)', borderRadius: 12, display: 'inline-block', background: 'var(--color-layer-01)' }}>
          <CalendarGrid
            currentMonth={month}
            selected={selected}
            onSelect={setSelected}
            onMonthChange={setMonth}
            minDate={new Date(2026, 2, 5)}
            maxDate={new Date(2026, 2, 25)}
            disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
          />
        </div>
      )
    }
    return <CalendarGridDisabled />
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

// --- DateRangePicker with Presets ---

export const RangeWithPresets: DatePickerStory = {
  render: () => (
    <DateRangePicker
      presets={['today', 'last7days', 'last30days', 'thisMonth', 'lastMonth']}
    />
  ),
}

export const RangeWithPresetsAndMultipleMonths: DatePickerStory = {
  render: () => (
    <DateRangePicker
      presets={['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'thisYear']}
      numberOfMonths={2}
    />
  ),
}

export const RangeMultipleMonths: DatePickerStory = {
  render: () => (
    <DateRangePicker numberOfMonths={2} />
  ),
}

export const RangeThreeMonths: DatePickerStory = {
  render: () => (
    <DateRangePicker numberOfMonths={3} />
  ),
}

// --- TimePicker ---

export const TimePickerDefault: DatePickerStory = {
  render: () => <TimePicker />,
}

export const TimePicker24Hour: DatePickerStory = {
  render: () => <TimePicker format="24h" />,
}

export const TimePickerWith15MinSteps: DatePickerStory = {
  render: () => <TimePicker minuteStep={15} />,
}

export const TimePickerWithSeconds: DatePickerStory = {
  render: () => <TimePicker showSeconds />,
}

export const TimePickerControlled: DatePickerStory = {
  render: () => {
    const ControlledTime = () => {
      const [time, setTime] = useState<Date | null>(null)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TimePicker value={time} onChange={setTime} />
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Selected: {time ? format(time, 'h:mm a') : 'None'}
          </p>
        </div>
      )
    }
    return <ControlledTime />
  },
}

// --- DateTimePicker ---

export const DateTimePickerDefault: DatePickerStory = {
  render: () => <DateTimePicker />,
}

export const DateTimePickerWithConstraints: DatePickerStory = {
  render: () => (
    <DateTimePicker
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 11, 31)}
    />
  ),
}

export const DateTimePickerControlled: DatePickerStory = {
  render: () => {
    const ControlledDateTime = () => {
      const [dt, setDt] = useState<Date | null>(null)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DateTimePicker value={dt} onChange={setDt} />
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Selected: {dt ? format(dt, 'MMM d, yyyy h:mm a') : 'None'}
          </p>
        </div>
      )
    }
    return <ControlledDateTime />
  },
}
