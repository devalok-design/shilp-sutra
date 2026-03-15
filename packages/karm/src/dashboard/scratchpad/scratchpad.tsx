'use client'

import { ScratchpadRoot } from './scratchpad-root'
import { ScratchpadHeader } from './scratchpad-header'
import { ScratchpadList } from './scratchpad-list'
import { ScratchpadItem } from './scratchpad-item'
import { ScratchpadAddInput } from './scratchpad-add-input'
import { ScratchpadEmptyState } from './scratchpad-empty-state'
import { ScratchpadProgressRing } from './scratchpad-progress-ring'
import { ScratchpadFilterToggle } from './scratchpad-filter-toggle'
import { ScratchpadCollapse } from './scratchpad-collapse'

/**
 * Compound component for building scratchpad UIs.
 *
 * @example
 * ```tsx
 * <Scratchpad.Root items={items} onToggle={toggle} onAdd={add} onDelete={del}>
 *   <Scratchpad.Header title="My Scratchpad">
 *     <Scratchpad.ProgressRing />
 *   </Scratchpad.Header>
 *   <Scratchpad.EmptyState />
 *   <Scratchpad.List />
 *   <Scratchpad.AddInput />
 * </Scratchpad.Root>
 * ```
 */
const Scratchpad = {
  Root: ScratchpadRoot,
  Header: ScratchpadHeader,
  List: ScratchpadList,
  Item: ScratchpadItem,
  AddInput: ScratchpadAddInput,
  EmptyState: ScratchpadEmptyState,
  ProgressRing: ScratchpadProgressRing,
  FilterToggle: ScratchpadFilterToggle,
  Collapse: ScratchpadCollapse,
}

export { Scratchpad }
