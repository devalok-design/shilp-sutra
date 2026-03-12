import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Vendored from @radix-ui/react-arrow
 * @see ../LICENSE
 */
import * as React from 'react';
import { Primitive } from './react-primitive';
const NAME = 'Arrow';
const Arrow = React.forwardRef((props, forwardedRef) => {
    const { children, width = 10, height = 5, ...arrowProps } = props;
    return (_jsx(Primitive.svg, { ...arrowProps, ref: forwardedRef, width: width, height: height, viewBox: "0 0 30 10", preserveAspectRatio: "none", children: props.asChild ? children : _jsx("polygon", { points: "0,0 30,0 15,10" }) }));
});
Arrow.displayName = NAME;
const Root = Arrow;
export { Arrow, Root, };
