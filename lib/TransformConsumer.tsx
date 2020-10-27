import React from "react";

import { ContextValue, TransformContext } from "./TransformProvider";

const TransformConsumer = (Component: any) => (props: any) => {
  return (
    <TransformContext.Consumer>
      {(value: Partial<ContextValue>) => <Component {...value} {...props} />}
    </TransformContext.Consumer>
  );
};

export default TransformConsumer;
