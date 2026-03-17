'use client'

// Components
export { CommandBar } from './command-bar'
export type { CommandBarProps } from './command-bar'

export { AIConversation } from './conversation'
export type { AIConversationProps } from './conversation'

export { BlockRenderer } from './block-renderer'
export type { BlockRendererProps } from './block-renderer'

export { AICommandProvider, useAICommand } from './ai-command-provider'
export type { AICommandProviderProps, AICommandContext } from './ai-command-provider'

export { DevadootIcon } from './devadoot-icon'
export type { DevadootIconProps, DevadootState } from './devadoot-icon'

// Block components (for customization/extension)
export { TextBlock } from './blocks/text'
export { BlockTable } from './blocks/block-table'
export { ConfirmBlock } from './blocks/confirm'
export { SuccessBlock } from './blocks/success'
export { ErrorBlock } from './blocks/error'
export { InfoBlock } from './blocks/info'
export { LoadingBlock } from './blocks/loading'
export { DividerBlock } from './blocks/divider'
export { StatRowBlock } from './blocks/stat-row'

// Types
export type {
  Block,
  AIResponse,
  ConversationMessage,
  ProcessingStep,
  BlockComponentProps,
  BlockTableColumn,
  BlockTableData,
  ConfirmBlockData,
  SuccessBlockData,
  ErrorBlockData,
  LoadingBlockData,
  StatRowStat,
  StatRowBlockData,
} from './types'
