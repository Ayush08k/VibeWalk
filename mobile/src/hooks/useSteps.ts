import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { DEFAULT_STEP_GOAL } from '../theme/theme';

/**
 * Smart Rhythmic Pedometer Engine Hook
 *
 * Implements Rhythmic Step Filtering & Impact Thresholds:
 * - Requires real walking acceleration impact (magnitude > 1.42g).
 * - Ignores isolated single twitches or hand movements while sitting/resting.
 * - Requires 3+ consecutive rhythmic steps within [320ms, 1100ms] cadence window.
 * - Includes manual controls (+100 steps & Auto-Walk) for testing on desks/emulators.
 */
export function useSteps(): {
  steps: number;
  previousSteps: number;
  goal: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isSimulating: boolean;
  refresh: () => void;
  addSteps: (amount: number) => void;
  toggleSimulateWalk: () => void;
} {
  // Initial baseline calculation based on time of day
  const initialSteps = (() => {
    const now = new Date();
    const hour = now.getHours();
    return Math.round(Math.min(hour / 16, 1) * 3500);
  })();

  const [steps, setSteps] = useState<number>(initialSteps);
  const [previousSteps, setPreviousSteps] = useState<number>(initialSteps);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Rhythmic step detector refs
  const lastPeakTimeRef = useRef<number>(0);
  const consecutiveRhythmicStepsRef = useRef<number>(0);
  const wasAboveThresholdRef = useRef<boolean>(false);

  /**
   * Manually add steps (useful for testing on desk/emulator)
   */
  const addSteps = useCallback((amount: number) => {
    setSteps((prev) => {
      setPreviousSteps(prev);
      return prev + amount;
    });
    setLastUpdated(new Date());
  }, []);

  /**
   * Toggle automatic simulated walking ticks
   */
  const toggleSimulateWalk = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  /**
   * Refreshes baseline count from native pedometer if available
   */
  const refresh = useCallback(async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (isAvailable) {
        const midnight = new Date();
        midnight.setHours(0, 0, 0, 0);
        const now = new Date();
        const result = await Pedometer.getStepCountAsync(midnight, now);
        if (result && typeof result.steps === 'number' && result.steps > 0) {
          setSteps((prev) => {
            setPreviousSteps(prev);
            return Math.max(prev, result.steps);
          });
          setLastUpdated(new Date());
        }
      }
    } catch {
      // Keep current steps if native query fails
    }
  }, []);

  // 1. Hardware Accelerometer Peak & Rhythmic Cadence Step Filter
  useEffect(() => {
    let accelSub: any = null;

    try {
      Accelerometer.setUpdateInterval(50); // ~20 Hz

      accelSub = Accelerometer.addListener((data) => {
        const { x, y, z } = data;
        // Calculate acceleration magnitude (gravity inclusive)
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        // 1.42g requires a real foot strike or deliberate walking motion
        const STEP_THRESHOLD = 1.42;
        const MIN_STEP_INTERVAL = 320;  // Max ~187 steps/min
        const MAX_STEP_INTERVAL = 1100; // Min ~54 steps/min

        if (magnitude > STEP_THRESHOLD && !wasAboveThresholdRef.current) {
          wasAboveThresholdRef.current = true;
        } else if (magnitude < STEP_THRESHOLD && wasAboveThresholdRef.current) {
          wasAboveThresholdRef.current = false;

          const timeDelta = now - lastPeakTimeRef.current;

          // Check if step interval matches human walking rhythm
          if (timeDelta >= MIN_STEP_INTERVAL && timeDelta <= MAX_STEP_INTERVAL) {
            consecutiveRhythmicStepsRef.current += 1;

            // Require at least 3 consecutive rhythmic steps before adding steps
            // This completely ignores isolated twitches while sitting / sleeping
            if (consecutiveRhythmicStepsRef.current >= 3) {
              const stepsToAdd = consecutiveRhythmicStepsRef.current === 3 ? 3 : 1;
              setSteps((prev) => {
                setPreviousSteps(prev);
                return prev + stepsToAdd;
              });
              setLastUpdated(new Date());
            }
          } else if (timeDelta > MAX_STEP_INTERVAL) {
            // Rhythm broken (was sitting/resting or paused walking) — reset buffer
            consecutiveRhythmicStepsRef.current = 1;
          }

          lastPeakTimeRef.current = now;
        }
      });
    } catch (e) {
      console.warn('[useSteps] Accelerometer error:', e);
    }

    return () => {
      if (accelSub) accelSub.remove();
    };
  }, []);

  // 2. Hardware Pedometer Watcher
  useEffect(() => {
    let pedometerSub: any = null;

    async function initPedometerWatch() {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        if (isAvailable) {
          pedometerSub = Pedometer.watchStepCount((result) => {
            if (result && typeof result.steps === 'number' && result.steps > 0) {
              setSteps((prev) => {
                setPreviousSteps(prev);
                return Math.max(prev, prev + result.steps);
              });
              setLastUpdated(new Date());
            }
          });
        }
      } catch (e) {
        console.warn('[useSteps] Pedometer watch error:', e);
      }
    }

    initPedometerWatch();

    return () => {
      if (pedometerSub) pedometerSub.remove();
    };
  }, []);

  // 3. Simulated Walk Timer (when user explicitly enables Auto Walk)
  useEffect(() => {
    if (!isSimulating) return;

    // Simulate ~90 steps/minute when user turns on Auto Walk
    const interval = setInterval(() => {
      addSteps(2);
    }, 1300);

    return () => clearInterval(interval);
  }, [isSimulating, addSteps]);

  // 4. Foreground refresh
  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refresh();
      }
    });

    return () => appStateSub.remove();
  }, [refresh]);

  return {
    steps,
    previousSteps,
    goal: DEFAULT_STEP_GOAL,
    loading,
    error,
    lastUpdated,
    isSimulating,
    refresh,
    addSteps,
    toggleSimulateWalk,
  };
}
