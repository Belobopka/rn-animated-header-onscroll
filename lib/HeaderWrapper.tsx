import React, { FC, ReactNode } from "react";

import TransformConsumer from "./TransformConsumer";
import { ContextValue } from "./TransformProvider";

export type WrapperProps = Partial<ContextValue> & {
  children: (options: Partial<ContextValue>) => ReactNode;
};

const HeaderWrapper: FC<WrapperProps> = ({
  children,
  interpolatedValue,
  maxHeight,
  minHeight,
}: WrapperProps) => {
  const options = { interpolatedValue, minHeight, maxHeight };
  return <>{children(options)}</>;
};

export default TransformConsumer(HeaderWrapper);
