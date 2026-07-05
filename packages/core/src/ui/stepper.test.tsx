import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Step, Stepper, StepperContent } from './stepper'

describeConformance(
  'Stepper',
  (props) => (
    <Stepper activeStep={0} {...props}>
      <Step label="Account" />
      <Step label="Profile" />
    </Stepper>
  ),
)

describe('Stepper', () => {
  it('renders a list with one listitem per Step', () => {
    render(
      <Stepper activeStep={1}>
        <Step label="Account" />
        <Step label="Profile" />
        <Step label="Review" />
      </Stepper>,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('derives completed / active / pending state from activeStep', () => {
    render(
      <Stepper activeStep={1}>
        <Step label="Account" />
        <Step label="Profile" />
        <Step label="Review" />
      </Stepper>,
    )
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('data-state', 'completed')
    expect(items[1]).toHaveAttribute('data-state', 'active')
    expect(items[2]).toHaveAttribute('data-state', 'pending')
  })

  it('marks the active step with aria-current="step"', () => {
    render(
      <Stepper activeStep={1}>
        <Step label="Account" />
        <Step label="Profile" />
      </Stepper>,
    )
    expect(screen.getByLabelText(/Step 2: Profile, current/)).toHaveAttribute('aria-current', 'step')
  })

  it('renders the step number for pending steps and a checkmark for completed', () => {
    render(
      <Stepper activeStep={1}>
        <Step label="Account" />
        <Step label="Profile" />
      </Stepper>,
    )
    // Pending/active step shows its 1-based index; completed shows an svg checkmark.
    expect(screen.getByText('2')).toBeInTheDocument()
    const completed = screen.getAllByRole('listitem')[0]
    expect(completed.querySelector('svg')).not.toBeNull()
  })

  describe('onStepClick', () => {
    it('renders completed steps as buttons and fires the callback with the index', async () => {
      const user = userEvent.setup()
      const onStepClick = vi.fn()
      render(
        <Stepper activeStep={2} onStepClick={onStepClick}>
          <Step label="Account" />
          <Step label="Profile" />
          <Step label="Review" />
        </Stepper>,
      )
      const backBtn = screen.getByRole('button', { name: 'Go to step 1: Account' })
      await user.click(backBtn)
      expect(onStepClick).toHaveBeenCalledOnce()
      expect(onStepClick).toHaveBeenCalledWith(0)
    })

    it('does not make the active or pending steps clickable', () => {
      const onStepClick = vi.fn()
      render(
        <Stepper activeStep={1} onStepClick={onStepClick}>
          <Step label="Account" />
          <Step label="Profile" />
          <Step label="Review" />
        </Stepper>,
      )
      // Only the one completed step (index 0) is a button.
      expect(screen.getAllByRole('button')).toHaveLength(1)
      expect(screen.queryByRole('button', { name: /Profile/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Review/ })).not.toBeInTheDocument()
    })

    it('is not clickable at all without an onStepClick handler', () => {
      render(
        <Stepper activeStep={2}>
          <Step label="Account" />
          <Step label="Profile" />
          <Step label="Review" />
        </Stepper>,
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  it('renders a custom icon over the default number/checkmark', () => {
    render(
      <Stepper activeStep={0}>
        <Step label="Verified" icon={<svg data-testid="custom-icon" />} />
      </Stepper>,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders in vertical orientation without throwing', () => {
    render(
      <Stepper activeStep={0} orientation="vertical">
        <Step label="Connect" />
        <Step label="Invite" />
      </Stepper>,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})

describe('StepperContent', () => {
  it('renders the active step panel', () => {
    render(
      <StepperContent activeStep={1}>
        <div>Profile panel</div>
      </StepperContent>,
    )
    expect(screen.getByText('Profile panel')).toBeInTheDocument()
  })
})
