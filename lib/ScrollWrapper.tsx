import React, { FC, ReactNode } from "react";
import { Animated } from "react-native";

import TransformConsumer from "./TransformConsumer";
import {
  DiffClampType,
  AnimatedScroll,
  ContextValue,
} from "./TransformProvider";

type WrapperProps = Partial<ContextValue> & {
  children: (options: any) => ReactNode;
};

const ScrollWrapper: FC<WrapperProps> = ({
  children,
  onChangeFocusScroll,
  minHeight,
  maxHeight,
}: WrapperProps) => {
  const [scroll] = React.useState(new Animated.Value(0));
  const [diffClampScroll] = React.useState(
    Animated.diffClamp(scroll, minHeight as number, maxHeight as number)
  );

  const onChangeFocus = React.useCallback(() => {
    if (typeof onChangeFocusScroll === "function") {
      onChangeFocusScroll(
        diffClampScroll as DiffClampType,
        scroll as AnimatedScroll
      );
    }
  }, []);

  const handleOnScroll = React.useCallback((event) => {
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              y: scroll,
            },
          },
        },
      ],
      {
        useNativeDriver: false,
      }
    )(event);
  }, []);

  const options = { onChangeFocus, minHeight, maxHeight, handleOnScroll };

  return <>{children(options)}</>;
};

export default TransformConsumer(ScrollWrapper);
