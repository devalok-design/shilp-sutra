'use client'

// Components
export type { AICommandContext,AICommandProviderProps } from './ai-command-provider'
export { AICommandProvider, useAICommand } from './ai-command-provider'
export type { CommandBarProps } from './command-bar'
export { CommandBar } from './command-bar'
export type { AIConversationProps } from './conversation'
export { AIConversation } from './conversation'
export type { DevadootIconProps, DevadootState } from './devadoot-icon'
export { DevadootIcon } from './devadoot-icon'

// BlockRenderer removed from barrel in 0.40.0 — it transitively imports
// `ErrorBlock` and `TextBlock` which pull hard peers `react-markdown` +
// `remark-gfm`. Consumers using BlockRenderer must install those peers AND
// import it via the per-component subpath:
//   import { BlockRenderer, type BlockRendererProps } from '@devalok/shilp-sutra/ai/block-renderer'

// Block components — non-markdown blocks stay barrel-safe. Markdown-backed
// blocks (ErrorBlock, TextBlock) require per-component import to keep the
// /ai barrel peer-cliff-free.
export { BlockTable } from './blocks/block-table'
export { ConfirmBlock } from './blocks/confirm'
export { DividerBlock } from './blocks/divider'
export { InfoBlock } from './blocks/info'
export { LoadingBlock } from './blocks/loading'
export { StatRowBlock } from './blocks/stat-row'
export { SuccessBlock } from './blocks/success'
// ErrorBlock + TextBlock removed in 0.40.0 — hard peers `react-markdown` +
// `remark-gfm`. Import per-component:
//   import { ErrorBlock } from '@devalok/shilp-sutra/ai/blocks/error'
//   import { TextBlock } from '@devalok/shilp-sutra/ai/blocks/text'

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
