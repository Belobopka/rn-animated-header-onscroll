import React, { FC } from "react";
import { Animated } from "react-native";

type TransformProviderProps = {
  children: JSX.Element;
  maxHeight: number;
  minHeight: number;
  transformDuration?: number;
};

export type WithInnerValue<Type> = Type & {
  _value: number;
};

export type DiffClampType = WithInnerValue<Animated.AnimatedDiffClamp>;
export type AnimatedValue = WithInnerValue<Animated.Value>;
export type InterpolatedValueType = WithInnerValue<
  Animated.AnimatedInterpolation
>;

export type ContextValue = {
  interpolatedValue: Animated.AnimatedInterpolation;
  minHeight: number;
  maxHeight: number;
  pan: Animated.Value;
  preserveHeader?: boolean;
  setOffset: (value: number) => void;
  diffClampScroll: Animated.AnimatedDiffClamp;
  flattenOffset: (value?: number) => void;
  setPanValue: (value: number) => void;
};

export const TransformContext = React.createContext<ContextValue>({
  interpolatedValue: new Animated.Value(0),
  diffClampScroll: new Animated.Value(0),
  minHeight: 0,
  maxHeight: 250,
  pan: new Animated.Value(0),
  setPanValue: () => {},
  setOffset: () => {},
  flattenOffset: () => {},
});

const TransformProvider: FC<TransformProviderProps> = ({
  children,
  maxHeight,
  minHeight,
}: TransformProviderProps) => {
  const [pan] = React.useState(new Animated.Value(0));
  const [diffClampScroll, changeDiffClampScroll] = React.useState(
    Animated.diffClamp(pan, minHeight, maxHeight)
  );
  const interpolate = React.useMemo(
    () =>
      diffClampScroll.interpolate({
        inputRange: [minHeight, maxHeight],
        outputRange: [minHeight, -maxHeight],
      }),
    [diffClampScroll]
  );

  const setPanValue = React.useCallback((value: number) => {
    pan.setValue(value);
  }, []);

  const setOffset = React.useCallback((value: number) => {
    pan.setOffset(value);
  }, []);

  const flattenOffset = React.useCallback((value?: number) => {
    pan.flattenOffset();
  }, []);

  const value = {
    interpolatedValue: interpolate,
    diffClampScroll,
    minHeight,
    maxHeight,
    pan,
    setOffset,
    flattenOffset,
    setPanValue,
  };
  return (
    <TransformContext.Provider value={value}>
      {children}
    </TransformContext.Provider>
  );
};

export default TransformProvider;
