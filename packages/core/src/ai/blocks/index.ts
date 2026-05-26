'use client'

export { BlockTable } from './block-table'
export { ConfirmBlock } from './confirm'
export { DividerBlock } from './divider'
export { InfoBlock } from './info'
export { LoadingBlock } from './loading'
export { StatRowBlock } from './stat-row'
export { SuccessBlock } from './success'

// ErrorBlock + TextBlock removed from this sub-barrel in 0.40.0 — both import
// `react-markdown` + `remark-gfm` statically, which made any consumer of
// `@devalok/shilp-sutra/ai/blocks` pull those peers even when never rendered.
// Import per-component:
//   import { ErrorBlock } from '@devalok/shilp-sutra/ai/blocks/error'
//   import { TextBlock } from '@devalok/shilp-sutra/ai/blocks/text'
