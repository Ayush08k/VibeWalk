import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import BarChart from '../components/BarChart';
import LiquidScreenWrapper from '../components/LiquidScreenWrapper';
import LiquidSection from '../components/LiquidSection';
import { useStepHistory } from '../hooks/useStepHistory';
import { useAnalytics } from '../hooks/useAnalytics';
import { DEFAULT_STEP_GOAL, FontSize, FontWeight } from '../theme/theme';

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function HistoryScreen() {
  const isFocused = useIsFocused();
  const pageOpacity = useSharedValue(0);
  const pageTranslateX = useSharedValue(25);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(6); // Default to today
  const { history, refresh: refreshHistory } = useStepHistory();
  const goal = DEFAULT_STEP_GOAL;
  const { analytics } = useAnalytics(history, goal);

  const bestDay = analytics?.bestDay || { date: 'N/A', steps: 0 };
  const totalSteps = analytics?.totalSteps || 0;
  const avgSteps = analytics?.averageSteps || 0;
  const streak = analytics?.streakDays || 0;

  // Tab transition on focus
  useEffect(() => {
    if (isFocused) {
      pageOpacity.value = withTiming(1, { duration: 300 });
      pageTranslateX.value = withSpring(0, { damping: 18, stiffness: 140 });
    } else {
      pageOpacity.value = 0;
      pageTranslateX.value = 25;
    }
  }, [isFocused]);

  const pageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pageOpacity.value,
    transform: [{ translateX: pageTranslateX.value }],
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHistory?.();
    setRefreshing(false);
  };

  // Build current week data (last 7 days)
  const weekData = history.slice(-7);
  const selectedDayData = selectedDayIndex !== null ? weekData[selectedDayIndex] : weekData[6];

  const formatBestDay = (dateStr: string): string => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidScreenWrapper>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F5FF" />}
          showsVerticalScrollIndicator={false}
        >
        {/* ── Top Title ── */}
        <LiquidSection delay={40} style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Activity Analytics</Text>
            <Text style={styles.subtitle}>30-Day Activity & Weekly Trends</Text>
          </View>
          <View style={styles.trophyBadge}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
        </LiquidSection>

        {/* ── Interactive 7-Day Week Selector ── */}
        <LiquidSection delay={100} style={styles.weekCard}>
          <View style={styles.weekCardHeader}>
            <Text style={styles.weekTitle}>Weekly Performance</Text>
            {selectedDayData && (
              <Text style={styles.selectedDayPill}>
                {selectedDayData.date}: <Text style={styles.selectedDayVal}>{selectedDayData.steps.toLocaleString()} steps</Text>
              </Text>
            )}
          </View>

          <View style={styles.weekDots}>
            {WEEKDAY_LABELS.map((label, index) => {
              const dayData = weekData[index];
              const steps = dayData?.steps || 0;
              const ratio = steps / (goal || 1);
              const isSelected = selectedDayIndex === index;

              let dotColor = '#1A1A28';
              if (steps > 0) {
                if (ratio >= 1) dotColor = '#00F5FF';
                else if (ratio >= 0.5) dotColor = '#9D00FF';
                else dotColor = '#FF0055';
              }

              return (
                <Pressable
                  key={`week-${index}`}
                  style={[styles.weekDayCol, isSelected ? styles.weekDayColSelected : null]}
                  onPress={() => setSelectedDayIndex(index)}
                >
                  <View style={[styles.weekDot, { backgroundColor: dotColor }, isSelected ? styles.weekDotSelected : null]} />
                  <Text style={[styles.weekDayLabel, isSelected ? styles.weekDayLabelSelected : null]}>{label}</Text>
                  {steps > 0 ? (
                    <Text style={[styles.weekDaySteps, isSelected ? styles.weekDayStepsSelected : null]}>
                      {(steps / 1000).toFixed(1)}k
                    </Text>
                  ) : (
                    <Text style={styles.weekDaySteps}>-</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </LiquidSection>

        {/* ── 30-Day Bar Chart ── */}
        <LiquidSection delay={160}>
          <BarChart data={history || []} goal={goal || 10000} />
        </LiquidSection>

        {/* ── 4-Grid Achievements ── */}
        <LiquidSection delay={220} style={styles.gridContainer}>
          <View style={styles.gridCard}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridIcon}>📊</Text>
              <Text style={styles.gridTag}>AVERAGE</Text>
            </View>
            <Text style={styles.gridValue}>{Math.round(avgSteps).toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Daily Avg Steps</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridIcon}>🏆</Text>
              <Text style={styles.gridTag}>BEST DAY</Text>
            </View>
            <Text style={styles.gridValue}>{bestDay.steps.toLocaleString()}</Text>
            <Text style={styles.gridLabel}>{formatBestDay(bestDay.date)} Record</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridIcon}>Σ</Text>
              <Text style={styles.gridTag}>VOLUME</Text>
            </View>
            <Text style={styles.gridValue}>{totalSteps.toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Total (30 Days)</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridIcon}>🔥</Text>
              <Text style={styles.gridTag}>STREAK</Text>
            </View>
            <Text style={[styles.gridValue, streak >= 3 ? { color: '#00F5FF' } : null]}>{streak} Days</Text>
            <Text style={styles.gridLabel}>Goal Streak</Text>
          </View>
        </LiquidSection>

        {/* ── Weekly Comparison Split Card ── */}
        <LiquidSection delay={280} style={styles.comparisonCard}>
          <View style={styles.comparisonHeader}>
            <View>
              <Text style={styles.comparisonTitle}>Weekly Pace Comparison</Text>
              <Text style={styles.comparisonSubtitle}>
                {analytics?.trend === 'up' ? '📈 Walking activity is trending UP' : analytics?.trend === 'down' ? '📉 Activity dropped this week' : '➡️ Walking pace is stable'}
              </Text>
            </View>
            <View style={[styles.trendBadge, { borderColor: analytics?.trend === 'up' ? 'rgba(0, 245, 255, 0.4)' : analytics?.trend === 'down' ? 'rgba(255, 0, 85, 0.4)' : 'rgba(255, 255, 255, 0.1)' }]}>
              <Text style={[styles.trendIcon, { color: analytics?.trend === 'up' ? '#00F5FF' : analytics?.trend === 'down' ? '#FF0055' : '#606080' }]}>
                {analytics?.trend === 'up' ? '↗' : analytics?.trend === 'down' ? '↘' : '→'}
              </Text>
              <Text style={[styles.trendText, { color: analytics?.trend === 'up' ? '#00F5FF' : analytics?.trend === 'down' ? '#FF0055' : '#606080' }]}>
                {Math.abs(analytics?.weeklyComparison?.changePercent || 0)}%
              </Text>
            </View>
          </View>

          <View style={styles.comparisonBars}>
            <View style={styles.compBarItem}>
              <View style={styles.compBarInfo}>
                <Text style={styles.compBarLabel}>THIS WEEK</Text>
                <Text style={styles.compBarValue}>{(analytics?.weeklyComparison?.thisWeekAvg || 0).toLocaleString()} avg</Text>
              </View>
              <View style={styles.compTrack}>
                <View style={[styles.compFill, { width: `${Math.min(((analytics?.weeklyComparison?.thisWeekAvg || 0) / (goal || 10000)) * 100, 100)}%`, backgroundColor: '#00F5FF' }]} />
              </View>
            </View>

            <View style={styles.compBarItem}>
              <View style={styles.compBarInfo}>
                <Text style={styles.compBarLabel}>LAST WEEK</Text>
                <Text style={styles.compBarValue}>{(analytics?.weeklyComparison?.lastWeekAvg || 0).toLocaleString()} avg</Text>
              </View>
              <View style={styles.compTrack}>
                <View style={[styles.compFill, { width: `${Math.min(((analytics?.weeklyComparison?.lastWeekAvg || 0) / (goal || 10000)) * 100, 100)}%`, backgroundColor: '#9D00FF' }]} />
              </View>
            </View>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#606080',
    marginTop: 2,
  },
  trophyBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#12121A',
    borderColor: 'rgba(0, 245, 255, 0.2)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyIcon: {
    fontSize: 20,
  },

  // ── Weekly ──
  weekCard: {
    backgroundColor: '#12121A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  weekCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  weekTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  selectedDayPill: {
    color: '#8080A0',
    fontSize: 10,
    fontWeight: '600',
  },
  selectedDayVal: {
    color: '#00F5FF',
    fontWeight: '800',
  },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayCol: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    gap: 6,
  },
  weekDayColSelected: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    borderColor: 'rgba(0, 245, 255, 0.3)',
    borderWidth: 1,
  },
  weekDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  weekDotSelected: {
    transform: [{ scale: 1.15 }],
  },
  weekDayLabel: {
    color: '#606080',
    fontSize: 9,
    fontWeight: '800',
  },
  weekDayLabelSelected: {
    color: '#00F5FF',
  },
  weekDaySteps: {
    color: '#404055',
    fontSize: 9,
  },
  weekDayStepsSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Grid ──
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#12121A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gridIcon: {
    fontSize: 16,
  },
  gridTag: {
    color: '#8080A0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gridValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  gridLabel: {
    color: '#606080',
    fontSize: 10,
    marginTop: 2,
  },

  // ── Comparison ──
  comparisonCard: {
    backgroundColor: '#12121A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  comparisonTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  comparisonSubtitle: {
    color: '#606080',
    fontSize: 11,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  trendIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  trendText: {
    fontSize: 13,
    fontWeight: '800',
  },
  comparisonBars: {
    gap: 14,
  },
  compBarItem: {},
  compBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  compBarLabel: {
    color: '#8080A0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  compBarValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  compTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  compFill: {
    height: '100%',
    borderRadius: 3,
  },
});
