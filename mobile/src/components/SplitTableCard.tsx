import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/theme';
import { SplitRecord } from '../services/gpsService';

interface SplitTableCardProps {
  splits: SplitRecord[];
}

export default function SplitTableCard({ splits }: SplitTableCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⏱️</Text>
        <Text style={styles.title}>Per-Kilometer Interval Splits</Text>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, styles.colKm]}>KM</Text>
        <Text style={[styles.colHeader, styles.colPace]}>PACE (MIN/KM)</Text>
        <Text style={[styles.colHeader, styles.colSpm]}>CADENCE</Text>
        <Text style={[styles.colHeader, styles.colCal]}>CALORIES</Text>
      </View>

      {splits.map((item) => (
        <View key={item.kmNumber} style={styles.tableRow}>
          <Text style={[styles.cellText, styles.colKm, styles.kmHighlight]}>
            Km {item.kmNumber}
          </Text>
          <Text style={[styles.cellText, styles.colPace, styles.paceHighlight]}>
            {item.paceMinsPerKm}
          </Text>
          <Text style={[styles.cellText, styles.colSpm]}>
            {item.cadenceSpm} spm
          </Text>
          <Text style={[styles.cellText, styles.colCal]}>
            {item.calories} kcal
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F121C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  headerIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8080A0',
    letterSpacing: 0.5,
  },
  colKm: {
    width: '18%',
  },
  colPace: {
    width: '32%',
  },
  colSpm: {
    width: '26%',
  },
  colCal: {
    width: '24%',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  cellText: {
    fontSize: 12,
    color: '#E0E0F0',
  },
  kmHighlight: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paceHighlight: {
    fontWeight: '700',
    color: '#00F5FF',
  },
});
