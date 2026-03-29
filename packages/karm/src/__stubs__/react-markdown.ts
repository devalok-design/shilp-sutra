/**
 * Vite-level stub for react-markdown.
 *
 * Aliased in vitest.config.ts so Vite never resolves the real
 * react-markdown → unified/remark/rehype/micromark ecosystem (~285 packages).
 */
import React from 'react'

/** Minimal stub — parses bold markers into React strong elements. */
const Markdown = ({ children }: any) => {
  if (typeof children !== 'string') {
    return React.createElement('div', { 'data-testid': 'markdown' }, children)
  }
  const text = children as string
  const segments: React.ReactNode[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let cursor = 0
  let idx = 0
  let m: RegExpExecArray | null
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > cursor) segments.push(text.slice(cursor, m.index))
    segments.push(React.createElement('strong', { key: idx++ }, m[1]))
    cursor = m.index + m[0].length
  }
  if (cursor < text.length) segments.push(text.slice(cursor))
  return React.createElement('div', { 'data-testid': 'markdown' }, ...segments)
}

export default Markdown
