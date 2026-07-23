import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import { DailyStepRecord, getDayLabel } from '../utils/normalize';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../theme/theme';

interface BarChartProps {
  data: DailyStepRecord[];
  goal: number;
}

export default function BarChart({ data, goal }: BarChartProps) {
  // Calculate summary stats for the header
  const totalSteps = data.reduce((sum, d) => sum + d.steps, 0);
  const avgSteps = data.length > 0 ? Math.round(totalSteps / data.length) : 0;

  const chartData = data.map((item, index) => {
    const isCurrentDay = index === data.length - 1;
    const ratio = item.steps / (goal || 1);

    // Color coding: green if goal met, orange if below 50%, grey for past days
    let barColor;
    if (isCurrentDay) {
      barColor = ratio >= 1 ? '#00E676' : ratio >= 0.5 ? '#00E676' : '#FF6D00';
    } else if (ratio >= 1) {
      barColor = 'rgba(0, 230, 118, 0.7)'; // goal met — green
    } else if (ratio >= 0.5) {
      barColor = 'rgba(255, 255, 255, 0.2)'; // moderate — subtle
    } else {
      barColor = 'rgba(255, 109, 0, 0.4)'; // low — orange tint
    }

    return {
      value: item.steps,
      label: index % 5 === 0 || isCurrentDay ? getDayLabel(item.date) : '',
      frontColor: barColor,
      topLabelComponent: () => null,
      barBorderTopLeftRadius: 4,
      barBorderTopRightRadius: 4,
    };
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>30-Day Activity</Text>
        <View style={styles.avgBadge}>
          <Text style={styles.avgLabel}>Avg </Text>
          <Text style={styles.avgValue}>{avgSteps.toLocaleString()}</Text>
        </View>
      </View>
      <GiftedBarChart
        data={chartData}
        height={180}
        barWidth={12}
        spacing={5}
        barBorderRadius={3}
        frontColor="rgba(255,255,255,0.15)"
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        showReferenceLine1
        referenceLine1Position={goal}
        referenceLine1Config={{
          color: 'rgba(0, 230, 118, 0.25)',
          type: 'dashed' as const,
          dashWidth: 4,
          dashGap: 4,
        }}
        yAxisTextStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}
        xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 9 }}
        noOfSections={4}
        isAnimated
        animationDuration={600}
      />
      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#00E676' }]} />
          <Text style={styles.legendText}>Goal met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(255, 109, 0, 0.5)' }]} />
          <Text style={styles.legendText}>Low</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121214',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: BorderRadius?.xl || 20,
    padding: Spacing?.lg || 20,
    marginVertical: Spacing?.md || 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: FontSize?.lg || 18,
    fontWeight: FontWeight?.bold || 'bold',
  },
  avgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  avgLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  avgValue: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: 'bold',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
  },
});
