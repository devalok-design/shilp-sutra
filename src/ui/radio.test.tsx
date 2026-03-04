import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { RadioGroup, RadioGroupItem } from './radio'

function renderRadioGroup({
  defaultValue,
  onValueChange = vi.fn(),
  disabled = false,
}: {
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
} = {}) {
  return render(
    <RadioGroup
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      aria-label="Fruit selection"
    >
      <label htmlFor="radio-apple">
        <RadioGroupItem id="radio-apple" value="apple" />
        Apple
      </label>
      <label htmlFor="radio-banana">
        <RadioGroupItem id="radio-banana" value="banana" />
        Banana
      </label>
      <label htmlFor="radio-cherry">
        <RadioGroupItem id="radio-cherry" value="cherry" />
        Cherry
      </label>
    </RadioGroup>,
  )
}

describe('RadioGroup', () => {
  it('renders all radio options', () => {
    renderRadioGroup()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
  })

  it('selects option on click', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    renderRadioGroup({ onValueChange })

    await user.click(screen.getByLabelText('Banana'))

    expect(onValueChange).toHaveBeenCalledWith('banana')
  })

  it('renders with default value checked', () => {
    renderRadioGroup({ defaultValue: 'banana' })
    expect(screen.getByLabelText('Banana')).toBeChecked()
    expect(screen.getByLabelText('Apple')).not.toBeChecked()
  })

  it('only one radio is checked at a time', async () => {
    const user = userEvent.setup()
    renderRadioGroup({ defaultValue: 'apple' })

    expect(screen.getByLabelText('Apple')).toBeChecked()

    await user.click(screen.getByLabelText('Cherry'))

    expect(screen.getByLabelText('Cherry')).toBeChecked()
    expect(screen.getByLabelText('Apple')).not.toBeChecked()
  })

  it('disables all radios when group is disabled', () => {
    renderRadioGroup({ disabled: true })
    const radios = screen.getAllByRole('radio')
    radios.forEach((radio) => {
      expect(radio).toBeDisabled()
    })
  })

  it('forwards ref to RadioGroup root', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <RadioGroup
        ref={ref as React.Ref<HTMLDivElement>}
        aria-label="Test group"
      >
        <RadioGroupItem value="a" />
      </RadioGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('forwards ref to RadioGroupItem', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <RadioGroup aria-label="Test group">
        <RadioGroupItem
          ref={ref as React.Ref<HTMLButtonElement>}
          value="a"
          aria-label="Option A"
        />
      </RadioGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges custom className on RadioGroup', () => {
    const { container } = render(
      <RadioGroup className="my-radio-group" aria-label="Test group">
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>,
    )
    expect(container.querySelector('.my-radio-group')).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = renderRadioGroup({ defaultValue: 'apple' })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
