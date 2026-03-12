import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Vendored from @radix-ui/react-primitive
 * @see ../LICENSE
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createSlot } from '../react-slot';
const NODES = [
    'a',
    'button',
    'div',
    'form',
    'h2',
    'h3',
    'img',
    'input',
    'label',
    'li',
    'nav',
    'ol',
    'p',
    'select',
    'span',
    'svg',
    'ul',
];
const Primitive = NODES.reduce((primitive, node) => {
    const Slot = createSlot(`Primitive.${node}`);
    const Node = React.forwardRef((props, forwardedRef) => {
        const { asChild, ...primitiveProps } = props;
        const Comp = asChild ? Slot : node;
        if (typeof window !== 'undefined') {
            window[Symbol.for('radix-ui')] = true;
        }
        return _jsx(Comp, { ...primitiveProps, ref: forwardedRef });
    });
    Node.displayName = `Primitive.${node}`;
    return { ...primitive, [node]: Node };
}, {});
function dispatchDiscreteCustomEvent(target, event) {
    if (target)
        ReactDOM.flushSync(() => target.dispatchEvent(event));
}
const Root = Primitive;
export { Primitive, Root, dispatchDiscreteCustomEvent, };
