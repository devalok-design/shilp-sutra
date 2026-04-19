'use client'

// Components
export type { AICommandContext,AICommandProviderProps } from './ai-command-provider'
export { AICommandProvider, useAICommand } from './ai-command-provider'
export type { BlockRendererProps } from './block-renderer'
export { BlockRenderer } from './block-renderer'
export type { CommandBarProps } from './command-bar'
export { CommandBar } from './command-bar'
export type { AIConversationProps } from './conversation'
export { AIConversation } from './conversation'
export type { DevadootIconProps, DevadootState } from './devadoot-icon'
export { DevadootIcon } from './devadoot-icon'

// Block components (for customization/extension)
export { BlockTable } from './blocks/block-table'
export { ConfirmBlock } from './blocks/confirm'
export { DividerBlock } from './blocks/divider'
export { ErrorBlock } from './blocks/error'
export { InfoBlock } from './blocks/info'
export { LoadingBlock } from './blocks/loading'
export { StatRowBlock } from './blocks/stat-row'
export { SuccessBlock } from './blocks/success'
export { TextBlock } from './blocks/text'

// Types
export type {
  AIResponse,
  Block,
  BlockComponentProps,
  BlockTableColumn,
  BlockTableData,
  ConfirmBlockData,
  ConversationMessage,
  ErrorBlockData,
  LoadingBlockData,
  ProcessingStep,
  StatRowBlockData,
  StatRowStat,
  SuccessBlockData,
} from './types'
