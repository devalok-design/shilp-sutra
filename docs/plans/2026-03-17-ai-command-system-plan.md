# AI Command System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a composable AI command system — CommandBar + BlockRenderer + AIConversation — for the shilp-sutra design system.

**Architecture:** Three independent layers (CommandBar input, BlockRenderer JSON→component mapper, AIConversation thread) connected via shared types and an optional AICommandProvider context. CommandBar is a superset of the existing CommandPalette — it handles both command filtering AND AI submission.

**Tech Stack:** React 18, TypeScript 5.7 (strict), framer-motion (existing), react-markdown (existing peer dep), remark-gfm (new), Vitest + RTL + vitest-axe, Storybook.

**Design Doc:** `docs/plans/2026-03-17-ai-command-system-design.md`

---

## Task Overview

| # | Task | Group | Est. |
|---|------|-------|------|
| 1 | Foundation — types, build config, deps | Setup | 5 min |
| 2 | Motion presets — `springs.responsive`, `tweens.elegant` | Setup | 3 min |
| 3 | TextBlock | Blocks | 5 min |
| 4 | DividerBlock | Blocks | 3 min |
| 5 | InfoBlock | Blocks | 3 min |
| 6 | ErrorBlock | Blocks | 3 min |
| 7 | SuccessBlock (with undo countdown) | Blocks | 8 min |
| 8 | LoadingBlock (skeleton + steps) | Blocks | 8 min |
| 9 | ConfirmBlock (with rationale) | Blocks | 8 min |
| 10 | BlockTable | Blocks | 10 min |
| 11 | StatRowBlock (with count-up) | Blocks | 8 min |
| 12 | Block barrel + BlockRenderer | Core | 8 min |
| 13 | AICommandProvider | Core | 5 min |
| 14 | CommandBar — hero variant | CommandBar | 15 min |
| 15 | CommandBar — inline variant | CommandBar | 5 min |
| 16 | CommandBar — floating variant | CommandBar | 10 min |
| 17 | CommandBar — keyboard + command filtering | CommandBar | 10 min |
| 18 | CommandBar — animations | CommandBar | 10 min |
| 19 | AIConversation | Conversation | 12 min |
| 20 | AIConversation — auto-scroll | Conversation | 8 min |
| 21 | AI barrel, exports, build verification | Finalize | 5 min |
| 22 | Stories — BlockRenderer | Stories | 10 min |
| 23 | Stories — CommandBar | Stories | 10 min |
| 24 | Stories — AIConversation | Stories | 10 min |
| 25 | Karm domain blocks | Karm | 15 min |
| 26 | Final typecheck + lint + test | Verify | 5 min |

---

## Task 1: Foundation — Types, Build Config, Dependencies

**Files:**
- Create: `packages/core/src/ai/types.ts`
- Modify: `packages/core/vite.config.ts:49-68`
- Modify: `packages/core/package.json` (exports + devDeps + peerDeps)

**Step 1: Install remark-gfm**

```bash
cd packages/core && pnpm add -D remark-gfm
```

Also add to `peerDependencies` and `peerDependenciesMeta` (optional) in package.json.

**Step 2: Create `src/ai/types.ts`**

```typescript
// Block protocol
export interface Block {
  type: string
  id?: string
  data: Record<string, unknown>
  confidence?: 'high' | 'medium' | 'low'
}

export interface AIResponse {
  blocks: Block[]
  conversationId?: string
  pendingAction?: {
    id: string
    label: string
    description?: string
    destructive?: boolean
  }
}

export interface ProcessingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'done' | 'error'
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content?: string
  blocks?: Block[]
  createdAt: Date
  steps?: ProcessingStep[]
}

// Block component props — every block receives this
export interface BlockComponentProps<T = Record<string, unknown>> {
  data: T
  blockId?: string
  confidence?: 'high' | 'medium' | 'low'
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
}

// Table block data shapes
export interface BlockTableColumn {
  key: string
  label: string
  variant?: 'badge' | 'number' | 'text'
}

export interface BlockTableData {
  columns: BlockTableColumn[]
  rows: Record<string, unknown>[]
  caption?: string
  sortable?: boolean
}

// Confirm block data
export interface ConfirmBlockData {
  actionId: string
  label: string
  description?: string
  destructive?: boolean
  rationale?: string
}

// Success block data
export interface SuccessBlockData {
  title: string
  message: string
  undoable?: boolean
  undoTimeout?: number
}

// Error block data
export interface ErrorBlockData {
  title: string
  message: string
  suggestion?: string
}

// Loading block data
export interface LoadingBlockData {
  lines?: number
  steps?: ProcessingStep[]
}

// Stat row block data
export interface StatRowStat {
  label: string
  value: string | number
  change?: { value: string; direction: 'up' | 'down' | 'neutral' }
}

export interface StatRowBlockData {
  stats: StatRowStat[]
}
```

