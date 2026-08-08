/**
 * Weather Service — Environmental Telemetry (Temperature, UV Index, AQI)
 */

export interface EnvironmentalTelemetry {
  tempCelsius: number;
  condition: string;
  icon: string;
  humidityPercent: number;
  uvIndex: number;
  uvRating: 'Low' | 'Moderate' | 'High' | 'Very High';
  aqiScore: number; // 1 (Good) to 5 (Hazardous)
  aqiLabel: 'Good' | 'Moderate' | 'Unhealthy' | 'Poor';
  safetyAdvice: string;
}

/**
 * Returns environmental telemetry and safety advice for outdoor walking.
 */
export async function getEnvironmentalTelemetry(): Promise<EnvironmentalTelemetry> {
  // Simulate live weather station reading
  return {
    tempCelsius: 24,
    condition: 'Partly Sunny & Breezy',
    icon: '🌤️',
    humidityPercent: 55,
    uvIndex: 4,
    uvRating: 'Moderate',
    aqiScore: 32,
    aqiLabel: 'Good',
    safetyAdvice: 'Optimal outdoor conditions for a walk! Mild UV index.',
  };
}
