import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Vendored from @radix-ui/react-dismissable-layer
 * @see ../LICENSE
 */
import * as React from 'react';
import { composeEventHandlers } from './primitive';
import { Primitive, dispatchDiscreteCustomEvent } from './react-primitive';
import { useComposedRefs } from './react-compose-refs';
import { useCallbackRef } from './react-use-callback-ref';
import { useEscapeKeydown } from './react-use-escape-keydown';
const DISMISSABLE_LAYER_NAME = 'DismissableLayer';
const CONTEXT_UPDATE = 'dismissableLayer.update';
const POINTER_DOWN_OUTSIDE = 'dismissableLayer.pointerDownOutside';
const FOCUS_OUTSIDE = 'dismissableLayer.focusOutside';
let originalBodyPointerEvents;
const DismissableLayerContext = React.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
});
const DismissableLayer = React.forwardRef((props, forwardedRef) => {
    const { disableOutsidePointerEvents = false, onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside, onDismiss, ...layerProps } = props;
    const context = React.useContext(DismissableLayerContext);
    const [node, setNode] = React.useState(null);
    const ownerDocument = node?.ownerDocument ?? globalThis?.document;
    const [, force] = React.useState({});
    const composedRefs = useComposedRefs(forwardedRef, (node) => setNode(node));
    const layers = Array.from(context.layers);
    const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1);
    const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
    const index = node ? layers.indexOf(node) : -1;
    const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
    const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex;
    const pointerDownOutside = usePointerDownOutside((event) => {
        const target = event.target;
        const isPointerDownOnBranch = [...context.branches].some((branch) => branch.contains(target));
        if (!isPointerEventsEnabled || isPointerDownOnBranch)
            return;
        onPointerDownOutside?.(event);
        onInteractOutside?.(event);
        if (!event.defaultPrevented)
            onDismiss?.();
    }, ownerDocument);
    const focusOutside = useFocusOutside((event) => {
        const target = event.target;
        const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
        if (isFocusInBranch)
            return;
        onFocusOutside?.(event);
        onInteractOutside?.(event);
        if (!event.defaultPrevented)
            onDismiss?.();
    }, ownerDocument);
    useEscapeKeydown((event) => {
        const isHighestLayer = index === context.layers.size - 1;
        if (!isHighestLayer)
            return;
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented && onDismiss) {
            event.preventDefault();
            onDismiss();
        }
    }, ownerDocument);
    React.useEffect(() => {
        if (!node)
            return;
        if (disableOutsidePointerEvents) {
            if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
                originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
                ownerDocument.body.style.pointerEvents = 'none';
            }
            context.layersWithOutsidePointerEventsDisabled.add(node);
        }
        context.layers.add(node);
        dispatchUpdate();
        return () => {
            if (disableOutsidePointerEvents && context.layersWithOutsidePointerEventsDisabled.size === 1) {
                ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
            }
        };
    }, [node, ownerDocument, disableOutsidePointerEvents, context]);
    React.useEffect(() => {
        return () => {
            if (!node)
                return;
            context.layers.delete(node);
            context.layersWithOutsidePointerEventsDisabled.delete(node);
            dispatchUpdate();
        };
    }, [node, context]);
    React.useEffect(() => {
        const handleUpdate = () => force({});
        document.addEventListener(CONTEXT_UPDATE, handleUpdate);
        return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
    }, []);
    return (_jsx(Primitive.div, { ...layerProps, ref: composedRefs, style: {
            pointerEvents: isBodyPointerEventsDisabled
                ? isPointerEventsEnabled ? 'auto' : 'none'
                : undefined,
            ...props.style,
        }, onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture), onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture), onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, pointerDownOutside.onPointerDownCapture) }));
});
DismissableLayer.displayName = DISMISSABLE_LAYER_NAME;
/* -------------------------------------------------------------------------------------------------
 * DismissableLayerBranch
 * -----------------------------------------------------------------------------------------------*/
const BRANCH_NAME = 'DismissableLayerBranch';
const DismissableLayerBranch = React.forwardRef((props, forwardedRef) => {
    const context = React.useContext(DismissableLayerContext);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    React.useEffect(() => {
        const node = ref.current;
        if (node) {
            context.branches.add(node);
            return () => { context.branches.delete(node); };
        }
    }, [context.branches]);
    return _jsx(Primitive.div, { ...props, ref: composedRefs });
});
DismissableLayerBranch.displayName = BRANCH_NAME;
function usePointerDownOutside(onPointerDownOutside, ownerDocument = globalThis?.document) {
    const handlePointerDownOutside = useCallbackRef(onPointerDownOutside);
    const isPointerInsideReactTreeRef = React.useRef(false);
    const handleClickRef = React.useRef(() => { });
    React.useEffect(() => {
        const handlePointerDown = (event) => {
            if (event.target && !isPointerInsideReactTreeRef.current) {
                const eventDetail = { originalEvent: event };
                function handleAndDispatchPointerDownOutsideEvent() {
                    handleAndDispatchCustomEvent(POINTER_DOWN_OUTSIDE, handlePointerDownOutside, eventDetail, { discrete: true });
                }
                if (event.pointerType === 'touch') {
                    ownerDocument.removeEventListener('click', handleClickRef.current);
                    handleClickRef.current = handleAndDispatchPointerDownOutsideEvent;
                    ownerDocument.addEventListener('click', handleClickRef.current, { once: true });
                }
                else {
                    handleAndDispatchPointerDownOutsideEvent();
                }
            }
            else {
                ownerDocument.removeEventListener('click', handleClickRef.current);
            }
            isPointerInsideReactTreeRef.current = false;
        };
        const timerId = window.setTimeout(() => {
            ownerDocument.addEventListener('pointerdown', handlePointerDown);
        }, 0);
        return () => {
            window.clearTimeout(timerId);
            ownerDocument.removeEventListener('pointerdown', handlePointerDown);
            ownerDocument.removeEventListener('click', handleClickRef.current);
        };
    }, [ownerDocument, handlePointerDownOutside]);
    return {
        onPointerDownCapture: () => (isPointerInsideReactTreeRef.current = true),
    };
}
function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
    const handleFocusOutside = useCallbackRef(onFocusOutside);
    const isFocusInsideReactTreeRef = React.useRef(false);
    React.useEffect(() => {
        const handleFocus = (event) => {
            if (event.target && !isFocusInsideReactTreeRef.current) {
                const eventDetail = { originalEvent: event };
                handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
                    discrete: false,
                });
            }
        };
        ownerDocument.addEventListener('focusin', handleFocus);
        return () => ownerDocument.removeEventListener('focusin', handleFocus);
    }, [ownerDocument, handleFocusOutside]);
    return {
        onFocusCapture: () => (isFocusInsideReactTreeRef.current = true),
        onBlurCapture: () => (isFocusInsideReactTreeRef.current = false),
    };
}
function dispatchUpdate() {
    const event = new CustomEvent(CONTEXT_UPDATE);
    document.dispatchEvent(event);
}
function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
    const target = detail.originalEvent.target;
    const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
    if (handler)
        target.addEventListener(name, handler, { once: true });
    if (discrete) {
        dispatchDiscreteCustomEvent(target, event);
    }
    else {
        target.dispatchEvent(event);
    }
}
const Root = DismissableLayer;
const Branch = DismissableLayerBranch;
export { DismissableLayer, DismissableLayerBranch, Root, Branch, };
