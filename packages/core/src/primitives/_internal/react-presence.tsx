/**
 * Vendored from @radix-ui/react-presence
 * @see ../LICENSE
 */

import * as React from 'react';
import { useComposedRefs } from './react-compose-refs';
import { useLayoutEffect } from './react-use-layout-effect';

/* -------------------------------------------------------------------------------------------------
 * useStateMachine
 * -----------------------------------------------------------------------------------------------*/

type Machine<S> = { [k: string]: { [k: string]: S } };
type MachineState<T> = keyof T;
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>;

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any
  ? R
  : never;

function useStateMachine<M>(
  initialState: MachineState<M>,
  machine: M & Machine<MachineState<M>>,
) {
  return React.useReducer((state: MachineState<M>, event: MachineEvent<M>): MachineState<M> => {
    const nextState = (machine[state] as any)[event];
    return nextState ?? state;
  }, initialState);
}

/* -------------------------------------------------------------------------------------------------
 * Presence
 * -----------------------------------------------------------------------------------------------*/

interface PresenceProps {
  children: React.ReactElement | ((props: { present: boolean }) => React.ReactElement);
  present: boolean;
}

const Presence: React.FC<PresenceProps> = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);

  const child = (
    typeof children === 'function'
      ? children({ present: presence.isPresent })
      : React.Children.only(children)
  ) as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;

  const ref = useComposedRefs(presence.ref, getElementRef(child));
  const forceMount = typeof children === 'function';
  return forceMount || presence.isPresent ? React.cloneElement(child, { ref }) : null;
};

Presence.displayName = 'Presence';

/* -------------------------------------------------------------------------------------------------
 * usePresence
 * -----------------------------------------------------------------------------------------------*/

function usePresence(present: boolean) {
  const [node, setNode] = React.useState<HTMLElement>();
  const stylesRef = React.useRef<CSSStyleDeclaration | null>(null);
  const prevPresentRef = React.useRef(present);
  const prevAnimationNameRef = React.useRef<string>('none');
  const initialState = present ? 'mounted' : 'unmounted';
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: 'unmounted',
      ANIMATION_OUT: 'unmountSuspended',
    },
    unmountSuspended: {
      MOUNT: 'mounted',
      ANIMATION_END: 'unmounted',
    },
    unmounted: {
      MOUNT: 'mounted',
    },
  });

  React.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === 'mounted' ? currentAnimationName : 'none';
  }, [state]);

  useLayoutEffect(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;

    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);

      if (present) {
        send('MOUNT');
      } else if (currentAnimationName === 'none' || styles?.display === 'none') {
        send('UNMOUNT');
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send('ANIMATION_OUT');
        } else {
          send('UNMOUNT');
        }
      }

      prevPresentRef.current = present;
    }
  }, [present, send]);

  useLayoutEffect(() => {
    if (node) {
      let timeoutId: number;
      const ownerWindow = node.ownerDocument.defaultView ?? window;

      const handleAnimationEnd = (event: AnimationEvent) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
        if (event.target === node && isCurrentAnimation) {
          send('ANIMATION_END');
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = 'forwards';
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === 'forwards') {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      };
      const handleAnimationStart = (event: AnimationEvent) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      };
      node.addEventListener('animationstart', handleAnimationStart);
      node.addEventListener('animationcancel', handleAnimationEnd);
      node.addEventListener('animationend', handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener('animationstart', handleAnimationStart);
        node.removeEventListener('animationcancel', handleAnimationEnd);
        node.removeEventListener('animationend', handleAnimationEnd);
      };
    } else {
      send('ANIMATION_END');
    }
  }, [node, send]);

  return {
    isPresent: ['mounted', 'unmountSuspended'].includes(state),
    ref: React.useCallback((node: HTMLElement) => {
      stylesRef.current = node ? getComputedStyle(node) : null;
      setNode(node);
    }, []),
  };
}

/* -----------------------------------------------------------------------------------------------*/

function getAnimationName(styles: CSSStyleDeclaration | null) {
  return styles?.animationName || 'none';
}

function getElementRef(element: React.ReactElement<{ ref?: React.Ref<unknown> }>) {
  let getter = Object.getOwnPropertyDescriptor(element.props, 'ref')?.get;
  let mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
  if (mayWarn) {
    return (element as any).ref;
  }

  getter = Object.getOwnPropertyDescriptor(element, 'ref')?.get;
  mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }

  return element.props.ref || (element as any).ref;
}

const Root = Presence;

export {
  Presence,
  Root,
};
export type { PresenceProps };
