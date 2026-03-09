import * as React from 'react'

export function useComposedRef<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return React.useCallback((node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(node)
      } else {
        (ref as React.MutableRefObject<T | null>).current = node
      }
    })
  }, refs) // eslint-disable-line react-hooks/exhaustive-deps
}
