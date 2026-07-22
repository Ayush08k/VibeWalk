/**
 * Mock implementation of @mbdayo/react-native-health-kits
 *
 * Generates realistic simulated step data for development and testing.
 * In production, this would be replaced by the real native module.
 */

const PermissionType = {
  Steps: 'steps',
  HeartRate: 'heartRate',
  Workouts: 'workouts',
};

let _initialized = false;
let _permissionGranted = true; // Auto-grant in dev

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
 * Generate a realistic step count for a given day.
 * Uses day-of-week patterns: weekdays ~8000-12000, weekends ~4000-9000.
 */
function generateDailySteps(date) {
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;
  const base = isWeekend ? 5500 : 9000;
  const variance = isWeekend ? 3000 : 4000;
  // Seed from date for consistency
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const pseudoRandom = Math.abs(Math.sin(seed * 9301 + 49297) % 1);
  return Math.round(base + (pseudoRandom - 0.5) * variance);
}

/**
 * Query step count records for a date range.
 * Returns an array of records matching HealthKit/Health Connect shape.
 */
async function queryStepCount({ startDate, endDate }) {
  if (!_initialized) {
    await initialize();
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const records = [];

  // Generate one record per day
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDay) {
    const isToday =
      current.getDate() === new Date().getDate() &&
      current.getMonth() === new Date().getMonth() &&
      current.getFullYear() === new Date().getFullYear();

    let steps = generateDailySteps(current);

    // If today, scale by how far through the day we are
    if (isToday) {
      const now = new Date();
      const hoursElapsed = now.getHours() + now.getMinutes() / 60;
      const dayFraction = hoursElapsed / 16; // Assume 16 active hours
      steps = Math.round(steps * Math.min(dayFraction, 1));
    }

    records.push({
      startDate: new Date(current).toISOString(),
      endDate: new Date(current.getTime() + 86400000).toISOString(),
      value: steps,
      steps: steps,
      sourceName: 'StepCounter Mock',
      sourceId: 'com.stepcounter.mock',
      metadata: {
        dataOrigin: {
          packageName: 'com.stepcounter.mock',
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
