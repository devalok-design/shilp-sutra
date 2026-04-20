import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { FormField, FormHelperText, useFormField } from './form'

// Helper component to test the useFormField hook
function FormFieldConsumer() {
  const { state, helperTextId, required } = useFormField()
  return (
    <div data-testid="consumer">
      <span data-testid="state">{state ?? 'undefined'}</span>
      <span data-testid="helper-id">{helperTextId ?? 'undefined'}</span>
      <span data-testid="required">{required ? 'true' : 'false'}</span>
    </div>
  )
}

describe('FormField', () => {
  it('renders children', () => {
    render(
      <FormField>
        <span>Child content</span>
      </FormField>,
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('defaults state to "helper"', () => {
    render(
      <FormField>
        <FormFieldConsumer />
      </FormField>,
    )
    expect(screen.getByTestId('state')).toHaveTextContent('helper')
  })

  it('provides state via context', () => {
    render(
      <FormField state="error">
        <FormFieldConsumer />
      </FormField>,
    )
    expect(screen.getByTestId('state')).toHaveTextContent('error')
  })

  it('generates a helper text ID automatically', () => {
    render(
      <FormField>
        <FormFieldConsumer />
      </FormField>,
    )
    const id = screen.getByTestId('helper-id').textContent
    expect(id).toBeTruthy()
    expect(id).toContain('-helper')
  })

  it('uses custom helperTextId when provided', () => {
    render(
      <FormField helperTextId="my-helper-id">
        <FormFieldConsumer />
      </FormField>,
    )
    expect(screen.getByTestId('helper-id')).toHaveTextContent('my-helper-id')
  })

  it('provides required flag via context', () => {
    render(
      <FormField required>
        <FormFieldConsumer />
      </FormField>,
    )
    expect(screen.getByTestId('required')).toHaveTextContent('true')
  })

  it('merges custom className', () => {
    const { container } = render(
      <FormField className="my-class">
        <span>content</span>
      </FormField>,
    )
    expect(container.firstChild).toHaveClass('my-class')
  })
})

describe('FormHelperText', () => {
  it('renders text content', () => {
    render(<FormHelperText>Please enter your email.</FormHelperText>)
    expect(screen.getByText('Please enter your email.')).toBeInTheDocument()
  })

  it('inherits state from FormField context', () => {
    render(
      <FormField state="error">
        <FormHelperText>Invalid email</FormHelperText>
      </FormField>,
    )
    const el = screen.getByText('Invalid email')
    expect(el.className).toContain('text-error-11')
  })

  it('own state prop overrides context', () => {
    render(
      <FormField state="error">
        <FormHelperText state="success">Looks good!</FormHelperText>
      </FormField>,
    )
    const el = screen.getByText('Looks good!')
    expect(el.className).toContain('text-success-11')
  })

  it('shows role="alert" when state is error', () => {
    render(
      <FormField state="error">
        <FormHelperText>Email is required</FormHelperText>
      </FormField>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('does not show role="alert" for non-error states', () => {
    render(
      <FormField state="helper">
        <FormHelperText>Optional field</FormHelperText>
      </FormField>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('inherits id from FormField context', () => {
    render(
      <FormField helperTextId="email-helper">
        <FormHelperText>Help text</FormHelperText>
      </FormField>,
    )
    expect(screen.getByText('Help text')).toHaveAttribute('id', 'email-helper')
  })

  it('own id prop overrides context id', () => {
    render(
      <FormField helperTextId="email-helper">
        <FormHelperText id="custom-id">Help text</FormHelperText>
      </FormField>,
    )
    expect(screen.getByText('Help text')).toHaveAttribute('id', 'custom-id')
  })

  it('renders all state color variants', () => {
    const states = ['helper', 'error', 'warning', 'success'] as const
    const expectedClasses = {
      helper: 'text-surface-fg-subtle',
      error: 'text-error-11',
      warning: 'text-warning-11',
      success: 'text-success-11',
    }
    states.forEach((state) => {
      const { unmount } = render(
        <FormHelperText state={state}>Message</FormHelperText>,
      )
      const el = screen.getByText('Message')
      expect(el.className).toContain(expectedClasses[state])
      unmount()
    })
  })
})

describe('useFormField', () => {
  it('returns empty context when used outside FormField', () => {
    render(<FormFieldConsumer />)
    expect(screen.getByTestId('state')).toHaveTextContent('undefined')
    expect(screen.getByTestId('helper-id')).toHaveTextContent('undefined')
    expect(screen.getByTestId('required')).toHaveTextContent('false')
  })
})

describe('FormField + FormHelperText a11y wiring', () => {
  it('helper text id can be used for aria-describedby on an input', () => {
    function TestForm() {
      const { helperTextId } = useFormField()
      return <input aria-describedby={helperTextId} data-testid="input" />
    }

    render(
      <FormField helperTextId="name-helper">
        <TestForm />
        <FormHelperText>Enter your full name</FormHelperText>
      </FormField>,
    )

    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('aria-describedby', 'name-helper')
    expect(screen.getByText('Enter your full name')).toHaveAttribute('id', 'name-helper')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <FormField state="error" helperTextId="email-err">
        <label htmlFor="email-input">Email</label>
        <input
          id="email-input"
          aria-describedby="email-err"
          aria-invalid="true"
        />
        <FormHelperText>Please enter a valid email</FormHelperText>
      </FormField>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
