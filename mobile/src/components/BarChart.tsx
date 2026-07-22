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
  const chartData = data.map((item, index) => {
    const isCurrentDay = index === data.length - 1;
    return {
      value: item.steps,
      label: index % 3 === 0 ? getDayLabel(item.date) : '',
      frontColor: isCurrentDay ? (Colors.chartBarActive || '#00E676') : (Colors.chartBarPastFill || '#333333'),
      topLabelComponent: () => null,
    };
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>30-Day Activity</Text>
      <GiftedBarChart
        data={chartData}
        height={200}
        barWidth={14}
        spacing={6}
        barBorderRadius={4}
        frontColor="#333333"
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        showScrollIndicator={false}
        referenceLine1Config={{
          value: goal,
          color: 'rgba(255, 255, 255, 0.2)',
          type: 'dashed',
        }}
        yAxisTextStyle={{ color: '#FFFFFF' }}
        xAxisLabelTextStyle={{ color: '#FFFFFF', fontSize: 10 }}
        isAnimated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glassBg || 'rgba(255,255,255,0.05)',
    borderColor: Colors.glassBorder || 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: BorderRadius?.xl || 20,
    padding: Spacing?.lg || 20,
    marginVertical: Spacing?.md || 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: FontSize?.lg || 18,
    fontWeight: FontWeight?.bold || 'bold',
    marginBottom: 20,
  },
});
