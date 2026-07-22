/**
 * API Service — Backend communication layer
 *
 * Sends step history to the FastAPI backend for AI analytics
 * and returns formatted insights.
 */

import { API_BASE_URL } from '../theme/theme';

/** Individual AI insight returned by the backend */
export interface InsightItem {
  emoji: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
}

/** Weekly comparison data */
export interface WeeklyComparison {
  thisWeekAvg: number;
  lastWeekAvg: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
}

/** Full analytics response from the backend */
export interface AnalyticsResponse {
  wellnessScore: number;
  trend: 'up' | 'down' | 'stable';
  insights: InsightItem[];
  weeklyComparison: WeeklyComparison;
  averageSteps: number;
  bestDay: { date: string; steps: number };
  totalSteps: number;
  streakDays: number;
}

/** Request payload shape */
interface AnalyticsRequest {
  daily_steps: number[];
  goal: number;
}

/**
 * Sends the 30-day step array to the backend for AI analysis.
 *
 * Falls back to a locally-computed minimal response if the
 * backend is unreachable, so the app always has something to show.
 */
export async function analyzeSteps(
  dailySteps: number[],
  goal: number,
): Promise<AnalyticsResponse> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/v1/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_steps: dailySteps, goal } satisfies AnalyticsRequest),
      },
      10_000, // 10s timeout
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return mapBackendResponse(data);
  } catch (error) {
    console.warn('[apiService] Backend unreachable, using local fallback:', error);
    return computeLocalFallback(dailySteps, goal);
  }
}

/**
 * Maps the snake_case backend response to camelCase frontend types.
 */
function mapBackendResponse(data: Record<string, unknown>): AnalyticsResponse {
  return {
    wellnessScore: (data.wellness_score as number) ?? 50,
    trend: (data.trend as 'up' | 'down' | 'stable') ?? 'stable',
    insights: ((data.insights as Record<string, unknown>[]) ?? []).map((i) => ({
      emoji: (i.emoji as string) ?? '📊',
      title: (i.title as string) ?? 'Insight',
      description: (i.description as string) ?? '',
      severity: (i.severity as InsightItem['severity']) ?? 'info',
    })),
    weeklyComparison: mapWeeklyComparison(data.weekly_comparison as Record<string, unknown>),
    averageSteps: (data.average_steps as number) ?? 0,
    bestDay: {
      date: ((data.best_day as Record<string, unknown>)?.date as string) ?? '',
      steps: ((data.best_day as Record<string, unknown>)?.steps as number) ?? 0,
    },
    totalSteps: (data.total_steps as number) ?? 0,
    streakDays: (data.streak_days as number) ?? 0,
  };
}

function mapWeeklyComparison(data?: Record<string, unknown>): WeeklyComparison {
  if (!data) {
    return { thisWeekAvg: 0, lastWeekAvg: 0, changePercent: 0, direction: 'stable' };
  }
  return {
    thisWeekAvg: (data.this_week_avg as number) ?? 0,
    lastWeekAvg: (data.last_week_avg as number) ?? 0,
    changePercent: (data.change_percent as number) ?? 0,
    direction: (data.direction as 'up' | 'down' | 'stable') ?? 'stable',
  };
}

/**
 * Local fallback analytics when the backend is unavailable.
 * Computes basic stats so the UI always has meaningful data.
 */
function computeLocalFallback(dailySteps: number[], goal: number): AnalyticsResponse {
  const total = dailySteps.reduce((sum, s) => sum + s, 0);
  const avg = dailySteps.length > 0 ? Math.round(total / dailySteps.length) : 0;
  const bestSteps = Math.max(...dailySteps, 0);
  const bestIndex = dailySteps.indexOf(bestSteps);

  // Simple streak: count consecutive days from end meeting goal
  let streak = 0;
  for (let i = dailySteps.length - 1; i >= 0; i--) {
    if (dailySteps[i] >= goal) {
      streak++;
    } else {
      break;
    }
  }

  // Simple trend: compare last 7 days avg to previous 7 days
  const recent7 = dailySteps.slice(-7);
  const prev7 = dailySteps.slice(-14, -7);
  const recent7Avg = recent7.length > 0 ? recent7.reduce((s, v) => s + v, 0) / recent7.length : 0;
  const prev7Avg = prev7.length > 0 ? prev7.reduce((s, v) => s + v, 0) / prev7.length : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  const changePercent = prev7Avg > 0 ? ((recent7Avg - prev7Avg) / prev7Avg) * 100 : 0;
  if (changePercent > 10) trend = 'up';
  if (changePercent < -10) trend = 'down';

  // Simple wellness score (0-100)
  const goalRate = Math.min(avg / goal, 1.5);
  const wellnessScore = Math.round(goalRate * 60 + (streak > 0 ? 20 : 0) + (trend === 'up' ? 20 : trend === 'stable' ? 10 : 0));

  const insights: InsightItem[] = [];

  if (trend === 'up') {
    insights.push({
      emoji: '🚀',
      title: 'Trending Up',
      description: `You're walking ${Math.abs(Math.round(changePercent))}% more than last week. Keep it up!`,
      severity: 'success',
    });
  } else if (trend === 'down') {
    insights.push({
      emoji: '⚠️',
      title: 'Activity Dip',
      description: `Your steps dropped ${Math.abs(Math.round(changePercent))}% compared to last week.`,
      severity: 'warning',
    });
  }

  if (streak >= 3) {
    insights.push({
      emoji: '🔥',
      title: `${streak}-Day Streak!`,
      description: `You've hit your ${goal.toLocaleString()} step goal ${streak} days in a row.`,
      severity: 'success',
    });
  }

  return {
    wellnessScore: Math.min(wellnessScore, 100),
    trend,
    insights,
    weeklyComparison: {
      thisWeekAvg: Math.round(recent7Avg),
      lastWeekAvg: Math.round(prev7Avg),
      changePercent: Math.round(changePercent),
      direction: trend,
    },
    averageSteps: avg,
    bestDay: {
      date: new Date(Date.now() - (dailySteps.length - 1 - bestIndex) * 86400000)
        .toISOString()
        .split('T')[0],
      steps: bestSteps,
    },
    totalSteps: total,
    streakDays: streak,
  };
}

/**
 * Fetch with timeout support.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
