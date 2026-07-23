'use client'

import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react'
import { diffLines, diffWordsWithSpace } from 'diff'
import { motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'

/** Animates newly-revealed unchanged rows open (height + fade). Instant under reduced-motion. */
function Reveal({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <div>{children}</div>
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
 * Diff — version-compare viewer. Renders the difference between two versions of
 * text content (added / removed / changed), themed to shilp-sutra tokens.
 *
 * Wraps the headless `diff` (jsdiff) engine and owns the presentation — the
 * same "headless engine, our look" pattern as charts (d3) and data-table
 * (TanStack). Built for a review loop: pair it with per-change accept/reject
 * handlers and it becomes an approve/reject surface, not just a viewer.
 *
 *   <Diff before={committed} after={pending} mode="split" />
 *   <Diff before={a} after={b} granularity="word" />          // prose
 *   <Diff mode="fields" before={jsonA} after={jsonB} />       // structured
 *   <Diff before={a} after={b} onAcceptHunk={fn} onRejectHunk={fn} />
 * ------------------------------------------------------------------------ */

export type DiffMode = 'inline' | 'split' | 'fields'
export type DiffGranularity = 'line' | 'word'

/** A contiguous changed region — the unit a reviewer accepts or rejects. */
export interface DiffHunk {
  /** Zero-based index of the hunk within the diff. */
  index: number
  /** The removed (committed) text for this hunk. */
  before: string
  /** The added (pending) text for this hunk. */
  after: string
}

export interface DiffProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Committed (old) version. */
  before: string
  /** Pending (new) version. */
  after: string
  /** `inline` unified, `split` side-by-side, or `fields` structured (parses JSON). @default 'inline' */
  mode?: DiffMode
  /** `line` for code/structured content, `word` for prose. Ignored in `fields`. @default 'line' */
  granularity?: DiffGranularity
  /** Collapse long runs of unchanged lines behind an expander (line granularity only). @default true */
  collapseUnchanged?: boolean
  /** Unchanged-line run length that triggers a collapse. @default 6 */
  collapseThreshold?: number
  /** Unchanged lines kept visible on each side of a collapsed run. @default 3 */
  contextLines?: number
  /** Show the +N / −N / change-count summary header. @default true */
  showSummary?: boolean
  /** Column label for the old side. @default 'Committed' */
  beforeLabel?: string
  /** Column label for the new side. @default 'Pending' */
  afterLabel?: string
  /** When provided, each hunk shows an Accept control. */
  onAcceptHunk?: (hunk: DiffHunk) => void
  /** When provided, each hunk shows a Reject control. */
  onRejectHunk?: (hunk: DiffHunk) => void
}

// ------------------------------- row model ---------------------------------

interface Row {
  kind: 'context' | 'del' | 'add'
  text: string
  oldNo?: number
  newNo?: number
}

/** A context line, or a contiguous change block (its dels + adds = one hunk). */
type Segment =
  | { t: 'ctx'; row: Row }
  | { t: 'chg'; dels: Row[]; adds: Row[]; index: number }

function buildRows(before: string, after: string): Row[] {
  const parts = diffLines(before, after)
  const rows: Row[] = []
  let oldNo = 1
  let newNo = 1
  for (const p of parts) {
    const lines = p.value.split('\n')
    if (lines.length && lines[lines.length - 1] === '') lines.pop()
    for (const line of lines) {
      if (p.added) rows.push({ kind: 'add', text: line, newNo: newNo++ })
      else if (p.removed) rows.push({ kind: 'del', text: line, oldNo: oldNo++ })
      else rows.push({ kind: 'context', text: line, oldNo: oldNo++, newNo: newNo++ })
    }
  }
  return rows
}

function toSegments(rows: Row[]): Segment[] {
  const segs: Segment[] = []
  let dels: Row[] = []
  let adds: Row[] = []
  let idx = 0
  const flush = () => {
    if (dels.length || adds.length) {
      segs.push({ t: 'chg', dels, adds, index: idx++ })
      dels = []
      adds = []
    }
  }
  for (const r of rows) {
    if (r.kind === 'context') {
      flush()
      segs.push({ t: 'ctx', row: r })
    } else if (r.kind === 'del') dels.push(r)
    else adds.push(r)
  }
  flush()
  return segs
}

// --------------------------- intra-line word diff --------------------------

/** Word-level highlight for a paired removed/added line (split view). */
function inlineWords(oldText: string, newText: string): { left: React.ReactNode; right: React.ReactNode } {
  const parts = diffWordsWithSpace(oldText, newText)
  const left: React.ReactNode[] = []
  const right: React.ReactNode[] = []
  parts.forEach((p, i) => {
    if (p.added) {
      right.push(<mark key={i} className="rounded-xs bg-success-4 text-success-11">{p.value}</mark>)
    } else if (p.removed) {
      left.push(<mark key={i} className="rounded-xs bg-error-4 text-error-11 line-through decoration-error-11/40">{p.value}</mark>)
    } else {
      left.push(<span key={i}>{p.value}</span>)
      right.push(<span key={i}>{p.value}</span>)
    }
  })
  return { left, right }
}

// -------------------------------- summary ----------------------------------

function Summary({ added, removed, changes, className }: { added: number; removed: number; changes: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-ds-03 text-body-sm font-sans', className)}>
      <span className="font-mono tabular-nums text-success-11">+{added}</span>
      <span className="font-mono tabular-nums text-error-11">&minus;{removed}</span>
      <span className="text-surface-fg-subtle">
        {changes === 0 ? 'No changes' : `${changes} ${changes === 1 ? 'change' : 'changes'}`}
      </span>
    </div>
  )
}

// ----------------------------- review controls -----------------------------

function HunkControls({
  seg,
  onAccept,
  onReject,
}: {
  seg: Extract<Segment, { t: 'chg' }>
  onAccept?: (h: DiffHunk) => void
  onReject?: (h: DiffHunk) => void
}) {
  if (!onAccept && !onReject) return null
  const hunk: DiffHunk = {
    index: seg.index,
    before: seg.dels.map((d) => d.text).join('\n'),
    after: seg.adds.map((a) => a.text).join('\n'),
  }
  return (
    <div className="flex items-center gap-ds-01">
      {onReject && (
        <Button variant="ghost" size="icon-xs" aria-label={`Reject change ${seg.index + 1}`} onClick={() => onReject(hunk)}>
          <Icon icon={IconX} size="xs" />
        </Button>
      )}
      {onAccept && (
        <Button variant="ghost" size="icon-xs" aria-label={`Accept change ${seg.index + 1}`} onClick={() => onAccept(hunk)}>
          <Icon icon={IconCheck} size="xs" />
        </Button>
      )}
    </div>
  )
}

// ------------------------------ line renderers -----------------------------

const GUTTER = 'select-none pl-ds-03 pr-ds-03 text-right font-mono text-caption tabular-nums text-surface-fg-subtle'
const CELL = 'whitespace-pre-wrap break-words px-ds-03 font-mono text-body-sm leading-ds-relaxed'
const SIGN = 'select-none pl-ds-02 pr-ds-01 font-mono text-body-sm'

function InlineRows({
  segs,
  collapsibles,
  expanded,
  onExpand,
  onAcceptHunk,
  onRejectHunk,
}: {
  segs: RenderItem[]
  collapsibles: Map<number, Row[]>
  expanded: Set<number>
  onExpand: (i: number) => void
  onAcceptHunk?: (h: DiffHunk) => void
  onRejectHunk?: (h: DiffHunk) => void
}) {
  const hasReview = !!onAcceptHunk || !!onRejectHunk
  return (
    <div className="min-w-full py-ds-02">
      {segs.map((item, i) => {
        if (item.t === 'gap') {
          const hidden = collapsibles.get(item.key) ?? []
          if (expanded.has(item.key)) {
            return (
              <Reveal key={`reveal-${item.key}`}>
                {hidden.map((r) => <CtxLine key={`${item.key}-${r.oldNo}`} row={r} split={false} />)}
              </Reveal>
            )
          }
          return (
            <button
              key={`gap-${i}`}
              type="button"
              onClick={() => onExpand(item.key)}
              className="flex w-full items-center gap-ds-02 border-y border-surface-border-subtle/30 bg-surface-3 px-ds-03 py-ds-01 text-caption text-surface-fg-subtle hover:bg-surface-4"
            >
              <Icon icon={IconChevronDown} size="xs" />
              Expand {hidden.length} unchanged {hidden.length === 1 ? 'line' : 'lines'}
            </button>
          )
        }
        if (item.t === 'ctx') return <CtxLine key={`c-${i}`} row={item.row} split={false} />
        // change block
        return (
          <div key={`h-${i}`} className="group relative">
            {item.dels.map((r, j) => (
              <div key={`d-${j}`} className="flex bg-error-3">
                <span className={cn(GUTTER, 'min-w-[3.5ch]')}>{r.oldNo}</span>
                <span className={cn(GUTTER, 'min-w-[3.5ch] text-error-11/60')} />
                <span className={cn(SIGN, 'text-error-11')}>&minus;</span>
                <span className={cn(CELL, 'flex-1 text-error-11')}>{r.text || ' '}</span>
              </div>
            ))}
            {item.adds.map((r, j) => (
              <div key={`a-${j}`} className="flex bg-success-3">
                <span className={cn(GUTTER, 'min-w-[3.5ch] text-success-11/60')} />
                <span className={cn(GUTTER, 'min-w-[3.5ch]')}>{r.newNo}</span>
                <span className={cn(SIGN, 'text-success-11')}>+</span>
                <span className={cn(CELL, 'flex-1 text-success-11')}>{r.text || ' '}</span>
              </div>
            ))}
            {hasReview && (
              <div className="absolute right-ds-02 top-ds-01 opacity-0 transition-opacity group-hover:opacity-100">
                <HunkControls seg={item} onAccept={onAcceptHunk} onReject={onRejectHunk} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CtxLine({ row, split }: { row: Row; split: boolean }) {
  return (
    <div className="flex bg-surface-2">
      <span className={cn(GUTTER, 'min-w-[3.5ch]')}>{row.oldNo}</span>
      {!split && <span className={cn(GUTTER, 'min-w-[3.5ch]')}>{row.newNo}</span>}
      <span className={cn(SIGN, 'text-surface-fg-subtle')}>&nbsp;</span>
      <span className={cn(CELL, 'flex-1 text-surface-fg-muted')}>{row.text || ' '}</span>
    </div>
  )
}

function SplitRows({
  segs,
  collapsibles,
  expanded,
  onExpand,
  onAcceptHunk,
  onRejectHunk,
}: {
  segs: RenderItem[]
  collapsibles: Map<number, Row[]>
  expanded: Set<number>
  onExpand: (i: number) => void
  onAcceptHunk?: (h: DiffHunk) => void
  onRejectHunk?: (h: DiffHunk) => void
}) {
  const hasReview = !!onAcceptHunk || !!onRejectHunk
  const sideCell = (no: number | undefined, node: React.ReactNode, tone: string, sign: string) => (
    <div className={cn('flex flex-1 min-w-0', tone)}>
      <span className={cn(GUTTER, 'min-w-[3.5ch]')}>{no ?? ''}</span>
      <span className={cn(SIGN)}>{sign}</span>
      <span className={cn(CELL, 'flex-1')}>{node}</span>
    </div>
  )
  return (
    <div className="min-w-full py-ds-02">
      {segs.map((item, i) => {
        if (item.t === 'gap') {
          const hidden = collapsibles.get(item.key) ?? []
          if (expanded.has(item.key)) {
            return (
              <Reveal key={`reveal-${item.key}`}>
                {hidden.map((r) => (
                  <div key={`${item.key}-${r.oldNo}`} className="flex divide-x divide-surface-border-subtle/30">
                    {sideCell(r.oldNo, r.text || ' ', 'bg-surface-2 text-surface-fg-muted', ' ')}
                    {sideCell(r.newNo, r.text || ' ', 'bg-surface-2 text-surface-fg-muted', ' ')}
                  </div>
                ))}
              </Reveal>
            )
          }
          return (
            <button
              key={`gap-${i}`}
              type="button"
              onClick={() => onExpand(item.key)}
              className="flex w-full items-center gap-ds-02 border-y border-surface-border-subtle/30 bg-surface-3 px-ds-03 py-ds-01 text-caption text-surface-fg-subtle hover:bg-surface-4"
            >
              <Icon icon={IconChevronDown} size="xs" />
              Expand {hidden.length} unchanged {hidden.length === 1 ? 'line' : 'lines'}
            </button>
          )
        }
        if (item.t === 'ctx') {
          const r = item.row
          return (
            <div key={`c-${i}`} className="flex divide-x divide-surface-border-subtle/30">
              {sideCell(r.oldNo, r.text || ' ', 'bg-surface-2 text-surface-fg-muted', ' ')}
              {sideCell(r.newNo, r.text || ' ', 'bg-surface-2 text-surface-fg-muted', ' ')}
            </div>
          )
        }
        // change block — pair dels[k] with adds[k]; word-highlight when both exist
        const n = Math.max(item.dels.length, item.adds.length)
        return (
          <div key={`h-${i}`} className="group relative">
            {Array.from({ length: n }, (_, k) => {
              const d = item.dels[k]
              const a = item.adds[k]
              let leftNode: React.ReactNode = d ? d.text || ' ' : ''
              let rightNode: React.ReactNode = a ? a.text || ' ' : ''
              if (d && a) {
                const w = inlineWords(d.text, a.text)
                leftNode = w.left
                rightNode = w.right
              }
              return (
                <div key={`r-${k}`} className="flex divide-x divide-surface-border-subtle/30">
                  {d
                    ? sideCell(d.oldNo, leftNode, 'bg-error-3 text-error-11', '−')
                    : sideCell(undefined, '', 'bg-surface-3/40', ' ')}
                  {a
                    ? sideCell(a.newNo, rightNode, 'bg-success-3 text-success-11', '+')
                    : sideCell(undefined, '', 'bg-surface-3/40', ' ')}
                </div>
              )
            })}
            {hasReview && (
              <div className="absolute right-ds-02 top-ds-01 opacity-0 transition-opacity group-hover:opacity-100">
                <HunkControls seg={item} onAccept={onAcceptHunk} onReject={onRejectHunk} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// --------------------------- collapse (render list) ------------------------

type RenderItem = Segment | { t: 'gap'; key: number }

function collapse(
  segs: Segment[],
  enabled: boolean,
  threshold: number,
  context: number,
): { items: RenderItem[]; collapsibles: Map<number, Row[]> } {
  const collapsibles = new Map<number, Row[]>()
  if (!enabled) return { items: segs, collapsibles }
  const items: RenderItem[] = []
  let gapKey = 0
  let i = 0
  while (i < segs.length) {
    const s = segs[i]
    if (s.t !== 'ctx') {
      items.push(s)
      i++
      continue
    }
    // gather a run of context segments
    let j = i
    const run: Row[] = []
    while (j < segs.length && segs[j].t === 'ctx') {
      run.push((segs[j] as Extract<Segment, { t: 'ctx' }>).row)
      j++
    }
    const atStart = i === 0
    const atEnd = j === segs.length
    if (run.length > threshold) {
      const head = atStart ? 0 : context
      const tail = atEnd ? 0 : context
      const hidden = run.slice(head, run.length - tail)
      run.slice(0, head).forEach((r) => items.push({ t: 'ctx', row: r }))
      if (hidden.length > 0) {
        const key = gapKey++
        collapsibles.set(key, hidden)
        items.push({ t: 'gap', key })
      }
      run.slice(run.length - tail).forEach((r) => items.push({ t: 'ctx', row: r }))
    } else {
      run.forEach((r) => items.push({ t: 'ctx', row: r }))
    }
    i = j
  }
  return { items, collapsibles }
}

// ------------------------------ word (prose) -------------------------------

function WordDiff({ before, after }: { before: string; after: string }) {
  const parts = diffWordsWithSpace(before, after)
  return (
    <div className="whitespace-pre-wrap break-words px-ds-04 py-ds-03 font-sans text-body-md leading-ds-relaxed text-surface-fg bg-surface-2">
      {parts.map((p, i) => {
        if (p.added) return <mark key={i} className="rounded-xs bg-success-4 text-success-11">{p.value}</mark>
        if (p.removed) return <mark key={i} className="rounded-xs bg-error-4 text-error-11 line-through decoration-error-11/40">{p.value}</mark>
        return <span key={i}>{p.value}</span>
      })}
    </div>
  )
}

// ---------------------------- fields (structured) --------------------------

interface FieldChange {
  path: string
  kind: 'added' | 'removed' | 'changed'
  before?: string
  after?: string
}

function flatten(obj: unknown, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  if (obj === null || typeof obj !== 'object') {
    out[prefix || '(root)'] = obj === undefined ? '' : JSON.stringify(obj)
    return out
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, prefix ? `${prefix}[${i}]` : `[${i}]`, out))
    return out
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    flatten(v, prefix ? `${prefix}.${k}` : k, out)
  }
  return out
}

function fieldChanges(before: string, after: string): { changes: FieldChange[]; error: string | null } {
  let a: unknown
  let b: unknown
  try {
    a = JSON.parse(before)
    b = JSON.parse(after)
  } catch {
    return { changes: [], error: 'Fields mode needs valid JSON on both sides.' }
  }
  const fa = flatten(a)
  const fb = flatten(b)
  const keys = Array.from(new Set([...Object.keys(fa), ...Object.keys(fb)])).sort()
  const changes: FieldChange[] = []
  for (const path of keys) {
    const inA = path in fa
    const inB = path in fb
    if (inA && !inB) changes.push({ path, kind: 'removed', before: fa[path] })
    else if (!inA && inB) changes.push({ path, kind: 'added', after: fb[path] })
    else if (fa[path] !== fb[path]) changes.push({ path, kind: 'changed', before: fa[path], after: fb[path] })
  }
  return { changes, error: null }
}

function FieldsDiff({
  before,
  after,
  onAcceptHunk,
  onRejectHunk,
}: {
  before: string
  after: string
  onAcceptHunk?: (h: DiffHunk) => void
  onRejectHunk?: (h: DiffHunk) => void
}) {
  const { changes, error } = React.useMemo(() => fieldChanges(before, after), [before, after])
  const hasReview = !!onAcceptHunk || !!onRejectHunk
  if (error) {
    return <div className="bg-surface-2 px-ds-04 py-ds-03 text-body-sm text-error-11">{error}</div>
  }
  if (changes.length === 0) {
    return <div className="bg-surface-2 px-ds-04 py-ds-03 text-body-sm text-surface-fg-subtle">No field changes.</div>
  }
  const TONE = {
    added: 'text-success-11',
    removed: 'text-error-11',
    changed: 'text-surface-fg',
  } as const
  return (
    <div className="divide-y divide-surface-border-subtle/30 bg-surface-2">
      {changes.map((c, i) => (
        <div key={c.path} className="group flex items-start gap-ds-03 px-ds-04 py-ds-03">
          <span className={cn('mt-[2px] shrink-0 text-body-xs font-medium', TONE[c.kind])}>
            {c.kind === 'added' ? 'Added' : c.kind === 'removed' ? 'Removed' : 'Changed'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-body-sm font-medium text-surface-fg">{c.path}</div>
            <div className="mt-ds-01 flex flex-col gap-ds-01 font-mono text-body-sm">
              {c.before !== undefined && (
                <span className="text-error-11"><span className="select-none pr-ds-02">&minus;</span>{c.before}</span>
              )}
              {c.after !== undefined && (
                <span className="text-success-11"><span className="select-none pr-ds-02">+</span>{c.after}</span>
              )}
            </div>
          </div>
          {hasReview && (
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <HunkControls
                seg={{ t: 'chg', index: i, dels: c.before !== undefined ? [{ kind: 'del', text: c.before }] : [], adds: c.after !== undefined ? [{ kind: 'add', text: c.after }] : [] }}
                onAccept={onAcceptHunk}
                onReject={onRejectHunk}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ------------------------------ compound context ---------------------------

/** The computed diff model, shared by every `Diff.*` part via context. */
interface DiffModel {
  mode: DiffMode
  granularity: DiffGranularity
  isWord: boolean
  before: string
  after: string
  beforeLabel: string
  afterLabel: string
  added: number
  removed: number
  changeCount: number
  items: RenderItem[]
  collapsibles: Map<number, Row[]>
  expanded: Set<number>
  onExpand: (k: number) => void
  onAcceptHunk?: (h: DiffHunk) => void
  onRejectHunk?: (h: DiffHunk) => void
}

const DiffContext = React.createContext<DiffModel | null>(null)

/** Read the diff model inside a `<Diff.Root>`. Throws if used outside one. */
function useDiff(): DiffModel {
  const ctx = React.useContext(DiffContext)
  if (!ctx) throw new Error('Diff compound components must be used within <Diff.Root>')
  return ctx
}

export interface DiffRootProps
  extends Pick<
    DiffProps,
    | 'before'
    | 'after'
    | 'mode'
    | 'granularity'
    | 'collapseUnchanged'
    | 'collapseThreshold'
    | 'contextLines'
    | 'beforeLabel'
    | 'afterLabel'
    | 'onAcceptHunk'
    | 'onRejectHunk'
  > {
  children: React.ReactNode
}

/**
 * Computes the diff once and provides it to `Diff.Summary` / `Diff.Body`.
 * Compose your own layout around these parts, or use `<Diff>` for the default.
 */
function DiffRoot({
  before,
  after,
  mode = 'inline',
  granularity = 'line',
  collapseUnchanged = true,
  collapseThreshold = 6,
  contextLines = 3,
  beforeLabel = 'Committed',
  afterLabel = 'Pending',
  onAcceptHunk,
  onRejectHunk,
  children,
}: DiffRootProps) {
  const [expanded, setExpanded] = React.useState<Set<number>>(() => new Set())
  const onExpand = React.useCallback((k: number) => {
    setExpanded((prev) => new Set(prev).add(k))
  }, [])

  const isWord = granularity === 'word' && mode !== 'fields'

  const stats = React.useMemo(() => {
    if (mode === 'fields') {
      const { changes } = fieldChanges(before, after)
      return {
        rows: [] as Row[],
        added: changes.filter((c) => c.kind === 'added').length,
        removed: changes.filter((c) => c.kind === 'removed').length,
        changeCount: changes.length,
      }
    }
    if (isWord) {
      const parts = diffWordsWithSpace(before, after)
      let a = 0
      let r = 0
      let groups = 0
      for (const p of parts) {
        if (!p.added && !p.removed) continue
        groups += 1
        const words = p.value.trim() ? p.value.trim().split(/\s+/).length : 0
        if (p.added) a += words
        else r += words
      }
      return { rows: [] as Row[], added: a, removed: r, changeCount: groups }
    }
    const rs = buildRows(before, after)
    const segs = toSegments(rs)
    return {
      rows: rs,
      added: rs.filter((x) => x.kind === 'add').length,
      removed: rs.filter((x) => x.kind === 'del').length,
      changeCount: segs.filter((s) => s.t === 'chg').length,
    }
  }, [before, after, mode, isWord])

  const { items, collapsibles } = React.useMemo(() => {
    const segs = stats.rows.length ? toSegments(stats.rows) : []
    return collapse(segs, collapseUnchanged && !isWord, collapseThreshold, contextLines)
  }, [stats.rows, collapseUnchanged, isWord, collapseThreshold, contextLines])

  const model: DiffModel = {
    mode,
    granularity,
    isWord,
    before,
    after,
    beforeLabel,
    afterLabel,
    added: stats.added,
    removed: stats.removed,
    changeCount: stats.changeCount,
    items,
    collapsibles,
    expanded,
    onExpand,
    onAcceptHunk,
    onRejectHunk,
  }

  return <DiffContext.Provider value={model}>{children}</DiffContext.Provider>
}

/** The +N / −N / change-count summary. Reads from `Diff.Root`. */
function DiffSummary({ className }: { className?: string }) {
  const { added, removed, changeCount } = useDiff()
  return <Summary added={added} removed={removed} changes={changeCount} className={className} />
}

/** Column labels (split mode) — place above `Diff.Body` in a custom layout. */
function DiffColumnLabels({ className }: { className?: string }) {
  const { mode, beforeLabel, afterLabel } = useDiff()
  if (mode !== 'split') return null
  return (
    <div className={cn('flex gap-ds-04 text-label-xs font-semibold uppercase tracking-wide text-surface-fg-subtle', className)}>
      <span className="flex-1">{beforeLabel}</span>
      <span className="flex-1">{afterLabel}</span>
    </div>
  )
}

/** The rendered diff body (inline / split / word / fields). Reads from `Diff.Root`. */
function DiffBody({ className }: { className?: string }) {
  const m = useDiff()
  return (
    <div className={cn('overflow-x-auto', className)}>
      {m.mode === 'fields' ? (
        <FieldsDiff before={m.before} after={m.after} onAcceptHunk={m.onAcceptHunk} onRejectHunk={m.onRejectHunk} />
      ) : m.isWord ? (
        <WordDiff before={m.before} after={m.after} />
      ) : m.mode === 'split' ? (
        <SplitRows segs={m.items} collapsibles={m.collapsibles} expanded={m.expanded} onExpand={m.onExpand} onAcceptHunk={m.onAcceptHunk} onRejectHunk={m.onRejectHunk} />
      ) : (
        <InlineRows segs={m.items} collapsibles={m.collapsibles} expanded={m.expanded} onExpand={m.onExpand} onAcceptHunk={m.onAcceptHunk} onRejectHunk={m.onRejectHunk} />
      )}
    </div>
  )
}

// --------------------------- batteries-included Diff -----------------------

const Diff = React.forwardRef<HTMLDivElement, DiffProps>(function Diff(
  {
    before,
    after,
    mode = 'inline',
    granularity = 'line',
    collapseUnchanged = true,
    collapseThreshold = 6,
    contextLines = 3,
    showSummary = true,
    beforeLabel = 'Committed',
    afterLabel = 'Pending',
    onAcceptHunk,
    onRejectHunk,
    className,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('overflow-hidden rounded-ds-lg border border-card bg-surface-2 text-surface-fg', className)}
      {...props}
    >
      <DiffRoot
        before={before}
        after={after}
        mode={mode}
        granularity={granularity}
        collapseUnchanged={collapseUnchanged}
        collapseThreshold={collapseThreshold}
        contextLines={contextLines}
        beforeLabel={beforeLabel}
        afterLabel={afterLabel}
        onAcceptHunk={onAcceptHunk}
        onRejectHunk={onRejectHunk}
      >
        {(showSummary || mode === 'split') && (
          <div className="flex items-center justify-between gap-ds-03 border-b border-surface-border-subtle/30 bg-surface-2 px-ds-04 py-ds-02">
            {mode === 'split' ? (
              <DiffColumnLabels className="flex-1" />
            ) : (
              <span className="text-body-sm font-medium text-surface-fg-subtle">Changes</span>
            )}
            {showSummary && <DiffSummary />}
          </div>
        )}
        <DiffBody />
      </DiffRoot>
    </div>
  )
})

Diff.displayName = 'Diff'

// Attach compound parts for `Diff.Root` / `Diff.Summary` / `Diff.Body` ergonomics.
const DiffNamespace = Object.assign(Diff, {
  Root: DiffRoot,
  Summary: DiffSummary,
  Body: DiffBody,
  ColumnLabels: DiffColumnLabels,
})

export { DiffNamespace as Diff, DiffRoot, DiffSummary, DiffBody, DiffColumnLabels, useDiff }
