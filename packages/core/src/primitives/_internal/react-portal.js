import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Vendored from @radix-ui/react-portal
 * @see ../LICENSE
 */
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Primitive } from './react-primitive';
import { useLayoutEffect } from './react-use-layout-effect';
const PORTAL_NAME = 'Portal';
const Portal = React.forwardRef((props, forwardedRef) => {
    const { container: containerProp, ...portalProps } = props;
    const [mounted, setMounted] = React.useState(false);
    useLayoutEffect(() => setMounted(true), []);
    const container = containerProp || (mounted && globalThis?.document?.body);
    return container
        ? ReactDOM.createPortal(_jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container)
        : null;
});
Portal.displayName = PORTAL_NAME;
const Root = Portal;
export { Portal, Root, };
