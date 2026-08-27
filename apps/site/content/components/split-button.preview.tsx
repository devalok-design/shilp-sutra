'use client'

import { SplitButton } from '@devalok/shilp-sutra/ui/split-button'

function DropdownItems() {
  return (
    <div className="flex flex-col">
      <button className="rounded-control-inner px-ds-03 py-ds-02 text-left text-body-sm text-surface-fg hover:bg-surface-panel-hover">
        Save and duplicate
      </button>
      <button className="rounded-control-inner px-ds-03 py-ds-02 text-left text-body-sm text-surface-fg hover:bg-surface-panel-hover">
        Save as template
      </button>
      <button className="rounded-control-inner px-ds-03 py-ds-02 text-left text-body-sm text-surface-fg hover:bg-surface-panel-hover">
        Save and close
      </button>
    </div>
  )
}

export function SplitButtonHero() {
  return (
    <SplitButton onClick={() => {}} dropdownContent={<DropdownItems />}>
      Save changes
    </SplitButton>
  )
}

export function SplitButtonVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="variant">
        <SplitButton variant="solid" onClick={() => {}} dropdownContent={<DropdownItems />}>Solid</SplitButton>
        <SplitButton variant="soft" onClick={() => {}} dropdownContent={<DropdownItems />}>Soft</SplitButton>
        <SplitButton variant="outline" onClick={() => {}} dropdownContent={<DropdownItems />}>Outline</SplitButton>
      </Block>

      <Block title="color">
        <SplitButton color="accent" onClick={() => {}} dropdownContent={<DropdownItems />}>Accent</SplitButton>
        <SplitButton color="success" onClick={() => {}} dropdownContent={<DropdownItems />}>Success</SplitButton>
        <SplitButton color="error" onClick={() => {}} dropdownContent={<DropdownItems />}>Error</SplitButton>
      </Block>

      <Block title="size">
        <SplitButton size="sm" onClick={() => {}} dropdownContent={<DropdownItems />}>Small</SplitButton>
        <SplitButton size="md" onClick={() => {}} dropdownContent={<DropdownItems />}>Medium</SplitButton>
      </Block>

      <Block title="triggerSide=left">
        <SplitButton triggerSide="left" onClick={() => {}} dropdownContent={<DropdownItems />}>Export</SplitButton>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-03">{children}</div>
    </div>
  )
}
