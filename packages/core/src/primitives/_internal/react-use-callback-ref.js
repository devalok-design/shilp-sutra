/**
 * Vendored from @radix-ui/react-use-callback-ref
 * @see ../LICENSE
 */
import * as React from 'react';
function useCallbackRef(callback) {
    const callbackRef = React.useRef(callback);
    React.useEffect(() => {
        callbackRef.current = callback;
    });
    // https://github.com/facebook/react/issues/19240
    return React.useMemo(() => ((...args) => callbackRef.current?.(...args)), []);
}
export { useCallbackRef };
