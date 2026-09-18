# AI Command System Design — CommandBar + Block Renderer + AIConversation

**Date:** 2026-03-17
**Status:** Approved
**Scope:** `@devalok/shilp-sutra` (core) + `@devalok/shilp-sutra-karm` (domain blocks)
**Origin:** [Karm Feature Request](../../packages/core/../../docs/plans/) — `shilp-sutra-ai-command-system-request.md`

---

## Executive Summary

A composable AI command system — a unified command interface where users type natural language requests OR quick-select navigational commands, an AI agent processes them, and the design system renders structured response blocks as real, interactive UI components.

**Not a chatbot.** An agentic command interface — users orchestrate AI actions through natural language, with the DS handling all rendering, states, and interactions.

**Key architectural decision:** CommandBar is a **superset** of the existing CommandPalette — it handles both command palette filtering (search/navigate) AND AI natural language submission in one unified component. The existing CommandPalette stays alive; Karm migrates at their own pace.

---

## Architecture: Three Layers + Optional Context

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: CommandBar (Input + State Machine)                     │
│  → The unified input: command filtering + AI submission          │
│  → Three variants: hero, inline, floating                        │
│  → Lives in @devalok/shilp-sutra/ai                             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: BlockRenderer (Response → Components)                  │
│  → Takes Block[] JSON, renders each as a DS component            │
│  → 9 built-in blocks in @devalok/shilp-sutra/ai                 │
│  → Domain blocks in @devalok/shilp-sutra-karm/ai-blocks          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: AIConversation (Multi-turn Thread)                     │
│  → User messages + AI responses in sequence                      │
│  → Streaming support, intelligent auto-scroll, history           │
│  → Lives in @devalok/shilp-sutra/ai                             │
├─────────────────────────────────────────────────────────────────┤
│  Optional: AICommandProvider (Convenience Context)               │
│  → Wires block registry, onAction, agent info via React context  │
│  → Never required — components work standalone via props          │
└─────────────────────────────────────────────────────────────────┘
```

**Coupling approach:** Shared TypeScript types, independent components, optional convenience context (Approach 3). Each component works standalone via props. The optional `AICommandProvider` auto-wires them together for convenience.

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Relationship to CommandPalette | Superset — CommandBar can replace it | One interface for everything; groups + AI coexist |
| Existing CommandPalette | Keep alive, deprecate later | Stable API, Karm migrates at own pace |
| Build scope | All phases (1-4) in one go | Spec is detailed enough, DS infrastructure ready |
| Markdown rendering | `react-markdown` + `remark-gfm` | AI responses are unpredictable; full markdown from day 1 |
| Table block | Lightweight BlockTable, not DataTable | AI response tables are small preview data; avoid TanStack dep |
| Component coupling | Shared types, independent components, optional context | Max composability with convenience option |
| Animation library | framer-motion (existing) + DS motion primitives | Already in the system; no new animation deps |

---

## File Structure & Entry Points

```
packages/core/src/ai/
  index.ts                    → @devalok/shilp-sutra/ai (barrel)
  command-bar.tsx              → @devalok/shilp-sutra/ai/command-bar
  conversation.tsx             → @devalok/shilp-sutra/ai/conversation
  block-renderer.tsx           → @devalok/shilp-sutra/ai/block-renderer
  ai-command-provider.tsx      → @devalok/shilp-sutra/ai/ai-command-provider
  types.ts                     → shared types (Block, AIResponse, ConversationMessage)
  blocks/
    index.ts                   → @devalok/shilp-sutra/ai/blocks
    text.tsx
    block-table.tsx
    confirm.tsx
    success.tsx
    error.tsx
    info.tsx
    loading.tsx
    divider.tsx
    stat-row.tsx
  __tests__/
    command-bar.test.tsx
    block-renderer.test.tsx
    conversation.test.tsx
    blocks/*.test.tsx
  command-bar.stories.tsx
  conversation.stories.tsx
  block-renderer.stories.tsx

packages/karm/src/ai-blocks/
  index.ts                     → @devalok/shilp-sutra-karm/ai-blocks
  member-diff.tsx
  member-list.tsx
  project-list.tsx
  announcement-preview.tsx
  registry.ts                  → karmBlockRegistry preset
```

**Build integration:** Explicit entries in `packages/core/vite.config.ts`:
```ts
'ai/index': 'src/ai/index.ts',
'ai/command-bar': 'src/ai/command-bar.tsx',
'ai/conversation': 'src/ai/conversation.tsx',
'ai/block-renderer': 'src/ai/block-renderer.tsx',
'ai/ai-command-provider': 'src/ai/ai-command-provider.tsx',
'ai/blocks/index': 'src/ai/blocks/index.ts',
```

**Package.json exports:**
```json
"./ai": { "import": "./dist/ai/index.js", "types": "./dist/ai/index.d.ts" },
"./ai/*": { "import": "./dist/ai/*.js", "types": "./dist/ai/*.d.ts" }
```

**New dependency:** `react-markdown` + `remark-gfm` (bundled, ~18KB gzipped total).

---

## Component Specifications

### 1. CommandBar

The unified input element. Handles both command palette filtering AND AI natural language submission.

#### Props

```typescript
interface CommandBarProps {
  // -- AI submission --
  onSubmit?: (query: string) => void
  state?: 'idle' | 'typing' | 'processing' | 'responded'

  // -- Command palette mode (optional) --
  groups?: CommandGroup[]          // reuses existing CommandGroup type
  onSearch?: (query: string) => void
  emptyMessage?: string
  emptyState?: React.ReactNode

  // -- Visual --
  variant?: 'hero' | 'inline' | 'floating'
  size?: 'sm' | 'md' | 'lg'       // hero ignores this (always large)
  placeholder?: string | string[]   // array = rotation
  placeholderInterval?: number      // ms, default 5000
  greeting?: string                 // hero only
  hints?: string[]                  // hero only: clickable suggestion chips
  agentName?: string                // default "AI"
  agentIcon?: React.ReactNode

  // -- Floating variant (modal) --
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  keybinding?: string | string[] | false  // default "mod+j"

  // -- Interaction --
  disabled?: boolean
  maxHeight?: string | number

  // -- Composition --
  children?: React.ReactNode        // response area (AIConversation goes here)

  // -- Render overrides --
  renderInput?: (props: CommandBarInputProps) => React.ReactNode
  renderGreeting?: (text: string) => React.ReactNode
  renderHints?: (hints: string[], onSelect: (hint: string) => void) => React.ReactNode
}
```

#### Behavioral Logic — Commands + AI Coexistence

```
User types → filters groups (if provided)
  ├── Arrow keys navigate filtered results → Enter selects item (command mode)
  ├── Enter with NO active match → calls onSubmit (AI mode)
  └── Enter with active match → calls item.onSelect (command mode wins)

Cmd+Enter → always calls onSubmit (force AI mode, power user shortcut)
```

- `groups` only, no `onSubmit` → pure command palette
- `onSubmit` only, no `groups` → pure AI command bar
- Both → unified: filter first, AI fallback on Enter
- Neither → styled input (edge case)

#### State Machine

```
idle ──→ typing (user focuses + types)
typing ──→ processing (onSubmit called)
processing ──→ responded (blocks render via children)
responded ──→ typing (user re-focuses for follow-up)
responded ──→ idle (user clears / Escape)
```

Consumer owns this state — CommandBar renders based on `state` prop.

#### Per-Variant Behavior

| | Hero | Inline | Floating |
|---|---|---|---|
| Renders as | Inline on page | Inline in card/panel | Modal overlay (Dialog) |
| Input height | `h-12` | `h-9` | `h-10` |
| Greeting | Yes | No | No |
| Hints | Yes (clickable chips) | No | Recent + suggestions |
| Shortcut badge | Yes (`⌘J`) | Optional | Yes |
| Keyboard trigger | Yes | No | Yes |
| Command groups | Optional | Optional | Yes (primary use case) |
| Surface | `surface-raised` + `shadow-raised` | Inherits container | `surface-overlay` + `shadow-overlay` + `backdrop-blur` |
| Focus ring | `shadow-ring` + accent glow | `shadow-ring` | `border-accent` |

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+J` (configurable) | Focus CommandBar / open floating |
| `Enter` | Submit to AI (no match) or select item (match) |
| `Escape` | Clear response → idle, or blur, or close floating |
| `↑` / `↓` | Navigate command results, or recall history |
| `Cmd+Enter` | Force submit to AI (bypass command matching) |

---

### 2. Block Protocol & BlockRenderer

#### Enhanced Block Protocol

```typescript
interface Block {
  type: string
  id?: string
  data: Record<string, unknown>
  confidence?: 'high' | 'medium' | 'low'
}

interface AIResponse {
  blocks: Block[]
  conversationId?: string
  pendingAction?: {
    id: string
    label: string
    description?: string
    destructive?: boolean
  }
}

interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content?: string
  blocks?: Block[]
  createdAt: Date
  steps?: ProcessingStep[]
}

interface ProcessingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'done' | 'error'
}
```

#### Built-in Block Types (9 total)

| Type | Data Shape | Renders As |
|------|-----------|-----------|
| `text` | `{ content: string }` | `react-markdown` with prose styling |
| `table` | `{ columns, rows, caption?, sortable? }` | Lightweight `BlockTable` |
| `confirm` | `{ actionId, label, description?, destructive?, rationale? }` | Button pair + expandable "why" |
| `success` | `{ title, message, undoable?, undoTimeout? }` | `Alert color="success"` + optional undo |
| `error` | `{ title, message, suggestion? }` | `Alert color="error"` |
| `info` | `{ message }` | `Alert color="info"` |
| `loading` | `{ lines? }` or `{ steps: ProcessingStep[] }` | Skeleton rows OR step visualization |
| `divider` | `{}` | `Separator` |
| `stat_row` | `{ stats: [{ label, value, change? }] }` | Horizontal stat cards with count-up |

**Enhancements from research:**

- **Confirm block rationale** (Smashing Magazine agentic AI pattern): expandable "Why this action?" section using `MotionCollapse`
- **Success block undo** (Gmail pattern, Smashing Magazine action audit): time-limited undo button with circular countdown ring
- **Loading block steps** (Perplexity pattern): step-by-step visualization with checkmark/spinner/error icons
- **Confidence indicator** (Shape of AI, Smashing Magazine): `confidence: 'low'` → subtle `border-warning-7` left border + tooltip
- **Stat row count-up** (motion polish): numbers animate from 0 → target using `useSpring`

#### BlockRenderer Props

```typescript
interface BlockRendererProps {
  blocks: Block[]
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  customBlocks?: Record<string, React.ComponentType<BlockComponentProps>>
  staggerDelay?: number  // ms between blocks, default 50
  className?: string
}

interface BlockComponentProps<T = Record<string, unknown>> {
  data: T
  blockId?: string
  confidence?: 'high' | 'medium' | 'low'
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
}
```

#### Custom Block Registry

```tsx
// Inline
<BlockRenderer blocks={blocks} customBlocks={{ member_diff: MemberDiffBlock }} />

// Via provider
<AICommandProvider customBlocks={karmBlocks}>
  <BlockRenderer blocks={blocks} />
</AICommandProvider>
```

Unknown types → graceful fallback: `text` block with formatted JSON + `info` alert.

#### Table Block — Column Variants

```typescript
{
  type: 'table',
  data: {
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status', variant: 'badge' },
      { key: 'count', label: 'Count', variant: 'number' },
    ],
    rows: [...],
    caption: '10 projects',
    sortable: true,
  }
}
```

Column `variant: 'badge'` renders cell value as `<Badge>`. `variant: 'number'` right-aligns.

---

### 3. AIConversation

#### Props

```typescript
interface AIConversationProps {
  messages: ConversationMessage[]
  isProcessing?: boolean
  processingSteps?: ProcessingStep[]
  agent?: { name: string; icon?: React.ReactNode }
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  customBlocks?: Record<string, React.ComponentType<BlockComponentProps>>
  maxHeight?: string | number
  autoScroll?: boolean   // default true
  className?: string
}
```

#### Layout — Command Interface, NOT Chat

**User message:** Full-width, left-aligned, `surface-raised` background, `body-sm`, compact. No avatar, no bubble. A command.

**Assistant message:** No background. Agent name + icon as subtle header (`text-ds-xs uppercase tracking-wider text-surface-fg-subtle`). Blocks render sequentially with `gap-3`.

**Processing indicator:** Three states:
1. Simple breathing dots (no steps provided)
2. Vertical step checklist (steps provided — Perplexity pattern)
3. Inline text fallback ("{agentName} is thinking...")

#### Auto-scroll (assistant-ui pattern)

- IntersectionObserver on sentinel div tracks "scrolled to bottom"
- At bottom → auto-scroll smoothly as content arrives
- User scrolled up → stop auto-scroll, show "↓ New response" pill
- Clicking pill scrolls to bottom + re-enables
- `scrollBehavior: 'smooth'` with `block: 'end'`

---

### 4. AICommandProvider (Optional Context)

```typescript
interface AICommandProviderProps {
  children: React.ReactNode
  customBlocks?: Record<string, React.ComponentType<BlockComponentProps>>
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  agent?: { name: string; icon?: React.ReactNode }
}
```

Components check context first, fall back to direct props. Direct props always win.

```tsx
// Convenient
<AICommandProvider onAction={handle} customBlocks={karmBlocks} agent={devadoot}>
  <CommandBar variant="hero" onSubmit={submit} greeting="Good morning">
    <AIConversation messages={msgs} isProcessing={loading} />
  </CommandBar>
</AICommandProvider>

// Manual — no provider needed
<BlockRenderer blocks={blocks} onAction={handle} customBlocks={myBlocks} />
```

---

## Animation & Motion System

All animations use framer-motion via existing DS motion primitives (`MotionFade`, `MotionSlide`, `MotionStagger`, `MotionPop`, `MotionCollapse`) + raw framer-motion for custom effects.

### New Motion Presets (added to `ui/lib/motion.ts`)

```typescript
springs.responsive = { type: 'spring', stiffness: 350, damping: 28, mass: 0.6 }
tweens.elegant = { type: 'tween', duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
stagger.blocks = { delayChildren: 0.08, staggerChildren: 0.05 }
```

### CommandBar Animations

| Interaction | Element | Animation | Config |
|-------------|---------|-----------|--------|
| Mount | Greeting | `MotionFade` + `y: 8→0` | `tweens.elegant` |
| Mount | Input | `MotionFade` delay 100ms | `tweens.elegant` |
| Mount | Hints | `MotionStagger` per hint | `springs.gentle`, stagger 80ms |
| Placeholder rotation | Text | AnimatePresence crossfade: exit `{ opacity: 0, y: -4 }` enter `{ opacity: 1, y: 0 }` | `tweens.fade` (300ms) |
| Focus | Border | `border-surface-border-strong` → `border-accent-7` | CSS `tweens.colorShift` |
| Focus | Shadow | `shadow-raised` → `shadow-ring` + `shadow-glow` | CSS transition |
| Focus | Greeting + hints | `opacity: 1 → 0.5` | `tweens.fade` |
| Focus | Shortcut badge | `opacity: 1, scale: 1 → opacity: 0, scale: 0.9` | `springs.snappy` |
| Focus | Search icon | `text-surface-fg-subtle → text-accent-9` | CSS `tweens.colorShift` |
| Hint click | Input | Typewriter 25ms/char | JS interval + CSS caret |
| Submit | Input text | `x: 0→-4`, `opacity: 1→0.7` | `springs.snappy` |
| Submit | Spinner | `opacity: 0, scale: 0.8 → 1, 1` | `springs.snappy` |
| Error | Container | `x: [0, -6, 6, -4, 4, 0]` shake | CSS keyframe 400ms |
| Clear | Response area | `opacity: 1→0, y: 0→-8` | `springs.gentle` |

### Block Entry Animations

| Block Type | Entry | Special Effects |
|------------|-------|-----------------|
| `text` | `MotionSlide up` + `MotionFade` | Progressive markdown render during streaming |
| `table` | Container `MotionFade`, rows `MotionStagger` 30ms | Row hover: `bg-surface-raised-hover` via `tweens.colorShift` |
| `confirm` | `MotionSlide up`, buttons `MotionPop` delay 150ms | Confirm: `shadow-brand` hover. Press: `scale: 0.97` via `springs.bouncy` |
| `success` | `MotionSlide up`. Checkmark: SVG `motion.path` draw | `pathLength: 0→1`, 400ms, `springs.snappy`. Green glow pulse once |
| `error` | `MotionSlide up` + subtle shake (2px) | Red left border pulses once |
| `info` | `MotionSlide up` + `MotionFade` | Standard |
| `loading` (skeleton) | Skeleton bars `MotionStagger` | Existing `Skeleton animation="shimmer"` |
| `loading` (steps) | Steps `MotionStagger` 50ms | Checkmark draws on "done". Spinner rotates on "active" |
| `divider` | `scaleX: 0→1` from center | `tweens.elegant` |
| `stat_row` | Cards `MotionStagger`. Number count-up | `useSpring` 0→target, 600ms, `springs.responsive` |

### Processing Dots — Breathing Animation

```typescript
{[0, 1, 2].map(i => (
  <motion.span
    key={i}
    className="h-1.5 w-1.5 rounded-full bg-accent-9"
    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.16 }}
  />
))}
```

### Success Checkmark — SVG Path Draw

```typescript
<motion.path
  d="M5 13l4 4L19 7"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
/>
```

### Undo Countdown Ring

```typescript
<motion.circle
  r={6} cx={8} cy={8}
  strokeDasharray="37.7"
  initial={{ strokeDashoffset: 0 }}
  animate={{ strokeDashoffset: 37.7 }}
  transition={{ duration: undoTimeout / 1000, ease: "linear" }}
  className="stroke-success-9"
/>
```

### Reduced Motion

All animations check `useMotion().reducedMotion`:
- `true`: `duration: 0`, no springs, no stagger
- Dots → static "..." with `aria-live` text
- SVG checkmark appears instantly
- Numbers at final value (no count-up)
- Blocks appear at final position immediately

---

## Accessibility

| Component | ARIA | Behavior |
|-----------|------|----------|
| CommandBar | `role="search"`, `aria-label="AI command bar"` on input | Focus management via keybinding |
| Response area | `aria-live="polite"` | Announces: "Processing" → "Response ready" → "Action confirmed" |
| Confirm buttons | `aria-describedby` → description text | Destructive: `aria-label="Confirm destructive action: {label}"` |
| Processing dots | `role="status"`, `aria-label="{agentName} is processing"` | Hidden dots, SR gets text |
| Processing steps | `role="status"` container, `role="listitem"` per step | Status changes via `aria-live` |
| Table block | `role="table"`, `<caption>` | Sortable: `aria-sort` attribute |
| Floating variant | All Dialog a11y (Radix/vendored) | Focus trap, Escape to close |
| Auto-scroll pill | `role="button"`, `aria-label="Scroll to latest response"` | Keyboard accessible |
| Undo button | `aria-label="Undo action, {n} seconds remaining"` | Live countdown |

---

## Karm Domain Blocks

```typescript
// packages/karm/src/ai-blocks/registry.ts
export const karmBlockRegistry = {
  member_diff: MemberDiffBlock,
  member_list: MemberListBlock,
  project_list: ProjectListBlock,
  announcement_preview: AnnouncementPreviewBlock,
}
```

Each block wraps existing karm components, mapping block data → component props.

---

## Dependencies

| Dependency | New? | Purpose | Bundle impact |
|------------|------|---------|--------------|
| `react-markdown` | Yes | Text block markdown | ~15KB gzipped |
| `remark-gfm` | Yes | GFM tables, autolinks | ~3KB gzipped |
| `framer-motion` | Existing | All animations | Already chunked |
| `@tabler/icons-react` | Existing | Icons | Tree-shaken |
| DS components | Existing | Block rendering | Already available |

Total new: ~18KB gzipped, loaded only via `ai/` entry points.

---

## Testing Strategy

| Area | Test type | Tools |
|------|-----------|-------|
| BlockRenderer | Renders correct component per block type | Vitest + RTL |
| Each block | Renders data, handles edge cases | Vitest + RTL |
| CommandBar | States, keyboard, command filtering + AI fallback | Vitest + RTL + userEvent |
| AIConversation | Message rendering, auto-scroll | Vitest + RTL |
| Confirm block | Confirm/cancel calls onAction | RTL userEvent |
| Undo countdown | Timer behavior | Vitest fake timers |
| Accessibility | axe audit on every component | vitest-axe |
| Floating variant | Dialog open/close, focus trap, Escape | RTL + userEvent |
| Reduced motion | All animations skipped | Mock `useMotion()` |
| Custom blocks | Registry lookup, fallback for unknown | Vitest + RTL |

---

## Research References

Design informed by deep reading of:

- [Smashing Magazine — Designing for Agentic AI (Feb 2026)](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/) — Intent Preview, Autonomy Dial, Explainable Rationale, Confidence Signals, Action Audit & Undo, Escalation Pathway
- [Smashing Magazine — Beyond Generative: Rise of Agentic AI (Jan 2026)](https://www.smashingmagazine.com/2026/01/beyond-generative-rise-agentic-ai-user-centric-design/) — Four autonomy levels, glass box transparency, action ID tagging
- [Google Design — Gemini AI Visual Design](https://design.google/library/gemini-ai-visual-design) — Strategic softness, motion as meaning, directional flow, "forgiving design"
- [Google Research — Generative UI](https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/) — Structured rich responses strongly preferred over plain text
- [OpenAI — What Makes a Great ChatGPT App](https://developers.openai.com/blog/what-makes-a-great-chatgpt-app/) — Capabilities over products, minimal friction, structured + natural language pairing
- [assistant-ui — Composable React AI Chat Primitives](https://github.com/assistant-ui/assistant-ui) — Primitive-first architecture, content-aware rendering, intelligent auto-scroll, interrupt/resume for approvals
- [Vercel AI Elements](https://elements.ai-sdk.dev/overview) — Part-based message rendering, deep SDK integration, specialized block components
- [Shape of AI — UX Patterns](https://www.shapeof.ai/) — Stream of Thought, Controls, Draft Mode, Verification, Confidence Caveat
- [IBM Carbon AI — Chatbot Patterns](https://carbondesignsystem.com/community/patterns/chatbot/usage/) — Formal taxonomy of response types
