import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { requestStepPermission } from '../services/healthService';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../theme/theme';

interface PermissionScreenProps {
  onPermissionGranted?: () => void;
}

export default function PermissionScreen({ onPermissionGranted }: PermissionScreenProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleEnable = async () => {
    try {
      const granted = await requestStepPermission();
      if (granted && onPermissionGranted) {
        onPermissionGranted();
      }
    } catch (e) {
      // Handled outside
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.emoji}>👟</Text>
        <Text style={styles.title}>Track Your Steps</Text>
        <Text style={styles.subtitle}>
          StepCounter needs access to your health data to display your daily steps and activity trends.
        </Text>
        
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>✓ Reads daily steps only</Text>
          <Text style={styles.bullet}>✓ Does NOT access sensitive medical data</Text>
          <Text style={styles.bullet}>✓ Data stays on your device</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleEnable}>
          <Text style={styles.primaryButtonText}>Enable Health Access</Text>
        </Pressable>

        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryText}>If previously denied, enable in Settings</Text>
          <Pressable style={styles.secondaryButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.secondaryButtonText}>Open Settings</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    padding: Spacing?.xl || 32,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: FontSize?.xxl || 32,
    fontWeight: FontWeight?.bold || 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: FontSize?.md || 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  bulletContainer: {
    alignSelf: 'stretch',
    marginBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: BorderRadius?.lg || 16,
  },
  bullet: {
    color: '#DDDDDD',
    fontSize: FontSize?.sm || 14,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary || '#00E676',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: FontSize?.lg || 18,
    fontWeight: 'bold',
  },
  secondaryCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 20,
    borderRadius: BorderRadius?.lg || 16,
    width: '100%',
  },
  secondaryText: {
    color: '#888888',
    marginBottom: 12,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#448AFF',
  },
  secondaryButtonText: {
    color: '#448AFF',
    fontWeight: '600',
  },
});
