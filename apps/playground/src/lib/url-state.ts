export interface PlaygroundState {
  primitives: Record<string, string>   // e.g. { '--pink-500': '#E04080' }
  semantic: Record<string, string>     // e.g. { '--spacing-04': '20px' }
  mode: 'tokens' | 'sandbox'
  darkMode: boolean
  component?: string                   // Component name for sandbox mode
  props?: Record<string, unknown>      // Component props for sandbox mode
}

const EMPTY_STATE: PlaygroundState = {
  primitives: {},
  semantic: {},
  mode: 'tokens',
  darkMode: false,
}

export function encodeState(state: PlaygroundState): string {
  const overrides: Partial<PlaygroundState> = {}
  if (Object.keys(state.primitives).length > 0) overrides.primitives = state.primitives
  if (Object.keys(state.semantic).length > 0) overrides.semantic = state.semantic
  if (state.mode !== 'tokens') overrides.mode = state.mode
  if (state.darkMode) overrides.darkMode = true
  if (state.component) overrides.component = state.component
  if (state.props && Object.keys(state.props).length > 0) overrides.props = state.props
  if (Object.keys(overrides).length === 0) return ''
  return btoa(JSON.stringify(overrides))
}

export function decodeState(hash: string): PlaygroundState {
  if (!hash) return { ...EMPTY_STATE }
  try {
    const decoded = JSON.parse(atob(hash))
    return { ...EMPTY_STATE, ...decoded }
  } catch {
    return { ...EMPTY_STATE }
  }
}

export function getStateFromUrl(): PlaygroundState {
  const hash = window.location.hash.slice(1) // remove '#'
  return decodeState(hash)
}

export function setStateToUrl(state: PlaygroundState): void {
  const encoded = encodeState(state)
  window.history.replaceState(null, '', encoded ? `#${encoded}` : window.location.pathname)
}
