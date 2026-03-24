export { TaskPanel } from './task-panel'

// Sub-component exports for direct use
export { TaskPanelRoot, type TaskPanelRootProps } from './task-panel-root'
export { TaskPanelHeader, type TaskPanelHeaderProps } from './task-panel-header'
export { TaskPanelQuickProps, type TaskPanelQuickPropsProps } from './task-panel-quick-props'
export {
  TaskPanelReviewBanner,
  type TaskPanelReviewBannerProps,
} from './task-panel-review-banner'
export {
  TaskPanelDescription,
  type TaskPanelDescriptionProps,
} from './task-panel-description'
export { TaskPanelSubtasks, type TaskPanelSubtasksProps } from './task-panel-subtasks'
export { TaskPanelTimeline, type TaskPanelTimelineProps } from './task-panel-timeline'
export {
  TaskPanelMessageInput,
  type TaskPanelMessageInputProps,
} from './task-panel-message-input'
export { TaskPanelWings, type TaskPanelWingsProps } from './task-panel-wings'
export { TaskPanelReviewCard } from './task-panel-wing-review'
export { TaskPanelPropertiesCard } from './task-panel-wing-properties'
export { TaskPanelFiles, type TaskPanelFilesProps } from './task-panel-files'

// Context
export {
  TaskPanelProvider,
  useTaskPanel,
  type TaskPanelContextValue,
  type TaskPanelProviderProps,
} from './task-panel-context'

// Types
export type {
  ClientMode,
  TaskFile,
  TaskPanelMode,
  TaskPanelTask,
  TimelineEntry,
  SystemEvent,
  ReviewEvent,
  AgentResponse,
  Reaction,
} from './task-panel-types'
