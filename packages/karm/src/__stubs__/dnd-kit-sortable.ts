/**
 * Vite-level stub for @dnd-kit/sortable.
 *
 * Aliased in vitest.config.ts so Vite never resolves the real
 * @dnd-kit/sortable dependency tree. Every export becomes a no-op
 * component, hook, or constant.
 */
import React from 'react'

// ── Context / Provider ───────────────────────────────────────────────────────
export const SortableContext = ({ children }: any) =>
  React.createElement(React.Fragment, null, children)

// ── Hooks ────────────────────────────────────────────────────────────────────
export function useSortable(_args: any) {
  return {
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    setActivatorNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
    isSorting: false,
    isOver: false,
    active: null,
    over: null,
    index: 0,
    overIndex: -1,
    activeIndex: -1,
    items: [],
    newIndex: 0,
    node: { current: null },
    rect: { current: null },
  }
}

// ── Strategies ───────────────────────────────────────────────────────────────
export const verticalListSortingStrategy = () => null
export const horizontalListSortingStrategy = () => null
export const rectSortingStrategy = () => null
export const rectSwappingStrategy = () => null

// ── Keyboard coordinates ─────────────────────────────────────────────────────
export const sortableKeyboardCoordinates = () => []

// ── Utilities ────────────────────────────────────────────────────────────────
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const result = array.slice()
  const [removed] = result.splice(from, 1)
  result.splice(to, 0, removed)
  return result
}

// ── Default transition ───────────────────────────────────────────────────────
export const defaultAnimateLayoutChanges = () => true
