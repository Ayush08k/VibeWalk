import {
  initialize,
  requestPermission,
  checkPermission,
  queryStepCount,
  PermissionType,
} from '@mbdayo/react-native-health-kits';
import { Pedometer } from 'expo-sensors';
import { DailyStepRecord, normalizeStepData, fillMissingDays } from '../utils/normalize';

/**
 * Initializes the health SDK.
 */
export async function initializeHealth(): Promise<void> {
  try {
    await initialize();
  } catch (error) {
    throw new Error(`Failed to initialize health SDK: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Requests permission to read step data.
 */
export async function requestStepPermission(): Promise<boolean> {
  try {
    const result = await requestPermission([PermissionType.Steps]);
    return Boolean(result);
  } catch (error) {
    throw new Error(`Failed to request step permission: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Checks if permission to read step data is granted.
 */
export async function checkStepPermission(): Promise<boolean> {
  try {
    return await checkPermission(PermissionType.Steps);
  } catch (error) {
    throw new Error(`Failed to check step permission: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves the total steps taken today using the device's native Pedometer.
 *
 * Uses expo-sensors Pedometer API which taps into the hardware step counter
 * (CMPedometer on iOS, TYPE_STEP_COUNTER on Android).
 * Steps only increase when the user actually walks.
 *
 * Falls back to the mock data if the pedometer is unavailable.
 */
export async function getTodaySteps(): Promise<number> {
  try {
    // Try the real pedometer first
    const isAvailable = await Pedometer.isAvailableAsync();

    if (isAvailable) {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      const now = new Date();

      const result = await Pedometer.getStepCountAsync(midnight, now);
      if (result && typeof result.steps === 'number') {
        return result.steps;
      }
    }

    // Fall back to mock if pedometer not available
    console.log('[healthService] Pedometer unavailable, using mock data');
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const records = await queryStepCount({
      startDate: midnight.toISOString(),
      endDate: now.toISOString(),
    });

    let total = 0;
    if (Array.isArray(records)) {
      for (const record of records) {
        total += (record as any).value || (record as any).steps || 0;
      }
    }
    return total;
  } catch (error) {
    throw new Error(`Failed to get today's steps: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves normalized step history for the specified number of days.
 *
 * Today's entry uses the real Pedometer count.
 * Historical entries come from the mock/health kit.
 */
export async function getStepHistory(days: number = 30): Promise<DailyStepRecord[]> {
  try {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    past.setDate(past.getDate() - days);

    const records = await queryStepCount({
      startDate: past.toISOString(),
      endDate: now.toISOString(),
    });

    const normalized = normalizeStepData(records);
    const filled = fillMissingDays(normalized, days);

    // Replace today's entry with real pedometer data
    try {
      const todaySteps = await getTodaySteps();
      const todayIndex = filled.length - 1;
      if (todayIndex >= 0) {
        filled[todayIndex] = {
          ...filled[todayIndex],
          steps: todaySteps,
          source: 'Pedometer',
        };
      }
    } catch {
      // Keep mock data if pedometer fails
    }

    return filled;
  } catch (error) {
    throw new Error(`Failed to get step history: ${error instanceof Error ? error.message : String(error)}`);
  }
}
