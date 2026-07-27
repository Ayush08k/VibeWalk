import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCyberBadges, CyberBadge } from '../services/badgeService';
import { getTodaySteps } from '../services/healthService';
import { Colors } from '../theme/theme';

export default function BadgesScreen() {
  const [badges, setBadges] = useState<CyberBadge[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unlocked' | 'Locked'>('All');
  const [selectedBadge, setSelectedBadge] = useState<CyberBadge | null>(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    const today = await getTodaySteps();
    const result = await getCyberBadges(today, 10000, 5, 84200, 108);
    setBadges(result);
  };

  const filteredBadges = badges.filter((b) => {
    if (filter === 'Unlocked') return b.unlocked;
    if (filter === 'Locked') return !b.unlocked;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTag}>🏆 ACHIEVEMENTS & REWARDS</Text>
          <Text style={styles.title}>Cyber Badges</Text>
          <Text style={styles.subtitle}>
            Unlock holographic achievement badges as you crush daily step milestones and streak goals.
          </Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{unlockedCount} / {badges.length}</Text>
            <Text style={styles.statLabel}>BADGES UNLOCKED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#FF007A' }]}>
              {Math.round((unlockedCount / (badges.length || 1)) * 100)}%
            </Text>
            <Text style={styles.statLabel}>COMPLETION RATE</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['All', 'Unlocked', 'Locked'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filter === tab && styles.filterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Badges Grid */}
        <View style={styles.badgeGrid}>
          {filteredBadges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeCard,
                badge.unlocked && { borderColor: badge.glowColor, shadowColor: badge.glowColor },
              ]}
              onPress={() => setSelectedBadge(badge)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, !badge.unlocked && styles.lockedIconBox]}>
                <Text style={[styles.iconText, !badge.unlocked && { opacity: 0.3 }]}>
                  {badge.icon}
                </Text>
                {!badge.unlocked && <Text style={styles.lockOverlay}>🔒</Text>}
              </View>

              <Text style={styles.badgeTitle} numberOfLines={1}>
                {badge.title}
              </Text>
              <Text style={styles.badgeCategory}>{badge.category}</Text>

              {/* Mini Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${badge.progressPercent}%`,
                      backgroundColor: badge.glowColor || '#00F5FF',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>{badge.progressPercent}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={Boolean(selectedBadge)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalOverlay}>
          {selectedBadge && (
            <View style={[styles.modalCard, { borderColor: selectedBadge.glowColor }]}>
              <Text style={styles.modalIcon}>{selectedBadge.icon}</Text>
              <Text style={styles.modalTitle}>{selectedBadge.title}</Text>
              <Text style={[styles.modalStatus, { color: selectedBadge.glowColor }]}>
                {selectedBadge.unlocked ? '⚡ UNLOCKED' : '🔒 LOCKED'}
              </Text>
              <Text style={styles.modalDesc}>{selectedBadge.description}</Text>
              <View style={styles.reqBox}>
                <Text style={styles.reqLabel}>REQUIREMENT:</Text>
                <Text style={styles.reqText}>{selectedBadge.requirementText}</Text>
              </View>
              {selectedBadge.unlockedAt && (
                <Text style={styles.unlockedDate}>Unlocked on: {selectedBadge.unlockedAt}</Text>
              )}

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
    color: '#FF007A',
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
  statsCard: {
    backgroundColor: '#0F121C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00F5FF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8080A0',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: '#00F5FF',
    borderColor: '#00F5FF',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8080A0',
  },
  filterTextActive: {
    color: '#09090F',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#0F121C',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  lockedIconBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  iconText: {
    fontSize: 28,
  },
  lockOverlay: {
    position: 'absolute',
    fontSize: 14,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  badgeCategory: {
    fontSize: 10,
    color: '#8080A0',
    marginBottom: 10,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8080A0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0F121C',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  modalIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalStatus: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalDesc: {
    fontSize: 13,
    color: '#A0A0C0',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  reqBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  reqLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8080A0',
    marginBottom: 2,
  },
  reqText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unlockedDate: {
    fontSize: 11,
    color: '#00F5FF',
    marginBottom: 16,
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
