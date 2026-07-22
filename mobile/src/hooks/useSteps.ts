import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getTodaySteps } from '../services/healthService';
import { DEFAULT_STEP_GOAL } from '../theme/theme';

/**
 * Hook to manage today's step count with auto-refresh and background-to-foreground refresh.
 */
export function useSteps(): {
  steps: number;
  goal: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [steps, setSteps] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refreshes today's step count.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const todaySteps = await getTodaySteps();
      setSteps(todaySteps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error fetching steps');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Refresh every 60 seconds
    const interval = setInterval(() => {
      refresh();
    }, 60000);

    // Refresh when app comes to foreground
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
    goal: DEFAULT_STEP_GOAL,
    loading,
    error,
    refresh,
  };
}
