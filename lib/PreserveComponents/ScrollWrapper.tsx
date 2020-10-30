import React, { FC, ReactNode, useEffect } from "react";
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
  interpolatedValue,
  headerOffset,
  diffClampScroll,
  changeOffset,
}: WrapperProps) => {
  const [scroll] = React.useState(new Animated.Value(0));
  // const [diffClampScroll] = React.useState(
  //   Animated.diffClamp(scroll, minHeight as number, maxHeight as number)
  // );

  const [sub] = React.useState(new Animated.Value(0));

  const onChangeFocus = React.useCallback(() => {
    if (typeof onChangeFocusScroll === "function") {
      // onChangeFocusScroll(
      //   diffClampScroll as DiffClampType,
      //   scroll as AnimatedScroll
      // );
    }
  }, []);

  useEffect(() => {
    let prevValue = scroll._value;
    scroll.addListener(({ value }) => {
      changeOffset(value - prevValue);
      prevValue = value;
    });
  }, []);

  const handleOnScroll = React.useMemo(() => {
    return Animated.event(
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
    );
  }, []);

  // const padding = scroll._value
  //   ? scroll._value > maxHeight
  //     ? maxHeight
  //     : -(diffClampScroll._value - maxHeight)
  //   : 0;

  // console.log("padding", padding);

  const options = {
    onChangeFocus,
    minHeight,
    maxHeight,
    handleOnScroll,
    interpolatedValue,
    headerOffset,
    diffClampScroll,
    // padding,
    scroll,
  };

  return <>{children(options)}</>;
};

export default TransformConsumer(ScrollWrapper);
