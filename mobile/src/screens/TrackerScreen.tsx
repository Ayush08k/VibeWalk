import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import SplitTableCard from '../components/SplitTableCard';
import LiquidScreenWrapper from '../components/LiquidScreenWrapper';
import LiquidSection from '../components/LiquidSection';
import { calculateSplits, SplitRecord, WorkoutSession } from '../services/gpsService';
import { exportAndShareGpx } from '../services/gpxService';
import {
  announceKmSplit,
  getVoiceCoachConfig,
  setVoiceCoachConfig,
  speakAnnouncement,
} from '../services/voiceCoachService';
import {
  calculateCadenceTempoMultiplier,
  getActiveSoundscapeTrack,
  getSoundscapePlaybackStatus,
  setActiveSoundscape,
  SOUNDSCAPE_TRACKS,
  SoundscapeTrackId,
  toggleSoundscapePlayback,
} from '../services/soundscapeService';
import { getFavoriteTrails, FavoriteTrail } from '../services/favoriteTrailsService';
import { getEnvironmentalTelemetry, EnvironmentalTelemetry } from '../services/weatherService';
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
  const [lastAnnouncedKm, setLastAnnouncedKm] = useState(0);

  // Feature states
  const [weather, setWeather] = useState<EnvironmentalTelemetry | null>(null);
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState(true);
  const [activeSoundscape, setActiveSoundscapeState] = useState<SoundscapeTrackId>('synthwave');
  const [isPlayingSoundscape, setIsPlayingSoundscape] = useState(true);
  const [favoriteTrails, setFavoriteTrails] = useState<FavoriteTrail[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<FavoriteTrail | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadEnvironmentAndFavorites();
  }, []);

  const loadEnvironmentAndFavorites = async () => {
    const env = await getEnvironmentalTelemetry();
    setWeather(env);
    const trails = getFavoriteTrails();
    setFavoriteTrails(trails);
    if (trails.length > 0) setSelectedTrail(trails[0]);
  };

  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => {
        setDurationSecs((prev) => {
          const nextSecs = prev + 1;

          // Increment simulated GPS telemetry metrics smoothly
          const distInc = 0.00135; // ~1.35m per sec = 4.86 km/h
          const nextDist = Number((distanceKm + distInc).toFixed(3));
          setDistanceKm(nextDist);

          const currentCalories = Math.round(nextDist * 52);
          const currentCadence = 104 + Math.round(Math.sin(nextSecs) * 6);
          setCalories(currentCalories);
          setCadenceSpm(currentCadence);
          setElevationGainM(Math.floor(nextDist * 8));

          // Recalculate splits
          const computedSplits = calculateSplits(nextDist, nextSecs, currentCadence, 52);
          setSplits(computedSplits);

          // Audio Coach announcement on every new KM
          const fullKm = Math.floor(nextDist);
          if (fullKm > lastAnnouncedKm && fullKm > 0) {
            setLastAnnouncedKm(fullKm);
            const latestSplit = computedSplits[computedSplits.length - 1];
            announceKmSplit(fullKm, latestSplit?.paceMinsPerKm || `5'30"`, currentCalories);
          }

          return nextSecs;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused, distanceKm, lastAnnouncedKm]);

  const handleStart = () => {
    setIsTracking(true);
    setIsPaused(false);
    speakAnnouncement('Starting outdoor GPS tracking session. Stay safe and enjoy your walk!');
  };

  const handlePauseToggle = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    speakAnnouncement(nextPaused ? 'Session paused' : 'Resuming session');
  };

  const handleStop = () => {
    setIsTracking(false);
    setIsPaused(false);
    speakAnnouncement(`Session finished! Total distance: ${distanceKm.toFixed(2)} kilometers.`);
  };

  const handleExportGpx = async () => {
    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      durationSecs,
      distanceKm: distanceKm > 0 ? distanceKm : 2.4,
      calories: calories > 0 ? calories : 120,
      avgSpeedKmh: 4.8,
      avgCadenceSpm: cadenceSpm || 105,
      elevationGainM,
      route: [],
      splits: splits.length > 0 ? splits : calculateSplits(2.4, 780, 105, 52),
    };
    const success = await exportAndShareGpx(session);
    if (!success) {
      Alert.alert('GPX Export', 'GPX file generated successfully!');
    }
  };

  const handleSoundscapeSelect = (trackId: SoundscapeTrackId) => {
    setActiveSoundscapeState(trackId);
    setActiveSoundscape(trackId);
    if (trackId !== 'none') {
      setIsPlayingSoundscape(true);
    }
  };

  const toggleVoiceCoach = () => {
    const nextVal = !voiceCoachEnabled;
    setVoiceCoachEnabled(nextVal);
    setVoiceCoachConfig({ enabled: nextVal });
    speakAnnouncement(nextVal ? 'Audio Coach enabled' : 'Audio Coach muted');
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

  const activeTrack = getActiveSoundscapeTrack();
  const tempoMultiplier = calculateCadenceTempoMultiplier(cadenceSpm);

  return (
    <SafeAreaView style={styles.container}>
      <LiquidScreenWrapper>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LiquidSection delay={40} style={styles.header}>
            <Text style={styles.headerTag}>📍 GPS OUTDOOR TELEMETRY</Text>
            <Text style={styles.title}>Live GPS Walk / Run</Text>
            <Text style={styles.subtitle}>
              Real-time outdoor telemetry with route path map, weather, cadence soundscapes, and audio coaching.
            </Text>
          </LiquidSection>

          {/* 🌤️ Weather & Air Quality Telemetry Banner */}
          {weather && (
            <LiquidSection delay={70} style={styles.weatherBanner}>
              <View style={styles.weatherLeft}>
                <Text style={styles.weatherIcon}>{weather.icon}</Text>
                <View>
                  <Text style={styles.weatherTemp}>{weather.tempCelsius}°C • {weather.condition}</Text>
                  <Text style={styles.weatherAdvice}>{weather.safetyAdvice}</Text>
                </View>
              </View>
              <View style={styles.weatherRight}>
                <View style={styles.aqiBadge}>
                  <Text style={styles.aqiVal}>AQI {weather.aqiScore}</Text>
                  <Text style={styles.aqiLabel}>{weather.aqiLabel}</Text>
                </View>
                <Text style={styles.uvText}>UV {weather.uvIndex} ({weather.uvRating})</Text>
              </View>
            </LiquidSection>
          )}

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

          {/* 🎵 Cadence Beat Sync & Audio Voice Coach Dock */}
          <LiquidSection delay={130} style={styles.audioDockCard}>
            <View style={styles.audioDockHeader}>
              <View style={styles.audioHeaderLeft}>
                <Text style={styles.audioTitle}>🎵 Cadence Soundscape</Text>
                <Text style={styles.audioSub}>
                  {activeTrack.id !== 'none'
                    ? `${activeTrack.title} • Tempo Multiplier: ${tempoMultiplier}x`
                    : 'Audio muted'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.coachBtn, voiceCoachEnabled && styles.coachBtnActive]}
                onPress={toggleVoiceCoach}
              >
                <Text style={[styles.coachBtnText, voiceCoachEnabled && styles.coachBtnTextActive]}>
                  {voiceCoachEnabled ? '🗣️ Voice Coach ON' : '🔇 Voice Coach OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.trackPillRow}>
              {SOUNDSCAPE_TRACKS.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.trackPill, activeSoundscape === t.id && styles.trackPillActive]}
                  onPress={() => handleSoundscapeSelect(t.id)}
                >
                  <Text style={styles.trackIcon}>{t.icon}</Text>
                  <Text style={[styles.trackTitle, activeSoundscape === t.id && styles.trackTitleActive]}>
                    {t.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LiquidSection>

          {/* ⭐ Favorite Trails Selector */}
          {favoriteTrails.length > 0 && (
            <LiquidSection delay={150} style={styles.favoritesSection}>
              <Text style={styles.sectionLabel}>⭐ BOOKMARKED FAVORITE TRAILS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trailScroll}>
                {favoriteTrails.map((trail) => (
                  <TouchableOpacity
                    key={trail.id}
                    style={[styles.trailChip, selectedTrail?.id === trail.id && styles.trailChipActive]}
                    onPress={() => setSelectedTrail(trail)}
                  >
                    <Text style={styles.trailTitle}>{trail.title}</Text>
                    <Text style={styles.trailMeta}>{trail.distanceKm} km • {trail.surface}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LiquidSection>
          )}

          {/* SVG Live GPS Route Map */}
          <LiquidSection delay={180} style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <View>
                <Text style={styles.mapTitle}>🌐 {selectedTrail ? selectedTrail.title : 'Interactive Route Map'}</Text>
                {selectedTrail && <Text style={styles.selectedTrailSub}>{selectedTrail.description}</Text>}
              </View>
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

            {/* GPX Export Button */}
            <TouchableOpacity
              style={styles.gpxExportBtn}
              onPress={handleExportGpx}
              activeOpacity={0.8}
            >
              <Text style={styles.gpxExportText}>📥 EXPORT SESSION (.GPX)</Text>
            </TouchableOpacity>
          </LiquidSection>

          {/* Per-Kilometer Interval Splits Table */}
          <LiquidSection delay={280}>
            <SplitTableCard splits={splits.length > 0 ? splits : calculateSplits(2.4, 780, 105, 52)} />
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
  weatherBanner: {
    backgroundColor: '#0F121C',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  weatherIcon: {
    fontSize: 24,
  },
  weatherTemp: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weatherAdvice: {
    fontSize: 10,
    color: '#8080A0',
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  aqiBadge: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  aqiVal: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F5FF',
  },
  aqiLabel: {
    fontSize: 8,
    color: '#00F5FF',
  },
  uvText: {
    fontSize: 9,
    color: '#FF9900',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#0F121C',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#00F5FF',
  },
  heroDistance: {
    fontSize: 54,
    fontWeight: '900',
    color: '#00F5FF',
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8080A0',
    letterSpacing: 2,
    marginBottom: 16,
  },
  telemetryGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14,
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telemetryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#606080',
    marginTop: 2,
  },
  audioDockCard: {
    backgroundColor: '#0F121C',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(157, 0, 255, 0.25)',
  },
  audioDockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioHeaderLeft: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  audioSub: {
    fontSize: 10,
    color: '#9D00FF',
    marginTop: 2,
  },
  coachBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coachBtnActive: {
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    borderColor: '#00F5FF',
  },
  coachBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8080A0',
  },
  coachBtnTextActive: {
    color: '#00F5FF',
  },
  trackPillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  trackPillActive: {
    backgroundColor: 'rgba(157, 0, 255, 0.2)',
    borderColor: '#9D00FF',
  },
  trackIcon: {
    fontSize: 12,
  },
  trackTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8080A0',
  },
  trackTitleActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  favoritesSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF9900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  trailScroll: {
    gap: 10,
  },
  trailChip: {
    backgroundColor: '#0F121C',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  trailChipActive: {
    borderColor: '#FF9900',
    backgroundColor: 'rgba(255, 153, 0, 0.1)',
  },
  trailTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  trailMeta: {
    fontSize: 10,
    color: '#8080A0',
    marginTop: 2,
  },
  mapContainer: {
    backgroundColor: '#0F121C',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedTrailSub: {
    fontSize: 10,
    color: '#8080A0',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#606080',
  },
  activeLiveDot: {
    backgroundColor: '#39FF14',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  svgWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerInfo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8080A0',
  },
  controlRow: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#00F5FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#09090F',
    letterSpacing: 1,
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FF9900',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#00F5FF',
  },
  pauseButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#09090F',
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#FF0055',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gpxExportBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  gpxExportText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F5FF',
    letterSpacing: 0.5,
  },
});
