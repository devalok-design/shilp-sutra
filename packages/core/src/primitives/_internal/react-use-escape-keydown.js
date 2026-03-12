/**
 * Vendored from @radix-ui/react-use-escape-keydown
 * @see ../LICENSE
 */
import * as React from 'react';
import { useCallbackRef } from './react-use-callback-ref';
function useEscapeKeydown(onEscapeKeyDownProp, ownerDocument = globalThis?.document) {
    const onEscapeKeyDown = useCallbackRef(onEscapeKeyDownProp);
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onEscapeKeyDown(event);
            }
        };
        ownerDocument.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => ownerDocument.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [onEscapeKeyDown, ownerDocument]);
}
export { useEscapeKeydown };
