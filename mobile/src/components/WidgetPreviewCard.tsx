import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/theme';
import { syncWidgetData, WidgetPayload } from '../services/widgetService';

interface WidgetPreviewCardProps {
  steps: number;
  goal: number;
  streakDays: number;
}

export default function WidgetPreviewCard({ steps, goal, streakDays }: WidgetPreviewCardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'lock'>('home');
  const [synced, setSynced] = useState(false);

  const ratio = Math.min(100, Math.round((steps / (goal || 10000)) * 100));

  const handleExportWidget = async () => {
    await syncWidgetData(steps, goal, streakDays);
    setSynced(true);
    setTimeout(() => setSynced(false), 3000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.headerIcon}>📱</Text>
          <Text style={styles.title}>System Widgets</Text>
        </View>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'home' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('home')}
          >
            <Text style={[styles.toggleText, activeTab === 'home' && styles.toggleTextActive]}>
              Home Screen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'lock' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('lock')}
          >
            <Text style={[styles.toggleText, activeTab === 'lock' && styles.toggleTextActive]}>
              Lock Screen
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Widget Visual Mockup */}
      <View style={styles.previewBox}>
        {activeTab === 'home' ? (
          <View style={styles.homeWidgetCard}>
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetBrand}>👟 VibeWalk Widget</Text>
              <Text style={styles.widgetStreak}>🔥 {streakDays}d streak</Text>
            </View>
            <View style={styles.widgetBody}>
              <View style={styles.miniRing}>
                <Text style={styles.miniRingText}>{ratio}%</Text>
              </View>
              <View>
                <Text style={styles.widgetSteps}>{steps.toLocaleString()}</Text>
                <Text style={styles.widgetSub}>/ {goal.toLocaleString()} target steps</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.lockWidgetCard}>
            <Text style={styles.lockIcon}>⚡</Text>
            <View style={styles.lockTextGroup}>
              <Text style={styles.lockMain}>{steps.toLocaleString()} STEPS</Text>
              <Text style={styles.lockSub}>{ratio}% of daily goal completed</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleExportWidget}
        activeOpacity={0.7}
      >
        <Text style={styles.actionButtonText}>
          {synced ? '✅ Widget Sync Complete' : '⚙️ Sync System Widget Data'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F121C',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#00F5FF',
  },
  toggleText: {
    fontSize: 10,
    color: '#8080A0',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#09090F',
  },
  previewBox: {
    marginBottom: 14,
  },
  homeWidgetCard: {
    backgroundColor: 'rgba(9, 9, 15, 0.85)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#00F5FF',
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  widgetBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00F5FF',
  },
  widgetStreak: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF007A',
  },
  widgetBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  miniRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#00F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
  },
  miniRingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  widgetSteps: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  widgetSub: {
    fontSize: 11,
    color: '#8080A0',
  },
  lockWidgetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockIcon: {
    fontSize: 20,
  },
  lockTextGroup: {
    flex: 1,
  },
  lockMain: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  lockSub: {
    fontSize: 11,
    color: '#00F5FF',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 245, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00F5FF',
  },
});
