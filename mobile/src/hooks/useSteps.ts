import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getTodaySteps } from '../services/healthService';
import { DEFAULT_STEP_GOAL } from '../theme/theme';

/**
 * Hook to manage today's step count with live-feel refresh.
 *
 * Polls every 10 seconds for a real-time feel.
 * Tracks lastUpdated and previous step count so the UI
 * can animate transitions and show freshness indicators.
 */
export function useSteps(): {
  steps: number;
  previousSteps: number;
  goal: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
} {
  const [steps, setSteps] = useState<number>(0);
  const [previousSteps, setPreviousSteps] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFirstLoad = useRef(true);

  /**
   * Refreshes today's step count.
   * Tracks the previous value so the UI can detect changes.
   */
  const refresh = useCallback(async () => {
    if (isFirstLoad.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const todaySteps = await getTodaySteps();
      setSteps((prev) => {
        setPreviousSteps(prev);
        return todaySteps;
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error fetching steps');
    } finally {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Poll every 10 seconds for a live feel
    const interval = setInterval(() => {
      refresh();
    }, 10_000);

    // Refresh immediately when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refresh();
      }
    });

    // Cleanup listeners and interval on unmount
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refresh]);

  return {
    steps,
    previousSteps,
    goal: DEFAULT_STEP_GOAL,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}
