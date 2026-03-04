import type { Meta, StoryObj } from '@storybook/react'
import { FormField, FormHelperText, getFormFieldA11y } from './form'
import { Label } from './label'
import { Input } from './input'
import { Textarea } from './textarea'

const meta: Meta<typeof FormField> = {
  title: 'UI/Form Controls/Form',
  component: FormField,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof FormField>

export const Default: Story = {
  render: () => (
    <FormField className="max-w-sm">
      <Label htmlFor="name">Full name</Label>
      <Input id="name" placeholder="Enter your name" />
      <FormHelperText>Your full legal name as it appears on documents.</FormHelperText>
    </FormField>
  ),
}

export const ErrorState: Story = {
  render: () => {
    const helperTextId = 'email-error-hint'
    return (
      <FormField className="max-w-sm" state="error">
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          state="error"
          defaultValue="not-an-email"
          {...getFormFieldA11y(helperTextId, 'error')}
        />
        <FormHelperText id={helperTextId} state="error">
          Please enter a valid email address.
        </FormHelperText>
      </FormField>
    )
  },
}

export const WarningState: Story = {
  render: () => {
    const helperTextId = 'password-warning-hint'
    return (
      <FormField className="max-w-sm" state="warning">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          state="warning"
          defaultValue="weak"
          {...getFormFieldA11y(helperTextId, 'warning')}
        />
        <FormHelperText id={helperTextId} state="warning">
          Password strength is weak. Consider adding numbers and symbols.
        </FormHelperText>
      </FormField>
    )
  },
}

export const SuccessState: Story = {
  render: () => {
    const helperTextId = 'username-success-hint'
    return (
      <FormField className="max-w-sm" state="success">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          state="success"
          defaultValue="devalok_user"
          {...getFormFieldA11y(helperTextId, 'success')}
        />
        <FormHelperText id={helperTextId} state="success">
          Username is available.
        </FormHelperText>
      </FormField>
    )
  },
}

export const WithTextarea: Story = {
  render: () => (
    <FormField className="max-w-md">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself..." rows={3} />
      <FormHelperText>Maximum 250 characters.</FormHelperText>
    </FormField>
  ),
}

export const AllHelperStates: Story = {
  render: () => (
    <div className="flex flex-col gap-2 max-w-sm">
      <FormHelperText state="helper">Helper text (default)</FormHelperText>
      <FormHelperText state="error">Error message text</FormHelperText>
      <FormHelperText state="warning">Warning message text</FormHelperText>
      <FormHelperText state="success">Success message text</FormHelperText>
    </div>
  ),
}

export const CompleteForm: Story = {
  render: () => (
    <div className="flex flex-col gap-6 max-w-md">
      <FormField>
        <Label htmlFor="form-name" required>
          Name
        </Label>
        <Input id="form-name" placeholder="Enter your name" />
      </FormField>
      <FormField>
        <Label htmlFor="form-email" required>
          Email
        </Label>
        <Input id="form-email" type="email" placeholder="you@example.com" />
        <FormHelperText>We will never share your email.</FormHelperText>
      </FormField>
      <FormField>
        <Label htmlFor="form-message">Message</Label>
        <Textarea id="form-message" placeholder="Your message..." rows={4} />
        <FormHelperText>Optional. Max 500 characters.</FormHelperText>
      </FormField>
    </div>
  ),
}
