'use client'

import { FormField, FormHelperText } from '@devalok/shilp-sutra/ui/form'
import { Input } from '@devalok/shilp-sutra/ui/input'
import { Label } from '@devalok/shilp-sutra/ui/label'
import { Textarea } from '@devalok/shilp-sutra/ui/textarea'

export function FormHero() {
  return (
    <form className="flex max-w-md flex-col gap-ds-05" onSubmit={(e) => e.preventDefault()}>
      <FormField>
        <Label htmlFor="fh-name">Full name</Label>
        <Input id="fh-name" placeholder="Aisha Kapoor" />
      </FormField>
      <FormField state="error">
        <Label htmlFor="fh-email">Work email</Label>
        <Input id="fh-email" type="email" defaultValue="not-an-email" />
        <FormHelperText state="error">Enter a valid email address.</FormHelperText>
      </FormField>
      <FormField>
        <Label htmlFor="fh-note">Notes</Label>
        <Textarea id="fh-note" rows={3} placeholder="Anything we should know?" />
        <FormHelperText>Optional. Markdown supported.</FormHelperText>
      </FormField>
    </form>
  )
}

export function FormVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06 sm:grid-cols-2">
      <Block title="helper">
        <FormField>
          <Label htmlFor="fv-1">Username</Label>
          <Input id="fv-1" defaultValue="devalok" />
          <FormHelperText>3–20 characters.</FormHelperText>
        </FormField>
      </Block>
      <Block title="error">
        <FormField state="error">
          <Label htmlFor="fv-2">Password</Label>
          <Input id="fv-2" type="password" defaultValue="123" />
          <FormHelperText state="error">Too short.</FormHelperText>
        </FormField>
      </Block>
      <Block title="warning">
        <FormField state="warning">
          <Label htmlFor="fv-3">Domain</Label>
          <Input id="fv-3" defaultValue="acme.dev" />
          <FormHelperText state="warning">Not verified yet.</FormHelperText>
        </FormField>
      </Block>
      <Block title="success">
        <FormField state="success">
          <Label htmlFor="fv-4">Slug</Label>
          <Input id="fv-4" defaultValue="acme" />
          <FormHelperText state="success">Available.</FormHelperText>
        </FormField>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 rounded-control border border-surface-border-subtle bg-surface-panel p-ds-05">
      <span className="font-mono text-ds-xs text-surface-fg-subtle">{title}</span>
      {children}
    </div>
  )
}
