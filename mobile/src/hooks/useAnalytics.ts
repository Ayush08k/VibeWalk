import { useState, useEffect, useCallback } from 'react';
import { DailyStepRecord } from '../utils/normalize';
import * as apiService from '../services/apiService';
import { AnalyticsResponse } from '../services/apiService';

/**
 * Hook to fetch AI analytics based on step history.
 * @param {DailyStepRecord[]} history The step history data.
 * @param {number} goal The daily step goal.
 */
export function useAnalytics(history: DailyStepRecord[], goal: number): {
  analytics: AnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches analytics from the API.
   */
  const fetchAnalytics = useCallback(async () => {
    if (!history || history.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const dailySteps = history.map((record) => record.steps);
      const result = await apiService.analyzeSteps(dailySteps, goal);
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [history, goal]);

  useEffect(() => {
    // Debounce to avoid rapid re-fetches when history or goal changes
    const handler = setTimeout(() => {
      fetchAnalytics();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics,
  };
}
