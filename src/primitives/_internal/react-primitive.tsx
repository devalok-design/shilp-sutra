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
] as const;

type Primitives = { [E in (typeof NODES)[number]]: PrimitiveForwardRefComponent<E> };
type PrimitivePropsWithRef<E extends React.ElementType> = React.ComponentPropsWithRef<E> & {
  asChild?: boolean;
};

interface PrimitiveForwardRefComponent<E extends React.ElementType>
  extends React.ForwardRefExoticComponent<PrimitivePropsWithRef<E>> {}

const Primitive = NODES.reduce((primitive, node) => {
  const Slot = createSlot(`Primitive.${node}`);
  const Node = React.forwardRef((props: PrimitivePropsWithRef<typeof node>, forwardedRef: any) => {
    const { asChild, ...primitiveProps } = props;
    const Comp: any = asChild ? Slot : node;

    if (typeof window !== 'undefined') {
      (window as any)[Symbol.for('radix-ui')] = true;
    }

    return <Comp {...primitiveProps} ref={forwardedRef} />;
  });

  Node.displayName = `Primitive.${node}`;

  return { ...primitive, [node]: Node };
}, {} as Primitives);

function dispatchDiscreteCustomEvent<E extends CustomEvent>(target: E['target'], event: E) {
  if (target) ReactDOM.flushSync(() => target.dispatchEvent(event));
}

const Root = Primitive;

export {
  Primitive,
  Root,
  dispatchDiscreteCustomEvent,
};
export type { PrimitivePropsWithRef };
