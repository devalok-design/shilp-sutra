import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Vendored from @radix-ui/react-slot
 * @see ./LICENSE
 */
import * as React from 'react';
import { composeRefs } from './_internal/react-compose-refs';
const REACT_LAZY_TYPE = Symbol.for('react.lazy');
const use = React[' use '.trim().toString()];
function isPromiseLike(value) {
    return typeof value === 'object' && value !== null && 'then' in value;
}
function isLazyComponent(element) {
    return (element != null &&
        typeof element === 'object' &&
        '$$typeof' in element &&
        element.$$typeof === REACT_LAZY_TYPE &&
        '_payload' in element &&
        isPromiseLike(element._payload));
}
/* @__NO_SIDE_EFFECTS__ */ export function createSlot(ownerName) {
    const SlotClone = createSlotClone(ownerName);
    const Slot = React.forwardRef((props, forwardedRef) => {
        let { children, ...slotProps } = props;
        if (isLazyComponent(children) && typeof use === 'function') {
            children = use(children._payload);
        }
        const childrenArray = React.Children.toArray(children);
        const slottable = childrenArray.find(isSlottable);
        if (slottable) {
            const newElement = slottable.props.children;
            const newChildren = childrenArray.map((child) => {
                if (child === slottable) {
                    if (React.Children.count(newElement) > 1)
                        return React.Children.only(null);
                    return React.isValidElement(newElement)
                        ? newElement.props.children
                        : null;
                }
                else {
                    return child;
                }
            });
            return (_jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement)
                    ? React.cloneElement(newElement, undefined, newChildren)
                    : null }));
        }
        return (_jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: children }));
    });
    Slot.displayName = `${ownerName}.Slot`;
    return Slot;
}
const Slot = createSlot('Slot');
/* @__NO_SIDE_EFFECTS__ */ function createSlotClone(ownerName) {
    const SlotClone = React.forwardRef((props, forwardedRef) => {
        let { children, ...slotProps } = props;
        if (isLazyComponent(children) && typeof use === 'function') {
            children = use(children._payload);
        }
        if (React.isValidElement(children)) {
            const childrenRef = getElementRef(children);
            const props = mergeProps(slotProps, children.props);
            if (children.type !== React.Fragment) {
                props.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
            }
            return React.cloneElement(children, props);
        }
        return React.Children.count(children) > 1 ? React.Children.only(null) : null;
    });
    SlotClone.displayName = `${ownerName}.SlotClone`;
    return SlotClone;
}
/* -------------------------------------------------------------------------------------------------
 * Slottable
 * -----------------------------------------------------------------------------------------------*/
const SLOTTABLE_IDENTIFIER = Symbol('radix.slottable');
/* @__NO_SIDE_EFFECTS__ */ export function createSlottable(ownerName) {
    const Slottable = ({ children }) => {
        return _jsx(_Fragment, { children: children });
    };
    Slottable.displayName = `${ownerName}.Slottable`;
    Slottable.__radixId = SLOTTABLE_IDENTIFIER;
    return Slottable;
}
const Slottable = createSlottable('Slottable');
function isSlottable(child) {
    return (React.isValidElement(child) &&
        typeof child.type === 'function' &&
        '__radixId' in child.type &&
        child.type.__radixId === SLOTTABLE_IDENTIFIER);
}
function mergeProps(slotProps, childProps) {
    const overrideProps = { ...childProps };
    for (const propName in childProps) {
        const slotPropValue = slotProps[propName];
        const childPropValue = childProps[propName];
        const isHandler = /^on[A-Z]/.test(propName);
        if (isHandler) {
            if (slotPropValue && childPropValue) {
                overrideProps[propName] = (...args) => {
                    const result = childPropValue(...args);
                    slotPropValue(...args);
                    return result;
                };
            }
            else if (slotPropValue) {
                overrideProps[propName] = slotPropValue;
            }
        }
        else if (propName === 'style') {
            overrideProps[propName] = { ...slotPropValue, ...childPropValue };
        }
        else if (propName === 'className') {
            overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ');
        }
    }
    return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, 'ref')?.get;
    let mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
    if (mayWarn) {
        return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, 'ref')?.get;
    mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
    if (mayWarn) {
        return element.props.ref;
    }
    return element.props.ref || element.ref;
}
export { Slot, Slottable, Slot as Root, };
