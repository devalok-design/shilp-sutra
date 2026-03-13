'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion, } from 'framer-motion';
import { cn } from './lib/utils';
const sizeClasses = {
    sm: 'h-ico-sm w-ico-sm',
    md: 'h-ico-md w-ico-md',
    lg: 'h-ico-lg w-ico-lg',
};
/** Arc stroke width per size */
const arcStrokeWidths = { sm: 3, md: 3, lg: 4 };
/** Thinner icon stroke for checkmark / X — feels lighter and more refined */
const iconStrokeWidths = { sm: 1.8, md: 2, lg: 2.5 };
const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const srText = {
    spinning: 'Loading...',
    success: 'Complete',
    error: 'Error',
};
const stateColors = {
    spinning: 'var(--color-interactive)',
    success: 'var(--color-success-9)',
    error: 'var(--color-error-9)',
};
// Filled variant — icons fit inside the filled circle
const CHECKMARK_D = 'M7 12.5l3 3 7-7';
const X_MARK_D = 'M8 8l8 8M16 8l-8 8';
// Bare variant — larger icons since there's no circle constraining them
const CHECKMARK_BARE_D = 'M5 12.5l4 4 10-10';
const X_MARK_BARE_D = 'M6 6l12 12M18 6l-12 12';
const Spinner = React.forwardRef(({ size = 'md', state = 'spinning', variant = 'filled', delay = 0, onComplete, className }, ref) => {
    const prefersReduced = useReducedMotion();
    const [visible, setVisible] = React.useState(delay === 0);
    React.useEffect(() => {
        if (delay <= 0) {
            setVisible(true);
            return;
        }
        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);
    if (!visible)
        return null;
    const arcSw = arcStrokeWidths[size];
    const iconSw = iconStrokeWidths[size];
    const isSpinning = state === 'spinning';
    const isFinal = state === 'success' || state === 'error';
    const isFilled = variant === 'filled';
    const color = stateColors[state];
    // Icon stroke: white on filled backgrounds, currentColor on bare
    const iconColor = isFilled ? 'white' : 'currentColor';
    const checkPath = isFilled ? CHECKMARK_D : CHECKMARK_BARE_D;
    const xPath = isFilled ? X_MARK_D : X_MARK_BARE_D;
    // ── Sequence timing (seconds) ──────────────────────────────────
    // Filled: arc completes → fill fades in → white icon draws
    // Bare:   arc completes + fades out → currentColor icon draws
    const ARC_COMPLETE = 0.4;
    const FILL_DELAY = 0.3;
    const FILL_DURATION = 0.25;
    const ICON_DELAY = isFilled ? 0.5 : 0.35;
    const ICON_DURATION = 0.35;
    return (_jsxs("span", { ref: ref, role: "status", className: cn('inline-flex', className), children: [_jsxs("svg", { className: sizeClasses[size], viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [prefersReduced ? (!(isFinal && !isFilled) && (_jsx("circle", { cx: "12", cy: "12", r: RADIUS, stroke: "var(--color-border-subtle)", strokeWidth: arcSw, fill: "none" }))) : (_jsx(motion.circle, { cx: "12", cy: "12", r: RADIUS, stroke: "var(--color-border-subtle)", strokeWidth: arcSw, fill: "none", animate: { opacity: isFinal && !isFilled ? 0 : 1 }, transition: { duration: 0.2, delay: isFinal && !isFilled ? ARC_COMPLETE : 0 } })), prefersReduced ? (_jsx("circle", { cx: "12", cy: "12", r: RADIUS, stroke: color, strokeWidth: arcSw, fill: "none", strokeLinecap: "round", strokeDasharray: isSpinning
                            ? `${CIRCUMFERENCE * 0.75} ${CIRCUMFERENCE * 0.25}`
                            : `${CIRCUMFERENCE} 0`, style: {
                            transformOrigin: 'center',
                            transform: isSpinning ? 'rotate(-90deg)' : undefined,
                            opacity: isFinal && !isFilled ? 0 : 1,
                        } })) : (_jsx(motion.circle, { cx: "12", cy: "12", r: RADIUS, stroke: color, strokeWidth: arcSw, fill: "none", strokeLinecap: "round", style: { transformOrigin: 'center' }, animate: isSpinning
                            ? {
                                rotate: [0, 360],
                                strokeDasharray: [
                                    `${CIRCUMFERENCE * 0.1} ${CIRCUMFERENCE * 0.9}`,
                                    `${CIRCUMFERENCE * 0.75} ${CIRCUMFERENCE * 0.25}`,
                                    `${CIRCUMFERENCE * 0.1} ${CIRCUMFERENCE * 0.9}`,
                                ],
                            }
                            : {
                                rotate: 0,
                                strokeDasharray: `${CIRCUMFERENCE} 0`,
                                // In bare mode, fade out the arc after it completes
                                ...(!isFilled && { opacity: 0 }),
                            }, transition: isSpinning
                            ? {
                                rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
                                strokeDasharray: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                            }
                            : {
                                rotate: { duration: 0.3, ease: 'easeOut' },
                                strokeDasharray: { duration: ARC_COMPLETE, ease: 'easeInOut' },
                                ...(!isFilled && { opacity: { duration: 0.2, delay: ARC_COMPLETE } }),
                            } })), _jsx(AnimatePresence, { children: isFinal && isFilled &&
                            (prefersReduced ? (_jsx("circle", { cx: "12", cy: "12", r: RADIUS + arcSw / 2, fill: color, stroke: "none" }, "fill-static")) : (_jsx(motion.circle, { cx: "12", cy: "12", r: RADIUS + arcSw / 2, fill: color, stroke: "none", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: FILL_DURATION, delay: FILL_DELAY, ease: 'easeOut' }, style: { transformOrigin: 'center' } }, "fill"))) }), _jsx(AnimatePresence, { children: state === 'success' &&
                            (prefersReduced ? (_jsx("path", { d: checkPath, stroke: iconColor, strokeWidth: iconSw, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }, "check-static")) : (_jsx(motion.path, { d: checkPath, stroke: iconColor, strokeWidth: iconSw, strokeLinecap: "round", strokeLinejoin: "round", fill: "none", initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: {
                                    pathLength: { duration: ICON_DURATION, ease: 'easeOut', delay: ICON_DELAY },
                                    opacity: { duration: 0.1, delay: ICON_DELAY },
                                }, onAnimationComplete: () => onComplete?.() }, "check"))) }), _jsx(AnimatePresence, { children: state === 'error' &&
                            (prefersReduced ? (_jsx("path", { d: xPath, stroke: iconColor, strokeWidth: iconSw, strokeLinecap: "round", fill: "none" }, "x-static")) : (_jsx(motion.path, { d: xPath, stroke: iconColor, strokeWidth: iconSw, strokeLinecap: "round", fill: "none", initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: {
                                    pathLength: { duration: ICON_DURATION, ease: 'easeOut', delay: ICON_DELAY },
                                    opacity: { duration: 0.1, delay: ICON_DELAY },
                                }, onAnimationComplete: () => onComplete?.() }, "x"))) })] }), _jsx("span", { className: "sr-only", children: srText[state] })] }));
});
Spinner.displayName = 'Spinner';
export { Spinner };
