import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest'
import { axe } from 'vitest-axe'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './input-otp'

// input-otp uses document.elementFromPoint internally (not available in jsdom)
beforeAll(() => {
  if (!document.elementFromPoint) {
    document.elementFromPoint = () => null
  }
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function renderInputOTP(props?: { maxLength?: number; onChange?: (v: string) => void }) {
  const maxLength = props?.maxLength ?? 6
  return render(
    <InputOTP maxLength={maxLength} onChange={props?.onChange} aria-label="OTP code">
      <InputOTPGroup>
        {Array.from({ length: Math.min(3, maxLength) }, (_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
      {maxLength > 3 && <InputOTPSeparator />}
      {maxLength > 3 && (
        <InputOTPGroup>
          {Array.from({ length: maxLength - 3 }, (_, i) => (
            <InputOTPSlot key={i + 3} index={i + 3} />
          ))}
        </InputOTPGroup>
      )}
    </InputOTP>,
  )
}

describe('InputOTP', () => {
  it('renders slots as divs', () => {
    const { container } = renderInputOTP({ maxLength: 6 })
    // Slots are rendered as plain divs inside InputOTPGroup divs
    const slotDivs = container.querySelectorAll('[class*="h-ds-sm-plus"]')
    expect(slotDivs.length).toBe(6)
  })

  it('renders the hidden input element', () => {
    const { container } = renderInputOTP()
    const input = container.querySelector('input')
    expect(input).toBeInTheDocument()
  })

  it('accepts character input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = renderInputOTP({ onChange })
    const input = container.querySelector('input')!
    await user.click(input)
    await user.keyboard('1')
    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('renders separator element', () => {
    renderInputOTP({ maxLength: 6 })
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('does not render separator for short OTP', () => {
    renderInputOTP({ maxLength: 3 })
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('accepts multiple characters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = renderInputOTP({ onChange })
    const input = container.querySelector('input')!
    await user.click(input)
    await user.keyboard('123')
    // onChange fires for each keystroke
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('respects maxLength', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = renderInputOTP({ maxLength: 4, onChange })
    const input = container.querySelector('input')!
    await user.click(input)
    await user.keyboard('12345')
    // Only 4 chars should be accepted
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(lastCall[0].length).toBeLessThanOrEqual(4)
  })

  it('has no a11y violations', async () => {
    const { container } = renderInputOTP()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
