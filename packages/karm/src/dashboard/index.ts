export { AttendanceCTA, type AttendanceCTAProps } from './attendance-cta'
export { DailyBrief, type BriefData, type DailyBriefProps } from './daily-brief'
export { ScratchpadWidget, type ScratchpadItem, type ScratchpadWidgetProps } from './scratchpad-widget'
export { SidebarScratchpad, type SidebarScratchpadProps } from './sidebar-scratchpad'

// Scratchpad composable system
export { Scratchpad } from './scratchpad'
export {
  ScratchpadProvider,
  useScratchpad,
  type ScratchpadContextValue,
  type ScratchpadProviderProps,
  type ScratchpadItem as ScratchpadItemData,
} from './scratchpad/scratchpad-context'
export { type ScratchpadRootProps } from './scratchpad/scratchpad-root'
export { type ScratchpadHeaderProps } from './scratchpad/scratchpad-header'
export { type ScratchpadListProps } from './scratchpad/scratchpad-list'
export { type ScratchpadItemProps } from './scratchpad/scratchpad-item'
export { type ScratchpadAddInputProps } from './scratchpad/scratchpad-add-input'
export { type ScratchpadEmptyStateProps } from './scratchpad/scratchpad-empty-state'
export { type ScratchpadProgressRingProps } from './scratchpad/scratchpad-progress-ring'
export { type ScratchpadFilterToggleProps } from './scratchpad/scratchpad-filter-toggle'
export { type ScratchpadCollapseProps } from './scratchpad/scratchpad-collapse'
