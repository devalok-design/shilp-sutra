import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Vendored from @radix-ui/react-popper
 * @floating-ui/react-dom is kept as external dependency
 * @see ../LICENSE
 */
import * as React from 'react';
import { useFloating, autoUpdate, offset, shift, limitShift, hide, arrow as floatingUIarrow, flip, size, } from '@floating-ui/react-dom';
import * as ArrowPrimitive from './react-arrow';
import { useComposedRefs } from './react-compose-refs';
import { createContextScope } from './react-context';
import { Primitive } from './react-primitive';
import { useCallbackRef } from './react-use-callback-ref';
import { useLayoutEffect } from './react-use-layout-effect';
import { useSize } from './react-use-size';
const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'];
const ALIGN_OPTIONS = ['start', 'center', 'end'];
/* -------------------------------------------------------------------------------------------------
 * Popper
 * -----------------------------------------------------------------------------------------------*/
const POPPER_NAME = 'Popper';
const [createPopperContext, createPopperScope] = createContextScope(POPPER_NAME);
const [PopperProvider, usePopperContext] = createPopperContext(POPPER_NAME);
const Popper = (props) => {
    const { __scopePopper, children } = props;
    const [anchor, setAnchor] = React.useState(null);
    return (_jsx(PopperProvider, { scope: __scopePopper, anchor: anchor, onAnchorChange: setAnchor, children: children }));
};
Popper.displayName = POPPER_NAME;
/* -------------------------------------------------------------------------------------------------
 * PopperAnchor
 * -----------------------------------------------------------------------------------------------*/
const ANCHOR_NAME = 'PopperAnchor';
const PopperAnchor = React.forwardRef((props, forwardedRef) => {
    const { __scopePopper, virtualRef, ...anchorProps } = props;
    const context = usePopperContext(ANCHOR_NAME, __scopePopper);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const anchorRef = React.useRef(null);
    React.useEffect(() => {
        const previousAnchor = anchorRef.current;
        anchorRef.current = virtualRef?.current || ref.current;
        if (previousAnchor !== anchorRef.current) {
            context.onAnchorChange(anchorRef.current);
        }
    });
    return virtualRef ? null : _jsx(Primitive.div, { ...anchorProps, ref: composedRefs });
});
PopperAnchor.displayName = ANCHOR_NAME;
/* -------------------------------------------------------------------------------------------------
 * PopperContent
 * -----------------------------------------------------------------------------------------------*/
const CONTENT_NAME = 'PopperContent';
const [PopperContentProvider, useContentContext] = createPopperContext(CONTENT_NAME);
const PopperContent = React.forwardRef((props, forwardedRef) => {
    const { __scopePopper, side = 'bottom', sideOffset = 0, align = 'center', alignOffset = 0, arrowPadding = 0, avoidCollisions = true, collisionBoundary = [], collisionPadding: collisionPaddingProp = 0, sticky = 'partial', hideWhenDetached = false, updatePositionStrategy = 'optimized', onPlaced, ...contentProps } = props;
    const context = usePopperContext(CONTENT_NAME, __scopePopper);
    const [content, setContent] = React.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
    const [arrowEl, setArrow] = React.useState(null);
    const arrowSize = useSize(arrowEl);
    const arrowWidth = arrowSize?.width ?? 0;
    const arrowHeight = arrowSize?.height ?? 0;
    const desiredPlacement = (side + (align !== 'center' ? '-' + align : ''));
    const collisionPadding = typeof collisionPaddingProp === 'number'
        ? collisionPaddingProp
        : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPaddingProp };
    const boundary = Array.isArray(collisionBoundary) ? collisionBoundary : [collisionBoundary];
    const hasExplicitBoundaries = boundary.length > 0;
    const detectOverflowOptions = {
        padding: collisionPadding,
        boundary: boundary.filter(isNotNull),
        altBoundary: hasExplicitBoundaries,
    };
    const { refs, floatingStyles, placement, isPositioned, middlewareData } = useFloating({
        strategy: 'fixed',
        placement: desiredPlacement,
        whileElementsMounted: (...args) => {
            const cleanup = autoUpdate(...args, { animationFrame: updatePositionStrategy === 'always' });
            return cleanup;
        },
        elements: { reference: context.anchor },
        middleware: [
            offset({ mainAxis: sideOffset + arrowHeight, alignmentAxis: alignOffset }),
            avoidCollisions && shift({
                mainAxis: true, crossAxis: false,
                limiter: sticky === 'partial' ? limitShift() : undefined,
                ...detectOverflowOptions,
            }),
            avoidCollisions && flip({ ...detectOverflowOptions }),
            size({
                ...detectOverflowOptions,
                apply: ({ elements, rects, availableWidth, availableHeight }) => {
                    const { width: anchorWidth, height: anchorHeight } = rects.reference;
                    const contentStyle = elements.floating.style;
                    contentStyle.setProperty('--radix-popper-available-width', `${availableWidth}px`);
                    contentStyle.setProperty('--radix-popper-available-height', `${availableHeight}px`);
                    contentStyle.setProperty('--radix-popper-anchor-width', `${anchorWidth}px`);
                    contentStyle.setProperty('--radix-popper-anchor-height', `${anchorHeight}px`);
                },
            }),
            arrowEl && floatingUIarrow({ element: arrowEl, padding: arrowPadding }),
            transformOrigin({ arrowWidth, arrowHeight }),
            hideWhenDetached && hide({ strategy: 'referenceHidden', ...detectOverflowOptions }),
        ],
    });
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
    const handlePlaced = useCallbackRef(onPlaced);
    useLayoutEffect(() => {
        if (isPositioned)
            handlePlaced?.();
    }, [isPositioned, handlePlaced]);
    const arrowX = middlewareData.arrow?.x;
    const arrowY = middlewareData.arrow?.y;
    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
    const [contentZIndex, setContentZIndex] = React.useState();
    useLayoutEffect(() => {
        if (content)
            setContentZIndex(window.getComputedStyle(content).zIndex);
    }, [content]);
    return (_jsx("div", { ref: refs.setFloating, "data-radix-popper-content-wrapper": "", style: {
            ...floatingStyles,
            transform: isPositioned ? floatingStyles.transform : 'translate(0, -200%)',
            minWidth: 'max-content',
            zIndex: contentZIndex,
            ['--radix-popper-transform-origin']: [
                middlewareData.transformOrigin?.x,
                middlewareData.transformOrigin?.y,
            ].join(' '),
            ...(middlewareData.hide?.referenceHidden && {
                visibility: 'hidden',
                pointerEvents: 'none',
            }),
        }, dir: props.dir, children: _jsx(PopperContentProvider, { scope: __scopePopper, placedSide: placedSide, onArrowChange: setArrow, arrowX: arrowX, arrowY: arrowY, shouldHideArrow: cannotCenterArrow, children: _jsx(Primitive.div, { "data-side": placedSide, "data-align": placedAlign, ...contentProps, ref: composedRefs, style: {
                    ...contentProps.style,
                    animation: !isPositioned ? 'none' : undefined,
                } }) }) }));
});
PopperContent.displayName = CONTENT_NAME;
/* -------------------------------------------------------------------------------------------------
 * PopperArrow
 * -----------------------------------------------------------------------------------------------*/
