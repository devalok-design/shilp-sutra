# TruncatedText

- Import: @devalok/shilp-sutra/ui/truncated-text
- Server-safe: No
- Category: ui

## Props
    children: string (REQUIRED — the full text; always the accessible name, even when shortened)
    mode: "end" | "clamp" | "middle" (end [default] = single-line ellipsis; clamp = multi-line; middle = keep both ends)
    lines: number (lines to show in mode="clamp"; default 2)
    as: "span" | "p" | "div" (element to render; default "span")
    tooltip: boolean (show the full text in a tooltip when — and only when — actually clipped; default true)
    title: string (override the full-text accessible name / tooltip; defaults to children)
    className: string

## Defaults
    mode="end", lines=2, as="span", tooltip=true

## Example
```jsx
<TruncatedText>{user.name}</TruncatedText>

// Filenames / emails — keep the extension / domain:
<TruncatedText mode="middle">{fileName}</TruncatedText>     // report…v7.pdf

// Multi-line description with a 2-line clamp:
<TruncatedText as="p" mode="clamp" lines={2}>{description}</TruncatedText>

// In a flex row, the shrinking item still needs min-w-0:
<div className="flex items-center gap-ds-03">
  <Avatar … />
  <TruncatedText className="min-w-0 flex-1">{user.name}</TruncatedText>
</div>
```

## Composability
- **Truncates AND recovers in one place:** `end`/`clamp` are pure CSS (full text stays in the DOM → screen-reader safe). `middle` measures the element and JS-shortens the visible string but keeps the full string as the accessible name. A tooltip appears only when `scrollWidth`/`scrollHeight` actually exceeds the box (measured via ResizeObserver) — no tooltip noise on text that fits.
- **`mode="middle"` for identifiers:** filenames (extension), emails (domain), paths, hashes — end-ellipsis destroys the meaningful tail; middle keeps both ends. Middle is not native CSS, so it's measured + recomputed on resize.
- **The flexbox gotcha:** `truncate` (and `middle`) do nothing on a flex/grid child unless that item has `min-w-0` (or an explicit width). TruncatedText can't set that on its parent — add `min-w-0` at the call site.
- **Don't truncate everything:** page titles/H1, toast bodies, validation messages, and numbers must show fully (a truncated number is a wrong number). Use this for bounded list/nav/metadata text.

## Gotchas
- `children` must be a string (it's measured + used as the accessible name) — not arbitrary ReactNode.
- In a flex row, add `min-w-0` to the TruncatedText (or its column) or nothing truncates.
- `mode="middle"` clips to the largest middle-truncated string that fits; the last glyph may be sub-pixel-clipped by overflow-hidden — the tooltip + aria-label always carry the full string.

## Changes
### v0.44.0
- **Added** Initial release — end/clamp/middle truncation with overflow-aware tooltip recovery.
