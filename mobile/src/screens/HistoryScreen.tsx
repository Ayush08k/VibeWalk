import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BarChart from '../components/BarChart';
import { useStepHistory } from '../hooks/useStepHistory';
import { useAnalytics } from '../hooks/useAnalytics';
import { DEFAULT_STEP_GOAL, Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/theme';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { history, loading, refresh: refreshHistory } = useStepHistory();
  const goal = DEFAULT_STEP_GOAL;
  const { analytics } = useAnalytics(history, goal);

  const bestDay = analytics?.bestDay || { date: 'N/A', steps: 0 };
  const totalSteps = analytics?.totalSteps || 0;
  const avgSteps = analytics?.averageSteps || 0;
  const streak = analytics?.streakDays || 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHistory?.();
    setRefreshing(false);
  };

  // Build current week data (last 7 days) for the weekly dot display
  const weekData = history.slice(-7);

  /**
   * Format best day date to a readable format: "Jul 20"
   */
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00E676" />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text entering={FadeInDown.duration(500).springify()} style={styles.title}>
          Activity History
        </Animated.Text>

        {/* ── This Week Summary ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.weekCard}>
          <Text style={styles.weekTitle}>This Week</Text>
          <View style={styles.weekDots}>
            {WEEKDAY_LABELS.map((label, index) => {
              const dayData = weekData[index];
              const steps = dayData?.steps || 0;
              const ratio = steps / (goal || 1);
              let dotColor = '#2A2A2A'; // no data
              if (steps > 0) {
                if (ratio >= 1) dotColor = '#00E676';
                else if (ratio >= 0.5) dotColor = '#FF6D00';
                else dotColor = '#FF1744';
              }
              return (
                <View key={`week-${index}`} style={styles.weekDayCol}>
                  <View style={[styles.weekDot, { backgroundColor: dotColor }]} />
                  <Text style={styles.weekDayLabel}>{label}</Text>
                  {steps > 0 && (
                    <Text style={styles.weekDaySteps}>{(steps / 1000).toFixed(1)}k</Text>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── 30-Day Bar Chart ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
          <BarChart data={history || []} goal={goal || 10000} />
        </Animated.View>

        {/* ── Stats Grid ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.gridContainer}>
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>📊</Text>
            <Text style={styles.gridValue}>{Math.round(avgSteps).toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Avg Daily Steps</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>🏆</Text>
            <Text style={styles.gridValue}>{bestDay.steps.toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Best Day ({formatBestDay(bestDay.date)})</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>Σ</Text>
            <Text style={styles.gridValue}>{totalSteps.toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Total (30d)</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>🔥</Text>
            <Text style={[styles.gridValue, streak >= 3 ? { color: '#00E676' } : null]}>{streak} Days</Text>
            <Text style={styles.gridLabel}>Goal Streak</Text>
          </View>
        </Animated.View>

        {/* ── Weekly Comparison ── */}
        <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.comparisonCard}>
          <View style={styles.comparisonLeft}>
            <Text style={styles.comparisonTitle}>This Week vs Last Week</Text>
            <Text style={styles.comparisonSubtitle}>
              {analytics?.trend === 'up' ? '📈 Great progress!' : analytics?.trend === 'down' ? '📉 Keep pushing!' : '➡️ Staying steady'}
            </Text>
            <View style={styles.comparisonStats}>
              <Text style={styles.comparisonStatText}>
                This week: <Text style={styles.comparisonStatValue}>{(analytics?.weeklyComparison?.thisWeekAvg || 0).toLocaleString()}</Text> avg
              </Text>
              <Text style={styles.comparisonStatText}>
                Last week: <Text style={styles.comparisonStatValue}>{(analytics?.weeklyComparison?.lastWeekAvg || 0).toLocaleString()}</Text> avg
              </Text>
            </View>
          </View>
          <View style={styles.trendBadge}>
            <Text style={[styles.trendIcon, { color: analytics?.trend === 'up' ? '#00E676' : analytics?.trend === 'down' ? '#FF1744' : '#888888' }]}>
              {analytics?.trend === 'up' ? '↗' : analytics?.trend === 'down' ? '↘' : '→'}
            </Text>
            <Text style={[styles.trendText, { color: analytics?.trend === 'up' ? '#00E676' : analytics?.trend === 'down' ? '#FF1744' : '#888888' }]}>
              {Math.abs(analytics?.weeklyComparison?.changePercent || 0)}%
            </Text>
          </View>
        </Animated.View>

        {/* Bottom spacer */}
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
  title: {
    fontSize: FontSize?.xxl || 28,
    fontWeight: FontWeight?.bold || 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 10,
  },
  // ── This Week ──
  weekCard: {
    backgroundColor: '#121214',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: BorderRadius?.lg || 16,
    padding: 16,
    marginBottom: 8,
  },
  weekTitle: {
    color: '#FFFFFF',
    fontSize: FontSize?.md || 14,
    fontWeight: FontWeight?.semibold || '600',
    marginBottom: 14,
  },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDayCol: {
    alignItems: 'center',
    gap: 6,
  },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  weekDayLabel: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '600',
  },
  weekDaySteps: {
    color: '#666666',
    fontSize: 9,
  },
  // ── Stats Grid ──
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#121214',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: BorderRadius?.lg || 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  gridIcon: {
    fontSize: 20,
    marginBottom: 10,
  },
  gridValue: {
    color: '#FFFFFF',
    fontSize: FontSize?.lg || 20,
    fontWeight: FontWeight?.bold || 'bold',
    marginBottom: 4,
  },
  gridLabel: {
    color: '#AAAAAA',
    fontSize: 11,
  },
  // ── Comparison Card ──
  comparisonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(68, 138, 255, 0.06)',
    borderColor: 'rgba(68, 138, 255, 0.15)',
    borderWidth: 1,
    borderRadius: BorderRadius?.lg || 16,
    padding: 20,
    marginTop: 4,
  },
  comparisonLeft: {
    flex: 1,
    marginRight: 12,
  },
  comparisonTitle: {
    color: '#FFFFFF',
    fontSize: FontSize?.md || 14,
    fontWeight: FontWeight?.semibold || '600',
    marginBottom: 4,
  },
  comparisonSubtitle: {
    color: '#888888',
    fontSize: FontSize?.sm || 12,
    marginBottom: 10,
  },
  comparisonStats: {
    gap: 2,
  },
  comparisonStatText: {
    color: '#666666',
    fontSize: 11,
  },
  comparisonStatValue: {
    color: '#AAAAAA',
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  trendIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
