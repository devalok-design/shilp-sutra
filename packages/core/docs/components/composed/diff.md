# Diff

- Import: @devalok/shilp-sutra/composed/diff
- Server-safe: No
- Category: composed

## Props
    before: string (committed / old version)
    after: string (pending / new version)
    mode: "inline" | "split" | "fields" (unified, side-by-side, or structured JSON diff)
    granularity: "line" | "word" (word = prose; ignored in fields mode)
    collapseUnchanged: boolean (collapse long runs of unchanged lines behind an expander)
    collapseThreshold: number (unchanged-line run length that triggers a collapse)
    contextLines: number (unchanged lines kept visible each side of a collapsed run)
    showSummary: boolean (+N / −N / change-count header)
    beforeLabel: string (old-side column label, split mode)
    afterLabel: string (new-side column label, split mode)
    onAcceptHunk: (hunk) => void (adds per-change Accept control)
    onRejectHunk: (hunk) => void (adds per-change Reject control)
    language: string (syntax-highlight full lines as this language — inline/split, "line" granularity only; lazy-loads react-syntax-highlighter, one-dark theme, same pattern as MarkdownViewer)
    beforeParseError: (raw: string) => ReactNode (custom render when `before` fails to parse as JSON in fields mode; default is a plain message)
    afterParseError: (raw: string) => ReactNode (custom render when `after` fails to parse as JSON in fields mode; default is a plain message)

## Defaults
    mode="inline", granularity="line", collapseUnchanged={true}, collapseThreshold={6}, contextLines={3}, showSummary={true}, beforeLabel="Committed", afterLabel="Pending"

## Example
```jsx
<Diff before={committed} after={pending} mode="split" />
<Diff before={a} after={b} granularity="word" />          // prose
<Diff before={jsonA} after={jsonB} mode="fields" />       // structured, diffs by key
<Diff before={a} after={b} onAcceptHunk={fn} onRejectHunk={fn} />  // review flow

// Composable — bring your own layout:
<Diff.Root before={a} after={b} mode="split">
  <header><Diff.ColumnLabels /><Diff.Summary /></header>
  <Diff.Body />
</Diff.Root>
```

## Composability
- **Wraps the headless `diff` (jsdiff) engine, owns the presentation** — same pattern as charts (d3) and data-table (TanStack). `diff` is a runtime dependency.
- **Three modes.** `inline` (unified), `split` (side-by-side with intra-line word highlights), `fields` (parses JSON both sides, diffs by key — added/removed/changed — for structured content like YAML front-matter).
- **Compound parts:** `Diff.Root` computes the diff once and provides it via context; `Diff.Summary`, `Diff.Body`, `Diff.ColumnLabels` read from it. Use the parts to place the summary in a sticky header, scroll the body, or wrap hunks in custom chrome. `useDiff()` exposes the model.
- **Review surface, not just a viewer.** Provide `onAcceptHunk` / `onRejectHunk` and each contiguous change (hunk) gets Accept/Reject controls — pair with an approve/reject footer.
- **Collapse unchanged** keeps long content readable (GitHub-style "expand N unchanged lines", animated open, reduced-motion aware).
- **Semantic colour:** additions use the `success` scale, removals the `error` scale — flips correctly in dark.

## Gotchas
- `fields` mode requires valid JSON on both sides; it reports a clear message per side otherwise (override with `beforeParseError`/`afterParseError`). For YAML, parse to an object and `JSON.stringify` before passing.
- `granularity="word"` is for prose; it renders a flowing word-level diff, not line gutters. `language` has no effect in word granularity or `fields` mode.
- Accept/Reject controls only appear when the matching handler is provided — the Diff itself doesn't mutate content; the consumer applies the decision.
- Hunk = a contiguous run of added/removed lines; `onAcceptHunk`/`onRejectHunk` receive `{ index, before, after }`.

## Changes
### Unreleased
- **Added** `language?: string` — syntax-highlight full lines (inline/split, line granularity) via lazy-loaded `react-syntax-highlighter`.
- **Added** `beforeParseError?: (raw: string) => ReactNode` / `afterParseError?: (raw: string) => ReactNode` — customize the fallback shown per side when `fields` mode JSON parsing fails (previously one fixed message covered both sides).
