import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { Colors } from '../theme/theme';

interface LiquidScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function LiquidScreenWrapper({ children, style }: LiquidScreenWrapperProps) {
  const isFocused = useIsFocused();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      progress.value = withSpring(1, {
        damping: 15,
        stiffness: 95,
        mass: 0.8,
      });
    } else {
      progress.value = withTiming(0, { duration: 250 });
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 1]);
    const scale = interpolate(progress.value, [0, 1], [0.96, 1]);
    const translateY = interpolate(progress.value, [0, 1], [16, 0]);

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors?.background || '#09090F',
  },
});
