/**
 * Vite-level stub for @dnd-kit/core.
 *
 * Aliased in vitest.config.ts so Vite never resolves the real
 * @dnd-kit/core dependency tree. Every export becomes a no-op
 * component, hook, or constant.
 */
import React from 'react'

// ── Types ────────────────────────────────────────────────────────────────────
export type UniqueIdentifier = string | number
export type DragStartEvent = { active: { id: UniqueIdentifier } }
export type DragOverEvent = DragStartEvent & { over: { id: UniqueIdentifier } | null }
export type DragEndEvent = DragOverEvent
export type DragCancelEvent = DragStartEvent

// ── Context / Provider ───────────────────────────────────────────────────────
export const DndContext = ({ children }: any) =>
  React.createElement(React.Fragment, null, children)

export const DragOverlay = ({ children }: any) =>
  React.createElement(React.Fragment, null, children)

// ── Sensors ──────────────────────────────────────────────────────────────────
export class PointerSensor {
  static activators = []
}
export class KeyboardSensor {
  static activators = []
}
export class TouchSensor {
  static activators = []
}
export class MouseSensor {
  static activators = []
}

export function useSensor(sensor: any, _options?: any) {
  return { sensor, options: _options }
}

export function useSensors(...sensors: any[]) {
  return sensors
}

// ── Collision detection ──────────────────────────────────────────────────────
export const closestCenter = () => null
export const closestCorners = () => null
export const rectIntersection = () => null
export const pointerWithin = () => null

// ── Hooks ────────────────────────────────────────────────────────────────────
const noopRef = { current: null }

export function useDroppable(_args: any) {
  return {
    setNodeRef: () => {},
    isOver: false,
    active: null,
    over: null,
    node: noopRef,
    rect: noopRef,
  }
}

export function useDndContext() {
  return {
    active: null,
    over: null,
    activators: [],
    collisions: [],
    droppableRects: new Map(),
    droppableContainers: new Map(),
    scrollableAncestors: [],
  }
}

// ── Accessibility ────────────────────────────────────────────────────────────
export const defaultAnnouncements = {}
export const defaultScreenReaderInstructions = { draggable: '' }

// ── Modifiers ────────────────────────────────────────────────────────────────
export const restrictToVerticalAxis = () => ({})
export const restrictToHorizontalAxis = () => ({})
export const restrictToWindowEdges = () => ({})
