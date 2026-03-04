/**
 * Vendored from @radix-ui/react-use-rect
 * @see ../LICENSE
 */

import * as React from 'react';
import { observeElementRect } from './rect';
import type { Measurable } from './rect';

function useRect(measurable: Measurable | null) {
  const [rect, setRect] = React.useState<DOMRect>();
  React.useEffect(() => {
    if (measurable) {
      const unobserve = observeElementRect(measurable, setRect);
      return () => {
        setRect(undefined);
        unobserve();
      };
    }
    return;
  }, [measurable]);
  return rect;
}

export { useRect };
