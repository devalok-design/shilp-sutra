/** Detect macOS / iOS for modifier key display. */
export function getIsMac(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.userAgent
  return /mac|iphone|ipad|ipod/i.test(ua)
}

/** Parse a keybinding string into a predicate that tests a KeyboardEvent. */
export function matchesKeybinding(e: KeyboardEvent, binding: string): boolean {
  const parts = binding.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  const modifiers = new Set(parts.slice(0, -1))

  const isMac = getIsMac()
  const needsMod = modifiers.has('mod')
  const needsCtrl = modifiers.has('ctrl') || (!isMac && needsMod)
  const needsMeta = modifiers.has('meta') || (isMac && needsMod)
  const needsShift = modifiers.has('shift')
  const needsAlt = modifiers.has('alt')

  if (needsCtrl && !e.ctrlKey) return false
  if (needsMeta && !e.metaKey) return false
  if (needsShift && !e.shiftKey) return false
  if (needsAlt && !e.altKey) return false

  // Ensure no extra modifiers are pressed
  if (!needsCtrl && !needsMeta && e.ctrlKey) return false
  if (!needsMeta && !needsCtrl && e.metaKey) return false
  if (!needsShift && e.shiftKey) return false
  if (!needsAlt && e.altKey) return false

  return e.key.toLowerCase() === key
}

/** Display-friendly modifier name. */
export function getModifierDisplay(isMac: boolean): string {
  return isMac ? '⌘' : 'Ctrl'
}
