import React, { FC } from "react";
import { RefObject } from "react";
import { Dimensions, Text } from "react-native";
import { View, Animated, ScrollView } from "react-native";
import {
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import TransformConsumer from "./TransformConsumer";

import {
  AnimatedValue,
  ContextValue,
  InterpolatedValueType,
} from "./TransformProvider";

const offset = 2;

export type PanWrapperChildrenProps = {
  onGestureEvent: (value: PanGestureHandlerGestureEvent) => void;
  onHandlerStateChange: (value: PanGestureHandlerStateChangeEvent) => void;
  onContentSizeChange?: (_: any, height: number) => void;
  interpolatedValue: InterpolatedValueType;
  activeOffsetY?: [number, number];
  maxHeight: number;
  minHeight: number;
  scrollRef?: RefObject<ScrollView>;
};

export type PanWrapperProps = ContextValue & {
  withScroll?: boolean;
  activeOffsetY: [number, number];
  children: ({
    onGestureEvent,
    onHandlerStateChange,
    onContentSizeChange,
    interpolatedValue,
    activeOffsetY,
    scrollRef,
  }: PanWrapperChildrenProps) => JSX.Element;
};

const PanWrapper: FC<PanWrapperProps> = ({
  children,
  setOffset,
  minHeight,
  maxHeight,
  diffClampScroll,
  interpolatedValue,
  withScroll = false,
  pan,
  flattenOffset,
  setPanValue,
  activeOffsetY,
}: PanWrapperProps) => {
  const [scroll] = React.useState(new Animated.Value(0));
  const [decay] = React.useState(new Animated.Value(0));
  const [scrollHeight, changeScrollHeight] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>() as RefObject<ScrollView>;
  const [decayDiff] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    let decayPrev = 0;
    decay.addListener(({ value }) => {
      const diffNumber =
        (decayDiff as AnimatedValue)._value + value - decayPrev;
      scrollRef?.current?.scrollTo?.({
        x: 0,
        y: diffNumber,
        animated: true,
      });
      decayDiff.setValue(
        diffNumber >= scrollHeight
          ? scrollHeight
          : diffNumber <= 0
          ? 0
          : diffNumber
      );
      decayPrev = value;
    });
    return () => decay.removeAllListeners();
  }, [decay, decayDiff, scrollRef, scrollHeight]);

  const _onPanGestureEvent = React.useCallback(
    ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
      const value = nativeEvent.translationY;
      const { velocityY } = nativeEvent;
      const diffClampScrollValue = (diffClampScroll as AnimatedValue)._value;
      if (
        withScroll &&
        ((velocityY <= 0 && diffClampScrollValue >= maxHeight - offset) ||
          (velocityY >= 0 && diffClampScrollValue <= minHeight + offset))
      ) {
        if (scrollHeight <= 0) {
          return;
        }
        Animated.decay(decay, {
          velocity: -nativeEvent.velocityY / 1000,
          deceleration: 0.997,
          useNativeDriver: false,
        }).start();
      }
      setPanValue?.(-value);
    },
    [diffClampScroll, decay, scrollHeight]
  );

  const handlePanStateChange = React.useCallback(
    ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
      if (nativeEvent.state === 5) {
        flattenOffset();
      } else if (nativeEvent.state === 2) {
        pan.stopAnimation((val) => {
          setOffset(val);
          setPanValue(0);
        });
      }
    },
    [scroll]
  );

  const onContentSizeChange = React.useCallback(
    (_, height) => {
      if (!scrollHeight || scrollHeight !== height) {
        changeScrollHeight(height - Dimensions.get("screen").height);
      }
    },
    [scrollHeight]
  );

  return typeof children === "function" ? (
    children({
      onGestureEvent: _onPanGestureEvent,
      onHandlerStateChange: handlePanStateChange,
      onContentSizeChange,
      interpolatedValue: interpolatedValue as InterpolatedValueType,
      activeOffsetY,
      minHeight,
      maxHeight,
      scrollRef,
    })
  ) : (
    <View>
      <Text>You need to implement children as function in PanWrapper</Text>
    </View>
  );
};

export default TransformConsumer(PanWrapper);
