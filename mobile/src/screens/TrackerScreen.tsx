import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import SplitTableCard from '../components/SplitTableCard';
import LiquidScreenWrapper from '../components/LiquidScreenWrapper';
import LiquidSection from '../components/LiquidSection';
import { calculateSplits, generateMockRoutePoints, SplitRecord } from '../services/gpsService';
import { Colors } from '../theme/theme';

export default function TrackerScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationSecs, setDurationSecs] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [calories, setCalories] = useState(0);
  const [cadenceSpm, setCadenceSpm] = useState(0);
  const [elevationGainM, setElevationGainM] = useState(0);
  const [splits, setSplits] = useState<SplitRecord[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => {
        setDurationSecs((prev) => {
          const nextSecs = prev + 1;

          // Increment simulated GPS telemetry metrics smoothly
          const distInc = 0.00135; // ~1.35m per sec = 4.86 km/h
          const nextDist = Number((distanceKm + distInc).toFixed(3));
          setDistanceKm(nextDist);

          setCalories(Math.round(nextDist * 52));
          setCadenceSpm(104 + Math.round(Math.sin(nextSecs) * 6));
          setElevationGainM(Math.floor(nextDist * 8));

          // Recalculate splits
          const computedSplits = calculateSplits(nextDist, nextSecs, 104, 52);
          setSplits(computedSplits);

          return nextSecs;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused, distanceKm]);

  const handleStart = () => {
    setIsTracking(true);
    setIsPaused(false);
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStop = () => {
    setIsTracking(false);
    setIsPaused(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentPaceMinsPerKm = () => {
    if (distanceKm <= 0 || durationSecs <= 0) return `0'00"`;
    const paceSecs = durationSecs / distanceKm;
    const pm = Math.floor(paceSecs / 60);
    const ps = Math.round(paceSecs % 60);
    return `${pm}'${ps < 10 ? '0' : ''}${ps}"`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LiquidScreenWrapper>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LiquidSection delay={40} style={styles.header}>
            <Text style={styles.headerTag}>📍 GPS OUTDOOR TELEMETRY</Text>
            <Text style={styles.title}>Live GPS Walk / Run</Text>
            <Text style={styles.subtitle}>
              Real-time outdoor telemetry with interactive route path map, pace splits, and cadence tracking.
            </Text>
          </LiquidSection>

          {/* Hero Telemetry Card */}
          <LiquidSection delay={100} style={styles.heroCard}>
            <Text style={styles.heroDistance}>{distanceKm.toFixed(2)}</Text>
            <Text style={styles.heroUnit}>KILOMETERS</Text>

            <View style={styles.telemetryGrid}>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryVal}>{formatTimer(durationSecs)}</Text>
                <Text style={styles.telemetryLabel}>DURATION</Text>
              </View>
              <View style={styles.telemetryItem}>
                <Text style={[styles.telemetryVal, { color: '#00F5FF' }]}>
                  {currentPaceMinsPerKm()}
                </Text>
                <Text style={styles.telemetryLabel}>PACE / KM</Text>
              </View>
              <View style={styles.telemetryItem}>
                <Text style={[styles.telemetryVal, { color: '#FF007A' }]}>
                  {calories}
                </Text>
                <Text style={styles.telemetryLabel}>CALORIES</Text>
              </View>
            </View>
          </LiquidSection>

          {/* SVG Live GPS Route Map */}
          <LiquidSection delay={160} style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>🌐 Interactive Route Map</Text>
              <View style={styles.liveBadge}>
                <View style={[styles.liveDot, isTracking && !isPaused && styles.activeLiveDot]} />
                <Text style={styles.liveBadgeText}>
                  {isTracking ? (isPaused ? 'PAUSED' : 'LIVE GPS') : 'STANDBY'}
                </Text>
              </View>
            </View>

            <View style={styles.svgWrapper}>
              <Svg width="100%" height={160} viewBox="0 0 320 160">
                <Defs>
                  <LinearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#00F5FF" stopOpacity="0.3" />
                    <Stop offset="50%" stopColor="#00F5FF" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#9D00FF" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                {/* Circuit Track SVG Path */}
                <Path
                  d="M 20 130 C 50 40, 100 140, 160 80 C 220 20, 270 120, 300 50"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <Path
                  d="M 20 130 C 50 40, 100 140, 160 80 C 220 20, 270 120, 300 50"
                  fill="none"
                  stroke="url(#pathGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                />
                {/* Start Pin */}
                <Circle cx="20" cy="130" r="6" fill="#39FF14" />
                {/* Live Position Marker */}
                <Circle cx="160" cy="80" r="8" fill="#00F5FF" />
                <Circle cx="160" cy="80" r="14" fill="rgba(0, 245, 255, 0.25)" />
              </Svg>
            </View>

            <View style={styles.mapFooter}>
              <Text style={styles.footerInfo}>⚡ Cadence: {cadenceSpm} spm</Text>
              <Text style={styles.footerInfo}>📈 Elev Gain: +{elevationGainM} m</Text>
            </View>
          </LiquidSection>

          {/* Start / Pause / Stop Action Controls */}
          <LiquidSection delay={220} style={styles.controlRow}>
            {!isTracking ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>▶ START GPS SESSION</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeControls}>
                <TouchableOpacity
                  style={[styles.pauseButton, isPaused && styles.resumeButton]}
                  onPress={handlePauseToggle}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pauseButtonText}>
                    {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={handleStop}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stopButtonText}>⏹ FINISH</Text>
                </TouchableOpacity>
              </View>
            )}
          </LiquidSection>

          {/* Per-Kilometer Interval Splits Table */}
          <LiquidSection delay={280}>
            <SplitTableCard splits={splits.length > 0 ? splits : calculateSplits(2.4, 780, 105, 120)} />
          </LiquidSection>
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
    marginBottom: 16,
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
  heroCard: {
    backgroundColor: '#0F121C',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#00F5FF',
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  heroDistance: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F5FF',
    letterSpacing: 2,
    marginBottom: 16,
  },
  telemetryGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  telemetryVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8080A0',
  },
  mapContainer: {
    backgroundColor: '#0F121C',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8080A0',
  },
  activeLiveDot: {
    backgroundColor: '#39FF14',
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  svgWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerInfo: {
    fontSize: 11,
    color: '#A0A0C0',
    fontWeight: '600',
  },
  controlRow: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#00F5FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#09090F',
    letterSpacing: 0.5,
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FF9900',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#00F5FF',
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#09090F',
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#FF007A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
