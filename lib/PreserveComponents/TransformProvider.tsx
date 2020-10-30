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
  headerOffset: Animated.Value;
  preserveHeader?: boolean;
  changeOffset: (item: AnimatedScroll) => void;
  // onChangeFocusScroll: (
  //   item: DiffClampType,
  //   animatedScrollValue: AnimatedScroll
  // ) => void;
};

export const TransformContext = React.createContext<ContextValue>({
  interpolatedValue: null,
  //  onChangeFocusScroll: () => {},
  minHeight: 0,
  maxHeight: 250,
  headerOffset: new Animated.Value(0),
  changeOffset: () => {},
});

const TransformProvider: FC<TransformProviderProps> = ({
  children,
  maxHeight,
  minHeight,
  transformDuration = 300,
  preserveHeader = false,
}: TransformProviderProps) => {
  const [headerOffset] = React.useState(new Animated.Value(0));
  const [testHeaderOffset] = React.useState(new Animated.Value(0));
  const [diffClampScroll, changeDiffClampScroll] = React.useState(
    Animated.diffClamp(headerOffset, minHeight, maxHeight)
  );

  // TODO onChangeDiffClamp;
  // const onChangeFocusScroll = React.useCallback(
  //   (
  //     item: Animated.AnimatedDiffClamp & {
  //       _value: number;
  //     },
  //     animatedScrollValue: Animated.Value & {
  //       _value: number;
  //     }
  //   ) => {
  //     animatedScrollValue.removeAllListeners();

  //     changeDiffClampScroll(
  //       Animated.diffClamp(headerOffset, minHeight, maxHeight)
  //     );

  //     const diffAnimated = new Animated.Value(item._value);
  //     let diff: number = animatedScrollValue._value;
  //     const offsetVal = item._value;
  //     const diffClamp = Animated.diffClamp(diffAnimated, minHeight, maxHeight);

  //     animatedScrollValue.addListener(({ value: scrollOffset }: any) => {
  //       let innerVal: number;
  //       if (scrollOffset - diff + offsetVal < 0) {
  //         innerVal = 0;
  //       } else {
  //         innerVal = scrollOffset - diff + offsetVal;
  //       }

  //       diffAnimated.setValue(innerVal);

  //       Animated.timing(headerOffset, {
  //         toValue: diffClamp,
  //         duration: 0,
  //         useNativeDriver: false,
  //       }).start();
  //     });

  //     Animated.timing(headerOffset, {
  //       toValue: item._value,
  //       duration: transformDuration,
  //       useNativeDriver: false,
  //     }).start(({ finished }) => {
  //       if (finished) {
  //         changeDiffClampScroll(item);
  //       }
  //     });
  //   },
  //   []
  // );

  const interpolate = React.useMemo(
    () =>
      diffClampScroll.interpolate({
        inputRange: [minHeight, maxHeight],
        outputRange: [minHeight, -maxHeight],
      }),
    [diffClampScroll]
  );

  const changeOffset = React.useCallback((item) => {
    // const { _value } = headerOffset as AnimatedScroll;
    // const animation = new Animated.Value(item._value + headerOffset._value);
    // console.log("_value", _value);
    const addition = Animated.add(item, testHeaderOffset);
    // const val = new Animated.Value(addition);
    // console.log(interpolate);
    Animated.timing(headerOffset, {
      toValue: item + headerOffset._value,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }, []);

  const value = {
    interpolatedValue: interpolate,
    diffClampScroll,
    // onChangeFocusScroll,
    minHeight,
    maxHeight,
    headerOffset,
    changeOffset,
  };
  return (
    <TransformContext.Provider value={value}>
      {children}
    </TransformContext.Provider>
  );
};

export default TransformProvider;
