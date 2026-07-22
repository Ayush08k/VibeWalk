import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import StepRing from '../components/StepRing';
import InsightCard from '../components/InsightCard';
import { useSteps } from '../hooks/useSteps';
import { useStepHistory } from '../hooks/useStepHistory';
import { useAnalytics } from '../hooks/useAnalytics';
import { estimateCalories, estimateDistanceKm, estimateActiveMinutes } from '../utils/normalize';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/theme';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { steps, goal, refresh: refreshSteps } = useSteps();
  const { history, refresh: refreshHistory } = useStepHistory();
  const { analytics, loading } = useAnalytics(history, goal);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

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
      >
        <Text style={styles.appTitle}>VibeWalk</Text>
        
        <StepRing steps={steps || 0} goal={goal || 10000} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📏</Text>
            <Text style={styles.statValue}>{distance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Km</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.statValue}>{activeMin}</Text>
            <Text style={styles.statLabel}>Min</Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Wellness Score</Text>
          <View style={[styles.scoreBadge, { borderColor: getScoreColor(analytics?.wellnessScore || 0) }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(analytics?.wellnessScore || 0) }]}>
              {analytics?.wellnessScore || 0}
            </Text>
          </View>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {loading ? (
            <View style={styles.skeleton} />
          ) : (
            visibleInsights.map((insight: any, index: number) => (
              <InsightCard
                key={`insight-${index}`}
                insight={insight}
                onDismiss={() => setDismissedInsights(prev => [...prev, String(index)])}
              />
            ))
          )}
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
  appTitle: {
    color: '#666666',
    fontSize: FontSize?.sm || 14,
    fontWeight: FontWeight?.medium || '500',
    marginTop: 10,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: BorderRadius?.lg || 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
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
    fontSize: FontSize?.xs || 12,
    marginTop: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius?.lg || 16,
    padding: 20,
    marginBottom: 24,
  },
  scoreTitle: {
    color: '#FFFFFF',
    fontSize: FontSize?.md || 16,
    fontWeight: FontWeight?.medium || '500',
  },
  scoreBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: FontSize?.lg || 18,
    fontWeight: FontWeight?.bold || 'bold',
  },
  insightsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: FontSize?.lg || 18,
    fontWeight: FontWeight?.bold || 'bold',
    marginBottom: 12,
  },
  skeleton: {
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius?.xl || 20,
    marginVertical: 8,
  },
});
