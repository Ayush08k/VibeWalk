import React from 'react';
import { ViewStyle, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface LiquidSectionProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  pressable?: boolean;
  onPress?: () => void;
}

export default function LiquidSection({
  children,
  delay = 0,
  style,
  pressable = false,
  onPress,
}: LiquidSectionProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.97, { damping: 12, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
    }
  };

  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (pressable) {
    return (
      <Animated.View
        entering={FadeInDown.delay(delay).springify().damping(13).stiffness(90)}
        style={style}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
        >
          <Animated.View style={animatedPressStyle}>{children}</Animated.View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(13).stiffness(90)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
