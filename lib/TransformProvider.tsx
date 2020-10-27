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
export type AnimatedScroll = WithInnerValue<Animated.Value>;

export type ContextValue = {
  interpolatedValue: Animated.AnimatedInterpolation | null;
  minHeight: number;
  maxHeight: number;
  onChangeFocusScroll: (
    item: DiffClampType,
    animatedScrollValue: AnimatedScroll
  ) => void;
};

export const TransformContext = React.createContext<ContextValue>({
  interpolatedValue: null,
  onChangeFocusScroll: () => {},
  minHeight: 0,
  maxHeight: 250,
});

const TransformProvider: FC<TransformProviderProps> = ({
  children,
  maxHeight,
  minHeight,
  transformDuration = 300,
}: TransformProviderProps) => {
  const [headerOffset] = React.useState(new Animated.Value(0));
  const [diffClampScroll, changeDiffClampScroll] = React.useState(
    Animated.diffClamp(new Animated.Value(0), minHeight, maxHeight)
  );

  // TODO onChangeDiffClamp;
  const onChangeFocusScroll = React.useCallback(
    (
      item: Animated.AnimatedDiffClamp & {
        _value: number;
      },
      animatedScrollValue: Animated.Value & {
        _value: number;
      }
    ) => {
      animatedScrollValue.removeAllListeners();

      changeDiffClampScroll(
        Animated.diffClamp(headerOffset, minHeight, maxHeight)
      );

      const diffAnimated = new Animated.Value(item._value);
      let diff: number = animatedScrollValue._value;
      const offsetVal = item._value;
      const diffClamp = Animated.diffClamp(diffAnimated, minHeight, maxHeight);

      animatedScrollValue.addListener(({ value: scrollOffset }: any) => {
        let innerVal: number;
        if (scrollOffset - diff + offsetVal < 0) {
          innerVal = 0;
        } else {
          innerVal = scrollOffset - diff + offsetVal;
        }

        console.log("innerVal", innerVal);
        diffAnimated.setValue(innerVal);

        Animated.timing(headerOffset, {
          toValue: diffClamp,
          duration: 0,
          useNativeDriver: false,
        }).start();
      });

      Animated.timing(headerOffset, {
        toValue: item._value,
        duration: transformDuration,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          changeDiffClampScroll(item);
        }
      });
    },
    []
  );

  const interpolate = React.useMemo(
    () =>
      diffClampScroll.interpolate({
        inputRange: [minHeight, maxHeight],
        outputRange: [minHeight, -maxHeight],
      }),
    [diffClampScroll]
  );

  const value = {
    interpolatedValue: interpolate,
    onChangeFocusScroll,
    minHeight,
    maxHeight,
  };
  return (
    <TransformContext.Provider value={value}>
      {children}
    </TransformContext.Provider>
  );
};

export default TransformProvider;
