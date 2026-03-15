export { Scratchpad } from './scratchpad'

// Individual composable pieces
export { ScratchpadRoot, type ScratchpadRootProps } from './scratchpad-root'
export { ScratchpadHeader, type ScratchpadHeaderProps } from './scratchpad-header'
export { ScratchpadList, type ScratchpadListProps } from './scratchpad-list'
export { ScratchpadItem, type ScratchpadItemProps } from './scratchpad-item'
export { ScratchpadAddInput, type ScratchpadAddInputProps } from './scratchpad-add-input'
export { ScratchpadEmptyState, type ScratchpadEmptyStateProps } from './scratchpad-empty-state'
export { ScratchpadProgressRing, type ScratchpadProgressRingProps } from './scratchpad-progress-ring'
export { ScratchpadFilterToggle, type ScratchpadFilterToggleProps } from './scratchpad-filter-toggle'
export { ScratchpadCollapse, type ScratchpadCollapseProps } from './scratchpad-collapse'

// Context + hook
export {
  ScratchpadProvider,
  useScratchpad,
  type ScratchpadItem as ScratchpadItemData,
  type ScratchpadContextValue,
  type ScratchpadProviderProps,
} from './scratchpad-context'
