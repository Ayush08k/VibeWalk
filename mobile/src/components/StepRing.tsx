import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight, Spacing } from '../theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StepRingProps {
  steps: number;
  goal: number;
  loading?: boolean;
}

export default function StepRing({ steps, goal, loading }: StepRingProps) {
  const progress = useSharedValue(0);
  
  useEffect(() => {
    const targetProgress = Math.min(Math.max(steps / (goal || 1), 0), 1);
    progress.value = withTiming(targetProgress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [steps, goal, progress]);

  const size = 280;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });
  
  const progressColor = steps < goal * 0.5 
    ? Colors.ringLow || '#FF6D00' 
    : steps >= goal 
      ? Colors.ringExceeded || '#448AFF' 
      : Colors.ringProgress || '#00E676';

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={progressColor} stopOpacity="1" />
            <Stop offset="1" stopColor={progressColor} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        <Circle
          stroke={Colors.ringTrack || '#1A1A1A'}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke="url(#grad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.centerContent}>
        <Text style={styles.stepCount}>
          {steps.toLocaleString()}
        </Text>
        <Text style={styles.goalText}>
          / {goal.toLocaleString()} steps
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing?.lg || 24,
  },
  svg: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontSize: FontSize?.hero || 48,
    fontWeight: FontWeight?.bold || 'bold',
    color: '#FFFFFF',
  },
  goalText: {
    fontSize: FontSize?.md || 16,
    color: '#888888',
    marginTop: 4,
  },
});
