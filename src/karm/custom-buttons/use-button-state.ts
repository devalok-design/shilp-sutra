import { useState, useCallback, type FocusEvent } from 'react'

type ButtonState = 'default' | 'focused' | 'hover' | 'pressed'

export function useButtonState() {
  const [state, setState] = useState<ButtonState>('default')

  const handlers = {
    onMouseEnter: useCallback(() => setState('hover'), []),
    onMouseLeave: useCallback(() => setState('default'), []),
    onMouseDown: useCallback(() => setState('pressed'), []),
    onMouseUp: useCallback(() => setState('hover'), []),
    onFocus: useCallback((e: FocusEvent) => {
      if (e.target === e.currentTarget) setState('focused')
    }, []),
    onBlur: useCallback(() => setState('default'), []),
  }

  return { state, handlers }
}
