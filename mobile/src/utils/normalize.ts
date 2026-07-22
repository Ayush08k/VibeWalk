/**
 * Data normalization utilities
 *
 * Normalizes the different JSON schemas from iOS HealthKit and
 * Android Health Connect into a unified DailyStepRecord format.
 */

import { Platform } from 'react-native';

/** Unified step record used across the entire app */
export interface DailyStepRecord {
  /** ISO date string: YYYY-MM-DD */
  date: string;
  /** Aggregated step count for the day */
  steps: number;
  /** Source device or app attribution */
  source: string;
}

/**
 * Raw HealthKit sample shape (iOS).
 * HealthKit returns quantity samples with startDate/endDate and a quantity value.
 */
interface HealthKitSample {
  startDate: string;
  endDate: string;
  value: number;
  sourceName?: string;
  sourceId?: string;
}

/**
 * Raw Health Connect record shape (Android).
 * Health Connect returns records with time ranges and count values.
 */
interface HealthConnectRecord {
  startTime: string;
  endTime: string;
  count?: number;
  steps?: number;
  metadata?: {
    dataOrigin?: {
      packageName?: string;
    };
  };
}

/**
 * Extracts just the date portion (YYYY-MM-DD) from a date string or ISO timestamp.
 */
function extractDateKey(dateString: string): string {
  // Handle both ISO timestamps and date-only strings
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  // Already a date-only string
  return dateString.substring(0, 10);
}

/**
 * Normalizes an array of iOS HealthKit step samples into DailyStepRecords.
 * HealthKit may return multiple samples per day (one per source), so we aggregate.
 */
function normalizeHealthKitSamples(samples: HealthKitSample[]): DailyStepRecord[] {
  const dailyMap = new Map<string, { steps: number; sources: Set<string> }>();

  for (const sample of samples) {
    const dateKey = extractDateKey(sample.startDate);
    const existing = dailyMap.get(dateKey);

    if (existing) {
      existing.steps += sample.value;
      if (sample.sourceName) {
        existing.sources.add(sample.sourceName);
      }
    } else {
      dailyMap.set(dateKey, {
        steps: Math.round(sample.value),
        sources: new Set(sample.sourceName ? [sample.sourceName] : ['iPhone']),
      });
    }
  }

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      steps: data.steps,
      source: Array.from(data.sources).join(', '),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Normalizes an array of Android Health Connect step records into DailyStepRecords.
 * Health Connect may also return multiple records per day.
 */
function normalizeHealthConnectRecords(records: HealthConnectRecord[]): DailyStepRecord[] {
  const dailyMap = new Map<string, { steps: number; sources: Set<string> }>();

  for (const record of records) {
    const dateKey = extractDateKey(record.startTime);
    const stepCount = record.count ?? record.steps ?? 0;
    const source = record.metadata?.dataOrigin?.packageName ?? 'device';
    const existing = dailyMap.get(dateKey);

    if (existing) {
      existing.steps += stepCount;
      existing.sources.add(source);
    } else {
      dailyMap.set(dateKey, {
        steps: Math.round(stepCount),
        sources: new Set([source]),
      });
    }
  }

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      steps: data.steps,
      source: Array.from(data.sources).join(', '),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Normalizes raw health data from either platform into a unified format.
 * Automatically detects the platform and applies the correct transformation.
 */
export function normalizeStepData(rawData: unknown[]): DailyStepRecord[] {
  if (!rawData || rawData.length === 0) {
    return [];
  }

  if (Platform.OS === 'ios') {
    return normalizeHealthKitSamples(rawData as HealthKitSample[]);
  }

  return normalizeHealthConnectRecords(rawData as HealthConnectRecord[]);
}

/**
 * Fills in missing days in a step history with zero-step records.
 * Ensures the returned array has exactly `days` entries, one per day,
 * in ascending chronological order.
 */
export function fillMissingDays(
  records: DailyStepRecord[],
  days: number = 30,
): DailyStepRecord[] {
  const today = new Date();
  const result: DailyStepRecord[] = [];
  const recordMap = new Map(records.map((r) => [r.date, r]));

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];

    const existing = recordMap.get(dateKey);
    result.push(
      existing ?? {
        date: dateKey,
        steps: 0,
        source: 'none',
      },
    );
  }

  return result;
}

/**
 * Returns the day-of-week label for a date string.
 */
export function getDayLabel(dateString: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateString + 'T00:00:00');
  return days[date.getDay()];
}

/**
 * Formats a step count with thousands separators.
 */
export function formatStepCount(steps: number): string {
  return steps.toLocaleString('en-US');
}

/**
 * Estimates calories burned from steps.
 * Uses a rough average of 0.04 kcal per step (varies by weight/speed).
 */
export function estimateCalories(steps: number): number {
  return Math.round(steps * 0.04);
}

/**
 * Estimates distance in kilometers from steps.
 * Uses an average stride length of 0.762 meters (2.5 feet).
 */
export function estimateDistanceKm(steps: number): number {
  return parseFloat((steps * 0.000762).toFixed(2));
}

/**
 * Estimates active minutes from steps.
 * Assumes ~100 steps/minute during active walking.
 */
export function estimateActiveMinutes(steps: number): number {
  return Math.round(steps / 100);
}
