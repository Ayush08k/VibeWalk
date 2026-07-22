import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import BarChart from '../components/BarChart';
import { useStepHistory } from '../hooks/useStepHistory';
import { useAnalytics } from '../hooks/useAnalytics';
import { DEFAULT_STEP_GOAL, Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/theme';

export default function HistoryScreen() {
  const { history } = useStepHistory();
  const goal = DEFAULT_STEP_GOAL;
  const { analytics } = useAnalytics(history, goal);

  const bestDay = analytics?.bestDay || { date: 'N/A', steps: 0 };
  const totalSteps = analytics?.totalSteps || 0;
  const avgSteps = analytics?.averageSteps || 0;
  const streak = analytics?.streakDays || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Activity History</Text>
        
        <BarChart data={history || []} goal={goal || 10000} />

        <View style={styles.gridContainer}>
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>📊</Text>
            <Text style={styles.gridValue}>{Math.round(avgSteps).toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Avg Daily Steps</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>🏆</Text>
            <Text style={styles.gridValue}>{bestDay.steps.toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Best Day ({bestDay.date})</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>Σ</Text>
            <Text style={styles.gridValue}>{totalSteps.toLocaleString()}</Text>
            <Text style={styles.gridLabel}>Total (30d)</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridIcon}>🔥</Text>
            <Text style={styles.gridValue}>{streak} Days</Text>
            <Text style={styles.gridLabel}>Goal Streak</Text>
          </View>
        </View>

        <View style={styles.comparisonCard}>
          <View>
            <Text style={styles.comparisonTitle}>This Week vs Last Week</Text>
            <Text style={styles.comparisonSubtitle}>
              {analytics?.trend === 'up' ? 'Great progress!' : 'Keep pushing!'}
            </Text>
          </View>
          <View style={styles.trendBadge}>
            <Text style={[styles.trendIcon, { color: analytics?.trend === 'up' ? '#00E676' : '#FF1744' }]}>
              {analytics?.trend === 'up' ? '↗' : '↘'}
            </Text>
            <Text style={[styles.trendText, { color: analytics?.trend === 'up' ? '#00E676' : '#FF1744' }]}>
              {analytics?.weeklyComparison?.changePercent || 0}%
            </Text>
          </View>
        </View>

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
    padding: Spacing?.md || 16,
  },
  title: {
    fontSize: FontSize?.xxl || 28,
    fontWeight: FontWeight?.bold || 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    marginTop: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: BorderRadius?.lg || 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  gridIcon: {
    fontSize: 20,
    marginBottom: 12,
  },
  gridValue: {
    color: '#FFFFFF',
    fontSize: FontSize?.lg || 20,
    fontWeight: FontWeight?.bold || 'bold',
    marginBottom: 4,
  },
  gridLabel: {
    color: '#AAAAAA',
    fontSize: FontSize?.xs || 12,
  },
  comparisonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(68, 138, 255, 0.1)',
    borderColor: 'rgba(68, 138, 255, 0.3)',
    borderWidth: 1,
    borderRadius: BorderRadius?.lg || 16,
    padding: 20,
    marginTop: 8,
  },
  comparisonTitle: {
    color: '#FFFFFF',
    fontSize: FontSize?.md || 16,
    fontWeight: FontWeight?.medium || '500',
    marginBottom: 4,
  },
  comparisonSubtitle: {
    color: '#888888',
    fontSize: FontSize?.sm || 14,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
