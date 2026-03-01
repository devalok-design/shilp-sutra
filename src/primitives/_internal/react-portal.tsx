/**
 * Vendored from @radix-ui/react-portal
 * @see ../LICENSE
 */

import * as React from 'react';
import ReactDOM from 'react-dom';
import { Primitive } from './react-primitive';
import { useLayoutEffect } from './react-use-layout-effect';

const PORTAL_NAME = 'Portal';

type PortalElement = React.ComponentRef<typeof Primitive.div>;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>;
interface PortalProps extends PrimitiveDivProps {
  container?: Element | DocumentFragment | null;
}

const Portal = React.forwardRef<PortalElement, PortalProps>((props, forwardedRef) => {
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = React.useState(false);
  useLayoutEffect(() => setMounted(true), []);
  const container = containerProp || (mounted && globalThis?.document?.body);
  return container
    ? ReactDOM.createPortal(<Primitive.div {...portalProps} ref={forwardedRef} />, container)
    : null;
});

Portal.displayName = PORTAL_NAME;

const Root = Portal;

export {
  Portal,
  Root,
};
export type { PortalProps };
