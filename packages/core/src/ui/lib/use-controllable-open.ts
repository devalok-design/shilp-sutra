import * as React from 'react'

/**
 * Options for {@link useControllableOpen}. Mirrors the standard Radix open-state
 * prop trio so a component can spread its own props straight in.
 */
export interface UseControllableOpenOptions {
  /** Controlled open value. When defined, the hook is in controlled mode. */
  open?: boolean
  /** Initial open value in uncontrolled mode. @default false */
  defaultOpen?: boolean
  /** Called on every open/close request (both modes). */
  onOpenChange?: (open: boolean) => void
}

export interface ControllableOpen {
  /** The effective open state (controlled value, or internal state). */
  open: boolean
  /** Request a new open state — updates internal state (uncontrolled) and always fires `onOpenChange`. */
  setOpen: (next: boolean) => void
  /** Convenience: `setOpen(false)`. Stable across renders. */
  close: () => void
}

/**
 * Controlled/uncontrolled open-state machine shared by every overlay
 * (Dialog, Popover, Sheet, Tooltip, DropdownMenu, …). The effective `open` is
 * kept in React state even in controlled mode so overlays can drive
 * `AnimatePresence` exit animations from it.
 *
 * Extracted so the identical block isn't hand-copied per overlay — one fix
 * site instead of six.
 */
export function useControllableOpen({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: UseControllableOpenOptions): ControllableOpen {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const close = React.useCallback(() => setOpen(false), [setOpen])

  return { open, setOpen, close }
}
