import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stepper, Step } from '../stepper'

describe('Stepper', () => {
  const steps = ['Account', 'Profile', 'Review']

  it('renders all steps', () => {
    render(
      <Stepper activeStep={0}>
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    steps.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('marks completed steps', () => {
    render(
      <Stepper activeStep={1}>
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    const firstStep = screen.getByText('Account').closest('[data-step]')
    expect(firstStep).toHaveAttribute('data-state', 'completed')
  })

  it('marks active step', () => {
    render(
      <Stepper activeStep={1}>
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    const secondStep = screen.getByText('Profile').closest('[data-step]')
    expect(secondStep).toHaveAttribute('data-state', 'active')
  })

  it('marks pending steps', () => {
    render(
      <Stepper activeStep={0}>
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    const lastStep = screen.getByText('Review').closest('[data-step]')
    expect(lastStep).toHaveAttribute('data-state', 'pending')
  })

  it('supports vertical orientation', () => {
    const { container } = render(
      <Stepper activeStep={0} orientation="vertical">
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('supports optional step description', () => {
    render(
      <Stepper activeStep={0}>
        <Step label="Account" description="Create your account" />
      </Stepper>
    )
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })
})
