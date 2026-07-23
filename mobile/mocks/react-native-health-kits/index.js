/**
 * Mock implementation of @mbdayo/react-native-health-kits
 *
 * For HISTORICAL days: generates deterministic simulated step data.
 * For TODAY: returns 0 — the real step count is handled by
 * healthService.ts using expo-sensors Pedometer directly.
 *
 * In production, this would be replaced by the real native module.
 */

const PermissionType = {
  Steps: 'steps',
  HeartRate: 'heartRate',
  Workouts: 'workouts',
};

let _initialized = false;
let _permissionGranted = true;

/**
 * Initialize the health SDK.
 */
async function initialize() {
  _initialized = true;
  console.log('[HealthKits Mock] SDK initialized');
}

/**
 * Request health data permissions.
 */
async function requestPermission(permissions) {
  console.log('[HealthKits Mock] Permissions requested:', permissions);
  _permissionGranted = true;
  return true;
}

/**
 * Check if a permission is granted.
 */
async function checkPermission(permission) {
  return _permissionGranted;
}

/**
 * Generate deterministic daily step count for historical dates.
 * Weekdays ~8000-12000, weekends ~4000-9000.
 */
function generateDailySteps(date) {
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;
  const base = isWeekend ? 5500 : 9000;
  const variance = isWeekend ? 3000 : 4000;
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const pseudoRandom = Math.abs(Math.sin(seed * 9301 + 49297) % 1);
  return Math.round(base + (pseudoRandom - 0.5) * variance);
}

/**
 * Query step count records for a date range.
 *
 * For TODAY: returns 0 (real steps come from Pedometer in healthService).
 * For PAST DAYS: returns deterministic simulated data.
 */
async function queryStepCount({ startDate, endDate }) {
  if (!_initialized) {
    await initialize();
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const records = [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDay) {
    const currentStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    const isToday = currentStr === todayStr;

    // Today returns 0 — real steps handled by healthService via Pedometer
    const steps = isToday ? 0 : generateDailySteps(current);

    records.push({
      startDate: new Date(current).toISOString(),
      endDate: new Date(current.getTime() + 86400000).toISOString(),
      value: steps,
      steps: steps,
      sourceName: 'VibeWalk',
      sourceId: 'com.vibewalk',
      metadata: {
        dataOrigin: {
          packageName: 'com.vibewalk',
        },
      },
    });

    current.setDate(current.getDate() + 1);
  }

  return records;
}

module.exports = {
  PermissionType,
  initialize,
  requestPermission,
  checkPermission,
  queryStepCount,
};