**Step 3: Add explicit entries to `vite.config.ts`**

Add to `explicitEntries`:
```typescript
'ai/index': resolve(__dirname, 'src/ai/index.ts'),
'ai/command-bar': resolve(__dirname, 'src/ai/command-bar.tsx'),
'ai/conversation': resolve(__dirname, 'src/ai/conversation.tsx'),
'ai/block-renderer': resolve(__dirname, 'src/ai/block-renderer.tsx'),
'ai/ai-command-provider': resolve(__dirname, 'src/ai/ai-command-provider.tsx'),
'ai/blocks/index': resolve(__dirname, 'src/ai/blocks/index.ts'),
```

**Step 4: Add `./ai` exports to package.json**

Add to `"exports"`:
```json
"./ai": {
  "import": "./dist/ai/index.js",
  "default": "./dist/ai/index.js",
  "types": "./dist/ai/index.d.ts"
},
"./ai/command-bar": {
  "import": "./dist/ai/command-bar.js",
  "default": "./dist/ai/command-bar.js",
  "types": "./dist/ai/command-bar.d.ts"
},
"./ai/conversation": {
  "import": "./dist/ai/conversation.js",
  "default": "./dist/ai/conversation.js",
  "types": "./dist/ai/conversation.d.ts"
},
"./ai/block-renderer": {
  "import": "./dist/ai/block-renderer.js",
  "default": "./dist/ai/block-renderer.js",
  "types": "./dist/ai/block-renderer.d.ts"
},
"./ai/ai-command-provider": {
  "import": "./dist/ai/ai-command-provider.js",
  "default": "./dist/ai/ai-command-provider.js",
  "types": "./dist/ai/ai-command-provider.d.ts"
},
"./ai/blocks": {
  "import": "./dist/ai/blocks/index.js",
  "default": "./dist/ai/blocks/index.js",
  "types": "./dist/ai/blocks/index.d.ts"
}
```

Also add `remark-gfm` to peerDependencies (optional) and devDependencies.

**Step 5: Commit**

```bash
git add packages/core/src/ai/types.ts packages/core/vite.config.ts packages/core/package.json pnpm-lock.yaml
git commit -m "feat(ai): add foundation — types, build config, remark-gfm dep"
```

---

## Task 2: Motion Presets

**Files:**
- Modify: `packages/core/src/ui/lib/motion.ts`

**Step 1: Add new presets**

Add to `springs`:
```typescript
/** AI response blocks — snappier than smooth, feels "intelligent" */
responsive: { type: 'spring', stiffness: 350, damping: 28, mass: 0.6 } as Transition,
```

Add to `tweens`:
```typescript
/** Greeting fade, hint crossfade — unhurried, confident */
elegant: { type: 'tween', duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } as Transition,
```

**Step 2: Commit**

```bash
git add packages/core/src/ui/lib/motion.ts
git commit -m "feat(motion): add responsive spring and elegant tween for AI system"
```

---

## Task 3: TextBlock

**Files:**
- Create: `packages/core/src/ai/blocks/text.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/text.test.tsx`

**Step 1: Write the failing test**

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TextBlock } from '../blocks/text'

