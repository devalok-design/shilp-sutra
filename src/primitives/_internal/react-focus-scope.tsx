/**
 * Vendored from @radix-ui/react-focus-scope
 * @see ../LICENSE
 */

import * as React from 'react';
import { useComposedRefs } from './react-compose-refs';
import { Primitive } from './react-primitive';
import { useCallbackRef } from './react-use-callback-ref';

const AUTOFOCUS_ON_MOUNT = 'focusScope.autoFocusOnMount';
const AUTOFOCUS_ON_UNMOUNT = 'focusScope.autoFocusOnUnmount';
const EVENT_OPTIONS = { bubbles: false, cancelable: true };

type FocusableTarget = HTMLElement | { focus(): void };

const FOCUS_SCOPE_NAME = 'FocusScope';

type FocusScopeElement = React.ComponentRef<typeof Primitive.div>;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>;
interface FocusScopeProps extends PrimitiveDivProps {
  loop?: boolean;
  trapped?: boolean;
  onMountAutoFocus?: (event: Event) => void;
  onUnmountAutoFocus?: (event: Event) => void;
}

const FocusScope = React.forwardRef<FocusScopeElement, FocusScopeProps>((props, forwardedRef) => {
  const {
    loop = false,
    trapped = false,
    onMountAutoFocus: onMountAutoFocusProp,
    onUnmountAutoFocus: onUnmountAutoFocusProp,
    ...scopeProps
  } = props;
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
  const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
  const lastFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const composedRefs = useComposedRefs(forwardedRef, (node) => setContainer(node));

  const focusScope = React.useRef({
    paused: false,
    pause() { this.paused = true; },
    resume() { this.paused = false; },
  }).current;

  React.useEffect(() => {
    if (trapped) {
      function handleFocusIn(event: FocusEvent) {
        if (focusScope.paused || !container) return;
        const target = event.target as HTMLElement | null;
        if (container.contains(target)) {
          lastFocusedElementRef.current = target;
        } else {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }

      function handleFocusOut(event: FocusEvent) {
        if (focusScope.paused || !container) return;
        const relatedTarget = event.relatedTarget as HTMLElement | null;
        if (relatedTarget === null) return;
        if (!container.contains(relatedTarget)) {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }

      function handleMutations(mutations: MutationRecord[]) {
        const focusedElement = document.activeElement as HTMLElement | null;
        if (focusedElement !== document.body) return;
        for (const mutation of mutations) {
          if (mutation.removedNodes.length > 0) focus(container);
        }
      }

      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('focusout', handleFocusOut);
      const mutationObserver = new MutationObserver(handleMutations);
      if (container) mutationObserver.observe(container, { childList: true, subtree: true });

      return () => {
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
        mutationObserver.disconnect();
      };
    }
  }, [trapped, container, focusScope.paused]);

  React.useEffect(() => {
    if (container) {
      focusScopesStack.add(focusScope);
      const previouslyFocusedElement = document.activeElement as HTMLElement | null;
      const hasFocusedCandidate = container.contains(previouslyFocusedElement);

      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
        container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        container.dispatchEvent(mountEvent);
        if (!mountEvent.defaultPrevented) {
          focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
          if (document.activeElement === previouslyFocusedElement) {
            focus(container);
          }
        }
      }

      return () => {
        container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        setTimeout(() => {
          const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          container.dispatchEvent(unmountEvent);
          if (!unmountEvent.defaultPrevented) {
            focus(previouslyFocusedElement ?? document.body, { select: true });
          }
          container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          focusScopesStack.remove(focusScope);
        }, 0);
      };
    }
  }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!loop && !trapped) return;
      if (focusScope.paused) return;

      const isTabKey = event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey;
      const focusedElement = document.activeElement as HTMLElement | null;

      if (isTabKey && focusedElement) {
        const container = event.currentTarget as HTMLElement;
        const [first, last] = getTabbableEdges(container);
        const hasTabbableElementsInside = first && last;

        if (!hasTabbableElementsInside) {
          if (focusedElement === container) event.preventDefault();
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            if (loop) focus(first, { select: true });
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            if (loop) focus(last, { select: true });
          }
        }
      }
    },
    [loop, trapped, focusScope.paused],
  );

  return (
    <Primitive.div tabIndex={-1} {...scopeProps} ref={composedRefs} onKeyDown={handleKeyDown} />
  );
});

FocusScope.displayName = FOCUS_SCOPE_NAME;

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

function focusFirst(candidates: HTMLElement[], { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}

function getTabbableEdges(container: HTMLElement) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last] as const;
}

function getTabbableCandidates(container: HTMLElement) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: any) => {
      const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden';
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  return nodes;
}

function findVisible(elements: HTMLElement[], container: HTMLElement) {
  for (const element of elements) {
    if (!isHidden(element, { upTo: container })) return element;
  }
}

function isHidden(node: HTMLElement, { upTo }: { upTo?: HTMLElement }) {
  if (getComputedStyle(node).visibility === 'hidden') return true;
  while (node) {
    if (upTo !== undefined && node === upTo) return false;
    if (getComputedStyle(node).display === 'none') return true;
    node = node.parentElement as HTMLElement;
  }
  return false;
}

function isSelectableInput(element: any): element is FocusableTarget & { select: () => void } {
  return element instanceof HTMLInputElement && 'select' in element;
}

function focus(element?: FocusableTarget | null, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select();
  }
}

type FocusScopeAPI = { paused: boolean; pause(): void; resume(): void };
const focusScopesStack = createFocusScopesStack();

function createFocusScopesStack() {
  let stack: FocusScopeAPI[] = [];
  return {
    add(focusScope: FocusScopeAPI) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) {
        activeFocusScope?.pause();
      }
      stack = arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope: FocusScopeAPI) {
      stack = arrayRemove(stack, focusScope);
      stack[0]?.resume();
    },
  };
}

function arrayRemove<T>(array: T[], item: T) {
  const updatedArray = [...array];
  const index = updatedArray.indexOf(item);
  if (index !== -1) {
    updatedArray.splice(index, 1);
  }
  return updatedArray;
}

function removeLinks(items: HTMLElement[]) {
  return items.filter((item) => item.tagName !== 'A');
}

const Root = FocusScope;

export {
  FocusScope,
  Root,
};
export type { FocusScopeProps };
