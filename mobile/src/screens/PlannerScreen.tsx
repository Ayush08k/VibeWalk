import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LiquidScreenWrapper from '../components/LiquidScreenWrapper';
import LiquidSection from '../components/LiquidSection';
import { planWalk, WalkPlanResponse } from '../services/apiService';
import { Colors } from '../theme/theme';

export default function PlannerScreen() {
  const [stepInput, setStepInput] = useState('3000');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WalkPlanResponse | null>(null);

  const handleGeneratePlan = async (stepsToPlan?: number) => {
    const target = stepsToPlan || parseInt(stepInput, 10) || 3000;
    setLoading(true);
    const result = await planWalk(target);
    setPlan(result);
    setLoading(false);
  };

  React.useEffect(() => {
    handleGeneratePlan(3000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LiquidScreenWrapper>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LiquidSection delay={40} style={styles.header}>
            <Text style={styles.headerTag}>🤖 AI INSIGHT ENGINE</Text>
            <Text style={styles.title}>AI Route & Walk Planner</Text>
            <Text style={styles.subtitle}>
              Enter your desired step target to generate optimal walking duration, calories burned, and circadian time windows.
            </Text>
          </LiquidSection>

          {/* Input Card */}
          <LiquidSection delay={100} style={styles.inputCard}>
            <Text style={styles.inputLabel}>TARGET STEP COUNT</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={stepInput}
                onChangeText={setStepInput}
                placeholder="e.g. 3000"
                placeholderTextColor="#606080"
              />
              <TouchableOpacity
                style={styles.generateButton}
                onPress={() => handleGeneratePlan()}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#09090F" size="small" />
                ) : (
                  <Text style={styles.generateButtonText}>⚡ Plan Walk</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetRow}>
              {[1500, 3000, 5000, 8000].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={styles.presetChip}
                  onPress={() => {
                    setStepInput(preset.toString());
                    handleGeneratePlan(preset);
                  }}
                >
                  <Text style={styles.presetChipText}>{preset.toLocaleString()} steps</Text>
                </TouchableOpacity>
              ))}
            </View>
          </LiquidSection>

          {/* Results Overview */}
          {plan && (
            <>
              <LiquidSection delay={160} style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{plan.estimatedDurationMins}m</Text>
                  <Text style={styles.metricLabel}>EST. DURATION</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricValue, { color: '#FF007A' }]}>
                    {plan.estimatedCalories} kcal
                  </Text>
                  <Text style={styles.metricLabel}>EST. CALORIES</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricValue, { color: '#9D00FF' }]}>
                    {plan.distanceKm} km
                  </Text>
                  <Text style={styles.metricLabel}>DISTANCE</Text>
                </View>
              </LiquidSection>

              {/* Ideal Time Windows */}
              <LiquidSection delay={220} style={styles.section}>
                <Text style={styles.sectionTitle}>🕒 Recommended Time Windows</Text>
                {plan.recommendedTimeWindows.map((tw, idx) => (
                  <View key={idx} style={styles.timeWindowCard}>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>{tw.time}</Text>
                    </View>
                    <View style={styles.timeWindowContent}>
                      <Text style={styles.timeLabel}>{tw.label}</Text>
                      <Text style={styles.timeReason}>{tw.reason}</Text>
                    </View>
                  </View>
                ))}
              </LiquidSection>

              {/* Suggested Routes */}
              <LiquidSection delay={280} style={styles.section}>
                <Text style={styles.sectionTitle}>🛣️ Suggested Neighborhood Routes</Text>
                {plan.suggestedRoutes.map((route, idx) => (
                  <View key={idx} style={styles.routeCard}>
                    <View style={styles.routeHeader}>
                      <Text style={styles.routeTitle}>{route.title}</Text>
                      <Text style={styles.routeDist}>{route.distanceKm} km</Text>
                    </View>
                    <Text style={styles.routeDesc}>{route.description}</Text>
                    <View style={styles.surfaceTag}>
                      <Text style={styles.surfaceTagText}>Surface: {route.surface}</Text>
                    </View>
                  </View>
                ))}
              </LiquidSection>
            </>
          )}
        </ScrollView>
      </LiquidScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors?.background || '#09090F',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F5FF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#8080A0',
    lineHeight: 18,
  },
  inputCard: {
    backgroundColor: '#0F121C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8080A0',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  generateButton: {
    backgroundColor: '#00F5FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090F',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetChipText: {
    fontSize: 11,
    color: '#00F5FF',
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0F121C',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00F5FF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8080A0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  timeWindowCard: {
    backgroundColor: '#0F121C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeBadge: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F5FF',
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F5FF',
  },
  timeWindowContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeReason: {
    fontSize: 11,
    color: '#8080A0',
    marginTop: 2,
  },
  routeCard: {
    backgroundColor: '#0F121C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  routeDist: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9D00FF',
  },
  routeDesc: {
    fontSize: 12,
    color: '#8080A0',
    marginBottom: 8,
  },
  surfaceTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  surfaceTagText: {
    fontSize: 10,
    color: '#A0A0C0',
  },
});
