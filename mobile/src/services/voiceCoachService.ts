/**
 * Voice Coach Service — Real-time audio coach announcements using Speech synthesis
 */
import * as Speech from 'expo-speech';

export interface VoiceCoachConfig {
  enabled: boolean;
  announcePace: boolean;
  announceDistance: boolean;
  announceCalories: boolean;
  speechRate: number;
}

let defaultConfig: VoiceCoachConfig = {
  enabled: true,
  announcePace: true,
  announceDistance: true,
  announceCalories: true,
  speechRate: 1.0,
};

/**
 * Speaks an audio announcement.
 */
export function speakAnnouncement(message: string): void {
  try {
    if (!defaultConfig.enabled) return;
    Speech.stop();
    Speech.speak(message, {
      language: 'en-US',
      pitch: 1.0,
      rate: defaultConfig.speechRate,
    });
  } catch (error) {
    console.warn('[voiceCoachService] Speech announcement error:', error);
  }
}

/**
 * Announces kilometer split milestone update.
 */
export function announceKmSplit(kmNumber: number, paceMinsPerKm: string, calories: number): void {
  const message = `Kilometer ${kmNumber} complete. Average pace: ${paceMinsPerKm} per kilometer. Total calories burned: ${calories} kilocalories.`;
  speakAnnouncement(message);
}

/**
 * Updates Voice Coach configuration settings.
 */
export function setVoiceCoachConfig(config: Partial<VoiceCoachConfig>): VoiceCoachConfig {
  defaultConfig = { ...defaultConfig, ...config };
  return defaultConfig;
}

export function getVoiceCoachConfig(): VoiceCoachConfig {
  return defaultConfig;
}
