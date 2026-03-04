/**
 * Vendored from @radix-ui/react-use-previous
 * @see ../LICENSE
 */

import * as React from 'react';

function usePrevious<T>(value: T) {
  const ref = React.useRef({ value, previous: value });

  return React.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}

export { usePrevious };
