import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getStepHistory } from '../services/healthService';
import { DailyStepRecord } from '../utils/normalize';

let cachedHistory: DailyStepRecord[] | null = null;
let cacheTimestamp: number = 0;

/** Cache duration: 5 minutes */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Hook to manage a 30-day history of step counts.
 * Uses a module-level cache with TTL to avoid hitting the native bridge too often,
 * while still keeping data fresh.
 */
export function useStepHistory(): {
  history: DailyStepRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const isCacheValid = cachedHistory && (Date.now() - cacheTimestamp < CACHE_TTL_MS);
  const [history, setHistory] = useState<DailyStepRecord[]>(isCacheValid ? cachedHistory! : []);
  const [loading, setLoading] = useState<boolean>(!isCacheValid);
  const [error, setError] = useState<string | null>(null);

  /**
   * Forces a refresh of the step history, updating the cache.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stepHistory = await getStepHistory(30);
      cachedHistory = stepHistory;
      cacheTimestamp = Date.now();
      setHistory(stepHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error fetching step history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isCacheStillValid = cachedHistory && (Date.now() - cacheTimestamp < CACHE_TTL_MS);
    if (!isCacheStillValid) {
      refresh();
    }

    // Refresh when app comes to foreground (if cache is stale)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const isStale = !cachedHistory || (Date.now() - cacheTimestamp >= CACHE_TTL_MS);
        if (isStale) {
          refresh();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refresh]);

  return {
    history,
    loading,
    error,
    refresh,
  };
}