describe('TextBlock', () => {
  it('renders markdown content', () => {
    render(<TextBlock data={{ content: 'Hello **world**' }} />)
    expect(screen.getByText('world')).toBeInTheDocument()
  })

  it('renders with prose styling', () => {
    const { container } = render(<TextBlock data={{ content: 'Test' }} />)
    expect(container.firstChild).toHaveClass('prose')
  })

  it('renders links from markdown', () => {
    render(<TextBlock data={{ content: '[link](https://example.com)' }} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })

  it('shows low confidence indicator', () => {
    const { container } = render(<TextBlock data={{ content: 'Uncertain' }} confidence="low" />)
    expect(container.firstChild).toHaveClass('border-l-2')
  })
})
```

**Step 2: Run test — verify it fails**

```bash
cd packages/core && pnpm vitest run src/ai/__tests__/blocks/text.test.tsx
```

**Step 3: Implement TextBlock**

Uses `react-markdown` + `remark-gfm`. Wraps in `prose prose-sm` with DS text colors. Low confidence = `border-l-2 border-warning-7` left border + muted tooltip.

**Step 4: Run test — verify it passes**

**Step 5: Commit**

```bash
git commit -m "feat(ai): add TextBlock with markdown rendering"
```

---

## Task 4: DividerBlock

**Files:**
- Create: `packages/core/src/ai/blocks/divider.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/divider.test.tsx`

Simple wrapper around `Separator`. Entry animation: `scaleX: 0 → 1` from center using `tweens.elegant`.

Test: renders a `role="separator"` element.

Commit: `feat(ai): add DividerBlock`

---

## Task 5: InfoBlock

**Files:**
- Create: `packages/core/src/ai/blocks/info.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/info.test.tsx`

Wrapper around `Alert color="info" variant="subtle"`. Renders `data.message` as markdown (reuse TextBlock's markdown pattern or inline `react-markdown`).

Test: renders an alert with `role="alert"`, contains the message text.

Commit: `feat(ai): add InfoBlock`

---

## Task 6: ErrorBlock

**Files:**
- Create: `packages/core/src/ai/blocks/error.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/error.test.tsx`

`Alert color="error"`. Shows `data.title` as bold header, `data.message` as body (markdown), optional `data.suggestion` as muted hint text below.

Test: renders title, message, optional suggestion.

Commit: `feat(ai): add ErrorBlock`

---

## Task 7: SuccessBlock (with Undo Countdown)

**Files:**
- Create: `packages/core/src/ai/blocks/success.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/success.test.tsx`

**Step 1: Write tests**

```typescript
describe('SuccessBlock', () => {
  it('renders success alert with title and message', () => {
    render(<SuccessBlock data={{ title: 'Done', message: 'Completed.' }} />)
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('Completed.')).toBeInTheDocument()
  })

  it('renders SVG checkmark icon', () => {
    const { container } = render(<SuccessBlock data={{ title: 'Done', message: 'Ok' }} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows undo button when undoable', () => {
    const onAction = vi.fn()
    render(
      <SuccessBlock
        data={{ title: 'Done', message: 'Ok', undoable: true, undoTimeout: 5000 }}
        onAction={onAction}
      />
    )
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
  })

  it('calls onAction with undo when undo clicked', async () => {
    const onAction = vi.fn()
    render(
      <SuccessBlock
        data={{ title: 'Done', message: 'Ok', undoable: true }}
        onAction={onAction}
        blockId="action-123"
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(onAction).toHaveBeenCalledWith('action-123', 'undo')
  })

  it('hides undo button after timeout', async () => {
    vi.useFakeTimers()
    render(
      <SuccessBlock
        data={{ title: 'Done', message: 'Ok', undoable: true, undoTimeout: 3000 }}
        onAction={() => {}}
      />
    )
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
    vi.advanceTimersByTime(3100)
    expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
```

**Step 2: Implement**

- `Alert color="success"` with animated SVG checkmark (framer-motion `motion.path` with `pathLength: 0→1`)
- Undo button with circular countdown ring (`motion.circle` with `strokeDashoffset` animation)
- Timer auto-hides undo via `useEffect` + `setTimeout`
- Calls `onAction(blockId || 'unknown', 'undo')`

**Step 3: Commit**

```bash
git commit -m "feat(ai): add SuccessBlock with SVG checkmark and undo countdown"
```

---

## Task 8: LoadingBlock (Skeleton + Steps)

**Files:**
- Create: `packages/core/src/ai/blocks/loading.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/loading.test.tsx`

**Two modes:**

1. `data.lines` → renders `Skeleton` rows with `animation="shimmer"`
2. `data.steps` → renders vertical step list with status icons (checkmark/spinner/X)

**Tests:**
- Renders N skeleton bars when `data.lines` provided
- Renders step labels when `data.steps` provided
- Shows checkmark for "done" steps, spinner for "active", dimmed for "pending"
- Has `role="status"` and `aria-busy="true"`

**Animation:** Steps enter via `MotionStagger`. Status icon transitions: spinner → checkmark (SVG path draw on "done"), spinner → X icon on "error".

Commit: `feat(ai): add LoadingBlock with skeleton and step visualization`

---

## Task 9: ConfirmBlock (with Rationale)

**Files:**
- Create: `packages/core/src/ai/blocks/confirm.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/confirm.test.tsx`

**Tests:**
```typescript
describe('ConfirmBlock', () => {
  it('renders confirm and cancel buttons', () => {
    render(<ConfirmBlock data={{ actionId: 'a1', label: 'Do it' }} onAction={() => {}} />)
    expect(screen.getByRole('button', { name: /do it/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<ConfirmBlock data={{ actionId: 'a1', label: 'Do', description: 'Details here' }} />)
    expect(screen.getByText('Details here')).toBeInTheDocument()
  })

  it('uses error color when destructive', () => {
    render(<ConfirmBlock data={{ actionId: 'a1', label: 'Delete', destructive: true }} />)
    // The confirm button should have error styling (red)
    const btn = screen.getByRole('button', { name: /delete/i })
    expect(btn.className).toMatch(/error/)
  })

  it('calls onAction with confirm', async () => {
    const onAction = vi.fn()
    render(<ConfirmBlock data={{ actionId: 'act-1', label: 'Do' }} onAction={onAction} />)
    await userEvent.click(screen.getByRole('button', { name: /do/i }))
    expect(onAction).toHaveBeenCalledWith('act-1', 'confirm')
  })

  it('calls onAction with cancel', async () => {
    const onAction = vi.fn()
    render(<ConfirmBlock data={{ actionId: 'act-1', label: 'Do' }} onAction={onAction} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onAction).toHaveBeenCalledWith('act-1', 'cancel')
  })

  it('renders expandable rationale when provided', async () => {
    render(
      <ConfirmBlock
        data={{ actionId: 'a1', label: 'Do', rationale: 'Because you said so' }}
      />
    )
    const trigger = screen.getByText(/why this action/i)
    await userEvent.click(trigger)
    expect(screen.getByText('Because you said so')).toBeVisible()
  })
})
```

**Implementation:**
- Two `Button` components: confirm (`variant="solid"`, `color={destructive ? "error" : "default"}`) + cancel (`variant="ghost"`)
- Description text as `body-sm text-surface-fg-muted`
- Rationale: `MotionCollapse` with a "Why this action?" trigger using `Collapsible`
- Buttons enter with `MotionPop` delayed 150ms

Commit: `feat(ai): add ConfirmBlock with rationale disclosure`

---

## Task 10: BlockTable

**Files:**
- Create: `packages/core/src/ai/blocks/block-table.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/block-table.test.tsx`

**Lightweight table — NOT DataTable.** Uses DS `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` components from `ui/table`.

**Tests:**
- Renders column headers
- Renders row data
- Badge variant columns render `Badge` components
- Number variant columns are right-aligned
- Caption renders as `<caption>`
- Sortable: clicking header toggles sort
- `role="table"` present

**Implementation:**
- Import `Table, TableHeader, TableBody, TableRow, TableHead, TableCell` from `../../ui/table`
- Import `Badge` from `../../ui/badge`
- Client-side sort via `useState` + array sort
- Rows enter via `MotionStagger` (30ms per row)
- Row hover: `bg-surface-raised-hover` transition
- Column variants: `badge` → wrap cell value in `<Badge>`, `number` → `text-right tabular-nums`

Commit: `feat(ai): add BlockTable — lightweight table for AI response blocks`

---

## Task 11: StatRowBlock (with Count-up)

**Files:**
- Create: `packages/core/src/ai/blocks/stat-row.tsx`
- Create: `packages/core/src/ai/__tests__/blocks/stat-row.test.tsx`

**Tests:**
- Renders all stat labels and values
- Renders change indicators when provided
- Has accessible stat structure

**Implementation:**
- Horizontal flex row of stat cards using `StatCard` from `../../ui/stat-card`
- Map `data.stats[]` to `<StatCard>` with `label`, `value`, `delta` props
- Number count-up: use framer-motion `useSpring(0, { stiffness: 100, damping: 30 })` + `useTransform` to animate numeric values from 0 → target
- For string values (e.g. "$48,200"), extract numeric part, animate it, re-format
- Cards enter via `MotionStagger` with `MotionPop`

Commit: `feat(ai): add StatRowBlock with animated count-up`

---

## Task 12: Block Barrel + BlockRenderer

**Files:**
- Create: `packages/core/src/ai/blocks/index.ts`
- Create: `packages/core/src/ai/block-renderer.tsx`
- Create: `packages/core/src/ai/__tests__/block-renderer.test.tsx`

**Step 1: Create `blocks/index.ts` barrel**

```typescript
export { TextBlock } from './text'
export { DividerBlock } from './divider'
export { InfoBlock } from './info'
export { ErrorBlock } from './error'
export { SuccessBlock } from './success'
export { LoadingBlock } from './loading'
export { ConfirmBlock } from './confirm'
export { BlockTable } from './block-table'
export { StatRowBlock } from './stat-row'
```

**Step 2: Write BlockRenderer tests**

```typescript
describe('BlockRenderer', () => {
  it('renders a text block', () => {
    render(<BlockRenderer blocks={[{ type: 'text', data: { content: 'Hello' } }]} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders multiple blocks in sequence', () => {
    render(<BlockRenderer blocks={[
      { type: 'text', data: { content: 'First' } },
      { type: 'info', data: { message: 'Second' } },
    ]} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('passes onAction to blocks', async () => {
    const onAction = vi.fn()
    render(<BlockRenderer
      blocks={[{ type: 'confirm', data: { actionId: 'x', label: 'Go' } }]}
      onAction={onAction}
    />)
    await userEvent.click(screen.getByRole('button', { name: /go/i }))
    expect(onAction).toHaveBeenCalledWith('x', 'confirm')
  })

  it('renders custom blocks from registry', () => {
    const Custom = ({ data }: { data: any }) => <div>Custom: {data.value}</div>
    render(<BlockRenderer
      blocks={[{ type: 'my_custom', data: { value: 'test' } }]}
      customBlocks={{ my_custom: Custom }}
    />)
    expect(screen.getByText('Custom: test')).toBeInTheDocument()
  })

  it('renders fallback for unknown block types', () => {
    render(<BlockRenderer blocks={[{ type: 'nonexistent', data: { foo: 'bar' } }]} />)
    expect(screen.getByText(/unknown block type/i)).toBeInTheDocument()
  })

  it('passes confidence prop to blocks', () => {
    render(<BlockRenderer blocks={[{ type: 'text', data: { content: 'Low' }, confidence: 'low' }]} />)
    // Low confidence block should have warning border indicator
  })
})
```

**Step 3: Implement BlockRenderer**

```typescript
// Built-in block map
const BUILT_IN_BLOCKS: Record<string, React.ComponentType<BlockComponentProps<any>>> = {
  text: TextBlock,
  table: BlockTable,
  confirm: ConfirmBlock,
  success: SuccessBlock,
  error: ErrorBlock,
  info: InfoBlock,
  loading: LoadingBlock,
  divider: DividerBlock,
  stat_row: StatRowBlock,
}

// Resolve component: custom → built-in → fallback
// Wrap each block in MotionStagger item for staggered entry
```

**Step 4: Commit**

```bash
git commit -m "feat(ai): add BlockRenderer with built-in block registry and custom block support"
```

---

## Task 13: AICommandProvider

**Files:**
- Create: `packages/core/src/ai/ai-command-provider.tsx`
- Create: `packages/core/src/ai/__tests__/ai-command-provider.test.tsx`

**Implementation:**

```typescript
interface AICommandContext {
  customBlocks: Record<string, React.ComponentType<BlockComponentProps>>
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  agent?: { name: string; icon?: React.ReactNode }
}

const AICommandCtx = React.createContext<AICommandContext | null>(null)

export function useAICommand(): AICommandContext | null {
  return React.useContext(AICommandCtx)
}
```

Provider merges customBlocks, propagates onAction and agent info. Children consume via `useAICommand()`.

**Tests:**
- Child component can read context values
- Direct props override context values in BlockRenderer

Commit: `feat(ai): add AICommandProvider context`

---

## Task 14: CommandBar — Hero Variant

**Files:**
- Create: `packages/core/src/ai/command-bar.tsx`
- Create: `packages/core/src/ai/__tests__/command-bar.test.tsx`

**This is the largest task.** Build the hero variant first — the flagship.

**Tests:**
```typescript
describe('CommandBar hero', () => {
  it('renders input with search icon', () => {
    render(<CommandBar variant="hero" onSubmit={() => {}} />)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('renders greeting when provided', () => {
    render(<CommandBar variant="hero" greeting="Good morning" onSubmit={() => {}} />)
    expect(screen.getByText('Good morning')).toBeInTheDocument()
  })

  it('renders hints as clickable elements', async () => {
    const onSubmit = vi.fn()
    render(<CommandBar variant="hero" hints={['Add member', 'Check status']} onSubmit={onSubmit} />)
    expect(screen.getByText(/add member/i)).toBeInTheDocument()
  })

  it('calls onSubmit when Enter pressed', async () => {
    const onSubmit = vi.fn()
    render(<CommandBar variant="hero" onSubmit={onSubmit} />)
    const input = screen.getByRole('searchbox') || screen.getByLabelText(/command/i)
    await userEvent.type(input, 'hello{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('hello')
  })

  it('shows children (response area)', () => {
    render(
      <CommandBar variant="hero" onSubmit={() => {}}>
        <div data-testid="response">Response here</div>
      </CommandBar>
    )
    expect(screen.getByTestId('response')).toBeInTheDocument()
  })

  it('renders disabled state', () => {
    render(<CommandBar variant="hero" onSubmit={() => {}} disabled />)
    expect(screen.getByRole('searchbox') || screen.getByLabelText(/command/i)).toBeDisabled()
  })

  it('has correct ARIA attributes', () => {
    render(<CommandBar variant="hero" onSubmit={() => {}} />)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })
})
```

**Implementation:**
- `role="search"` container
- Input with `aria-label="AI command bar"`
- Greeting: `heading-sm` or `body-lg`, `surface-fg-muted`
- Hints: `body-sm`, `surface-fg-subtle`, clickable → fills input with typewriter effect
- Shortcut badge: `⌘J` in `surface-raised` mini badge
- Surface: `bg-surface-raised rounded-ds-xl shadow-raised`
- Input: `h-12`, `bg-surface-overlay`, `border-subtle`, `shadow-ring` + `shadow-glow` on focus
- State-based rendering: `idle` (full greeting+hints), `typing` (faded greeting), `processing` (read-only input + spinner), `responded` (show X clear button)
- `children` renders below input (for AIConversation)

Commit: `feat(ai): add CommandBar hero variant`

---

## Task 15: CommandBar — Inline Variant

**Files:**
- Modify: `packages/core/src/ai/command-bar.tsx`

Compact version: `h-9`, `text-sm`, no greeting, no hints. Same logic, smaller.

**Tests:** Renders without greeting/hints, input is smaller.

Commit: `feat(ai): add CommandBar inline variant`

---

## Task 16: CommandBar — Floating Variant

**Files:**
- Modify: `packages/core/src/ai/command-bar.tsx`

Modal overlay using `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogContentRaw` from `../../ui/dialog` — same pattern as existing CommandPalette.

- `open` / `defaultOpen` / `onOpenChange` for controlled/uncontrolled
- `surface-overlay` + `shadow-overlay` + `backdrop-blur` on overlay
- Centered modal, `max-w-[560px]`, `top-[20%]`
- Shows recent commands + suggestions section below input
- Results render inline in the modal

**Tests:**
- Opens and closes via controlled state
- Has `role="dialog"` when open
- Focus trap works (Escape closes)

Commit: `feat(ai): add CommandBar floating variant`

---

## Task 17: CommandBar — Keyboard Shortcuts + Command Filtering

**Files:**
- Modify: `packages/core/src/ai/command-bar.tsx`

**Keyboard shortcuts:**
- Global `keybinding` listener (default `mod+j`) — reuse `matchesKeybinding` from existing CommandPalette
- Enter: submit to AI (no match) or select item (match)
- Cmd+Enter: force AI submit
- Escape: clear → idle, blur, or close floating
- Arrow keys: navigate command results or recall history

**Command filtering logic (when `groups` provided):**
- Filter groups by query (same logic as CommandPalette)
- Track `activeIndex` for keyboard navigation
- If Enter pressed with active match → `item.onSelect()` (command mode wins)
- If Enter pressed with no match → `onSubmit(query)` (AI mode)
- `Cmd+Enter` always calls `onSubmit` regardless of match

**Tests:**
- Filters command groups as user types
- Enter selects active match
- Enter with no match calls onSubmit
- Cmd+Enter always calls onSubmit
- Arrow keys navigate results
- Escape closes/clears
- Global keybinding opens/focuses

Commit: `feat(ai): add keyboard shortcuts and command filtering to CommandBar`

---

## Task 18: CommandBar — Animations

**Files:**
- Modify: `packages/core/src/ai/command-bar.tsx`

Apply all animations from the design doc:

- **Mount:** Greeting `MotionFade` + `y: 8→0`, input fade delay 100ms, hints stagger
- **Placeholder rotation:** `AnimatePresence` crossfade with `tweens.fade`
- **Focus:** CSS transitions for border, shadow, icon color. Greeting+hints fade to 50% opacity. Badge fades out.
- **Submit:** Input text slides left, spinner fades in
- **Error:** Shake keyframe on input container
- **Clear:** Response area fades out + slides up

All check `useMotion().reducedMotion` — instant when reduced.

**Tests:** Mock `useMotion` with `reducedMotion: true`, verify no animation classes/styles applied.

Commit: `feat(ai): add CommandBar animations`

---

## Task 19: AIConversation

**Files:**
- Create: `packages/core/src/ai/conversation.tsx`
- Create: `packages/core/src/ai/__tests__/conversation.test.tsx`

**Tests:**
```typescript
describe('AIConversation', () => {
  it('renders user messages', () => {
    render(<AIConversation messages={[
      { id: '1', role: 'user', content: 'Hello AI', createdAt: new Date() },
    ]} />)
    expect(screen.getByText('Hello AI')).toBeInTheDocument()
  })

  it('renders assistant messages with blocks', () => {
    render(<AIConversation messages={[
      { id: '2', role: 'assistant', blocks: [
        { type: 'text', data: { content: 'Response' } },
      ], createdAt: new Date() },
    ]} />)
    expect(screen.getByText('Response')).toBeInTheDocument()
  })

  it('shows agent name and icon', () => {
    render(<AIConversation
      messages={[{ id: '2', role: 'assistant', blocks: [{ type: 'text', data: { content: 'Hi' } }], createdAt: new Date() }]}
      agent={{ name: 'Devadoot' }}
    />)
    expect(screen.getByText('Devadoot')).toBeInTheDocument()
  })

  it('shows processing indicator when isProcessing', () => {
    render(<AIConversation messages={[]} isProcessing agent={{ name: 'AI' }} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('passes onAction through to blocks', async () => {
    const onAction = vi.fn()
    render(<AIConversation
      messages={[{
        id: '3', role: 'assistant',
        blocks: [{ type: 'confirm', data: { actionId: 'x', label: 'Go' } }],
        createdAt: new Date(),
      }]}
      onAction={onAction}
    />)
    await userEvent.click(screen.getByRole('button', { name: /go/i }))
    expect(onAction).toHaveBeenCalledWith('x', 'confirm')
  })

  it('renders processing steps when provided', () => {
    render(<AIConversation
      messages={[]}
      isProcessing
      processingSteps={[
        { id: '1', label: 'Querying projects', status: 'done' },
        { id: '2', label: 'Building preview', status: 'active' },
      ]}
    />)
    expect(screen.getByText('Querying projects')).toBeInTheDocument()
    expect(screen.getByText('Building preview')).toBeInTheDocument()
  })
})
```

**Implementation:**
- Map `messages` to user message blocks and assistant message blocks
- User message: `surface-raised` card, `body-sm`, full-width
- Assistant message: no bg, agent header, `BlockRenderer` for blocks
- Processing: breathing dots (3 `motion.span` with staggered animation) + optional step list
- `aria-live="polite"` on response container

Commit: `feat(ai): add AIConversation with processing indicators`

---

## Task 20: AIConversation — Auto-scroll

**Files:**
- Modify: `packages/core/src/ai/conversation.tsx`

**Implementation:**
- Sentinel `div` at bottom of scroll container
- `IntersectionObserver` tracks whether sentinel is visible ("at bottom")
- When at bottom + new content → `scrollIntoView({ behavior: 'smooth', block: 'end' })`
- When NOT at bottom + new content → show "↓ New response" pill (absolute positioned)
- Pill: `role="button"`, `aria-label="Scroll to latest response"`, click scrolls + re-enables
- Pill enters with `MotionPop`

**Tests:**
- Scroll container has expected structure
- Pill rendered when scrolled up (mock IntersectionObserver)

Commit: `feat(ai): add intelligent auto-scroll with new response pill`

---

## Task 21: AI Barrel, Exports, Build Verification

**Files:**
- Create: `packages/core/src/ai/index.ts`

**Barrel file:**
```typescript
'use client'

// Components
export { CommandBar } from './command-bar'
export { AIConversation } from './conversation'
export { BlockRenderer } from './block-renderer'
export { AICommandProvider, useAICommand } from './ai-command-provider'

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
```

**Build verification:**
```bash
cd packages/core && pnpm build
```

Verify:
- `dist/ai/index.js` exists
- `dist/ai/command-bar.js` exists
- `dist/ai/conversation.js` exists
- `dist/ai/block-renderer.js` exists
- `dist/ai/blocks/index.js` exists
- No TypeScript errors

Commit: `feat(ai): add barrel exports and verify build`

---

## Task 22: Stories — BlockRenderer

**Files:**
- Create: `packages/core/src/ai/block-renderer.stories.tsx`

Stories for every built-in block type:
- `AllBlocks` — renders one of each in sequence
- `TextBlock` — markdown with bold, links, lists, code
- `TableBlock` — with badge columns, sortable
- `ConfirmBlock` — default + destructive + with rationale
- `SuccessBlock` — with undo + without undo
- `ErrorBlock` — with suggestion
- `InfoBlock` — standard
- `LoadingBlock` — skeleton mode + steps mode
- `DividerBlock` — simple
- `StatRowBlock` — 3 stats with trends
- `CustomBlock` — demonstrates custom block registry
- `UnknownBlock` — shows fallback
- `LowConfidence` — shows confidence indicator

Commit: `feat(ai): add BlockRenderer stories`

---

## Task 23: Stories — CommandBar

**Files:**
- Create: `packages/core/src/ai/command-bar.stories.tsx`

Stories:
- `HeroIdle` — greeting, hints, default state
- `HeroProcessing` — with agent name and spinner
- `HeroResponded` — with children showing blocks
- `HeroWithCommandGroups` — demonstrates unified command + AI mode
- `Inline` — compact variant in a card
- `FloatingDefault` — modal overlay
- `FloatingWithCommands` — full unified experience
- `PlaceholderRotation` — array of placeholders cycling
- `Disabled` — disabled state
- `FullExample` — CommandBar + AIConversation + blocks, interactive

Commit: `feat(ai): add CommandBar stories`

---

## Task 24: Stories — AIConversation

**Files:**
- Create: `packages/core/src/ai/conversation.stories.tsx`

Stories:
- `SingleTurn` — one user message + one response
- `MultiTurn` — conversation with follow-ups
- `Processing` — breathing dots
- `ProcessingWithSteps` — Perplexity-style step visualization
- `WithConfirmAction` — confirm block in conversation
- `WithUndoSuccess` — success with undo countdown
- `CustomBlocks` — domain blocks in conversation
- `FullDashboard` — CommandBar hero + AIConversation, fully interactive demo

Commit: `feat(ai): add AIConversation stories`

---

## Task 25: Karm Domain Blocks

**Files:**
- Create: `packages/karm/src/ai-blocks/index.ts`
- Create: `packages/karm/src/ai-blocks/registry.ts`
- Create: `packages/karm/src/ai-blocks/member-diff.tsx`
- Create: `packages/karm/src/ai-blocks/member-list.tsx`
- Create: `packages/karm/src/ai-blocks/project-list.tsx`
- Create: `packages/karm/src/ai-blocks/announcement-preview.tsx`
- Modify: `packages/karm/package.json` (add exports)
- Modify: `packages/karm/vite.config.ts` (add entry)

**Implementation:**
Each block wraps existing karm components, mapping block data → component props:

- `MemberDiffBlock` — table showing members being added/removed with status badges
- `MemberListBlock` — avatar group + list with role badges
- `ProjectListBlock` — cards or table of projects with status
- `AnnouncementPreviewBlock` — formatted announcement preview card

**Registry:**
```typescript
export const karmBlockRegistry = {
  member_diff: MemberDiffBlock,
  member_list: MemberListBlock,
  project_list: ProjectListBlock,
  announcement_preview: AnnouncementPreviewBlock,
}
```

**Karm package.json exports:**
```json
"./ai-blocks": {
  "import": "./dist/ai-blocks/index.js",
  "types": "./dist/ai-blocks/index.d.ts"
}
```

Commit: `feat(karm): add domain-specific AI blocks and registry`

---

## Task 26: Final Verification

**Step 1: Run full test suite**
```bash
cd packages/core && pnpm test
```
Expected: All tests pass including new AI tests.

**Step 2: Run typecheck**
```bash
pnpm typecheck
```

**Step 3: Run lint**
```bash
pnpm lint
```

**Step 4: Run build**
```bash
pnpm build
```

**Step 5: Verify dist output**
```bash
ls dist/ai/
# Should see: index.js, command-bar.js, conversation.js, block-renderer.js, ai-command-provider.js, blocks/
```

**Step 6: Fix any issues, commit**

```bash
git commit -m "chore(ai): pass all verification gates — typecheck, lint, test, build"
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/ui/alert.tsx` | Alert component (success/error/info blocks) |
| `src/ui/badge.tsx` | Badge component (table cell variant) |
| `src/ui/button.tsx` | Button component (confirm block) |
| `src/ui/separator.tsx` | Separator component (divider block) |
| `src/ui/skeleton.tsx` | Skeleton component (loading block) |
| `src/ui/stat-card.tsx` | StatCard component (stat_row block) |
| `src/ui/table.tsx` | Table primitives (block table) |
| `src/ui/collapsible.tsx` | Collapsible (confirm rationale) |
| `src/ui/dialog.tsx` | Dialog (floating variant) |
| `src/ui/lib/motion.ts` | Springs, tweens, motion utilities |
| `src/ui/lib/utils.ts` | `cn()` utility |
| `src/motion/primitives.tsx` | MotionFade, MotionSlide, MotionStagger, etc. |
| `src/motion/motion-provider.tsx` | `useMotion()` for reduced motion |
| `src/composed/command-palette.tsx` | Existing CommandPalette (reference for floating variant patterns) |
