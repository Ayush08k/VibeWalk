import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { InsightItem } from '../services/apiService';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../theme/theme';

interface InsightCardProps {
  insight: InsightItem;
  onDismiss?: () => void;
}

export default function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withSpring(0);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const getAccentColor = (severity: string) => {
    switch (severity) {
      case 'success': return '#00E676';
      case 'warning': return '#FF6D00';
      case 'alert': return '#FF1744';
      case 'info':
      default: return '#448AFF';
    }
  };

  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(20, { duration: 300 });
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  return (
    <Animated.View style={[styles.card, animatedStyle, { borderLeftColor: getAccentColor(insight.severity) }]}>
      <Text style={styles.emoji}>{insight.emoji || '💡'}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.description}>{insight.description}</Text>
      </View>
      {onDismiss && (
        <Pressable onPress={handleDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: BorderRadius?.xl || 20,
    padding: Spacing?.lg || 16,
    marginVertical: Spacing?.sm || 8,
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: FontSize?.md || 16,
    fontWeight: FontWeight?.bold || 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#AAAAAA',
    fontSize: FontSize?.sm || 14,
  },
  dismissBtn: {
    padding: 8,
  },
  dismissText: {
    color: '#888888',
    fontSize: 18,
  },
});
