/**
 * Vendored from @radix-ui/react-use-layout-effect
 * @see ../LICENSE
 */
import * as React from 'react';
const useLayoutEffect = globalThis?.document ? React.useLayoutEffect : () => { };
export { useLayoutEffect };
