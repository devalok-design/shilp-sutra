import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, beforeAll } from 'vitest'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../input-otp'

// input-otp uses ResizeObserver which jsdom doesn't provide
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof globalThis.ResizeObserver
  }
})

describe('InputOTP accessibility', () => {
  it('should have no violations with a basic 4-digit OTP', async () => {
    const { container } = render(
      <InputOTP maxLength={4} aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with separator between groups', async () => {
    const { container } = render(
      <InputOTP maxLength={6} aria-label="Verification code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
