/**
 * Vendored from @radix-ui/react-use-is-hydrated
 * Uses React.useSyncExternalStore directly (React 18+) instead of the shim.
 * @see ../LICENSE
 */

import * as React from 'react';

function subscribe() {
  return () => {};
}

export function useIsHydrated() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
