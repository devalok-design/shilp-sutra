/**
 * Vendored from @radix-ui/primitive
 * @see ../LICENSE
 */
export const canUseDOM = !!(typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement);
export function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
    return function handleEvent(event) {
        originalEventHandler?.(event);
        if (checkForDefaultPrevented === false || !event.defaultPrevented) {
            return ourEventHandler?.(event);
        }
    };
}
export function getOwnerWindow(element) {
    if (!canUseDOM) {
        throw new Error('Cannot access window outside of the DOM');
    }
    return element?.ownerDocument?.defaultView ?? window;
}
export function getOwnerDocument(element) {
    if (!canUseDOM) {
        throw new Error('Cannot access document outside of the DOM');
    }
    return element?.ownerDocument ?? document;
}
export function getActiveElement(node, activeDescendant = false) {
    const { activeElement } = getOwnerDocument(node);
    if (!activeElement?.nodeName) {
        return null;
    }
    if (isFrame(activeElement) && activeElement.contentDocument) {
        return getActiveElement(activeElement.contentDocument.body, activeDescendant);
    }
    if (activeDescendant) {
        const id = activeElement.getAttribute('aria-activedescendant');
        if (id) {
            const element = getOwnerDocument(activeElement).getElementById(id);
            if (element) {
                return element;
            }
        }
    }
    return activeElement;
}
export function isFrame(element) {
    return element.tagName === 'IFRAME';
}
