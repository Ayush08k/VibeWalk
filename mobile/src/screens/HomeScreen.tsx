import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import StepRing from '../components/StepRing';
import InsightCard from '../components/InsightCard';
import { useSteps } from '../hooks/useSteps';
import { useStepHistory } from '../hooks/useStepHistory';
import { useAnalytics } from '../hooks/useAnalytics';
import { estimateCalories, estimateDistanceKm, estimateActiveMinutes } from '../utils/normalize';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/theme';

/**
 * Returns a greeting based on the current hour.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

/**
 * Formats the current date as "Wed, Jul 23"
 */
function getFormattedDate(): string {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

/**
 * Returns a human-friendly "X sec ago" / "X min ago" string
 */
function getTimeSince(date: Date | null): string {
  if (!date) return '';
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { steps, previousSteps, goal, loading, error, lastUpdated, refresh: refreshSteps } = useSteps();
  const { history, refresh: refreshHistory } = useStepHistory();
  const { analytics, loading: analyticsLoading } = useAnalytics(history, goal);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [, setTick] = useState(0); // force re-render for "time since" updates

  // Pulse the live dot
  const liveDotOpacity = useSharedValue(1);
  useEffect(() => {
    liveDotOpacity.value = withRepeat(
      withTiming(0.3, { duration: 1000 }),
      -1,
      true,
    );
  }, [liveDotOpacity]);

  const liveDotStyle = useAnimatedStyle(() => ({
    opacity: liveDotOpacity.value,
  }));

  // Update "time since" every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSteps?.(), refreshHistory?.()]);
    setRefreshing(false);
  };

  const calories = estimateCalories ? estimateCalories(steps) : 0;
  const distance = estimateDistanceKm ? estimateDistanceKm(steps) : 0;
  const activeMin = estimateActiveMinutes ? estimateActiveMinutes(steps) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00E676';
    if (score >= 50) return '#FF6D00';
    return '#FF1744';
  };

  const visibleInsights = (analytics?.insights || []).filter(
    (_insight: any, index: number) => !dismissedInsights.includes(String(index))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00E676" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.headerContainer}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
          </View>
          <View style={styles.liveIndicator}>
            <Animated.View style={[styles.liveDot, liveDotStyle]} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </Animated.View>

        {/* ── Step Ring ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
          <StepRing steps={steps || 0} goal={goal || 10000} previousSteps={previousSteps} />
        </Animated.View>

        {/* ── Last Updated ── */}
        <Text style={styles.lastUpdated}>
          {lastUpdated ? `Updated ${getTimeSince(lastUpdated)}` : 'Loading...'}
        </Text>

        {/* ── Stats Row ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardCalories]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={[styles.statCard, styles.statCardDistance]}>
            <Text style={styles.statIcon}>📏</Text>
            <Text style={styles.statValue}>{distance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Km</Text>
          </View>
          <View style={[styles.statCard, styles.statCardActive]}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.statValue}>{activeMin}</Text>
            <Text style={styles.statLabel}>Min</Text>
          </View>
        </Animated.View>

        {/* ── Wellness Score ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.scoreContainer}>
          <View>
            <Text style={styles.scoreTitle}>Wellness Score</Text>
            <Text style={styles.scoreSubtitle}>Based on 30-day activity</Text>
          </View>
          <View style={[styles.scoreBadge, { borderColor: getScoreColor(analytics?.wellnessScore || 0) }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(analytics?.wellnessScore || 0) }]}>
              {analytics?.wellnessScore || 0}
            </Text>
          </View>
        </Animated.View>

        {/* ── Insights ── */}
        <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {analyticsLoading ? (
            <>
              <View style={styles.skeleton} />
              <View style={[styles.skeleton, { width: '85%' }]} />
            </>
          ) : visibleInsights.length > 0 ? (
            visibleInsights.map((insight: any, index: number) => (
              <InsightCard
                key={`insight-${index}`}
                insight={insight}
                onDismiss={() => setDismissedInsights(prev => [...prev, String(index)])}
              />
            ))
          ) : (
            <View style={styles.emptyInsights}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyTitle}>No Insights Yet</Text>
              <Text style={styles.emptyDescription}>
                Keep walking! Insights will appear as we analyze your activity patterns over time.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // ── Header ──
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: FontSize?.title || 22,
    fontWeight: FontWeight?.bold || 'bold',
  },
  dateText: {
    color: '#888888',
    fontSize: FontSize?.sm || 12,
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
  },
  liveText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  // ── Last Updated ──
  lastUpdated: {
    textAlign: 'center',
    color: '#555555',
    fontSize: 11,
    marginTop: -8,
    marginBottom: 16,
  },
  // ── Stats Row ──
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: BorderRadius?.lg || 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statCardCalories: {
    borderColor: 'rgba(255, 109, 0, 0.25)',
    backgroundColor: 'rgba(255, 109, 0, 0.08)',
  },
  statCardDistance: {
    borderColor: 'rgba(68, 138, 255, 0.25)',
    backgroundColor: 'rgba(68, 138, 255, 0.08)',
  },
  statCardActive: {
    borderColor: 'rgba(0, 230, 118, 0.25)',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: FontSize?.lg || 18,
    fontWeight: FontWeight?.bold || 'bold',
  },
  statLabel: {
    color: '#AAAAAA',
    fontSize: FontSize?.xs || 10,
    marginTop: 4,
  },
  // ── Wellness Score ──
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121214',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: BorderRadius?.lg || 16,
    padding: 20,
    marginBottom: 20,
  },
  scoreTitle: {
    color: '#FFFFFF',
    fontSize: FontSize?.md || 14,
    fontWeight: FontWeight?.semibold || '600',
  },
  scoreSubtitle: {
    color: '#666666',
    fontSize: 11,
    marginTop: 2,
  },
  scoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: FontSize?.lg || 18,
    fontWeight: FontWeight?.bold || 'bold',
  },
  // ── Insights ──
  insightsSection: {
    marginTop: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: FontSize?.lg || 18,
    fontWeight: FontWeight?.bold || 'bold',
    marginBottom: 12,
  },
  skeleton: {
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius?.xl || 20,
    marginVertical: 6,
  },
  // ── Empty Insights ──
  emptyInsights: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: BorderRadius?.xl || 20,
    padding: 28,
    marginVertical: 8,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: FontSize?.md || 14,
    fontWeight: FontWeight?.semibold || '600',
    marginBottom: 6,
  },
  emptyDescription: {
    color: '#888888',
    fontSize: FontSize?.sm || 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
