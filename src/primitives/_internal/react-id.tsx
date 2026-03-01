/**
 * Vendored from @radix-ui/react-id
 * @see ../LICENSE
 */

import * as React from 'react';
import { useLayoutEffect } from './react-use-layout-effect';

const useReactId = (React as any)[' useId '.trim().toString()] || (() => undefined);
let count = 0;

function useId(deterministicId?: string): string {
  const [id, setId] = React.useState<string | undefined>(useReactId());
  useLayoutEffect(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : '');
}

export { useId };
