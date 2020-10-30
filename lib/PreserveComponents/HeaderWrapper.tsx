import React, { FC, ReactNode } from "react";
import { Animated, PanResponder, View } from "react-native";

import TransformConsumer from "./TransformConsumer";
import { AnimatedScroll, ContextValue } from "./TransformProvider";

export type WrapperProps = Partial<ContextValue> & {
  children: (options: Partial<ContextValue>) => ReactNode;
};

const HeaderWrapper: FC<WrapperProps> = ({
  children,
  interpolatedValue,
  maxHeight,
  minHeight,
  changeOffset,
}: WrapperProps) => {
  const [scroll] = React.useState(new Animated.Value(0));
  React.useEffect(() => {
    let prevValue = scroll._value;
    scroll.addListener(({ value }) => {
      // console.log((prevValue - value) / 2);
      changeOffset?.(
        new Animated.Value((prevValue - value) / 2) as AnimatedScroll
      );
      prevValue = value;
    });
  }, []);
  const panResponder = React.useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => {
        console.log("onStartShouldSetPanResponder");
        return true;
      },
      // @ts-ignore
      onScrollSetPanResponderCapture: () => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => {
        console.log("onStartShouldSetPanResponderCapture");
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: () => {
        console.log("onPanResponderTerminationRequest");
        return true;
      },

      onPanResponderGrant: (evt, gestureState) => {
        // scroll.setValue(gestureState.dy);
        console.log("onPanResponderGrant");
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        scroll.setValue(gestureState.dy);
        // console.log("onPanResponderMove", gestureState);
        // Animated.spring(headerOffset, {
        //   toValue: gestureState.moveY,
        //   useNativeDriver: false,
        // });
      },
      // onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // scroll.setValue(gestureState.dy);
        console.log("onPanResponderRelease gestureState");
        // changeBlock(false);
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        console.log("onPanResponderTerminate gestureState");
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    })
  ).current;
  const options = { interpolatedValue, minHeight, maxHeight, panResponder };
  return <>{children(options)}</>;
};

export default TransformConsumer(HeaderWrapper);