const ARROW_NAME = 'PopperArrow';
const OPPOSITE_SIDE = {
    top: 'bottom', right: 'left', bottom: 'top', left: 'right',
};
const PopperArrow = React.forwardRef(function PopperArrow(props, forwardedRef) {
    const { __scopePopper, ...arrowProps } = props;
    const contentContext = useContentContext(ARROW_NAME, __scopePopper);
    const baseSide = OPPOSITE_SIDE[contentContext.placedSide];
    return (_jsx("span", { ref: contentContext.onArrowChange, style: {
            position: 'absolute',
            left: contentContext.arrowX,
            top: contentContext.arrowY,
            [baseSide]: 0,
            transformOrigin: {
                top: '', right: '0 0', bottom: 'center 0', left: '100% 0',
            }[contentContext.placedSide],
            transform: {
                top: 'translateY(100%)',
                right: 'translateY(50%) rotate(90deg) translateX(-50%)',
                bottom: 'rotate(180deg)',
                left: 'translateY(50%) rotate(-90deg) translateX(50%)',
            }[contentContext.placedSide],
            visibility: contentContext.shouldHideArrow ? 'hidden' : undefined,
        }, children: _jsx(ArrowPrimitive.Root, { ...arrowProps, ref: forwardedRef, style: { ...arrowProps.style, display: 'block' } }) }));
});
PopperArrow.displayName = ARROW_NAME;
/* -----------------------------------------------------------------------------------------------*/
function isNotNull(value) { return value !== null; }
const transformOrigin = (options) => ({
    name: 'transformOrigin',
    options,
    fn(data) {
        const { placement, rects, middlewareData } = data;
        const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
        const isArrowHidden = cannotCenterArrow;
        const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
        const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
        const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
        const noArrowAlign = { start: '0%', center: '50%', end: '100%' }[placedAlign];
        const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
        const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
        let x = '', y = '';
        if (placedSide === 'bottom') {
            x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
            y = `${-arrowHeight}px`;
        }
        else if (placedSide === 'top') {
            x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
            y = `${rects.floating.height + arrowHeight}px`;
        }
        else if (placedSide === 'right') {
            x = `${-arrowHeight}px`;
            y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
        }
        else if (placedSide === 'left') {
            x = `${rects.floating.width + arrowHeight}px`;
            y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
        }
        return { data: { x, y } };
    },
});
function getSideAndAlignFromPlacement(placement) {
    const [side, align = 'center'] = placement.split('-');
    return [side, align];
}
const Root = Popper;
const Anchor = PopperAnchor;
const Content = PopperContent;
const Arrow = PopperArrow;
export { createPopperScope, Popper, PopperAnchor, PopperContent, PopperArrow, Root, Anchor, Content, Arrow, SIDE_OPTIONS, ALIGN_OPTIONS, };
