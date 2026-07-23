import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight, Spacing } from '../theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StepRingProps {
  steps: number;
  goal: number;
  previousSteps?: number;
  loading?: boolean;
}

export default function StepRing({ steps, goal, previousSteps = 0, loading }: StepRingProps) {
  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  const percentage = Math.min(Math.round((steps / (goal || 1)) * 100), 999);
  const goalReached = steps >= goal;
  const stepsChanged = steps !== previousSteps && previousSteps > 0;

  useEffect(() => {
    const targetProgress = Math.min(Math.max(steps / (goal || 1), 0), 1);
    progress.value = withTiming(targetProgress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [steps, goal, progress]);

  // Pulse animation when steps change
  useEffect(() => {
    if (stepsChanged) {
      pulseScale.value = withSequence(
        withSpring(1.04, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 }),
      );
    }
  }, [steps, stepsChanged, pulseScale]);

  // Glow animation when goal is reached
  useEffect(() => {
    if (goalReached) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 }),
        ),
        -1, // infinite
        true,
      );
    } else {
      glowOpacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [goalReached, glowOpacity]);

  const size = 280;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressColor = steps < goal * 0.5
    ? Colors.ringLow || '#FF6D00'
    : steps >= goal
      ? Colors.ringExceeded || '#448AFF'
      : Colors.ringProgress || '#00E676';

  const getMotivationalText = () => {
    if (percentage >= 100) return '🎉 Goal Crushed!';
    if (percentage >= 75) return 'Almost there!';
    if (percentage >= 50) return 'Great progress!';
    if (percentage >= 25) return 'Keep moving!';
    return 'Let\'s go!';
  };

  return (
    <Animated.View style={[styles.container, pulseStyle]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={progressColor} stopOpacity="1" />
            <Stop offset="0.5" stopColor={progressColor} stopOpacity="0.9" />
            <Stop offset="1" stopColor={goalReached ? '#7C4DFF' : progressColor} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        {/* Track circle */}
        <Circle
          stroke={Colors.ringTrack || '#1A1A1A'}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <AnimatedCircle
          stroke="url(#ringGrad)"
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
        <View style={[styles.percentBadge, { backgroundColor: `${progressColor}20` }]}>
          <Text style={[styles.percentText, { color: progressColor }]}>
            {percentage}%
          </Text>
        </View>
        <Text style={styles.motivationalText}>{getMotivationalText()}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing?.lg || 24,
  },
  svg: {},
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
    fontSize: FontSize?.sm || 12,
    color: '#888888',
    marginTop: 2,
  },
  percentBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  percentText: {
    fontSize: FontSize?.sm || 12,
    fontWeight: FontWeight?.bold || 'bold',
  },
  motivationalText: {
    fontSize: FontSize?.xs || 10,
    color: '#666666',
    marginTop: 6,
    fontWeight: '500',
  },
});
