'use client'

import { FormSection } from '@devalok/shilp-sutra/composed/form-section'
import { FormField, FormHelperText } from '@devalok/shilp-sutra/ui/form'
import { Input } from '@devalok/shilp-sutra/ui/input'
import { Label } from '@devalok/shilp-sutra/ui/label'
import { Switch } from '@devalok/shilp-sutra/ui/switch'

export function FormSectionHero() {
  return (
    <div className="max-w-lg">
      <FormSection
        title="Profile"
        description="This information appears on your public profile."
      >
        <FormField>
          <Label htmlFor="fs-name">Display name</Label>
          <Input id="fs-name" defaultValue="Aisha Kapoor" />
        </FormField>
        <FormField>
          <Label htmlFor="fs-handle">Handle</Label>
          <Input id="fs-handle" defaultValue="aisha" />
          <FormHelperText>shilp-sutra.dev/@aisha</FormHelperText>
        </FormField>
      </FormSection>
    </div>
  )
}

export function FormSectionVariants() {
  return (
    <div className="flex max-w-lg flex-col gap-ds-08">
      <FormSection title="Account" description="Sign-in and contact details.">
        <FormField>
          <Label htmlFor="fsv-email">Email</Label>
          <Input id="fsv-email" type="email" defaultValue="aisha@acme.dev" />
        </FormField>
      </FormSection>
      <FormSection title="Notifications" description="How and when we reach you.">
        <label className="flex items-center justify-between gap-ds-03 rounded-control border border-surface-border-subtle bg-surface-panel px-ds-04 py-ds-03">
          <span className="text-ds-sm text-surface-fg">Product updates</span>
          <Switch defaultChecked size="sm" />
        </label>
        <label className="flex items-center justify-between gap-ds-03 rounded-control border border-surface-border-subtle bg-surface-panel px-ds-04 py-ds-03">
          <span className="text-ds-sm text-surface-fg">Weekly digest</span>
          <Switch size="sm" />
        </label>
      </FormSection>
    </div>
  )
}
