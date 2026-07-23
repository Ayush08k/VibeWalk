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
  const outerProgress = useSharedValue(0);
  const innerProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const percentage = Math.min(Math.round((steps / (goal || 1)) * 100), 999);
  const goalReached = steps >= goal;
  const stepsChanged = steps !== previousSteps && previousSteps > 0;

  useEffect(() => {
    const targetOuter = Math.min(Math.max(steps / (goal || 1), 0), 1);
    const targetInner = Math.min(Math.max((steps * 0.04) / 400, 0), 1); // Calories target ~400 kcal

    outerProgress.value = withTiming(targetOuter, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
    innerProgress.value = withTiming(targetInner, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [steps, goal, outerProgress, innerProgress]);

  // Pulse animation when steps change
  useEffect(() => {
    if (stepsChanged) {
      pulseScale.value = withSequence(
        withSpring(1.05, { damping: 8, stiffness: 220 }),
        withSpring(1, { damping: 12, stiffness: 160 }),
      );
    }
  }, [steps, stepsChanged, pulseScale]);

  // Outer Ring Sizing
  const size = 300;
  const strokeOuter = 16;
  const radiusOuter = (size - strokeOuter) / 2;
  const circumOuter = 2 * Math.PI * radiusOuter;

  // Inner Ring Sizing
  const strokeInner = 10;
  const radiusInner = radiusOuter - 22;
  const circumInner = 2 * Math.PI * radiusInner;

  const outerAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumOuter - outerProgress.value * circumOuter,
  }));

  const innerAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumInner - innerProgress.value * circumInner,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressColor = steps < goal * 0.5
    ? '#FF9900'
    : steps >= goal
      ? '#FF007A'
      : '#00F5FF';

  const getMotivationalText = () => {
    if (percentage >= 100) return '⚡ GOAL CRUSHED';
    if (percentage >= 75) return '🔥 ALMOST THERE';
    if (percentage >= 50) return '🚀 HALF WAY DONE';
    if (percentage >= 25) return '👟 KEEP WALKING';
    return '🌱 START MOVEMENT';
  };

  return (
    <Animated.View style={[styles.container, pulseStyle]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          {/* Outer Gradient */}
          <LinearGradient id="outerGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#00F5FF" stopOpacity="1" />
            <Stop offset="60%" stopColor="#9D00FF" stopOpacity="1" />
            <Stop offset="100%" stopColor={goalReached ? '#FF007A' : '#00F5FF'} stopOpacity="1" />
          </LinearGradient>
          {/* Inner Gradient */}
          <LinearGradient id="innerGrad" x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FF007A" stopOpacity="1" />
            <Stop offset="100%" stopColor="#9D00FF" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Outer Track */}
        <Circle
          stroke="#161624"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radiusOuter}
          strokeWidth={strokeOuter}
        />
        {/* Outer Progress Arc */}
        <AnimatedCircle
          stroke="url(#outerGrad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radiusOuter}
          strokeWidth={strokeOuter}
          strokeDasharray={circumOuter}
          animatedProps={outerAnimatedProps}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />

        {/* Inner Track */}
        <Circle
          stroke="#12121D"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radiusInner}
          strokeWidth={strokeInner}
        />
        {/* Inner Progress Arc */}
        <AnimatedCircle
          stroke="url(#innerGrad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radiusInner}
          strokeWidth={strokeInner}
          strokeDasharray={circumInner}
          animatedProps={innerAnimatedProps}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      {/* Holographic Center Content */}
      <View style={styles.centerContent}>
        <View style={styles.badgeRow}>
          <View style={[styles.statusTag, { backgroundColor: `${progressColor}18`, borderColor: `${progressColor}40` }]}>
            <Text style={[styles.statusTagText, { color: progressColor }]}>{getMotivationalText()}</Text>
          </View>
        </View>

        <Text style={styles.stepCount}>{steps.toLocaleString()}</Text>

        <Text style={styles.goalSubtext}>
          TARGET <Text style={styles.goalNumber}>{goal.toLocaleString()}</Text>
        </Text>

        {/* Progress Bar Chip */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: progressColor }]} />
          </View>
          <Text style={[styles.percentLabel, { color: progressColor }]}>{percentage}%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  svg: {},
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  badgeRow: {
    marginBottom: 4,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stepCount: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  goalSubtext: {
    fontSize: 11,
    color: '#707090',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: -2,
  },
  goalNumber: {
    color: '#A0A0C0',
    fontWeight: '800',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  progressBarTrack: {
    width: 90,
    height: 5,
    backgroundColor: '#1C1C2C',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
});
