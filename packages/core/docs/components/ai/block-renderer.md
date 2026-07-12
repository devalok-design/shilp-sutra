# BlockRenderer

- Import: @devalok/shilp-sutra/ai/block-renderer
- Server-safe: No
- Category: ai

Renders an ordered list of typed AI "blocks" — the structured chunks an assistant/
server emits instead of plain text. A registry maps each block's `type` to a React
component; consumers can register their own types. This doc also covers the block
system and how to author a custom block.

## Props
    blocks: Block[] (required) — ordered blocks to render
    onAction: (actionId: string, type: "confirm" | "cancel" | "undo") => void — fired by interactive blocks (e.g. confirm)
    customBlocks: Record<string, ComponentType<BlockComponentProps>> — extra type→component renderers, merged OVER the built-ins (prop wins over context)
    staggerDelay: number — ms between each block's entrance animation (default 50)
    className: string

Block: { id?: string, type: string, data: Record<string, unknown>, confidence?: "high" | "medium" | "low" } (see ai/types)
BlockComponentProps<T>: { data: T, blockId?: string, confidence?: "high" | "medium" | "low", onAction?: (actionId, type) => void }

## Defaults
    staggerDelay defaults to 50

## Example
```jsx
// Render server-emitted blocks:
<BlockRenderer
  blocks={message.blocks}
  onAction={(id, type) => handleAction(id, type)}
/>

// Register a custom block type:
function ChartBlock({ data }) {
  return <MyChart series={data.series} />
}
<BlockRenderer
  blocks={message.blocks}
  customBlocks={{ chart: ChartBlock }}
/>
```

## Composability
- **The block system** — the AI conversation renders assistant output as a `Block[]`. Each block has a `type` (string) and a `data` payload. `BlockRenderer` looks up the type in its registry and renders the matching component; an unknown type falls back to an `Alert` showing the raw JSON (so a new server-emitted type degrades gracefully instead of crashing).
- **Built-in block types** (9): `text` (Markdown prose), `table` (tabular data), `confirm` (action confirmation — confirm/cancel buttons + a "Why this action?" rationale drawer), `success` / `error` / `info` (status messages), `loading` (pending indicator), `divider` (separator), `stat_row` (a row of metric cards, composes `StatCard`).
- **Confidence** — every block may carry `confidence: "high" | "medium" | "low"`. Low-confidence blocks get a faint warning wash + a "Low confidence" chip (owned by the shared `BlockShell` wrapper, so the treatment is consistent across all block types). This is an AI-native affordance: the UI signals how sure the model is.
- **Writing a custom block** — a block component receives `BlockComponentProps<T>` (`data`, `confidence`, `onAction`, `blockId`). Wrap your content in `BlockShell` to inherit the confidence treatment. Register it via `customBlocks` (on `BlockRenderer` or `AICommandProvider`) keyed by the `type` string your server emits.
- **Two public block subpaths** — `text` and `error` import `react-markdown` + `remark-gfm` (a Markdown peer dependency). They were split out of the `ai/blocks` barrel in 0.40.0 so consumers don't pull those peers unless they render Markdown. Import them directly when needed: `@devalok/shilp-sutra/ai/blocks/text`, `@devalok/shilp-sutra/ai/blocks/error`.
- **Provider merge** — `customBlocks` from `AICommandProvider` (context) are merged with the `customBlocks` prop; the prop wins on key collision. Same for `onAction`.

## Gotchas
- Client component — mount inside a client boundary.
- Requires a mounted `MotionProvider` (block entrances respect reduced-motion).
- Rendering `text`/`error` blocks requires the `react-markdown` + `remark-gfm` peer dependencies — install them if your blocks include Markdown.
- The `ai/blocks/*` components are an implementation detail of the registry; consume blocks via `BlockRenderer`/`AIConversation`, not by importing each block (except the two documented Markdown subpaths).

## Changes
### v0.49.0
- **Added** Component + block-system documentation (the AI layer is now covered by the docs gate + hosted MCP).
