import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import StepRing from '../components/StepRing';
import InsightCard from '../components/InsightCard';
import HealthSyncBanner from '../components/HealthSyncBanner';
import WidgetPreviewCard from '../components/WidgetPreviewCard';
import { useSteps } from '../hooks/useSteps';
import { useStepHistory } from '../hooks/useStepHistory';
import { useAnalytics } from '../hooks/useAnalytics';
import { estimateCalories, estimateDistanceKm, estimateActiveMinutes } from '../utils/normalize';
import LiquidScreenWrapper from '../components/LiquidScreenWrapper';
import LiquidSection from '../components/LiquidSection';
import { Colors, FontSize, FontWeight, BorderRadius } from '../theme/theme';

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
  const isFocused = useIsFocused();
  const pageOpacity = useSharedValue(0);
  const pageTranslateX = useSharedValue(-25);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {
    steps,
    previousSteps,
    goal,
    loading,
    error,
    lastUpdated,
    isSimulating,
    refresh: refreshSteps,
    addSteps,
    toggleSimulateWalk,
  } = useSteps();

  const { history, refresh: refreshHistory } = useStepHistory();
  const { analytics, loading: analyticsLoading } = useAnalytics(history, goal);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [, setTick] = useState<number>(0);

  // Tab transition on focus
  useEffect(() => {
    if (isFocused) {
      pageOpacity.value = withTiming(1, { duration: 300 });
      pageTranslateX.value = withSpring(0, { damping: 18, stiffness: 140 });
    } else {
      pageOpacity.value = 0;
      pageTranslateX.value = -25;
    }
  }, [isFocused]);

  const pageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pageOpacity.value,
    transform: [{ translateX: pageTranslateX.value }],
  }));

  // Pulse the live dot
  const liveDotOpacity = useSharedValue(1);
  useEffect(() => {
    liveDotOpacity.value = withRepeat(
      withTiming(0.2, { duration: 900 }),
      -1,
      true,
    );
  }, [liveDotOpacity]);

  const liveDotStyle = useAnimatedStyle(() => ({
    opacity: liveDotOpacity.value,
  }));

  // Update "time since" every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => setTick((t: number) => t + 1), 5000);
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
  const pace = activeMin > 0 ? Math.round(steps / activeMin) : 0;

  const getScoreTier = (score: number) => {
    if (score >= 85) return { label: 'OPTIMAL', color: '#00F5FF' };
    if (score >= 65) return { label: 'HEALTHY', color: '#9D00FF' };
    if (score >= 45) return { label: 'MODERATE', color: '#FF9900' };
    return { label: 'LOW ACTIVITY', color: '#FF0055' };
  };

  const scoreTier = getScoreTier(analytics?.wellnessScore || 0);

  const visibleInsights = (analytics?.insights || []).filter(
    (_insight: any, index: number) => !dismissedInsights.includes(String(index))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidScreenWrapper>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F5FF" />}
          showsVerticalScrollIndicator={false}
        >
        {/* ── Top Bar ── */}
        <LiquidSection delay={40} style={styles.topBar}>
          <View style={styles.brandCapsule}>
            <Text style={styles.brandIcon}>⚡</Text>
            <Text style={styles.brandTitle}>VIBEWALK</Text>
          </View>
          <View style={styles.dateCapsule}>
            <Text style={styles.dateCapsuleText}>{getFormattedDate()}</Text>
          </View>
          <View style={styles.liveCapsule}>
            <Animated.View style={[styles.liveDot, liveDotStyle]} />
            <Text style={styles.liveCapsuleText}>{isSimulating ? 'SIMULATING' : 'LIVE'}</Text>
          </View>
        </LiquidSection>

        {/* ── Header Greeting ── */}
        <LiquidSection delay={80} style={styles.greetingHeader}>
          <Text style={styles.greetingTitle}>{getGreeting()}, Walker 👋</Text>
          <Text style={styles.greetingSub}>
            {lastUpdated ? `Sync: ${getTimeSince(lastUpdated)}` : 'Syncing pedometer...'}
          </Text>
        </LiquidSection>

        {/* ── Hero Concentric Dial ── */}
        <LiquidSection delay={120}>
          <StepRing steps={steps || 0} goal={goal || 10000} previousSteps={previousSteps} />
        </LiquidSection>

        {/* ── Action Control Dock ── */}
        <LiquidSection delay={160} style={styles.actionDockRow}>
          <Pressable style={styles.dockButton} onPress={() => addSteps(100)}>
            <Text style={styles.dockButtonIcon}>⚡</Text>
            <Text style={styles.dockButtonText}>+100 Steps</Text>
          </Pressable>
          <Pressable
            style={[styles.dockButton, isSimulating ? styles.dockButtonActive : null]}
            onPress={toggleSimulateWalk}
          >
            <Text style={styles.dockButtonIcon}>{isSimulating ? '⏸' : '▶'}</Text>
            <Text style={[styles.dockButtonText, isSimulating ? styles.dockButtonActiveText : null]}>
              {isSimulating ? 'Pause Walk' : 'Auto Walk'}
            </Text>
          </Pressable>
        </LiquidSection>

        {/* ── 4-Grid Activity Dashboard Cards ── */}
        <LiquidSection delay={200} style={styles.metricsGrid}>
          {/* Calories Card */}
          <View style={[styles.metricCard, styles.metricCardCalories]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>🔥</Text>
              <Text style={styles.metricTag}>CALORIES</Text>
            </View>
            <Text style={styles.metricValue}>{calories}</Text>
            <Text style={styles.metricSubLabel}>kcal burned</Text>
            <View style={styles.metricMiniTrack}>
              <View style={[styles.metricMiniFill, { width: `${Math.min((calories / 400) * 100, 100)}%`, backgroundColor: '#FF007A' }]} />
            </View>
          </View>

          {/* Distance Card */}
          <View style={[styles.metricCard, styles.metricCardDistance]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>📏</Text>
              <Text style={styles.metricTag}>DISTANCE</Text>
            </View>
            <Text style={styles.metricValue}>{distance.toFixed(1)}</Text>
            <Text style={styles.metricSubLabel}>kilometers</Text>
            <View style={styles.metricMiniTrack}>
              <View style={[styles.metricMiniFill, { width: `${Math.min((distance / 8) * 100, 100)}%`, backgroundColor: '#00F5FF' }]} />
            </View>
          </View>

          {/* Active Min Card */}
          <View style={[styles.metricCard, styles.metricCardActive]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>⏱</Text>
              <Text style={styles.metricTag}>ACTIVE TIME</Text>
            </View>
            <Text style={styles.metricValue}>{activeMin}</Text>
            <Text style={styles.metricSubLabel}>active mins</Text>
            <View style={styles.metricMiniTrack}>
              <View style={[styles.metricMiniFill, { width: `${Math.min((activeMin / 60) * 100, 100)}%`, backgroundColor: '#9D00FF' }]} />
            </View>
          </View>

          {/* Cadence Pace Card */}
          <View style={[styles.metricCard, styles.metricCardPace]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>⚡</Text>
              <Text style={styles.metricTag}>WALK PACE</Text>
            </View>
            <Text style={styles.metricValue}>{pace}</Text>
            <Text style={styles.metricSubLabel}>steps / min</Text>
            <View style={styles.metricMiniTrack}>
              <View style={[styles.metricMiniFill, { width: `${Math.min((pace / 120) * 100, 100)}%`, backgroundColor: '#FF9900' }]} />
            </View>
          </View>
        </LiquidSection>

        {/* ── Wellness Performance Gauge ── */}
        <LiquidSection delay={240} style={styles.performanceCard}>
          <View style={styles.performanceLeft}>
            <Text style={styles.performanceTitle}>Wellness Performance</Text>
            <Text style={styles.performanceSubtitle}>Based on 30-day activity trend</Text>
            <View style={[styles.tierTag, { backgroundColor: `${scoreTier.color}15`, borderColor: `${scoreTier.color}40` }]}>
              <Text style={[styles.tierTagText, { color: scoreTier.color }]}>{scoreTier.label}</Text>
            </View>
          </View>
          <View style={[styles.scoreDial, { borderColor: scoreTier.color }]}>
            <Text style={[styles.scoreDialNumber, { color: scoreTier.color }]}>
              {analytics?.wellnessScore || 0}
            </Text>
            <Text style={styles.scoreDialLabel}>SCORE</Text>
          </View>
        </LiquidSection>

        {/* ── Health Platform Sync Banner ── */}
        <LiquidSection delay={280}>
          <HealthSyncBanner />
        </LiquidSection>

        {/* ── System Widget Preview Card ── */}
        <LiquidSection delay={320}>
          <WidgetPreviewCard
            steps={steps}
            goal={goal}
            streakDays={analytics?.streakDays || 0}
          />
        </LiquidSection>

        {/* ── AI Insights ── */}
        <LiquidSection delay={360} style={styles.insightsSection}>
          <View style={styles.insightsHeader}>
            <Text style={styles.sectionTitle}>Smart Insights</Text>
            <Text style={styles.insightsBadge}>AI ANALYTICS</Text>
          </View>

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
                onDismiss={() => setDismissedInsights((prev: string[]) => [...prev, String(index)])}
              />
            ))
          ) : (
            <View style={styles.emptyInsights}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyTitle}>Insights Synchronized</Text>
              <Text style={styles.emptyDescription}>
                Keep walking! Insights will update as we process your activity patterns over time.
              </Text>
            </View>
          )}
        </LiquidSection>

        {/* Spacer for bottom tab bar */}
        <View style={{ height: 24 }} />
      </ScrollView>
      </LiquidScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090F',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  brandCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141422',
    borderColor: 'rgba(0, 245, 255, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  brandIcon: {
    fontSize: 12,
  },
  brandTitle: {
    color: '#00F5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  dateCapsule: {
    backgroundColor: '#12121A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateCapsuleText: {
    color: '#A0A0C0',
    fontSize: 11,
    fontWeight: '600',
  },
  liveCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.12)',
    borderColor: 'rgba(0, 245, 255, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F5FF',
  },
  liveCapsuleText: {
    color: '#00F5FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // ── Header Greeting ──
  greetingHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greetingSub: {
    color: '#606080',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },

  // ── Action Control Dock ──
  actionDockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  dockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141422',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  dockButtonIcon: {
    fontSize: 12,
    color: '#00F5FF',
  },
  dockButtonText: {
    color: '#A0A0C0',
    fontSize: 12,
    fontWeight: '700',
  },
  dockButtonActive: {
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    borderColor: '#00F5FF',
  },
  dockButtonActiveText: {
    color: '#00F5FF',
  },

  // ── Metrics Grid ──
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#12121A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  metricCardCalories: {
    borderColor: 'rgba(255, 0, 122, 0.25)',
    backgroundColor: 'rgba(255, 0, 122, 0.05)',
  },
  metricCardDistance: {
    borderColor: 'rgba(0, 245, 255, 0.25)',
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
  },
  metricCardActive: {
    borderColor: 'rgba(157, 0, 255, 0.25)',
    backgroundColor: 'rgba(157, 0, 255, 0.05)',
  },
  metricCardPace: {
    borderColor: 'rgba(255, 153, 0, 0.25)',
    backgroundColor: 'rgba(255, 153, 0, 0.05)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricTag: {
    color: '#8080A0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricSubLabel: {
    color: '#606080',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 10,
  },
  metricMiniTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricMiniFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Performance Card ──
  performanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12121A',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  performanceLeft: {
    flex: 1,
    marginRight: 12,
  },
  performanceTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  performanceSubtitle: {
    color: '#606080',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  tierTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scoreDial: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreDialNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  scoreDialLabel: {
    fontSize: 8,
    color: '#606080',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Insights ──
  insightsSection: {
    marginTop: 4,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  insightsBadge: {
    color: '#00F5FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  skeleton: {
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    marginVertical: 6,
  },
  emptyInsights: {
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 28,
    marginVertical: 8,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDescription: {
    color: '#707090',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
