export { AttendanceCTA, type AttendanceCTAProps } from './attendance-cta'
export {
  ProjectHealthCard,
  type ProjectHealthCardProps,
  type ProjectHealthData,
} from './project-health-card'
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

// WeekHeatmap composable system
export { WeekHeatmap, type WeekHeatmapProps } from './week-heatmap'
export {
  WeekHeatmapProvider,
  useWeekHeatmap,
  type WeekHeatmapContextValue,
  type WeekHeatmapProviderProps,
  type WeekDay,
} from './week-heatmap/week-heatmap-context'
export { type WeekHeatmapRootProps } from './week-heatmap/week-heatmap-root'
export { type WeekHeatmapDayStripProps } from './week-heatmap/week-heatmap-day-strip'
export { type WeekHeatmapDayProps } from './week-heatmap/week-heatmap-day'
export { type WeekHeatmapSummaryProps } from './week-heatmap/week-heatmap-summary'
export { type WeekHeatmapProgressBarProps } from './week-heatmap/week-heatmap-progress-bar'
export { type WeekHeatmapStreakProps } from './week-heatmap/week-heatmap-streak'
