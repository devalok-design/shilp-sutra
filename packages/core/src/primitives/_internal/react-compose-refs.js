/**
 * Vendored from @radix-ui/react-compose-refs
 * @see ../LICENSE
 */
import * as React from 'react';
function setRef(ref, value) {
    if (typeof ref === 'function') {
        // React 19 ref callbacks can return cleanup functions
        return ref(value);
    }
    else if (ref !== null && ref !== undefined) {
        ref.current = value;
    }
}
function composeRefs(...refs) {
    return (node) => {
        let hasCleanup = false;
        const cleanups = refs.map((ref) => {
            const cleanup = setRef(ref, node);
            if (!hasCleanup && typeof cleanup == 'function') {
                hasCleanup = true;
            }
            return cleanup;
        });
        if (hasCleanup) {
            return () => {
                for (let i = 0; i < cleanups.length; i++) {
                    const cleanup = cleanups[i];
                    if (typeof cleanup == 'function') {
                        cleanup();
                    }
                    else {
                        setRef(refs[i], null);
                    }
                }
            };
        }
    };
}
function useComposedRefs(...refs) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return React.useCallback(composeRefs(...refs), refs);
}
export { composeRefs, useComposedRefs };
