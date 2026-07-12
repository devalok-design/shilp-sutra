# AIConversation

- Import: @devalok/shilp-sutra/ai/conversation
- Server-safe: No
- Category: ai

A scrollable AI conversation thread: user + assistant turns, streaming processing
steps, an agent header, and structured content blocks (rendered via BlockRenderer)
with confirm/cancel/undo action support.

## Props
    messages: ConversationMessage[] (required) — ordered user + assistant turns
    isProcessing: boolean — shows a live processing indicator below the last message
    processingSteps: ProcessingStep[] — granular steps shown during processing (status: pending | active | done | error)
    agent: { name: string, icon?: IconInput } — agent identity shown as a header on assistant messages
    onAction: (actionId: string, type: "confirm" | "cancel" | "undo") => void — fired by action blocks
    customBlocks: Record<string, ComponentType<BlockComponentProps>> — extra block-type renderers merged over the built-ins
    maxHeight: string | number — max height of the container (enables scrolling)
    autoScroll: boolean — auto-scroll to bottom on new messages (default true)
    className: string

ConversationMessage: { id: string, role: "user" | "assistant", blocks: Block[], ... } (see ai/types)
ProcessingStep: { label: string, status: "pending" | "active" | "done" | "error" }

## Defaults
    autoScroll defaults to true

## Example
```jsx
<AICommandProvider agent={{ name: 'Devadoot' }} onAction={handleAction}>
  <AIConversation
    messages={messages}
    isProcessing={isThinking}
    processingSteps={[
      { label: 'Reading project', status: 'done' },
      { label: 'Drafting reply', status: 'active' },
    ]}
    agent={{ name: 'Devadoot', icon: <IconSparkles /> }}
    onAction={(id, type) => handleAction(id, type)}
    maxHeight="60vh"
  />
</AICommandProvider>
```

## Composability
- **Renders blocks, not raw text** — each assistant turn is a list of typed `Block`s rendered by `BlockRenderer`. See the block-renderer doc for the block system and how to register custom block types.
- **Pairs with `AICommandProvider`** — the provider supplies `customBlocks`, `onAction`, and `agent` via context so you don't thread them through every message. Props on `AIConversation` win over context.
- **Pairs with `CommandBar`** — CommandBar is the input surface (natural-language submission); AIConversation is the output thread. Common layout: CommandBar on top/bottom, AIConversation as the scroll region.
- **Streaming** — set `isProcessing` + feed `processingSteps` to show step-by-step progress (Reading → Drafting → …) while the model works.
- **Actions** — action blocks (e.g. `confirm`) call `onAction(actionId, type)`; wire it to your confirm/cancel/undo handlers.

## Gotchas
- Client component — mount inside a client boundary.
- Requires a mounted `MotionProvider` (respects reduced-motion for the step spinner and block entrances).
- `agent` set here labels assistant messages; `AICommandProvider`'s `agent` is the fallback when not passed per-conversation.

## Changes
### v0.49.0
- **Added** Component documentation (the AI layer is now covered by the docs gate + hosted MCP).
