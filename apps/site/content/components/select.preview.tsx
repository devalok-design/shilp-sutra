'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@devalok/shilp-sutra/ui/select'

export function SelectHero() {
  const [value, setValue] = React.useState('in-progress')
  return (
    <div className="w-full max-w-xs">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Set status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="backlog">Backlog</SelectItem>
          <SelectItem value="in-progress">In progress</SelectItem>
          <SelectItem value="in-review">In review</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function SelectVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <Select>
          <SelectTrigger size="xs">
            <SelectValue placeholder="Extra small" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Small" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger size="md">
            <SelectValue placeholder="Medium" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger size="lg">
            <SelectValue placeholder="Large" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </Block>

      <Block title="variant">
        <Select>
          <SelectTrigger variant="default">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger variant="outline">
            <SelectValue placeholder="Outline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger variant="ghost">
            <SelectValue placeholder="Ghost" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </Block>

      <Block title="state">
        <Select>
          <SelectTrigger state="error">
            <SelectValue placeholder="Error" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger state="warning">
            <SelectValue placeholder="Warning" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger state="success">
            <SelectValue placeholder="Success" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </Block>

      <Block title="disabled">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-02">{children}</div>
    </div>
  )
}
