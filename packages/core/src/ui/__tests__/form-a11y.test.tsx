import * as React from 'react'
import { render } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { FormField, FormHelperText, useFormField } from '../form'
import { Label } from '../label'
import { Input } from '../input'

describe('Form a11y', () => {
  it('FormField renders without a11y violations', async () => {
    const { container } = render(
      <FormField>
        <Label htmlFor="name">Name</Label>
        <Input id="name" aria-label="Name" />
        <FormHelperText>Enter your full name</FormHelperText>
      </FormField>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('FormField in error state has no a11y violations', async () => {
    const { container } = render(
      <FormField state="error">
        <Label htmlFor="email">Email</Label>
        <Input id="email" aria-label="Email" />
        <FormHelperText>Please enter a valid email</FormHelperText>
      </FormField>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('FormField with required state has no a11y violations', async () => {
    const { container } = render(
      <FormField required>
        <Label htmlFor="password">Password</Label>
        <Input id="password" aria-label="Password" aria-required="true" />
        <FormHelperText>Must be at least 8 characters</FormHelperText>
      </FormField>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('useFormField', () => {
  it('returns correct helperTextId from FormField context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormField helperTextId="custom-helper-id">{children}</FormField>
    )

    const { result } = renderHook(() => useFormField(), { wrapper })
    expect(result.current.helperTextId).toBe('custom-helper-id')
  })

  it('returns auto-generated helperTextId when none provided', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormField>{children}</FormField>
    )

    const { result } = renderHook(() => useFormField(), { wrapper })
    expect(result.current.helperTextId).toBeDefined()
    expect(result.current.helperTextId).toContain('-helper')
  })

  it('returns default state as helper', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormField>{children}</FormField>
    )

    const { result } = renderHook(() => useFormField(), { wrapper })
    expect(result.current.state).toBe('helper')
  })

  it('returns error state when FormField has state="error"', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormField state="error">{children}</FormField>
    )

    const { result } = renderHook(() => useFormField(), { wrapper })
    expect(result.current.state).toBe('error')
  })

  it('returns required when FormField has required prop', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormField required>{children}</FormField>
    )

    const { result } = renderHook(() => useFormField(), { wrapper })
    expect(result.current.required).toBe(true)
  })

  it('returns undefined required when FormField has no required prop', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormField>{children}</FormField>
    )

    const { result } = renderHook(() => useFormField(), { wrapper })
    expect(result.current.required).toBeUndefined()
  })
})

describe('FormHelperText', () => {
  it('gets the auto-generated ID from FormField context', () => {
    const { getByText } = render(
      <FormField helperTextId="my-helper">
        <FormHelperText>Help text</FormHelperText>
      </FormField>,
    )
    const helperEl = getByText('Help text')
    expect(helperEl).toHaveAttribute('id', 'my-helper')
  })

  it('uses auto-generated ID when no custom helperTextId given', () => {
    const { getByText } = render(
      <FormField>
        <FormHelperText>Help text</FormHelperText>
      </FormField>,
    )
    const helperEl = getByText('Help text')
    expect(helperEl.id).toBeTruthy()
    expect(helperEl.id).toContain('-helper')
  })

  it('has role="alert" when state is error', () => {
    const { getByText } = render(
      <FormField state="error">
        <FormHelperText>Error message</FormHelperText>
      </FormField>,
    )
    expect(getByText('Error message')).toHaveAttribute('role', 'alert')
  })

  it('has no role attribute when state is helper', () => {
    const { getByText } = render(
      <FormField state="helper">
        <FormHelperText>Helper message</FormHelperText>
      </FormField>,
    )
    expect(getByText('Helper message')).not.toHaveAttribute('role')
  })

  it('aria-describedby wiring works with an input inside FormField', () => {
    function WiredInput() {
      const { helperTextId } = useFormField()
      return <input aria-describedby={helperTextId} aria-label="Test input" />
    }

    const { container, getByText } = render(
      <FormField helperTextId="desc-id">
        <WiredInput />
        <FormHelperText>Description</FormHelperText>
      </FormField>,
    )

    const input = container.querySelector('input')!
    const helper = getByText('Description')
    expect(input.getAttribute('aria-describedby')).toBe('desc-id')
    expect(helper.id).toBe('desc-id')
  })
})
