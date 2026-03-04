/**
 * Vendored from @radix-ui/react-arrow
 * @see ../LICENSE
 */

import * as React from 'react';
import { Primitive } from './react-primitive';

const NAME = 'Arrow';

type ArrowElement = React.ComponentRef<typeof Primitive.svg>;
type PrimitiveSvgProps = React.ComponentPropsWithoutRef<typeof Primitive.svg>;
interface ArrowProps extends PrimitiveSvgProps {}

const Arrow = React.forwardRef<ArrowElement, ArrowProps>((props, forwardedRef) => {
  const { children, width = 10, height = 5, ...arrowProps } = props;
  return (
    <Primitive.svg
      {...arrowProps}
      ref={forwardedRef}
      width={width}
      height={height}
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      {props.asChild ? children : <polygon points="0,0 30,0 15,10" />}
    </Primitive.svg>
  );
});

Arrow.displayName = NAME;

const Root = Arrow;

export {
  Arrow,
  Root,
};
export type { ArrowProps };
