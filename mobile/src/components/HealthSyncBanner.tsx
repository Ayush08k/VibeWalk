import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/theme';
import { syncHealthPlatformData, HealthSyncStatus } from '../services/healthService';

interface HealthSyncBannerProps {
  initialStatus?: HealthSyncStatus;
}

export default function HealthSyncBanner({ initialStatus }: HealthSyncBannerProps) {
  const [syncStatus, setSyncStatus] = useState<HealthSyncStatus>(
    initialStatus || {
      platform: 'Apple Health',
      status: 'Synced',
      lastSyncedTimestamp: 'Just now',
      totalSyncedSteps: 0,
    }
  );
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const updated = await syncHealthPlatformData();
    setSyncStatus(updated);
    setSyncing(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftRow}>
        <Text style={styles.icon}>🔄</Text>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{syncStatus.platform} Sync</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{syncStatus.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Two-way sync • {syncStatus.lastSyncedTimestamp}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.syncButton}
        onPress={handleSync}
        disabled={syncing}
        activeOpacity={0.7}
      >
        {syncing ? (
          <ActivityIndicator size="small" color="#00F5FF" />
        ) : (
          <Text style={styles.syncButtonText}>Sync Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F121C',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 22,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors?.textPrimary || '#FFFFFF',
  },
  badge: {
    backgroundColor: 'rgba(0, 245, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00F5FF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F5FF',
  },
  subtitle: {
    fontSize: 11,
    color: Colors?.textTertiary || '#8080A0',
    marginTop: 2,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00F5FF',
  },
});
