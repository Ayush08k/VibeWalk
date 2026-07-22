import { useState, useEffect, useCallback } from 'react';
import { getStepHistory } from '../services/healthService';
import { DailyStepRecord } from '../utils/normalize';

let cachedHistory: DailyStepRecord[] | null = null;

/**
 * Hook to manage a 30-day history of step counts.
 * Uses a module-level cache to avoid hitting the native bridge repeatedly.
 */
export function useStepHistory(): {
  history: DailyStepRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [history, setHistory] = useState<DailyStepRecord[]>(cachedHistory || []);
  const [loading, setLoading] = useState<boolean>(!cachedHistory);
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
      setHistory(stepHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error fetching step history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cachedHistory) {
      refresh();
    }
  }, [refresh]);

  return {
    history,
    loading,
    error,
    refresh,
  };
}
