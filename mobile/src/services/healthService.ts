import {
  initialize,
  requestPermission,
  checkPermission,
  queryStepCount,
  PermissionType,
} from '@mbdayo/react-native-health-kits';
import { DailyStepRecord, normalizeStepData, fillMissingDays } from '../utils/normalize';

/**
 * Initializes the health SDK.
 * @returns {Promise<void>} Resolves when initialization is complete.
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
 * @returns {Promise<boolean>} True if permission is granted.
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
 * @returns {Promise<boolean>} True if permission is granted.
 */
export async function checkStepPermission(): Promise<boolean> {
  try {
    return await checkPermission(PermissionType.Steps);
  } catch (error) {
    throw new Error(`Failed to check step permission: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves the total steps taken today from midnight local time to now.
 * @returns {Promise<number>} Total steps for today.
 */
export async function getTodaySteps(): Promise<number> {
  try {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const records = await queryStepCount({
      startDate: midnight.toISOString(),
      endDate: now.toISOString(),
    });
    
    let total = 0;
    if (Array.isArray(records)) {
      for (const record of records) {
        // Handle varying structures from native bridges gracefully
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
 * @param {number} days Number of days to retrieve history for, defaults to 30.
 * @returns {Promise<DailyStepRecord[]>} Normalized and filled array of step records.
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
    return fillMissingDays(normalized, days);
  } catch (error) {
    throw new Error(`Failed to get step history: ${error instanceof Error ? error.message : String(error)}`);
  }
}
